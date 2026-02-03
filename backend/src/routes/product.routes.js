const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");

const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

// public
router.get("/", listProducts);
router.get("/:id", getProduct);

// admin only
router.post("/", auth, adminOnly, createProduct);
router.put("/:id", auth, adminOnly, updateProduct);
router.delete("/:id", auth, adminOnly, deleteProduct);

module.exports = router;