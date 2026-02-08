const router = require("express").Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

// POST /api/uploads/product-image  (admin only)
router.post(
  "/product-image",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image uploaded" });

      // multer memory -> convert to base64 data URL for Cloudinary
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "online-store/products",
      });

      return res.json({
        message: "Uploaded",
        imageUrl: result.secure_url,
      });
    } catch (err) {
      console.error("UPLOAD_ERROR:", err);
      return res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }
);

module.exports = router;