"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../../lib/auth";

export default function AdminUsersPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await isAuthenticated();
        if (!me) setError("Not logged in");
        else if (me.role !== "admin") setError("Admin only");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-red-700 font-medium">{error}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/login">
              <button className="rounded-xl bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition">
                Go to Login
              </button>
            </Link>

            <Link href="/">
              <button className="rounded-xl bg-white px-4 py-2 text-gray-900 font-semibold border hover:bg-gray-50 transition">
                Back Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 p-px shadow-sm">
        <div className="rounded-2xl bg-white/10 backdrop-blur px-5 py-5">
          <h1 className="text-2xl font-bold text-white">Admin Users</h1>
          <p className="mt-1 text-sm text-white/80">
            Manage users (feature coming next)
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            i
          </div>

          <div>
            <p className="font-semibold text-gray-900">Coming next</p>
            <p className="text-sm text-gray-600 mt-1">
              We can add a secure backend endpoint to list users (without exposing passwords),
              then show them here with search, role badges, and admin actions.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin">
            <button className="rounded-xl bg-gray-900 px-4 py-2 text-white font-semibold hover:bg-black transition">
              Back Admin
            </button>
          </Link>

          <Link href="/">
            <button className="rounded-xl bg-gray-100 px-4 py-2 text-gray-900 font-semibold hover:bg-gray-200 transition">
              Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}