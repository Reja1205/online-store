const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const cookieName = process.env.COOKIE_NAME || "token";
    const cookieToken = req.cookies?.[cookieName];

    const token = bearerToken || cookieToken;
    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};