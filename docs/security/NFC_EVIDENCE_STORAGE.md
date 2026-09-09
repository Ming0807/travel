# NFC Evidence Storage Boundary

Status (2026-09-09): storage adapter, guarded upload/preview services, and tested,
unapplied metadata/linkage SQL.
No evidence upload endpoint, bucket provisioning or photo workflow is activated.
This does not complete the S5 installation-photo feature.

## Contract

- Reuse `lib/storage/private-files.ts` with logical bucket `nfc-evidence`.
- Keys are `nfc-evidence/<UUID>.webp`; filenames must not contain names or locations.
- Supabase uploads and signed reads fail closed unless bucket metadata confirms
  `public: false`. Provisioning and restrictive Storage policies remain required.
- Cloudinary uploads always use `authenticated`, independent of the public CMS
  delivery configuration. Only authenticated WebP image references inside the
  configured evidence namespace can be signed or deleted as evidence.
- Signed access requires an explicit integer lifetime from 1 to 300 seconds.
  Callers should pass 60 seconds, not inherit the certificate lifetime setting.
- Evidence references cannot be relabelled as existing logical buckets to bypass
  the evidence checks. Existing visit media outside that namespace keeps its
  current provider and delivery behavior.

The adapter is server-only but does not establish user authorization or decode
image bytes. A future application service must require admin permissions, resolve
the stored asset by ID, verify its tag/report scope, and re-encode validated image
bytes before upload. Never accept arbitrary client storage paths for preview or
deletion. Do not use the public CMS media picker for installation evidence.

## Remaining Release Gates

1. Provision the private bucket and integrate the tested metadata/report RPCs.
2. Connect bounded HTTP body handling/client preparation to the image service;
   prevent uploads above the accepted request size before platform limits.
3. Add permission-checked HTTP upload/preview and orphan cleanup without deleting
   evidence already attached to an immutable report.
4. Add optional mobile photo controls, clear privacy guidance, and retry recovery.
5. Verify real provider privacy, role denial, expired links, and full-schema staging.

Unit tests use mocked providers and prove adapter decisions only. They do not
prove deployed bucket policies or actual Cloudinary delivery configuration.

Checkpoint verification: `nfc-evidence-storage.test.ts` and
`storage-safety.test.ts` passed 22 tests together. TypeScript and scoped ESLint
passed. No full production build or real-provider upload was run for this adapter
checkpoint; those remain required when the complete evidence workflow is wired.

## Metadata And Atomic Claims

Additive migration `20260909000000_add_nfc_evidence_assets.sql` depends on the
September 8 field-check migration. Do not run it in production at this checkpoint.

`register_nfc_evidence_asset` records server-derived metadata after a successful
private upload: UUID, tag/version, authenticated inspector, provider/path, SHA-256,
WebP byte size (at most 2 MiB), and dimensions (at most 2560 on either side).
Identical registration retries return the same asset; changed payloads conflict.
The SQL does not verify actual remote bytes: the future upload service must decode,
re-encode, hash and measure them, and must not trust client-supplied metadata.

`record_nfc_field_check_with_photos` accepts up to three ordered unique asset IDs.
The report and photo claims commit together or neither commits. Assets must match
the reporter, tag and version, be unclaimed, and be no older than 24 hours at first
attachment. One asset belongs to at most one report. Exact retries remain valid
after a tag version change; changing photo IDs or ordering is a conflict. Existing
reports, including legacy reports without photos, cannot acquire photos later.

Both tables are RLS-protected and immutable, with service-role SELECT only and
service-only write RPCs. The application must still enforce admin permissions.
Ordered asset row locks serialize competing claims; no public read policies exist.
No cleanup RPC is supplied yet. The 24-hour limit is an attachment eligibility
window, not an implemented deletion/retention job; orphan storage cleanup and a
documented retention policy must be completed before real uploads are enabled.

## Guarded Application Services

`lib/services/nfc-evidence.service.ts` is not connected to a route or UI yet.
`uploadNfcEvidence` requires `checkin_code.manage`, takes the inspector only from
the guard, checks the tag version and metadata schema before remote upload, and
reuses admin decoding/re-encoding. Input limit is 3 MiB and 24 million pixels;
output is WebP inside 2560 x 2560, at most 2 MiB, quality 82 with one quality-72
retry. Oversized output is rejected. Original bytes, filenames and EXIF are not
stored. The endpoint must additionally bound streamed HTTP bytes before parsing.

Metadata uses server-derived UUID/hash/dimensions/size. The response contains only
asset ID, dimensions and byte count. A lost registration response is reconciled by
exact metadata readback. On unresolved failure, the remote object is retained for
future orphan reconciliation, never eagerly deleted after an ambiguous commit.
A lost entire upload response can leave an unused asset: upload recovery/cleanup
must be integrated before exposing this service to users.

`getNfcEvidencePreview` requires `checkin_code.read`, accepts asset/tag IDs rather
than storage paths, and checks the exact tag. Unattached photos require the same
inspector and a non-future creation time within 24 hours. Attached report photos
are available to authorized report readers. Links expire after 60 seconds.
The HTTP wrapper must apply no-store and avoid placing these in public image
optimization/CDN caches. Public CMS and tourist QR upload services are unchanged.

Service/repository/storage checkpoint: 29 focused tests passed, including real
Sharp JPEG-to-WebP processing, orientation correction and EXIF removal. Provider
calls and permissions are mocked; actual Supabase relationship resolution and
remote delivery are still staging gates. Scoped lint and TypeScript passed; no
full build or live-provider upload is claimed for this unconnected service.
