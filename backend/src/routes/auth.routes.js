const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const requireVerified = require("../middleware/requireVerified.middleware");
const { authLimiter, strictAuthLimiter } = require("../middleware/rateLimit.middleware");

const {
  registerUser,
  registerAdmin,
  login,
  logout,
  logoutAll,
  refreshToken,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateAddress,
} = require("../controllers/auth.controller");

router.post("/register-user", authLimiter, registerUser);
router.post("/register-admin", strictAuthLimiter, registerAdmin);

router.post("/login", strictAuthLimiter, login);
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);
router.post("/refresh", refreshToken);

router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", strictAuthLimiter, resendVerification);
router.post("/forgot-password", strictAuthLimiter, forgotPassword);
router.post("/reset-password", strictAuthLimiter, resetPassword);

router.get("/me", requireAuth, me);
router.put("/address", requireAuth, requireVerified, updateAddress);

module.exports = router;
