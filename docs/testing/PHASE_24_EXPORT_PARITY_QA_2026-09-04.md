# Phase 24 Export Parity QA

## Scope

- Freeze export query scope to the server-resolved filters used by the view.
- Reject invalid calendar dates; align repeated parameters with page parsing.
- Add KPI and daily Visit trend to the existing summary ranking export.
- Preserve per-type permission gates, audit logging and privacy-safe columns.
- No database migration, dependency change or production data mutation.

## Regression Evidence

Tests first reproduced five failures: three impossible dates were accepted,
export used the last duplicate filter while the page used the first, and the
download URL ignored resolved dates/filters and forwarded an unrelated email
parameter. A separate failing test demonstrated missing KPI/trend export rows.

After fixes, the focused suite passed 71 tests in eight files. It covers filters,
saved views, export URLs, repository privacy, dashboard interactions, attraction
exports and per-type authorization. Anonymous or export-forbidden requests do
not call the analytical service or raw repository. Denied authenticated export
attempts retain audit events.

An actual anonymous HTTP check exposed a separate guard-mode defect: dashboard
exports returned 403 because an HTML login redirect was caught as a permission
failure. A failing guard test reproduced this with the real guard implementation.
The optional API throw mode now returns 401 while default page behavior is
unchanged. Local HTTP verification after the fix:

- Summary export: 401, no redirect.
- Survey export: 401, no redirect.
- Attraction analytics export: 401, no redirect.
- `/admin/dashboard`: 307 to the admin login with its return route retained.

## Boundaries

Full authenticated role/browser checks require separately configured
`E2E_ADMIN_USERNAME` and `E2E_ADMIN_PASSWORD`, which are not present in this
workspace. Query-plan/latency checks still require the documented database
connection. Neither gate is claimed complete or bypassed.

Local runtime is Node 26.1.0; release configuration requires Node 22.x. Full
suite/build outcomes are recorded at the final checkpoint below.

## Final Checkpoint

- First full run: 324 files passed, one file failed (2,317 passing tests and one
  failure). The duplicate reduced-motion media block was caught by the public
  design contract test. It has been consolidated into the existing global block,
  retaining the admin animation-iteration limit.
- Post-fix focused run: 109 tests in 11 files passed, including the actual guard
  behavior, public CSS contract and export/filter suites.
- TypeScript and scoped ESLint passed after the export and guard changes.
- Final full suite: 326 files and 2,322 tests passed (389.68 seconds).
- Production build passed, including all 63 static route generation steps.
- Browser fixture at 360 x 900: document width stayed at 360 px; the export
  dialog stayed within x=16..344 and y=147.5..752.5, with focus inside it.
  Screenshot: `output/playwright/phase24-export-dialog-360.png`. This uses
  synthetic fixture data, not an authenticated production session.
- Node 26 emitted the known experimental localStorage warning during tests;
  verification on the configured Node 22 release runtime remains a release gate.
