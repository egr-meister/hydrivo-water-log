// Settings — toggles, shortcuts, data management, disclaimers, privacy.
import React from "react";
import { View, Text, Switch, Pressable, StyleSheet, Alert } from "react-native";
import { Screen, Panel, SectionHeader } from "../components/ui";
import { colors, spacing, radius, font } from "../theme";
import { useApp } from "../AppContext";
import { useNavigation } from "../Navigation";
import { ml } from "../utils/format";

function Row({ label, hint, onPress, right, danger }) {
  const content = (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && styles.dangerLabel]}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      {right ? right : onPress ? <Text style={styles.chevron}>›</Text> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const app = useApp();
  const nav = useNavigation();

  function confirmDeleteRecords() {
    Alert.alert(
      "Delete all water records",
      "This permanently removes every water entry. Your goal and settings are kept. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete records", style: "destructive", onPress: () => app.deleteAllEntries() },
      ]
    );
  }

  function confirmResetAll() {
    Alert.alert(
      "Reset all local data",
      "This erases all records, your goal, and settings, and restores defaults. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset everything",
          style: "destructive",
          onPress: async () => {
            await app.resetAllData();
            nav.reset("Home");
          },
        },
      ]
    );
  }

  function showOnboarding() {
    app.showOnboardingAgain();
    nav.reset("Home");
  }

  return (
    <Screen title="Settings" subtitle="Preferences & data">
      <SectionHeader>Preferences</SectionHeader>
      <Panel style={styles.panel}>
        <Row
          label="Compact mode"
          hint="Tighter spacing in lists (visual only)."
          right={
            <Switch
              value={app.settings?.compactMode === true}
              onValueChange={(v) => app.setCompactMode(v)}
              trackColor={{ true: colors.teal, false: colors.lineStrong }}
              thumbColor={colors.white}
            />
          }
        />
        <View style={styles.sep} />
        <Row
          label="Daily water goal"
          hint={`Current: ${ml(app.dailyGoalMl)}`}
          onPress={() => nav.navigate("Goal")}
        />
        <View style={styles.sep} />
        <Row label="Export records" hint="CSV or plain text preview." onPress={() => nav.navigate("Export")} />
      </Panel>

      <SectionHeader>Data</SectionHeader>
      <Panel style={styles.panel}>
        <Row label="Show onboarding again" onPress={showOnboarding} />
        <View style={styles.sep} />
        <Row label="Delete all water records" danger onPress={confirmDeleteRecords} />
        <View style={styles.sep} />
        <Row label="Reset all local data" danger onPress={confirmResetAll} />
      </Panel>

      <SectionHeader>Manual tracking</SectionHeader>
      <Panel>
        <Text style={styles.bodyText}>
          Hydrivo Water Log is a manual water log. It does not detect drinking automatically and does
          not connect to Health Connect, Google Fit, sensors, or wearable devices. Water intake is
          entered manually.
        </Text>
      </Panel>

      <SectionHeader>Privacy</SectionHeader>
      <Panel>
        <Text style={styles.bodyText}>
          Hydrivo Water Log stores water records, goals, and statistics only on this device. No
          account, no ads, no analytics, no internet connection, no sensors, no Google Fit, and no
          Health Connect.
        </Text>
      </Panel>

      <SectionHeader>App information</SectionHeader>
      <Panel style={styles.panel}>
        <Row label="Hydrivo Water Log" hint="Version 1.0.0" />
        <View style={styles.sep} />
        <Row label="Type" hint="Offline manual water log utility. Not a medical app." />
        <View style={styles.sep} />
        <Row label="Works offline" hint="Fully functional in airplane mode." />
      </Panel>

      <Text style={styles.footer}>
        This app is not a medical app and does not provide medical advice, diagnosis, or treatment.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { paddingVertical: spacing.xs },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
  rowLabel: { color: colors.navy, fontSize: font.body, fontWeight: "600" },
  dangerLabel: { color: colors.danger },
  rowHint: { color: colors.muted, fontSize: font.small, marginTop: 3 },
  chevron: { color: colors.muted, fontSize: 22, marginLeft: spacing.sm },
  sep: { height: 1, backgroundColor: colors.line },
  bodyText: { color: colors.slate, fontSize: font.body, lineHeight: 21 },
  footer: { color: colors.muted, fontSize: font.tiny, textAlign: "center", marginTop: spacing.md, lineHeight: 16 },
  pressed: { opacity: 0.6 },
});
