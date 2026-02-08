"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "../lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [mode, setMode] = useState("user"); // user | admin
  const [name, setName] = useState("New User");
  const [email, setEmail] = useState("new@test.com");
  const [password, setPassword] = useState("123456");
  const [adminSecret, setAdminSecret] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    const url = mode === "admin" ? "/api/auth/register-admin" : "/api/auth/register-user";

    const payload =
      mode === "admin"
        ? { name, email, password, adminSecret }
        : { name, email, password };

    const res = await fetch(`${API}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.message || "Registration failed");
      return;
    }

    setMsg("Registered successfully ✅");
    setTimeout(() => router.push("/login"), 900);
  }

  return (
    <div style={{ padding: 20, maxWidth: 520 }}>
      <h1>Register</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button
          onClick={() => setMode("user")}
          style={{ padding: 8, cursor: "pointer", opacity: mode === "user" ? 1 : 0.6 }}
        >
          Register as User
        </button>
        <button
          onClick={() => setMode("admin")}
          style={{ padding: 8, cursor: "pointer", opacity: mode === "admin" ? 1 : 0.6 }}
        >
          Register as Admin
        </button>
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input style={{ padding: 10 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input style={{ padding: 10 }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input style={{ padding: 10 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

        {mode === "admin" && (
          <input
            style={{ padding: 10 }}
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="Admin Secret"
          />
        )}

        {msg && <p style={{ margin: 0 }}>{msg}</p>}
        {error && <p style={{ margin: 0, color: "red" }}>{error}</p>}

        <button style={{ padding: 10, cursor: "pointer" }} type="submit">
          Register
        </button>

        <button style={{ padding: 10 }} type="button" onClick={() => router.push("/")}>
          Back
        </button>
      </form>
    </div>
  );
}
