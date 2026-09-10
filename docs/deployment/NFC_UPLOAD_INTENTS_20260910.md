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

Rollback for this dormant foundation is to leave callers disabled and retain any
recorded intent metadata. Do not drop the table or delete storage to undo a release.
