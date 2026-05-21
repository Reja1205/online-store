const MIN_LENGTH = Number(process.env.PASSWORD_MIN_LENGTH || 8);

function validatePassword(password) {
  const value = String(password || "");
  if (value.length < MIN_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_LENGTH} characters` };
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    return {
      ok: false,
      message: "Password must include uppercase, lowercase, and a number",
    };
  }
  return { ok: true };
}

function passwordStrength(password) {
  const value = String(password || "");
  let score = 0;
  if (value.length >= MIN_LENGTH) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  return "strong";
}

module.exports = { validatePassword, passwordStrength, MIN_LENGTH };
