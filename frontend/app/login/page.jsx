"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/profile");
    }
  }, [authLoading, user, router]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { res, data } = await apiJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError(data?.message || "Login failed");
        setSubmitting(false);
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      window.dispatchEvent(new Event("auth:changed"));
      const role = data?.user?.role;
      if (role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/profile");
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-slate-500" aria-busy="true">
        Checking session…
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-slate-500" aria-busy="true">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <Card padding="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">Welcome back. Use your account email and password.</p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              className="mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              className="mt-1.5"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>

          <div className="flex justify-between text-sm">
            <Link className="text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline" href="/">
              Home
            </Link>
            <Link className="font-medium text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline" href="/register">
              Create account
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
