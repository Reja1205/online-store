"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();

  const [mode, setMode] = useState("user"); // "user" | "admin"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "admin" ? "/api/auth/register-admin" : "/api/auth/register-user";

      const body =
        mode === "admin"
          ? { name, email, password, adminSecret }
          : { name, email, password };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Registration failed");
        return;
      }

      // After register, go login
      router.push("/login");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h1>Register</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setMode("user")}
          style={{
            padding: 10,
            cursor: "pointer",
            border: "1px solid #ccc",
            background: mode === "user" ? "#eee" : "#fff",
          }}
        >
          Register as User
        </button>

        <button
          type="button"
          onClick={() => setMode("admin")}
          style={{
            padding: 10,
            cursor: "pointer",
            border: "1px solid #ccc",
            background: mode === "admin" ? "#eee" : "#fff",
          }}
        >
          Register as Admin
        </button>
      </div>

      <form onSubmit={handleRegister} style={{ display: "grid", gap: 12 }}>
        <div>
          <label>Name</label>
          <input
            style={{ width: "100%", padding: 10 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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

        {mode === "admin" && (
          <div>
            <label>Admin Secret</label>
            <input
              style={{ width: "100%", padding: 10 }}
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter admin secret"
            />
          </div>
        )}

        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ padding: 10 }}>
          {loading ? "Creating..." : "Register"}
        </button>

        <button type="button" onClick={() => router.push("/")} style={{ padding: 10 }}>
          Back
        </button>
      </form>
    </div>
  );
}