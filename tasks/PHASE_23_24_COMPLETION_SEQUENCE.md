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

Current checkpoint (2026-09-08): S3 has exact-context grant reads, atomic
acceptance, legacy entry-proof preparation and default-off browser provisioning.
Local Chromium verifies two-tab preparation against a mocked endpoint; this is
not full HTTPS/database/mobile acceptance. Legacy recovery, cleanup scheduling
and full-schema staging remain open. S3 therefore stays
unchecked. Earlier dated sections below are historical checkpoints, not the
current implementation status. See `docs/backend/RESEARCH_BROWSER_GRANTS.md`.

Visit migration checkpoint: added same-origin strictly Visit-scoped migration and
optional background invocation from authorized evaluation/withdrawal pages, under
the existing default-off rollout flag. Server verifies ownership and legacy session
before bind/read-back/retiring only that Visit cookie. A shared client helper holds
the Web Lock through preparation and migration. Failure leaves forms usable.
Research-wide tests passed 27 files / 210 tests; build passed with 65 generated static
pages. Real Chromium two-tab mocked migration QA passed. Historical/global recovery
and actual HTTPS/full-schema/mobile validation remain open; no new SQL or flag change.

Regression checkpoint: full Vitest run passed 348 files / 2,564 tests. Three
subsequent browser-preparation lifecycle regressions passed in a focused 3-file /
11-test rerun. This is local test evidence, not closure of the S3 rollout gates.

Cleanup checkpoint: implemented a separately default-off cron endpoint, one fixed
500-row batch, secret authentication and sanitized count-only responses. Scheduler
registration remains pending; enrollment can be paused independently of retention
work. Focused repository/config/maintenance tests: 24 passed. Local PostgreSQL:
149 assertions passed, including retained tombstones, role checks and SKIP LOCKED
under a held row lock. No new SQL migration or production activation.
Production build passed (64 generated static pages, new dynamic maintenance route).
Real local Next server smoke passed: missing bearer 401; valid local-only bearer
with cleanup disabled 200 plus explicit skip and no-store. No enabled cleanup was
called against application environment credentials; PostgreSQL tests used only the
disposable localhost database. Server and database container were stopped afterward.

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

September 8 release-verifier checkpoint: expanded the read-only catalog gate from
14 to 39 checks to cover grant RPC existence/execution privileges, definer search
paths, table RLS/direct column access and valid indexes. The disposable PostgreSQL
harness now passes 159 assertions and proves seven deliberately broken configurations
are rejected by the same query, rolling back each mutation. Standalone verifier
passed locally; no production connection or SQL change. Catalog checks do not prove
function-body correctness, full-schema compatibility or mobile behavior.

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

S4 continuation: server actions now reject unknown operation values instead of
treating every non-create command as an edit. Action/service/repository tests
passed (25 tests), covering read/manage denial before queries, history cursor
validation and private error containment. Authenticated E2E and hardware gates
remain open; this is not permission sign-off for the live deployment.

S6 continuation: executive Visit-channel distribution now uses already-filtered
Visits and linked immutable entry attribution, with unknown/legacy kept explicit.
This is a Visit-date cohort, not the attraction entry-start conversion cohort.
Summary CSV/XLSX uses the identical aggregate; complementary small cells suppress
all categories. The shared chart renders mobile bars and an accessible table.
Verified at 360/390/768/1440px without page overflow or page errors using synthetic
fixtures; empty, disabled, incomplete and small-sample states were checked separately.
No rollout flags or SQL changed. Full executive entry-start conversion aggregation,
authenticated QA and public summary SQL review remain separate pending work.

September 7 evidence audit: public statistics use the shared live read path, not
legacy daily aggregates. Public evidence now pins field scope; legacy summary
readers reject research scopes and unsupported filters before querying. Explicit
all-record date/attraction diagnostics remain available. See
`docs/dashboard/SUMMARY_EVIDENCE_SCOPE_AUDIT.md`. SQL/RPC permissions and a future
scoped summary read model remain pending; no production SQL or flags changed.

September 7 S4 UI continuation: reproduced and fixed stale lifecycle commands after
server refresh, reset history by tag/version, and exposed confirmed revocation of
unverified drafts. This does not change lifecycle authorization or SQL. Actor labels,
replacement replay UX, installation evidence and authenticated/device QA remain open.
Verification: 31 focused NFC form/action/service/repository tests passed on Node 22;
TypeScript, scoped ESLint and whitespace checks passed. Browser fixture checked at
360/768/1440px with no horizontal overflow or page errors; draft revocation controls
were exercised without writing production data. No full build rerun for this narrow
client-state patch; the prior release build is not claimed as new build evidence.

S4 replacement continuation: same-code revoked-original validation, existing-successor
replay and unique-conflict recovery implemented. Create results link to an exact
UUID-filtered tag within its code scope. No migration or rollout flag changes.
Installation evidence, actor labels and authenticated/device QA remain open.
Verification: 44 focused NFC tests, scoped ESLint, TypeScript and production build
passed on Node 22. Build generated 63 static pages. Replacement concurrency tests
mock repository conflicts; live authenticated replay and complete-schema concurrency
verification remain release gates. No full-suite rerun at this incremental checkpoint.

S4 actor history: added current staff display names through the existing actor FK,
localized event/status labels and explicit missing-name fallback without exposing
email/account identifiers. 49 focused NFC tests, TypeScript and scoped lint passed.
Synthetic browser history checked at 360/768/1440px without overflow/page errors.
Authenticated PostgREST join/role QA remains required; no new migration.

S3 cookie review found unbounded Visit credential headers (20 synthetic Visit
cookies: 8,298 bytes, excluding other cookies). ADR-011 proposes a bounded browser
credential and server-side grant registry with verified legacy migration. This is
not implemented and remains a research rollout blocker; do not evict old Visit
cookies or mark S3 complete. Installation evidence remains pending S5 work.
Current actor-history production build also passed (63 static pages). The visual
fixture now aliases Next Link explicitly; this fixes its standalone Vite runtime,
without changing production navigation. No full-suite or live-role sign-off claimed.

S4 database follow-up: reproduced direct cross-code replacement inserts locally.
Added `20260907000000_guard_nfc_replacement_code.sql` and verified 56 PostgreSQL
assertions, including two concurrent replacement writers (one successor only),
draft/unverified successor state, revoked-original immutability and service-role
cross-code denial. The schema verifier checks the new trigger. Migration has NOT
been applied to production by the agent; earlier user SQL confirmation predates it.
Also verified one registration audit event under contention and no direct trigger
function execution privilege for anon/authenticated/service_role. Read-only schema
checks passed 12/12 locally. This SQL/script-only change does not need a new UI build.

S3 Visit-link follow-up: existing RPC could replace an already-linked Visit with
another at the same check-in code. Service now rejects this, and additive migration
`20260907001000_guard_research_visit_rebinding.sql` serializes first association and
returns no-op success for same-Visit retries, including completed sessions.
Local harness passed 67 PostgreSQL assertions; focused service/auth tests passed
26 tests, scoped lint and TypeScript passed. Minimal research-session schema is used;
full-schema/mobile QA, acceptance token rotation and exact entry correlation remain.
Migration has NOT been applied to production. S3 stays open.
The Visit-link change also passed the production build (63 static pages); no new
UI layout or rollout flags changed. Full-suite and complete-schema QA remain open.

S3 bounded credential foundation: added research_browser_grants and service-only
bind/resolve/revoke/bounded cleanup RPCs in `20260907002000_add_research_browser_grants.sql`.
Both legacy token hashes are required to bind. Replays do not extend/revive grants;
resolution checks live withdrawal/status/retention. Minimal-schema PostgreSQL harness
passed 96 assertions including parallel grants, selective revocation, expiry, token
rotation survival, direct-role denial and bounded cleanup/tombstone retention.
No app integration, cookie migration or cleanup schedule exists yet; do not mark S3
complete or activate research. No production SQL applied. See RESEARCH_BROWSER_GRANTS.md.

S3 adapter continuation: typed server-only grant repository and host-only browser
credential/migration helper added. 15 adapter/auth tests cover malformed/duplicate/
mismatched RPC data, permission-error containment, exact Visit proof, and preserving
legacy credentials on missing proof, wrong Visit, database or cookie-write failure.
The helper is not called by application routes. Visit/entry grant lookup and atomic
acceptance must be connected before migration can be enabled; cookie growth remains
unfixed in the running application. No additional SQL or flags in this patch.
Combined browser adapter plus existing research service/auth tests: 41 passed;
TypeScript, scoped ESLint and whitespace checks passed. No new production build
for these unused server modules; no runtime activation or end-to-end claim.

S3 exact entry correlation: migration `20260907003000_correlate_research_entry_sessions.sql`
records immutable entry provenance during entry-aware consent acceptance. Database
guards reject first-Visit association from another entry at the same code and roll
back mismatched acceptance, including token updates. Historical sessions remain
unbound; no guessed backfill. Local minimal-schema harness passed 112 PostgreSQL
assertions. Consent writes are stubbed, so complete-schema consent/mobile QA remains
required. Not applied to production; browser-grant activation and valid-retry token
rotation remain open. No UI or rollout flag changes.
Read-only local schema verification passed 14 checks; scoped script ESLint and
whitespace checks passed. No new application build for this SQL/script-only patch.
Pending September 7 SQL is listed in `docs/deployment/RESEARCH_NFC_SQL_20260907.md`.

S3 context lookup continuation: service-only RPC resolves browser grants by exact
Visit/entry with live permission checks and ambiguity rejection. Typed adapter
revalidates context; dormant legacy migration now requires the same session to be
resolvable by Visit before deleting its old cookie. Local PostgreSQL harness passed
124 assertions; 45 focused research tests, TypeScript and scoped ESLint passed.
SQL `20260907004000_resolve_research_grant_context.sql` is not applied to production.
No application activation: atomic acceptance, stable browser provisioning and live
service integration remain pending. No new UI build for unused server adapters.

S3 atomic acceptance: `20260907005000_accept_research_browser_grant.sql` adds a
service-only entry-browser-verified consent/grant transaction. Per-entry serialization
and existing-grant token reuse protect concurrent/repeated accepts; legacy or revoked
rights require verified migration. Deployment/freeze validation still runs on retry.
Local minimal-schema harness passed 138 PostgreSQL assertions, including two writers,
stable access/withdrawal hashes, failed-grant rollback and role denial. Consent creation
is stubbed, not full-schema evidence. No live caller/flag changed and no production SQL
applied. Next: stable browser provisioning and end-to-end grant principal integration.

S3 verification follow-up: replaced the atomic-acceptance consent stub with the
original research-core RPC and consent-table DDL loaded from the source migration.
146 PostgreSQL assertions passed, including two consent purposes only under parallel
acceptance, notice/version/language preservation, no consent duplication on retry,
and complete rollback on failed grants or mismatched operational-session replay.
Scoped ESLint passed. Earlier wrapper scenarios remain stubbed and surrounding
schemas minimal; complete-schema and browser rollout gates remain open. No new
migration, application change or production activation in this verification patch.

S3 atomic adapter: added strict server-only TypeScript access to the new acceptance
RPC, with metadata-only results and sanitized response validation. 48 focused
research tests, TypeScript and scoped ESLint passed. No new SQL and no live action
switch. Runtime integration must resolve current grant hashes after acceptance,
not persist the unused proposed raw tokens on retries; provisioning and unified
service principal remain the next dependencies.

S3 service principal continuation: evaluation/response/operator-task/withdrawal
services now consume a normalized server-only capability shape. Legacy hashes are
computed once; the grant adapter preserves existing hashes without double hashing.
Live credential selection remains legacy-only, with unchanged ownership/status
guards and selective cookie cleanup. 50 focused tests, TypeScript and scoped lint
passed. No new SQL, cookie change, or rollout flag activation.
Production build also passed, generating 63 static pages. Full-suite and actual
multi-tab browser-grant rollout verification remain separate pending gates.

S3 Visit read integration: live evaluation/response/withdrawal authorization now
recognizes a pre-existing browser grant through exact Visit context, retaining
legacy credentials when no grant exists and failing closed on RPC errors. No route
issues a browser cookie or migrates legacy cookies yet. Tests cover unmodified
grant hashes and continued owner denial, as well as legacy behavior. 57 focused
tests, TypeScript and scoped lint passed. Participation discovery, entry-link and
acceptance/provisioning integration remain incomplete; no production activation.
Production build passed (63 static pages); no new SQL migration in this patch.

S3 discovery/link integration: withdrawal participation uses the Visit principal
with ownership checks; invitation suppression and Visit linking resolve exact entry
grants. Grant links avoid new Visit cookies, while legacy links retain their existing
cookie behavior. 61 focused research tests, TypeScript and scoped lint passed.
No new SQL. Browser cookie provisioning, atomic acceptance action and automatic
migration remain off/unconnected; this is not end-to-end rollout completion.
Production build passed with 63 static pages at this checkpoint.

September 8 S3 acceptance integration: entry-aware acceptance with an existing
research browser cookie now uses the atomic RPC, independent entry-browser proof,
and exact grant readback. No proposed raw token is written on replay; failed
readback/RPC does not fall back to the rotating legacy path. No-cookie callers
retain the existing flow. Provisioning and automatic migration are still pending;
no browser cookie is issued by a live route and no production SQL was applied.
Verification: 37 focused service/resolver tests, TypeScript, scoped ESLint and
whitespace checks passed. No new full build at this narrow service checkpoint;
the preceding build is not claimed as current end-to-end activation evidence.

September 8 S3 legacy entry preparation: atomic acceptance now attempts verified
binding of an existing entry-scoped legacy credential using both token hashes and
exact entry/session readback. Old cookies are never deleted during preparation.
Missing or mismatched provenance cannot be inferred and atomic refusal remains
authoritative. 46 focused service/auth tests passed. No new SQL or browser-cookie
provisioning; no rollout activation or full-schema end-to-end claim.
TypeScript and scoped ESLint passed; no new full build for this incremental helper.

September 8 S3 provisioning: added default-off server flag, same-origin/no-store
browser-cookie preparation endpoint, and consent submit preparation under a Web
Lock. A second request verifies cookie delivery; existing cookies are not rotated.
Failed preparation leaves decline available and consent disabled. 36 focused
route/config/service tests plus 3 client preparation tests passed; scoped lint and
TypeScript passed. No environment activation or SQL change. Real browser/mobile
multi-tab and complete-schema staging remain required before enabling the flag.
Production build passed, generating 64 static pages including the new endpoint.
No real-device or screenshot verification is claimed for the preparation states.

September 8 preparation browser QA: actual component rendered in Chromium with
two simultaneous tabs and a delayed mocked endpoint. One cookie issuance, four
requests and maximum one active request; both submit buttons became ready.
360/768/1440px overflow checks passed, and ready/failed mobile screenshots were
inspected. On deliberate 409, consent remains disabled and decline still navigates.
See `docs/testing/RESEARCH_BROWSER_PREPARATION_QA.md`. This does not verify real
Secure-cookie delivery, full Next/Supabase flow, or physical mobile browsers.
No application behavior, environment flags or SQL changed in this QA checkpoint.
