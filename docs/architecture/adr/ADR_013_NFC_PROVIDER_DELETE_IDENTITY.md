# ADR 013: NFC Provider Delete Identity

Status: Accepted safety boundary; provider implementation and rollout held.
Reviewed: 2026-09-14. Scope: private staff NFC installation evidence only.

## Evidence

The current helper `lib/storage/private-files.ts` deletes Supabase objects by
path and Cloudinary images by public ID. NFC intents retain account, logical key,
content hash and encoded delivery path, but not a provider object version or
Cloudinary immutable asset ID. Uploads use `upsert: false` / `overwrite: false`;
these options do not establish that all in-flight requests have finished.

Supabase's current [remove reference](https://supabase.com/docs/reference/javascript/file-buckets-remove)
documents both path-only deletion and `{ path, versionId }` exact-version deletion.
Installed `@supabase/storage-js` 2.106.1 instead declares `remove(paths: string[])`
in `src/packages/StorageFileApi.ts`. Do not cast the newer documented input into
the older SDK or assume the configured service supports it. This is a verified
local API mismatch, not evidence that Supabase has no version deletion support.

Cloudinary's [Upload API reference](https://cloudinary.com/documentation/image_upload_api_reference#destroy_by_asset_id)
documents deletion by immutable asset ID. Installed Cloudinary 2.10.0 exposes
`api.delete_resources_by_asset_ids` in its types; our helper uses public-ID destroy.
The documented destroy parameters do not establish a content-version condition
for this project. Asset identity and a particular content revision must not be
treated as interchangeable. Neither source proves our live account configuration.

## Decision

1. Never connect the generic path/public-ID helper to the new cleanup worker.
2. Introduce a separate, append-only provider observation/receipt record before
   deletion work. Bind observations to intent asset, provider account, exact key,
   provider identity/version, verified content and observation time. Do not alter
   immutable intent history or fill missing IDs from the logical UUID by guesswork.
3. For Supabase, verify SDK/server version-delete compatibility and obtain the
   exact provider version from an authoritative response. Delete only that version;
   treat missing version evidence as review-required, not path-delete fallback.
4. For Cloudinary, persist the returned immutable provider asset ID separately
   from our UUID. Verify overwrite/content revision semantics in staging. If a
   content replacement can survive under the same identity, asset-ID deletion alone
   is insufficient: require an enforceable no-replacement boundary or retain the
   file for review. A read-then-delete comparison is not atomic protection.
5. Fence scheduling in PostgreSQL, but do not claim it fences HTTP requests already
   in flight. Keep upload settlement, delete acknowledgement and independent absence
   observations as separate facts. Retain tombstones for late arrivals and lost ACKs.
6. Keep both providers disabled for destructive cleanup until their own acceptance
   gates pass. A passing provider must not enable the other implicitly.

## Acceptance Work

- Inspect actual upload/read responses in an isolated private staging namespace.
  Record sanitized shape evidence, not credentials, signed URLs or real photos.
- Verify exact-version deletion leaves a replacement version intact in Supabase;
  pin compatible dependencies only after reviewing the upgrade's broader impact.
- Verify Cloudinary rename, public-ID reuse, overwrite and retry behavior using
  provider asset identity. Do not infer content immutability from identifier naming.
- Exercise request timeout, lost ACK, retry after replacement, account switch,
  late upload and stale worker. Require retention/review whenever evidence conflicts.
- Confirm report attachment exclusion, least-privilege machine authentication,
  bounded batches, audit and rollback before scheduler activation.

## Consequences

The current repository/leases/history remain useful reconciliation infrastructure,
but are not a completed cleanup feature. Next implementation is read-only inspection
and durable provider evidence, not an unconditional delete processor. No dependency,
production configuration, bucket, credential or remote file changed in this review.
