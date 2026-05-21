const { isAdminRole } = require("../utils/userPublic");

function requireRole(...roles) {
  const allowed = new Set(roles);
  return function roleGuard(req, res, next) {
    if (!req.user) return res.status(401).json({ message: "Not logged in" });

    const role = req.user.role;
    if (allowed.has(role)) return next();

    if (allowed.has("admin") && isAdminRole(role)) return next();

    return res.status(403).json({ message: "Forbidden" });
  };
}

const requireAdmin = requireRole("admin", "superadmin");

const requireSuperAdmin = requireRole("superadmin");

module.exports = { requireRole, requireAdmin, requireSuperAdmin };
