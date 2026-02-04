const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const {
  createOrder,
  myOrders,
  allOrders,
  updateStatus,
} = require("../controllers/order.controller");

// USER
router.post("/", requireAuth, createOrder);
router.get("/mine", requireAuth, myOrders);

// ADMIN
router.get("/all", requireAuth, requireAdmin, allOrders);
router.put("/:id", requireAuth, requireAdmin, updateStatus);

module.exports = router;