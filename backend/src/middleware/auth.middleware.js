const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    // Prefer Authorization: Bearer <token>
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    // Fallback: cookie token
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