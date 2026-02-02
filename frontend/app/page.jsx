"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [user, setUser] = useState(null);

  async function loadMe() {
    const token = localStorage.getItem("token");
    if (!token) return setUser(null);

    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user) setUser(data.user);
      else setUser(null);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div style={{ padding: 20 }}>
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