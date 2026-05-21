"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import PasswordStrength from "../components/auth/PasswordStrength";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import { apiJson } from "../lib/api";
import { passwordMeetsPolicy } from "../lib/password";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!tokenFromUrl) {
      setError("Reset link is invalid. Request a new one.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!passwordMeetsPolicy(password)) {
      setError("Use at least 8 characters with uppercase, lowercase, and a number.");
      return;
    }

    setLoading(true);
    try {
      const { res, data } = await apiJson("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: tokenFromUrl, password }),
      });

      if (!res.ok) {
        setError(data?.message || "Reset failed");
        return;
      }

      setMsg(data?.message || "Password updated.");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card padding="p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reset password</h1>
      <p className="mt-1 text-sm text-slate-600">Choose a new password for your account.</p>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div>
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            className="mt-1.5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <PasswordStrength password={password} />
        </div>

        <div>
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            className="mt-1.5"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {msg ? (
          <div>
            <p role="status" className="text-sm text-emerald-700">
              {msg}
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {!msg ? (
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        ) : null}
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
