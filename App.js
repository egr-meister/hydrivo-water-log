// Hydrivo Water Log — app root.
// Wires the data provider, a dependency-free navigator, an onboarding gate,
// and the loading state. No external navigation library is used.
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "./src/AppContext";
import { NavigationProvider, useNavigation } from "./src/Navigation";
import { colors, font, spacing } from "./src/theme";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import DayLogScreen from "./src/screens/DayLogScreen";
import AddEditScreen from "./src/screens/AddEditScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import StatisticsScreen from "./src/screens/StatisticsScreen";
import Chart7Screen from "./src/screens/Chart7Screen";
import Chart30Screen from "./src/screens/Chart30Screen";
import ExportScreen from "./src/screens/ExportScreen";
import GoalSettingsScreen from "./src/screens/GoalSettingsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

function Router() {
  const nav = useNavigation();
  const name = nav.current?.name || "Home";

  switch (name) {
    case "Home":
      return <DayLogScreen isRoot />;
    case "Day":
      return <DayLogScreen isRoot={false} />;
    case "AddEdit":
      return <AddEditScreen />;
    case "History":
      return <HistoryScreen />;
    case "Statistics":
      return <StatisticsScreen />;
    case "Chart7":
      return <Chart7Screen />;
    case "Chart30":
      return <Chart30Screen />;
    case "Export":
      return <ExportScreen />;
    case "Goal":
      return <GoalSettingsScreen />;
    case "Settings":
      return <SettingsScreen />;
    default:
      return <DayLogScreen isRoot />;
  }
}

function Gate() {
  const { ready, settings } = useApp();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadMark}>
          <View style={styles.loadDrop} />
        </View>
        <Text style={styles.loadTitle}>Hydrivo Water Log</Text>
        <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  if (settings?.onboardingCompleted !== true) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationProvider initialRoute="Home">
      <Router />
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="dark" backgroundColor={colors.bg} />
      <Gate />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: RNStatusBar.currentHeight || 0,
  },
  loadMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  loadDrop: {
    width: 24,
    height: 24,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    backgroundColor: colors.navy,
    transform: [{ rotate: "45deg" }],
  },
  loadTitle: { color: colors.navy, fontSize: font.h1, fontWeight: "800" },
});
