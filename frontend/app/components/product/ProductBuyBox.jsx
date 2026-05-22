"use client";

import Link from "next/link";
import {
  formatMoneyUSD,
  productDisplayPrice,
  productPrice,
} from "../../lib/api";
import { getDeliveryOptions } from "../../lib/delivery";
import {
  isMensTshirtProduct,
  mensTshirtFreeShippingNote,
  qualifiesMensTshirtFreeShipping,
} from "../../lib/freeShipping";

const qtySelectClass =
  "w-full min-h-[2.75rem] rounded-lg border border-slate-300 bg-[#f0f8ff] px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60";

export default function ProductBuyBox({
  product,
  quantity,
  maxQty,
  stock,
  variantsReady,
  canAdd,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  paying = false,
}) {
  const display = productDisplayPrice(product);
  const regular = productPrice(product);
  const delivery = getDeliveryOptions(product);
  const mensTshirt = isMensTshirtProduct(product);
  const freeDeliveryNote = mensTshirt
    ? mensTshirtFreeShippingNote(quantity)
    : delivery.note;

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="mb-3 border-b border-slate-100 pb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-800">BigBag delivery</p>
        <p className="mt-2 text-2xl font-normal text-slate-900">{formatMoneyUSD(display)}</p>
        {regular > display ? (
          <p className="text-xs text-slate-500 line-through">{formatMoneyUSD(regular)}</p>
        ) : null}
      </div>

      <div className="space-y-2 text-sm text-slate-800">
        <p>
          <span className="font-semibold text-emerald-700">FREE delivery</span>{" "}
          <span className="text-slate-600">on qualifying orders.</span>
        </p>
        <p className="text-xs text-slate-600">{freeDeliveryNote}</p>
        {delivery.inStock && delivery.options[0] ? (
          <p className="text-xs text-slate-500">
            {delivery.options[0].label} · {delivery.options[0].eta}
          </p>
        ) : null}
      </div>

      <p
        className={`mt-4 text-lg font-medium ${
          stock > 0 ? "text-emerald-700" : "text-rose-700"
        }`}
      >
        {stock > 0 ? "In Stock" : "Out of Stock"}
      </p>

      <div className="mt-3">
        <label htmlFor="buybox-qty" className="sr-only">
          Quantity
        </label>
        <select
          id="buybox-qty"
          value={Math.min(quantity, maxQty)}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          disabled={stock <= 0 || !variantsReady}
          className={qtySelectClass}
        >
          {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Quantity: {n}
            </option>
          ))}
        </select>
      </div>

      {mensTshirt && qualifiesMensTshirtFreeShipping(quantity) ? (
        <p className="mt-2 text-xs font-medium text-emerald-800">
          This quantity qualifies for FREE shipping at checkout.
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        <button
          type="button"
          disabled={!canAdd || paying}
          onClick={onAddToCart}
          className="w-full rounded-full bg-[#ffd814] px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-[#f7ca00] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to cart
        </button>
        <button
          type="button"
          disabled={!canAdd || paying}
          onClick={onBuyNow}
          className="w-full rounded-full bg-[#ffa41c] px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-[#fa8900] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>

      <Link
        href="/cart"
        className="mt-3 block text-center text-xs text-sky-700 hover:text-sky-900 hover:underline"
      >
        View cart
      </Link>
    </aside>
  );
}
