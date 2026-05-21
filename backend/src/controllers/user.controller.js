const mongoose = require("mongoose");
const User = require("../models/User");
const { isAdminRole } = require("../utils/userPublic");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");

const PUBLIC_SELECT = "-password";

function parseLimit(raw, fallback = 50) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 200);
}

function parsePage(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function toPublicUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    shippingAddress: doc.shippingAddress || {},
    orderCount: Number(doc.orderCount || 0),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function buildListFilter(query) {
  const filter = {};
  const role = String(query?.role || "").trim();
  if (role === "user" || role === "admin" || role === "superadmin") filter.role = role;

  const q = String(query?.q || "").trim();
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(escaped, "i");
    filter.$or = [{ name: rx }, { email: rx }];
  }

  return filter;
}

async function countAdmins(excludeId = null) {
  const filter = { role: { $in: ["admin", "superadmin"] } };
  if (excludeId) filter._id = { $ne: excludeId };
  return User.countDocuments(filter);
}

// GET /api/users — admin list (no passwords)
async function listUsers(req, res) {
  try {
    const page = parsePage(req.query?.page);
    const limit = parseLimit(req.query?.limit);
    const skip = (page - 1) * limit;
    const filter = buildListFilter(req.query);

    const [rows, total] = await Promise.all([
      User.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "user",
            as: "_orders",
          },
        },
        {
          $addFields: {
            orderCount: { $size: "$_orders" },
          },
        },
        {
          $project: {
            password: 0,
            _orders: 0,
          },
        },
      ]),
      User.countDocuments(filter),
    ]);

    return res.json({
      users: rows.map(toPublicUser),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("LIST_USERS_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/users/:id — admin detail
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const rows = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "_orders",
        },
      },
      { $addFields: { orderCount: { $size: "$_orders" } } },
      { $project: { password: 0, _orders: 0 } },
    ]);

    const user = rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("GET_USER_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// PATCH /api/users/:id — update name / role
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const target = await User.findById(id).select(PUBLIC_SELECT);
    if (!target) return res.status(404).json({ message: "User not found" });

    const updates = {};
    const name = req.body?.name;
    const role = req.body?.role;

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return res.status(400).json({ message: "Name cannot be empty" });
      updates.name = trimmed;
    }

    if (role !== undefined) {
      if (role !== "user" && role !== "admin" && role !== "superadmin") {
        return res.status(400).json({ message: "Role must be user, admin, or superadmin" });
      }

      const selfId = String(req.user.id);
      const targetId = String(id);

      if (role === "user" && isAdminRole(target.role)) {
        if (targetId === selfId) {
          return res.status(400).json({ message: "You cannot remove your own admin access" });
        }
        const admins = await countAdmins();
        if (admins <= 1) {
          return res.status(400).json({ message: "Cannot demote the last admin" });
        }
      }

      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select(PUBLIC_SELECT);

    return res.json({
      message: "User updated",
      user: toPublicUser({ ...updated.toObject(), orderCount: 0 }),
    });
  } catch (err) {
    console.error("UPDATE_USER_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/users/:id — remove customer account (keeps orders)
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const target = await User.findById(id).select("role email");
    if (!target) return res.status(404).json({ message: "User not found" });

    const selfId = String(req.user.id);
    const targetId = String(id);

    if (targetId === selfId) {
      return res.status(400).json({ message: "You cannot delete your own account here" });
    }

    if (isAdminRole(target.role)) {
      const admins = await countAdmins(target._id);
      if (admins < 1) {
        return res.status(400).json({ message: "Cannot delete the last admin" });
      }
    }

    await Promise.all([
      Cart.deleteMany({ user: target._id }),
      Wishlist.deleteOne({ userId: target._id }),
    ]);

    await User.findByIdAndDelete(id);

    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE_USER_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
