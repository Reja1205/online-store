const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");
const audit = require("../middleware/auditLog.middleware");
const {
  listUsers,
  listAuditLogs,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

router.get("/", requireAuth, requireAdmin, listUsers);
router.get("/audit-logs", requireAuth, requireAdmin, listAuditLogs);
router.get("/:id", requireAuth, requireAdmin, getUserById);
router.patch("/:id", requireAuth, requireAdmin, audit("user.update", "user"), updateUser);
router.delete("/:id", requireAuth, requireAdmin, audit("user.delete", "user"), deleteUser);

module.exports = router;
