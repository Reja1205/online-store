"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import { apiJson } from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);

    try {
      const { res, data } = await apiJson("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError(data?.message || "Request failed");
        return;
      }

      setMsg(data?.message || "If that email exists, a reset link was sent.");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <Card padding="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your email and we&apos;ll send a secure reset link.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              className="mt-1.5"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {msg ? (
            <p role="status" className="text-sm text-emerald-700">
              {msg}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>

          <Link
            href="/login"
            className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Back to sign in
          </Link>
        </form>
      </Card>
    </div>
  );
}
