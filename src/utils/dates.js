// Simple, stable date/time helpers. All dates are "YYYY-MM-DD" strings,
// all times are "HH:mm" strings. Everything is computed from local time.
// No external date library is used.

function pad2(n) {
  const v = Math.floor(Math.abs(Number(n) || 0));
  return v < 10 ? "0" + v : String(v);
}

// Build a "YYYY-MM-DD" string from a Date using local time.
export function dateToStr(dateObj) {
  const d = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Build a "HH:mm" string from a Date using local time.
export function timeToStr(dateObj) {
  const d = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function todayStr() {
  return dateToStr(new Date());
}

export function nowTimeStr() {
  return timeToStr(new Date());
}

export function nowISO() {
  try {
    return new Date().toISOString();
  } catch (e) {
    return "";
  }
}

// Validate a "YYYY-MM-DD" string, including real calendar days.
export function isValidDateStr(s) {
  if (typeof s !== "string") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(y, mo - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === mo - 1 &&
    dt.getDate() === d
  );
}

// Validate a "HH:mm" string.
export function isValidTimeStr(s) {
  if (typeof s !== "string") return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return false;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  return h >= 0 && h <= 23 && mi >= 0 && mi <= 59;
}

// Parse a "YYYY-MM-DD" into a local Date at midnight, or null if invalid.
export function parseDate(s) {
  if (!isValidDateStr(s)) return null;
  const [y, mo, d] = s.split("-").map((x) => Number(x));
  return new Date(y, mo - 1, d);
}

// Return date string offset by "delta" days from a base date string.
export function addDays(dateStr, delta) {
  const base = parseDate(dateStr) || new Date();
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + Number(delta || 0));
  return dateToStr(d);
}

// Array of the last n date strings, oldest first, ending today.
export function lastNDates(n) {
  const count = Math.max(0, Math.floor(Number(n) || 0));
  const out = [];
  const today = todayStr();
  for (let i = count - 1; i >= 0; i--) {
    out.push(addDays(today, -i));
  }
  return out;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "2026-07-03" -> "Fri, Jul 3, 2026". Falls back to raw string if invalid.
export function formatDateLong(s) {
  const d = parseDate(s);
  if (!d) return typeof s === "string" ? s : "";
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// "2026-07-03" -> "Jul 3". Compact label for charts/cards.
export function formatDateShort(s) {
  const d = parseDate(s);
  if (!d) return typeof s === "string" ? s : "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// Single-letter weekday for compact chart axes.
export function weekdayLetter(s) {
  const d = parseDate(s);
  if (!d) return "";
  return WEEKDAYS[d.getDay()].charAt(0);
}

export function isToday(s) {
  return s === todayStr();
}
