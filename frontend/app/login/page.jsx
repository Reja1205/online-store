"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("123456");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in → go profile
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) router.replace("/profile");
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save token
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // Redirect by role
      const role = data?.user?.role;
      if (role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/profile");
      }

      router.refresh();
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900">Login</h1>
      <p className="text-sm text-gray-500 mt-1">
        Welcome back. Enter your credentials.
      </p>

      <form onSubmit={submit} className="grid gap-3 mt-5">
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-medium transition ${
            loading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex justify-between text-sm mt-2">
          <Link className="text-gray-600 hover:text-gray-900" href="/">
            Back Home
          </Link>

          <Link
            className="text-indigo-600 hover:text-indigo-700 font-medium"
            href="/register"
          >
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
}