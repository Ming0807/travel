# NFC Evidence UI Checkpoint

Date: 2026-09-09. Default-off integration; not production activation.

## Implemented

The per-tag inspection form receives the server-side evidence flag. Enabled forms
accept up to three photos, one at a time, using existing browser image preparation
and the dedicated raw-binary endpoint. Source limit is 10 MiB; prepared upload
must be at most 3 MiB; server output is at most 2 MiB. QR/CMS upload contracts are
unchanged. Local preview URLs are revoked on removal or unmount.

Report submission is blocked during preparation/upload and after a failed upload
until explicit retry or cancellation. Once a report attempt starts, photo selection
is frozen with the report payload. Exact retries retain asset IDs and request ID.
Starting a new report clears selected photos, preventing reuse of claimed assets.
Removing a photo only removes it from the draft; it does not delete remote evidence.

Historical photos load only on explicit request, through ID/tag-scoped private
preview access. Image elements bypass the public Next image optimizer, use
no-referrer, and offer reload after an expired/broken URL.

## Evidence

- 13 focused client/form tests passed across three files.
- TypeScript and scoped ESLint passed.
- Production build passed, generating 66 static pages.
- Chromium fixture exercised browser compression, mocked binary upload, report
  submission, and on-demand history image loading.
- 360/768/1440px overflow checks passed. Screenshots were saved to
  `.tmp/nfc-evidence-360.png`, `.tmp/nfc-evidence-768.png`, and
  `.tmp/nfc-evidence-1440.png`; mobile and desktop captures were visually inspected.
- Synthetic image pixels loaded (`naturalWidth > 0`). The fixture console only
  reported the unrelated missing favicon; no application error was observed.
- Fixture server and browser were stopped after verification.

Reproduction: run Vite with `tests/visual/dashboard/nfc.vite.config.ts`, create a
synthetic PNG at `.tmp/nfc-evidence-qa.png`, and execute
`tests/visual/dashboard/nfc-evidence-qa.js` with Playwright CLI `run-code --filename`.
The current script uses this workstation's absolute synthetic-image path.

## Remaining Gates

No full-schema Supabase/provider request or physical iOS/Android test was performed.
Upload retry can create an unused asset after an ambiguous response; orphan
reconciliation/retention must be completed before enabling the feature. Private
bucket provisioning, provider access/expiry verification, and complete staging
remain required. No production migration or environment flag changed.
