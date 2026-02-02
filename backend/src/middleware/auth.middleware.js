const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    // 1) Try Bearer token first
    const authHeader = req.headers.authorization || "";
    let token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // 2) Fallback to cookie token (optional)
    if (!token) {
      const cookieName = process.env.COOKIE_NAME || "token";
      token = req.cookies?.[cookieName];
    }

    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};