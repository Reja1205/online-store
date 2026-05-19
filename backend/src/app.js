const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const aiRoutes = require("./routes/ai.routes");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const checkoutRoutes = require("./routes/checkout.routes");
const orderRoutes = require("./routes/order.routes");
const wishlistRoutes = require("./routes/wishlist.routes");

const app = express();

// Render/Proxy friendly (needed for Secure cookies + HTTPS proxies)
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

// ✅ Final CORS Configuration
const extraAllowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const isPrivateHostname = (hostname) =>
  hostname === "localhost" ||
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);

const isDevFrontendOrigin = (origin) => {
  try {
    const { protocol, hostname, port } = new URL(origin);
    if (protocol !== "http:") return false;
    if (!["3000", "3001"].includes(port)) return false;
    return isPrivateHostname(hostname);
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: function (origin, cb) {
    if (!origin) return cb(null, true); // Postman / curl

    if (extraAllowedOrigins.includes(origin)) return cb(null, true);

    // Local development (localhost + LAN, e.g. phone on same Wi‑Fi)
    if (isDevFrontendOrigin(origin)) return cb(null, true);

    // Production frontend
    if (origin === "https://online-store-six-gules.vercel.app")
      return cb(null, true);

    // ✅ Allow ALL Vercel deployments (preview + production)
    try {
      const { hostname } = new URL(origin);
      if (hostname.endsWith(".vercel.app")) return cb(null, true);
    } catch (e) {
      // ignore invalid origin format
    }

    return cb(new Error("CORS blocked: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Safe preflight handler (Express/router compatible)
app.options(/.*/, cors(corsOptions));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    db:
      mongoose.connection.readyState === 1
        ? "connected"
        : "not_connected",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/ai", aiRoutes);

// 404
app.use((req, res) =>
  res.status(404).json({ message: "Route not found" })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("API_ERROR:", err);
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
});

module.exports = app;