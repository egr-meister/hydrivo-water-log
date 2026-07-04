// Statistics helpers. All functions are defensive: they accept possibly
// empty / malformed input and always return safe values.
import { lastNDates } from "./dates";

export function safeAmount(entry) {
  return Math.max(0, Number(entry?.amountMl ?? 0)) || 0;
}

export function safeGoal(goal) {
  const g = Number(goal);
  return isFinite(g) && g > 0 ? g : 2000;
}

// entries for a given date string.
export function entriesForDate(entries, date) {
  const list = Array.isArray(entries) ? entries : [];
  return list.filter((e) => e?.date === date);
}

// Sum of amounts for a single date.
export function dailyTotal(entries, date) {
  return entriesForDate(entries, date).reduce((sum, e) => sum + safeAmount(e), 0);
}

// Map of { date -> totalMl } for all entries.
export function totalsByDate(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const map = {};
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    const d = e?.date;
    if (typeof d !== "string" || !d) continue;
    map[d] = (map[d] || 0) + safeAmount(e);
  }
  return map;
}

// Map of { date -> entryCount }.
export function countsByDate(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const map = {};
  for (let i = 0; i < list.length; i++) {
    const d = list[i]?.date;
    if (typeof d !== "string" || !d) continue;
    map[d] = (map[d] || 0) + 1;
  }
  return map;
}

// Series for the last n days: [{ date, totalMl, goalReached }], oldest first.
// Missing days are 0 ml.
export function rangeSeries(entries, n, goal) {
  const totals = totalsByDate(entries);
  const g = safeGoal(goal);
  return lastNDates(n).map((date) => {
    const totalMl = Math.max(0, Number(totals[date] || 0));
    return { date, totalMl, goalReached: totalMl >= g };
  });
}

// Average over a fixed window of n days (missing days count as 0).
export function averageForRange(entries, n, goal) {
  const days = Math.max(1, Math.floor(Number(n) || 1));
  const series = rangeSeries(entries, days, goal);
  const sum = series.reduce((s, d) => s + d.totalMl, 0);
  return Math.round(sum / days);
}

// All-time average across days that actually have entries only.
export function allTimeAverage(entries) {
  const totals = totalsByDate(entries);
  const keys = Object.keys(totals);
  if (keys.length === 0) return 0;
  const sum = keys.reduce((s, k) => s + Math.max(0, Number(totals[k] || 0)), 0);
  return Math.round(sum / keys.length);
}

// Best day = date with highest total. Returns null if no data.
export function bestDay(entries, goal) {
  const totals = totalsByDate(entries);
  const keys = Object.keys(totals);
  if (keys.length === 0) return null;
  let bestDate = keys[0];
  let bestTotal = Math.max(0, Number(totals[keys[0]] || 0));
  for (let i = 1; i < keys.length; i++) {
    const t = Math.max(0, Number(totals[keys[i]] || 0));
    if (t > bestTotal) {
      bestTotal = t;
      bestDate = keys[i];
    }
  }
  return { date: bestDate, totalMl: bestTotal, goalReached: bestTotal >= safeGoal(goal) };
}

// Goal completion within the last n days: { reached, total, percent }.
export function goalCompletionForRange(entries, n, goal) {
  const days = Math.max(1, Math.floor(Number(n) || 1));
  const series = rangeSeries(entries, days, goal);
  const reached = series.filter((d) => d.goalReached).length;
  const percent = Math.round((reached / days) * 100);
  return { reached, total: days, percent };
}

// All-time goal days = number of distinct days that met the goal.
export function allTimeGoalDays(entries, goal) {
  const totals = totalsByDate(entries);
  const g = safeGoal(goal);
  return Object.keys(totals).filter((k) => Number(totals[k] || 0) >= g).length;
}

export function totalLogged(entries) {
  const list = Array.isArray(entries) ? entries : [];
  return list.reduce((s, e) => s + safeAmount(e), 0);
}

export function totalEntries(entries) {
  return Array.isArray(entries) ? entries.length : 0;
}

// Distinct recorded days count.
export function distinctDays(entries) {
  return Object.keys(totalsByDate(entries)).length;
}

// History cards: one per date with entries, newest first.
export function historyCards(entries, goal) {
  const totals = totalsByDate(entries);
  const counts = countsByDate(entries);
  const g = safeGoal(goal);
  const keys = Object.keys(totals);
  keys.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)); // reverse chronological
  return keys.map((date) => {
    const totalMl = Math.max(0, Number(totals[date] || 0));
    return {
      date,
      totalMl,
      entryCount: counts[date] || 0,
      goalReached: totalMl >= g,
    };
  });
}
