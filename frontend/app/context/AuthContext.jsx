"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiJson, API } from "../lib/api";

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { res, data } = await apiJson("/api/auth/me");

    if (res.status === 401) {
      setUser(null);
      return null;
    }

    const next = data?.user || null;
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setUser(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart:updated"));
    }
  }, []);

  useEffect(() => {
    function onAuthChanged() {
      void refreshUser();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("auth:changed", onAuthChanged);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth:changed", onAuthChanged);
      }
    };
  }, [refreshUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshUser();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const value = useMemo(
    () => ({ user, loading, refreshUser, logout }),
    [user, loading, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
