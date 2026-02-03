const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

// ===== CORS (VERY IMPORTANT FOR LOGIN) =====
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// ===== HEALTH =====
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    db: mongoose.connection.readyState === 1 ? "connected" : "not_connected",
  });
});

// ===== ROUTES =====
app.use("/api/auth", authRoutes);

// ===== 404 =====
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("API_ERROR:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

module.exports = app;