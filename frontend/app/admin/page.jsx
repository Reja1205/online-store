"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const API = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  }, []);

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchMe() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    const data = await res.json();
    if (!data?.user || data.user.role !== "admin") {
      router.push("/profile");
      return;
    }

    setMe(data.user);
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchMe();
      } catch {
        setError("Failed to load admin page");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  if (loading) return <div style={{ padding: 20 }}>Loading admin dashboard...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>Admin Dashboard</h1>

      {me && (
        <p style={{ marginTop: 0 }}>
          Welcome <b>{me.name}</b> ({me.email}) — role: <b>{me.role}</b>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <button
          onClick={() => router.push("/")}
          style={{ padding: 10, cursor: "pointer" }}
        >
          Home
        </button>

        <button
          onClick={() => router.push("/admin/products")}
          style={{ padding: 10, cursor: "pointer" }}
        >
          Manage Products
        </button>

        <button
          onClick={() => router.push("/admin/orders")}
          style={{ padding: 10, cursor: "pointer" }}
        >
          All Orders
        </button>

        <button
          onClick={logout}
          style={{ padding: 10, cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}