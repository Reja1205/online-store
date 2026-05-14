"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadErrorDebug, setLoadErrorDebug] = useState("");
  const [toast, setToast] = useState(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  async function loadProducts() {
    setLoadError("");
    setLoadErrorDebug("");
    setToast(null);
    setLoading(true);
    const { res, data } = await apiJson("/api/products", { headers: {} });

    if (!res.ok) {
      setProducts([]);
      setLoadError(data?.message || "Something went wrong while loading the catalog.");
      setLoadErrorDebug(typeof data?.debug === "string" ? data.debug : "");
      setLoading(false);
      return;
    }

    const list = Array.isArray(data) ? data : data.products;
    setProducts(Array.isArray(list) ? list : []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();

    return products
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
  }, [products, q, filter]);

  async function addToCart(productId) {
    setToast(null);
    const { res, data } = await apiJson("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, qty: 1 }),
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

  return (
    <div className="space-y-6 pb-8 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Catalog</h1>
          <p className="mt-1 text-sm text-slate-600">Every product card is touch-friendly and responsive.</p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          ← Home
        </Link>
      </div>

      <Card padding="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="catalog-search" className="sr-only">
                Search products
              </label>
              <Input
                id="catalog-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search catalog…"
                autoComplete="off"
                disabled={listFailed}
              />
            </div>
            <select
              id="catalog-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter by availability"
              disabled={listFailed}
              className="w-full min-h-[2.75rem] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-48 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="all">All</option>
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
          <Button type="button" variant="outlineDark" size="md" className="w-full shrink-0 lg:w-auto" onClick={loadProducts}>
            Refresh
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:text-sm">
          <span>Matches</span>
          <Badge tone="neutral">{shown.length}</Badge>
        </div>
        {toast ? (
          <div className="mt-3">
            <Callout variant={toast.variant}>{toast.text}</Callout>
          </div>
        ) : null}
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <Button type="button" variant="primary" size="md" onClick={loadProducts}>
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
          title="No products yet"
          description="The catalog is empty. Check back later or contact the store administrator."
          actionLabel="Home"
          href="/"
        />
      ) : filteredEmpty ? (
        <EmptyState
          title="No matches"
          description="Try a different search or change the stock filter."
          actionLabel="Clear filters"
          onAction={() => {
            setQ("");
            setFilter("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p._id} p={p} user={user} onAddToCart={addToCart} />
          ))}
        </div>
      )}

    </div>
  );
}
