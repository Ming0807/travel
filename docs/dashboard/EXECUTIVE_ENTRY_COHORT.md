# Executive Entry-Start Cohort

## Current State

The filter-support helper, server-only repository, authorized aggregation service
and export-row builder are implemented and wired to the authenticated executive
response, chart/table and existing summary CSV/XLSX serializer. No migration or flag activation
is part of this checkpoint. Existing executive Visit-channel distribution remains
unchanged and uses the Visit-date cohort.

## Read Contract

`readExecutiveEntryCohort` accepts validated dashboard filters. Its caller must
authorize `dashboard.read`; the repository is not an API or authorization boundary.
Disabled tracking and unsupported post-entry filters return without a database read.

Entry timestamps use inclusive Bangkok start-of-day and exclusive next-day bounds.
One server-generated as-of timestamp bounds entry creation across all pages. The
eventual aggregate must also apply that cutoff to Visit/certificate/survey outcomes.
Attraction identity comes from `attraction_id_snapshot`; province, district and
primary category are current attraction master data, matching executive filters.
These geography fields are not historical snapshots.

Records contain only entry IDs/channel/evidence classification, linked outcome
IDs/timestamps and attraction scope fields. They must remain server-side. Browser
and export output must receive the privacy-suppressed aggregate, never these rows.
No tourist/browser credential, name, photo path or precise visitor location is read.

## Completeness

- Stable ordering is by creation time and entry-session ID.
- Exact counts detect provider-side row caps; advance by actual returned rows.
- A maximum of 10,000 rows and 25 requests bounds each call.
- Missing/excessive/changing counts, duplicate IDs, unexpected empty pages or
  malformed row IDs return `incomplete` with no partial rows.
- SQL failures throw a sanitized error, never become an empty successful cohort.
- The cap applies before evidence-scope aggregation. A large mixed-scope dataset
  can therefore be incomplete even when one selected scope alone would be small.

This is not an MVCC snapshot across HTTP requests. Count and duplicate checks catch
some concurrent changes but do not prove a repeatable-read snapshot. Current-master
edits and late transaction commits require staging review; a transaction-backed
summary RPC remains the stronger future path for strict snapshot exports.

## Verification and Next Tasks

Nine mocked repository tests pass, including pagination with a tiny provider cap,
changing totals, duplicate pages, date/location filters and sanitized failures.
Scoped ESLint and Node 22 TypeScript pass. Real PostgREST relation resolution and query plans remain
staging gates; mocked tests do not establish those properties.

- Verify responsive states, authorization, suppression and real database behavior.

## Aggregation and Export Contract

`getExecutiveEntryAnalytics` authorizes `dashboard.read` before validating filters
or reading storage. It reuses `buildAttractionChannelAnalytics` for immutable scope,
outcome cutoff and complementary small-cell suppression. Only aggregate fields
are returned; no entry/Visit IDs, respondent values or raw rows cross this boundary.
Query failure returns `unavailable`, distinct from an empty successful cohort.

`buildExecutiveEntryExportRows` shares the core entry-channel export serializer
with attraction analytics. It omits Visit-date attribution coverage entirely.
Blocked/unavailable results return metadata only, not zero-filled metrics. The
existing attraction serializer still appends its real Visit-coverage row unchanged.
The export-row builder is not a download endpoint: route export permission and
privacy controls still have to be preserved when integrating it.

Nineteen focused service/repository/export tests pass. They verify real shared
aggregation with mocked reads/guards, including post-cutoff outcomes and suppression.
This does not claim a live database read, new chart, or completed export route.
Scoped ESLint and current Node 22 TypeScript also passed at this checkpoint.

## UI Integration Checkpoint

Authenticated executive responses now call the entry service; other dashboard
modules and the public response path do not. The existing summary export receives
that same view-model field and preserves column parity for CSV/XLSX. Separate
requests may have different as-of cutoffs, each explicitly reported.

The shared chart renders entry trends/conversion and the accessible numerator/base
table. Unsupported post-entry filters show an explanation and a scoped clear link
that retains date, location and evidence selection. Blocked states show no charts
or fake zeros. The existing Visit-channel panel remains separate.

Verification: eight shared/wrapper UI tests passed; the updated dashboard service
and wrapper suite passed 41 tests; 16 service/summary-export/Visit-channel tests
passed. Scoped ESLint and TypeScript passed. Chromium fixture checks passed at
360/768/1440px for conversion switching, table access, clear-filter scope, page
overflow and page errors. Mobile ready/blocked and desktop ready screenshots were
visually reviewed. Fixture data is synthetic and does not verify production data.
Recharts emitted transient initial-size warnings; settled screenshots rendered
nonblank charts. These warnings are not claimed resolved. The first cold Vite
navigation timed out; a subsequent completed run passed without changing timeouts.
Node 22 production build completed successfully, including TypeScript and 66
generated static pages. Authenticated database staging remains a separate gate;
the local build does not prove the live PostgREST relationship or rollout state.

### Initial Chart Size Follow-up

The previously documented negative-size warning was reproduced in an SSR test.
The shared channel panel now supplies Recharts `initialDimension` (280 x 288),
while the existing responsive container and ResizeObserver still determine the
actual measured size. Five focused chart tests, lint and TypeScript pass. Browser
QA now rejects dimension warnings and passed at 360/768/1440px, including conversion,
table and clear-filter checks; the updated mobile screenshot was visually reviewed.
The first cold navigation timed out, then a completed rerun passed. The fixture
server/browser were stopped. No new full build was run for this one-prop follow-up.
