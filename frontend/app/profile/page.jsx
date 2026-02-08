"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson } from "../lib/api";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMe() {
    setError("");
    setLoading(true);

    try {
      const { res, data } = await apiJson("/api/auth/me");

      if (res.status === 401) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data?.message || "Failed to load profile");
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(data?.user || null);
    } catch {
      setError("Network error");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl shadow p-6">
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            You’re not logged in. Please login to view your profile.
          </p>

          <div className="flex gap-3 mt-5 flex-wrap">
            <Link href="/login">
              <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition">
                Go to Login
              </button>
            </Link>
            <Link href="/">
              <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition">
                Back Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roleBadge =
    user.role === "admin"
      ? "bg-purple-100 text-purple-700"
      : "bg-blue-100 text-blue-700";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-2xl shadow overflow-hidden">
        {/* Top Banner */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-6">
          <p className="text-white/80 text-sm">Welcome back</p>
          <h1 className="text-white text-2xl font-bold">{user.name}</h1>
          <p className="text-white/90 text-sm mt-1">{user.email}</p>

          <div className="mt-3 inline-flex">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/15 text-white`}>
              Role: {user.role}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-semibold text-gray-900 mt-1">{user.name}</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-semibold text-gray-900 mt-1">{user.email}</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 sm:col-span-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">Account Type</p>
                <span className={`inline-flex mt-2 text-sm font-semibold px-3 py-1 rounded-full ${roleBadge}`}>
                  {user.role === "admin" ? "Admin Account" : "User Account"}
                </span>
              </div>

              {user.role === "admin" ? (
                <Link href="/admin">
                  <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition">
                    Go to Admin
                  </button>
                </Link>
              ) : (
                <Link href="/orders">
                  <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition">
                    My Orders
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <Link href="/">
              <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition">
                Back Home
              </button>
            </Link>

            <Link href="/cart">
              <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition">
                View Cart
              </button>
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
            >
              Logout
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Tip: Admins can manage products and view all orders from the Admin Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}