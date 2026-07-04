// Export — document preview panel with range + format controls and a
// copy-to-clipboard action. No storage permission, no file access, no network.
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Screen, Panel, Chip, PrimaryButton, SectionHeader } from "../components/ui";
import { colors, spacing, radius, font } from "../theme";
import { useApp } from "../AppContext";
import { buildExport, filterByRange, rangeLabel } from "../utils/exportData";

const RANGES = [
  { key: "all", label: "All records" },
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
];
const FORMATS = [
  { key: "csv", label: "CSV" },
  { key: "text", label: "Plain text" },
];

export default function ExportScreen() {
  const app = useApp();
  const [range, setRange] = useState("all");
  const [format, setFormat] = useState("csv");
  const [copied, setCopied] = useState(false);

  const filteredCount = useMemo(
    () => filterByRange(app.entries, range).length,
    [app.entries, range]
  );

  const preview = useMemo(
    () => buildExport(app.entries, range, format),
    [app.entries, range, format]
  );

  const hasData = filteredCount > 0;

  async function copyToClipboard() {
    if (!hasData) return;
    try {
      await Clipboard.setStringAsync(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      Alert.alert("Copy failed", "Could not copy to the clipboard on this device.");
    }
  }

  return (
    <Screen title="Export" subtitle="Document preview">
      <SectionHeader>Range</SectionHeader>
      <View style={styles.row}>
        {RANGES.map((r) => (
          <Chip
            key={r.key}
            small
            label={r.label}
            active={range === r.key}
            onPress={() => setRange(r.key)}
          />
        ))}
      </View>

      <SectionHeader>Format</SectionHeader>
      <View style={styles.row}>
        {FORMATS.map((f) => (
          <Chip
            key={f.key}
            small
            label={f.label}
            active={format === f.key}
            onPress={() => setFormat(f.key)}
          />
        ))}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {rangeLabel(range)} • {format === "csv" ? "CSV" : "Plain text"} • {filteredCount} record
          {filteredCount === 1 ? "" : "s"}
        </Text>
      </View>

      {/* Document preview */}
      <View style={styles.docWrap}>
        <View style={styles.docHeader}>
          <View style={styles.docDot} />
          <View style={styles.docDot} />
          <View style={styles.docDot} />
          <Text style={styles.docTitle}>
            {format === "csv" ? "export.csv" : "export.txt"}
          </Text>
        </View>
        <ScrollView
          style={styles.docBody}
          contentContainerStyle={styles.docContent}
          nestedScrollEnabled
          horizontal={false}
        >
          {hasData ? (
            <Text style={styles.mono} selectable>
              {preview}
            </Text>
          ) : (
            <Text style={styles.emptyDoc}>No records to export.</Text>
          )}
        </ScrollView>
      </View>

      <PrimaryButton
        label={copied ? "Copied to clipboard ✓" : "Copy to clipboard"}
        onPress={copyToClipboard}
        disabled={!hasData}
      />
      <Text style={styles.note}>
        Export stays on your device. Copy the text above and paste it anywhere you like. No storage
        permission, file access, internet, or cloud upload is used.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.sm },
  metaRow: { marginBottom: spacing.sm },
  metaText: { color: colors.slate, fontSize: font.small, fontWeight: "600" },
  docWrap: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: spacing.md,
    backgroundColor: "#0F1F33",
  },
  docHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.navy,
  },
  docDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#3C5470", marginRight: 6 },
  docTitle: { color: "#AFC6DC", fontSize: font.small, fontWeight: "700", marginLeft: spacing.sm },
  docBody: { maxHeight: 320 },
  docContent: { padding: spacing.md },
  mono: {
    color: "#DCE9F5",
    fontSize: font.small,
    fontFamily: "monospace",
    lineHeight: 20,
  },
  emptyDoc: { color: "#8AA2BC", fontSize: font.body, fontStyle: "italic" },
  note: { color: colors.muted, fontSize: font.tiny, marginTop: spacing.md, lineHeight: 16 },
});
