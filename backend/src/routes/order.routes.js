const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireVerified = require("../middleware/requireVerified.middleware");
const requireAdmin = require("../middleware/admin.middleware");
const audit = require("../middleware/auditLog.middleware");

const {
  createOrder,
  myOrders,
  allOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");


// ✅ user creates order
router.post("/", requireAuth, requireVerified, createOrder);

// ✅ user sees ONLY their orders
router.get("/my", requireAuth, requireVerified, myOrders);

// ✅ admin sees ALL orders
router.get("/", requireAuth, requireAdmin, allOrders);

// ✅ admin updates status
router.put("/:id/status", requireAuth, requireAdmin, audit("order.status_update", "order"), updateOrderStatus);

module.exports = router;