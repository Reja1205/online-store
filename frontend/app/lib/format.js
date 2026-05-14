export function fmtMoney(n) {
  const num = Number(n || 0);
  return num.toFixed(2);
}

export function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}
