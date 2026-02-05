const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const {
  createOrder,
  myOrders,
  allOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");


// ✅ user creates order
router.post("/", requireAuth, createOrder);

// ✅ user sees ONLY their orders
router.get("/my", requireAuth, myOrders);

// ✅ admin sees ALL orders
router.get("/", requireAuth, requireAdmin, allOrders);

// ✅ admin updates status
router.put("/:id/status", requireAuth, requireAdmin, updateOrderStatus);

module.exports = router;