"use client";

import Link from "next/link";
import { productName, productPrice, productStock } from "../lib/api";

export default function ProductCard({ p, user, onAddToCart }) {
  const name = productName(p);
  const price = productPrice(p);
  const stock = productStock(p);

  const canAdd = !!user && stock > 0;

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ margin: 0 }}>{name}</h3>

        {/* ✅ Stock badge/button */}
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid #ddd",
            fontSize: 12,
            opacity: stock > 0 ? 1 : 0.6,
          }}
        >
          {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
        </span>
      </div>

      {p.imageUrl ? (
        <img
          src={p.imageUrl}
          alt={name}
          width={160}
          style={{ marginTop: 10, borderRadius: 10, display: "block" }}
        />
      ) : null}

      <p style={{ margin: "10px 0 0 0" }}>Price: ${price}</p>
      {p.description ? <p style={{ margin: "8px 0 0 0" }}>{p.description}</p> : null}

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Link href={`/products/${p._id}`}>
          <button style={{ padding: 8, cursor: "pointer" }}>View Details</button>
        </Link>

        <button
          style={{ padding: 8, cursor: canAdd ? "pointer" : "not-allowed", opacity: canAdd ? 1 : 0.6 }}
          onClick={() => onAddToCart(p._id)}
          disabled={!canAdd}
          title={!user ? "Login to add items" : stock <= 0 ? "Out of stock" : ""}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}