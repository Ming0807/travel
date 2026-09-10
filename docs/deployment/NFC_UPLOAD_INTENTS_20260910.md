# NFC Upload Intent Foundation: Hold for Staging

Migration: `20260910000000_prepare_nfc_evidence_upload_intents.sql`.

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

The schema intentionally accepts only `prepared`. A reviewed follow-up must add
atomic finalize/abandon transitions, register immutable asset metadata, coordinate
report/cleanup locks, and preserve late-arrival tombstones. No state transition
should be enabled by manually updating rows. Pinned storage verification, client
retry identity, recovery leases/backoff, full-schema race QA, real admin access
and provider staging remain required before activation. There is no cleanup path
for prepared intents yet; activating now would exhaust the bounded queue.

Rollback for this dormant foundation is to leave callers disabled and retain any
recorded intent metadata. Do not drop the table or delete storage to undo a release.
