const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload"); // ✅ must match your filename

const {
  listProducts,
  getProduct,
  uploadProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

// Public
router.get("/", listProducts);
router.get("/:id", getProduct);

// Admin: upload image first
router.post("/upload", requireAuth, requireAdmin, upload.single("image"), uploadProductImage);

// Admin CRUD
router.post("/", requireAuth, requireAdmin, createProduct);
router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

module.exports = router;