"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API}/api/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    // remove token (main thing)
    localStorage.removeItem("token");

    // optional: also hit backend logout if you still set cookies sometimes
    try {
      await fetch(`${API}/api/auth/logout`, { method: "POST" });
    } catch {}

    location.reload();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Online Store</h1>

      {!user && (
        <>
          <a href="/login">Login</a>
          <br />
          <a href="/register">Register</a>
        </>
      )}

      {user && (
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