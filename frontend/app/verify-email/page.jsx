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
  const sent = searchParams.get("sent") === "1";
  const emailFromQuery = searchParams.get("email") || "";

  const [status, setStatus] = useState(() => (token ? "loading" : sent ? "sent" : "idle"));
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState(emailFromQuery);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    if (emailFromQuery) setResendEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (!token) return;

    setStatus("loading");
    (async () => {
      const { res, data } = await apiJson(
        `/api/auth/verify-email?token=${encodeURIComponent(token)}`
      );
      if (res.ok) {
        setStatus("verified");
        setMessage(data?.message || "Your email is verified. You can sign in now.");
        window.dispatchEvent(new Event("auth:changed"));
      } else {
        setStatus("error");
        setMessage(data?.message || "This verification link is invalid or expired.");
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
      if (res.ok) {
        setStatus("sent");
        setResendMsg(
          data?.message || "If that email is registered, we sent a new verification link."
        );
      } else {
        setResendMsg(data?.message || "Could not send email. Try again.");
      }
    } catch {
      setResendMsg("Network error. Try again.");
    } finally {
      setResendLoading(false);
    }
  }

  const showResendForm = status === "idle" || status === "error" || status === "sent";

  return (
    <Card padding="p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Email verification</h1>

      {status === "loading" ? (
        <p className="mt-4 text-sm text-slate-600">Verifying your email…</p>
      ) : null}

      {status === "verified" ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">Verified</p>
          <p className="mt-1 text-sm text-emerald-700">{message}</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button variant="primary">Sign in</Button>
          </Link>
        </div>
      ) : null}

      {status === "sent" ? (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-4">
          <p className="text-sm font-semibold text-sky-900">Verification email sent</p>
          <p className="mt-2 text-sm text-sky-800">
            We sent a link to{" "}
            <span className="font-medium">{resendEmail || emailFromQuery || "your email"}</span>.
            Open that email and click <strong>Verify email</strong>, then come back here to sign in.
          </p>
          <p className="mt-2 text-xs text-sky-700">Check your spam folder if you do not see it within a few minutes.</p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-800">Verification failed</p>
          <p className="mt-1 text-sm text-red-700" role="alert">
            {message}
          </p>
        </div>
      ) : null}

      {showResendForm ? (
        <form onSubmit={resend} className="mt-6 grid gap-3 border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600">
            {status === "sent"
              ? "Did not get the email? Send another link:"
              : "Resend verification email"}
          </p>
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
          {resendMsg ? (
            <p className={`text-sm ${resendMsg.includes("sent") || resendMsg.includes("If") ? "text-emerald-700" : "text-slate-700"}`}>
              {resendMsg}
            </p>
          ) : null}
          <Button type="submit" variant="primary" disabled={resendLoading}>
            {resendLoading ? "Sending…" : "Resend email"}
          </Button>
          <Link href="/login" className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Back to sign in
          </Link>
        </form>
      ) : null}

      {status === "idle" && !sent ? (
        <p className="mt-4 text-sm text-slate-600">
          Enter your email to receive a verification link.
        </p>
      ) : null}
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
