# Phase 23 Then Phase 24 Completion Sequence

Approved direction: finish NFC operations and evidence integrity before the
remaining analytics UX. Do not enable flags or apply production migrations.

September 6 release instruction: user authorized commit/push after verification.
This supersedes earlier no-push checkpoints, but not the production SQL/flag hold.

## Structural Review

- Keep existing research deployments as collection-context authority; do not add
  a second campaign/settings editor. Consent remains separate from context.
- Use one shared evidence-scope predicate in executive and attraction analytics,
  including peer comparisons. New unknown entries must not become field data
  merely because an optional research form was skipped.
- Keep snapshots immutable and classify in SQL before insertion. No URL-provided
  collection mode, no browser-cookie inference, no retrospective backfill.
- Reuse existing tag lifecycle triggers/audit. Admin updates need optimistic
  version checks, permission guards and explicit confirmation for revocation.
- Do not redesign unrelated CMS, identity, uploads or certificate layouts.

## Delivery Order

- [x] S1: Snapshot active frozen deployment scope at entry; ambiguous/unavailable
  deployment stays unknown. Preserve study/freeze provenance without consent.
- [x] S2: Share evidence predicates across executive/attraction/peer analytics.
- [ ] S3: Bind optional research acceptance to the exact entry flow across tabs;
  prevent a shared cookie from attaching a different study/session.
- [ ] S4: NFC admin list/detail with search, status, pagination, provision,
  exact URL read-back verification, activation/deactivation, replacement and audit.
- [ ] S5: Installation evidence and physical deployment guide; no claims of
  verified presence or browser-based universal NFC writing support.
- [ ] S6: Executive channel summary plus scoped channel CSV/XLSX and drill-down.
- [ ] S7: Staging, permissions, hardware and Node 22 verification, rollout review.
- [ ] S8: Resume Phase 24 unfinished filters, export/history parity and responsive
  page-state QA. Reconcile task statuses rather than repeating implemented work.

## S1/S2 Verification

New migration: `20260905000000_snapshot_entry_research_scope.sql`, after the
NFC registry and entry-session migrations. Tested in disposable local PostgreSQL:
36 assertions covering frozen/paused/expired/ambiguous/mismatched deployments,
unchanged history, ownership, revocation and idempotent Visit/XP.
Focused evidence/repository tests: 33 passed including privacy regressions.
No production data or feature flags were changed.

Known boundary: dashboard/public summary SQL and legacy records need separate
evidence-scope audit before rollout. Default-off compatibility is not proof that
all production aggregate paths are ready for activation.

## S3/S4 Local Progress

- Scoped two-hour HttpOnly research cookies isolate entry flows; reads never
  fall back to the global cookie. Acceptance validates the browser-bound flow
  and uses its ID as the operational deduplication key. Legacy flow is retained.
- Visit linking selects credentials for its exact entry. Remaining S3 work:
  atomic study-snapshot/redeployment parity. Evaluation and withdrawal now select
  Visit-scoped credentials and verify Visit ownership; withdrawal preserves another
  tab's global session. Do not call multi-tab research fully accepted yet.
- Added `/admin/checkin-codes/[id]/nfc` under each existing check-in code so staff
  do not re-enter attraction/spot assignments. Supports draft creation, read-back
  verification, activation/pause/revocation, replacement and paginated history.
- Server actions enforce read/manage permissions; updates compare versions.
  Verification compares exact URL against configured HTTPS origin. The additive
  activation guard rechecks live code availability and immutable assignment in SQL.
- Remaining S4 work: installation-evidence workflow, richer history actor labels,
  authenticated end-to-end QA and replacement replay UX. Label search escapes
  SQL wildcard characters and preserves status/code scope with stable pagination.
- SQL verification: 38 assertions. Focused services/flow/evidence tests: 76 passed.
  Production build passed with the NFC route. Forms checked at 360/768/1440px
  using synthetic fixtures with no horizontal overflow; no live mutation occurred.

New migration `20260905001000_guard_nfc_activation_assignment.sql` follows scope
snapshot migration. Neither migration has been applied to production by agent.

## September 6 Review

- Acceptance preflight compares entry study ID, frozen timestamp (as an instant)
  and collection mode against the currently available invitation. Missing provenance,
  changed study/freeze/mode or a disabled invitation fails before credentials are
  created. Legacy entry handling remains unchanged.
- Added an entry-aware consent RPC in `20260906000000_bind_entry_research_acceptance.sql`.
  It holds study/deployment locks while comparing immutable provenance and invoking
  the existing consent RPC. Entry callers use this RPC; legacy callers are unchanged.
  Verify the additive migration locally and with the complete research schema before
  rollout. Preflight alone is not considered an atomic guarantee.
- Also review scoped-cookie accumulation/header size before extended field use.
- Channel CSV/XLSX rows now use the same scoped aggregation as the attraction panel,
  retaining suppression and distinguishing entry conversion from Visit coverage.
  Executive channel summary and public aggregate SQL audit remain pending.
- Main research sample is tourists currently visiting selected attractions. Existing
  facilitated operator modules remain optional; no operator step is added to tourists.
- Do not push, apply production SQL or enable flags as part of this review.

### Verification At This Checkpoint

- Full suite: 335 files passed; one old Task 18 payload assertion failed because
  Visit-scoped evaluation now intentionally sends `visitId` for authorization.
  The assertion was updated without relaxing the prohibition on tourism answers.
- Final focused rerun: 8 files, 73 tests passed, including the corrected contract,
  entry/Visit isolation, changed deployment rejection, repository RPC selection,
  channel export and NFC repository tests.
- Typecheck passed on local Node 26.1.0 (required release runtime remains Node 22).
- Docker daemon was unavailable. The new September 6 SQL wrapper and its added
  disposable PostgreSQL scenarios were NOT executed; previous 38 SQL assertions
  do not count as evidence for the new migration. No production connection used.
- Keep S3 unchecked until SQL/full-schema verification and remaining flow review
  pass. No claim of full-suite green after the final patch or production readiness.

### Release Recheck

Docker became available on the subsequent turn. The disposable PostgreSQL harness
passed 44 assertions, including the new wrapper's changed-mode/freeze rejection,
legacy delegation and anonymous/authenticated execution denial. This updates the
earlier Docker blocker only; the wrapper harness still uses a downstream consent
stub and does not replace full-schema staging or physical-device acceptance.

Final Node 22.23.2 gate: 336 files / 2,444 tests passed, production build and
TypeScript passed, staged ESLint and whitespace checks passed. The user reports
all SQL applied in Supabase; REST schema discovery confirms the new tables,
snapshot columns and consent RPC. Direct PostgreSQL verification is blocked by
DNS, so production grants and full-schema behavior remain unverified. Both flags
remain disabled. User-authorized default-off code push may proceed.
