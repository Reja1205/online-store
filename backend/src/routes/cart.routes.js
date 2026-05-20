const router = require("express").Router();

const optionalAuth = require("../middleware/optionalAuth.middleware");
const requireCartOwner = require("../middleware/cartOwner.middleware");

const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

router.use(optionalAuth, requireCartOwner);

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.post("/clear", clearCart);

module.exports = router;