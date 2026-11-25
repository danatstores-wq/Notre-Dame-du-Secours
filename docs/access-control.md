# Parish App Access & Administration

## Roles

### Parish Priest / Sole Administrator
The priest is the only account authorized to administer and publish parish app content. Administrative access is granted to his specific account/identity by secure configuration, not by a user-facing self-service role switch.

He may:
- Add, edit, cancel, or delete Mass schedules.
- Add, edit, remove, and manage calendar events and parish activities.
- Publish, edit, or remove parish announcements and priest messages.
- Manage content only through authenticated admin tools.

### App Users (Everyone Else)
Users have read-only access to parish content and devotional features. They can:
- View Mass times and calendar activities.
- Read prayer texts.
- Pray the Holy Rosary using guided/manual features, and audio when approved recordings are provided.
- Browse parish announcements.
- Use personal app features such as favorites, notifications, language, font-size settings.

Users cannot:
- Add, edit, delete, or cancel Masses.
- Add, edit, or delete calendar activities/events.
- Publish, edit, or delete announcements.
- Modify prayer library content or shared parish content.
- Promote themselves or another user to administrator.

## Security Requirements
- Admin authorization must be enforced server-side/database rules, not merely by hiding admin screens.
- Only the priest's explicitly authorized account is assigned admin access.
- Deny write access by default to all regular authenticated users and anonymous users for shared parish content.
- Protect admin credentials; no password or secret should be embedded in the app.
- Admin changes should be validated and ideally recorded in an audit log (who, what, when).
- The priest may use a dedicated admin section after signing in; public browsing and prayer features remain accessible without admin privileges.
- Admin identity can be reassigned only through a secure owner-controlled process if the parish priest changes.

## Content Ownership
Shared content (Mass schedules, calendar, activities, announcements, and published prayer text) is parish-controlled. The app is a read-only companion for parishioners. Personal preferences and local favorites are stored per user/device and do not alter shared content.
