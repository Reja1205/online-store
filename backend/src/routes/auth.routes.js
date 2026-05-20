const router = require("express").Router();

const {
  registerUser,
  registerAdmin,
  login,
  logout,
  me,
  updateAddress,
} = require("../controllers/auth.controller");

const requireAuth = require("../middleware/auth.middleware");


// REGISTER
router.post("/register-user", registerUser);
router.post("/register-admin", registerAdmin);

// LOGIN / LOGOUT
router.post("/login", login);
router.post("/logout", logout);

// ME (protected)
router.get("/me", requireAuth, me);
router.put("/address", requireAuth, updateAddress);

module.exports = router;