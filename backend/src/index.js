require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS for frontend cookies
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.get("/health", (req, res) => res.json({ status: "OK" }));

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;

connectDB();
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});