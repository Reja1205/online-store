const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");
const requireVerified = require("../middleware/requireVerified.middleware");
const audit = require("../middleware/auditLog.middleware");
const upload = require("../middleware/upload");

const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const {
  listProductReviews,
  createProductReview,
} = require("../controllers/review.controller");

// Public
router.get("/", listProducts);
router.get("/:productId/reviews", listProductReviews);
router.post("/:productId/reviews", requireAuth, requireVerified, createProductReview);
router.get("/:id", getProduct);

router.post("/", requireAuth, requireAdmin, audit("product.create", "product"), upload.single("image"), createProduct);
router.put("/:id", requireAuth, requireAdmin, audit("product.update", "product"), upload.single("image"), updateProduct);
router.delete("/:id", requireAuth, requireAdmin, audit("product.delete", "product"), deleteProduct);

module.exports = router;