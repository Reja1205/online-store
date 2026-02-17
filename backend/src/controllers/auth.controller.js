const bcrypt = require("bcrypt");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

function buildCookieOptions(req) {
  const origin = req.headers.origin || "";

  // If the frontend is https (Vercel preview/prod), we must use SameSite=None + Secure
  const isHttpsFrontend = origin.startsWith("https://");
  const isProd = process.env.NODE_ENV === "production" || isHttpsFrontend;

  return {
    httpOnly: true,
    secure: isProd,                 // ✅ required for SameSite=None
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

// POST /api/auth/register-user
async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashed,
      role: "user",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("REGISTER_USER_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/auth/register-admin
async function registerAdmin(req, res) {
  try {
    const { name, email, password, adminSecret } = req.body || {};
    if (!name || !email || !password || !adminSecret) {
      return res.status(400).json({
        message: "Name, email, password, adminSecret are required",
      });
    }

    const expectedSecret = process.env.ADMIN_SECRET;
    if (!expectedSecret) {
      return res.status(500).json({ message: "ADMIN_SECRET is not set on server" });
    }
    if (adminSecret !== expectedSecret) {
      return res.status(403).json({ message: "Invalid admin secret" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashed,
      role: "admin",
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("REGISTER_ADMIN_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id.toString(), role: user.role });

    const cookieName = process.env.COOKIE_NAME || "token";
    res.cookie(cookieName, token, buildCookieOptions(req));

    // Return token too (useful if you switch to Authorization header later)
    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  const cookieName = process.env.COOKIE_NAME || "token";
  res.clearCookie(cookieName, buildCookieOptions(req));
  return res.json({ message: "Logged out" });
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("ME_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { registerUser, registerAdmin, login, logout, me };