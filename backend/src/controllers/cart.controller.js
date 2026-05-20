const mongoose = require("mongoose");
const Product = require("../models/Product");
const { findCart, findOrCreateCart } = require("../utils/cartOwner");
const { isValidSizeForProduct } = require("../constants/sizes");
const { isValidColorForProduct } = require("../constants/colors");

function toId(v) {
  try {
    return v ? String(v) : "";
  } catch {
    return "";
  }
}

function normalizeVariant(size, color) {
  return {
    size: String(size || "").trim(),
    color: String(color || "").trim(),
  };
}

function cartLineKey(productId, size, color) {
  const v = normalizeVariant(size, color);
  return `${productId}::${v.size}::${v.color}`;
}

function findCartLineIndex(cart, productId, size, color) {
  const key = cartLineKey(productId, size, color);
  return cart.items.findIndex(
    (it) => cartLineKey(it.product, it.size, it.color) === key
  );
}

function stockForProductSize(product, size) {
  const list = product.sizeStock;
  if (Array.isArray(list) && list.length > 0 && size) {
    const row = list.find((s) => s.size === size);
    return row ? Number(row.stock || 0) : 0;
  }
  return Number(product.stock ?? 0);
}

function formatLineLabel(name, size, color) {
  const parts = [name];
  if (color) parts.push(color);
  if (size) parts.push(size);
  return parts.length > 1 ? `${name} — ${parts.slice(1).join(" / ")}` : name;
}

function mapCartItems(cart) {
  return (cart.items || []).map((it) => {
    const productId = toId(it.product?._id || it.product);
    const p = it.product;
    const { size, color } = normalizeVariant(it.size, it.color);

    return {
      productId,
      size,
      color,
      qty: Number(it.qty || 1),
      product: p
        ? {
            _id: toId(p._id),
            name: p.name || "",
            price: Number(p.price || 0),
            stock: Number(p.stock || 0),
            imageUrl: p.imageUrl || "",
            category: p.category || "",
            sizes: p.sizes || [],
            sizeStock: p.sizeStock || [],
            colors: p.colors || [],
          }
        : null,
    };
  });
}

const PRODUCT_CART_FIELDS =
  "name price stock imageUrl category sizes sizeStock colors";

async function getCart(req, res) {
  try {
    const cart = await findCart(req.cartOwner);
    if (!cart) return res.json({ cart: { items: [] } });

    await cart.populate("items.product", PRODUCT_CART_FIELDS);
    return res.json({ cart: { items: mapCartItems(cart) } });
  } catch (err) {
    console.error("GET_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function addToCart(req, res) {
  try {
    const { productId, qty, size: rawSize, color: rawColor } = req.body || {};
    if (!productId) return res.status(400).json({ message: "productId is required" });

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
    const { size, color } = normalizeVariant(rawSize, rawColor);

    if (hasSizes) {
      if (!size) return res.status(400).json({ message: "Please select a size" });
      if (!isValidSizeForProduct(product, size)) {
        return res.status(400).json({ message: "This size is not available for this product" });
      }
    }

    if (hasColors) {
      if (!color) return res.status(400).json({ message: "Please select a color" });
      if (!isValidColorForProduct(product, color)) {
        return res.status(400).json({ message: "This color is not available for this product" });
      }
    }

    const available = stockForProductSize(product, size);
    if (available <= 0) {
      return res.status(400).json({
        message: size ? `${size} is out of stock` : "Product is out of stock",
      });
    }

    const quantity = Math.max(1, Number(qty || 1));
    const cart = await findOrCreateCart(req.cartOwner);
    const idx = findCartLineIndex(cart, productId, size, color);

    const nextQty = (idx >= 0 ? cart.items[idx].qty : 0) + quantity;
    if (nextQty > available) {
      return res.status(400).json({
        message: `Only ${available} available${size ? ` in ${size}` : ""}`,
      });
    }

    if (idx >= 0) cart.items[idx].qty = nextQty;
    else cart.items.push({ product: productId, size, color, qty: quantity });

    await cart.save();
    return res.json({ message: "Added", cart });
  } catch (err) {
    console.error("ADD_TO_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function removeFromCart(req, res) {
  try {
    const productId = req.body?.productId || req.body?.product;
    const { size, color } = normalizeVariant(req.body?.size, req.body?.color);

    if (!productId) return res.status(400).json({ message: "productId is required" });

    const cart = await findCart(req.cartOwner);
    if (!cart) return res.json({ message: "Removed", cart: { items: [] } });

    const key = cartLineKey(productId, size, color);
    cart.items = cart.items.filter((it) => cartLineKey(it.product, it.size, it.color) !== key);
    await cart.save();

    return res.json({ message: "Removed", cart });
  } catch (err) {
    console.error("REMOVE_FROM_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function clearCart(req, res) {
  try {
    const cart = await findCart(req.cartOwner);
    if (!cart) return res.json({ message: "Cleared", cart: { items: [] } });

    cart.items = [];
    await cart.save();

    return res.json({ message: "Cleared", cart });
  } catch (err) {
    console.error("CLEAR_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  formatLineLabel,
};
