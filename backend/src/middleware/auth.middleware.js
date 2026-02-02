const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const cookieName = process.env.COOKIE_NAME || "token";
    const token = req.cookies?.[cookieName];

    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};

module.exports = authMiddleware;