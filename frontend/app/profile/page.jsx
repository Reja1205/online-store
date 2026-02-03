"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/auth/me`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.replace("/");
    router.refresh();
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <button onClick={handleLogout} style={{ padding: 10 }}>
        Logout
      </button>
    </div>
  );
}