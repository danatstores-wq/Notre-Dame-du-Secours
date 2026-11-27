# Notre-Dame-du-Secours mobile app

This is a separate Expo application inside the parish repository. It does not replace or modify the existing website.

## Current approach

The first version opens the existing parish website in a native WebView. This keeps the website's current design, languages, content, Firebase sign-in, prayer audio, and priest tools in one place while providing an installable Android/iOS shell.

The website remains the source of truth:
- https://danatstores-wq.github.io/

The app needs an internet connection to load the website. Native features such as reliable photo saving, push notifications, and deeper device integrations can be added in later stages.

## Install and run

Use Node.js 22.13 or newer.

```bash
cd mobile-app
npm install
npx expo install --check
npx expo start
```

## Android test APK

After linking this project to an Expo/EAS account:

```bash
cd mobile-app
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

The `preview` profile creates an installable APK.

## iPhone build

```bash
cd mobile-app
npx eas-cli build --platform ios --profile production
```

An Apple Developer account and signing setup are required for device distribution.

## Important

- Do not put Firebase private credentials, ImageKit private keys, or Cloudflare secrets in this folder.
- Do not change the root website or its deployment workflow to work on this app.
- The app's Android and iOS identifiers are `com.notredamedusecours.parish`.
