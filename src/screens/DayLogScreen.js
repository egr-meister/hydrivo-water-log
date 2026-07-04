// Daily Water Log — the main logbook screen. Also reused to open any day
// from History (route "Day" with a { date } param). Route "Home" is the root
// and defaults to today.
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Screen, Panel, ProgressStrip, Chip, HeaderButton, Tile, EmptyState, DataRow } from "../components/ui";
import { colors, spacing, radius, font } from "../theme";
import { useApp } from "../AppContext";
import { useNavigation } from "../Navigation";
import { todayStr, addDays, isToday, formatDateLong, isValidDateStr } from "../utils/dates";
import { entriesForDate, dailyTotal } from "../utils/stats";
import { QUICK_AMOUNTS } from "../storage/storage";
import { ml, groupNumber, pct } from "../utils/format";

export default function DayLogScreen({ isRoot }) {
  const app = useApp();
  const nav = useNavigation();

  const paramDate = nav.current?.params?.date;
  const initialDate = isValidDateStr(paramDate) ? paramDate : todayStr();
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const goal = app.dailyGoalMl;
  const dayEntries = useMemo(() => {
    const list = entriesForDate(app.entries, selectedDate);
    // newest first by time
    return list.slice().sort((a, b) => {
      const ta = a?.time || "";
      const tb = b?.time || "";
      if (ta !== tb) return ta < tb ? 1 : -1;
      const ca = a?.createdAt || "";
      const cb = b?.createdAt || "";
      return ca < cb ? 1 : -1;
    });
  }, [app.entries, selectedDate]);

  const total = dailyTotal(app.entries, selectedDate);
  const ratio = goal > 0 ? total / goal : 0;

  function quickAdd(amount) {
    app.addEntry({ date: selectedDate, amountMl: amount, label: "" });
  }

  function confirmDeleteEntry(entry) {
    Alert.alert(
      "Delete entry",
      `Remove this ${groupNumber(entry?.amountMl)} ml record?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => app.deleteEntry(entry?.id) },
      ]
    );
  }

  function confirmClearDay() {
    if (dayEntries.length === 0) return;
    Alert.alert(
      "Clear this day",
      `Delete all ${dayEntries.length} record(s) for ${selectedDate}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear day", style: "destructive", onPress: () => app.clearDay(selectedDate) },
      ]
    );
  }

  const goalText = goalStatus(total, goal);

  return (
    <Screen
      title="Hydrivo Water Log"
      subtitle="Water Data Logbook"
      back={!isRoot}
      right={
        isRoot ? (
          <HeaderButton glyph="⚙" label="Settings" onPress={() => nav.navigate("Settings")} />
        ) : null
      }
    >
      {/* Date tab strip */}
      <View style={styles.dateTabRow}>
        <Pressable
          onPress={() => setSelectedDate((d) => addDays(d, -1))}
          hitSlop={8}
          style={({ pressed }) => [styles.dateNav, pressed && styles.pressed]}
          accessibilityLabel="Previous day"
        >
          <Text style={styles.dateNavGlyph}>‹</Text>
        </Pressable>
        <View style={styles.dateTab}>
          <Text style={styles.dateTabMain}>{formatDateLong(selectedDate)}</Text>
          <Text style={styles.dateTabSub}>{isToday(selectedDate) ? "Today" : selectedDate}</Text>
        </View>
        <Pressable
          onPress={() => {
            const next = addDays(selectedDate, 1);
            if (next <= todayStr()) setSelectedDate(next);
          }}
          hitSlop={8}
          disabled={isToday(selectedDate)}
          style={({ pressed }) => [
            styles.dateNav,
            isToday(selectedDate) && styles.dateNavDisabled,
            pressed && styles.pressed,
          ]}
          accessibilityLabel="Next day"
        >
          <Text style={styles.dateNavGlyph}>›</Text>
        </Pressable>
      </View>

      {/* Ledger header: daily total + goal strip */}
      <Panel>
        <View style={styles.ledgerHeadRow}>
          <View>
            <Text style={styles.ledgerLabel}>Daily total</Text>
            <Text style={styles.ledgerTotal}>{ml(total)}</Text>
          </View>
          <View style={styles.goalBadge}>
            <Text style={styles.goalBadgePct}>{pct(ratio)}%</Text>
            <Text style={styles.goalBadgeLabel}>of goal</Text>
          </View>
        </View>
        <View style={{ height: spacing.sm }} />
        <ProgressStrip ratio={ratio} />
        <Text style={styles.goalStatus}>{goalText}</Text>
      </Panel>

      {/* Quick add chips */}
      <Text style={styles.quickLabel}>Quick add</Text>
      <View style={styles.quickRow}>
        {QUICK_AMOUNTS.map((amt) => (
          <Chip key={amt} label={`+${amt} ml`} onPress={() => quickAdd(amt)} />
        ))}
        <Chip
          label="+ Custom"
          active
          onPress={() => nav.navigate("AddEdit", { date: selectedDate })}
        />
      </View>

      {/* Entry list */}
      <View style={styles.listHeadRow}>
        <Text style={styles.listHead}>Records ({dayEntries.length})</Text>
        {dayEntries.length > 0 ? (
          <Pressable onPress={confirmClearDay} hitSlop={6}>
            <Text style={styles.clearDay}>Clear day</Text>
          </Pressable>
        ) : null}
      </View>

      {dayEntries.length === 0 ? (
        <EmptyState
          title="No water entries for this day."
          subtitle="Add your first manual record."
        />
      ) : (
        <View style={styles.logCard}>
          {dayEntries.map((e, idx) => (
            <View
              key={e.id}
              style={[styles.logRow, idx !== dayEntries.length - 1 && styles.logRowBorder]}
            >
              <View style={styles.logTimeCol}>
                <Text style={styles.logTime}>{e.time || "--:--"}</Text>
              </View>
              <View style={styles.logMain}>
                <Text style={styles.logAmount}>{ml(e.amountMl)}</Text>
                {e.label ? <Text style={styles.logLabel}>{e.label}</Text> : null}
              </View>
              <Pressable
                onPress={() => nav.navigate("AddEdit", { id: e.id })}
                hitSlop={6}
                style={({ pressed }) => [styles.rowBtn, pressed && styles.pressed]}
                accessibilityLabel="Edit entry"
              >
                <Text style={styles.rowBtnText}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => confirmDeleteEntry(e)}
                hitSlop={6}
                style={({ pressed }) => [styles.rowBtn, pressed && styles.pressed]}
                accessibilityLabel="Delete entry"
              >
                <Text style={[styles.rowBtnText, styles.rowBtnDanger]}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Shortcut tiles */}
      {isRoot ? (
        <View style={styles.tileRow}>
          <Tile
            title="STATISTICS"
            value="Analytics"
            hint="Averages, best day, goals"
            accent={colors.cyan}
            onPress={() => nav.navigate("Statistics")}
          />
          <View style={{ width: spacing.md }} />
          <Tile
            title="EXPORT"
            value="CSV / Text"
            hint="Preview & copy records"
            accent={colors.teal}
            onPress={() => nav.navigate("Export")}
          />
        </View>
      ) : null}

      {isRoot ? (
        <View style={styles.navRow}>
          <Chip label="History" onPress={() => nav.navigate("History")} />
          <Chip label="7-Day Chart" onPress={() => nav.navigate("Chart7")} />
          <Chip label="30-Day Chart" onPress={() => nav.navigate("Chart30")} />
          <Chip label="Goal" onPress={() => nav.navigate("Goal")} />
        </View>
      ) : (
        <View style={styles.navRow}>
          <Chip label="Add record" active onPress={() => nav.navigate("AddEdit", { date: selectedDate })} />
        </View>
      )}
    </Screen>
  );
}

function goalStatus(total, goal) {
  const g = goal > 0 ? goal : 2000;
  if (total <= 0) return "No water logged yet";
  if (total >= g) return "Goal reached";
  return `${groupNumber(total)} of ${groupNumber(g)} ml`;
}

const styles = StyleSheet.create({
  dateTabRow: { flexDirection: "row", alignItems: "stretch", marginBottom: spacing.md },
  dateNav: {
    width: 40,
    borderRadius: radius.md,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  dateNavDisabled: { opacity: 0.4 },
  dateNavGlyph: { fontSize: 24, color: colors.navy, marginTop: -2 },
  dateTab: {
    flex: 1,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  dateTabMain: { color: colors.white, fontSize: font.h2, fontWeight: "700" },
  dateTabSub: { color: "#AFC6DC", fontSize: font.tiny, marginTop: 2 },
  pressed: { opacity: 0.7 },

  ledgerHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  ledgerLabel: { color: colors.slate, fontSize: font.small, fontWeight: "600" },
  ledgerTotal: { color: colors.navy, fontSize: 30, fontWeight: "800", marginTop: 2 },
  goalBadge: { alignItems: "flex-end" },
  goalBadgePct: { color: colors.teal, fontSize: 22, fontWeight: "800" },
  goalBadgeLabel: { color: colors.muted, fontSize: font.tiny },
  goalStatus: { color: colors.slate, fontSize: font.small, marginTop: spacing.sm },

  quickLabel: {
    color: colors.slate,
    fontSize: font.small,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  quickRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },

  listHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  listHead: { color: colors.navy, fontSize: font.h2, fontWeight: "700" },
  clearDay: { color: colors.danger, fontSize: font.small, fontWeight: "700" },

  logCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  logRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  logRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  logTimeCol: {
    width: 52,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    marginRight: spacing.md,
    paddingRight: spacing.sm,
  },
  logTime: { color: colors.slate, fontSize: font.small, fontWeight: "700" },
  logMain: { flex: 1 },
  logAmount: { color: colors.navy, fontSize: font.body, fontWeight: "700" },
  logLabel: { color: colors.muted, fontSize: font.small, marginTop: 2 },
  rowBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  rowBtnText: { color: colors.cyan, fontSize: font.small, fontWeight: "700" },
  rowBtnDanger: { color: colors.danger },

  tileRow: { flexDirection: "row", marginTop: spacing.md },
  navRow: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.lg },
});
