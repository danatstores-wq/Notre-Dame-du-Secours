# Feature 1 — Mass Schedule & Activities

## Screen structure
1. Tabs/filters: Masses, Special Masses, Activities.
2. Masses: weekly schedule grouped by day; show time and church/location.
3. Special Masses: approved date/time details for feast days and special celebrations.
4. Activities: calendar and upcoming-list toggle; tap an activity for details.
5. Event detail: title, date, time, location, description, optional photo, reminder button.
6. Reminder: optional local notification for a selected event.

## Arabic/French behavior
- Arabic uses RTL layout and Arabic labels.
- French uses LTR layout and French labels.
- Day and month names are localized.
- Schedule data can have separate Arabic/French names and descriptions.

## Data and publishing
- Schedule data is in `src/data/mass-schedule.json`.
- Keep the data empty until the parish confirms its real schedule. Do not display fabricated Mass times.
- Plan for authorized content management so parish staff can update schedules/events without an app release.

## Proposed card icon
Keep the existing calendar icon. The card title is localized as Mass Schedule / Horaires des Messes; its subtitle indicates Activities / Activités.
