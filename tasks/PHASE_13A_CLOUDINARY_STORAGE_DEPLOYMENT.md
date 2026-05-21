# PHASE_13A_CLOUDINARY_STORAGE_DEPLOYMENT.md

## Status

Completed.

## Objective

Make file storage work for development and Vercel deployment using Cloudinary first, while preserving a clean future path to university-hosted storage.

## Scope

MVP:

- [x] Add server-only Cloudinary environment variables.
- [x] Add provider-neutral storage adapter.
- [x] Use adapter for tourist photo upload.
- [x] Use adapter for generated certificate storage.
- [x] Keep Supabase Storage fallback for existing local/demo paths.
- [x] Document privacy and deployment requirements.
- [x] Add admin media upload integration via storage adapter.

Future:

- Implement `university_server` adapter.
- Add controlled file streaming route if the university server does not support signed URLs.
- Add cleanup/retention jobs.

## Implementation Summary

### Storage Adapter (`lib/storage/private-files.ts`)
- `uploadPrivateFile()`: Routes to Cloudinary or Supabase depending on `STORAGE_PROVIDER`
- `deletePrivateFile()`: Auto-detects provider from stored reference string
- `createPrivateFileSignedUrl()`: Generates time-limited access URLs for both providers
- Cloudinary references stored as `cloudinary:image:authenticated:v123:png:folder/file`

### Upload Routes
- `app/api/upload/photo/route.ts`: Tourist photo upload → storage adapter
- `app/api/certificate/generate/route.ts`: Certificate image → storage adapter
- `app/api/admin/media/upload/route.ts`: Admin attraction media → storage adapter

### Environment Documentation
- `ENVIRONMENT.md`: Complete documentation of all env vars, examples for local and Vercel

## Acceptance Criteria

- [x] `STORAGE_PROVIDER=cloudinary` is documented for Vercel.
- [x] Cloudinary secrets remain server-only.
- [x] Photo upload route does not call Cloudinary or Supabase directly.
- [x] Certificate generation route does not call Cloudinary or Supabase directly.
- [x] Database stores storage references, not permanent signed URLs.
- [x] Private file references are not exposed in dashboard/default exports.
- [x] Certificate download still works without survey, LINE, Google, email, or phone.
- [x] Future university storage is documented but not claimed as implemented.
- [x] Admin media upload also uses the storage adapter.

## Validation

Run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Manual staging/Vercel check:

```text
upload tourist photo
preview certificate with uploaded photo
generate certificate
open success page
download certificate image
verify no Cloudinary API secret in browser
```
