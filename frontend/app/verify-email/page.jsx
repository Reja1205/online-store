"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import { apiJson } from "../lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("idle");
      return;
    }

    (async () => {
      const { res, data } = await apiJson(
        `/api/auth/verify-email?token=${encodeURIComponent(token)}`
      );
      if (res.ok) {
        setStatus("success");
        setMessage(data?.message || "Email verified.");
        window.dispatchEvent(new Event("auth:changed"));
      } else {
        setStatus("error");
        setMessage(data?.message || "Verification failed.");
      }
    })();
  }, [token]);

  async function resend(e) {
    e.preventDefault();
    setResendMsg("");
    setResendLoading(true);
    try {
      const { res, data } = await apiJson("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendMsg(data?.message || (res.ok ? "Email sent." : "Request failed"));
    } catch {
      setResendMsg("Network error");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <Card padding="p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Email verification</h1>

      {status === "loading" ? (
        <p className="mt-4 text-sm text-slate-600">Verifying your email…</p>
      ) : null}

      {status === "success" ? (
        <div className="mt-4">
          <p className="text-sm text-emerald-700">{message}</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button variant="primary">Sign in</Button>
          </Link>
        </div>
      ) : null}

      {status === "error" ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {message}
        </p>
      ) : null}

      {(status === "idle" || status === "error") && (
        <form onSubmit={resend} className="mt-6 grid gap-3 border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600">Resend verification email</p>
          <div>
            <Label htmlFor="resend-email">Email</Label>
            <Input
              id="resend-email"
              className="mt-1.5"
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              required
            />
          </div>
          {resendMsg ? <p className="text-sm text-slate-700">{resendMsg}</p> : null}
          <Button type="submit" variant="primary" disabled={resendLoading}>
            {resendLoading ? "Sending…" : "Resend email"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
