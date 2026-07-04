# Hydrivo Water Log

A practical, offline, manual water tracker for Android. Hydrivo Water Log is focused on **records, history, and statistics** — a calm water data logbook, not a bottle animation or a habit ring.

Built with React Native + Expo. Android-focused, portrait only, fully offline.

---

## 1. Project description

Hydrivo Water Log lets you manually record how much water you drink, review each day's entries, and study your intake over time. Everything is stored locally on the device — there is no backend, no account, and no internet connection. The app works fully in airplane mode.

The design language is **"Hydrivo Clean Water Ledger"**: clean white background, deep navy text, muted cyan accents, pale blue data panels, and light gray ledger lines. The main screen is a daily logbook of records; the statistics screen is a compact water analytics sheet; the export screen is a document preview.

## 2. Features

- Manually log water intake with quick amounts (150, 250, 330, 500 ml) or a custom amount.
- Per-day entry list with time, amount, and optional label.
- Edit and delete individual entries; clear a whole day (with confirmation).
- Set and edit a daily water goal (default 2000 ml).
- 7-day and 30-day bar charts drawn with plain views (no chart library).
- Average water intake (7-day, 30-day, and all-time).
- Best day detection.
- Goal completion statistics (7-day, 30-day, all-time).
- Export records as CSV or plain text with copy-to-clipboard.
- History screen with reverse-chronological daily cards and range filters.
- Everything stored locally with AsyncStorage.

## 3. Manual tracking disclaimer

> Hydrivo Water Log is a manual water log. It does not detect drinking automatically and does not connect to Health Connect, Google Fit, sensors, or wearable devices.

Water intake is entered manually. This disclaimer appears in onboarding, in Settings, and here in the README.

## 4. Offline-first explanation

The app never makes a network request. All data lives on the device in AsyncStorage. Opening, logging, editing, charting, and exporting all work with no connectivity.

## 5. No internet / no permissions

The app does not request any runtime permission and does not require: internet, location, camera, microphone, contacts, storage/gallery, files, notifications, calendar, alarms, activity recognition, body sensors, physical activity, Google Fit, Health Connect, or wearable access. The Android manifest does **not** include the `INTERNET` permission — this is enforced twice: via `android.blockedPermissions` in `app.json` and via the local config plugin `plugins/withNoInternetPermission.js`, which strips `INTERNET`/network-state permissions from the merged manifest during prebuild.

## 6. No sensors

The app reads no device sensors of any kind. There is no accelerometer, step, or body-sensor usage.

## 7. No Google Fit

The app does not integrate with Google Fit and includes no Google Fit SDK.

## 8. No Health Connect

The app does not integrate with Health Connect and includes no Health Connect SDK.

## 9. No wearable integration

The app does not connect to smartwatches or any wearable device.

## 10. No automatic water detection

The app cannot and does not detect drinking. Every record is entered by hand.

## 11. Non-medical disclaimer

Hydrivo Water Log is a personal log utility. It is **not** a medical app. It does not provide medical advice, does not diagnose dehydration or any condition, and does not offer treatment. It makes no medical claims.

## 12. Airplane mode support

Turn on airplane mode and the app behaves identically: log, edit, chart, and export all function offline.

## 13. Local storage explanation

All app data is stored in a single JSON object under one AsyncStorage key (`hydrivo_water_log_v1`). On load the data is merged with safe defaults, missing fields are filled, and corrupted JSON falls back to defaults. Data survives app restarts.

## 14. Daily water entry list

Each day shows the selected date, the daily total, goal progress, and a list of records. Each record row shows time, amount, an optional label, and Edit/Delete actions.

## 15. Edit / delete records

You can edit an entry's amount, date, time, and label, or delete it after a confirmation. Deleting recalculates daily totals and statistics. Deleting the last entry for a day is handled safely.

## 16. Daily goal

The daily goal defaults to 2000 ml and can be changed on the Goal screen or from Settings. Progress is `dailyTotal / dailyGoal`, capped visually at 100% while still showing the real total. If the goal is missing or 0, the app uses 2000 ml.

## 17. 7-day and 30-day charts

Both charts are built from plain React Native views — vertical bars, a dashed goal line, and day labels. The 7-day chart shows one bar per day with ml values; the 30-day chart shows compact bars with sparse labels and a summary above. Missing days count as 0 ml, and empty data never crashes.

## 18. Average consumption

The Statistics screen shows the 7-day average and 30-day average (missing days count as 0), plus an all-time average computed only from days that have records.

## 19. Best day

The best day is the recorded date with the highest total. The app shows its date, total, and whether the goal was reached. With no records it shows "No best day yet."

## 20. Goal completion

The app shows goal days in the last 7 days, last 30 days, all-time goal days, and completion percentages. Missing or invalid goals are handled safely.

## 21. CSV / text export

The Export screen generates either CSV or a human-readable plain text summary for All records, Last 7 days, or Last 30 days. Output is shown in a scrollable document preview.

CSV format:

```text
date,time,amountMl,label
2026-07-03,09:15,250,Glass
2026-07-03,14:20,500,Bottle
```

Plain text format:

```text
Hydrivo Water Log Export

2026-07-03
Total: 750 ml
09:15 — 250 ml — Glass
14:20 — 500 ml — Bottle
```

If there are no records, the preview shows "No records to export."

## 22. No storage permission export

Export never touches the file system or storage. It renders text on screen and (optionally) copies it to the clipboard using `expo-clipboard`. There is no gallery/storage access, no file manager, no cloud upload, and no internet requirement.

## 23. App icon concept

A rounded square with a pale-blue background, a simple deep-navy water drop, small compact chart bars, and light ledger lines beneath — a clean, practical tracker mark with no medical symbols. Readable at small sizes. See `assets/icon.png` and `assets/adaptive-icon.png`.

## 24. Splash screen concept

A centered water-drop + logbook-bars symbol with the app name "Hydrivo Water Log" on a pale-blue background — calm and practical, no heavy imagery. See `assets/splash.png`.

## 25. Visual style concept

"Hydrivo Clean Water Ledger": practical, clean, organized, analytical, calm, data-focused. White background, deep navy text, muted cyan accents, pale blue panels, light gray ledger lines, soft teal progress. No medical look, no neon, no gradients, no mascot, no reward visuals, no default circular tracker.

## 26. Water data logbook layout uniqueness

The app deliberately avoids a generic template (mascot → title → subtitle → stats card → vertical button stack → settings). Instead:

- The home screen is a **logbook**: compact header with a settings icon, a date tab, a ledger-style daily total, quick-add chips, log rows for records, and a thin goal progress strip (not a ring). Statistics and Export appear as small data/document tiles.
- The statistics screen is an **analytics sheet** of ledger rows.
- The export screen is a **document preview** panel with range/format controls and a copy action.

There is no bottle tracker, drop grid, three-part journal, circular ring, or mascot-centered header as the primary UI.

---

## 27. Scaffold with the Expo template

This project targets the current Expo SDK. If you want to regenerate the scaffold from scratch:

```bash
npx create-expo-app hydrivo-water-log
```

Then copy the `App.js`, `index.js`, `app.json`, `babel.config.js`, `src/`, `assets/`, `plugins/`, `scripts/`, and `.github/` from this repository over the template.

## 28. Install dependencies through `npx expo install`

Always install with `expo install` so versions match the SDK. Never hand-edit dependency versions.

```bash
# Core runtime & local storage
npx expo install @react-native-async-storage/async-storage
npx expo install expo-clipboard
npx expo install expo-status-bar

# Expo core modules (explicit direct dependencies)
npx expo install expo-asset expo-constants expo-font expo-modules-core

# Android build configuration plugin
npx expo install expo-build-properties
```

Every imported package is listed as a **direct** dependency in `package.json`; nothing relies on transitive dependencies. After installing, align and verify:

```bash
npx expo install --fix
npx expo-doctor
npx expo install --check
```

Commit the resulting `package-lock.json` from a full `npm install`.

## 29. Run locally

```bash
npm install
npx expo install --fix
npx expo start
# then press "a" to open on an Android device/emulator, or scan the QR code
```

## 30. Build Android

This app uses Expo prebuild + Gradle (the CI does this automatically). Locally:

```bash
npm install
npx expo install --fix
npx expo prebuild --platform android --no-install

# Debug run on a connected device
npx expo run:android

# Release build (after configuring signing — see below)
node scripts/apply-android-signing.js
cd android
./gradlew assembleRelease   # -> app/build/outputs/apk/release/app-release.apk
./gradlew bundleRelease     # -> app/build/outputs/bundle/release/app-release.aab
```

## 31. Generate a PKCS12 keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore hydrivo-water-log-release-key.p12 -alias hydrivo_water_log_key -keyalg RSA -keysize 2048 -validity 10000
```

Use the **same password** for the keystore and the key. Keep this file private — it is git-ignored and must never be committed.

## 32. Add GitHub Secrets

In your repository: **Settings → Secrets and variables → Actions → New repository secret**. Add:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 hydrivo-water-log-release-key.p12` (macOS: `base64 -i hydrivo-water-log-release-key.p12`) |
| `ANDROID_KEYSTORE_PASSWORD` | Your keystore password |
| `ANDROID_KEY_ALIAS` | `hydrivo_water_log_key` |
| `ANDROID_KEY_PASSWORD` | Same as the keystore password |

## 33. GitHub Actions

`.github/workflows/android-build.yml` runs on push to `main` (and manual dispatch). It:

1. Installs Node.js and Java 17.
2. Installs dependencies with `npm install`.
3. Runs `npx expo install --fix`.
4. Runs `npx expo-doctor` and `npx expo install --check` (non-blocking).
5. Installs Android SDK Platform 35 and Build Tools 35.0.0 via `sdkmanager`.
6. Decodes the keystore from `ANDROID_KEYSTORE_BASE64`.
7. Prebuilds the Android project and applies the release signing config.
8. Builds the signed release **APK** and **AAB**.
9. Uploads both as workflow artifacts.

No emulator smoke-test is run on CI (kept fast and stable on free runners). CI proves the build/signing only — see the launch checklist below to verify the app actually runs.

## 34. Google Play compatibility notes

- Targets Android API 35 (`targetSdkVersion 35`, `compileSdkVersion 35`) to satisfy Play's target-API requirement — **not** API 34.
- Ships as a signed AAB for upload.
- No prohibited SDKs (no Firebase, ads, analytics, payments, Google Fit, Health Connect, sensors, wearables, notifications, or file managers).
- No `INTERNET` permission, so the Play listing declares no network use.

## 35. Android API 35 notes

`compileSdkVersion` and `targetSdkVersion` are both 35, configured via `app.json` and `expo-build-properties`. `minSdkVersion` is 24 (compatible with React Native 0.79).

## 36. 16 KB page size compatibility

The project uses the current Expo SDK / React Native toolchain (AGP 8.x + NDK r27), which produces native libraries aligned for Android 15+/16 KB memory page sizes. No old native libraries are added that would break 16 KB alignment.

## 37. Release optimization notes

Standard Android R8/Proguard only — no third-party obfuscators. Start by verifying a **non-minified** release:

```gradle
minifyEnabled false
shrinkResources false
```

Once that launches cleanly, you may enable shrinking in `android/app/build.gradle`:

```gradle
minifyEnabled true
shrinkResources true
proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
```

Re-test launch after enabling minify/shrink. Hermes is enabled by default in this SDK.

## 38. Local launch verification checklist

A green CI build is not proof the app launches. Before releasing:

```bash
adb install app-release.apk
adb logcat
```

Confirm there are no errors such as: "Cannot find native module", "Module has not been registered", "Invariant Violation", `theme.fonts.regular is undefined`, AsyncStorage JSON parse crash, missing route params crash, invalid date crash, invalid number crash, or clipboard native module crash.

Test the flows:

- First launch with empty storage (onboarding shows).
- Add a quick water entry and a custom water entry.
- Edit an entry; delete an entry; clear a selected day.
- Change the daily goal.
- View History; view the 7-day chart; view the 30-day chart.
- Check average consumption, best day, and goal completion.
- Generate a CSV export and a text export; copy the export text.
- Reset all local data; relaunch the app.
- Launch in airplane mode.
- Confirm no sensor, Google Fit, Health Connect, wearable, notification, internet, storage, or file permission is requested.

## 39. Privacy note

> Hydrivo Water Log stores water records, goals, and statistics only on this device. No account, no ads, no analytics, no internet connection, no sensors, no Google Fit, and no Health Connect.

---

## Project structure

```
hydrivo-water-log/
├── App.js                     # Root: providers, router, onboarding gate
├── index.js                   # Expo entry point
├── app.json                   # Expo config (Android API 35, no INTERNET)
├── babel.config.js
├── eas.json                   # Optional EAS build profiles
├── package.json
├── assets/                    # Custom icon, adaptive icon, splash
├── plugins/
│   └── withNoInternetPermission.js   # Strips INTERNET from the manifest
├── scripts/
│   └── apply-android-signing.js      # Injects release signing after prebuild
├── src/
│   ├── AppContext.js          # App state + AsyncStorage persistence
│   ├── Navigation.js          # Dependency-free stack navigator
│   ├── theme.js               # Design tokens
│   ├── storage/storage.js     # Load/save/normalize (safe defaults)
│   ├── utils/
│   │   ├── dates.js           # YYYY-MM-DD / HH:mm helpers
│   │   ├── format.js          # Number/ml formatting
│   │   ├── stats.js           # Averages, best day, goal completion
│   │   └── exportData.js      # CSV & plain text generators
│   ├── components/
│   │   ├── ui.js              # Shared logbook UI primitives
│   │   └── BarChart.js        # Plain-view bar chart
│   └── screens/               # 10 screens
└── .github/workflows/android-build.yml
```

## Data models

```js
WaterEntry = {
  id: string,
  date: string,      // "YYYY-MM-DD"
  time: string,      // "HH:mm"
  amountMl: number,
  label: string,
  createdAt: string, // ISO
  updatedAt: string  // ISO
}

Settings = {
  onboardingCompleted: boolean,
  dailyGoalMl: number,
  compactMode: boolean,
  weekStartsOn: "monday"
}
```
