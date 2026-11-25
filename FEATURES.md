# Notre-Dame-du-Secours App — Feature Plan

This document tracks the planned features for the bilingual Arabic (RTL) and French (LTR) parish app. The main dashboard cards should become working navigation entries.

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
- Guided prayer order with Arabic and French text.
- Audio playback in both languages when recordings become available.
- Playback controls: Play, Pause, Resume, Stop, restart, and optional seek.
- A visual Rosary with beads that glow/highlight in order as the prayer progresses.
- Audio progress and current prayer/decade displayed together.
- Audio timing markers should map prayer sections/beads to timestamps; if no timing data exists, use a fallback manual guided mode.
- Recordings are not available yet. Build the audio feature with placeholder/empty audio slots and do not ship fake recordings.
- The Rosary must remain usable without audio and support offline prayer text.

## 3. Prayer Library
- Categories: common prayers, morning/evening, prayers to Jesus and Mary, sick, peace, thanksgiving, Communion and special occasions.
- Arabic and French prayer text, search, favorites, share/copy, adjustable text size.
- Audio only where genuine recordings are available.
- Offline access to prayer texts.

## 4. Priest Messages & Parish News
- Priest messages, parish announcements, news and important notices.
- Text, publication date, optional photos/audio/video.
- Push notifications for important posts.
- Admin publishing without requiring an app update.

## 5. Parish Life & Activities
- Parish groups, youth/children activities, gatherings, community events.
- Upcoming and past activity listings and photo galleries.
- Optional event registration as a future feature.

## 6. Prayer Requests
- Submit in Arabic or French.
- Anonymous submission option.
- Optional category (health, family, thanksgiving, peace, etc.).
- Requests private by default; only share publicly with explicit consent.
- Secure review workflow for authorized parish staff.

## 7. Notifications
- Mass/event reminders, parish news and priest messages.
- User controls for categories and reminder timing.

## 8. Favorites
- Save prayers, messages and other supported content for quick access.

## 9. About
- Parish name and history, approved priest details, address, map/directions, contact details and church photos.

## 10. Settings
- Arabic/French language choice.
- Notification preferences and reminder settings.
- Text size and accessibility preferences.
- Privacy information and app version.

## General requirements
- Arabic RTL and French LTR throughout.
- Mobile-first Android and iOS layouts.
- Offline availability for prayer text and core Rosary guide.
- Secure admin access for parish-managed content.
- Avoid inventing church schedule, contact or historical details; use parish-approved content.
