const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS for production cookies
const allowedOrigin = process.env.FRONTEND_ORIGIN;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Routes
const authRoutes = require("./routes/auth.routes");

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "connected" : "not_connected",
  });
});

app.use("/api/auth", authRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

module.exports = app;