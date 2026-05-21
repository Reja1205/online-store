"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getCategoryLabel,
  normalizeCategorySlug,
  productMatchesCategory,
  PRODUCT_CATEGORIES,
} from "../lib/categories";
import { filterBySection } from "../lib/productSections";
import ProductCard from "../components/ProductCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import { ProductCardSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../lib/api";
import { fetchProductsCatalogClient } from "../lib/products";
import { PRODUCT_GRID_CLASS } from "../lib/productGrid";
import { useViewMore } from "../lib/useViewMore";
import ViewMoreButton from "../components/ViewMoreButton";

export default function ProductsPageClient({
  initialProducts = [],
  initialError = "",
}) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(!initialProducts.length && !initialError);
  const [loadError, setLoadError] = useState(initialError);
  const [loadErrorDebug, setLoadErrorDebug] = useState("");
  const [toast, setToast] = useState(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [section, setSection] = useState("");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    const cat = searchParams.get("category");
    setCategory(cat ? normalizeCategorySlug(cat) : "all");
    setSection(searchParams.get("section") || "");
  }, [searchParams]);

  const sectionTitle =
    section === "best-seller"
      ? "Best Sellers"
      : section === "featured"
        ? "Featured Products"
        : section === "sale"
          ? "Special Sale"
          : null;

  const syncCatalog = useCallback(async (force = false) => {
    setLoadError("");
    setLoadErrorDebug("");
    setToast(null);
    setLoading(true);

    const result = await fetchProductsCatalogClient({ force });

    if (!result.ok) {
      setProducts([]);
      setLoadError(result.message || "Something went wrong while loading the catalog.");
      setLoading(false);
      return;
    }

    setProducts(result.products);
    setLoading(false);
  }, []);

  // Background refresh only when SSR had no data or cache is stale (not on category change)
  useEffect(() => {
    if (initialProducts.length > 0 && !initialError) {
      setLoading(false);
      void fetchProductsCatalogClient().then((result) => {
        if (result.ok && result.products.length) {
          setProducts(result.products);
        }
      });
      return;
    }
    void syncCatalog(true);
  }, [initialProducts.length, initialError, syncCatalog]);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();

    return filterBySection(products, section)
      .filter((p) => {
        if (!query) return true;
        const name = String(p?.name ?? p?.title ?? "").toLowerCase();
        const desc = String(p?.description ?? "").toLowerCase();
        return name.includes(query) || desc.includes(query);
      })
      .filter((p) => {
        const stock = Number(p?.stock ?? p?.stockQty ?? 0) || 0;
        if (filter === "in") return stock > 0;
        if (filter === "out") return stock <= 0;
        return true;
      })
      .filter((p) => productMatchesCategory(p, category));
  }, [products, q, filter, category, section]);

  async function addToCart(productId, size, color) {
    setToast(null);
    const { res, data } = await apiJson("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({
        productId,
        qty: 1,
        ...(size ? { size } : {}),
        ...(color ? { color } : {}),
      }),
    });
    if (!res.ok) {
      setToast({
        variant: "danger",
        text: data?.message || "Could not add this item to your cart.",
      });
      return;
    }
    setToast({ variant: "success", text: "Added to your cart." });
    setTimeout(() => setToast(null), 2200);
    window.dispatchEvent(new Event("cart:updated"));
  }

  const listFailed = Boolean(loadError) && products.length === 0 && !loading;
  const listEmptyOk = !loading && !loadError && products.length === 0;
  const filteredEmpty = !loading && !listFailed && products.length > 0 && shown.length === 0;

  const { visible: listVisible, loadMore, hasMore, remaining } = useViewMore(
    shown,
    undefined,
    [q, filter, category, section]
  );

  const selectClass =
    "w-full min-h-[2.125rem] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[2.75rem] sm:rounded-xl sm:px-3";

  return (
    <div className="min-w-0 space-y-4 overflow-x-clip pb-8 animate-fade-up sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {category !== "all"
              ? getCategoryLabel(category)
              : sectionTitle || "Catalog"}
          </h1>
          <p className="mt-0.5 hidden text-sm text-slate-600 sm:block">
            {category !== "all"
              ? `Showing products in ${getCategoryLabel(category)}.`
              : sectionTitle
                ? `Browsing ${sectionTitle.toLowerCase()}.`
                : "Browse by category or search the full catalog."}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 sm:min-h-[2.75rem] sm:rounded-xl sm:px-4"
        >
          ← Home
        </Link>
      </div>

      <Card padding="p-3 sm:p-5">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-2 sm:gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="min-w-0">
              <label htmlFor="catalog-search" className="sr-only">
                Search products
              </label>
              <Input
                id="catalog-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                autoComplete="off"
                disabled={listFailed}
                className="py-2 sm:py-2.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 lg:contents">
              <select
                id="catalog-category"
                value={category}
                onChange={(e) => {
                  const next = e.target.value;
                  const params = new URLSearchParams();
                  if (q.trim()) params.set("q", q.trim());
                  if (next && next !== "all") params.set("category", next);
                  if (section) params.set("section", section);
                  router.push(params.toString() ? `/products?${params}` : "/products");
                }}
                aria-label="Filter by category"
                disabled={listFailed}
                className={`${selectClass} lg:w-52`}
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <select
                id="catalog-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter by availability"
                disabled={listFailed}
                className={`${selectClass} lg:w-44`}
              >
                <option value="all">All stock</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 lg:shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 lg:hidden">
              <span>Matches</span>
              <Badge tone="neutral">{shown.length}</Badge>
            </div>
            <Button
              type="button"
              variant="outlineDark"
              size="sm"
              className="shrink-0 px-3"
              onClick={() => syncCatalog(true)}
            >
              Refresh
            </Button>
          </div>
        </div>
        <div className="mt-2 hidden flex-wrap items-center gap-2 text-xs text-slate-600 sm:flex sm:text-sm">
          <span>Matches</span>
          <Badge tone="neutral">{shown.length}</Badge>
          {shown.length > listVisible.length ? (
            <span className="text-slate-500">
              · showing {listVisible.length}
            </span>
          ) : null}
          {sectionTitle ? <Badge tone="neutral">{sectionTitle}</Badge> : null}
          {category !== "all" ? (
            <Badge tone="neutral">in {getCategoryLabel(category)}</Badge>
          ) : null}
        </div>
        {toast ? (
          <div className="mt-3">
            <Callout variant={toast.variant}>{toast.text}</Callout>
          </div>
        ) : null}
      </Card>

      {loading ? (
        <div className={PRODUCT_GRID_CLASS}>
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : listFailed ? (
        <Callout variant="danger" title="Catalog unavailable">
          <p>{loadError}</p>
          {loadErrorDebug ? (
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-red-100/70 p-3 font-mono text-xs text-red-950">
              {loadErrorDebug}
            </pre>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="primary" size="md" onClick={() => syncCatalog(true)}>
              Try again
            </Button>
            <Link
              href="/"
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Home
            </Link>
          </div>
        </Callout>
      ) : listEmptyOk ? (
        <EmptyState
          title={category !== "all" ? `No products in ${getCategoryLabel(category)}` : "No products yet"}
          description={
            category !== "all"
              ? "No items in this category yet. Try another department or view all products."
              : "The catalog is empty. Check back later or contact the store administrator."
          }
          actionLabel={category !== "all" ? "View all products" : "Home"}
          href={category !== "all" ? "/products" : "/"}
        />
      ) : filteredEmpty ? (
        <EmptyState
          title="No matches"
          description="Try a different search, category, or stock filter."
          actionLabel="Clear filters"
          onAction={() => {
            router.push("/products");
          }}
        />
      ) : (
        <>
          <div className={PRODUCT_GRID_CLASS}>
            {listVisible.map((p) => (
              <ProductCard key={p._id} p={p} user={user} onAddToCart={addToCart} />
            ))}
          </div>
          <ViewMoreButton
            hasMore={hasMore}
            remaining={remaining}
            onLoadMore={loadMore}
            className="mt-4 sm:mt-6"
          />
        </>
      )}
    </div>
  );
}
