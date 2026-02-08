"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../../lib/auth";

export default function AdminUsersPage() {
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const me = await isAuthenticated();
      if (!me) setError("Not logged in");
      else if (me.role !== "admin") setError("Admin only");
    })();
  }, []);

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "red" }}>{error}</p>
        <Link href="/login">Login</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Users</h1>
      <p>(Coming next) We can add an endpoint to list users safely.</p>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href="/admin"><button style={{ padding: 8 }}>Back Admin</button></Link>
        <Link href="/"><button style={{ padding: 8 }}>Home</button></Link>
      </div>
    </div>
  );
}