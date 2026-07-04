// Welcome / Onboarding — shown only on first launch.
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar } from "react-native";
import { colors, spacing, radius, font } from "../theme";
import { PrimaryButton, SecondaryButton } from "../components/ui";
import { useApp } from "../AppContext";

const ANDROID_TOP = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

const POINTS = [
  {
    title: "A practical log for daily water records",
    body: "Add water manually, review your daily list, and keep an organized history.",
  },
  {
    title: "History & statistics focused",
    body: "See 7-day and 30-day charts, averages, your best day, and goal completion.",
  },
  {
    title: "Everything stays on your device",
    body: "No account, no ads, no analytics, and no internet connection. Works fully offline.",
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View style={styles.mark}>
            <View style={styles.drop} />
            <View style={styles.bar} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.appName}>Hydrivo Water Log</Text>
            <Text style={styles.tagline}>Water Data Logbook</Text>
          </View>
        </View>

        {POINTS.map((p, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardIndex}>
              <Text style={styles.cardIndexText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{p.title}</Text>
              <Text style={styles.cardBody}>{p.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Hydrivo Water Log is a manual water log. It does not detect drinking automatically and
            does not connect to Health Connect, Google Fit, sensors, or wearable devices.
          </Text>
        </View>

        <View style={{ height: spacing.md }} />
        <PrimaryButton label="Start Logging" onPress={completeOnboarding} />
        <View style={{ height: spacing.md }} />
        <SecondaryButton label="Skip" onPress={completeOnboarding} />
        <Text style={styles.footer}>
          Water intake is entered manually. This app is not a medical app and does not provide
          medical advice.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingTop: ANDROID_TOP },
  body: { padding: spacing.xl, paddingBottom: spacing.xxl },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.xl, marginTop: spacing.lg },
  mark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.chipBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
    borderWidth: 1,
    borderColor: colors.chipBorder,
  },
  drop: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderTopLeftRadius: 3,
    backgroundColor: colors.navy,
    transform: [{ rotate: "45deg" }],
  },
  bar: { width: 24, height: 4, borderRadius: 2, backgroundColor: colors.cyan, marginTop: 6 },
  appName: { color: colors.navy, fontSize: 24, fontWeight: "800" },
  tagline: { color: colors.slate, fontSize: font.small, marginTop: 2, letterSpacing: 0.5 },
  card: {
    flexDirection: "row",
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardIndex: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  cardIndexText: { color: colors.white, fontWeight: "800", fontSize: font.body },
  cardTitle: { color: colors.navy, fontSize: font.h2, fontWeight: "700", marginBottom: 4 },
  cardBody: { color: colors.slate, fontSize: font.body, lineHeight: 20 },
  note: {
    backgroundColor: colors.panelAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  noteText: { color: colors.slate, fontSize: font.small, lineHeight: 19 },
  footer: { color: colors.muted, fontSize: font.tiny, textAlign: "center", marginTop: spacing.lg, lineHeight: 16 },
});
