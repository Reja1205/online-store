"use client";

import Link from "next/link";
import { PRODUCT_CATEGORIES } from "../lib/categories";

const QUICK_LINKS = [
  { label: "Promotions", href: "/promotions", accent: true },
  { label: "Best Sellers", href: "/products?section=best-seller" },
  { label: "Sale", href: "/products?section=sale" },
  { label: "Featured", href: "/products?section=featured" },
];

const NAV_CATEGORIES = PRODUCT_CATEGORIES.filter((c) => c.value !== "all").slice(0, 10);

const chipBase =
  "shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition sm:text-[13px]";

/* Full class strings — do not combine chip + chipActive (Tailwind bg/text conflicts) */
const chip = `${chipBase} border-indigo-300 bg-white text-indigo-950 hover:border-indigo-400 hover:bg-indigo-50`;

const chipActive = `${chipBase} border-indigo-700 bg-indigo-600 text-white shadow-md hover:border-indigo-800 hover:bg-indigo-700`;

export default function HeaderSubNav({ onOpenMenu }) {
  return (
    <nav
      className="header-subnav w-full min-w-0 max-w-full overflow-x-clip px-3 py-2.5 sm:px-4"
      aria-label="Browse departments"
    >
      <div className="mx-auto flex w-full min-w-0 max-w-[1500px] items-center gap-2 overflow-x-auto overscroll-x-contain scrollbar-none">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-indigo-300 bg-white px-3 py-1 text-xs font-semibold text-indigo-950 shadow-sm lg:hidden"
          aria-label="Open menu"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
          Menu
        </button>

        <Link href="/products" className={chipActive}>
          Shop all
        </Link>

        {QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.accent ? `${chipBase} border-amber-500 bg-amber-50 text-amber-950 hover:border-amber-600 hover:bg-amber-100` : chip}
          >
            {item.label}
          </Link>
        ))}

        <span className="hidden h-4 w-px shrink-0 bg-slate-300 sm:block" aria-hidden />

        {NAV_CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={
              c.value === "mens"
                ? "/products?category=mens"
                : `/products?category=${encodeURIComponent(c.value)}`
            }
            className={chip}
          >
            {c.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
