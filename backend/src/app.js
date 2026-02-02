const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,        // your vercel url
  "http://localhost:3000",            // local dev
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server-to-server requests (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
  })
);

const authRoutes = require("./routes/auth.routes");

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "connected" : "not_connected",
  });
});

app.use("/api/auth", authRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

module.exports = app;