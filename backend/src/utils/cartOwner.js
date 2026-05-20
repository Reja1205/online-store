const Cart = require("../models/Cart");

const GUEST_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let cartIndexRepairDone = false;

/** Fix legacy guest carts that stored user:null and broke the user unique index. */
async function repairGuestCartDocuments() {
  if (cartIndexRepairDone) return;
  cartIndexRepairDone = true;

  try {
    await Cart.updateMany(
      { guestId: { $exists: true, $ne: "" } },
      { $unset: { user: "" } }
    );
    await Cart.syncIndexes();
  } catch (err) {
    console.warn("CART_INDEX_REPAIR_WARN:", err.message);
  }
}

function resolveCartOwnerFromRequest(req) {
  if (req.user?.id) {
    return { type: "user", id: req.user.id };
  }

  const guestId = String(req.headers["x-guest-id"] || "").trim();
  if (guestId && GUEST_ID_RE.test(guestId)) {
    return { type: "guest", id: guestId };
  }

  return null;
}

function cartFilter(owner) {
  return owner.type === "user" ? { user: owner.id } : { guestId: owner.id };
}

async function findCart(owner) {
  return Cart.findOne(cartFilter(owner));
}

async function findOrCreateCart(owner) {
  await repairGuestCartDocuments();

  const existing = await Cart.findOne(cartFilter(owner));
  if (existing) return existing;

  if (owner.type === "guest") {
    try {
      const result = await Cart.collection.insertOne({
        guestId: owner.id,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const cart = await Cart.findById(result.insertedId);
      if (cart) return cart;
    } catch (err) {
      if (err?.code === 11000) {
        const cart = await Cart.findOne({ guestId: owner.id });
        if (cart) return cart;
      }
      throw err;
    }
  }

  try {
    return await Cart.create({ user: owner.id, items: [] });
  } catch (err) {
    if (err?.code === 11000) {
      const cart = await Cart.findOne({ user: owner.id });
      if (cart) return cart;
    }
    throw err;
  }
}

/** Merge guest cart into user cart after login/register. */
async function mergeGuestCartIntoUser(guestId, userId) {
  if (!guestId || !userId || !GUEST_ID_RE.test(guestId)) return;

  const guestCart = await Cart.findOne({ guestId });
  if (!guestCart?.items?.length) {
    if (guestCart) await Cart.deleteOne({ _id: guestCart._id });
    return;
  }

  let userCart = await Cart.findOne({ user: userId });

  if (!userCart) {
    await Cart.findByIdAndUpdate(guestCart._id, {
      $set: { user: userId, items: guestCart.items },
      $unset: { guestId: "" },
    });
    return;
  }

  for (const item of guestCart.items) {
    const pid = String(item.product);
    const size = String(item.size || "").trim();
    const color = String(item.color || "").trim();
    const idx = userCart.items.findIndex(
      (it) =>
        String(it.product) === pid &&
        String(it.size || "").trim() === size &&
        String(it.color || "").trim() === color
    );
    if (idx >= 0) {
      userCart.items[idx].qty += Number(item.qty || 1);
    } else {
      userCart.items.push({
        product: item.product,
        size: item.size || "",
        color: item.color || "",
        qty: item.qty,
      });
    }
  }

  await userCart.save();
  await Cart.deleteOne({ _id: guestCart._id });
}

module.exports = {
  GUEST_ID_RE,
  repairGuestCartDocuments,
  resolveCartOwnerFromRequest,
  cartFilter,
  findCart,
  findOrCreateCart,
  mergeGuestCartIntoUser,
};
