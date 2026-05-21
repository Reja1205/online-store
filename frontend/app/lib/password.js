export function passwordStrength(password) {
  const value = String(password || "");
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score <= 2) return { level: "weak", label: "Weak", color: "text-red-600" };
  if (score <= 4) return { level: "medium", label: "Fair", color: "text-amber-600" };
  return { level: "strong", label: "Strong", color: "text-emerald-600" };
}

export function passwordMeetsPolicy(password) {
  const value = String(password || "");
  if (value.length < 8) return false;
  return /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
}
