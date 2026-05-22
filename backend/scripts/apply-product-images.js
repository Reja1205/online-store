/**
 * Upload local product images to Cloudinary and update MongoDB.
 *
 * Usage (from backend folder):
 *   node scripts/apply-product-images.js
 *
 * Place JPG/PNG files in ../frontend/public/product-images/
 * (folder is gitignored — run this after seeding for production/Vercel)
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
  "mens-tee-hero": "Smart Fit T-Shirt — Essential Colors",
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

/** Per-color file slug → product + color label (updates colorImages[]) */
const COLOR_SLUG_MAP = {
  "mens-tee-red": { productName: "Smart Fit T-Shirt — Essential Colors", color: "Red" },
  "mens-tee-brown": { productName: "Smart Fit T-Shirt — Essential Colors", color: "Brown" },
  "mens-tee-black": { productName: "Smart Fit T-Shirt — Essential Colors", color: "Black" },
  "mens-tee-blue": { productName: "Smart Fit T-Shirt — Essential Colors", color: "Blue" },
  "mens-tee-green": { productName: "Smart Fit T-Shirt — Essential Colors", color: "Green" },
  "mens-tee-white": { productName: "Smart Fit T-Shirt — Essential Colors", color: "White" },
  "mens-tee-navy": { productName: "Smart Fit T-Shirt — Essential Colors", color: "Navy" },
  "mens-tee-gray": { productName: "Smart Fit T-Shirt — Essential Colors", color: "Gray" },
  "panjabi-5-red": { productName: "Classic Panjabi — Maroon", color: "Red" },
  "panjabi-5-brown": { productName: "Classic Panjabi — Maroon", color: "Brown" },
  "panjabi-5-black": { productName: "Classic Panjabi — Maroon", color: "Black" },
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findProductByName(name) {
  return Product.findOne({
    name: new RegExp(`^${escapeRegex(name)}$`, "i"),
  });
}

async function uploadFile(filePath) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "online-store/products",
    resource_type: "image",
  });
  return result.secure_url;
}

function upsertColorImage(product, color, imageUrl) {
  const rows = Array.isArray(product.colorImages) ? [...product.colorImages] : [];
  const idx = rows.findIndex((r) => String(r?.color || "").toLowerCase() === color.toLowerCase());
  const row = { color, imageUrl };
  if (idx >= 0) rows[idx] = { ...rows[idx], ...row };
  else rows.push(row);
  product.colorImages = rows;
}

async function applyColorSlug(slug, filePath) {
  const mapping = COLOR_SLUG_MAP[slug];
  if (!mapping) return false;

  const product = await findProductByName(mapping.productName);
  if (!product) {
    console.log(`⚠  No DB product "${mapping.productName}" for color file ${slug}`);
    return false;
  }

  console.log(`↑  Uploading ${path.basename(filePath)} → ${mapping.productName} (${mapping.color})...`);
  const url = await uploadFile(filePath);
  upsertColorImage(product, mapping.color, url);
  if (!product.imageUrl || String(product.imageUrl).startsWith("/")) {
    product.imageUrl = url;
  }
  await product.save();
  console.log(`✓  colorImages[${mapping.color}]\n   ${url}\n`);
  return true;
}

async function applyProductSlug(slug, filePath) {
  const productName = PRODUCT_MAP[slug];
  if (!productName) return false;

  const product = await findProductByName(productName);
  if (!product) {
    console.log(`⚠  No DB product named "${productName}" for ${slug}`);
    return false;
  }

  console.log(`↑  Uploading ${path.basename(filePath)} → ${productName}...`);
  const url = await uploadFile(filePath);
  product.imageUrl = url;
  await product.save();
  console.log(`✓  imageUrl\n   ${url}\n`);
  return true;
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

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = path.basename(file, path.extname(file));
    const filePath = path.join(IMAGES_DIR, file);

    try {
      if (COLOR_SLUG_MAP[slug]) {
        if (await applyColorSlug(slug, filePath)) updated += 1;
        else skipped += 1;
        continue;
      }
      if (PRODUCT_MAP[slug]) {
        if (await applyProductSlug(slug, filePath)) updated += 1;
        else skipped += 1;
        continue;
      }
      console.log(`⏭  Skip ${file} (add to PRODUCT_MAP or COLOR_SLUG_MAP)`);
      skipped += 1;
    } catch (err) {
      console.error(`✗  Failed ${slug}:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log(`Done. Updated ${updated} file(s), skipped ${skipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
