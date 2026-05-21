const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const requireVerified = require("../middleware/requireVerified.middleware");
const requireAdmin = require("../middleware/admin.middleware");
const audit = require("../middleware/auditLog.middleware");

const {
  createReturn,
  myReturns,
  getReturn,
  orderEligibility,
  listReturnsAdmin,
  updateReturnAdmin,
} = require("../controllers/return.controller");

// Admin (register before /:id)
router.get("/", requireAuth, requireAdmin, listReturnsAdmin);
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  audit("return.update", "return"),
  updateReturnAdmin
);

// Customer
router.post("/", requireAuth, requireVerified, createReturn);
router.get("/my", requireAuth, requireVerified, myReturns);
router.get("/eligibility/:orderId", requireAuth, requireVerified, orderEligibility);
router.get("/:id", requireAuth, requireVerified, getReturn);

module.exports = router;
