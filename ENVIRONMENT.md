# ENVIRONMENT.md

## Southern Border Tourism Platform - Environment Variables

This document lists all environment variables required by the platform.
Never commit real secrets to the repository.

---

## Core Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `APP_ENV` | No | `local` | Application environment: `local`, `staging`, `production`, `test` |
| `APP_DEFAULT_LOCALE` | No | `th` | Default locale: `th` or `en` |
| `APP_SUPPORTED_LOCALES` | No | `th,en` | Comma-separated list of supported locales |
| `APP_TIMEZONE` | No | `Asia/Bangkok` | Application timezone |

---

## Supabase

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | — | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | — | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Supabase service role key (server-only, never expose to browser) |
| `SUPABASE_DATABASE_URL` | **Yes** | — | PostgreSQL connection string for migration/maintenance tools. Prefer the exact Session Pooler URL from Supabase Connect when the direct host is IPv6-only. |

---

## Storage

| Variable | Required | Default | Description |
|---|---|---|---|
| `STORAGE_PROVIDER` | No | `supabase` | Storage backend: `supabase`, `cloudinary`, or `university_server` |

### Cloudinary (when `STORAGE_PROVIDER=cloudinary`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | **Yes** | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | **Yes** | — | Cloudinary API key (server-only) |
| `CLOUDINARY_API_SECRET` | **Yes** | — | Cloudinary API secret (server-only, never expose to browser) |
| `CLOUDINARY_UPLOAD_FOLDER` | No | `southern-border-tourism` | Root folder for all uploads in Cloudinary |
| `CLOUDINARY_DELIVERY_TYPE` | No | `authenticated` | Delivery type: `authenticated` (private) or `upload` (public) |

### University Server (when `STORAGE_PROVIDER=university_server`)

> **Note:** University storage is documented but not yet implemented.

| Variable | Required | Default | Description |
|---|---|---|---|
| `UNIVERSITY_STORAGE_BASE_URL` | **Yes** | — | Base URL of university storage server |
| `UNIVERSITY_STORAGE_UPLOAD_ENDPOINT` | **Yes** | — | Upload endpoint URL |
| `UNIVERSITY_STORAGE_ACCESS_TOKEN` | **Yes** | — | Access token for authentication |

---

## File Upload

| Variable | Required | Default | Description |
|---|---|---|---|
| `MAX_UPLOAD_IMAGE_SIZE_MB` | No | `5` | Server-side maximum for the client-prepared tourist photo (the UI accepts source photos up to 50MB and targets <=3.5MB before upload) |
| `ALLOWED_TOURIST_IMAGE_MIME_TYPES` | No | `image/jpeg,image/png,image/webp` | Allowed MIME types for tourist uploads |
| `CERTIFICATE_SIGNED_URL_TTL_SECONDS` | No | `600` | Signed URL expiration for certificate downloads (in seconds) |

---

## Export

| Variable | Required | Default | Description |
|---|---|---|---|
| `EXPORT_SIGNED_URL_TTL_SECONDS` | No | `600` | Signed URL expiration for report exports (in seconds) |
| `EXPORT_MAX_ROWS` | No | `5000` | Maximum rows per export |

---

## Health Monitoring and Release Smoke

| Variable | Required | Default | Description |
|---|---|---|---|
| `HEALTH_CHECK_SECRET` | Recommended for staging/production | — | Server-only bearer secret (minimum 16 characters) for `/api/health?mode=ready` dependency checks |
| `RELEASE_BASE_URL` | Only on the machine running smoke checks | — | Absolute HTTPS deployment URL consumed by `npm run release:smoke`; do not configure it as an application secret |
| `RELEASE_SMOKE_TIMEOUT_MS` | No | `20000` | Per-request timeout used by the release smoke CLI |

`GET /api/health` is a public, lightweight liveness check and does not query dependencies. Readiness requires `Authorization: Bearer <HEALTH_CHECK_SECRET>` and reports only generic environment/database/storage statuses. Never put the secret in a URL, screenshot, repository, or deployment log.

---

## LINE Integration (Optional)

| Variable | Required | Default | Description |
|---|---|---|---|
| `LINE_CHANNEL_ID` | No | — | LINE Login channel ID |
| `LINE_CHANNEL_SECRET` | No | — | LINE Login channel secret (server-only) |
| `NEXT_PUBLIC_LINE_LIFF_ID` | No | — | LINE LIFF application ID (public) |

---

## Example `.env.local` (Development)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Storage (use supabase locally, cloudinary on Vercel)
STORAGE_PROVIDER=supabase

# App
APP_ENV=local
```

## Example `.env` (Vercel / Production)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DATABASE_URL=postgresql://...

# Cloudinary
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456
CLOUDINARY_API_SECRET=secret
CLOUDINARY_UPLOAD_FOLDER=southern-border-tourism
CLOUDINARY_DELIVERY_TYPE=authenticated

# App
APP_ENV=production
HEALTH_CHECK_SECRET=use-a-long-random-server-secret
```

---

## Privacy and Security Notes

1. **Server-only variables** (`SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_API_SECRET`, `LINE_CHANNEL_SECRET`, `UNIVERSITY_STORAGE_ACCESS_TOKEN`) must **never** be prefixed with `NEXT_PUBLIC_`.
2. **Database stores references**, not permanent signed URLs. Signed URLs are generated on-demand with TTL.
3. **Private file references** (`cloudinary:image:authenticated:v123:png:folder/file`) are internal identifiers and must not be exposed in public API responses.
4. **Tourist uploads** go through the storage adapter (`lib/storage/private-files.ts`), never directly to Cloudinary or Supabase from the browser.
5. **Admin media uploads** go through `/api/admin/media/upload` which also uses the storage adapter.
## Privacy-Safe Story Engagement

`CONTENT_ENGAGEMENT_HASH_SECRET` is a server-only secret used to create
irreversible HMAC digests for short-lived Story-event deduplication and
distributed rate limiting.

```text
CONTENT_ENGAGEMENT_HASH_SECRET=<random value with at least 32 characters>
```

Set a different value in local, preview, and production environments. Never
prefix it with `NEXT_PUBLIC_`, expose it to browser code, write it to logs, or
commit its real value. Rotating it only resets short-lived deduplication and
rate-limit continuity; it does not change Story content or tourist records.

`CRON_SECRET` protects Vercel's daily Story-engagement maintenance route. Use a
different random value with at least 32 characters. Vercel sends it as
`Authorization: Bearer $CRON_SECRET`; the route fails closed when it is missing.
