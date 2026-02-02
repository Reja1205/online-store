"use client";
const API = process.env.NEXT_PUBLIC_API_URL;
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${base}/api/auth/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>

      {!user && <p>You are not logged in</p>}

      {user && (
        <>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </>
      )}
    </div>
  );
}