const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

// ✅ THIS MUST MATCH YOUR FILE NAME
// since you said your file is upload.middleware.js
const upload = require("../middleware/upload.middleware");

const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

// ---------------- PUBLIC ----------------
router.get("/", listProducts);
router.get("/:id", getProduct);

// ---------------- ADMIN ----------------

// CREATE PRODUCT (with image upload)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("image"), // <-- very important
  createProduct
);

// UPDATE PRODUCT
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  updateProduct
);

// DELETE PRODUCT
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteProduct
);

module.exports = router;