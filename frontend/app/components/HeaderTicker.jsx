"use client";

import Link from "next/link";

const TICKER_MESSAGES = [
  { text: "Summer sale — save on seasonal favorites", href: "/products?section=sale" },
  { text: "Free shipping on qualifying orders", href: "/products" },
  { text: "New in Women's, Men's & Kids", href: "/products?category=women" },
  { text: "Shop special offers", href: "/products?section=sale" },
];

function TickerContent() {
  return (
    <>
      {TICKER_MESSAGES.map((item, i) => (
        <span key={`${item.text}-${i}`} className="inline-flex shrink-0 items-center">
          {item.href ? (
            <Link
              href={item.href}
              className="cursor-pointer whitespace-nowrap px-8 text-sm font-medium text-indigo-100 transition hover:text-white"
            >
              {item.text}
            </Link>
          ) : (
            <span className="whitespace-nowrap px-8 text-sm font-medium text-indigo-100">{item.text}</span>
          )}
          <span className="text-indigo-300/80" aria-hidden>
            ·
          </span>
        </span>
      ))}
    </>
  );
}

export default function HeaderTicker() {
  return (
    <div
      className="relative w-full max-w-full overflow-hidden bg-linear-to-r from-indigo-700 via-indigo-600 to-indigo-800"
      role="region"
      aria-label="Store announcements"
    >
      <div className="header-ticker-track flex w-max items-center py-2">
        <TickerContent />
        <span className="flex shrink-0 items-center" aria-hidden>
          <TickerContent />
        </span>
      </div>
    </div>
  );
}
