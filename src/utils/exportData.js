// Export generators: CSV and plain text. Fully local, no file system, no
// network. Output is returned as a string for on-screen preview / clipboard.
import { todayStr, addDays, formatDateLong } from "./dates";
import { entriesForDate, totalsByDate, dailyTotal } from "./stats";
import { groupNumber } from "./format";

// Filter entries by range key: "all" | "7" | "30".
export function filterByRange(entries, rangeKey) {
  const list = Array.isArray(entries) ? entries : [];
  if (rangeKey === "all") return list.slice();
  const n = rangeKey === "7" ? 7 : rangeKey === "30" ? 30 : 0;
  if (n <= 0) return list.slice();
  const start = addDays(todayStr(), -(n - 1));
  return list.filter((e) => typeof e?.date === "string" && e.date >= start);
}

// Sort entries chronologically by date then time.
function sortEntries(entries) {
  const list = Array.isArray(entries) ? entries.slice() : [];
  list.sort((a, b) => {
    const da = a?.date || "";
    const db = b?.date || "";
    if (da !== db) return da < db ? -1 : 1;
    const ta = a?.time || "";
    const tb = b?.time || "";
    if (ta !== tb) return ta < tb ? -1 : 1;
    return 0;
  });
  return list;
}

// Escape a CSV field (quote if it contains comma, quote, or newline).
function csvField(value) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// Generate CSV text. Header + one row per entry.
export function toCSV(entries) {
  const rows = sortEntries(entries);
  const header = "date,time,amountMl,label";
  if (rows.length === 0) return header + "\n";
  const lines = rows.map((e) => {
    const date = csvField(e?.date ?? "");
    const time = csvField(e?.time ?? "");
    const amount = csvField(Math.max(0, Number(e?.amountMl ?? 0)));
    const label = csvField(e?.label ?? "");
    return `${date},${time},${amount},${label}`;
  });
  return header + "\n" + lines.join("\n") + "\n";
}

// Generate a human readable plain text summary grouped by day.
export function toPlainText(entries) {
  const rows = sortEntries(entries);
  const title = "Hydrivo Water Log Export";
  if (rows.length === 0) {
    return `${title}\n\nNo records to export.\n`;
  }

  // Group by date.
  const byDate = {};
  const order = [];
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i]?.date || "";
    if (!byDate[d]) {
      byDate[d] = [];
      order.push(d);
    }
    byDate[d].push(rows[i]);
  }

  const blocks = order.map((d) => {
    const dayEntries = byDate[d];
    const total = dailyTotal(dayEntries, d);
    const header = `${d} (${formatDateLong(d)})\nTotal: ${groupNumber(total)} ml`;
    const lines = dayEntries.map((e) => {
      const time = e?.time ? e.time : "--:--";
      const amount = groupNumber(Math.max(0, Number(e?.amountMl ?? 0)));
      const label = e?.label ? ` — ${e.label}` : "";
      return `${time} — ${amount} ml${label}`;
    });
    return header + "\n" + lines.join("\n");
  });

  return `${title}\n\n` + blocks.join("\n\n") + "\n";
}

// Convenience: build export text for a given range + format.
export function buildExport(entries, rangeKey, format) {
  const filtered = filterByRange(entries, rangeKey);
  if (format === "csv") return toCSV(filtered);
  return toPlainText(filtered);
}

export function rangeLabel(rangeKey) {
  if (rangeKey === "7") return "Last 7 days";
  if (rangeKey === "30") return "Last 30 days";
  return "All records";
}
