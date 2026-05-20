/**
 * Upload local product images to Cloudinary and update MongoDB.
 *
 * Usage (from backend folder):
 *   node scripts/apply-product-images.js
 *
 * Place JPG/PNG files in ../frontend/public/product-images/
 * Matches products by image slug prefix in filename (e.g. t-shirt-1.png).
 */

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const cloudinary = require("../src/config/cloudinary");
const Product = require("../src/models/Product");

const IMAGES_DIR = path.join(__dirname, "../../frontend/public/product-images");

/** Filename slug (without ext) → exact product name in database */
const PRODUCT_MAP = {
  panjabi: "Panjabi",
  "womens-abayas": "Womens Abayas",
  mystic: "Mystic",
  "painted-sea-shells": "Painted beautiful sea shells",
  "arabian-styles": "Arabian styles",
  elegance: "Elegance",
  "t-shirt-1": "Smart Fit T-Shirt — Navy",
  "t-shirt-2": "Smart Fit T-Shirt — White",
  "t-shirt-3": "Smart Fit T-Shirt — Black",
  "t-shirt-4": "Smart Fit T-Shirt — Gray",
  "t-shirt-5": "Smart Fit T-Shirt — Burgundy",
  "abaya-1": "Elegant Abaya — Black",
  "abaya-2": "Elegant Abaya — Navy",
  "abaya-3": "Elegant Abaya — Beige",
  "abaya-4": "Elegant Abaya — Gray",
  "abaya-5": "Elegant Abaya — Burgundy",
  "panjabi-1": "Classic Panjabi — White",
  "panjabi-2": "Classic Panjabi — Navy",
  "panjabi-3": "Classic Panjabi — Cream",
  "panjabi-4": "Classic Panjabi — Black",
  "panjabi-5": "Classic Panjabi — Maroon",
};

async function uploadFile(filePath) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "online-store/products",
    resource_type: "image",
  });
  return result.secure_url;
}

async function main() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error("Missing CLOUDINARY_* env vars in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log("Connected to MongoDB\n");

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Images folder not found:", IMAGES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

  for (const file of files) {
    const slug = path.basename(file, path.extname(file));
    const productName = PRODUCT_MAP[slug];
    if (!productName) {
      console.log(`⏭  Skip ${file} (no product mapping — add to PRODUCT_MAP)`);
      continue;
    }

    const product = await Product.findOne({
      name: new RegExp(`^${productName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });

    if (!product) {
      console.log(`⚠  No DB product named "${productName}" for ${file}`);
      continue;
    }

    const filePath = path.join(IMAGES_DIR, file);
    console.log(`↑  Uploading ${file} → ${productName}...`);

    try {
      const url = await uploadFile(filePath);
      product.imageUrl = url;
      await product.save();
      console.log(`✓  Updated ${productName}\n   ${url}\n`);
    } catch (err) {
      console.error(`✗  Failed ${productName}:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
