"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`${API}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Not authorized");
        return data;
      })
      .then((data) => {
        if (!data?.user) {
          router.push("/login");
          return;
        }

        if (data.user.role !== "admin") {
          router.push("/");
          return;
        }

        setUser(data.user);
        setStatus("ready");
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (status === "loading") return <p style={{ padding: 20 }}>Checking admin access...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}</p>
      <p>Role: {user?.role}</p>

      <p style={{ marginTop: 20 }}>
        ✅ This page is protected. Only admins can see it.
      </p>
    </div>
  );
}