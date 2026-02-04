const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");

const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

router.get("/", requireAuth, getCart);
router.post("/add", requireAuth, addToCart);
router.post("/remove", requireAuth, removeFromCart);
router.post("/clear", requireAuth, clearCart);

module.exports = router;