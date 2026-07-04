// Central app state. Loads from AsyncStorage on mount, exposes data + safe
// mutators, and persists every change. All mutators are guarded so bad input
// can never corrupt state or crash the app.
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  loadData,
  saveData,
  clearAllStorage,
  makeId,
  normalizeSettings,
  DEFAULT_SETTINGS,
  DEFAULT_GOAL_ML,
  MAX_ENTRY_ML,
  MAX_GOAL_ML,
} from "./storage/storage";
import { nowISO, todayStr, nowTimeStr } from "./utils/dates";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [entries, setEntries] = useState([]);

  // Keep latest values in refs so persist() always saves current state.
  const settingsRef = useRef(settings);
  const entriesRef = useRef(entries);
  settingsRef.current = settings;
  entriesRef.current = entries;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadData();
      if (!mounted) return;
      setSettings(data.settings);
      setEntries(data.entries);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function persist(nextSettings, nextEntries) {
    const s = nextSettings || settingsRef.current;
    const e = nextEntries || entriesRef.current;
    await saveData({ settings: s, entries: e });
  }

  // --- Entry mutators -----------------------------------------------------

  // Add a new entry. Returns the created entry or null if invalid.
  function addEntry({ date, time, amountMl, label }) {
    const amount = Math.round(Number(amountMl) || 0);
    if (!(amount > 0)) return null;
    const clampedAmount = Math.min(MAX_ENTRY_ML, amount);
    const now = nowISO();
    const entry = {
      id: makeId(),
      date: typeof date === "string" && date ? date : todayStr(),
      time: typeof time === "string" && time ? time : nowTimeStr(),
      amountMl: clampedAmount,
      label: typeof label === "string" ? label.trim() : "",
      createdAt: now,
      updatedAt: now,
    };
    const next = [entry, ...entriesRef.current];
    setEntries(next);
    persist(null, next);
    return entry;
  }

  function updateEntry(id, patch) {
    if (!id) return;
    let changed = false;
    const next = entriesRef.current.map((e) => {
      if (e?.id !== id) return e;
      changed = true;
      const amountRaw =
        patch?.amountMl !== undefined
          ? Math.round(Number(patch.amountMl) || 0)
          : e.amountMl;
      const amount = Math.min(MAX_ENTRY_ML, Math.max(0, amountRaw));
      return {
        ...e,
        date:
          patch?.date !== undefined && typeof patch.date === "string" && patch.date
            ? patch.date
            : e.date,
        time:
          patch?.time !== undefined && typeof patch.time === "string"
            ? patch.time
            : e.time,
        amountMl: amount,
        label:
          patch?.label !== undefined && typeof patch.label === "string"
            ? patch.label.trim()
            : e.label,
        updatedAt: nowISO(),
      };
    });
    if (!changed) return;
    setEntries(next);
    persist(null, next);
  }

  function deleteEntry(id) {
    if (!id) return;
    const next = entriesRef.current.filter((e) => e?.id !== id);
    setEntries(next);
    persist(null, next);
  }

  // Remove all entries for a given date.
  function clearDay(date) {
    if (!date) return;
    const next = entriesRef.current.filter((e) => e?.date !== date);
    setEntries(next);
    persist(null, next);
  }

  function deleteAllEntries() {
    setEntries([]);
    persist(null, []);
  }

  // --- Settings mutators --------------------------------------------------

  function updateSettings(patch) {
    const next = normalizeSettings({ ...settingsRef.current, ...(patch || {}) });
    setSettings(next);
    persist(next, null);
  }

  // Set daily goal. Returns true if applied, false if invalid.
  function setGoal(goalMl) {
    const g = Math.round(Number(goalMl) || 0);
    if (!(g > 0) || g > MAX_GOAL_ML) return false;
    updateSettings({ dailyGoalMl: g });
    return true;
  }

  function resetGoal() {
    updateSettings({ dailyGoalMl: DEFAULT_GOAL_ML });
  }

  function setCompactMode(value) {
    updateSettings({ compactMode: value === true });
  }

  function completeOnboarding() {
    updateSettings({ onboardingCompleted: true });
  }

  function showOnboardingAgain() {
    updateSettings({ onboardingCompleted: false });
  }

  // Reset EVERYTHING (entries + settings) to defaults, and clear storage.
  async function resetAllData() {
    setSettings({ ...DEFAULT_SETTINGS });
    setEntries([]);
    await clearAllStorage();
  }

  const dailyGoalMl = Math.max(
    1,
    Number(settings?.dailyGoalMl ?? DEFAULT_GOAL_ML)
  );

  const value = useMemo(
    () => ({
      ready,
      settings,
      entries,
      dailyGoalMl,
      addEntry,
      updateEntry,
      deleteEntry,
      clearDay,
      deleteAllEntries,
      updateSettings,
      setGoal,
      resetGoal,
      setCompactMode,
      completeOnboarding,
      showOnboardingAgain,
      resetAllData,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, settings, entries, dailyGoalMl]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    // Defensive fallback so a hook used outside provider never crashes.
    return {
      ready: false,
      settings: { ...DEFAULT_SETTINGS },
      entries: [],
      dailyGoalMl: DEFAULT_GOAL_ML,
      addEntry: () => null,
      updateEntry: () => {},
      deleteEntry: () => {},
      clearDay: () => {},
      deleteAllEntries: () => {},
      updateSettings: () => {},
      setGoal: () => false,
      resetGoal: () => {},
      setCompactMode: () => {},
      completeOnboarding: () => {},
      showOnboardingAgain: () => {},
      resetAllData: async () => {},
    };
  }
  return ctx;
}
