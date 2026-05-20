const Cart = require("../models/Cart");

const GUEST_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  let cart = await findCart(owner);
  if (cart) return cart;

  const payload =
    owner.type === "user" ? { user: owner.id, items: [] } : { guestId: owner.id, items: [] };

  try {
    cart = await Cart.create(payload);
    return cart;
  } catch (err) {
    if (err?.code === 11000) {
      return Cart.findOne(cartFilter(owner));
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
      $set: { user: userId },
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
  resolveCartOwnerFromRequest,
  cartFilter,
  findCart,
  findOrCreateCart,
  mergeGuestCartIntoUser,
};
