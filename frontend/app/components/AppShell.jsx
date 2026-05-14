"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import Container from "./ui/Container";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { apiJson } from "../lib/api";

function ShellContent({ children }) {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = useCallback(async () => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      setCartCount(0);
      return;
    }

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

  useEffect(() => {
    loadCartCount();
  }, [user, loadCartCount]);

  useEffect(() => {
    function onCartUpdated() {
      loadCartCount();
    }
    window.addEventListener("cart:updated", onCartUpdated);
    return () => window.removeEventListener("cart:updated", onCartUpdated);
  }, [loadCartCount]);

  return (
    <div className="flex w-full max-w-full flex-col">
      <div className="sticky top-0 z-40 shrink-0 border-b border-slate-200 bg-white shadow-sm">
        <Container className="py-3 sm:py-3.5">
          <Header cartCount={cartCount} />
        </Container>
      </div>

      <main className="relative z-0 w-full overflow-x-clip bg-[var(--color-bg)] pb-2">
        <Container className="py-6 sm:py-8 lg:py-10">{children}</Container>
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
