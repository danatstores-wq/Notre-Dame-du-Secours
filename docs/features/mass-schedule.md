# Feature 1 — Mass Schedule & Activities

## Visitor experience
- Three tabs: weekly Masses, special/feast-day Masses, and parish activities.
- Activities are intended to support calendar and upcoming-list views, with event details and optional local reminders.
- The dashboard card opens this feature; a back control returns to the dashboard.
- The screen reads its public content from `src/data/mass-schedule.json`.

## Language and direction
- Arabic: RTL.
- French and Italian: LTR.
- Tab labels and empty/loading/error states are localized in all three languages.
- Schedule and activity content should provide Arabic, French, and Italian fields wherever possible.

## Data integrity
- The current data arrays are intentionally empty.
- Do not invent or display Mass times, feast-day celebrations, or activities.
- Populate entries only after the parish confirms the exact information.
- The current preview provides read-only display. It does not yet provide priest editing, calendar reminders, or backend publishing.

## Administration (planned)
- The priest is the sole administrator allowed to add, edit, publish, or remove schedule and activity entries.
- Enforce these permissions in the backend/database rules, not only in the interface.
