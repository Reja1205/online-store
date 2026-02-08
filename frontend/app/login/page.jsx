"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiJson } from "../lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [mode, setMode] = useState("user"); // user | admin
  const [name, setName] = useState("New User");
  const [email, setEmail] = useState("new@test.com");
  const [password, setPassword] = useState("123456");
  const [adminSecret, setAdminSecret] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email and password are required");
      return;
    }

    if (mode === "admin" && !adminSecret.trim()) {
      setError("Admin Secret is required for admin registration");
      return;
    }

    setLoading(true);

    try {
      const url = mode === "admin" ? "/api/auth/register-admin" : "/api/auth/register-user";

      const payload =
        mode === "admin"
          ? { name: name.trim(), email: email.trim(), password, adminSecret: adminSecret.trim() }
          : { name: name.trim(), email: email.trim(), password };

      const { res, data } = await apiJson(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError(data?.message || "Registration failed");
        return;
      }

      setMsg("Registered successfully ✅ Redirecting to login...");

      // ✅ IMPORTANT: go to login immediately (no confusion / no back to register)
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-md rounded-2xl p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Register</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create an account as a user or admin.
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("user")}
            className={`flex-1 py-2 rounded-xl font-medium border transition ${
              mode === "user"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Register as User
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
            Register as Admin
          </button>
        </div>

        {msg ? (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-green-700 text-sm">
            {msg}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              className="mt-1 w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
              placeholder="Password"
              type="password"
              autoComplete="new-password"
            />
          </div>

          {mode === "admin" ? (
            <div>
              <label className="text-sm font-medium text-gray-700">Admin Secret</label>
              <input
                className="mt-1 w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Admin Secret"
              />
            </div>
          ) : null}

          <button
            disabled={loading}
            className={`w-full py-2 rounded-xl font-medium transition ${
              loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            }`}
            type="submit"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back Home
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