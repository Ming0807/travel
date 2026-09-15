# NFC Cleanup Reconciliation

Phase 23 S5 / W6. Held; production cleanup remains disabled.

## Verified Gaps

The legacy cleanup service calls generic `deletePrivateFile` with a storage path.
Its claim has no provider-account binding or fencing token. Queue acknowledgement
uses asset ID only, and unfinished early items consume batch capacity indefinitely.
Do not connect this service to a scheduler or expose it to operators as safe cleanup.

## Required Outcome

Provider deletion boundary and SDK capability evidence are recorded in
`docs/architecture/adr/ADR_013_NFC_PROVIDER_DELETE_IDENTITY.md`. In particular,
Supabase's documented exact-version API is newer than the installed remove signature;
Cloudinary immutable asset IDs are not yet retained by this platform. Build durable
read-only provider observations before implementing destructive processing.

Inspect existing registered evidence without mutation first. Separate retained
report evidence, registered intent-bound evidence, pre-intent legacy evidence and
existing cleanup tombstones. Inventory classification does not grant deletion.
An intent record alone does not prove current provider account or settlement.
Objects missing from the database cannot be discovered by this inventory; they
require a separately scoped private-provider inventory and reconciliation.

## Ordered Tasks

- [x] W6.1 Metadata-only, tag-scoped inventory RPC; page 20 plus lookahead,
  deterministic asset-ID cursor, no path/owner/hash/provider account in output.
  Verify readonly transaction and anonymous/authenticated denial on PostgreSQL.
  Local replay verifies pagination, exact metadata fields, legacy/intent
  distinction, real report attachment and pending/acknowledged cleanup fixtures.
- [x] W6.2 Strict repository, manage-permission-first service and default-off
  inventory action; do not reuse destructive claim RPC for a read operation.
  Repository, row validation, permission-first service and sanitized action are
  implemented. Inventory has an independent default-off flag and an on-demand UI caller.
- [x] W6.3 Tag-local operator inventory with explicit retention/legacy/cleanup
  states, mobile layout and no deletion controls. Audit reads without raw locators.
  Manage-only panel uses server cursors, clears stale data after failures, and
  resets on tag change. Local component/fixture verification is complete;
  authenticated staging and production activation remain separate gates.
- [ ] W6.4 Registered cleanup lease/backoff replacement: exact fencing, current
  report-attachment exclusion, provider/account/key/content binding and fairness.
  No generic delete fallback for unbound legacy evidence.
- [ ] W6.5 Read-only private-provider legacy inventory with explicit account scope,
  bounded paging and operator reconciliation evidence. Never infer ownership from
  name or age alone, and do not enumerate outside the approved private namespace.
- [ ] W6.6 Settlement, deletion race and lost-ack staging acceptance; retain
  tombstones and safely revisit late arrivals. Separate machine authentication,
  rollout, rollback and monitoring approval from local test success.

## Inventory Contract

Return asset ID, created timestamp, provider kind, attachment boolean, intent
presence and cleanup state (none/pending/acknowledged). The acknowledged state
means the legacy database records a deletion acknowledgement, not an independent
current provider-absence verification. Use one SQL statement/snapshot. No calls
to claim, finalize, complete or delete. Do not change the immutable asset table.

## September 14 Checkpoint

The disposable platform replay passes 75 migrations and the inventory checks:
24 registered assets span two cursor pages without duplicates or skipped
lookahead; exactly one has an intent; another tag returns no rows. A read-only
transaction accepts the RPC and both browser roles are denied. No production
migration, inventory endpoint or deletion was activated. Auth/storage remain
compatibility stubs. W6 is not complete.

The follow-up replay covers a real report attachment and seeded legacy pending/
acknowledged cleanup rows. Repository/service/action/config suites pass 23 cases.
TypeScript caught a parameterized-test shape that spread row arrays as separate
arguments; cases now use explicit object wrappers, and the corrected 12 repository
tests pass. Do not rely on the earlier malformed-response test run as evidence.
Scoped ESLint, TypeScript and production build pass (66 generated static pages).
No flags enabled, production migration applied, provider call or deletion run.

## Inventory UI Verification

The panel adds seven component tests for on-demand loading, historical cleanup
meaning, cursor navigation, stale-row removal, disabled/empty states, duplicate
clicks and tag changes. Together with repository/service tests, 28 tests pass.
Scoped ESLint passes. Playwright exercises the actual component with mocked
actions at 360/768/1440 pixels: no horizontal overflow, distinct next-page rows,
back navigation and no page exceptions. Screenshots were visually inspected.
The isolated fixture has a favicon 404, not an application request failure.
These checks do not prove live Supabase session, provider or migration readiness.
The follow-up production build also passes TypeScript and generates 66 static
pages. No production migration or flag was changed for this UI checkpoint.

## W6.4 Implementation Sequence

Keep the legacy runner disconnected throughout this work. Implement and verify
these boundaries in order; do not equate a database lease with remote delete
fencing.

1. Add held queue admission and leases for registered, finalized, intent-bound
   evidence only. Require matching immutable asset/intent metadata and exclude
   report attachments under the existing asset-row lock. Retain unbound legacy
   evidence for reconciliation, never infer its provider account from settings.
2. Claim due work using bounded `SKIP LOCKED` selection, attempt count and
   `next_attempt_at`. Expired leases may be reclaimed with a new token; old tokens
   cannot renew, defer or acknowledge. Failed early items must not starve later
   due work. Recheck expiry after lock waits, not only on transaction entry.
3. Read the durable provider/account/key/content binding through a leased,
   machine-only RPC. Recheck current configured account before provider I/O.
   Namespace or content conflicts require review; outages use bounded backoff.
   Do not fall back to generic `deletePrivateFile` on any binding failure.
4. Establish provider-specific settlement and mutation preconditions before
   implementing deletion. A successful readback followed by an unconditional
   delete has a replacement race; an expired database lease cannot cancel a
   request already sent to a provider. Verify available object-version/identity
   preconditions and in-flight upload handling for each provider. If those
   guarantees cannot be established, retain the object and require review.
5. Persist append-only bounded outcomes and retain tombstones. Lost provider
   acknowledgements require reconciliation, not automatic claims of current
   absence. Distinguish deletion response, independent absence observation and
   settlement; do not reuse historical `deleted_at` as all three facts.
6. Add real PostgreSQL tests for report/admission races, stale lease tokens,
   expiry during lock waits, backoff fairness and repeated acknowledgements.
   Add provider-adapter tests for account swaps, content replacement, timeouts,
   late upload completion and lost acknowledgements. Live private-provider
   staging remains required before scheduler wiring or flag activation.

Evidence reviewed: `20260909001000_queue_nfc_orphan_cleanup.sql`, the cleanup
service/repository, prepared upload binding and NFC readback adapter. The current
generic runner has no provider precondition or lease token and is not safe to
activate merely because inventory UI verification passes.

## Held Lease Foundation Checkpoint

Migration `20260914001000_add_nfc_cleanup_leases.sql` implements bounded bound-only
admission, 2-minute leases, strict leased metadata reads, renewal and backoff/review.
It revokes service execution of old asset-only claim/completion RPCs. Do not apply
it to production as a routine UI migration: the legacy runner intentionally stops
working after this change, and no replacement deletion runner is activated.

Disposable PostgreSQL replay passes all 76 migrations and exercises exclusion of
attached/recent/unbound assets, unique live claims, exact binding reads, stale
tokens, reclaimed leases, due-work fairness, conflict review and permission denial.
A second PostgreSQL connection proves the reader is waiting on a row lock and
then releases it after expiry; the read correctly rejects the expired token.
The red run failed because the new claim RPC did not exist before implementation.

W6.4 remains open: broader concurrent-claimer stress coverage,
repository/worker integration and provider-specific
settlement/deletion preconditions are still required. No provider calls, production
SQL, scheduler activation or file deletion occurred during this checkpoint.

The follow-up replay uses two actual database connections and open transactions
to verify both attachment/admission orderings. A report's uncommitted asset lock
makes cleanup skip that asset and claim another. An uncommitted cleanup admission
excludes a second claimer; an attachment waits, then rejects with
`NFC_EVIDENCE_NOT_AVAILABLE` after admission commits. Assertions inspect stored
rows as well as outcomes. No production SQL change was needed for these cases.
The first harness run could not observe another session's wait under service_role;
only the disposable test observer is reset to database owner to read activity.
RPC claims still execute under service_role. Corrected replay passes 76 migrations.

The next held migration adds atomic append-only cleanup scheduling history using
the established recovery-event pattern. PostgreSQL tests verify ordered bounded
metadata, no event for rejected tokens, denied browser reads/service deletes,
immutable updates and rollback of both queue renewal and its event. The red run
failed on the absent event table. No private locators or lease tokens are recorded.
Operator history UI and provider settlement/deletion outcomes remain unimplemented;
these scheduling events must not be presented as remote deletion confirmation.

The internal cleanup job repository now validates bounded claim batches, unique
asset/token pairs, lease timestamps, strict inputs and exact acknowledgement.
Leased binding responses must match the requested asset and canonical private
Supabase or versioned authenticated Cloudinary key. Unknown database errors are
sanitized; known lease-loss remains distinguishable. Eighteen mocked-RPC tests
pass, including Cloudinary namespace and input rejection. This is an adapter,
not machine authentication or a provider mutation permission check. No live
caller, route, deletion helper or scheduler is connected; real repository-to-
PostgREST acceptance and the processor remain outstanding.
Scoped ESLint and project `tsc --noEmit` pass for this adapter checkpoint. No
production build was rerun for this internal, currently unreferenced module.

The shared exact-key discovery adapter now also offers an internal provider
identity observation. Cloudinary observations retain validated provider asset ID
and version from the same account-pinned metadata response. Missing/malformed IDs
and deterministic Supabase paths return `identity_unavailable`, never an invented
identity. Existing public locator/recovery return shapes remain unchanged.
Discovery and recovery processor suites pass 58 tests (7 new identity cases);
Scoped ESLint and project TypeScript checks pass. This is not yet a persisted receipt, verified content,
Supabase version discovery or deletion authorization. No provider was contacted
by the mocked tests and no worker caller is enabled.

The internal inspection claim entry now authenticates the machine before checking
its independent default-off `NFC_EVIDENCE_INSPECTION_WORKER_ENABLED` flag. It claims
one job just in time. Recovery/legacy cleanup flags cannot activate this entry.
This is read-only with respect to providers, not PostgreSQL: claiming mutates the
queue and reserves evidence. No route, scheduler or provider processor is wired.
The worker and repository suites pass 32 tests, including invalid/missing machine
credentials, disabled/malformed flags, one-item claims and propagated failures.
September 15 verification note: scoped ESLint and project TypeScript processes
were stopped after prolonged execution without a result on the slow local host.
Neither check is recorded as passing for this entry-point change. Repeat them
before release; no route, flag, migration or scheduler was activated.
