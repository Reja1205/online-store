/**
 * Build Red / Brown / Black panjabi images from a source photo.
 *
 * Usage (from backend/):
 *   node scripts/generate-panjabi-color-images.js [path-to-source.png]
 *
 * Default source: ../.cursor/... or pass the maroon kurta screenshot path.
 * Output: frontend/public/product-images/panjabi-5-{red,brown,black}.jpg
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT_DIR = path.join(__dirname, "../../frontend/public/product-images");

const VARIANTS = [
  { slug: "panjabi-5-red", color: "Red", tint: { r: 195, g: 42, b: 48 } },
  { slug: "panjabi-5-brown", color: "Brown", tint: { r: 130, g: 82, b: 48 } },
  { slug: "panjabi-5-black", color: "Black", tint: { r: 48, g: 50, b: 55 } },
];

const DEFAULT_SOURCE = path.join(
  __dirname,
  "../../../.cursor/projects/Users-rejau-online-store/assets/Screenshot_2026-05-22_at_5.20.33_PM-ed0fac0e-84d8-4a11-ac51-8363b8030337.png"
);

async function generateVariant(source, variant) {
  const outPath = path.join(OUT_DIR, `${variant.slug}.jpg`);
  await sharp(source)
    .resize(900, 1200, { fit: "inside", withoutEnlargement: false })
    .tint(variant.tint)
    .modulate({ saturation: 1.15 })
    .jpeg({ quality: 88 })
    .toFile(outPath);
  return outPath;
}

async function main() {
  const source = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE;

  if (!fs.existsSync(source)) {
    console.error("Source image not found:", source);
    console.error("Usage: node scripts/generate-panjabi-color-images.js <source.png>");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Base copy for fallback catalog image
  const baseOut = path.join(OUT_DIR, "panjabi-5.jpg");
  await sharp(source)
    .resize(900, 1200, { fit: "inside" })
    .jpeg({ quality: 88 })
    .toFile(baseOut);
  console.log("Wrote", baseOut);

  for (const variant of VARIANTS) {
    const out = await generateVariant(source, variant);
    console.log(`Wrote ${variant.color}:`, out);
  }

  console.log("\nDone. Re-run: node scripts/seed-fashion-products.js");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
