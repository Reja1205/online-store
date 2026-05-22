"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ProductAmazonPricing from "../../components/product/ProductAmazonPricing";
import ProductBuyBox from "../../components/product/ProductBuyBox";
import ProductColorSelect from "../../components/product/ProductColorSelect";
import ProductDetailsAccordion from "../../components/product/ProductDetailsAccordion";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import ProductReviews from "../../components/product/ProductReviews";
import ProductSizeGrid from "../../components/product/ProductSizeGrid";
import SimilarProductsCompare from "../../components/product/SimilarProductsCompare";
import StarRating from "../../components/product/StarRating";
import WishlistButton from "../../components/product/WishlistButton";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { apiJson, productName } from "../../lib/api";
import { getCategoryLabel, normalizeCategorySlug } from "../../lib/categories";
import { productColorOptions, productHasColors } from "../../lib/colors";
import { SITE_NAME } from "../../lib/site";
import {
  productHasSizes,
  productTotalStock,
  stockForSize,
} from "../../lib/sizes";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
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
  const [buying, setBuying] = useState(false);

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

  async function addToCartInternal() {
    if (!p?._id) return false;
    if (productHasSizes(p) && !selectedSize) {
      setMsg("Please select a size");
      return false;
    }
    if (productHasColors(p) && !selectedColor) {
      setMsg("Please select a color");
      return false;
    }
    const qty = Math.max(1, Number(quantity) || 1);
    const available =
      productHasSizes(p) && selectedSize
        ? stockForSize(p, selectedSize)
        : productTotalStock(p);
    if (qty > available) {
      setMsg(`Only ${available} available in stock`);
      return false;
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
      return false;
    }
    setMsg(qty === 1 ? "Added to cart" : `Added ${qty} to cart`);
    window.dispatchEvent(new Event("cart:updated"));
    return true;
  }

  async function addToCart() {
    await addToCartInternal();
  }

  async function buyNow() {
    setBuying(true);
    const ok = await addToCartInternal();
    setBuying(false);
    if (ok) router.push("/checkout");
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-4 px-4 py-6 sm:px-6">
        <div className="h-4 w-64 animate-pulse rounded bg-slate-200" aria-hidden />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="h-[420px] animate-pulse rounded-lg bg-slate-200/80 lg:col-span-5" />
          <div className="h-96 animate-pulse rounded-lg bg-slate-200/80 lg:col-span-4" />
          <div className="h-80 animate-pulse rounded-lg bg-slate-200/80 lg:col-span-3" />
        </div>
        <p className="sr-only">Loading product</p>
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
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
  const hasSizes = productHasSizes(p);
  const hasColors = productHasColors(p);
  const colors = productColorOptions(p);
  const stock =
    hasSizes && selectedSize ? stockForSize(p, selectedSize) : productTotalStock(p);
  const maxQty = stock > 0 ? Math.min(99, stock) : 1;
  const variantsReady =
    (!hasSizes || Boolean(selectedSize)) && (!hasColors || Boolean(selectedColor));
  const canAdd = stock > 0 && variantsReady && quantity >= 1 && quantity <= maxQty;
  const categorySlug = normalizeCategorySlug(p.category);
  const categoryHref =
    categorySlug && categorySlug !== "all"
      ? `/products?category=${encodeURIComponent(categorySlug)}`
      : "/products";

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] overflow-x-clip px-4 pb-12 pt-4 animate-fade-up sm:px-6">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-xs text-slate-600" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="text-sky-700 hover:text-sky-900 hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden className="text-slate-400">
            ›
          </li>
          <li>
            <Link href="/products" className="text-sky-700 hover:text-sky-900 hover:underline">
              Shop
            </Link>
          </li>
          {p.category ? (
            <>
              <li aria-hidden className="text-slate-400">
                ›
              </li>
              <li>
                <Link
                  href={categoryHref}
                  className="text-sky-700 hover:text-sky-900 hover:underline"
                >
                  {getCategoryLabel(p.category)}
                </Link>
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      {/* Amazon-style 3-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left: gallery */}
        <div className="lg:col-span-5">
          <ProductImageGallery
            product={p}
            name={name}
            colors={colors}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
        </div>

        {/* Center: title, price, variants */}
        <div className="min-w-0 space-y-4 lg:col-span-4">
          <Link
            href={categoryHref}
            className="text-sm text-sky-700 hover:text-sky-900 hover:underline"
          >
            Visit the {SITE_NAME} Store
          </Link>

          <h1 className="text-xl font-normal leading-snug text-slate-900 sm:text-2xl">
            {name}
          </h1>

          <StarRating
            rating={reviewSummary.averageRating}
            count={reviewSummary.count}
            size="lg"
            reviewHref="#reviews"
          />

          {p.bestSeller ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded bg-[#c45500] px-2 py-0.5 text-xs font-bold text-white">
                #1 Best Seller
              </span>
              {p.category ? (
                <Link href={categoryHref} className="text-sky-700 hover:underline">
                  in {getCategoryLabel(p.category)}
                </Link>
              ) : null}
            </div>
          ) : null}

          {reviewSummary.count > 0 ? (
            <p className="text-sm font-semibold text-slate-900">
              {reviewSummary.count >= 1000
                ? `${Math.floor(reviewSummary.count / 1000)}K+`
                : reviewSummary.count}{" "}
              bought in past month
            </p>
          ) : null}

          <ProductAmazonPricing product={p} />

          {hasColors ? (
            <ProductColorSelect
              product={p}
              value={selectedColor}
              onChange={setSelectedColor}
              layout="swatches"
              label="Color"
              showLabel
            />
          ) : null}

          {hasSizes ? (
            <ProductSizeGrid
              product={p}
              value={selectedSize}
              onChange={(size) => {
                setSelectedSize(size);
                setQuantity(1);
              }}
            />
          ) : null}

          {p.shortDescription ? (
            <p className="text-sm leading-relaxed text-slate-700">{p.shortDescription}</p>
          ) : null}

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

          <div className="flex flex-wrap items-center gap-3 lg:hidden">
            <WishlistButton productId={p._id} user={user} />
          </div>

          {!user ? (
            <p className="text-xs text-slate-500">
              <Link href="/login" className="font-medium text-sky-700 hover:underline">
                Sign in
              </Link>{" "}
              to save to wishlist or leave a review.
            </p>
          ) : null}
        </div>

        {/* Right: buy box (desktop) */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <ProductBuyBox
              product={p}
              quantity={quantity}
              maxQty={maxQty}
              stock={stock}
              variantsReady={variantsReady}
              canAdd={canAdd}
              paying={buying}
              onQuantityChange={setQuantity}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
            />
            <div className="mt-3 hidden lg:flex">
              <WishlistButton productId={p._id} user={user} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile buy box duplicate below main grid — only one buy box on mobile in col 3 actually shows on mobile too since grid is 1 col. Good. */}

      <div className="mt-10 space-y-10">
        <ProductDetailsAccordion product={p} />
        <SimilarProductsCompare currentProduct={p} similarProducts={similarProducts} />
        <div id="reviews">
          <ProductReviews productId={p._id} user={user} initialSummary={reviewSummary} />
        </div>
      </div>
    </div>
  );
}
