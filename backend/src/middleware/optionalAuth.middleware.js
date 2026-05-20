const jwt = require("jsonwebtoken");

/** Sets req.user when a valid token is present; continues as guest otherwise. */
module.exports = function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const cookieName = process.env.COOKIE_NAME || "token";
    const cookieToken = req.cookies?.[cookieName];
    const token = bearerToken || cookieToken;

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    next();
  }
};
