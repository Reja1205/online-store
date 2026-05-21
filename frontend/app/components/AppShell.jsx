"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import HeaderTicker from "./HeaderTicker";
import Container from "./ui/Container";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { apiJson } from "../lib/api";

function ShellContent({ children }) {
  const { user, loading } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // Stable primitive for effect deps — changes once when auth finishes (avoids varying dep array size)
  const authSettledKey = loading ? null : user?._id ?? "guest";

  const loadCartCount = useCallback(async () => {
    const { res, data } = await apiJson("/api/cart");

    if (!res.ok) {
      setCartCount(0);
      return;
    }

    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.cart?.items)
        ? data.cart.items
        : [];

    const totalQty = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
    setCartCount(totalQty);
  }, []);

  // PERF: defer cart API until auth resolves — avoids competing with catalog on first paint
  useEffect(() => {
    if (authSettledKey === null) return;
    loadCartCount();
  }, [authSettledKey, loadCartCount]);

  useEffect(() => {
    function onCartUpdated() {
      loadCartCount();
    }
    window.addEventListener("cart:updated", onCartUpdated);
    return () => window.removeEventListener("cart:updated", onCartUpdated);
  }, [loadCartCount]);

  return (
    <div className="flex min-h-0 w-full min-w-0 max-w-full flex-col overflow-x-clip">
      <div className="sticky top-0 z-40 w-full min-w-0 max-w-full shrink-0 overflow-x-clip shadow-md shadow-indigo-900/10">
        <Header cartCount={cartCount} />
        <HeaderTicker />
      </div>

      <main className="relative z-0 w-full min-w-0 max-w-full overflow-x-clip bg-[var(--color-bg)] pb-2">
        <Container className="min-w-0 pb-4 pt-0 sm:pb-6 lg:pb-8">{children}</Container>
      </main>
    </div>
  );
}

export default function AppShell({ children }) {
  return (
    <AuthProvider>
      <ShellContent>{children}</ShellContent>
    </AuthProvider>
  );
}
