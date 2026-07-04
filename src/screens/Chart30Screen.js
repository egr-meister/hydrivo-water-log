// 30-Day Chart — compact bars with summary above.
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen, Panel, DataRow, SectionHeader } from "../components/ui";
import { colors, spacing, font } from "../theme";
import { useApp } from "../AppContext";
import BarChart from "../components/BarChart";
import {
  rangeSeries,
  averageForRange,
  goalCompletionForRange,
  bestDay,
} from "../utils/stats";
import { formatDateLong } from "../utils/dates";
import { ml } from "../utils/format";

export default function Chart30Screen() {
  const app = useApp();
  const goal = app.dailyGoalMl;

  const series = useMemo(() => rangeSeries(app.entries, 30, goal), [app.entries, goal]);
  const avg = averageForRange(app.entries, 30, goal);
  const gc = goalCompletionForRange(app.entries, 30, goal);
  const best = bestDay(app.entries, goal);
  const monthTotal = series.reduce((s, d) => s + d.totalMl, 0);

  return (
    <Screen title="30-Day Chart" subtitle="Last 30 days">
      <Panel>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>30-day average</Text>
            <Text style={styles.summaryValue}>{avg > 0 ? ml(avg) : "—"}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.summaryLabel}>30-day total</Text>
            <Text style={styles.summaryValueSm}>{ml(monthTotal)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <BarChart series={series} goal={goal} mode="month" height={150} />
      </Panel>

      <SectionHeader>Summary</SectionHeader>
      <Panel>
        <DataRow label="Daily goal" value={ml(goal)} />
        <DataRow
          label="Best day (30d window)"
          value={best ? formatDateLong(best.date) : "No data yet"}
        />
        <DataRow label="Best day total" value={best ? ml(best.totalMl) : "—"} />
        <DataRow label="Goal days" value={`${gc.reached} of ${gc.total}`} valueColor={colors.teal} />
        <DataRow label="Goal completion" value={`${gc.percent}%`} last />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  summaryLabel: { color: colors.slate, fontSize: font.small, fontWeight: "600" },
  summaryValue: { color: colors.navy, fontSize: 26, fontWeight: "800", marginTop: 2 },
  summaryValueSm: { color: colors.navy, fontSize: font.h1, fontWeight: "800", marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.md },
});
