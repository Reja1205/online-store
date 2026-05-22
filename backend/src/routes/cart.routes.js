const router = require("express").Router();

const optionalAuth = require("../middleware/optionalAuth.middleware");
const requireCartOwner = require("../middleware/cartOwner.middleware");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

router.use(optionalAuth, requireCartOwner);

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/update", updateCartItem);
router.post("/remove", removeFromCart);
router.post("/clear", clearCart);

module.exports = router;