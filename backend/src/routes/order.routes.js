const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const {
  myOrders,
  allOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

router.get("/my", requireAuth, myOrders);
router.get("/", requireAuth, requireAdmin, allOrders);
router.put("/:id/status", requireAuth, requireAdmin, updateOrderStatus);

module.exports = router;