"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API } from "../lib/api";

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

  // optional: if already logged in, don’t allow register page
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) router.replace("/profile");
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);

    try {
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

      setMsg("Registered successfully ✅ Redirecting to login...");
      // ✅ use replace so you don’t go back to register
      setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 600);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900">Register</h1>
      <p className="text-sm text-gray-500 mt-1">Create a user account or an admin account.</p>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => setMode("user")}
          className={`flex-1 py-2 rounded-lg font-medium border transition ${
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
          className={`flex-1 py-2 rounded-lg font-medium border transition ${
            mode === "admin"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Register as Admin
        </button>
      </div>

      <form onSubmit={submit} className="grid gap-3 mt-5">
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />

        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {mode === "admin" && (
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="Admin Secret"
          />
        )}

        {msg ? <p className="text-sm text-green-700">{msg}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-medium transition ${
            loading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <div className="flex justify-between text-sm mt-1">
          <Link className="text-gray-600 hover:text-gray-900" href="/">
            Back
          </Link>
          <Link className="text-indigo-600 hover:text-indigo-700 font-medium" href="/login">
            Go to Login
          </Link>
        </div>
      </form>
    </div>
  );
}