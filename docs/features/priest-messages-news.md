# Priest Messages & Parish News

## Purpose
A parish news area where parishioners can read official messages and announcements published by the priest.

## Priest administrator
Only the priest's specifically authorized administrator account may:
- Create, edit, publish, unpublish, schedule, pin, or delete announcements.
- Add a title, body, publication date, optional expiry date, and importance level.
- Attach approved photos or other supported media.
- Send a push notification when publishing an important notice.
- Review previously published posts.

## Ordinary users
Users may:
- Browse current and archived announcements.
- Read full message details and view attached media.
- Receive notifications for new or important posts.
- Save posts to personal favorites and share a post.
Users cannot create, edit, publish, pin, or delete shared parish posts.

## Languages and presentation
- Arabic (RTL), French (LTR), and Italian (LTR).
- A post may contain translations in one or more languages. Show the selected language when available; otherwise clearly indicate that a translation is not yet available.
- Support accessible text sizing and mobile layouts.

## Data and security
- Start with an empty feed; do not invent parish announcements.
- Shared content is read-only for ordinary users.
- Enforce priest-only writes in backend/database security rules, not only in the UI.
- Keep administrator identity in secure configuration; never embed credentials in the app.
- Record admin changes (actor, action, timestamp) in an audit trail where supported.
- Push notification delivery must not grant users content-editing permissions.
