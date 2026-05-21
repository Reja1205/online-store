const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");
const {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

router.get("/", requireAuth, requireAdmin, listUsers);
router.get("/:id", requireAuth, requireAdmin, getUserById);
router.patch("/:id", requireAuth, requireAdmin, updateUser);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

module.exports = router;
