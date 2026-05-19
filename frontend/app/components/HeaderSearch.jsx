"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { normalizeCategorySlug, PRODUCT_CATEGORIES } from "../lib/categories";

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeaderSearchInner({ className = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    const fromUrl = searchParams.get("category");
    setCategory(fromUrl ? normalizeCategorySlug(fromUrl) : "all");
  }, [searchParams]);

  function browse(categorySlug, searchQuery = query) {
    const params = new URLSearchParams();
    const q = searchQuery.trim();
    if (q) params.set("q", q);
    const slug = normalizeCategorySlug(categorySlug);
    if (slug && slug !== "all") params.set("category", slug);
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  function handleSubmit(e) {
    e.preventDefault();
    browse(category, query);
  }

  function handleCategoryChange(e) {
    const next = e.target.value;
    setCategory(next);
    browse(next, query);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-full border border-indigo-200/90 bg-white shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/25 ${className}`}
      role="search"
    >
      <label htmlFor="header-search-category" className="sr-only">
        Department
      </label>
      <div className="relative shrink-0 border-r border-indigo-100">
        <select
          id="header-search-category"
          value={category}
          onChange={handleCategoryChange}
          className="h-full cursor-pointer appearance-none rounded-l-full border-0 bg-transparent py-0 pl-4 pr-9 text-xs font-medium text-slate-700 focus:outline-none sm:text-sm"
          aria-label="Filter by department"
        >
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500"
          aria-hidden
        >
          ▾
        </span>
      </div>

      <label htmlFor="header-search-input" className="sr-only">
        Search products
      </label>
      <input
        id="header-search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search our catalog…"
        autoComplete="off"
        className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />

      <button
        type="submit"
        className="m-1 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-indigo-600 px-4 text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label="Search"
      >
        <SearchIcon className="h-4 w-4" />
      </button>
    </form>
  );
}

export default function HeaderSearch(props) {
  return (
    <Suspense
      fallback={
        <div className={`h-11 w-full rounded-full border border-slate-200 bg-slate-100 ${props.className || ""}`} />
      }
    >
      <HeaderSearchInner {...props} />
    </Suspense>
  );
}
