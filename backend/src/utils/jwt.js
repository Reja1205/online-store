const jwt = require("jsonwebtoken");

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

function signAccessToken(payload, options = {}) {
  const rememberMe = Boolean(options.rememberMe);
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRES_IN || "30d"
    : process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign({ ...payload, type: "access" }, getSecret(), { expiresIn });
}

function signRefreshToken(payload, options = {}) {
  const rememberMe = Boolean(options.rememberMe);
  const expiresIn = rememberMe
    ? process.env.JWT_REFRESH_REMEMBER_EXPIRES_IN || "30d"
    : process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  return jwt.sign({ ...payload, type: "refresh" }, getSecret(), { expiresIn });
}

function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, getSecret());
  if (decoded.type !== "refresh") throw new Error("Invalid refresh token");
  return decoded;
}

/** @deprecated use signAccessToken */
function signToken(payload, options = {}) {
  return signAccessToken(payload, options);
}

module.exports = {
  signToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
