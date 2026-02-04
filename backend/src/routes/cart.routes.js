const router = require("express").Router();

const auth = require("../middleware/auth.middleware"); // ✅ your auth middleware that sets req.user

const {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cart.controller");

router.get("/", auth, getMyCart);
router.post("/add", auth, addToCart);
router.put("/item/:productId", auth, updateCartItem);
router.delete("/item/:productId", auth, removeCartItem);
router.post("/clear", auth, clearCart);

module.exports = router;