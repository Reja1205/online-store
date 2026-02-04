






const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");

const { myOrders, getOrderById, allOrders } = require("../controllers/order.controller");

router.get("/my", auth, myOrders);
router.get("/:id", auth, getOrderById);
router.get("/", auth, adminOnly, allOrders);

module.exports = router;