"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { apiJson, productName, productPrice, productStock } from "../../lib/api";

const linkSecondary =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50";

const linkPrimary =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-hover)]";

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
      <div className="mx-auto max-w-4xl space-y-4 py-6">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-slate-200" aria-hidden />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 sm:h-96" aria-hidden />
        <div className="h-6 w-2/3 animate-pulse rounded-lg bg-slate-200" aria-hidden />
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
          <Link href="/products" className={`${linkPrimary} mt-4 inline-flex`}>
            Back to catalog
          </Link>
        </Card>
      </div>
    );
  }

  const name = productName(p);
  const price = productPrice(p);
  const stock = productStock(p);
  const canAdd = !!user && stock > 0;
  const useNextImage = p.imageUrl && isAllowedImageHost(p.imageUrl);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 animate-fade-up">
      <Link
        href="/products"
        className="inline-flex text-sm font-medium text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline"
      >
        ← Back to catalog
      </Link>

      <Card className="overflow-hidden p-0" padding="p-0">
        <div className="relative aspect-[16/10] w-full bg-slate-100 sm:aspect-[2/1]">
          {p.imageUrl ? (
            useNextImage ? (
              <Image src={p.imageUrl} alt={name} fill className="object-cover" priority sizes="(max-width: 896px) 100vw, 896px" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={name} className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">No image</div>
          )}
        </div>

        <div className="space-y-4 p-5 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{name}</h1>
            <Badge tone={stock > 0 ? "success" : "danger"}>{stock > 0 ? `In stock · ${stock}` : "Out of stock"}</Badge>
          </div>

          <p className="text-2xl font-semibold text-indigo-600">${price}</p>

          {p.description ? (
            <p className="max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base">{p.description}</p>
          ) : (
            <p className="text-sm text-slate-400">No description provided.</p>
          )}

          {msg ? (
            <p role="status" className="text-sm text-emerald-700">
              {msg}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="button" variant="primary" size="md" disabled={!canAdd} onClick={addToCart}>
              Add to cart
            </Button>
            <Link href="/cart" className={linkSecondary}>
              View cart
            </Link>
          </div>
          {!user ? (
            <p className="text-xs text-slate-500">
              <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                Sign in
              </Link>{" "}
              to add this item to your cart.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
