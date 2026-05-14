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
    <>
      <div className="sticky top-0 z-50 border-b border-slate-200/80 bg-[var(--color-bg)]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--color-bg)]/75">
        <Container className="py-3">
          <Header cartCount={cartCount} />
        </Container>
      </div>
      <div className="flex-1 pb-10 pt-6 sm:pt-8">
        <Container>{children}</Container>
      </div>
    </>
  );
}

export default function AppShell({ children }) {
  return (
    <AuthProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <ShellContent>{children}</ShellContent>
      </div>
    </AuthProvider>
  );
}
