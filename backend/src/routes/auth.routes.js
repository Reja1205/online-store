const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

const {
  registerUser,
  registerAdmin,
  login,
  logout,
  me,
} = require("../controllers/auth.controller");

router.post("/register-user", registerUser);
router.post("/register-admin", registerAdmin);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", auth, me);

module.exports = router;