/**
 * Seed 15 fashion products (5 t-shirts, 5 abayas, 5 panjabis) with local images.
 *
 * Usage (from backend folder):
 *   node scripts/seed-fashion-products.js
 *
 * Images must exist in frontend/public/product-images/
 * After seeding, run apply-product-images.js to upload to Cloudinary (optional).
 */

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../src/models/Product");

const IMAGES_DIR = path.join(__dirname, "../../frontend/public/product-images");

const ADULT_SIZES = ["XS", "S", "M", "L", "XL"];
const MENS_COLORS = ["Black", "White", "Navy", "Gray", "Beige"];
const WOMENS_COLORS = ["Black", "Navy", "Beige", "Gray", "Brown"];

function sizeStock(stock = 8) {
  return ADULT_SIZES.map((size) => ({ size, stock }));
}

const CATALOG = [
  {
    slug: "t-shirt-1",
    name: "Smart Fit T-Shirt — Navy",
    category: "mens",
    price: 19.99,
    shortDescription: "Classic navy tee for a sharp everyday look.",
    description:
      "Soft cotton blend t-shirt with a tailored fit. Perfect for smart casual wear with chinos or jeans.",
    colors: ["Navy", "Black", "White"],
    featured: true,
  },
  {
    slug: "t-shirt-2",
    name: "Smart Fit T-Shirt — White",
    category: "mens",
    price: 18.99,
    shortDescription: "Crisp white tee for clean, professional style.",
    description: "Breathable cotton tee that layers well under blazers or wears solo in warm weather.",
    colors: ["White", "Gray", "Navy"],
  },
  {
    slug: "t-shirt-3",
    name: "Smart Fit T-Shirt — Black",
    category: "mens",
    price: 19.99,
    shortDescription: "Versatile black tee for modern menswear.",
    description: "Mid-weight jersey with reinforced neckline. A wardrobe essential for smart men.",
    colors: ["Black", "Gray", "White"],
    bestSeller: true,
  },
  {
    slug: "t-shirt-4",
    name: "Smart Fit T-Shirt — Gray",
    category: "mens",
    price: 17.99,
    shortDescription: "Heather gray tee with a refined silhouette.",
    description: "Subtle texture and comfortable stretch. Ideal for office-casual and weekend wear.",
    colors: ["Gray", "Black", "Navy"],
  },
  {
    slug: "t-shirt-5",
    name: "Smart Fit T-Shirt — Burgundy",
    category: "mens",
    price: 21.99,
    shortDescription: "Rich burgundy tee for a confident smart look.",
    description: "Premium hand-feel fabric with colorfast dye. Stand out while staying polished.",
    colors: ["Red", "Black", "Navy"],
    onSale: true,
    salePrice: 16.99,
  },
  {
    slug: "abaya-1",
    name: "Elegant Abaya — Black",
    category: "women",
    price: 49.99,
    shortDescription: "Flowing black abaya with a sophisticated drape.",
    description:
      "Modest full-length abaya in premium crepe. Designed for comfort, elegance, and everyday grace.",
    colors: ["Black", "Navy", "Gray"],
    featured: true,
  },
  {
    slug: "abaya-2",
    name: "Elegant Abaya — Navy",
    category: "women",
    price: 47.99,
    shortDescription: "Deep navy abaya for refined modest fashion.",
    description: "Lightweight fabric with subtle sheen. Perfect for events and daily wear.",
    colors: ["Navy", "Black", "Beige"],
  },
  {
    slug: "abaya-3",
    name: "Elegant Abaya — Beige",
    category: "women",
    price: 45.99,
    shortDescription: "Soft beige abaya with timeless elegance.",
    description: "Neutral tone that pairs with any hijab color. Relaxed fit with polished finish.",
    colors: ["Beige", "Brown", "White"],
    bestSeller: true,
  },
  {
    slug: "abaya-4",
    name: "Elegant Abaya — Gray",
    category: "women",
    price: 44.99,
    shortDescription: "Modern gray abaya for smart modest style.",
    description: "Contemporary cut with classic modest coverage. Easy care, wrinkle-resistant fabric.",
    colors: ["Gray", "Black", "Navy"],
  },
  {
    slug: "abaya-5",
    name: "Elegant Abaya — Burgundy",
    category: "women",
    price: 52.99,
    shortDescription: "Statement burgundy abaya for special occasions.",
    description: "Rich color with elegant embroidery-inspired trim. A favorite for Eid and gatherings.",
    colors: ["Red", "Brown", "Black"],
    onSale: true,
    salePrice: 42.99,
  },
  {
    slug: "panjabi-1",
    name: "Classic Panjabi — White",
    category: "mens",
    price: 34.99,
    shortDescription: "Crisp white panjabi for festivals and formal events.",
    description:
      "Traditional panjabi with modern tailoring. Breathable fabric for all-day comfort.",
    colors: ["White", "Beige", "Navy"],
    featured: true,
  },
  {
    slug: "panjabi-2",
    name: "Classic Panjabi — Navy",
    category: "mens",
    price: 36.99,
    shortDescription: "Navy panjabi with a smart, structured fit.",
    description: "Ideal for Jummah, weddings, and cultural celebrations. Easy iron, premium finish.",
    colors: ["Navy", "Black", "White"],
    bestSeller: true,
  },
  {
    slug: "panjabi-3",
    name: "Classic Panjabi — Cream",
    category: "mens",
    price: 33.99,
    shortDescription: "Cream panjabi for a soft, distinguished look.",
    description: "Lightweight cotton blend with subtle texture. Pairs well with white pajama or trousers.",
    colors: ["Beige", "White", "Brown"],
  },
  {
    slug: "panjabi-4",
    name: "Classic Panjabi — Black",
    category: "mens",
    price: 35.99,
    shortDescription: "Black panjabi for evening and formal wear.",
    description: "Sleek silhouette with reinforced stitching. A staple for smart traditional dress.",
    colors: ["Black", "Navy", "Gray"],
  },
  {
    slug: "panjabi-5",
    name: "Classic Panjabi — Maroon",
    category: "mens",
    price: 38.99,
    shortDescription: "Maroon panjabi for festive and wedding style.",
    description: "Rich maroon tone with premium buttons. Designed for men who dress with intention.",
    colors: ["Red", "Brown", "Black"],
    onSale: true,
    salePrice: 29.99,
  },
];

function imagePath(slug) {
  for (const ext of [".png", ".jpg", ".jpeg", ".webp"]) {
    const file = path.join(IMAGES_DIR, slug + ext);
    if (fs.existsSync(file)) return `/product-images/${slug}${ext}`;
  }
  return "";
}

async function upsertProduct(def) {
  const stockRows = sizeStock(6);
  const totalStock = stockRows.reduce((s, r) => s + r.stock, 0);
  const img = imagePath(def.slug);

  const doc = {
    name: def.name,
    price: def.price,
    shortDescription: def.shortDescription,
    description: def.description,
    category: def.category,
    sizes: ADULT_SIZES,
    sizeStock: stockRows,
    colors: def.colors,
    stock: totalStock,
    featured: Boolean(def.featured),
    bestSeller: Boolean(def.bestSeller),
    onSale: Boolean(def.onSale),
    salePrice: def.onSale ? def.salePrice : undefined,
    imageUrl: img,
  };

  const existing = await Product.findOne({ name: def.name });
  if (existing) {
    Object.assign(existing, doc);
    await existing.save();
    return { action: "updated", name: def.name, imageUrl: img };
  }

  await Product.create(doc);
  return { action: "created", name: def.name, imageUrl: img };
}

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("Set MONGO_URI or MONGODB_URI in backend/.env");
    process.exit(1);
  }

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Missing images folder:", IMAGES_DIR);
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB\n");

  for (const def of CATALOG) {
    const result = await upsertProduct(def);
    const icon = result.action === "created" ? "+" : "↻";
    console.log(`${icon}  ${result.name}`);
    console.log(`   image: ${result.imageUrl || "(missing file)"}\n`);
  }

  await mongoose.disconnect();
  console.log("Done — 15 fashion products (5 t-shirts, 5 abayas, 5 panjabis).");
  console.log("Optional: node scripts/apply-product-images.js  (upload to Cloudinary)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
