const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload"); // ✅ your upload.js

const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

// Public
router.get("/", listProducts);
router.get("/:id", getProduct);

// Admin only (accept image file)
router.post("/", requireAuth, requireAdmin, upload.single("image"), createProduct);
router.put("/:id", requireAuth, requireAdmin, upload.single("image"), updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

module.exports = router;