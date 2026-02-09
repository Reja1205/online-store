"use client";

import Link from "next/link";
import { productName, productPrice, productStock } from "../lib/api";

export default function ProductCard({ p, user, onAddToCart }) {
  const name = productName(p);
  const price = productPrice(p);
  const stock = productStock(p);

  const canAdd = !!user && stock > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100 flex flex-col overflow-hidden">
      
      {/* IMAGE + STOCK BADGE */}
      <div className="relative w-full overflow-hidden bg-gray-50">
        {/* Fixed height mobile, ratio desktop */}
        <div className="h-44 sm:aspect-[4/3] sm:h-auto">
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
        </div>

        {/* STOCK BADGE */}
        <span
          className={`absolute right-3 top-3 z-10 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
            stock > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* TITLE */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
          {name}
        </h3>

        {/* PRICE */}
        <p className="text-indigo-600 font-semibold text-sm">
          ${price}
        </p>

        {/* DESCRIPTION */}
        {p.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {p.description}
          </p>
        )}

        {/* BUTTONS */}
        <div className="flex gap-2 mt-auto">
          <Link href={`/products/${p._id}`} className="flex-1">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 rounded-lg transition">
              View
            </button>
          </Link>

          <button
            onClick={() => onAddToCart(p._id)}
            disabled={!canAdd}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition ${
              canAdd
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            title={
              !user
                ? "Login to add items"
                : stock <= 0
                ? "Out of stock"
                : ""
            }
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}