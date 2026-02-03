"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

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
      // 1) login
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Login failed");
        return;
      }

      // 2) save token
      const token = data?.token;
      if (!token) {
        setError("No token returned from server");
        return;
      }
      localStorage.setItem("token", token);

      // 3) get current user role
      const meRes = await fetch(`${API}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const meData = await meRes.json();

      if (!meRes.ok) {
        setError(meData?.message || "Could not load user");
        return;
      }

      // 4) redirect based on role
      const role = meData?.user?.role;
      if (role === "admin") router.push("/admin");
      else router.push("/profile");
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