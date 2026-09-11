# NFC Upload Intent Foundation: Hold for Staging

Migration: `20260910000000_prepare_nfc_evidence_upload_intents.sql`.

Held follow-up: `20260910001000_finalize_nfc_evidence_upload_intents.sql`, after
preparation and the September 9 asset/cleanup migrations. Neither is authorized
for production application by this checkpoint.

Do not apply to production or enable recovery yet. This is preparation only, not
the complete ADR-012 recovery protocol. No existing upload route calls the new
repository; tourist uploads, public CMS uploads and current report attachment are
unchanged. No bucket, provider operation, cron, seed or deletion is created.

## Data Contract

`nfc_evidence_upload_intents` stores a database-generated asset UUID, opaque request
UUID scoped to the actor, tag/version, provider/account, namespace and exact object
key, processed WebP hash/size/dimensions and creation time. It stores no original
filename, source bytes, signed URL or credentials. For Supabase the prefix is the
private `nfc-evidence` bucket/key prefix; the account must identify the configured
storage project. For Cloudinary the account identifies the cloud and the prefix
ends in `nfc-evidence`; the key is a public ID without an invented version. The
future storage adapter must require authenticated image delivery and compare its
actual configured account with this binding before doing any operation.

Preparation locks per actor, validates active actor and live tag/version, and
returns the same immutable row on exact retry. Request reuse with different
metadata fails. Twenty prepared intents per actor is a fail-closed admission
limit; existing valid retries still succeed when capacity is reached. There is no
automatic expiry or inferred absence of provider files. Separate actors have
separate request namespaces and admission limits.

Only `service_role` can execute the RPC. It has SELECT but no direct write grants.
Anonymous/authenticated roles cannot read or prepare. The future application
service must independently require current `checkin_code.manage`; this RPC's
active-actor check is not a complete RBAC check or permission to upload/attach.

The TypeScript adapter validates exact returned content/actor/provider binding,
one-row cardinality and deterministic object key. Database errors are mapped to
bounded codes. It is server-only and unused by live routes.

## Verification

```powershell
pnpm dlx node@22 scripts/verify-nfc-upload-intents.mjs
pnpm dlx node@22 node_modules/vitest/vitest.mjs run tests/unit/nfc-upload-intent-repository.test.ts --maxWorkers=1
```

The first command creates and removes a unique loopback-only disposable PostgreSQL
16 database. It reads no `.env` and applies only this migration over minimal
admin/tag tables. Thirty-three assertions pass: exact and simultaneous retries,
metadata conflicts, invalid payloads, private-provider locators, direct-role
denial, inactive actor, stale/revoked tag, capped admission and two concurrent
requests competing for the last slot. The service-role fixture uses BYPASSRLS to
match Supabase; the initial count assertion exposed that missing fixture property
and was rerun after correction. Sixteen adapter tests, scoped ESLint and Node 22
TypeScript pass. No new production build was run for this dormant adapter/schema
checkpoint; no live application import was added.

The read-only remote migration-history check failed DNS resolution (`ENOTFOUND`);
it did not apply SQL and does not establish production migration status.

## Remaining Gates

The preparation migration alone accepts only `prepared`. The held lifecycle
follow-up adds atomic finalize/abandon transitions and immutable terminal history.
Finalization validates actor, live tag version, pinned account/path and processed
content metadata, then updates the intent and inserts asset metadata in one
transaction. The shared asset advisory lock serializes retries with legacy
registration. An asset insert guard rejects registration of prepared/abandoned
intents outside finalization; assets without intents retain legacy behavior.

Only prepared intents older than 24 hours can be abandoned by an authorized
operator; finalization refuses that same expired cohort. Available assets cannot
be abandoned, and retries return the same result. The 24-hour boundary is a
finalization eligibility deadline, not proof that a provider write has settled.
Abandonment performs no deletion and retains tombstones for late-arrival checks.
An existing cleanup claim blocks finalization retry; existing report attachment
continues using immutable asset rows and its established cleanup locking.

Lifecycle QA passes 57 PostgreSQL assertions, including forced asset-insert
rollback, concurrent finalization, stale abandon/finalize contention, legacy
registration bypass rejection and role denial. The adapter's terminal-state
validation passes 18 tests. Scoped lint and Node 22 TypeScript pass. The fixture
uses actual asset and cleanup migrations but minimal admin/tag/report parents;
it does not verify complete report submission, full RBAC or real provider bytes.

No state transition should be enabled by manually updating rows. Pinned storage verification, client
retry identity, recovery leases/backoff, full-schema race QA, real admin access
and provider staging remain required before activation. No live route calls these
RPCs and there is no scheduler or remote reconciliation/deletion path yet.

### Lifecycle Adapter Checkpoint

The dormant server repository now exposes finalize and stale-abandon adapters.
They validate inputs before RPC calls, require the exact asset UUID or literal
true acknowledgement, and map only bounded database error codes. They do not
authorize callers or verify remote content; those remain mandatory upstream work.
An ambiguous finalize response must trigger readback/exact retry, not deletion.
Twenty-six adapter tests, Node 22 TypeScript and scoped ESLint pass. This checkpoint
changes no live route, environment flag or SQL; no new build or provider test is
claimed. The preceding 57-assertion SQL result is a separate lifecycle checkpoint.

### Pinned Upload Adapter Checkpoint

`lib/storage/nfc-prepared-storage.ts` derives the current destination and rejects
provider/account/prefix changes against the persisted intent. Supabase account
identity is SHA-256 of the canonical API endpoint (origin plus path without trailing
slashes); this supports distinct custom/self-hosted endpoints without storing URL
credentials. Cloudinary identity is its cloud name plus normalized public-ID
prefix. Existing intents with other account conventions fail closed; do not rewrite
them or infer equivalent destinations after a configuration change.

Only prepared intents may upload. Copied bytes must match hash, byte count, WebP
format and single-frame dimensions before upload. Destination is rechecked after
decoding. Existing private upload behavior supplies no-overwrite and authenticated
Cloudinary delivery; returned provider/bucket/key/version syntax is checked.
Ambiguous or conflicting responses never cause deletion or automatic finalize.

Thirty-one focused prepared/legacy storage tests pass using actual Sharp fixture
bytes and mocked providers, including configuration changes and caller-buffer
mutation during decoding. TypeScript and scoped lint pass. No remote provider
upload/readback was performed. This dormant adapter is not connected to live
routes; independent remote-byte verification and duplicate-object recovery remain
required before activation. No SQL or UI changes are included.

### Independent Readback Adapter

The dormant `nfc-evidence-readback.ts` validates pinned account/provider/key and
requests a private 60-second URL from the existing signer, never from browser
input. Downloads are restricted to the configured Supabase origin or Cloudinary's
API origin, reject redirects, disable caching, and abort after 15 seconds of
fetch/body reading. Streamed bytes cannot exceed the expected size (at most 2 MiB).
Actual SHA-256, byte count, WebP format and single-frame dimensions must match.
The result contains metadata only, not the signed URL or photo bytes.

HTTP failures including 404 are unavailable, not authoritative absence or a reason
to delete. Signing/provider discovery has its own integration requirements; the
15-second bound is on download, not the entire signing operation. Cloudinary
private download may need provider-specific staging verification (including any
redirect behavior); the adapter fails closed instead of following unknown hosts.
It verifies returned bytes for the exact public ID but does not establish immutable
Cloudinary version history or discover a version lost before upload acknowledgement.

Forty-two prepared/readback/legacy storage tests pass with actual generated WebP
bytes and mocked network/providers, including overflow, changed account, foreign
host, corrupted bytes and stalled fetch abortion. Node 22 TypeScript and scoped
lint pass. No real provider call, live route integration, new SQL or production
build is claimed. Client retry/discovery and authorized orchestration remain open.

### Loopback HTTP Verification

`tests/integration/nfc-readback-http.test.ts` runs actual Node HTTP fetch/streaming
against a unique loopback listener with generated WebP bytes. Four tests verify
successful readback, excess bytes, truncated content and refusal to follow even
same-origin redirects. Signing and destination configuration are fixture adapters;
this is not real Supabase/Cloudinary signing or provider acceptance. The listener
and connections are closed after the suite.

A new regression reproduced configuration drift during asynchronous signing.
Readback now revalidates the pinned destination after signing, before fetch.
Twelve unit plus four HTTP integration tests pass, along with TypeScript and
scoped lint. No new SQL, rollout or production build in this follow-up.

Rollback for this dormant foundation is to leave callers disabled and retain any
recorded intent metadata. Do not drop the table or delete storage to undo a release.

### Authorized Confirmation Service

`confirmNfcEvidenceUpload` now requires current `checkin_code.manage`, reads the
exact actor-owned intent with strict metadata/state validation, verifies private
bytes, and calls the authoritative finalize RPC. Browser-supplied hashes, sizes
and accounts are rejected. An optional candidate storage locator is still checked
against the durable exact key and actual content; finalized intents cannot change
their stored locator. Missing Cloudinary versions are not invented.

Available retries revalidate readback and call finalize again so current tag/actor
and cleanup decisions remain authoritative. Failed or ambiguous finalization never
returns success and never deletes provider data. Only asset ID/dimensions/byte count
are returned. The service is dormant with no route or rollout flag change.

The focused confirmation/repository/readback/HTTP suite passes 55 tests. TypeScript
and scoped lint pass. Guards/database/providers are mocked except the loopback HTTP
suite; this is not complete authenticated Next/Supabase integration. Automatic
upload-or-recover orchestration, Cloudinary version discovery, client retry identity,
worker reconciliation and real provider staging remain required. No new SQL/build.

### Exact Locator Discovery

Confirmation can now discover a lost Cloudinary upload version using the installed
SDK's exact `api.resource(publicId)` call with explicit image/authenticated type
and pinned cloud/account credentials. It never lists folders. Returned public ID,
resource type, delivery type, format and positive safe-integer version must match;
only then does independent byte readback proceed. Supabase keys are deterministic
and require no listing. HTTP/provider errors including 404 remain unavailable,
not permission to delete or proof that an in-flight upload cannot appear later.

The SDK timeout is 15 seconds (its socket timeout, not a total process deadline).
No global Cloudinary configuration is changed by discovery. Exact-key metadata
does not by itself prove content; confirmation still requires hash readback.
Eighty-four tests across six focused repository/storage/service/HTTP suites pass.
TypeScript and scoped lint pass. Provider SDK responses remain mocked; real
Cloudinary/Supabase acceptance and complete retry orchestration are still pending.
No new SQL, live route or build is included in this checkpoint.

### Recoverable Processed Upload Orchestration

`uploadProcessedNfcEvidenceRecoverably` connects authorization, server-side WebP
metadata/hash validation, durable preparation, pinned no-overwrite upload and
independent confirmation. It accepts only bounded metadata-stripped single-frame
WebP bytes from a future server image-processing caller, not arbitrary original
phone files. It copies bytes before awaiting metadata to preserve content binding.

Exact available retries confirm without upload; abandoned/expired intents stop.
An upload error (including an ambiguous response or duplicate object) invokes
confirmation once on the same asset; no new request ID, deletion or unbounded
upload loop is introduced. Preparation failure causes no provider call. Failure
to recover remains an error, not a fabricated success. Database finalization
remains authoritative for concurrent expiry, tag change or abandonment.

Eight orchestration tests pass with real generated WebP and mocked dependencies;
TypeScript/scoped lint pass. This is not live end-to-end evidence. Source-image
processing integration, browser retry identity, real provider staging, recovery
worker/late-arrival reconciliation and default-off route integration remain open.
No new SQL or live behavior change in this checkpoint.

### Source Image Integration

The dormant `uploadNfcEvidenceRecoverably` source service now checks permission and
live tag/version before processing, then passes the same request ID and generated
WebP to recoverable orchestration. Legacy and recovery paths share
`processNfcEvidenceImage`: 3 MiB input, 24 MP decode ceiling, 2560px output and
2 MiB stored cap with the existing 82/72 quality fallback. Legacy authorization,
schema availability check and upload behavior remain unchanged.

Twenty-three source/legacy/orchestration tests pass; TypeScript and scoped lint
pass. Processing and storage are mocked in these service tests; this does not
prove cross-deployment byte determinism or real mobile uploads. Reprocessing a
retry with changed encoder output will fail the stored hash binding rather than
silently replace content. Browser retry IDs and prepared-byte retention must still
be integrated before enabling a recovery route. No new flag or route is added.

### Default-Off Route and Browser Retry Integration

The existing evidence POST now selects recovery only when both upload and
`NFC_EVIDENCE_RECOVERY_ENABLED` are literally true. Recovery requires a UUID
`X-NFC-Upload-Request-ID`, keeps existing origin/auth/rate/body checks, and never
falls back to legacy upload after an error. GET preview behavior is unchanged.
The browser retains prepared bytes and request identity for the same File and
tag version after ambiguous failure. Preparation failures discard the pending
entry; validated success releases it. No persistent browser storage is used.

Thirty focused client/config/route/source/orchestration tests pass. These are
mocked route/service tests, not live provider or device acceptance. Page reload
and cross-session retries are not recovered by this in-memory cache. Historical
checkpoints above describe their state at delivery; route wiring is now present
but disabled. Production flags and all held migrations remain unchanged.

Node 22 production build passes including TypeScript and 66 generated static
pages; scoped ESLint passes. The missing root `vite` dependency from the earlier
Vercel log is present in package.json/lockfile and resolves during this build.
Push was attempted once, stalled without output and was stopped; remote release
and Vercel deployment are not verified.

### Terminal Retry UX

Expired/abandoned recovery requests now return sanitized HTTP 410, distinct from
transient 503. Client 409/410 errors are non-retryable; the evidence picker retains
the failed selection and blocks report submission until explicit cancellation,
without offering an ineffective retry. Network failures preserve existing retry.
Route (10), client (8), and form (6) tests pass, along with TypeScript/scoped lint.
No full build or real-device visual QA was repeated for this error-state change.
No SQL, flag, provider deletion, or production activation changed.

### Finalization Authorization Races

The disposable PostgreSQL runner now passes 70 assertions. New two-connection
scenarios hold an actor/tag UPDATE transaction and observe `pg_blocking_pids`
before committing it. Finalization then rejects a disabled actor, changed tag
version, or revoked tag. Each rejection leaves the intent prepared and creates
no asset; restoring valid context permits successful finalization of that intent.
This proves the tested row-lock behavior with actual PostgreSQL, not production
RBAC or provider verification. The fixture still has minimal parent tables;
full-schema report attachment/cleanup and real-provider gates remain open.
The isolated container is removed by the runner. No migration was changed.

### Cleanup Claim Versus Available Retry

PostgreSQL QA now passes 75 assertions. A cleanup transaction claims an aged,
unattached registered asset while a second connection retries finalization.
The test observes the actual blocking lock, commits cleanup, then verifies that
retry returns `NFC_UPLOAD_NOT_AVAILABLE` and preserves both immutable records.
No remote deletion occurs in this test. API mapping now returns sanitized 409
for unavailable/tag/request/finalization conflicts, so the picker stops retrying
instead of presenting them as transient 503. Twenty-eight route/client/form tests,
TypeScript and scoped lint pass. No full build repeated for this mapping change.
Full report-schema attachment races and private-provider staging remain open.

### Real Report Module Integration

The runner now applies the complete September 8 field-check migration, replacing
its former request-id-only report table and history trigger stub. It then applies
the real September 9 evidence/cleanup and September 10 intent migrations together.
Eighty-five PostgreSQL assertions pass. Two reports competing for one finalized
asset yield exactly one report and attachment; same-request replay is idempotent.
Invalid report input rolls back without claiming its asset. Attached evidence
remains excluded from cleanup after fixture-only aging beyond seven days.

This is complete report-module DDL, not the complete platform schema: admin/tag
parent tables remain minimal and application RBAC/provider APIs are not exercised.
Private-provider staging, real mobile use and worker/reconciliation gates remain.
Scoped script lint passes and the disposable container was removed. No application
build repeated for this test-only change; no production SQL was applied.

### Expiry Before Provider Access

Confirmation now rejects prepared intents with invalid, future or at-least-24-hour
timestamps before locator discovery/readback. This avoids provider calls that the
finalizer cannot accept; SQL remains authoritative if expiry occurs during I/O.
Available intents still reach authoritative finalization even when their creation
time is old, preserving retry semantics for finalized evidence. Thirty-eight
confirmation/orchestration/route tests, TypeScript and scoped lint pass. No new
SQL or full build; provider staging remains a separate gate.

### September 11 NFC Regression Sweep

All 26 `nfc-*` and `admin-nfc-*` unit/component test files pass (287 tests) on
Node 22. The initial 22-file run exposed a timing assumption in the field-report
retry test: error text rendered while the React transition still displayed the
disabled saving button. The test now waits for the named retry button to exist
and become enabled before clicking, without raising timeouts or weakening payload
identity assertions. Scoped ESLint passes. No production behavior, SQL, flags or
storage operations changed. This sweep does not cover all platform tests, real
provider integration, physical NFC hardware or browser screenshots.
