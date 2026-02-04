const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

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

// ✅ Allow ONLY your Vercel site (and localhost for dev)
const allowList = [
  "http://localhost:3000",
  "https://online-store-six-gules.vercel.app",
];

app.use(
  cors({
    origin: function (origin, cb) {
      // allow Postman/curl (no Origin header)
      if (!origin) return cb(null, true);

      if (allowList.includes(origin)) return cb(null, true);

      return cb(new Error("CORS blocked: " + origin));
    },
    credentials: true,
  })
);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    db: mongoose.connection.readyState === 1 ? "connected" : "not_connected",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("API_ERROR:", err);
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
});

module.exports = app;