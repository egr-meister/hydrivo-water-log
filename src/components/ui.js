// Shared UI building blocks for the "Water Data Logbook" look.
// Plain React Native primitives only — no external UI kits, no heavy assets.
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { colors, spacing, radius, font } from "../theme";
import { useNavigation } from "../Navigation";

const ANDROID_TOP = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

// Screen: top logbook header bar + scrollable body.
export function Screen({ title, subtitle, right, children, scroll = true, back = true }) {
  const nav = useNavigation();
  const showBack = back && nav.canGoBack;
  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? {
        contentContainerStyle: styles.scrollBody,
        keyboardShouldPersistTaps: "handled",
        showsVerticalScrollIndicator: false,
      }
    : { style: styles.plainBody };
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {showBack ? (
            <Pressable
              onPress={nav.goBack}
              hitSlop={10}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backChevron}>‹</Text>
            </Pressable>
          ) : (
            <View style={styles.headerMark}>
              <View style={styles.markDrop} />
              <View style={styles.markBar} />
            </View>
          )}
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {right ? <View style={styles.headerRight}>{right}</View> : null}
      </View>
      <View style={styles.rule} />
      <Body {...bodyProps}>{children}</Body>
    </View>
  );
}

// A pale-blue data panel / ledger card.
export function Panel({ children, style, tone = "panel" }) {
  return (
    <View style={[styles.panel, tone === "alt" && styles.panelAlt, style]}>
      {children}
    </View>
  );
}

export function SectionHeader({ children, right }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionHeader}>{children}</Text>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

// A ledger-style key/value row.
export function DataRow({ label, value, valueColor, last }) {
  return (
    <View style={[styles.dataRow, !last && styles.dataRowBorder]}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={[styles.dataValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

// Thin progress strip (NOT a circular ring).
export function ProgressStrip({ ratio }) {
  const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));
  const filled = clamped >= 1;
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${clamped * 100}%` },
          filled && styles.progressFilledFull,
        ]}
      />
    </View>
  );
}

// Small practical chip button (quick amounts, filters).
export function Chip({ label, onPress, active, small }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        small && styles.chipSmall,
        active && styles.chipActive,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress, disabled, tone = "primary" }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        tone === "danger" && styles.dangerBtn,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, tone = "default" }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryBtn,
        tone === "danger" && styles.secondaryDanger,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.secondaryBtnText,
          tone === "danger" && styles.secondaryDangerText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Small square icon-ish button for the header (uses text glyphs, no assets).
export function HeaderButton({ glyph, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.headerBtnGlyph}>{glyph}</Text>
    </Pressable>
  );
}

// A small tappable data/document tile (statistics / export shortcuts).
export function Tile({ title, value, hint, onPress, accent = colors.cyan }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.tileAccent, { backgroundColor: accent }]} />
      <Text style={styles.tileTitle}>{title}</Text>
      {value ? <Text style={styles.tileValue}>{value}</Text> : null}
      {hint ? <Text style={styles.tileHint}>{hint}</Text> : null}
    </Pressable>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyMark}>
        <View style={styles.emptyDrop} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingTop: ANDROID_TOP },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", marginLeft: spacing.sm },
  headerTitles: { flex: 1 },
  headerTitle: { color: colors.navy, fontSize: font.title, fontWeight: "700" },
  headerSubtitle: { color: colors.slate, fontSize: font.small, marginTop: 2 },
  headerMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.chipBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  markDrop: {
    width: 12,
    height: 12,
    borderRadius: 8,
    borderTopLeftRadius: 2,
    backgroundColor: colors.navy,
    transform: [{ rotate: "45deg" }],
  },
  markBar: {
    width: 16,
    height: 3,
    backgroundColor: colors.cyan,
    marginTop: 3,
    borderRadius: 2,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  backChevron: { color: colors.navy, fontSize: 26, lineHeight: 28, marginTop: -2 },
  rule: { height: 1, backgroundColor: colors.line, marginHorizontal: spacing.lg },
  scrollBody: { padding: spacing.lg, paddingBottom: spacing.xxl },
  plainBody: { flex: 1, padding: spacing.lg },

  panel: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  panelAlt: { backgroundColor: colors.panelAlt },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    color: colors.slate,
    fontSize: font.small,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  dataRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  dataLabel: { color: colors.slate, fontSize: font.body, flex: 1, paddingRight: spacing.sm },
  dataValue: { color: colors.navy, fontSize: font.body, fontWeight: "700" },

  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.panelAlt,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.teal,
    borderRadius: radius.pill,
  },
  progressFilledFull: { backgroundColor: colors.success },

  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSmall: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { color: colors.navy, fontSize: font.body, fontWeight: "600" },
  chipTextActive: { color: colors.white },

  primaryBtn: {
    backgroundColor: colors.cyan,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerBtn: { backgroundColor: colors.danger },
  primaryBtnText: { color: colors.white, fontSize: font.h2, fontWeight: "700" },
  btnDisabled: { opacity: 0.45 },

  secondaryBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  secondaryBtnText: { color: colors.navy, fontSize: font.h2, fontWeight: "700" },
  secondaryDanger: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  secondaryDangerText: { color: colors.danger },

  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
  },
  headerBtnGlyph: { fontSize: 18, color: colors.navy },

  tile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    overflow: "hidden",
  },
  tileAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  tileTitle: { color: colors.slate, fontSize: font.small, fontWeight: "700" },
  tileValue: { color: colors.navy, fontSize: font.h1, fontWeight: "800", marginTop: 6 },
  tileHint: { color: colors.muted, fontSize: font.tiny, marginTop: 4 },

  empty: { alignItems: "center", paddingVertical: spacing.xxl },
  emptyMark: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyDrop: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderTopLeftRadius: 3,
    backgroundColor: colors.cyan,
    transform: [{ rotate: "45deg" }],
  },
  emptyTitle: { color: colors.navy, fontSize: font.body, fontWeight: "700" },
  emptySubtitle: { color: colors.muted, fontSize: font.small, marginTop: 4, textAlign: "center" },

  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.md },

  pressed: { opacity: 0.7 },
});

export { styles as uiStyles };
