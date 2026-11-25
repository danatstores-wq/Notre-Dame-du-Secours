# Notre-Dame-du-Secours App — Feature Plan

This document tracks the planned features for the trilingual Arabic (RTL), French (LTR), and Italian (LTR) parish app. The main dashboard cards should become working navigation entries.

## 1. Mass Schedule & Activities
- Weekly and daily Mass schedule, with weekday and Sunday times.
- Special Masses, feast days, holiday schedule changes.
- Parish activities/events in calendar and list views.
- Event details: title, date/time, location, description, optional image.
- Optional reminder for selected Masses/events.
- Content should be editable by authorized parish administrators without an app update.
- Do not publish placeholder Mass times as factual information; wait for parish-approved schedule.

## 2. Holy Rosary — Guided and Audio
- Four mysteries: Joyful, Luminous, Sorrowful, Glorious.
- Guided prayer order and localized prayer text in Arabic, French, and Italian.
- Audio playback only when genuine recordings become available in the relevant language.
- Playback controls: Play, Pause, Resume, Stop, restart, and optional seek.
- A visual Rosary with beads that glow/highlight in order as the prayer progresses.
- Audio progress and current prayer/decade displayed together.
- Audio timing markers should map prayer sections/beads to timestamps; if no timing data exists, use a fallback manual guided mode.
- Recordings are not available yet. Build the audio feature with placeholder/empty audio slots and do not ship fake recordings.
- The Rosary must remain usable without audio and support offline prayer text.

## 3. Prayer Library
- Categories: common prayers, morning/evening, prayers to Jesus and Mary, sick, peace, thanksgiving, Communion and special occasions.
- Arabic, French, and Italian prayer text, search, favorites, share/copy, adjustable text size.
- Audio only where genuine recordings are available.
- Offline access to prayer texts.

## 4. Priest Messages & Parish News
- Priest messages, parish announcements, news and important notices.
- Text, publication date, optional photos/audio/video.
- Push notifications for important posts.
- Admin publishing without requiring an app update.
- Only the priest's specifically authorized administrator account may manage shared posts; ordinary users can read and save favorites but cannot publish or edit.

## 5. Parish Life & Activities
- Parish groups, youth/children activities, gatherings, community events.
- Upcoming and past activity listings and photo galleries.
- Optional event registration as a future feature.
- Arabic, French, and Italian content; do not invent group names, schedules, contacts, or events.
- Only the priest's specifically authorized administrator account may create, edit, publish, archive, or remove shared group/activity content; ordinary users are read-only.

## 6. Prayer Requests
- The app remains usable without registration for all public features.
- Only people who open Prayer Requests need to register with email and password.
- Require verified email before submitting; phone/SMS verification is not required.
- Requests are private and enter a pending review queue accessible only to the priest.
- No anonymous submission or public sharing in the initial release.
- Email verification delivery configuration and Yahoo deliverability are deferred until the remaining features are completed.

## 7. Notifications
- Optional, opt-in notifications for important parish announcements, Mass updates, and activities.
- User controls for categories, reminder timing, and quiet hours.
- No account required for notification preferences; never include private prayer requests in notifications.

## 8. Favorites
- Save prayers, Rosary guides, announcements, Masses, and activities.
- Device-local storage by default; no account required.
- Favorites do not alter shared parish content.

## 9. About the Parish
- Parish-approved name, history, photos, public address, contact details, map/directions and office information.
- Do not invent any parish facts or contact details; populate only after confirmation and priest approval.
- Only the priest's specifically authorized administrator account may edit shared About content.

## 10. Settings & Accessibility
- Arabic/French/Italian language choice, saved locally.
- Notification preferences and reminder settings.
- Text size, accessibility preferences, privacy notice and app version.
- No account required; personal settings must not modify shared parish content.

## General requirements
- Arabic RTL, French LTR, and Italian LTR throughout.
- Mobile-first Android and iOS layouts.
- Offline availability for prayer text and core Rosary guide.
- Secure admin access for parish-managed content.
- Avoid inventing church schedule, contact or historical details; use parish-approved content.
