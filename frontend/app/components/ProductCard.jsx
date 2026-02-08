"use client";

import Link from "next/link";
import { productName, productPrice, productStock } from "../lib/api";

export default function ProductCard({ p, user, onAddToCart }) {
  const name = productName(p);
  const price = productPrice(p);
  const stock = productStock(p);

  const canAdd = !!user && stock > 0;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug">{name}</h3>

        <span
          className={[
            "shrink-0 rounded-full border px-3 py-1 text-xs",
            stock > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500",
          ].join(" ")}
        >
          {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
        </span>
      </div>

      {p.imageUrl ? (
        <img
          src={p.imageUrl}
          alt={name}
          className="mt-3 h-40 w-full rounded-lg object-cover sm:h-44"
        />
      ) : (
        <div className="mt-3 flex h-40 w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500 sm:h-44">
          No image
        </div>
      )}

      <p className="mt-3 text-sm">
        <span className="font-medium">Price:</span> ${price}
      </p>

      {p.description ? (
        <p className="mt-2 text-sm text-gray-600">{p.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/products/${p._id}`} className="inline-flex">
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            View Details
          </button>
        </Link>

        <button
          className={[
            "rounded-lg px-4 py-2 text-sm text-white",
            canAdd ? "bg-gray-900 hover:bg-black" : "bg-gray-300 cursor-not-allowed",
          ].join(" ")}
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