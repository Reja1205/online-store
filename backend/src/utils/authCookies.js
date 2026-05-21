function isProdRequest(req) {
  const origin = req.headers.origin || "";
  const isHttpsFrontend = origin.startsWith("https://");
  return process.env.NODE_ENV === "production" || isHttpsFrontend;
}

function buildCookieOptions(req, overrides = {}) {
  const isProd = isProdRequest(req);
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    ...overrides,
  };
}

function accessCookieName() {
  return process.env.COOKIE_NAME || "token";
}

function refreshCookieName() {
  return process.env.REFRESH_COOKIE_NAME || "refresh_token";
}

function setAccessCookie(res, req, token) {
  const maxAge = rememberMsFromEnv(false);
  res.cookie(accessCookieName(), token, buildCookieOptions(req, { maxAge }));
}

function setRefreshCookie(res, req, token, rememberMe = false) {
  const maxAge = rememberMsFromEnv(rememberMe);
  res.cookie(refreshCookieName(), token, buildCookieOptions(req, { maxAge }));
}

function clearAuthCookies(res, req) {
  const base = buildCookieOptions(req);
  res.clearCookie(accessCookieName(), base);
  res.clearCookie(refreshCookieName(), base);
}

function rememberMsFromEnv(rememberMe) {
  if (rememberMe) {
    const days = Number(process.env.JWT_REMEMBER_DAYS || 30);
    return days * 24 * 60 * 60 * 1000;
  }
  const match = String(process.env.JWT_EXPIRES_IN || "7d").match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(match[1]);
  const unit = match[2];
  const mult = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  return n * (mult[unit] || 86400000);
}

module.exports = {
  buildCookieOptions,
  accessCookieName,
  refreshCookieName,
  setAccessCookie,
  setRefreshCookie,
  clearAuthCookies,
  isProdRequest,
};
