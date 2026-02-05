const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");
const { previewCheckout, payCheckout } = require("../controllers/checkout.controller");

// Preview cart totals
router.get("/preview", requireAuth, previewCheckout);

// Mock “Pay Now” -> creates paid order + clears cart
router.post("/pay", requireAuth, payCheckout);

module.exports = router;