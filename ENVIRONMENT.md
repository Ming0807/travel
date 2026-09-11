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
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Preferred** | — | Current Supabase browser key (`sb_publishable_...`). Used before the legacy anon key when both are configured. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy fallback | — | Legacy Supabase anonymous key. It may be omitted after every environment has the publishable key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Supabase service role key (server-only, never expose to browser) |
| `SUPABASE_DATABASE_URL` | No for app runtime; **yes for database tools** | — | Server-only PostgreSQL connection string for migration/maintenance tools. Do not add it to Vercel unless a deployed job explicitly needs a database connection. Prefer the exact Session Pooler URL from Supabase Connect when the direct host is IPv6-only. Never prefix it with `NEXT_PUBLIC_`. |

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
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# Optional temporary fallback during migration:
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
# Local/CI database tools only:
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
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

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

1. **Server-only variables** (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL`, `CLOUDINARY_API_SECRET`, `LINE_CHANNEL_SECRET`, `UNIVERSITY_STORAGE_ACCESS_TOKEN`) must **never** be prefixed with `NEXT_PUBLIC_`.
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

## Research Browser Grant Rollout

`RESEARCH_BROWSER_GRANTS_ENABLED=false` by default; accepts exactly `true`/`false`.
Enabling requires entry sessions and their hash secret, all research/browser-grant
migrations, and staged multi-tab/mobile QA. Do not enable merely because SQL ran.
Entry-aware invitations prepare a Secure HttpOnly host-only cookie using Web Locks
and verify delivery before enabling consent. Unsupported/blocked browsers can
decline research and continue. This flag is server-only; no actual environment
values were enabled by the agent.

This same flag enables optional Visit-credential migration on authorized evaluation
and Visit-scoped withdrawal pages. Preparation and migration share one browser lock.
Migration verifies owner, legacy proof and exact session/Visit read-back before
removing only that Visit cookie. Errors preserve legacy access and never disable
the existing form. Global/operator cookies and historical entry provenance are not
bulk-migrated or guessed. Include these cases in staging before enabling the flag.

`RESEARCH_BROWSER_GRANT_CLEANUP_ENABLED=false` controls the separate
`GET /api/cron/research-browser-maintenance` job. Accepts exactly `true`/`false`;
unset/empty is disabled. It uses the same minimum-32-character `CRON_SECRET`
bearer protection as Story maintenance. It intentionally does not depend on the
new-participation flag so retention work can continue while enrollment is paused.
Enable only after the browser-grant migration, retention review and staging QA.
No schedule is added to `vercel.json` yet; register the protected endpoint in the
approved scheduler during rollout. One invocation deletes at most 500 eligible
grants. Monitor failures and repeated `batchFull: true` results before adjusting
the schedule. This is not a consent/response deletion job.

## NFC Installation Photo Rollout

`NFC_EVIDENCE_CLEANUP_ENABLED=false` by default. Only literal `true` permits the
server-only cleanup processor, which also requires `checkin_code.manage`.
No route or cron currently calls it. Keep disabled until the cleanup migration,
private-provider staging and orphan reconciliation have been accepted. This flag
is independent of upload enablement and must never use a `NEXT_PUBLIC_` prefix.

`NFC_EVIDENCE_UPLOAD_ENABLED=false` by default (unset/empty also disabled); only
literal `true` enables `/api/admin/nfc/evidence` POST and GET. Do not enable it yet.
Required gates: private provider/bucket configuration, September 8 field-report
and September 9 evidence migrations, photo/report UI integration, upload recovery,
orphan cleanup/retention, and full-schema/provider/device QA. No production flag
or SQL was applied by the agent. Turning it off blocks new uploads and preview URL
issuance; previously issued 60-second links expire independently.

`NFC_EVIDENCE_RECOVERY_ENABLED=false` by default. Unset/empty also disable it;
only literal `true` enables recoverable POST uploads, and malformed values fail
closed. The upload flag above must also be enabled. When recovery is enabled,
POST requires a UUID `X-NFC-Upload-Request-ID`; it never falls back to legacy
upload after a recovery failure. Keep disabled pending the September 10 upload
intent preparation/finalization migrations, full-schema and private-provider
staging verification, and recovery/cleanup acceptance. No production SQL or
flags were changed. Browser retries retain the request ID and prepared bytes
only for the same File object and tag version in the current page; this is not
reload-persistent recovery and stores no photo in localStorage.

`NFC_EVIDENCE_WORKER_ENABLED=false` is the independent, server-only recovery
worker gate. Unset/empty are disabled; malformed values fail closed. Keep off.
The dormant worker claim entry verifies an exact Bearer `CRON_SECRET` using
timing-safe comparison (32-512 characters, no whitespace) before checking the
flag or claiming one job. No route/cron invokes this helper yet. Do not enable
until leased finalization, runtime limits, provider staging and reconciliation
are accepted. Upload disablement is independent from recovery of existing work.
