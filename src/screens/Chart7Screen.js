// 7-Day Chart — one bar per day with goal line + summary.
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen, Panel, DataRow, SectionHeader } from "../components/ui";
import { colors, spacing, font } from "../theme";
import { useApp } from "../AppContext";
import BarChart from "../components/BarChart";
import { rangeSeries, averageForRange, goalCompletionForRange } from "../utils/stats";
import { ml } from "../utils/format";

export default function Chart7Screen() {
  const app = useApp();
  const goal = app.dailyGoalMl;

  const series = useMemo(() => rangeSeries(app.entries, 7, goal), [app.entries, goal]);
  const avg = averageForRange(app.entries, 7, goal);
  const gc = goalCompletionForRange(app.entries, 7, goal);
  const weekTotal = series.reduce((s, d) => s + d.totalMl, 0);

  return (
    <Screen title="7-Day Chart" subtitle="Last 7 days">
      <Panel>
        <Text style={styles.summaryLabel}>7-day total</Text>
        <Text style={styles.summaryValue}>{ml(weekTotal)}</Text>
        <View style={styles.divider} />
        <BarChart series={series} goal={goal} mode="week" height={170} />
      </Panel>

      <SectionHeader>Summary</SectionHeader>
      <Panel>
        <DataRow label="Daily goal" value={ml(goal)} />
        <DataRow label="7-day average" value={avg > 0 ? ml(avg) : "No data yet"} />
        <DataRow label="Goal days" value={`${gc.reached} of ${gc.total}`} valueColor={colors.teal} />
        <DataRow label="Goal completion" value={`${gc.percent}%`} last />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryLabel: { color: colors.slate, fontSize: font.small, fontWeight: "600" },
  summaryValue: { color: colors.navy, fontSize: 26, fontWeight: "800", marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.md },
});
