"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAuthenticated } from "../lib/auth";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await isAuthenticated();
      setUser(me);
    })();
  }, []);

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <p>You are not logged in.</p>
        <Link href="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Profile</h1>
      <p><b>Name:</b> {user.name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Role:</b> {user.role}</p>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Link href="/"><button style={{ padding: 8 }}>Home</button></Link>
        {user.role === "admin" && (
          <Link href="/admin"><button style={{ padding: 8 }}>Admin Dashboard</button></Link>
        )}
      </div>
    </div>
  );
}