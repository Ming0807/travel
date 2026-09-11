# NFC Recovery Worker Implementation

Status: partial held implementation, September 11, 2026. Part of Phase 23 S5 and
ADR-012. Not production activation approval. Preserve the existing upload,
recovery and cleanup flags as off.

Implementation checkpoint: held `20260911000000_add_nfc_recovery_leases.sql`
adds queue admission/backfill, claims, renewal and deferred/review outcomes.
The subsequent held transactions add leased finalization and intent reading.
The disposable PostgreSQL suite passes 135 assertions. Operator review and
complete processing are still open. No scheduler is connected.

## Required Outcome

Recover durable upload intents after the browser/process disappears. Make
progress across failures without deleting unrelated or late-arriving objects.
Keep operational installation evidence separate from tourist uploads and CMS.
The existing browser retry path is useful but does not satisfy this outcome.

## Authority Boundaries

- Browser confirmation remains owner-only using current `checkin_code.manage`.
- A worker must not call the owner-only service with a forged admin session.
- Machine authentication must be independently verified before queue access.
  Reuse the application's verified cron-auth pattern only after inspecting its
  timing-safe comparison, secret validation and deployment restrictions.
- Worker finalization needs a dedicated RPC/capability, not a relaxed browser
  RPC. Bind it to the exact job lease, original asset and verified content.
- Recheck original actor availability and the current tag/version in the
  transaction. Disabled owners or changed tags go to explicit review; never
  silently reassign evidence to the scheduler or another administrator.
- Operators reviewing blocked jobs need a defined permission and audit event.
  Viewing/retrying a job must not grant permission to override content binding.

## Durable Queue

Add a separate job table referencing immutable upload intents with RESTRICT
deletion. Do not add mutable scheduling fields to immutable evidence history.

Required fields: asset ID (unique FK), next attempt timestamp, attempt count,
lease token, lease expiry, last bounded outcome category, last attempt timestamp,
review-required flag, and completion timestamp. No raw error text, signed URLs,
provider credentials or source photos. Index due uncompleted jobs in stable
`next_attempt_at, asset_id` order.

Use database time. Create jobs transactionally with preparation, including an
idempotent migration backfill for existing intents. A first retry delay prevents
the worker competing immediately with an ordinary foreground upload. The delay
is a scheduling choice, not evidence that the provider has finished.

Claim bounded batches with `FOR UPDATE SKIP LOCKED`; issue a new unpredictable
lease token for each claim. Expired leases can be reclaimed. Every outcome update
and worker finalization must compare the exact current, unexpired token. A late
worker cannot acknowledge or finalize under a replacement worker's lease.

Backoff advances `next_attempt_at` so a failing early item cannot consume every
batch. Use capped exponential backoff and bounded jitter. Separate retryable
provider failure from content conflict, changed namespace and authorization
failure; the latter require review. Bound attempts per invocation and stop
claiming before the runtime deadline. Do not claim a large batch that cannot fit
within the lease/runtime budget. Lease duration must cover the bounded operation
budget or be renewed with the same fencing token.

## Processing Rules

1. Read durable binding and revalidate the leased job. Never accept a browser
   locator, account, expected hash or actor as worker authority.
2. For a prepared, eligible intent, discover only its exact private locator and
   verify bytes/dimensions. Atomically finalize and acknowledge the leased job.
3. An expired prepared intent may be abandoned transactionally. Abandonment is
   not deletion approval and must preserve the tombstone and reconciliation job.
4. Available intents do not need reupload. Verify metadata consistency and
   acknowledge recovery; attached report evidence remains immutable.
5. Provider 404, timeout and connection errors remain distinct bounded outcomes.
   Browser discovery still collapses provider errors to unavailable. The worker
   locator inspector distinguishes exact-key structured Cloudinary not-found
   responses from outages; all candidates still need byte verification. Supabase
   signed-endpoint 404 is now an absence observation during byte readback;
   private-provider signing/error semantics still require staging verification.
6. Abandoned jobs require exact-key late-arrival checks. Keep periodic checks
   until an explicitly validated settlement policy permits completion. No finite
   absence count by itself proves that an earlier provider request cannot finish.
7. Remote deletion requires independently checked provider namespace, exact key,
   content/ownership evidence and transactionally valid abandonment. Never route
   an unbound legacy record through the current generic delete helper.

## Delivery Tasks

- [ ] W1: Queue DDL, preparation/backfill integration, claim/renew/outcome RPCs,
  fencing, bounded input validation, RLS and indexes. Hold production SQL.
- [ ] W2: Real PostgreSQL concurrency tests: duplicate admission, two claimers,
  expired lease takeover, stale acknowledgement, retry fairness, rollback and
  anon/authenticated denial. Include real field-report module DDL.
- [ ] W3: Strict typed repository plus machine-auth service boundary. Dedicated
  leased finalization/abandonment transaction; preserve browser owner guards.
- [ ] W4: Exact-provider outcome adapter and recovery processor. No remote
  deletion until settlement and namespace gates are satisfied.
- [ ] W5: Metadata-only operator review, pagination, retry history, clear
  pending/review/completed states and explicit permission/audit coverage.
- [ ] W6: Registered cleanup lease/backoff parity and legacy read-only inventory.
  Unbound legacy objects require a separate reviewed reconciliation decision.
- [ ] W7: Private Supabase/Cloudinary staging, crash-boundary and late-arrival
  scenarios, runtime budget, monitoring, rollback and physical-device acceptance.

## Acceptance Evidence

W3 incremental checkpoint: the typed leased-finalization adapter now rejects
caller-supplied actor IDs, validates verified content and lease input, requires an
exact asset acknowledgement, and preserves only known database outcomes. The
recovery repository/worker suite passed 55 tests at that checkpoint.
Leased intent reading now has a held service-only RPC and typed adapter reusing
the existing binding/state validator. PostgreSQL QA passes 135 assertions,
including lock-wait expiry denial; three repository/worker suites pass 94 tests.
The held leased-abandonment transaction and strict adapter now retain the job
for late-arrival reconciliation, derive the original actor, and roll back if
lease expiry occurs during transition. PostgreSQL QA now passes 148 assertions;
three repository/worker suites pass 106 tests. Complete processing and provider
staging remain open; this is not activation approval.

W4 incremental checkpoint: `inspectNfcRecoveryLocator` exposes only located,
absent, provider_unavailable, namespace_changed or content_conflict. Cloudinary
absence requires a parsed numeric 404 with the exact resource-not-found key;
unknown/malformed messages remain unavailable. The account binding is rechecked
after I/O, and a 15-second deadline bounds both browser and worker discovery.
Supabase returns a deterministic candidate, not proof of existence. Forty-two
discovery/confirmation tests pass, including late response and browser regression
coverage. The subsequent readback inspector exposes verified metadata or bounded
absence/outage/review outcomes, preserving the browser error contract. Signing
now has a 15-second deadline independent of the fetch deadline; a late signing
response never starts a download. Four readback/discovery/confirmation suites
pass 70 tests, including seven real loopback HTTP cases. Actual private-provider
staging and complete processing remain open. An absence observation is not a
settlement proof, job-completion decision or deletion permission.

W4 processor checkpoint: `runAuthorizedNfcRecovery` claims one job only after
machine authorization and the default-off worker gate. It reads durable intent
metadata under a lease, renews before provider work, verifies bytes before
finalization, and returns only aggregate outcomes. Fresh prepared intents may
continue to finalization; stale ones transition to an abandoned tombstone under
the same fenced lease. A verified late arrival for an abandoned intent goes to
review, not automatic registration. Provider failure/absence defer with bounded
outcomes; namespace/content/actor/tag conflicts require review. Unknown failures
do not acknowledge the job. The processor exposes no HTTP route, cron handler,
lease, signed URL, owner or bytes, and performs no remote deletion. Eight NFC
unit/integration suites pass 201 tests. Private-provider/full-schema staging,
operator review UI and scheduler runtime observability remain open.

Every crash boundary must be exercised: before/after preparation, during provider
I/O, after provider commit with lost response, before/after finalization, after
lease expiry and during cleanup acknowledgement. Prove one immutable asset, no
duplicate report attachment, no stale lease success and no cross-account delete.

Use real PostgreSQL for transactional claims and locks, loopback HTTP for network
failure handling, and private staging providers for actual SDK semantics. Mocked
tests cannot establish cloud settlement, machine authentication, RLS across the
complete platform schema or physical NFC/QR behavior. Record those gaps rather
than marking Phase 23 complete from the existing 287 unit/component tests.
