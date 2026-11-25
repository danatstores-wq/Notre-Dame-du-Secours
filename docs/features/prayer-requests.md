# Prayer Requests

## Purpose
Allow parishioners to send prayer intentions to the parish in a respectful, private, and secure way.

## User experience
- Submit a prayer request in Arabic, French, or Italian.
- Optional category, such as health, family, peace, thanksgiving, or other.
- Optional anonymous submission.
- Clear explanation before submission about who can read the request and how it will be used.
- Confirmation after successful submission.
- No public display, sharing, or push notification containing the request by default.

## Privacy and consent
- Requests are private by default and visible only to specifically authorized parish personnel through a secure review process.
- Do not publish or share a request unless the submitter gives explicit, informed consent for that specific use.
- Do not collect unnecessary personal information. Anonymous requests should not require a name or email.
- Provide a privacy notice, retention/deletion policy, and a contact route for questions or deletion requests.
- Avoid asking users to include sensitive medical details or other unnecessary personal data.

## Priest administrator
The priest's specifically authorized administrator account may review and manage submitted requests according to the parish's approved process. Access must be restricted server-side; ordinary users must never be able to browse other people's requests.

## Security requirements
- Enforce access using backend/database rules, not UI hiding alone.
- Authenticated submission is preferred; if anonymous submission is enabled, use abuse protection and server-side validation.
- Validate and limit text length; protect against spam and automated abuse.
- Do not include request text in analytics, crash reports, push notifications, or public logs.
- Keep access and administrative actions auditable where supported.
- Define a retention period with the parish before launch; do not retain requests indefinitely by default.

## Data status
No real prayer requests or personal information are included in the starter data. The production backend and privacy wording must be reviewed and approved before enabling submissions.
