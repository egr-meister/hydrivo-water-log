// Small formatting helpers.

// 1620 -> "1,620". Always returns a string.
export function groupNumber(n) {
  const v = Math.round(Number(n) || 0);
  const neg = v < 0;
  const s = String(Math.abs(v));
  const out = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return neg ? "-" + out : out;
}

// 1620 -> "1,620 ml".
export function ml(n) {
  return `${groupNumber(n)} ml`;
}

// progress ratio 0..1 -> percent int, clamped 0..100 for display.
export function pct(ratio) {
  const r = Number(ratio);
  if (!isFinite(r) || r <= 0) return 0;
  return Math.min(100, Math.round(r * 100));
}
