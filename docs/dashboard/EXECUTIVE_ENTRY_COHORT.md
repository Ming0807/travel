# Executive Entry-Start Cohort

## Current State

The filter-support helper, server-only repository, authorized aggregation service
and export-row builder are implemented. They are not connected to a live executive
chart or download route yet. No migration or flag activation
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

- Wire chart, accessible table and CSV/XLSX to one aggregate and cutoff.
- Provide a clear action to remove post-entry filters without dropping date/scope.
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
