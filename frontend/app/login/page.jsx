"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // IMPORTANT: env must exist in Vercel
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // guard if env missing
    if (!API) {
      setError("API URL missing. Check NEXT_PUBLIC_API_URL in Vercel.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Login failed");
        setLoading(false);
        return;
      }

      // optional token storage (helps production)
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // go home after success
      router.push("/");
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
            placeholder="email"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            style={{ width: "100%", padding: 10 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </div>

        {error && (
          <p style={{ color: "red", margin: 0 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: 10, cursor: "pointer" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          style={{ padding: 10, cursor: "pointer" }}
        >
          Back
        </button>
      </form>
    </div>
  );
}