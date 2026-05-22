"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductColorSelect from "../../components/product/ProductColorSelect";
import ProductDeliveryInfo from "../../components/product/ProductDeliveryInfo";
import ProductReviews from "../../components/product/ProductReviews";
import ProductSizeSelect from "../../components/product/ProductSizeSelect";
import SimilarProductsCompare from "../../components/product/SimilarProductsCompare";
import StarRating from "../../components/product/StarRating";
import WishlistButton from "../../components/product/WishlistButton";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { compactOptionSelectClass } from "../../components/product/ProductSizeSelect";
import { useAuth } from "../../context/AuthContext";
import { apiJson, productDiscountLabel, productHasDiscount, productName } from "../../lib/api";
import ProductPrice from "../../components/product/ProductPrice";
import { getCategoryLabel } from "../../lib/categories";
import { productHasColors } from "../../lib/colors";
import {
  productHasSizes,
  productTotalStock,
  stockForSize,
} from "../../lib/sizes";

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
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

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

    const { res, data } = await apiJson(`/api/products/${productId}`, {
      headers: {},
      perfLabel: "product-detail",
    });

    if (!res.ok) {
      setError(data?.message || "Failed to load product");
      setP(null);
      setLoading(false);
      return;
    }

    setP(data?.product || null);
    setSimilarProducts(Array.isArray(data?.similarProducts) ? data.similarProducts : []);
    setReviewSummary(data?.reviewSummary || { count: 0, averageRating: 0 });
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProduct(id);
  }, [id, loadProduct]);

  useEffect(() => {
    if (!p) return;
    const available =
      productHasSizes(p) && selectedSize
        ? stockForSize(p, selectedSize)
        : productTotalStock(p);
    const cap = available > 0 ? Math.min(99, available) : 1;
    if (quantity > cap) setQuantity(cap);
  }, [p, selectedSize, quantity]);

  async function addToCart() {
    if (!p?._id) return;
    if (productHasSizes(p) && !selectedSize) {
      setMsg("Please select a size");
      return;
    }
    if (productHasColors(p) && !selectedColor) {
      setMsg("Please select a color");
      return;
    }
    const qty = Math.max(1, Number(quantity) || 1);
    const available =
      productHasSizes(p) && selectedSize
        ? stockForSize(p, selectedSize)
        : productTotalStock(p);
    if (qty > available) {
      setMsg(`Only ${available} available in stock`);
      return;
    }
    setMsg("");
    const { res, data } = await apiJson("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({
        productId: p._id,
        qty,
        ...(selectedSize ? { size: selectedSize } : {}),
        ...(selectedColor ? { color: selectedColor } : {}),
      }),
    });
    if (!res.ok) {
      setMsg(data?.message || "Could not add to cart");
      return;
    }
    setMsg(qty === 1 ? "Added to cart" : `Added ${qty} to cart`);
    window.dispatchEvent(new Event("cart:updated"));
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-4 py-6">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-slate-200" aria-hidden />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/80" aria-hidden />
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
          <Link
            href="/products"
            className="mt-4 inline-flex min-h-[2.75rem] items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to catalog
          </Link>
        </Card>
      </div>
    );
  }

  const name = productName(p);
  const discounted = productHasDiscount(p);
  const discountLabel = productDiscountLabel(p);
  const hasSizes = productHasSizes(p);
  const hasColors = productHasColors(p);
  const stock =
    hasSizes && selectedSize ? stockForSize(p, selectedSize) : productTotalStock(p);
  const maxQty = stock > 0 ? Math.min(99, stock) : 1;
  const variantsReady =
    (!hasSizes || Boolean(selectedSize)) && (!hasColors || Boolean(selectedColor));
  const canAdd = stock > 0 && variantsReady && quantity >= 1 && quantity <= maxQty;
  const useNextImage = p.imageUrl && isAllowedImageHost(p.imageUrl);

  const qtySelectClass = `${compactOptionSelectClass} max-w-[5rem]`;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-6 overflow-x-clip pb-10 animate-fade-up lg:space-y-8">
      <Link
        href="/products"
        className="inline-flex text-sm font-medium text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline"
      >
        ← Back to catalog
      </Link>

      <Card className="overflow-hidden p-0" padding="p-0">
        <div className="flex min-h-0 flex-col lg:min-h-[min(36rem,calc(100dvh-11rem))] lg:flex-row">
          {/* Left: product image */}
          <div className="relative w-full shrink-0 border-b border-slate-100 bg-slate-50 lg:min-h-[min(36rem,calc(100dvh-11rem))] lg:w-1/2 lg:border-b-0 lg:border-r xl:w-[52%]">
            <div className="relative aspect-square w-full lg:absolute lg:inset-0 lg:aspect-auto">
              {p.imageUrl ? (
                useNextImage ? (
                  <Image
                    src={p.imageUrl}
                    alt={name}
                    fill
                    className="object-contain p-6"
                    priority
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={name}
                    className="h-full w-full object-contain p-6"
                  />
                )
              ) : (
                <div className="flex h-full min-h-[16rem] items-center justify-center text-slate-400">
                  No image
                </div>
              )}
              {p.bestSeller ? (
                <span className="absolute left-4 top-4 rounded bg-amber-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  Best Seller
                </span>
              ) : null}
              {discounted && discountLabel ? (
                <span className="absolute left-4 top-12 rounded bg-rose-700 px-2 py-0.5 text-xs font-bold text-white">
                  {discountLabel}
                </span>
              ) : null}
            </div>
          </div>

          {/* Right: title, ratings, price, variants, CTA */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-6 lg:justify-center lg:p-8 xl:p-10">
            {p.category ? (
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {getCategoryLabel(p.category)}
              </p>
            ) : null}

            <h1 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
              {name}
            </h1>

            <StarRating
              rating={reviewSummary.averageRating}
              count={reviewSummary.count}
              size="lg"
              reviewHref="#reviews"
            />

            {reviewSummary.count > 0 ? (
              <p className="text-xs text-slate-500">Popular choice this season</p>
            ) : null}

            <ProductPrice
              product={p}
              size="lg"
              showPromotionName
              className="gap-3"
            />

            {p.description ? (
              <p className="max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base">
                {p.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400">No description provided.</p>
            )}

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                {hasSizes ? (
                  <div className="shrink-0">
                    <p className="mb-1 text-xs font-medium text-slate-700">Size</p>
                    <ProductSizeSelect
                      product={p}
                      value={selectedSize}
                      compact
                      onChange={(size) => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                    />
                  </div>
                ) : null}
                {hasColors ? (
                  <div className="shrink-0">
                    <p className="mb-1 text-xs font-medium text-slate-700">Color</p>
                    <ProductColorSelect
                      product={p}
                      value={selectedColor}
                      onChange={setSelectedColor}
                      layout="select"
                      compact
                    />
                  </div>
                ) : null}
                <div className="shrink-0">
                  <label htmlFor="product-qty" className="mb-1 block text-xs font-medium text-slate-700">
                    Qty
                  </label>
                  <select
                    id="product-qty"
                    value={Math.min(quantity, maxQty)}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    disabled={stock <= 0 || !variantsReady}
                    className={qtySelectClass}
                    aria-label="Quantity"
                  >
                    {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {stock > 0 && variantsReady ? (
                <p className="text-xs text-slate-500">Max {maxQty} per order</p>
              ) : hasSizes && !selectedSize ? (
                <p className="text-xs text-slate-500">Select a size to choose quantity</p>
              ) : hasColors && !selectedColor ? (
                <p className="text-xs text-slate-500">Select a color to choose quantity</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={stock > 0 ? "success" : "danger"}>
                  {stock > 0
                    ? hasSizes && selectedSize
                      ? `${selectedSize}${selectedColor ? ` · ${selectedColor}` : ""} · ${stock} in stock`
                      : `In stock · ${stock}`
                    : "Out of stock"}
                </Badge>
              </div>
            </div>

            {msg ? (
              <p
                role="status"
                className={`text-sm font-medium ${
                  msg.includes("Added") ? "text-emerald-700" : "text-amber-800"
                }`}
              >
                {msg}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                disabled={!canAdd}
                onClick={addToCart}
                className="inline-flex min-h-[2.75rem] min-w-[10rem] items-center justify-center rounded-full bg-amber-400 px-8 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to cart
              </button>
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
                to save to wishlist or leave a review. Guest checkout is available.
              </p>
            ) : null}

            <div className="mt-2 border-t border-slate-100 pt-4">
              <ProductDeliveryInfo product={p} />
            </div>
          </div>
        </div>
      </Card>

      <SimilarProductsCompare currentProduct={p} similarProducts={similarProducts} />

      <div id="reviews">
        <ProductReviews productId={p._id} user={user} initialSummary={reviewSummary} />
      </div>
    </div>
  );
}
