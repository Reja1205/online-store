"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiJson } from "../lib/api";
import ShippingAddressForm from "../components/profile/ShippingAddressForm";
import { useAuth } from "../context/AuthContext";

const btnPrimary =
  "inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700";
const btnSecondary =
  "inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-200";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout: authLogout, logoutAllDevices } = useAuth();
  const [resendMsg, setResendMsg] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  async function logout() {
    await authLogout();
    router.push("/login");
  }

  async function resendVerification() {
    setResendMsg("");
    setResendLoading(true);
    try {
      const { res, data } = await apiJson("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });
      setResendMsg(data?.message || (res.ok ? "Verification email sent." : "Could not send email."));
    } catch {
      setResendMsg("Network error");
    } finally {
      setResendLoading(false);
    }
  }

  async function signOutEverywhere() {
    await logoutAllDevices();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-600">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">You’re not signed in. Sign in to view your profile and orders.</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/login" className={btnPrimary}>
              Sign in
            </Link>
            <Link href="/" className={btnSecondary}>
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const roleBadge = isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-6">
          <p className="text-sm text-white/80">Welcome back</p>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="mt-1 text-sm text-white/90">{user.email}</p>

          <div className="mt-3 inline-flex">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              Role: {user.role}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Name</p>
              <p className="mt-1 font-semibold text-gray-900">{user.name}</p>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Email</p>
              <p className="mt-1 font-semibold text-gray-900">{user.email}</p>
              {user.emailVerified === false ? (
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <p className="font-medium">Email not verified</p>
                  <button
                    type="button"
                    disabled={resendLoading}
                    onClick={() => void resendVerification()}
                    className="mt-1 font-semibold text-amber-800 underline disabled:opacity-50"
                  >
                    {resendLoading ? "Sending…" : "Resend verification email"}
                  </button>
                  {resendMsg ? <p className="mt-1">{resendMsg}</p> : null}
                </div>
              ) : (
                <p className="mt-1 text-xs text-emerald-600 font-medium">Verified</p>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-500">Account type</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${roleBadge}`}
                >
                  {isAdmin ? "Admin account" : "Customer account"}
                </span>
              </div>

              {isAdmin ? (
                <Link href="/admin" className={btnPrimary}>
                  Admin dashboard
                </Link>
              ) : (
                <Link href="/orders" className={btnPrimary}>
                  My orders
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6">
            <ShippingAddressForm
              initialAddress={user.shippingAddress}
              userEmail={user.email}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className={btnSecondary}>
              Home
            </Link>
            <Link href="/cart" className={btnSecondary}>
              View cart
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={() => void signOutEverywhere()}
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              Sign out all devices
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Admins can manage products and orders from the admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
