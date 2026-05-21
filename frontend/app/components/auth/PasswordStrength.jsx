"use client";

import { passwordStrength } from "../../lib/password";

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const { label, color } = passwordStrength(password);
  return (
    <p className={`mt-1 text-xs font-medium ${color}`} aria-live="polite">
      Password strength: {label}
    </p>
  );
}
