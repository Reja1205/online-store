"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  getPromotionLabel,
  normalizePromotionSlug,
  pickPromotionProducts,
  PROMOTION_CATEGORIES,
  PROMOTION_PARENT_LABEL,
} from "../lib/promotions";
import { PRODUCT_GRID_CLASS } from "../lib/productGrid";
import { useViewMore } from "../lib/useViewMore";
import ViewMoreButton from "../components/ViewMoreButton";

const chipBase =
  "shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition sm:text-[13px]";
const chip =
  `${chipBase} border-amber-300 bg-white text-amber-950 hover:border-amber-400 hover:bg-amber-50`;
const chipActive =
  `${chipBase} border-amber-700 bg-amber-600 text-white shadow-md hover:border-amber-800 hover:bg-amber-700`;

export default function PromotionsPageClient({
  initialProducts = [],
  initialError = "",
}) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(!initialProducts.length && !initialError);
  const [loadError, setLoadError] = useState(initialError);
  const [toast, setToast] = useState(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [promo, setPromo] = useState("all");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    const raw = searchParams.get("promo");
    setPromo(raw ? normalizePromotionSlug(raw) : "all");
  }, [searchParams]);

  const syncCatalog = useCallback(async (force = false) => {
    setLoadError("");
    setToast(null);
    setLoading(true);
    const result = await fetchProductsCatalogClient({ force });
    if (!result.ok) {
      setProducts([]);
      setLoadError(result.message || "Something went wrong while loading promotions.");
      setLoading(false);
      return;
    }
    setProducts(result.products);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialProducts.length > 0 && !initialError) {
      setLoading(false);
      void fetchProductsCatalogClient().then((result) => {
        if (result.ok && result.products.length) setProducts(result.products);
      });
      return;
    }
    void syncCatalog(true);
  }, [initialProducts.length, initialError, syncCatalog]);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return pickPromotionProducts(products, promo)
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
      });
  }, [products, q, filter, promo]);

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
      setToast({ variant: "danger", text: data?.message || "Could not add this item to your cart." });
      return;
    }
    setToast({ variant: "success", text: "Added to your cart." });
    setTimeout(() => setToast(null), 2200);
    window.dispatchEvent(new Event("cart:updated"));
  }

  function setPromoInUrl(nextPromo) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (nextPromo && nextPromo !== "all") params.set("promo", nextPromo);
    router.push(params.toString() ? `/promotions?${params}` : "/promotions");
  }

  const listFailed = Boolean(loadError) && products.length === 0 && !loading;
  const promoPool = useMemo(() => pickPromotionProducts(products, "all"), [products]);
  const listEmptyOk = !loading && !loadError && promoPool.length === 0;
  const filteredEmpty = !loading && !listFailed && promoPool.length > 0 && shown.length === 0;

  const { visible: listVisible, loadMore, hasMore, remaining } = useViewMore(shown, undefined, [
    q,
    filter,
    promo,
  ]);

  const selectClass =
    "w-full min-h-[2.125rem] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[2.75rem] sm:rounded-xl sm:px-3";

  const title =
    promo !== "all" ? getPromotionLabel(promo) : PROMOTION_PARENT_LABEL;

  return (
    <div className="min-w-0 space-y-4 overflow-x-clip pb-8 animate-fade-up sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-0.5 hidden text-sm text-slate-600 sm:block">
            {promo !== "all"
              ? `Deals and offers in ${getPromotionLabel(promo)}.`
              : "Seasonal sales, holiday events, and clearance — separate from regular departments."}
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 sm:min-h-[2.75rem] sm:rounded-xl sm:px-4"
        >
          ← Shop all
        </Link>
      </div>

      <nav
        className="flex w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain scrollbar-none pb-1"
        aria-label="Promotion categories"
      >
        {PROMOTION_CATEGORIES.map((c) => {
          const active = promo === c.value;
          const href =
            c.value === "all"
              ? "/promotions"
              : `/promotions?promo=${encodeURIComponent(c.value)}`;
          return (
            <Link
              key={c.value}
              href={href}
              className={active ? chipActive : chip}
              aria-current={active ? "page" : undefined}
            >
              {c.label}
            </Link>
          );
        })}
      </nav>

      <Card padding="p-3 sm:p-5" className="border-amber-100 bg-amber-50/40">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-2 sm:gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="min-w-0">
              <label htmlFor="promo-search" className="sr-only">
                Search promotions
              </label>
              <Input
                id="promo-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search promotions…"
                autoComplete="off"
                disabled={listFailed}
                className="py-2 sm:py-2.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 lg:contents">
              <select
                id="promo-filter-type"
                value={promo}
                onChange={(e) => setPromoInUrl(e.target.value)}
                aria-label="Promotion type"
                disabled={listFailed}
                className={`${selectClass} lg:w-56`}
              >
                {PROMOTION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <select
                id="promo-stock"
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
            <Button type="button" variant="outlineDark" size="sm" className="shrink-0 px-3" onClick={() => syncCatalog(true)}>
              Refresh
            </Button>
          </div>
        </div>
        <p className="mt-2 hidden text-xs text-amber-900/80 sm:block">
          {promoPool.length} item{promoPool.length === 1 ? "" : "s"} in promotions
          {promo !== "all" ? ` · showing ${shown.length} in ${getPromotionLabel(promo)}` : ""}
        </p>
      </Card>

      {toast ? (
        <Callout variant={toast.variant} className="animate-fade-up">
          {toast.text}
        </Callout>
      ) : null}

      {loadError && !loading ? (
        <Callout variant="danger">
          {loadError}
          <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => syncCatalog(true)}>
            Try again
          </Button>
        </Callout>
      ) : null}

      {loading ? (
        <div className={PRODUCT_GRID_CLASS}>
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : listFailed ? (
        <EmptyState title="Could not load promotions" description={loadError} />
      ) : listEmptyOk ? (
        <EmptyState
          title="No promotions yet"
          description="Check back soon — admins can assign products to Summer Sale, Clearance, and other campaigns."
        />
      ) : filteredEmpty ? (
        <EmptyState
          title="No matches"
          description={`No products in ${getPromotionLabel(promo)} match your filters.`}
        />
      ) : (
        <>
          <div className={PRODUCT_GRID_CLASS}>
            {listVisible.map((p) => (
              <ProductCard key={p._id} p={p} user={user} onAddToCart={addToCart} />
            ))}
          </div>
          {hasMore ? (
            <div className="flex justify-center pt-2">
              <ViewMoreButton onClick={loadMore} remaining={remaining} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
