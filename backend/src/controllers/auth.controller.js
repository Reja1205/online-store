const authService = require("../services/auth.service");

function sendResult(res, result) {
  const {
    status = 200,
    message,
    user,
    token,
    code,
    lockedUntil,
    verificationRequired,
    verificationEmailSent,
    emailError,
  } = result;
  const body = { message };
  if (user) body.user = user;
  if (token) body.token = token;
  if (code) body.code = code;
  if (lockedUntil) body.lockedUntil = lockedUntil;
  if (verificationRequired !== undefined) body.verificationRequired = verificationRequired;
  if (verificationEmailSent !== undefined) body.verificationEmailSent = verificationEmailSent;
  if (emailError) body.emailError = emailError;
  return res.status(status).json(body);
}

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password are required" });
    }
    return sendResult(res, await authService.registerUser({ name, email, password }));
  } catch (err) {
    console.error("REGISTER_USER_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function registerAdmin(req, res) {
  try {
    const { name, email, password, adminSecret } = req.body || {};
    if (!name || !email || !password || !adminSecret) {
      return res.status(400).json({
        message: "Name, email, password, adminSecret are required",
      });
    }
    return sendResult(
      res,
      await authService.registerAdmin({ name, email, password, adminSecret })
    );
  } catch (err) {
    console.error("REGISTER_ADMIN_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const result = await authService.login(
      { email, password, rememberMe },
      req,
      res
    );
    if (result.status && result.status !== 200) {
      return sendResult(res, result);
    }
    return sendResult(res, result);
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function logout(req, res) {
  try {
    return sendResult(res, await authService.logout(req, res));
  } catch (err) {
    console.error("LOGOUT_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function logoutAll(req, res) {
  try {
    return sendResult(res, await authService.logoutAllDevices(req.user.id, req, res));
  } catch (err) {
    console.error("LOGOUT_ALL_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function refreshToken(req, res) {
  try {
    return sendResult(res, await authService.refreshSession(req, res));
  } catch (err) {
    console.error("REFRESH_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function me(req, res) {
  try {
    const result = await authService.getMe(req.user.id);
    if (result.status !== 200) return sendResult(res, result);
    return res.json({ user: result.user });
  } catch (err) {
    console.error("ME_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function verifyEmail(req, res) {
  try {
    const token = req.query.token || req.body?.token;
    return sendResult(res, await authService.verifyEmail(token));
  } catch (err) {
    console.error("VERIFY_EMAIL_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function resendVerification(req, res) {
  try {
    const email = req.body?.email;
    if (!email) return res.status(400).json({ message: "Email is required" });
    return sendResult(res, await authService.resendVerification(email));
  } catch (err) {
    console.error("RESEND_VERIFY_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const email = req.body?.email;
    if (!email) return res.status(400).json({ message: "Email is required" });
    return sendResult(res, await authService.forgotPassword(email));
  } catch (err) {
    console.error("FORGOT_PASSWORD_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body || {};
    if (!password) return res.status(400).json({ message: "Password is required" });
    return sendResult(res, await authService.resetPassword({ token, password }));
  } catch (err) {
    console.error("RESET_PASSWORD_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateAddress(req, res) {
  try {
    const result = await authService.updateAddress(req.user.id, req.body);
    return sendResult(res, result);
  } catch (err) {
    console.error("UPDATE_ADDRESS_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  registerUser,
  registerAdmin,
  login,
  logout,
  logoutAll,
  refreshToken,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateAddress,
};
