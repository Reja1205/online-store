const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

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
router.post("/", auth, requireAdmin, createProduct);
router.put("/:id", auth, requireAdmin, updateProduct);
router.delete("/:id", auth, requireAdmin, deleteProduct);

module.exports = router;