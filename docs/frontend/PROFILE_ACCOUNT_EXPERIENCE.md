# Public profile and account navigation

The profile supports returning tourist identity and links completed travel memories
back to attractions. It reuses the homepage's copper accent, dark green and editorial
headings while keeping account settings familiar and readable.

## Navigation

- Keep the original public navbar brand, typography, width and rectangular account control.
- Bound and truncate long account names in the control; show the complete name in the dropdown.
- Use the account picture, with display initials when it is absent or cannot load.
- Account metadata is presentation only and never grants permissions.
- Preserve profile, passport, story submission and sign-out actions, with keyboard,
  outside-pointer and Escape dismissal, visible focus and retryable sign-out errors.
- Do not call a demo link a QR scanner. The navbar no longer offers the old scan CTA.
  Visitors scan the venue's posted QR using their device camera. Profile guidance
  explains this without offering remote certificate issuance.

## Profile

The server-rendered identity band shows the certificate display name, origin and
account status. It offers the passport, attraction discovery and story submission.
Existing account linking, leaderboard privacy controls, badges, progress and completed
travel records remain available. Leaderboard visibility stays private by default;
publishing a name still requires explicit consent.

`/profile/loading.tsx` streams a lightweight skeleton immediately during navigation.
It matches the identity and content structure, announces loading once, and uses
opacity-only CSS motion. Reduced-motion preferences disable skeleton and menu
animations. No motion package, photo backdrop, new client fetch or additional data
collection is introduced. The profile remains authenticated, dynamic and uncached.

## Acceptance checks

- Unit coverage: missing/invalid display metadata, Unicode initials, failed avatar,
  profile actions, guest recovery, privacy controls and truthful navigation.
- Header fixture: guest, long account name and picture at 14 widths from 320 to 1920px.
- Profile fixture: actual profile, privacy form, empty state and loading skeleton at
  320, 390, 768 and 1440px; no horizontal overflow, keyboard access and reduced motion.
- Fixtures contain synthetic data and actions. They do not validate live identity
  recovery or make production performance timing claims.

Run `npx vite --config tests/visual/story-navigation/vite.config.ts`, then
`node tests/visual/story-navigation/browser-qa.mjs` and
`node tests/visual/story-navigation/profile-browser-qa.mjs`.
