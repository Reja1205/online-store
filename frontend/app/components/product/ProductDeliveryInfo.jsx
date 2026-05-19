import { getDeliveryOptions } from "../../lib/delivery";

export default function ProductDeliveryInfo({ product }) {
  const delivery = getDeliveryOptions(product);

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4" aria-labelledby="delivery-heading">
      <h2 id="delivery-heading" className="text-sm font-semibold text-slate-900">
        Delivery
      </h2>
      <p className="mt-1 text-sm font-medium text-indigo-700">{delivery.headline}</p>

      {delivery.inStock ? (
        <ul className="mt-3 space-y-2">
          {delivery.options.map((opt) => (
            <li
              key={opt.id}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                opt.highlight
                  ? "border-indigo-200 bg-white shadow-sm"
                  : "border-slate-200/80 bg-white/60"
              }`}
            >
              <div>
                <span className="font-medium text-slate-900">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-slate-600">{opt.eta}</span>
              </div>
              <span
                className={`shrink-0 font-semibold ${
                  opt.priceLabel === "FREE" ? "text-emerald-700" : "text-slate-800"
                }`}
              >
                {opt.priceLabel}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs text-slate-600">{delivery.note}</p>
    </section>
  );
}
