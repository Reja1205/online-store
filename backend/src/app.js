const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

const allowList = [
  "http://localhost:3000",
  "https://online-store-six-gules.vercel.app",
];

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (allowList.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin));
    },
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    db: mongoose.connection.readyState === 1 ? "connected" : "not_connected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);


app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error("API_ERROR:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

module.exports = app;