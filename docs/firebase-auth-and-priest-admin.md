# Firebase setup for Notre-Dame-du-Secours

## Website authentication and priest administration

The website uses Firebase Authentication (Email/Password), Cloud Firestore and Firebase Storage. Public browsing remains available without an account. Registration requires email verification before an account can sign in.

The only administrator identity configured in the client is `notredamedusecours5@gmail.com`. The website shows the priest CMS only when that account is signed in and its email is verified. **The real security boundary is the Firebase rules below**, which independently restrict writes and uploads to that verified email.

## GitHub Pages API key injection

Add the Firebase Web API key in the repository's GitHub Actions secrets or variables using the exact name:

`VITE_FIREBASE_API_KEY`

The `.github/workflows/deploy-pages.yml` workflow injects it into the generated Pages artifact at deployment time. The key is a public Firebase web configuration value once delivered to browsers; it is not an admin credential. Never put a Firebase service-account key in the website.

In GitHub, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. Then run the **Deploy parish website to GitHub Pages** workflow or push to `main`.

## Publish Firebase rules

In Firebase Console, select project `notre-dame-du-secours`.

1. Open **Firestore Database → Rules**, replace the rules with the contents of `firestore.rules`, and click **Publish**.
2. Open **Storage → Rules**, replace the rules with the contents of `storage.rules`, and click **Publish**.
3. In **Authentication → Sign-in method**, enable **Email/Password**.
4. In **Authentication → Settings → Authorized domains**, ensure `danatstores-wq.github.io` is listed.
5. Create the priest account with `notredamedusecours5@gmail.com`, complete email verification, and sign in. Do not share the password.

The Firestore CMS stores four JSON payloads in `siteContent/massSchedule`, `siteContent/announcements`, `siteContent/parishLife`, and `siteContent/prayers`. Public screens read these published documents when present and otherwise retain the existing bundled JSON data. The priest editor loads the current payload, allows editing, and saves it.

## Important limitations and checks

- The CMS editor is a structured JSON editor for the existing data formats. Preserve the existing object shape and language fields when editing.
- Images uploaded through the priest profile are stored in `parish-media/` (maximum 8 MB, image MIME types only). The returned URL is intended for an `image` field in parish-life content.
- Prayer-request submissions are not enabled by these rules; the prayer-request collection is priest-only and remains private.
- Verify public reads, priest writes, rejected ordinary-user writes, and rejected non-image/oversized uploads before launch.
- Firebase rules are source files in this repository but must be published in the Firebase Console unless a separately authenticated Firebase deployment workflow is configured.
