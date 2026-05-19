const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

router.get("/", requireAuth, getWishlist);
router.post("/", requireAuth, addToWishlist);
router.delete("/:productId", requireAuth, removeFromWishlist);

module.exports = router;
