const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const auth = require("../middleware/auth.middleware");
const { checkout } = require("../controllers/checkout.controller");

router.post("/", auth, checkout);

module.exports = router;