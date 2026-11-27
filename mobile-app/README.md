# Notre-Dame-du-Secours mobile app

This is a separate Expo/React Native application inside the parish repository. It does not replace or modify the existing website.

## Current approach

The first version opens the existing parish website in a native WebView. This keeps the current design, languages, content, Firebase sign-in, prayer audio, and priest tools together while providing an installable Android app.

Website: https://danatstores-wq.github.io/

The app needs an internet connection to load the website. Native features such as reliable photo saving, push notifications, and deeper device integrations can be added in later stages.

## Android testing APK

The APK is built automatically by GitHub Actions. No Expo account, EAS connection, or Android Studio installation is required.

To start a build manually:
1. Open the repository's **Actions** tab.
2. Select **Build Notre-Dame-du-Secours Android APK**.
3. Select **Run workflow**.

The workflow also runs automatically when files inside `mobile-app/` are changed on the `main` branch.

When the build finishes:
1. Open the completed workflow run.
2. Scroll to **Artifacts**.
3. Download `notre-dame-du-secours-android-apk`.
4. Extract the ZIP file; it contains `app-release.apk`.

## iPhone build

The current workflow builds Android APKs only. An iPhone device build will need a separate iOS build/signing setup and Apple Developer account for device distribution.

## Important

- Do not put Firebase private credentials, ImageKit private keys, or Cloudflare secrets in this folder.
- The root website and its deployment workflow remain separate and unchanged.
- Android and iOS app identifiers: `com.notredamedusecours.parish`.
