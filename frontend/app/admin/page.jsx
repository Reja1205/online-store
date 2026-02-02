"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/api/auth/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }

        if (data.user.role !== "admin") {
          router.push("/");
          return;
        }

        setMessage(`Welcome Admin: ${data.user.name}`);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <p>{message || "Loading..."}</p>
    </div>
  );
}