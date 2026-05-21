const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const requireVerified = require("../middleware/requireVerified.middleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

router.get("/", requireAuth, requireVerified, getWishlist);
router.post("/", requireAuth, requireVerified, addToWishlist);
router.delete("/:productId", requireAuth, requireVerified, removeFromWishlist);

module.exports = router;
