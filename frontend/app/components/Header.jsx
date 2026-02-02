"use client";
const API = process.env.NEXT_PUBLIC_API_URL;
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${base}/api/auth/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    await fetch(`${base}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    location.reload();
  };

  return (
    <div style={{ padding: 15, borderBottom: "1px solid #ccc" }}>
      <a href="/">Home</a>{" | "}

      {!user && (
        <>
          <a href="/login">Login</a>{" | "}
          <a href="/register">Register</a>
        </>
      )}

      {user && (
        <>
          <a href="/profile">Profile</a>{" | "}

          {user.role === "admin" && (
            <>
              <a href="/admin">Admin</a>{" | "}
            </>
          )}

          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>
  );
}