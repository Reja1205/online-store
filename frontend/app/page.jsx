"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [user, setUser] = useState(null);

  async function loadMe() {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        credentials: "include",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
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
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Online Store</h1>

      {!user && (
        <>
          <Link href="/login">Login</Link>
          <br />
          <Link href="/register">Register</Link>
        </>
      )}

      {user && (
        <>
          <p>Welcome {user.name}</p>
          <p>Role: {user.role}</p>

          <Link href="/profile">Profile</Link>
          <br />

          {/* ADMIN ONLY */}
          {user.role === "admin" && (
            <>
              <Link href="/admin">Admin Dashboard</Link>
              <br />
            </>
          )}

          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}