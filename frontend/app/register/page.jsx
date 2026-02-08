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
}"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson } from "../lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [mode, setMode] = useState("user"); // "user" | "admin"

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill out name, email, and password.");
      return;
    }

    if (mode === "admin" && !adminSecret.trim()) {
      setError("Admin secret is required for admin registration.");
      return;
    }

    setLoading(true);

    const endpoint = mode === "admin" ? "/api/auth/register-admin" : "/api/auth/register";
    const payload =
      mode === "admin"
        ? { name: name.trim(), email: email.trim(), password, adminSecret: adminSecret.trim() }
        : { name: name.trim(), email: email.trim(), password };

    const { res, data } = await apiJson(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError(data?.message || "Registration failed");
      setLoading(false);
      return;
    }

    setSuccess(
      mode === "admin"
        ? "Admin registered successfully ✅ You can login now."
        : "User registered successfully ✅ You can login now."
    );

    setLoading(false);

    setTimeout(() => router.push("/login"), 900);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-md rounded-2xl p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "admin" ? "Register as Admin" : "Register as User"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "admin"
              ? "Admin account can manage products and view all orders."
              : "User account can add to cart, checkout, and view your orders."}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setMode("user")}
            className={`flex-1 py-2 rounded-xl font-medium border transition ${
              mode === "user"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            User
          </button>

          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`flex-1 py-2 rounded-xl font-medium border transition ${
              mode === "admin"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Admin
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-green-700 text-sm">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              className="mt-1 w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              className="mt-1 w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              type="password"
              autoComplete="new-password"
            />
          </div>

          {/* Admin Secret only for admin mode */}
          {mode === "admin" ? (
            <div>
              <label className="text-sm font-medium text-gray-700">Admin Secret</label>
              <input
                className="mt-1 w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter admin secret"
                type="password"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is required to prevent random users creating admin accounts.
              </p>
            </div>
          ) : null}

          <button
            disabled={loading}
            className={`mt-2 w-full py-2 rounded-xl font-medium transition ${
              loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            }`}
          >
            {loading ? "Registering..." : mode === "admin" ? "Register Admin" : "Register User"}
          </button>

          <div className="flex items-center justify-between text-sm mt-2">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back home
            </Link>

            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}