const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { accessCookieName } = require("../utils/authCookies");
const { isAdminRole } = require("../utils/userPublic");

/** Sets req.user when a valid token is present; continues as guest otherwise. */
module.exports = async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const cookieToken = req.cookies?.[accessCookieName()];
    const token = bearerToken || cookieToken;

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === "refresh") return next();

    if (decoded.tv !== undefined) {
      const user = await User.findById(decoded.id)
        .select("tokenVersion role emailVerified email")
        .lean();

      if (!user) return next();
      if ((decoded.tv ?? 0) !== (user.tokenVersion ?? 0)) return next();

      req.user = {
        id: decoded.id,
        role: user.role,
        email: user.email,
        emailVerified: user.emailVerified,
      };
    } else {
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email || "",
        emailVerified: true,
      };
    }

    if (!req.user.role && decoded.role) req.user.role = decoded.role;
    if (isAdminRole(req.user.role)) req.user.emailVerified = true;

    next();
  } catch {
    next();
  }
};
