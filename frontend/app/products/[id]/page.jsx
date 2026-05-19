"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductDeliveryInfo from "../../components/product/ProductDeliveryInfo";
import ProductReviews from "../../components/product/ProductReviews";
import SimilarProductsCompare from "../../components/product/SimilarProductsCompare";
import WishlistButton from "../../components/product/WishlistButton";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import {
  apiJson,
  productDisplayPrice,
  productIsOnSale,
  productName,
  productPrice,
  productStock,
} from "../../lib/api";
import { getCategoryLabel } from "../../lib/categories";

const linkSecondary =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50";

function isAllowedImageHost(src) {
  try {
    const u = new URL(src);
    if (u.protocol !== "https:") return false;
    return ["res.cloudinary.com", "images.unsplash.com", "placehold.co"].includes(u.hostname);
  } catch {
    return false;
  }
}

function StarSummary({ rating, count }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
      <span className="text-amber-500" aria-hidden>
        ★
      </span>
      <span className="font-medium text-slate-800">{rating}</span>
      <span>({count} reviews)</span>
    </span>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();

  const [p, setP] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ count: 0, averageRating: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const loadProduct = useCallback(async (productId) => {
    setError("");
    setLoading(true);
    setMsg("");

    if (!productId || typeof productId !== "string") {
      setError("Invalid product id");
      setP(null);
      setLoading(false);
      return;
    }

    const { res, data } = await apiJson(`/api/products/${productId}`, { headers: {} });

    if (!res.ok) {
      setError(data?.message || "Failed to load product");
      setP(null);
      setLoading(false);
      return;
    }

    setP(data?.product || null);
    setSimilarProducts(Array.isArray(data?.similarProducts) ? data.similarProducts : []);
    setReviewSummary(data?.reviewSummary || { count: 0, averageRating: 0 });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProduct(id);
  }, [id, loadProduct]);

  async function addToCart() {
    if (!p?._id) return;
    setMsg("");
    const { res, data } = await apiJson("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId: p._id, qty: 1 }),
    });
    if (!res.ok) {
      setMsg(data?.message || "Could not add to cart");
      return;
    }
    setMsg("Added to cart");
    window.dispatchEvent(new Event("cart:updated"));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 py-6">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-slate-200" aria-hidden />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 sm:h-96" aria-hidden />
        <p className="sr-only">Loading product</p>
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <Card>
          <p role="alert" className="font-medium text-red-700">
            {error || "Product not found"}
          </p>
          <Link href="/products" className="mt-4 inline-flex min-h-[2.75rem] items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
            Back to catalog
          </Link>
        </Card>
      </div>
    );
  }

  const name = productName(p);
  const price = productPrice(p);
  const displayPrice = productDisplayPrice(p);
  const onSale = productIsOnSale(p);
  const stock = productStock(p);
  const canAdd = !!user && stock > 0;
  const useNextImage = p.imageUrl && isAllowedImageHost(p.imageUrl);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 animate-fade-up">
      <Link
        href="/products"
        className="inline-flex text-sm font-medium text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline"
      >
        ← Back to catalog
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <Card className="overflow-hidden p-0" padding="p-0">
          <div className="relative aspect-[16/10] w-full bg-slate-100 sm:aspect-[2/1]">
            {p.imageUrl ? (
              useNextImage ? (
                <Image
                  src={p.imageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 720px"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={name} className="h-full w-full object-cover" />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No image</div>
            )}
            {onSale ? (
              <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white">
                Sale
              </span>
            ) : null}
          </div>

          <div className="space-y-4 p-5 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{name}</h1>
                {p.category ? (
                  <p className="mt-1 text-sm text-slate-500">{getCategoryLabel(p.category)}</p>
                ) : null}
                <div className="mt-2">
                  <StarSummary rating={reviewSummary.averageRating} count={reviewSummary.count} />
                </div>
              </div>
              <Badge tone={stock > 0 ? "success" : "danger"}>
                {stock > 0 ? `In stock · ${stock}` : "Out of stock"}
              </Badge>
            </div>

            <p className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-semibold text-indigo-600">${displayPrice.toFixed(2)}</span>
              {onSale ? (
                <span className="text-lg text-slate-400 line-through">${price.toFixed(2)}</span>
              ) : null}
            </p>

            {p.description ? (
              <p className="max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base">{p.description}</p>
            ) : (
              <p className="text-sm text-slate-400">No description provided.</p>
            )}

            {msg ? (
              <p role="status" className="text-sm font-medium text-emerald-700">
                {msg}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="button" variant="primary" size="md" disabled={!canAdd} onClick={addToCart}>
                Add to cart
              </Button>
              <WishlistButton productId={p._id} user={user} />
              <Link href="/cart" className={linkSecondary}>
                View cart
              </Link>
            </div>
            {!user ? (
              <p className="text-xs text-slate-500">
                <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                  Sign in
                </Link>{" "}
                to add to cart, save to wishlist, or leave a review.
              </p>
            ) : null}
          </div>
        </Card>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <ProductDeliveryInfo product={p} />
        </aside>
      </div>

      <SimilarProductsCompare currentProduct={p} similarProducts={similarProducts} />

      <ProductReviews productId={p._id} user={user} initialSummary={reviewSummary} />
    </div>
  );
}
