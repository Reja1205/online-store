"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import { apiJson } from "../lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [mode, setMode] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

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
      const path = mode === "admin" ? "/api/auth/register-admin" : "/api/auth/register-user";
      const payload =
        mode === "admin" ? { name, email, password, adminSecret } : { name, email, password };

      const { res, data } = await apiJson(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError(data?.message || "Registration failed");
        setLoading(false);
        return;
      }

      setMsg("Account created. Redirecting to sign in…");
      setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 600);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <Card padding="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">Register as a shopper or an administrator.</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("user")}
            className={`rounded-xl border py-2.5 text-sm font-medium transition min-h-[2.75rem] ${
              mode === "user"
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`rounded-xl border py-2.5 text-sm font-medium transition min-h-[2.75rem] ${
              mode === "admin"
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <Label htmlFor="reg-name">Name</Label>
            <Input id="reg-name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              className="mt-1.5"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              className="mt-1.5"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {mode === "admin" ? (
            <div>
              <Label htmlFor="reg-admin-secret">Admin secret</Label>
              <Input
                id="reg-admin-secret"
                className="mt-1.5"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                required
              />
            </div>
          ) : null}

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
            {loading ? "Creating…" : "Register"}
          </Button>

          <div className="flex justify-between text-sm">
            <Link href="/" className="text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline">
              Home
            </Link>
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
