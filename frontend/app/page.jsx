"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard from "./components/ProductCard";
import { PRODUCT_GRID_CLASS } from "./lib/productGrid";
import HomeCarousel from "./components/HomeCarousel";
import ProductSection from "./components/ProductSection";
import Badge from "./components/ui/Badge";
import Button from "./components/ui/Button";
import Callout from "./components/ui/Callout";
import Card from "./components/ui/Card";
import EmptyState from "./components/ui/EmptyState";
import Input from "./components/ui/Input";
import { ProductCardSkeleton } from "./components/ui/Skeleton";
import { useAuth } from "./context/AuthContext";
import { apiJson } from "./lib/api";
import { pickBestSellers, pickFeatured, pickOnSale } from "./lib/productSections";
const PAGE_SIZE = 8;

export default function Home() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [catalogLoadError, setCatalogLoadError] = useState("");
  const [cartFeedback, setCartFeedback] = useState(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [page, setPage] = useState(1);

  const loadProducts = useCallback(async () => {
    setCatalogLoadError("");
    setLoadingProducts(true);

    const { res, data } = await apiJson("/api/products", { headers: {} });

    if (!res.ok) {
      setProducts([]);
      setCatalogLoadError(data?.message || "We couldn’t load the catalog. Please try again.");
      setLoadingProducts(false);
      return;
    }

    const list = Array.isArray(data) ? data : data.products;
    setProducts(Array.isArray(list) ? list : []);
    setLoadingProducts(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [q, filter]);

  const addToCart = useCallback(async (productId) => {
    setCartFeedback(null);

    const { res, data } = await apiJson("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty: 1 }),
    });

    if (!res.ok) {
      setCartFeedback({
        variant: "danger",
        text: data?.message || "We couldn’t add that item. Sign in or try again.",
      });
      return;
    }

    setCartFeedback({ variant: "success", text: "Added to your cart." });
    setTimeout(() => setCartFeedback(null), 2200);
    window.dispatchEvent(new Event("cart:updated"));
  }, []);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();

    return products
      .filter((p) => {
        const name = String(p?.name ?? p?.title ?? "").toLowerCase();
        const desc = String(p?.description ?? "").toLowerCase();
        return !query || name.includes(query) || desc.includes(query);
      })
      .filter((p) => {
        const stock = Number(p?.stock ?? p?.stockQty ?? 0) || 0;
        if (filter === "in") return stock > 0;
        if (filter === "out") return stock <= 0;
        return true;
      });
  }, [products, q, filter]);

  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return shown.slice(start, start + PAGE_SIZE);
  }, [shown, currentPage]);

  const bestSellers = useMemo(() => pickBestSellers(products), [products]);
  const featuredProducts = useMemo(() => pickFeatured(products), [products]);
  const saleProducts = useMemo(() => pickOnSale(products), [products]);

  const catalogDown = !loadingProducts && Boolean(catalogLoadError) && products.length === 0;
  const catalogEmptyOk = !loadingProducts && !catalogLoadError && products.length === 0;
  const catalogFilteredEmpty =
    !loadingProducts && !catalogDown && products.length > 0 && shown.length === 0;

  return (
    <div className="space-y-8 lg:space-y-10">
      <section
        id="hero"
        className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 scroll-mt-36"
        aria-label="Hero promotions"
      >
        <HomeCarousel products={products} loading={false} />
      </section>

      {cartFeedback ? (
        <Callout variant={cartFeedback.variant}>{cartFeedback.text}</Callout>
      ) : null}

      <ProductSection
        id="best-sellers"
        title="Best Sellers"
        subtitle="Customer favorites and top picks this season."
        viewAllHref="/products?section=best-seller"
        products={bestSellers}
        loading={loadingProducts}
        user={user}
        onAddToCart={addToCart}
        accent="amber"
      />

      <ProductSection
        id="featured-products"
        title="Featured Products"
        subtitle="Hand-picked highlights from our catalog."
        viewAllHref="/products?section=featured"
        products={featuredProducts}
        loading={loadingProducts}
        user={user}
        onAddToCart={addToCart}
        accent="indigo"
      />

      <ProductSection
        id="special-sale"
        title="Special Sale"
        subtitle="Limited-time deals — save while stock lasts."
        viewAllHref="/products?section=sale"
        products={saleProducts}
        loading={loadingProducts}
        user={user}
        onAddToCart={addToCart}
        accent="rose"
      />

      <Card className="shadow-md" padding="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="home-search" className="sr-only">
                Search products
              </label>
              <Input
                id="home-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or description…"
                autoComplete="off"
                disabled={catalogDown}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="home-filter" className="sr-only">
                Filter by stock
              </label>
              <select
                id="home-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full min-h-[2.75rem] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-44 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={catalogDown}
              >
                <option value="all">All products</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>
            </div>
          </div>
          <Button type="button" variant="outlineDark" size="md" className="w-full shrink-0 lg:w-auto" onClick={loadProducts}>
            Refresh catalog
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-600 sm:text-sm">
          <span>Showing</span>
          <Badge tone="neutral">{shown.length}</Badge>
          <span>products</span>
          {shown.length > PAGE_SIZE ? (
            <>
              <span className="text-slate-400">·</span>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </>
          ) : null}
        </div>
      </Card>

      <section className="scroll-mt-28 space-y-6" aria-labelledby="catalog-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="catalog-heading" className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Shop all products
            </h2>
            <p className="mt-1 text-sm text-slate-600">Search, filter, and browse the full catalog.</p>
          </div>
        </div>

        {loadingProducts ? (
          <div className={`mt-6 ${PRODUCT_GRID_CLASS}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : catalogDown ? (
          <div className="mt-6 space-y-4">
            <Callout variant="danger" title="We couldn’t load products">
              <p>{catalogLoadError}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="primary" size="md" onClick={loadProducts}>
                  Try again
                </Button>
                <Link
                  href="/products"
                  className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  Catalog page
                </Link>
              </div>
            </Callout>
          </div>
        ) : catalogEmptyOk ? (
          <div className="mt-6">
            <EmptyState
              title="Catalog is empty"
              description="There are no products to show yet. Check back later."
              actionLabel="Refresh"
              onAction={loadProducts}
            />
          </div>
        ) : catalogFilteredEmpty ? (
          <div className="mt-6">
            <EmptyState
              title="No products match"
              description="Try another search or clear filters to see everything in the catalog."
              actionLabel="View all products"
              href="/products"
            />
          </div>
        ) : (
          <>
            <div className={`mt-6 ${PRODUCT_GRID_CLASS}`}>
              {pageSlice.map((p) => (
                <ProductCard key={p._id} p={p} user={user} onAddToCart={addToCart} />
              ))}
            </div>
            {totalPages > 1 ? (
              <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Catalog pagination">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="px-2 text-sm text-slate-600">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </nav>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
