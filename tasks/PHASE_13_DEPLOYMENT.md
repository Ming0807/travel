# PHASE_13_DEPLOYMENT.md

## Status

In progress. Repository-side liveness/readiness and non-destructive release smoke gates are implemented. Preview/staging environment verification, backup confirmation, migration verification, and operational sign-off remain required.

## Objective

Deploy the Next.js fullstack tourism platform safely to Vercel with Supabase PostgreSQL/Auth and Cloudinary-first file storage.

The deployment must preserve the reward-first tourist flow:

```text
QR -> Guest minimal form -> photo upload -> certificate -> stamp/passport -> optional survey -> optional account linking
```

## Storage Decision

For development and Vercel deployment:

```text
STORAGE_PROVIDER=cloudinary
```

Future:

```text
STORAGE_PROVIDER=university_server
```

when the university-managed storage adapter is implemented.

Supabase Storage remains a supported fallback/legacy provider for environments that already use Supabase buckets.

## Deployment Checklist

### 1. Supabase Production Setup

1. Create a production Supabase project.
2. Run migrations from `supabase/migrations`.
3. Apply production seed/reference data only.
4. Configure Supabase Auth redirects.
5. Generate server-only `service_role` key and browser-safe anon key.

### 2. Cloudinary Production Setup

Configure a Cloudinary product environment for tourist photos and generated certificates.

Required Vercel variables:

```text
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_UPLOAD_FOLDER=southern-border-tourism
CLOUDINARY_DELIVERY_TYPE=authenticated
```

Rules:

- `CLOUDINARY_API_SECRET` is server-only.
- Do not prefix Cloudinary secrets with `NEXT_PUBLIC_`.
- Tourist photos and certificates should use authenticated or controlled delivery where available.
- Storage references must not appear in dashboard/default exports.

### 3. Vercel Setup

1. Import the repository into Vercel.
2. Set the build command to `npm run build`.
3. Configure environment variables per Development, Preview, and Production.
4. Ensure `NEXT_PUBLIC_APP_URL` points to the correct environment URL.
5. Deploy preview before production.

### 4. Required Validation

Run before deployment:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run db:migrations:check
```

Run after preview/staging deployment:

```bash
RELEASE_BASE_URL=https://preview.example.com npm run release:smoke
PLAYWRIGHT_BASE_URL=https://preview.example.com E2E_ADMIN_USERNAME=staging-admin E2E_ADMIN_PASSWORD=... npm run test:e2e:admin-live
```

Configure `HEALTH_CHECK_SECRET` on staging/production to enable protected readiness checks for environment, database, and storage configuration. The public `/api/health` endpoint is liveness-only and does not query Supabase.

Run Supabase migration/seed validation on a controlled environment before production.

### 5. Post-Deployment Smoke Test

Verify:

- public homepage loads
- attraction list/detail load
- active QR landing opens
- guest minimal profile works
- consent is required
- photo upload works through Cloudinary
- certificate generation works
- certificate preview/download works
- stamp/passport works
- optional survey can be skipped/submitted
- admin login/guard works
- dashboard requires permission
- exports remain privacy-safe

## Acceptance Criteria

- No NestJS/Express backend is introduced.
- Vercel environment variables are documented.
- Cloudinary storage is configured server-side only.
- Supabase service role is server-side only.
- Tourist files are uploaded through the storage adapter.
- Certificate download is not blocked by survey, LINE, Google, email, or phone.
- Private identifiers and storage references are not exposed by default.
- Future university storage path is documented but not falsely claimed as implemented.
