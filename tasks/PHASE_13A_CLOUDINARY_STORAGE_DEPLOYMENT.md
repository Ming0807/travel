# PHASE_13A_CLOUDINARY_STORAGE_DEPLOYMENT.md

## Status

In progress.

## Objective

Make file storage work for development and Vercel deployment using Cloudinary first, while preserving a clean future path to university-hosted storage.

## Scope

MVP:

- Add server-only Cloudinary environment variables.
- Add provider-neutral storage adapter.
- Use adapter for tourist photo upload.
- Use adapter for generated certificate storage.
- Keep Supabase Storage fallback for existing local/demo paths.
- Document privacy and deployment requirements.

Future:

- Implement `university_server` adapter.
- Add controlled file streaming route if the university server does not support signed URLs.
- Add cleanup/retention jobs.
- Add admin media upload integration.

## Acceptance Criteria

- `STORAGE_PROVIDER=cloudinary` is documented for Vercel.
- Cloudinary secrets remain server-only.
- Photo upload route does not call Cloudinary or Supabase directly.
- Certificate generation route does not call Cloudinary or Supabase directly.
- Database stores storage references, not permanent signed URLs.
- Private file references are not exposed in dashboard/default exports.
- Certificate download still works without survey, LINE, Google, email, or phone.
- Future university storage is documented but not claimed as implemented.

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
