// Simple bar chart made from plain Views. No chart library.
// Handles empty data and missing days (0 ml) without crashing.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, font } from "../theme";
import { weekdayLetter, formatDateShort } from "../utils/dates";

// series: [{ date, totalMl, goalReached }]
// goal: number (draws a dashed goal line if within scale)
// mode: "week" (letters + values) | "month" (compact, sparse labels)
export default function BarChart({ series, goal, mode = "week", height = 160 }) {
  const data = Array.isArray(series) ? series : [];
  if (data.length === 0) {
    return (
      <View style={[styles.wrap, { height }]}>
        <Text style={styles.noData}>No data to chart yet.</Text>
      </View>
    );
  }

  const goalVal = Number(goal) > 0 ? Number(goal) : 0;
  const maxTotal = data.reduce((m, d) => Math.max(m, Number(d?.totalMl) || 0), 0);
  // Scale so the tallest bar (or the goal line) fits with headroom.
  const scaleMax = Math.max(maxTotal, goalVal, 1) * 1.15;
  const goalRatio = goalVal > 0 ? Math.min(1, goalVal / scaleMax) : 0;

  const isMonth = mode === "month";

  return (
    <View style={styles.wrap}>
      <View style={[styles.plot, { height }]}>
        {/* Goal reference line */}
        {goalRatio > 0 ? (
          <View
            pointerEvents="none"
            style={[styles.goalLine, { bottom: `${goalRatio * 100}%` }]}
          />
        ) : null}
        <View style={styles.bars}>
          {data.map((d, idx) => {
            const total = Math.max(0, Number(d?.totalMl) || 0);
            const ratio = scaleMax > 0 ? total / scaleMax : 0;
            const barH = Math.max(total > 0 ? 3 : 1, ratio * height);
            const reached = d?.goalReached === true;
            return (
              <View key={d?.date || String(idx)} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      isMonth && styles.barCompact,
                      {
                        height: barH,
                        backgroundColor: reached ? colors.success : colors.cyan,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.axis}>
        {data.map((d, idx) => {
          let label = "";
          if (!isMonth) {
            label = weekdayLetter(d?.date);
          } else {
            // Sparse labels for 30-day charts: show ~every 5th day.
            if (idx === 0 || idx === data.length - 1 || idx % 5 === 0) {
              label = formatDateShort(d?.date);
            }
          }
          return (
            <View key={(d?.date || idx) + "_ax"} style={styles.axisCol}>
              <Text style={[styles.axisLabel, isMonth && styles.axisLabelMonth]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Week mode: show ml values under each bar */}
      {!isMonth ? (
        <View style={styles.axis}>
          {data.map((d, idx) => (
            <View key={(d?.date || idx) + "_val"} style={styles.axisCol}>
              <Text style={styles.valueLabel} numberOfLines={1}>
                {Math.round(Math.max(0, Number(d?.totalMl) || 0))}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Goal reached</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.cyan }]} />
          <Text style={styles.legendText}>Below goal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDash} />
          <Text style={styles.legendText}>Goal line</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  noData: { color: colors.muted, fontSize: font.small, textAlign: "center", paddingTop: spacing.xl },
  plot: {
    width: "100%",
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: colors.lineStrong,
  },
  bars: { flexDirection: "row", alignItems: "flex-end", height: "100%" },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" },
  barTrack: { justifyContent: "flex-end", alignItems: "center", height: "100%", width: "100%" },
  bar: {
    width: "62%",
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    minHeight: 1,
  },
  barCompact: { width: "78%", borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  goalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.teal,
  },
  axis: { flexDirection: "row", marginTop: 4 },
  axisCol: { flex: 1, alignItems: "center" },
  axisLabel: { color: colors.slate, fontSize: font.tiny, fontWeight: "600" },
  axisLabelMonth: { fontSize: 9 },
  valueLabel: { color: colors.muted, fontSize: 9 },
  legendRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", marginTop: spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.sm },
  legendSwatch: { width: 10, height: 10, borderRadius: 3, marginRight: 4 },
  legendDash: {
    width: 14,
    height: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.teal,
    marginRight: 4,
  },
  legendText: { color: colors.muted, fontSize: font.tiny },
});
