# NFC Evidence Storage Boundary

Status (2026-09-09): storage adapter foundation only. No evidence upload endpoint,
bucket provisioning, metadata table or inspection-photo linkage is activated.
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

1. Add private bucket provisioning and metadata with immutable report references.
2. Reuse bounded image processing, strip metadata, and prevent uploads above the
   accepted request size before reaching platform limits.
3. Add permission-checked upload/preview and orphan cleanup without deleting
   evidence already attached to an immutable report.
4. Add optional mobile photo controls, clear privacy guidance, and retry recovery.
5. Verify real provider privacy, role denial, expired links, and full-schema staging.

Unit tests use mocked providers and prove adapter decisions only. They do not
prove deployed bucket policies or actual Cloudinary delivery configuration.

Checkpoint verification: `nfc-evidence-storage.test.ts` and
`storage-safety.test.ts` passed 22 tests together. TypeScript and scoped ESLint
passed. No full production build or real-provider upload was run for this adapter
checkpoint; those remain required when the complete evidence workflow is wired.
