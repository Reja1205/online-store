// Catalog fetch + in-memory cache (SWR-style dedupe). Used by server and client.

import { API, apiJson } from "./api";

const CACHE_TTL_MS = 60_000;
const catalogCache = new Map();
const inflight = new Map();

function cacheKey({ full = false } = {}) {
  return full ? "catalog:full" : "catalog";
}

function readCache(key) {
  const hit = catalogCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    catalogCache.delete(key);
    return null;
  }
  return hit.data;
}

function writeCache(key, data) {
  catalogCache.set(key, { at: Date.now(), data });
}

/** Normalize list API payload (supports legacy array-only responses). */
export function normalizeProductsResponse(data) {
  const list = Array.isArray(data) ? data : data?.products;
  const products = Array.isArray(list) ? list : [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: products.length,
    total: products.length,
    pages: 1,
  };
  return { products, pagination };
}

function buildProductsPath({ full = false, limit = 200 } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (full) params.set("full", "1");
  return `/api/products?${params}`;
}

/**
 * Server-side catalog fetch (Next.js RSC). Runs during SSR so HTML includes product data.
 * PERF: avoids client-only waterfall (hydrate → useEffect → API).
 */
export async function fetchProductsCatalogServer(options = {}) {
  const { full = false, limit = 200, revalidate = 60 } = options;
  const path = buildProductsPath({ full, limit });
  const url = `${API}${path}`;

  try {
    const started = typeof performance !== "undefined" ? performance.now() : 0;
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    const data = await res.json().catch(() => ({}));

    if (process.env.NODE_ENV === "development" && typeof performance !== "undefined") {
      console.log(
        `[PERF] SSR fetchProductsCatalog ${res.status} ${(performance.now() - started).toFixed(0)}ms`
      );
    }

    if (!res.ok) {
      return {
        ok: false,
        products: [],
        pagination: { page: 1, limit: 0, total: 0, pages: 1 },
        message: data?.message || "Failed to load catalog",
      };
    }

    const { products, pagination } = normalizeProductsResponse(data);
    return { ok: true, products, pagination, message: "" };
  } catch (err) {
    return {
      ok: false,
      products: [],
      pagination: { page: 1, limit: 0, total: 0, pages: 1 },
      message: err?.message || "Failed to load catalog",
    };
  }
}

/**
 * Client catalog fetch with dedupe + TTL cache.
 * @param {{ force?: boolean, full?: boolean }} opts
 */
export async function fetchProductsCatalogClient(opts = {}) {
  const { force = false, full = false } = opts;
  const key = cacheKey({ full });

  if (!force) {
    const cached = readCache(key);
    if (cached) return { ...cached, fromCache: true };
  }

  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const promise = (async () => {
    const path = buildProductsPath({ full, limit: 200 });
    const { res, data } = await apiJson(path, {
      headers: {},
      cache: "default",
      perfLabel: "catalog",
    });

    const result = normalizeProductsResponse(data);

    if (!res.ok) {
      return {
        ok: false,
        products: [],
        pagination: result.pagination,
        message: data?.message || "Failed to load catalog",
        fromCache: false,
      };
    }

    const payload = {
      ok: true,
      products: result.products,
      pagination: result.pagination,
      message: "",
      fromCache: false,
    };
    writeCache(key, payload);
    return payload;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

/** Clear client cache after admin mutations. */
export function invalidateProductsCatalog() {
  catalogCache.clear();
}
