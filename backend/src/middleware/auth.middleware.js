const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { accessCookieName } = require("../utils/authCookies");
const { isAdminRole } = require("../utils/userPublic");

module.exports = async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const cookieToken = req.cookies?.[accessCookieName()];
    const token = bearerToken || cookieToken;

    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === "refresh") {
      return res.status(401).json({ message: "Invalid access token" });
    }

    if (decoded.tv !== undefined) {
      const user = await User.findById(decoded.id)
        .select("tokenVersion role emailVerified email")
        .lean();

      if (!user) return res.status(401).json({ message: "Not logged in" });

      if ((decoded.tv ?? 0) !== (user.tokenVersion ?? 0)) {
        return res.status(401).json({ message: "Session expired. Please sign in again." });
      }

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
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};
