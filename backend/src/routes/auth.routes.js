

const router = require("express").Router();
const {
  registerUser,
  registerAdmin,
  login,
  logout,
  me,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post("/register-user", registerUser);
router.post("/register-admin", registerAdmin);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

module.exports = router;