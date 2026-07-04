// Local storage layer built on AsyncStorage.
// All app data lives in ONE JSON object under a single key. Every load
// merges with safe defaults so the app never crashes on empty / missing /
// corrupted data.
import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEY = "hydrivo_water_log_v1";

export const DEFAULT_GOAL_ML = 2000;
export const MAX_ENTRY_ML = 5000;
export const MAX_GOAL_ML = 10000;

export const QUICK_AMOUNTS = [150, 250, 330, 500];

export const DEFAULT_SETTINGS = {
  onboardingCompleted: false,
  dailyGoalMl: DEFAULT_GOAL_ML,
  compactMode: false,
  weekStartsOn: "monday",
};

export const DEFAULT_DATA = {
  settings: { ...DEFAULT_SETTINGS },
  entries: [],
};

// Coerce a stored settings object into a valid one using defaults.
export function normalizeSettings(raw) {
  const s = raw && typeof raw === "object" ? raw : {};
  let goal = Number(s.dailyGoalMl);
  if (!isFinite(goal) || goal <= 0) goal = DEFAULT_GOAL_ML;
  goal = Math.min(MAX_GOAL_ML, Math.max(1, Math.round(goal)));
  return {
    onboardingCompleted: s.onboardingCompleted === true,
    dailyGoalMl: goal,
    compactMode: s.compactMode === true,
    weekStartsOn: s.weekStartsOn === "sunday" ? "sunday" : "monday",
  };
}

// Coerce a single stored entry into a valid WaterEntry, or null if unusable.
export function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const amountMl = Math.max(0, Math.round(Number(raw.amountMl) || 0));
  const date = typeof raw.date === "string" ? raw.date : "";
  if (!date) return null;
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : makeId(),
    date,
    time: typeof raw.time === "string" ? raw.time : "",
    amountMl,
    label: typeof raw.label === "string" ? raw.label : "",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
  };
}

export function normalizeData(raw) {
  const obj = raw && typeof raw === "object" ? raw : {};
  const entriesRaw = Array.isArray(obj.entries) ? obj.entries : [];
  const entries = [];
  for (let i = 0; i < entriesRaw.length; i++) {
    const e = normalizeEntry(entriesRaw[i]);
    if (e) entries.push(e);
  }
  return {
    settings: normalizeSettings(obj.settings),
    entries,
  };
}

// Load and normalize. Never throws; falls back to defaults on any error.
export async function loadData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { settings: { ...DEFAULT_SETTINGS }, entries: [] };
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      // Corrupted JSON -> safe defaults.
      return { settings: { ...DEFAULT_SETTINGS }, entries: [] };
    }
    return normalizeData(parsed);
  } catch (e) {
    return { settings: { ...DEFAULT_SETTINGS }, entries: [] };
  }
}

// Persist data. Never throws; returns true/false for success.
export async function saveData(data) {
  try {
    const clean = normalizeData(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    return true;
  } catch (e) {
    return false;
  }
}

export async function clearAllStorage() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

let idCounter = 0;
export function makeId() {
  idCounter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `e_${Date.now().toString(36)}_${idCounter.toString(36)}_${rand}`;
}
