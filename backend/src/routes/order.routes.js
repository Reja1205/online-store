const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const {
  createOrder,
  myOrders,
  allOrders,
  updateStatus,
} = require("../controllers/order.controller");

// user
router.post("/", requireAuth, createOrder);
router.get("/my", requireAuth, myOrders);

// admin
router.get("/", requireAuth, requireAdmin, allOrders);
router.patch("/:id/status", requireAuth, requireAdmin, updateStatus);

module.exports = router;