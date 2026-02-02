"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // CHECK LOGIN
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          credentials: "include", // IMPORTANT
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // LOGOUT
  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  if (!user) return null;

  return (
    <div style={{ padding: 20 }}>
      <h1>Profile</h1>

      <p><b>Name:</b> {user.name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Role:</b> {user.role}</p>

      <button onClick={handleLogout} style={{ padding: 10 }}>
        Logout
      </button>
    </div>
  );
}