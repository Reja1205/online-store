const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

// ✅ IMPORTANT: this must match your real file name/path
// if your file is: backend/src/middleware/upload.js
const upload = require("../middleware/upload.middleware");

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

// Admin only
// ✅ this enables FormData + file upload
router.post("/", requireAuth, requireAdmin, upload.single("image"), createProduct);

// keep JSON update/delete
router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

module.exports = router;