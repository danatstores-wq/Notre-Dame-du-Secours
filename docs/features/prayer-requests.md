# Prayer Requests

## Purpose
Allow parishioners to send prayer intentions privately and respectfully, while keeping the rest of the app open to everyone without registration.

## Access and registration flow
1. Anyone may open and use the app without creating an account.
2. When a visitor selects **Prayer Requests** or attempts to submit a request, show a sign-in/register screen.
3. Registration uses email and password. Phone/SMS verification is not required.
4. The user must verify the registered email address before submitting a request.
5. After verification, the user may submit a request.
6. A successful submission receives an in-app confirmation. The request enters a private **Pending** queue for the priest.
7. Email delivery configuration is deferred until the app's other features are completed; the verification provider and sender setup must be tested before release.

Registration is required only for submitting prayer requests. It must not block browsing Mass schedules, activities, announcements, the Rosary, the prayer library, or other public features.

## Request form
- Support Arabic, French, and Italian.
- Optional category: health, family, peace, thanksgiving, or other.
- Request text with a sensible maximum length and clear guidance not to include unnecessary sensitive details.
- Explain before submission that the request is private and reviewed by the priest.
- Do not offer anonymous submission in the initial release because an authenticated, verified account is required.
- Do not publish, share, or send request text in push notifications.

## Review workflow
- New submissions have status `pending`.
- The priest may mark a request as reviewed/approved or rejected, and may delete it under the parish's approved retention policy.
- A submitter must never be able to read another person's request or access the priest's review queue.
- Do not make a request public. Any future public sharing requires separate, explicit consent for that specific request.

## Priest administrator
The priest's specifically authorized administrator account is the only account allowed to read and manage all prayer requests. Authorization must be enforced by trusted backend/database rules, not by hiding controls in the interface.

## Security and privacy requirements
- Use Firebase email/password authentication for the prayer-request entry point only; keep the rest of the app usable without sign-in.
- Require `emailVerified == true` on the trusted server/backend before accepting a request. A client-side check alone is insufficient.
- Deny ordinary users read access to the collection of all requests and to other users' documents.
- Allow a verified user to create a request only with their own authenticated UID as the owner; prevent users from changing status or administrative fields.
- Only the priest's explicitly authorized admin identity may list, read, update, approve/reject, or delete requests.
- Validate fields and text length server-side; add rate limiting and abuse protection.
- Do not include request text in analytics, crash reports, public logs, or push notifications.
- Use TLS and keep privileged credentials/secrets out of the app.
- Define and publish a retention/deletion policy before launch; do not retain requests indefinitely by default.
- Obtain parish approval for the privacy notice and review workflow before enabling production submissions.

## Deferred item
Email verification delivery (including Yahoo deliverability and custom sender configuration) will be addressed after the app's other features are completed. Do not claim registration is production-ready until delivery, verification enforcement, and security rules have been tested.

## Data status
No real prayer requests or personal information are included in the starter data.
