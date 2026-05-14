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

const corsOptions = {
  origin: function (origin, cb) {
    if (!origin) return cb(null, true); // Postman / curl

    if (extraAllowedOrigins.includes(origin)) return cb(null, true);

    // Local development
    if (origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000")
      return cb(null, true);

    if (origin === "http://localhost:3001" || origin === "http://127.0.0.1:3001")
      return cb(null, true);

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