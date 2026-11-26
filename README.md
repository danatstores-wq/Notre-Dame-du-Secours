# كنيسة سيدة المعونات | Église Notre-Dame des Secours

Multilingual mobile web app / PWA for Notre-Dame-du-Secours, with Arabic (RTL), French (LTR), Italian (LTR), and English (LTR) interfaces.

## Deployment

The live GitHub Pages site is published from the `main` branch. Pushing a commit to `main` triggers a fresh Pages deployment.

## Folder Structure
```text
├── assets/
│   ├── backgrounds/
│   │   ├── main-bg.jpg        # Clean hero & navy UI background (no text/buttons)
│   │     └── main-bg.png      # Lossless PNG version
│   └── icons/
│       ├── logo-marian-emblem.svg
│       ├── icon-settings.svg
│       ├── icon-calendar.svg
│       ├── icon-rosary.svg
│       ├── icon-bible.svg
│       ├── icon-megaphone.svg
│       ├── icon-church.svg
│       ├── icon-praying-hands.svg
│       ├── icon-cross-divider.svg
│       ├── nav-home.svg
│       ├── nav-bell.svg
│       ├── nav-star.svg
│       └── nav-info.svg
├── bibles/
│   ├── en/                    # Complete Douay-Rheims 1899 Catholic Bible (73 books)
│   ├── fr/                    # French Catholic Bible
│   └── it/                    # Italian Catholic Bible
├── scripts/
│   └── build-english-bible.mjs # Rebuild bundled English Bible from eBible USFM
├── src/
│   └── i18n/
│       ├── ar.json            # Arabic strings
│       ├── fr.json            # French strings
│       └── it.json            # Italian strings
├── index.html                 # Main app interface (Arabic, French, Italian, English)
└── ui-reference.jpg           # Full design mockup
```
