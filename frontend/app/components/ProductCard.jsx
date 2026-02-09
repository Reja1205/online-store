"use client";

import Link from "next/link";
import { productName, productPrice, productStock } from "../lib/api";

export default function ProductCard({ p, user, onAddToCart }) {
  const name = productName(p);
  const price = productPrice(p);
  const stock = productStock(p);
  const canAdd = !!user && stock > 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-4/3 w-full bg-gray-50">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute right-3 top-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}
          >
            {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title + Price */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
            {name}
          </h3>
          <p className="shrink-0 text-base font-bold text-indigo-600">
            ${price}
          </p>
        </div>

        {/* Description (keeps height consistent) */}
        <p className="mt-2 line-clamp-2 min-h-11 text-sm text-gray-600">
          {p.description ? p.description : " "}
        </p>

        {/* Buttons pinned to bottom */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/products/${p._id}`} className="w-full">
            <button className="w-full rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-200">
              View
            </button>
          </Link>

          <button
            onClick={() => onAddToCart(p._id)}
            disabled={!canAdd}
            className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
              canAdd
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            title={!user ? "Login to add items" : stock <= 0 ? "Out of stock" : ""}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}