const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    let token = null;

    // 1) Bearer token (recommended)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2) Fallback to cookie token
    if (!token) {
      const cookieName = process.env.COOKIE_NAME || "token";
      token = req.cookies?.[cookieName];
    }

    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};