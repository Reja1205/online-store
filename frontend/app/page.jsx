"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [user, setUser] = useState(null);

  async function loadMe() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/auth/me`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Online Store</h1>

      {!user ? (
        <>
          <a href="/login">Login</a>
          <br />
          <a href="/register">Register</a>
        </>
      ) : (
        <>
          <p>Welcome {user.name}</p>
          <p>Role: {user.role}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}