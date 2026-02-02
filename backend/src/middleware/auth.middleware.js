const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const cookieName = process.env.COOKIE_NAME || "token";

    // 1) Try cookie first
    let token = req.cookies?.[cookieName];

    // 2) If not found, try Authorization: Bearer <token>
    if (!token) {
      const authHeader = req.headers.authorization || "";
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "").trim();
      }
    }

    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};

module.exports = auth;