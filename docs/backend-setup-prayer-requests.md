# Secure Backend Setup — Prayer Requests

## Current status

The public parish app is a static GitHub Pages preview. It does not currently contain Firebase initialization, Firebase Authentication, Firestore access, Cloud Functions, or deployed security rules.

The Prayer Requests screen is an informational entry screen only. It does not collect credentials or submit/store prayer intentions. Keep submissions disabled until every item below is completed and tested.

## Required Firebase setup

1. Create or select the parish-owned Firebase project.
2. Register a Web App in that project and add its public web configuration to the app. Firebase web configuration is not an admin credential; never add service-account JSON, private keys, or server secrets to GitHub.
3. Enable **Email/Password** under Firebase Authentication. Do not enable phone/SMS authentication.
4. Configure the email verification action and sender. Test delivery to Gmail and Yahoo, and verify that an unverified account cannot submit.
5. Create a Cloud Firestore database in an appropriate production region.
6. Enable Firebase App Check for the deployed web app before opening submissions to the public.
7. Record the priest's Firebase Authentication UID through a trusted administrative process. Do not use an email address supplied by a visitor to assign administrator rights.

## Data and access model

Use a private collection such as `prayerRequests/{requestId}` with only the fields required for review:

- `ownerUid`: authenticated submitter UID
- `category`: one of `health`, `family`, `peace`, `thanksgiving`, `other`
- `language`: `ar`, `fr`, or `it`
- `message`: bounded plain text
- `status`: server-set `pending` at creation
- `createdAt`: server timestamp

Do not store prayer text in analytics, crash reports, public logs, notifications, or public website files.

## Authorization requirements

- Require a valid authenticated user and a verified email claim on the trusted backend for every submission.
- The submitter may create only a request whose `ownerUid` equals their own UID.
- Ordinary users must not list or read the collection or read other users' documents.
- Ordinary users must not set or change status, review fields, ownership, or timestamps.
- Only the specifically authorized priest UID may list, read, update, approve/reject, or delete requests.
- Do not allow users to grant themselves admin privileges or select an admin role in the client.
- Validate allowed fields, category, language, and message length in security rules and/or a trusted server function.
- Add abuse protection and rate limiting through a trusted backend; Firestore rules alone are not a complete rate limiter.

## Priest review workflow

Provide a separate authenticated priest-only review interface. It must verify the priest's authorization from trusted identity data before loading any request. The priest can review a pending request, set its status to approved/rejected, and delete it according to the parish retention policy. Do not expose the review queue in the public client.

## Before launch

- Obtain parish approval for the privacy notice, wording, review process, and retention period.
- Decide the retention/deletion period; do not retain requests indefinitely by default.
- Test with two ordinary accounts and the priest account.
- Confirm unverified users cannot submit.
- Confirm one ordinary user cannot read another user's request or the priest queue.
- Confirm ordinary users cannot change status or delete requests.
- Confirm only the authorized priest can review and manage requests.
- Test rate limiting, App Check, and email verification delivery.
- Do not enable production submissions until all tests pass.
