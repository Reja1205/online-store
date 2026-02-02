const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// GET /api/admin/ping
router.get("/ping", auth, requireAdmin, (req, res) => {
  res.json({ ok: true, message: "Hello admin 👋" });
});

module.exports = router;