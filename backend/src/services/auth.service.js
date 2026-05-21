const bcrypt = require("bcrypt");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { generateToken, hashToken } = require("../utils/cryptoTokens");
const { validatePassword } = require("../utils/passwordPolicy");
const { mergeGuestCartIntoUser } = require("../utils/cartOwner");
const { buildLoginMeta } = require("../utils/requestMeta");
const {
  setAccessCookie,
  setRefreshCookie,
  clearAuthCookies,
} = require("../utils/authCookies");
const { toPublicUser, isAdminRole, emailVerificationRequired } = require("../utils/userPublic");
const {
  normalizeShippingAddress,
  validateShippingAddress,
} = require("../constants/address");
const {
  sendVerificationEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail,
  sendAdminSecurityAlert,
} = require("./authEmails");

const MAX_LOGIN_HISTORY = 20;
const LOCK_AFTER_ATTEMPTS = Number(process.env.ACCOUNT_LOCK_ATTEMPTS || 5);
const LOCK_MINUTES = Number(process.env.ACCOUNT_LOCK_MINUTES || 15);
const VERIFY_HOURS = Number(process.env.EMAIL_VERIFY_EXPIRES_HOURS || 24);
const RESET_HOURS = Number(process.env.PASSWORD_RESET_EXPIRES_HOURS || 1);

function genericAuthError() {
  return { status: 401, message: "Invalid credentials" };
}

function accountLockedResponse(user) {
  const until = user.accountLockedUntil;
  if (!until || until <= new Date()) return null;
  return {
    status: 423,
    message: `Account temporarily locked. Try again after ${until.toLocaleString()}.`,
    lockedUntil: until,
  };
}

async function recordFailedLogin(user) {
  const attempts = (user.failedLoginAttempts || 0) + 1;
  const update = { failedLoginAttempts: attempts };
  if (attempts >= LOCK_AFTER_ATTEMPTS) {
    update.accountLockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    update.failedLoginAttempts = 0;
  }
  await User.findByIdAndUpdate(user._id, { $set: update });
}

async function clearFailedLogins(userId) {
  await User.findByIdAndUpdate(userId, {
    $set: { failedLoginAttempts: 0, accountLockedUntil: null },
  });
}

async function pushLoginHistory(userId, meta, success) {
  const entry = { ...meta, success, at: meta.at || new Date() };
  await User.findByIdAndUpdate(userId, {
    $set: { lastLogin: entry.at },
    $push: {
      loginHistory: {
        $each: [entry],
        $position: 0,
        $slice: MAX_LOGIN_HISTORY,
      },
    },
  });
}

async function issueSession(user, req, res, rememberMe = false) {
  const payload = {
    id: user._id.toString(),
    role: user.role,
    tv: user.tokenVersion ?? 0,
  };

  const accessToken = signAccessToken(payload, { rememberMe });
  const refreshToken = signRefreshToken(payload, { rememberMe });

  await User.findByIdAndUpdate(user._id, {
    $set: { refreshTokenHash: hashToken(refreshToken) },
  });

  setAccessCookie(res, req, accessToken);
  setRefreshCookie(res, req, refreshToken, rememberMe);

  return { accessToken, refreshToken };
}

async function registerUser({ name, email, password }) {
  const pwCheck = validatePassword(password);
  if (!pwCheck.ok) return { status: 400, message: pwCheck.message };

  const cleanEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) return { status: 409, message: "Email already in use" };

  const requireVerify = emailVerificationRequired();
  const rawVerify = requireVerify ? generateToken() : null;

  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    password: await bcrypt.hash(password, 12),
    role: "user",
    emailVerified: !requireVerify,
    emailVerifiedAt: requireVerify ? null : new Date(),
    verificationToken: rawVerify ? hashToken(rawVerify) : null,
    verificationTokenExpires: rawVerify
      ? new Date(Date.now() + VERIFY_HOURS * 3600000)
      : null,
  });

  if (rawVerify) {
    sendVerificationEmail(user, rawVerify).catch((err) =>
      console.error("VERIFY_EMAIL_SEND_ERROR:", err)
    );
  }

  return {
    status: 201,
    message: requireVerify
      ? "Account created. Check your email to verify before signing in."
      : "User registered successfully",
    user: toPublicUser(user),
    verificationRequired: requireVerify,
  };
}

async function registerAdmin({ name, email, password, adminSecret }) {
  const expectedSecret = process.env.ADMIN_SECRET;
  if (!expectedSecret) {
    return { status: 500, message: "ADMIN_SECRET is not set on server" };
  }
  if (adminSecret !== expectedSecret) {
    return { status: 403, message: "Invalid admin secret" };
  }

  const pwCheck = validatePassword(password);
  if (!pwCheck.ok) return { status: 400, message: pwCheck.message };

  const cleanEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) return { status: 409, message: "Email already in use" };

  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    password: await bcrypt.hash(password, 12),
    role: "admin",
    emailVerified: true,
    emailVerifiedAt: new Date(),
  });

  return {
    status: 201,
    message: "Admin registered successfully",
    user: toPublicUser(user),
  };
}

async function login({ email, password, rememberMe }, req, res) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password +refreshTokenHash"
  );
  if (!user) return genericAuthError();

  const locked = accountLockedResponse(user);
  if (locked) return locked;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    await recordFailedLogin(user);
    await pushLoginHistory(user._id, buildLoginMeta(req), false);
    return genericAuthError();
  }

  if (emailVerificationRequired() && !user.emailVerified && !isAdminRole(user.role)) {
    return {
      status: 403,
      message: "Please verify your email before signing in.",
      code: "EMAIL_NOT_VERIFIED",
    };
  }

  await clearFailedLogins(user._id);
  const meta = buildLoginMeta(req);
  await pushLoginHistory(user._id, meta, true);

  const { accessToken } = await issueSession(user, req, res, Boolean(rememberMe));

  const guestId = String(req.headers["x-guest-id"] || "").trim();
  await mergeGuestCartIntoUser(guestId, user._id);

  sendLoginNotificationEmail(user, meta).catch((err) =>
    console.error("LOGIN_NOTIFY_ERROR:", err)
  );
  if (isAdminRole(user.role)) {
    sendAdminSecurityAlert(user, meta).catch((err) =>
      console.error("ADMIN_ALERT_ERROR:", err)
    );
  }

  return {
    status: 200,
    message: "Login successful",
    token: accessToken,
    user: toPublicUser(user),
  };
}

function logout(req, res) {
  clearAuthCookies(res, req);
  return { status: 200, message: "Logged out" };
}

async function logoutAllDevices(userId, req, res) {
  await User.findByIdAndUpdate(userId, {
    $inc: { tokenVersion: 1 },
    $unset: { refreshTokenHash: 1 },
  });
  clearAuthCookies(res, req);
  return { status: 200, message: "Signed out on all devices" };
}

async function refreshSession(req, res) {
  const refreshName = process.env.REFRESH_COOKIE_NAME || "refresh_token";
  const token =
    req.cookies?.[refreshName] ||
    (req.body?.refreshToken ? String(req.body.refreshToken) : null);

  if (!token) return { status: 401, message: "Refresh token required" };

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return { status: 401, message: "Invalid refresh token" };
  }

  const user = await User.findById(decoded.id).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash) {
    return { status: 401, message: "Session expired" };
  }

  if (hashToken(token) !== user.refreshTokenHash) {
    return { status: 401, message: "Session revoked" };
  }

  if ((decoded.tv ?? 0) !== (user.tokenVersion ?? 0)) {
    return { status: 401, message: "Session revoked" };
  }

  const { accessToken } = await issueSession(user, req, res, false);
  return {
    status: 200,
    message: "Session refreshed",
    token: accessToken,
    user: toPublicUser(user),
  };
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) return { status: 404, message: "User not found" };
  return { status: 200, user: toPublicUser(user) };
}

async function verifyEmail(rawToken) {
  if (!rawToken) return { status: 400, message: "Verification token required" };

  const user = await User.findOne({
    verificationToken: hashToken(rawToken),
    verificationTokenExpires: { $gt: new Date() },
  }).select("+verificationToken +verificationTokenExpires");

  if (!user) return { status: 400, message: "Invalid or expired verification link" };

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();

  return { status: 200, message: "Email verified successfully", user: toPublicUser(user) };
}

async function resendVerification(email) {
  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail }).select(
    "+verificationToken +verificationTokenExpires"
  );

  if (!user) {
    return { status: 200, message: "If that email exists, a verification link was sent." };
  }
  if (user.emailVerified) {
    return { status: 200, message: "Email is already verified." };
  }

  const rawToken = generateToken();
  user.verificationToken = hashToken(rawToken);
  user.verificationTokenExpires = new Date(Date.now() + VERIFY_HOURS * 3600000);
  await user.save();

  await sendVerificationEmail(user, rawToken);
  return { status: 200, message: "If that email exists, a verification link was sent." };
}

async function forgotPassword(email) {
  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail }).select(
    "+resetPasswordToken +resetPasswordExpires"
  );

  if (!user) {
    return { status: 200, message: "If that email exists, a reset link was sent." };
  }

  const rawToken = generateToken();
  user.resetPasswordToken = hashToken(rawToken);
  user.resetPasswordExpires = new Date(Date.now() + RESET_HOURS * 3600000);
  await user.save();

  await sendPasswordResetEmail(user, rawToken);
  return { status: 200, message: "If that email exists, a reset link was sent." };
}

async function resetPassword({ token, password }) {
  const pwCheck = validatePassword(password);
  if (!pwCheck.ok) return { status: 400, message: pwCheck.message };

  if (!token) return { status: 400, message: "Reset token required" };

  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) return { status: 400, message: "Invalid or expired reset link" };

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.refreshTokenHash = null;
  await user.save();

  return { status: 200, message: "Password updated. Please sign in again." };
}

async function updateAddress(userId, body) {
  const shippingAddress = normalizeShippingAddress(body?.shippingAddress || body || {});
  const validation = validateShippingAddress(shippingAddress);
  if (!validation.ok) return { status: 400, message: validation.message };

  if (!shippingAddress.email) {
    const u = await User.findById(userId).select("email");
    shippingAddress.email = u?.email || "";
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { shippingAddress } },
    { new: true, runValidators: true }
  );

  if (!updated) return { status: 404, message: "User not found" };
  return { status: 200, message: "Address saved", user: toPublicUser(updated) };
}

async function writeAudit({ actor, action, resource, resourceId, req, meta }) {
  try {
    await AuditLog.create({
      actorId: actor?.id,
      actorEmail: actor?.email || "",
      action,
      resource,
      resourceId: String(resourceId || ""),
      ip: buildLoginMeta(req).ip,
      userAgent: buildLoginMeta(req).userAgent,
      meta: meta || {},
    });
  } catch (err) {
    console.error("AUDIT_LOG_ERROR:", err);
  }
}

module.exports = {
  registerUser,
  registerAdmin,
  login,
  logout,
  logoutAllDevices,
  refreshSession,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateAddress,
  writeAudit,
};
