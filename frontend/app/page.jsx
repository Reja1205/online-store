"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${base}/api/auth/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, [base]);

  const handleLogout = async () => {
    await fetch(`${base}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    location.reload();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui" }}>
      <h1>Online Store</h1>

      {/* NOT LOGGED IN */}
      {!user && (
        <>
          <a href="/login">Login</a>
          <br />
          <a href="/register">Register</a>
        </>
      )}

      {/* LOGGED IN */}
      {user && (
        <>
          <p>Welcome {user.name}</p>
          <p>Role: {user.role}</p>

          {/* ADMIN ONLY */}
          {user.role === "admin" && (
            <>
              <br />
              <a href="/admin">Admin Panel</a>
            </>
          )}

          <br />
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}