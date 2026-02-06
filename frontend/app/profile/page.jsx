"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { apiJson } from "../lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  async function load() {
    const { res, data } = await apiJson("/api/auth/me");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    setUser(data?.user || null);
  }

  useEffect(() => {
    load();
  }, []);

  async function logout() {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Profile</h1>
      <Header user={user} onLogout={logout} />

      {!user ? (
        <p>Loading...</p>
      ) : (
        <div style={{ border: "1px solid #ddd", padding: 14, borderRadius: 10 }}>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
        </div>
      )}
    </div>
  );
}