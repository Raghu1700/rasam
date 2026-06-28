// Dynamic Expo config.
//
// google-services.json is deliberately NOT committed to git (it holds project
// keys). EAS Build only uploads git-tracked files, so for cloud builds we feed
// the file in via an EAS "file" environment variable named GOOGLE_SERVICES_JSON
// (created with `eas env:create`). During a build EAS writes that file to a
// temp path and sets process.env.GOOGLE_SERVICES_JSON to it.
//
// Locally (no env var set) we fall back to ./google-services.json on disk, so
// `expo run`, `expo export`, etc. keep working as before.
//
// Everything else comes from the static app.json.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
});
