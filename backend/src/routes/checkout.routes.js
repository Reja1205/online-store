const router = require("express").Router();

const optionalAuth = require("../middleware/optionalAuth.middleware");
const requireCartOwner = require("../middleware/cartOwner.middleware");
const {
  checkoutConfig,
  previewCheckout,
  placeOrder,
  payCheckout,
  confirmCheckout,
} = require("../controllers/checkout.controller");

router.get("/config", checkoutConfig);
router.get("/confirm", optionalAuth, confirmCheckout);

router.use(optionalAuth, requireCartOwner);

router.get("/preview", previewCheckout);
router.post("/place-order", placeOrder);
router.post("/pay", payCheckout); // legacy mock alias

module.exports = router;
