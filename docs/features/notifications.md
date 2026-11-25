# Notifications and Reminders

## Purpose
Keep parishioners informed about parish announcements and upcoming celebrations without requiring an account for ordinary app use.

## Notification types
- Important announcements and messages published by the priest.
- Mass schedule changes and special liturgies.
- Parish activities and event reminders.
- Optional user-created reminders for a selected Mass or event, where device permissions allow.

## User controls
- Notifications are optional and must be opt-in through the operating system permission prompt.
- Separate preferences for important announcements, Mass updates, activities, and reminders.
- Allow users to disable categories or all notifications at any time.
- Offer reminder timing choices such as at event time, 1 hour before, or 1 day before where supported.
- Respect quiet hours and device notification settings.
- Store local preferences on the device; no account is required for these settings.

## Privacy and delivery
- Never include prayer-request text or other private submissions in notifications.
- Notification previews should use a short, non-sensitive title and message.
- Do not request notification permission on first launch; explain the benefit when the user enables notifications.
- If push delivery is implemented, register device tokens securely and allow users to unregister a device.
- The priest's authorized account is the only role allowed to trigger parish-wide announcements. Ordinary users cannot send notifications to others.
- Use topic/category subscriptions or equivalent efficient delivery; avoid unnecessary database polling and reads.
- Support Arabic, French, and Italian notification text. If a translation is unavailable, use a neutral fallback and do not display broken keys.

## Data and implementation
- Keep local reminder preferences separate from shared parish content.
- Scheduled reminders should be cancellable and updated when the underlying event changes or is cancelled.
- Ask for exact event details and parish-approved content; never invent Mass times or activities.
- Test notification permission, delivery, language, time zone, cancellation, and Android/iOS behavior before release.
