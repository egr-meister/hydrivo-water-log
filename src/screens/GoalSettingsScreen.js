// Goal Settings — edit the daily water goal.
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Screen, Panel, Chip, PrimaryButton, SecondaryButton, DataRow } from "../components/ui";
import { colors, spacing, radius, font } from "../theme";
import { useApp } from "../AppContext";
import { useNavigation } from "../Navigation";
import { DEFAULT_GOAL_ML, MAX_GOAL_ML } from "../storage/storage";
import { ml } from "../utils/format";

const PRESETS = [1500, 2000, 2500, 3000];

export default function GoalSettingsScreen() {
  const app = useApp();
  const nav = useNavigation();
  const [value, setValue] = useState(String(app.dailyGoalMl));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function onSave() {
    const g = Math.round(Number(value));
    if (!value || !isFinite(g) || !(g > 0)) {
      setError("Goal must be greater than 0 ml.");
      return;
    }
    if (g > MAX_GOAL_ML) {
      setError(`Goal should not exceed ${MAX_GOAL_ML} ml.`);
      return;
    }
    const ok = app.setGoal(g);
    if (!ok) {
      setError("Please enter a valid goal between 1 and 10000 ml.");
      return;
    }
    setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function onReset() {
    app.resetGoal();
    setValue(String(DEFAULT_GOAL_ML));
    setError("");
  }

  return (
    <Screen title="Daily Goal" subtitle="Water target">
      <Panel>
        <DataRow label="Current daily goal" value={ml(app.dailyGoalMl)} last />
      </Panel>

      <Panel>
        <Text style={styles.fieldLabel}>Daily goal (ml)</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(t) => {
            setValue(t.replace(/[^0-9]/g, ""));
            if (error) setError("");
          }}
          keyboardType="number-pad"
          placeholder="2000"
          placeholderTextColor={colors.muted}
          maxLength={5}
        />
        <View style={styles.presetRow}>
          {PRESETS.map((p) => (
            <Chip
              key={p}
              small
              label={`${p}`}
              active={String(p) === value}
              onPress={() => {
                setValue(String(p));
                if (error) setError("");
              }}
            />
          ))}
        </View>
      </Panel>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {saved ? <Text style={styles.savedText}>Goal saved ✓</Text> : null}

      <PrimaryButton label="Save Goal" onPress={onSave} />
      <View style={{ height: spacing.md }} />
      <SecondaryButton label="Reset to Default (2000 ml)" onPress={onReset} />
      <View style={{ height: spacing.md }} />
      <SecondaryButton label="Back" onPress={() => nav.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { color: colors.slate, fontSize: font.small, fontWeight: "700", marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.h1,
    color: colors.navy,
  },
  presetRow: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.md },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: font.small, fontWeight: "600" },
  savedText: { color: colors.success, fontSize: font.small, fontWeight: "700", marginBottom: spacing.md },
});
