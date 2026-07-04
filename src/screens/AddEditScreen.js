// Add / Edit Water Entry.
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { Screen, Panel, Chip, PrimaryButton, SecondaryButton } from "../components/ui";
import { colors, spacing, radius, font } from "../theme";
import { useApp } from "../AppContext";
import { useNavigation } from "../Navigation";
import { todayStr, nowTimeStr, isValidDateStr, isValidTimeStr } from "../utils/dates";
import { QUICK_AMOUNTS, MAX_ENTRY_ML } from "../storage/storage";

export default function AddEditScreen() {
  const app = useApp();
  const nav = useNavigation();
  const params = nav.current?.params || {};

  const editing = useMemo(() => {
    if (!params.id) return null;
    return app.entries.find((e) => e?.id === params.id) || null;
  }, [app.entries, params.id]);

  const isEdit = !!editing;

  const [amount, setAmount] = useState(editing ? String(editing.amountMl) : "");
  const [date, setDate] = useState(
    editing ? editing.date : isValidDateStr(params.date) ? params.date : todayStr()
  );
  const [time, setTime] = useState(editing ? editing.time || "" : nowTimeStr());
  const [label, setLabel] = useState(editing ? editing.label || "" : "");
  const [error, setError] = useState("");

  function validate() {
    const amt = Math.round(Number(amount));
    if (!amount || !isFinite(amt)) return "Enter an amount in ml.";
    if (!(amt > 0)) return "Amount must be greater than 0 ml.";
    if (amt > MAX_ENTRY_ML) return `Amount must not exceed ${MAX_ENTRY_ML} ml per entry.`;
    if (!isValidDateStr(date)) return "Date must use a valid YYYY-MM-DD format.";
    if (date > todayStr()) return "Date cannot be in the future.";
    if (time.trim() && !isValidTimeStr(time)) return "Time must use HH:mm (00:00–23:59) or be empty.";
    return "";
  }

  function onSave() {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    const payload = {
      date,
      time: time.trim() ? time.trim() : nowTimeStr(),
      amountMl: Math.round(Number(amount)),
      label: label.trim(),
    };
    if (isEdit) {
      app.updateEntry(editing.id, payload);
    } else {
      app.addEntry(payload);
    }
    nav.goBack();
  }

  function onDelete() {
    if (!isEdit) return;
    Alert.alert("Delete entry", "Remove this record permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          app.deleteEntry(editing.id);
          nav.goBack();
        },
      },
    ]);
  }

  return (
    <Screen title={isEdit ? "Edit Water Entry" : "Add Water Entry"} subtitle="Manual record">
      <Panel>
        <Text style={styles.fieldLabel}>Amount (ml)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={(t) => {
            setAmount(t.replace(/[^0-9]/g, ""));
            if (error) setError("");
          }}
          keyboardType="number-pad"
          placeholder="e.g. 250"
          placeholderTextColor={colors.muted}
          maxLength={4}
        />
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map((amt) => (
            <Chip
              key={amt}
              small
              label={`${amt}`}
              active={String(amt) === amount}
              onPress={() => {
                setAmount(String(amt));
                if (error) setError("");
              }}
            />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={(t) => {
            setDate(t.trim());
            if (error) setError("");
          }}
          placeholder="2026-07-03"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          maxLength={10}
        />

        <Text style={styles.fieldLabel}>Time (HH:mm)</Text>
        <TextInput
          style={styles.input}
          value={time}
          onChangeText={(t) => {
            setTime(t.trim());
            if (error) setError("");
          }}
          placeholder="Leave empty for current time"
          placeholderTextColor={colors.muted}
          maxLength={5}
        />

        <Text style={styles.fieldLabel}>Label (optional)</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Glass, Bottle"
          placeholderTextColor={colors.muted}
          maxLength={40}
        />
      </Panel>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <PrimaryButton label="Save Entry" onPress={onSave} />
      <View style={{ height: spacing.md }} />
      {isEdit ? (
        <SecondaryButton label="Delete Entry" tone="danger" onPress={onDelete} />
      ) : (
        <SecondaryButton label="Cancel" onPress={() => nav.goBack()} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    color: colors.slate,
    fontSize: font.small,
    fontWeight: "700",
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.h2,
    color: colors.navy,
  },
  quickRow: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.sm },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: font.small, fontWeight: "600" },
});
