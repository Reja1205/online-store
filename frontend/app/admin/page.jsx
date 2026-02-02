"use client";
const API = process.env.NEXT_PUBLIC_API_URL;
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${base}/api/auth/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user || null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin Page</h2>
        <p>You are not logged in</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin Page</h2>
        <p>Access Denied</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome Admin {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      <hr />
      <p>Here you will later manage users, products, orders, etc.</p>
    </div>
  );
}