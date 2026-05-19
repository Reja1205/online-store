"use client";

import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../../lib/api";
import {
  isInGuestWishlist,
  readGuestWishlist,
  toggleGuestWishlist,
  writeGuestWishlist,
} from "../../lib/wishlist";

export default function WishlistButton({ productId, user, className = "" }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");

  const syncState = useCallback(async () => {
    if (!productId) return;
    if (!user) {
      setSaved(isInGuestWishlist(productId));
      return;
    }
    const { res, data } = await apiJson("/api/wishlist");
    if (!res.ok) {
      setSaved(isInGuestWishlist(productId));
      return;
    }
    const ids = (data?.productIds || []).map(String);
    setSaved(ids.includes(String(productId)));
    writeGuestWishlist(ids);
  }, [productId, user]);

  useEffect(() => {
    syncState();
  }, [syncState]);

  useEffect(() => {
    function onUpdate() {
      if (!user) setSaved(isInGuestWishlist(productId));
    }
    window.addEventListener("wishlist:updated", onUpdate);
    return () => window.removeEventListener("wishlist:updated", onUpdate);
  }, [productId, user]);

  async function toggle() {
    if (!productId || busy) return;
    setBusy(true);
    setHint("");

    if (!user) {
      const added = toggleGuestWishlist(productId);
      setSaved(added);
      setHint(added ? "Saved to wishlist on this device." : "Removed from wishlist.");
      setBusy(false);
      setTimeout(() => setHint(""), 2500);
      return;
    }

    if (saved) {
      const { res, data } = await apiJson(`/api/wishlist/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        setHint(data?.message || "Could not update wishlist.");
        setBusy(false);
        return;
      }
      setSaved(false);
      setHint("Removed from wishlist.");
      writeGuestWishlist(data?.productIds || readGuestWishlist().filter((id) => id !== String(productId)));
    } else {
      const { res, data } = await apiJson("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        setHint(data?.message || "Could not update wishlist.");
        setBusy(false);
        return;
      }
      setSaved(true);
      setHint("Added to wishlist.");
      if (data?.productIds) writeGuestWishlist(data.productIds);
    }

    window.dispatchEvent(new Event("wishlist:updated"));
    setBusy(false);
    setTimeout(() => setHint(""), 2500);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy}
        className={`inline-flex min-h-[2.75rem] cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
          saved
            ? "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
            : "border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
        }`}
        aria-pressed={saved}
      >
        <span aria-hidden>{saved ? "♥" : "♡"}</span>
        {busy ? "Updating…" : saved ? "In wishlist" : "Add to wishlist"}
      </button>
      {hint ? (
        <p role="status" className="mt-2 text-xs text-slate-600">
          {hint}
          {!user ? " Sign in to sync across devices." : null}
        </p>
      ) : null}
    </div>
  );
}
