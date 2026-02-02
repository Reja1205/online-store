const router = require("express").Router();

const {
  registerUser,
  registerAdmin,
  login,
  logout,
  me,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

// ---------------- REGISTER ----------------
router.post("/register-user", registerUser);
router.post("/register-admin", registerAdmin);

// ---------------- LOGIN / LOGOUT ----------------
router.post("/login", login);
router.post("/logout", logout);

// ---------------- WHO AM I ----------------
router.get("/me", authMiddleware, me);

module.exports = router;