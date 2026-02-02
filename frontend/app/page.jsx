"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/"; // ✅ simplest and reliable
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Online Store</h1>

      {loading && <p>Loading...</p>}

      {!loading && !user && (
        <>
          <a href="/login">Login</a>
          <br />
          <a href="/register">Register</a>
        </>
      )}

      {!loading && user && (
        <>
          <p>Welcome {user.name}</p>
          <p>Role: {user.role}</p>
          <button onClick={handleLogout} style={{ padding: 10 }}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}