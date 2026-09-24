# Phase 22: Attraction-Level Analytics and Improvement Evidence

Status: Implementation, migration application, authenticated responsive QA, production data validation, and export privacy smoke complete; production query-plan verification awaits a working Supabase Session Pooler connection

Priority: P1 decision support

## Goal

Allow authorized staff to analyze each attraction independently and translate visitor evidence into traceable improvement work.

## Required Views

- Attraction overview with date, campaign, collection mode, and entry-channel filters
- Unique tourists, visits, repeat visits, certificates, stamps, and survey completion
- Funnel from entry to check-in, photo, certificate, optional survey, and research evaluation
- Tourist origin, age group, language, companion, transport, overnight, and visit-purpose distributions
- Self-reported expense range and category, never labelled as business revenue
- Overall and dimension-level satisfaction with denominator per metric
- Revisit, recommendation, comments, controlled issue categories, and data-quality coverage
- Trend comparison and transparent benchmark against selected peer attractions
- Improvement issue, owner, action, due date, status, baseline, and follow-up evidence

## Delivery Tasks

### Task 22.1: Metric Contract

- [x] Define every attraction metric, unit, denominator, date field, source table, filters, missing-data rule, and decision use.

### Task 22.2: Query and Index Audit

- [x] Audit existing summary views, repository queries, indexes, and collection-mode filters before adding schema.

### Task 22.3: Tested Read Models

- [x] Implement typed, permission-aware attraction analytics read models with calculation regression tests.

### Task 22.4: Attraction Overview

- [x] Build attraction selection, date/campaign/mode/channel filters, KPI summary, coverage, and comparison context.

### Task 22.5: Funnel and Engagement

- [x] Add unique-tourist/visit-safe entry, check-in, photo, certificate, reward, survey, research, and repeat-visit analysis.

### Task 22.6: Tourist and Travel Behavior

- [x] Add privacy-safe origin, age, language, companion, transport, overnight, purpose, and time distributions.

### Task 22.7: Expense, Satisfaction, and Feedback

- [x] Add self-reported expense, satisfaction dimensions, revisit/recommendation, comment coverage, and issue categories.

### Task 22.8: Improvement Workflow

- [x] Connect evidence to the existing reviewed issue/action workflow, including owner, baseline, due date, status, evidence, and follow-up monitoring.

### Task 22.9: Export and Privacy

- [x] Add permission-checked aggregated exports with small-sample suppression, scope qualification, audit log, and filter metadata.

### Task 22.10: Performance and QA

- [x] Add bounded reads, attraction indexes, honest no-data/low-sample states, responsive layouts, and metric-contract tests.
- [x] Render attraction distributions, the visit-safe funnel, and satisfaction dimensions with Recharts while excluding privacy-suppressed cells from plotted values and retaining accessible tables.
- [x] Apply the migration and verify the Phase 21/22 schema through authenticated Supabase REST reads.
- [x] Validate production data parity, entry-channel filters, low-sample suppression, aggregate CSV export, and authenticated desktop/mobile layouts.
- [ ] Verify production query plans after replacing the IPv6-only direct database URL with the exact Session Pooler URL from Supabase Connect.

### Task 22.11: Channel Intelligence and Operational UX (2026-09-04 Follow-up)

- [ ] Add genuine searchable place/campaign labels and a clearer summary-to-action hierarchy.
- [ ] Add QR/NFC session, trend and conversion panels after Phase 23 attribution is reliable.
- [ ] Verify current-build drill-down/export/role/mobile parity and production performance.

Detailed tasks 22.11a-f and metric/visual contracts are in
`docs/dashboard/PHASE_21_23_READINESS_AND_CHANNEL_UX.md`. Existing channel filters
do not constitute completed channel-acquisition graphs. Historical channel
values remain `unknown` unless supported by recorded evidence.

### 2026-09-25: Channel Export Coverage Disclosure

- The attraction channel view model and export no longer emit the Visit-date
  attribution denominator when coverage is suppressed. The former CSV row
  could expose a small base even though the percentage was hidden. Small
  unclassified-entry counts are also null in the view model.
- A focused regression reproduced the two-Visit leak before the fix and passed
  afterward. This is export privacy parity only; production query plans,
  current-build role/mobile QA, and NFC rollout evidence remain open.
- Direct, Admin import, and Unknown Visit filters now show an unsupported
  entry-session cohort instead of a false empty result. The panel and export
  distinguish this from a measured QR/NFC zero; support for those channels in
  entry-session acquisition remains outside the current data contract.

### 2026-09-22: Dependent Filter Scope Fix

- Changing the selected attraction clears campaign/check-in selections and
  disables the previous place's options until the new GET result loads. Dates,
  evidence scope, and entry channel remain unchanged.
- Incoming URL filter snapshots remount the form so navigation restores the
  server-selected scope. Changing away and back before submission does not
  silently restore the cleared dependent filters.
- Four component tests passed, including submitted FormData and incoming-scope
  restoration. Chromium fixture QA passed actual GET submission and Back/Forward,
  plus 360/768/1440 px overflow checks. The mobile screenshot was inspected.
- Scoped ESLint and full-project TypeScript passed. These fixture checks do not
  replace authenticated data/export parity or physical-device acceptance.
- The Node 22 production build passed, including TypeScript and 66 static
  generations. The initial browser QA selector was corrected to use the actual
  accessible combobox role/name; the complete interaction run then passed.
- No database changes or metric/denominator changes were introduced. Campaign
  names still require the authoritative master-data work described in the plan.

### Evidence Scope Status Follow-up (2026-09-22)

- The workspace previously showed a green Pilot/Simulation exclusion heading
  for every non-truncated scope, including QA, Pilot-only, and simulated-only.
  The heading now reflects the selected scope; non-field scopes use a caution
  treatment. Incomplete reads retain the highest-priority warning.
- Calculation, filtering, source notes, privacy suppression, and export gates
  remain unchanged. Regression coverage includes non-field labels, incomplete
  reads, and the existing layout/export contracts.
- Verification: all eight workspace tests passed on Node 22 with one forks
  worker; scoped ESLint and whitespace checks passed. No additional production
  build was run for this display-only follow-up; the preceding filter checkpoint
  has its own successful build evidence.

### Draft Provenance Follow-up (2026-09-22)

- Chart draft links now carry source evidence scope, entry channel, campaign,
  and check-in filters into the editable draft note. The parser validates enums
  and positive IDs, rejects malformed context, and labels legacy missing scope
  as unknown rather than assuming field evidence.
- Draft notes explicitly distinguish URL-provided aggregate values from verified
  evidence and warn that the destination improvement calculations may use a
  different scope. The existing candidate read/review/save boundaries remain.
- The improvement page shows source provenance above the candidate result even
  when the candidate does not qualify. It states that the destination candidate
  currently uses all records in the selected date range, without the chart's
  evidence-scope, channel, campaign, or check-in filters. Chart-linked drafts
  require an explicit accept/dismiss selection before review submission.
- Twelve parser/link tests and scoped ESLint passed. This addresses lost source
  context; it does not implement matching destination filters or immutable source
  snapshots. Full scope parity in 22.11d remains open and needs repository/schema
  work before it can be claimed complete.
- The page-level follow-up passed 22 focused draft/workspace tests, scoped ESLint,
  TypeScript, whitespace checks, and a Node 22 production build (66 static pages).

### Candidate Scope Parity Follow-up (2026-09-23)

- The improvement candidate now re-reads selected Visits and their survey answers
  with the same evidence-scope predicate and channel/check-in/campaign filters as
  attraction analytics. Current and comparison periods use the same population.
- Reads are paginated and bounded at 5,000 source Visits; partial reads cannot
  qualify a candidate. Unlinked reviews are excluded from filtered drill-down.
- Reviewed issues store population filters in version-two JSON evidence snapshots;
  version-one issues remain readable and are labelled as legacy all-record data.
  Action follow-up links carry the saved population into attraction analytics.
- The server action no longer defaults an omitted decision to acceptance. The
  review is recalculated from submitted, validated filters before saving.
- Remaining in 22.11d: automatically capture comparable follow-up metric values
  in an immutable action verification snapshot. Manual follow-up notes and the
  scoped analytics link are not proof of a causal before/after effect.
- QA: 79 focused tests passed across nine files with four workers, scoped
  ESLint and a Node 22 production build passed, and a read-only live Supabase
  nested-query smoke returned successfully. No SQL migration is required; the
  existing JSONB evidence column stores both snapshot versions.
- A full-suite run passed 3,175 tests and failed one NFC recovery UI test that
  clicked a still-disabled button during list loading. That test passed alone;
  its wait now checks the button is enabled, and the focused nine-file run
  passed afterward. The entire full suite has not been rerun since that test fix.

### Immutable Action Verification Follow-up (2026-09-24)

- Added a versioned, aggregate-only verification snapshot to improvement actions.
  Verification re-reads the saved evidence population over the follow-up window;
  incomplete source reads cannot be verified. The snapshot and status/history
  transition are stored atomically. Legacy issue snapshots and previously verified
  actions remain readable but are not presented as comparable numeric evidence.
- New actions require score metrics to match the issue dimension and follow-up
  dates to start after the baseline. Low-sample results retain denominators but
  suppress the value. The UI states that a before/after difference is not causal.
- Migration `20260924000000_add_attraction_action_verification_snapshot.sql` must
  be applied before this application change can be deployed. Production application
  and database smoke checks remain pending until then.

## Analytics Rules

- Every metric states unit, denominator, date field, source table, calculation, and missing-data rule.
- Suppress or qualify small samples; never imply representativeness or causality.
- Exclude simulated and internal pilot records by default from field-tourism claims.
- Treat entry channel as `unknown` until a server-verifiable QR/NFC contract exists; never trust a hidden client field as attribution evidence.
- Support CSV/XLSX export only through existing permission and privacy boundaries.
- Drill-down may show operational records only to authorized roles; public analytics remain aggregated.

## Acceptance Criteria

- Staff can answer what is happening at one attraction, for whom, where the flow loses users, what visitors report, and what action should follow.
- Calculations match repository tests and dashboard metric documentation.
- Empty and low-sample states are honest and actionable.
