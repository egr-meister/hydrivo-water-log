// Statistics — water analytics sheet with ledger-style data rows.
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen, Panel, SectionHeader, DataRow, Chip, EmptyState } from "../components/ui";
import { colors, spacing, font } from "../theme";
import { useApp } from "../AppContext";
import { useNavigation } from "../Navigation";
import {
  averageForRange,
  allTimeAverage,
  bestDay,
  goalCompletionForRange,
  allTimeGoalDays,
  totalLogged,
  totalEntries,
  distinctDays,
} from "../utils/stats";
import { formatDateLong } from "../utils/dates";
import { ml, groupNumber } from "../utils/format";

export default function StatisticsScreen() {
  const app = useApp();
  const nav = useNavigation();
  const goal = app.dailyGoalMl;

  const stats = useMemo(() => {
    return {
      avg7: averageForRange(app.entries, 7, goal),
      avg30: averageForRange(app.entries, 30, goal),
      avgAll: allTimeAverage(app.entries),
      best: bestDay(app.entries, goal),
      gc7: goalCompletionForRange(app.entries, 7, goal),
      gc30: goalCompletionForRange(app.entries, 30, goal),
      allGoalDays: allTimeGoalDays(app.entries, goal),
      totalMl: totalLogged(app.entries),
      count: totalEntries(app.entries),
      days: distinctDays(app.entries),
    };
  }, [app.entries, goal]);

  const hasData = stats.count > 0;

  return (
    <Screen title="Statistics" subtitle="Water analytics sheet">
      {!hasData ? (
        <EmptyState title="No data yet" subtitle="Add water records to see your statistics." />
      ) : null}

      <SectionHeader>Averages</SectionHeader>
      <Panel>
        <DataRow label="7-day average" value={stats.avg7 > 0 ? ml(stats.avg7) : "No data yet"} />
        <DataRow label="30-day average" value={stats.avg30 > 0 ? ml(stats.avg30) : "No data yet"} />
        <DataRow
          label="All-time average (per logged day)"
          value={stats.avgAll > 0 ? ml(stats.avgAll) : "No data yet"}
          last
        />
      </Panel>

      <SectionHeader>Best day</SectionHeader>
      <Panel>
        {stats.best ? (
          <>
            <DataRow label="Date" value={formatDateLong(stats.best.date)} />
            <DataRow label="Total" value={ml(stats.best.totalMl)} valueColor={colors.navy} />
            <DataRow
              label="Goal"
              value={stats.best.goalReached ? "Reached" : "Below goal"}
              valueColor={stats.best.goalReached ? colors.success : colors.slate}
              last
            />
          </>
        ) : (
          <Text style={styles.emptyRow}>No best day yet.</Text>
        )}
      </Panel>

      <SectionHeader>Goal completion</SectionHeader>
      <Panel>
        <DataRow
          label="Goal days (last 7)"
          value={`${stats.gc7.reached} of ${stats.gc7.total}`}
        />
        <DataRow label="7-day completion" value={`${stats.gc7.percent}%`} valueColor={colors.teal} />
        <DataRow
          label="Goal days (last 30)"
          value={`${stats.gc30.reached} of ${stats.gc30.total}`}
        />
        <DataRow label="30-day completion" value={`${stats.gc30.percent}%`} valueColor={colors.teal} />
        <DataRow label="All-time goal days" value={groupNumber(stats.allGoalDays)} last />
      </Panel>

      <SectionHeader>Totals</SectionHeader>
      <Panel>
        <DataRow label="Total logged water" value={ml(stats.totalMl)} />
        <DataRow label="Total entries" value={groupNumber(stats.count)} />
        <DataRow label="Days with records" value={groupNumber(stats.days)} last />
      </Panel>

      <View style={styles.navRow}>
        <Chip label="7-Day Chart" onPress={() => nav.navigate("Chart7")} />
        <Chip label="30-Day Chart" onPress={() => nav.navigate("Chart30")} />
        <Chip label="Export" onPress={() => nav.navigate("Export")} />
      </View>
      <Text style={styles.footnote}>Current daily goal: {ml(goal)}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyRow: { color: colors.muted, fontSize: font.body, paddingVertical: spacing.sm },
  navRow: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.sm },
  footnote: { color: colors.muted, fontSize: font.small, marginTop: spacing.sm },
});
