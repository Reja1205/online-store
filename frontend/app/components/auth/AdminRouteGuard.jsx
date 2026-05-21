"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { isAdminUser } from "../../lib/roles";

function safeRedirectPath(path) {
  if (!path || typeof path !== "string") return "/admin";
  if (!path.startsWith("/") || path.startsWith("//")) return "/admin";
  return path;
}

export default function AdminRouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/admin");
      router.replace(`/login?redirect=${next}`);
      return;
    }
    if (!isAdminUser(user)) {
      router.replace("/profile");
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-slate-500" aria-busy="true">
        Checking admin access…
      </div>
    );
  }

  if (!user || !isAdminUser(user)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-slate-500" aria-busy="true">
        Redirecting…
      </div>
    );
  }

  return children;
}
