// Config plugin: guarantees the Android manifest contains NO INTERNET
// (or network-state) permission, even if a dependency tries to add it.
// Hydrivo Water Log is a fully offline app and must work in airplane mode.
const { withAndroidManifest } = require("expo/config-plugins");

const BLOCKED = [
  "android.permission.INTERNET",
  "android.permission.ACCESS_NETWORK_STATE",
  "android.permission.ACCESS_WIFI_STATE",
];

module.exports = function withNoInternetPermission(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    if (Array.isArray(manifest["uses-permission"])) {
      manifest["uses-permission"] = manifest["uses-permission"].filter(
        (perm) => {
          const name = perm?.$?.["android:name"];
          return !BLOCKED.includes(name);
        }
      );
    }
    return cfg;
  });
};
