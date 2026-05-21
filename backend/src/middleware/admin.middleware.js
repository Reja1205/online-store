const { isAdminRole } = require("../utils/userPublic");

module.exports = function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Not logged in" });

  if (!isAdminRole(req.user.role)) {
    return res.status(403).json({ message: "Admin only" });
  }

  next();
};
