"use client";

import Link from "next/link";
import { productName, productPrice, productStock } from "../lib/api";

export default function ProductCard({ p, user, onAddToCart }) {
  const name = productName(p);
  const price = productPrice(p);
  const stock = productStock(p);

  const canAdd = !!user && stock > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col gap-3 border border-gray-100">
      {/* Title + Stock */}
      <div className="flex justify-between items-start gap-3">
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>

        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            stock > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
        </span>
      </div>

      {/* Image */}
      {p.imageUrl && (
        <img
          src={p.imageUrl}
          alt={name}
          className="w-full h-44 object-cover rounded-xl border"
        />
      )}

      {/* Price */}
      <p className="text-indigo-600 font-semibold text-base">
        ${price}
      </p>

      {/* Description */}
      {p.description && (
        <p className="text-sm text-gray-500 line-clamp-2">
          {p.description}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-2 mt-2">
        <Link href={`/products/${p._id}`} className="flex-1">
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg transition">
            View
          </button>
        </Link>

        <button
          onClick={() => onAddToCart(p._id)}
          disabled={!canAdd}
          className={`flex-1 font-medium py-2 rounded-lg transition ${
            canAdd
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          title={!user ? "Login to add items" : stock <= 0 ? "Out of stock" : ""}
        >
          Add
        </button>
      </div>
    </div>
  );
}