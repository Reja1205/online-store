"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ cookie login
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Login failed");
        return;
      }

      // go to profile so you can SEE it worked
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div>
          <label>Email</label>
          <input
            style={{ width: "100%", padding: 10 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            style={{ width: "100%", padding: 10 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ padding: 10 }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button type="button" onClick={() => router.push("/")} style={{ padding: 10 }}>
          Back
        </button>
      </form>
    </div>
  );
}