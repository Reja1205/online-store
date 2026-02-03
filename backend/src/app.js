const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Allow multiple origins (comma-separated)
const rawOrigins =
  process.env.FRONTEND_ORIGIN || "http://localhost:3000";

const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
  })
);

// Routes
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");

// Health
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    db: mongoose.connection.readyState === 1 ? "connected" : "not_connected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// error handler
app.use((err, req, res, next) => {
  console.error("API_ERROR:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

module.exports = app;