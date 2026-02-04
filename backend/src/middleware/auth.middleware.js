const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  try {
    // 1) Authorization header (best for production)
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // 2) fallback cookie
    const cookieName = process.env.COOKIE_NAME || "token";
    const cookieToken = req.cookies?.[cookieName];

    const token = bearer || cookieToken;
    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should contain { id, role }
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};