// History — reverse chronological daily cards with range filters.
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Screen, Chip, EmptyState } from "../components/ui";
import { colors, spacing, radius, font } from "../theme";
import { useApp } from "../AppContext";
import { useNavigation } from "../Navigation";
import { historyCards } from "../utils/stats";
import { todayStr, addDays, formatDateLong } from "../utils/dates";
import { ml } from "../utils/format";

const FILTERS = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "all", label: "All" },
];

export default function HistoryScreen() {
  const app = useApp();
  const nav = useNavigation();
  const [filter, setFilter] = useState("30");

  const cards = useMemo(() => {
    const all = historyCards(app.entries, app.dailyGoalMl);
    if (filter === "all") return all;
    const n = filter === "7" ? 7 : 30;
    const start = addDays(todayStr(), -(n - 1));
    return all.filter((c) => c.date >= start);
  }, [app.entries, app.dailyGoalMl, filter]);

  return (
    <Screen title="History" subtitle="Daily totals ledger">
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            small
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </View>

      {cards.length === 0 ? (
        <EmptyState title="No history in this range." subtitle="Log water to build your history." />
      ) : (
        cards.map((c) => (
          <Pressable
            key={c.date}
            onPress={() => nav.navigate("Day", { date: c.date })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            accessibilityLabel={`Open ${c.date}`}
          >
            <View style={[styles.accent, { backgroundColor: c.goalReached ? colors.success : colors.cyan }]} />
            <View style={styles.cardMain}>
              <Text style={styles.cardDate}>{formatDateLong(c.date)}</Text>
              <Text style={styles.cardMeta}>
                {c.entryCount} record{c.entryCount === 1 ? "" : "s"}
                {"  •  "}
                {c.goalReached ? "Goal reached" : "Below goal"}
              </Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardTotal}>{ml(c.totalMl)}</Text>
              <Text style={styles.openHint}>Open ›</Text>
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.sm,
    overflow: "hidden",
    paddingRight: spacing.lg,
  },
  accent: { width: 6, alignSelf: "stretch" },
  cardMain: { flex: 1, paddingVertical: spacing.md, paddingLeft: spacing.lg },
  cardDate: { color: colors.navy, fontSize: font.body, fontWeight: "700" },
  cardMeta: { color: colors.muted, fontSize: font.small, marginTop: 3 },
  cardRight: { alignItems: "flex-end" },
  cardTotal: { color: colors.navy, fontSize: font.h2, fontWeight: "800" },
  openHint: { color: colors.cyan, fontSize: font.tiny, fontWeight: "700", marginTop: 2 },
  pressed: { opacity: 0.7 },
});
