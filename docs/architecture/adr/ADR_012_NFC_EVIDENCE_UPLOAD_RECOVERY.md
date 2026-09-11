# ADR-012: Recoverable Private NFC Evidence Uploads

## Status
Proposed, 2026-09-10. Existing registered-asset cleanup is implemented but disabled.
This proposal does not authorize a migration, provider deletion or rollout.

September 10 implementation checkpoint: a held preparation-only schema/RPC and
strict server adapter now persist actor-scoped retry identity, processed content
and pinned destination. Disposable PostgreSQL passes 33 assertions, including
simultaneous retry/admission; 16 adapter tests pass. There is no live caller or
finalize/abandon transition. The first implementation gate below remains open;
preparation is not the entire race-safe recovery protocol. Deployment hold and
remaining gates: `docs/deployment/NFC_UPLOAD_INTENTS_20260910.md`.

Lifecycle follow-up: held finalize/abandon RPCs now serialize on the existing
asset authority and protect immutable terminal states. Actual asset/cleanup DDL
is included in disposable QA; forced registration failure rolls back the intent.
This is not a completed recovery protocol: remote verification, live adapters,
report-end-to-end races and late-provider-write reconciliation are still open.

## Context
The current upload writes the provider object before registering immutable asset
metadata. Exact readback handles a lost registration response, but a failed
registration can leave an object without a database record. A lost entire HTTP
response can also cause a retry to upload a second asset. The registered-asset
cleanup queue cannot discover objects absent from `nfc_evidence_assets`.

Evidence belongs to staff installation reports, not tourist photos or public CMS.
The recovery design must preserve that boundary and must not infer that a timeout
means the provider or database transaction failed.

## Proposed Decision
Persist a durable upload intent before contacting storage. Reuse the same intent
on retry and use an exact provider locator, not a directory-wide destructive scan.

The intent records a server-generated asset ID, actor, tag and tag version,
processed-byte SHA-256, dimensions, byte count, provider and provider namespace.
The namespace includes the bucket or Cloudinary public ID and authenticated image
delivery type. Never invent a Cloudinary version before the provider returns it.
Store no source image, original filename, raw credential or signed delivery URL.

The application must pin the destination from the intent rather than silently
switching providers when environment settings change. Unknown/retired namespaces
fail closed and require an explicit operator reconciliation decision.

### State and Transactions

1. Prepare: validate permission, tag context and processed image, then persist the
   intent. Only after acknowledged preparation may the provider upload begin.
2. Upload: use the prepared asset key with overwrite disabled. Duplicate-object
   responses require exact verification, not unconditional success.
3. Finalize: verify provider identity and content, then atomically register asset
   metadata and mark the intent available. Serialize finalization, abandonment and
   report attachment against the same asset/intent authority.
4. Retry: retain the opaque intent ID in the client for that selected file. Require
   the same actor, tag/version and processed-byte hash. Read back an already
   finalized result; do not upload again or modify immutable report evidence.
5. Abandon: only stale, unfinalized intents may transition to cleanup eligibility.
   Finalization and attachment after abandonment must be rejected transactionally.
6. Reconcile: inspect the exact recorded locator. An authenticated matching object
   may be finalized while eligible, or deleted after abandonment. Missing objects,
   provider errors and content conflicts are distinct outcomes.

Provider absence is not permanent proof of deletion: a request accepted earlier
may finish late. Keep abandonment tombstones and repeat exact-key reconciliation
after the upload settlement window. Define this window from bounded upload/runtime
behavior and provider staging evidence, not an arbitrary retry count. Do not close
this gate merely because an SDK call timed out or cancellation was requested.

### Existing Data

Registered assets continue through the current seven-day orphan queue. Images
already attached to reports remain excluded. Pre-intent unregistered objects need
a separate read-only inventory/reconciliation report before any deletion approval;
age alone is insufficient to establish ownership or safe deletion.

### Operations

September 11 worker design and ordered implementation gates are specified in
`tasks/NFC_RECOVERY_WORKER_IMPLEMENTATION.md`. In particular, worker authority
must be lease-bound and independent of browser owner sessions. Do not bypass the
existing owner guard to turn `confirmNfcEvidenceUpload` into a cron handler.

Keep preparation/recovery and cleanup independently disabled until accepted.
Record bounded failure categories and retry timing without exposing private paths
to the browser. Add backoff/lease scheduling so permanently failing early items do
not starve later cleanup work. The current manual bounded processor is not a cron
worker and requires authenticated admin permission; a future scheduler needs its
own verified machine authorization, not a bypass of that guard.

## Alternatives Considered

- Retry registration only: small change, but cannot recover process crashes or a
  lost HTTP response and leaves unregistered remote objects undiscoverable.
- Enumerate and delete old provider objects: helps legacy inventory but creates a
  wider destructive scope and races uploads; not the default ongoing mechanism.
- Durable intent plus exact-locator reconciliation: adds schema/state complexity,
  but makes ambiguous outcomes discoverable and recoverable without guessing.

## Implementation Gates

- [ ] Schema/RPC design and independent race review: prepare/finalize/abandon.
- [ ] Pinned private-provider upload and exact-object verification adapters.
- [ ] Client retry identity and server ownership/content binding.
- [ ] Recovery processor with leases, retry backoff and late-arrival rechecks.
- [ ] Legacy inventory report, private storage provisioning and operator runbook.
- [ ] Tests for every crash boundary, concurrent retries, stale tag, revoked actor,
  provider configuration change, conflicting content, late provider completion,
  lost finalization response and report-versus-cleanup race.
- [ ] Real Supabase/Cloudinary staging and mobile acceptance before activation.

No implementation gate above is satisfied by the current mocked cleanup tests.
