"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson } from "../lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

    setLoading(true);

    const { res, data } = await apiJson("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
      }),
    });

    if (!res.ok) {
      setError(data?.message || "Registration failed");
      setLoading(false);
      return;
    }

    setSuccess("Registered successfully ✅ You can login now.");
    setLoading(false);

    // optional: go to login automatically after a moment
    setTimeout(() => router.push("/login"), 900);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-md rounded-2xl p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Register to add items to cart and place orders.
          </p>
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
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters is a good idea.
            </p>
          </div>

          <button
            disabled={loading}
            className={`mt-2 w-full py-2 rounded-xl font-medium transition ${
              loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            }`}
          >
            {loading ? "Creating account..." : "Register"}
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