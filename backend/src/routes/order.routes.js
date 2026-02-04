const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const {
  createOrder,
  myOrders,
  allOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

// User creates order
router.post("/", requireAuth, createOrder);

// User sees only their orders
router.get("/my", requireAuth, myOrders);

// Admin sees all orders
router.get("/", requireAuth, requireAdmin, allOrders);

// Admin updates status
router.put("/:id/status", requireAuth, requireAdmin, updateOrderStatus);

module.exports = router;