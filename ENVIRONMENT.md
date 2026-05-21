# ENVIRONMENT.md

## 1. Purpose

This document defines the environment variables, configuration rules, secret handling, and environment separation strategy for the **Southern Border Tourism Data & Intelligence Platform**.

The platform is a production-oriented tourism database and analytics system for Yala, Pattani, and Narathiwat. It handles tourist data, photos, certificates, stamps, surveys, dashboards, exports, and admin operations.

Environment configuration must therefore be:

```text
secure
clear
separated by environment
easy to reproduce
safe for production
safe for Codex/developer use
```

---

## 2. Environment Principles

Follow these principles:

```text
Use separate environments for local, staging, and production.
Do not commit real secrets.
Do not expose server-only secrets to the browser.
Do not use production data in local or automated tests.
Document every required variable.
Use placeholders in examples.
Use least privilege where possible.
```

Critical rule:

```text
Only variables prefixed with NEXT_PUBLIC_ may be exposed to the browser, and only if they are safe.
```

---

## 3. Environment Files

Recommended files:

```text
.env.example
.env.local
.env.staging.local optional
.env.production.local optional
```

Rules:

```text
.env.example is committed and contains variable names with safe placeholder values.
.env.local is not committed.
.env.staging.local is not committed.
.env.production.local is not committed.
```

`.gitignore` should include:

```text
.env
.env.local
.env.*.local
```

---

## 4. Environment Types

### 4.1 Local

Used for:

```text
developer work
local testing
local Supabase project
synthetic seed data
```

Must not use:

```text
production service role key
production database URL
real tourist data
```

---

### 4.2 Staging

Used for:

```text
pre-release testing
E2E testing
demo testing
admin workflow testing
dashboard validation
```

Should use:

```text
separate staging Supabase project
synthetic or controlled demo data
staging storage buckets
staging URL
```

---

### 4.3 Production

Used for:

```text
real tourist use
real admin use
real data collection
real dashboard/export use
```

Must use:

```text
production Supabase project
production domain
secured secrets
verified storage policies
verified RLS policies
```

---

## 5. Required Variables Overview

### 5.1 Public Client Variables

These may be available in the browser:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID optional
```

### 5.2 Server-Only Variables

These must never be exposed to the browser:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
DATABASE_URL
LINE_CHANNEL_ID optional
LINE_CHANNEL_SECRET optional
CRON_SECRET optional
EXPORT_SIGNING_SECRET optional
```

### 5.3 App Configuration Variables

These control app behavior:

```text
APP_ENV
APP_NAME
APP_DEFAULT_LOCALE
APP_SUPPORTED_LOCALES
APP_TIMEZONE
MAX_UPLOAD_IMAGE_SIZE_MB
CERTIFICATE_SIGNED_URL_TTL_SECONDS
EXPORT_SIGNED_URL_TTL_SECONDS
```

---

## 6. Environment Variable Reference

## 6.1 `APP_ENV`

Purpose:

```text
Current environment name.
```

Allowed values:

```text
local
staging
production
test
```

Example:

```env
APP_ENV=local
```

Notes:

```text
Use this to guard environment-specific behavior.
Do not rely on APP_ENV alone for security.
```

---

## 6.2 `APP_NAME`

Purpose:

```text
Human-readable application name.
```

Example:

```env
APP_NAME="Southern Border Tourism Data & Intelligence Platform"
```

---

## 6.3 `NEXT_PUBLIC_APP_URL`

Purpose:

```text
Public base URL of the application.
```

Examples:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=https://staging.example.com
NEXT_PUBLIC_APP_URL=https://tourism.example.com
```

Used for:

```text
QR links
certificate links
auth redirects
public sharing future
```

Rules:

```text
Production must use HTTPS.
QR codes must not point to localhost.
```

---

## 6.4 `NEXT_PUBLIC_SUPABASE_URL`

Purpose:

```text
Public Supabase project URL.
```

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

Security:

```text
Safe to expose.
Must match the correct environment.
```

---

## 6.5 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Purpose:

```text
Supabase anonymous key for browser-safe operations.
```

Example:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-placeholder
```

Security:

```text
Safe to expose only with correct RLS/policies.
Do not confuse with service role key.
```

---

## 6.6 `SUPABASE_SERVICE_ROLE_KEY`

Purpose:

```text
Privileged Supabase key for server-side operations.
```

Example:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-placeholder
```

Security:

```text
Server-only.
Never expose to browser.
Never prefix with NEXT_PUBLIC_.
Never log.
Never commit.
```

Used for:

```text
server-side controlled writes
storage operations
admin backend operations
dashboard aggregation if needed
export generation
```

Important:

```text
Service role bypasses RLS.
Application code must still enforce permissions and ownership.
```

---

## 6.7 `SUPABASE_DATABASE_URL`

Purpose:

```text
Direct Supabase/PostgreSQL connection string for migrations or server-side DB tools.
```

Example:

```env
SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

Security:

```text
Server-only.
Never expose to browser.
Never commit.
```

---

## 6.8 `DATABASE_URL`

Purpose:

```text
Generic database connection string if the project uses tools that expect DATABASE_URL.
```

Example:

```env
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

Security:

```text
Server-only.
Never expose to browser.
Never commit.
```

---

## 6.9 `APP_DEFAULT_LOCALE`

Purpose:

```text
Default language for the app.
```

Recommended:

```env
APP_DEFAULT_LOCALE=th
```

---

## 6.10 `APP_SUPPORTED_LOCALES`

Purpose:

```text
Comma-separated supported language list.
```

Recommended:

```env
APP_SUPPORTED_LOCALES=th,en
```

Future:

```text
Malay can be added later if required.
```

---

## 6.11 `APP_TIMEZONE`

Purpose:

```text
Application timezone for date display and reporting defaults.
```

Recommended for Thailand:

```env
APP_TIMEZONE=Asia/Bangkok
```

Rules:

```text
Use timestamptz in database for event times.
Display local dates consistently.
Dashboard date filters must define timezone behavior.
```

---

## 6.12 `MAX_UPLOAD_IMAGE_SIZE_MB`

Purpose:

```text
Maximum tourist upload image size.
```

Example:

```env
MAX_UPLOAD_IMAGE_SIZE_MB=5
```

Rules:

```text
Frontend may use this for hints.
Backend must enforce it.
```

---

## 6.13 `ALLOWED_TOURIST_IMAGE_MIME_TYPES`

Purpose:

```text
Comma-separated MIME types for tourist photo uploads.
```

Recommended:

```env
ALLOWED_TOURIST_IMAGE_MIME_TYPES=image/jpeg,image/png,image/webp
```

Rules:

```text
Reject SVG, PDF, HTML, JavaScript, empty files, and oversized files.
Backend must enforce.
```

---

## 6.14 `CERTIFICATE_SIGNED_URL_TTL_SECONDS`

Purpose:

```text
Lifetime for signed URLs used to download private certificate files.
```

Example:

```env
CERTIFICATE_SIGNED_URL_TTL_SECONDS=600
```

Rules:

```text
Signed URLs should be short-lived.
Do not store signed URLs permanently.
```

---

## 6.15 `EXPORT_SIGNED_URL_TTL_SECONDS`

Purpose:

```text
Lifetime for signed URLs used to download export files.
```

Example:

```env
EXPORT_SIGNED_URL_TTL_SECONDS=600
```

Rules:

```text
Export files are private.
Export download URLs should be short-lived.
```

---

## 6.16 `EXPORT_MAX_ROWS`

Purpose:

```text
Maximum number of rows allowed in a synchronous export.
```

Example:

```env
EXPORT_MAX_ROWS=5000
```

Rules:

```text
Unbounded exports are not allowed.
Too-large exports should return EXPORT_TOO_LARGE or use background job future.
```

---

## 6.17 `EXPORT_SIGNING_SECRET`

Purpose:

```text
Optional server-only secret for signing export requests or tokens if implemented.
```

Example:

```env
EXPORT_SIGNING_SECRET=replace-with-secure-random-value
```

Security:

```text
Server-only.
Never expose to browser.
Never log.
```

---

## 6.18 `CRON_SECRET`

Purpose:

```text
Optional secret for protecting scheduled job endpoints.
```

Example:

```env
CRON_SECRET=replace-with-secure-random-value
```

Used for:

```text
export cleanup
temp upload cleanup
dashboard summary refresh future
official data import future
```

Rules:

```text
Server-only.
Do not expose publicly.
Do not log.
```

---

## 6.19 `NEXT_PUBLIC_LIFF_ID`

Purpose:

```text
Optional LINE LIFF ID for browser-side LIFF initialization.
```

Example:

```env
NEXT_PUBLIC_LIFF_ID=your-liff-id-placeholder
```

Security:

```text
Public-safe.
Optional.
LINE must not be required for certificate flow.
Used only to initialize LIFF when the tourist chooses optional LINE linking.
Do not use NEXT_PUBLIC_LINE_LIFF_ID.
```

---

## 6.20 `LINE_CHANNEL_ID`

Purpose:

```text
LINE channel ID for server-side verification.
```

Example:

```env
LINE_CHANNEL_ID=your-line-channel-id-placeholder
```

Security:

```text
Server-side preferred.
Required for server-side LINE ID token verification when LINE linking is enabled.
Do not expose to browser code.
```

---

## 6.21 `LINE_CHANNEL_SECRET`

Purpose:

```text
LINE channel secret for server-side token verification/webhook validation.
```

Example:

```env
LINE_CHANNEL_SECRET=your-line-channel-secret-placeholder
```

Security:

```text
Server-only.
Never expose to browser.
Never commit.
Never log.
Reserved for server-side LINE integration flows that require the channel secret.
```

---

## 6.22 `ADMIN_BOOTSTRAP_EMAIL`

Purpose:

```text
Optional email used only for initial local/staging admin bootstrap.
```

Example:

```env
ADMIN_BOOTSTRAP_EMAIL=admin@example.test
```

Rules:

```text
Avoid using this in production unless controlled.
Do not commit real admin email if sensitive.
```

---

## 6.23 `ENABLE_DEMO_DATA`

Purpose:

```text
Controls whether demo seed data is enabled.
```

Example:

```env
ENABLE_DEMO_DATA=false
```

Rules:

```text
Production should normally set this to false.
Staging/local may set true.
```

---

## 7. Example `.env.example`

Use placeholders only.

```env
# App
APP_ENV=local
APP_NAME="Southern Border Tourism Data & Intelligence Platform"
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_DEFAULT_LOCALE=th
APP_SUPPORTED_LOCALES=th,en
APP_TIMEZONE=Asia/Bangkok

# Supabase - public
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-placeholder

# Supabase - server only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-placeholder
SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Uploads
MAX_UPLOAD_IMAGE_SIZE_MB=5
ALLOWED_TOURIST_IMAGE_MIME_TYPES=image/jpeg,image/png,image/webp

# Private file access
CERTIFICATE_SIGNED_URL_TTL_SECONDS=600
EXPORT_SIGNED_URL_TTL_SECONDS=600

# Exports
EXPORT_MAX_ROWS=5000
EXPORT_SIGNING_SECRET=replace-with-secure-random-value

# Jobs
CRON_SECRET=replace-with-secure-random-value

# Optional LINE LIFF
NEXT_PUBLIC_LIFF_ID=your-liff-id-placeholder
LINE_CHANNEL_ID=your-line-channel-id-placeholder
LINE_CHANNEL_SECRET=your-line-channel-secret-placeholder

# Optional bootstrap/demo
ADMIN_BOOTSTRAP_EMAIL=admin@example.test
ENABLE_DEMO_DATA=false
```

---

## 8. Variable Safety Matrix

| Variable | Browser Safe | Required for MVP | Environment |
|---|---:|---:|---|
| `APP_ENV` | No | Yes | all |
| `APP_NAME` | No | Recommended | all |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | all |
| `APP_DEFAULT_LOCALE` | No | Recommended | all |
| `APP_SUPPORTED_LOCALES` | No | Recommended | all |
| `APP_TIMEZONE` | No | Recommended | all |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | all |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | all |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Yes for server ops | server |
| `SUPABASE_DATABASE_URL` | No | migrations/tools | server |
| `DATABASE_URL` | No | optional/tools | server |
| `MAX_UPLOAD_IMAGE_SIZE_MB` | No | Recommended | server |
| `ALLOWED_TOURIST_IMAGE_MIME_TYPES` | No | Recommended | server |
| `CERTIFICATE_SIGNED_URL_TTL_SECONDS` | No | Recommended | server |
| `EXPORT_SIGNED_URL_TTL_SECONDS` | No | Recommended | server |
| `EXPORT_MAX_ROWS` | No | Recommended | server |
| `EXPORT_SIGNING_SECRET` | No | optional | server |
| `CRON_SECRET` | No | optional/future | server |
| `NEXT_PUBLIC_LIFF_ID` | Yes | optional | browser |
| `LINE_CHANNEL_ID` | No | optional | server |
| `LINE_CHANNEL_SECRET` | No | optional | server |
| `ADMIN_BOOTSTRAP_EMAIL` | No | optional | server |
| `ENABLE_DEMO_DATA` | No | optional | server |

---

## 9. Secret Handling Rules

Never commit:

```text
.env.local
.env.production.local
service role key
database URL
LINE channel secret
cron secret
export signing secret
production admin credentials
real tourist data exports
```

Never log:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
LINE token
guest token
provider_user_id
signed URLs
private storage paths when unnecessary
raw export rows
```

Never return in API responses:

```text
server secrets
database URL
raw Supabase error with sensitive details
private storage path unless explicitly safe
provider_user_id
guest token
```

---

## 10. Supabase Configuration

Each environment must have:

```text
Supabase URL
Anon key
Service role key
Database URL if needed
Storage buckets
RLS policies
Auth settings
```

Recommended project separation:

```text
local/dev Supabase project
staging Supabase project
production Supabase project
```

Do not use production Supabase in automated tests.

---

## 11. Storage Bucket Configuration

Required buckets:

```text
attraction-media
stamp-assets
visit-photos
certificate-files
export-files
official-imports
temp-uploads
```

Access model:

```text
attraction-media: public read / admin write
stamp-assets: public read / admin write
visit-photos: private or controlled
certificate-files: private or controlled
export-files: private
official-imports: private
temp-uploads: private
```

Environment variables do not define bucket names by default unless the implementation requires custom bucket names.

If bucket names are configurable, add:

```env
SUPABASE_BUCKET_ATTRACTION_MEDIA=attraction-media
SUPABASE_BUCKET_STAMP_ASSETS=stamp-assets
SUPABASE_BUCKET_VISIT_PHOTOS=visit-photos
SUPABASE_BUCKET_CERTIFICATE_FILES=certificate-files
SUPABASE_BUCKET_EXPORT_FILES=export-files
SUPABASE_BUCKET_OFFICIAL_IMPORTS=official-imports
SUPABASE_BUCKET_TEMP_UPLOADS=temp-uploads
```

---

## 12. Local Setup

### 12.1 Create `.env.local`

Copy:

```bash
cp .env.example .env.local
```

Then edit `.env.local`.

### 12.2 Install Dependencies

```bash
npm install
```

### 12.3 Run Development Server

```bash
npm run dev
```

### 12.4 Run Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

---

## 13. Staging Setup

Staging should use:

```text
staging app URL
staging Supabase URL
staging anon key
staging service role key
staging storage buckets
synthetic demo data
staging admin account
```

Checklist:

```text
[ ] Staging environment variables configured.
[ ] Staging database migrated.
[ ] Staging seed data applied.
[ ] Staging storage buckets configured.
[ ] Staging admin account created.
[ ] Staging QR test code created.
[ ] Staging smoke tests passed.
```

---

## 14. Production Setup

Production must use:

```text
production app URL
production Supabase URL
production anon key
production service role key
production storage buckets
production admin accounts
real domain over HTTPS
```

Checklist:

```text
[ ] Production variables configured in hosting provider.
[ ] No production secrets committed.
[ ] Production database backup available before migration.
[ ] Production storage buckets verified.
[ ] RLS/storage policies verified.
[ ] Admin accounts secured.
[ ] Smoke tests planned.
```

---

## 15. Vercel Environment Setup

In Vercel, configure variables for:

```text
Development
Preview
Production
```

Critical:

```text
SUPABASE_SERVICE_ROLE_KEY must be available only to server runtime.
NEXT_PUBLIC variables are exposed to browser.
```

Before production deployment, verify:

```text
[ ] NEXT_PUBLIC_APP_URL uses production domain.
[ ] NEXT_PUBLIC_SUPABASE_URL uses production Supabase project.
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY uses production anon key.
[ ] SUPABASE_SERVICE_ROLE_KEY uses production service role key.
[ ] LINE variables use production LINE channel if enabled.
[ ] Demo data flag is false unless intentionally enabled.
```

---

## 16. Environment Validation at Runtime

The app should validate required environment variables at startup/server use.

Recommended validation groups:

```text
publicEnv
serverEnv
optionalLineEnv
uploadEnv
exportEnv
```

If required variables are missing:

```text
fail fast in development/staging
show safe error in production
log sanitized error
```

Do not print secret values.

---

## 17. Suggested TypeScript Environment Validation

Recommended file:

```text
src/lib/config/env.ts
```

Recommended behavior:

```text
parse process.env with Zod
separate public and server variables
avoid importing server env into client components
export safe public config separately
```

Important:

```text
Do not import server-only env validation into client code if it reads secrets.
```

---

## 18. Client/Server Boundary

Client components may access:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID
```

Server-only files may access:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
LINE_CHANNEL_SECRET
CRON_SECRET
EXPORT_SIGNING_SECRET
```

Do not pass secrets from server to client props.

---

## 19. QR Code Environment Rules

QR code base URL must come from:

```text
NEXT_PUBLIC_APP_URL
```

Rules:

```text
local QR may use localhost for development only
staging QR must use staging URL
production QR must use production HTTPS URL
printed QR codes must use stable production URL
```

Do not generate production QR codes using preview URLs.

---

## 20. Certificate Environment Rules

Certificate download/signing depends on:

```text
CERTIFICATE_SIGNED_URL_TTL_SECONDS
certificate-files bucket
Supabase service role key server-side
```

Rules:

```text
certificate files private/controlled
signed URL short-lived
signed URL not stored permanently
certificate path contains no personal data
```

---

## 21. Export Environment Rules

Exports depend on:

```text
EXPORT_MAX_ROWS
EXPORT_SIGNED_URL_TTL_SECONDS
EXPORT_SIGNING_SECRET optional
export-files bucket
```

Rules:

```text
exports require permission
exports are private
exports are audited
large exports are limited
private identifiers excluded by default
```

---

## 22. LINE Environment Rules

LINE is optional.

If not using LINE:

```text
NEXT_PUBLIC_LIFF_ID may be empty
LINE_CHANNEL_ID may be empty
LINE_CHANNEL_SECRET may be empty
```

If using LINE:

```text
NEXT_PUBLIC_LIFF_ID required
LINE_CHANNEL_ID required
LINE_CHANNEL_SECRET required
server-side token verification required
guest fallback required
```

Critical:

```text
LINE must not be required for certificate generation.
```

---

## 23. Admin Bootstrap Rules

If `ADMIN_BOOTSTRAP_EMAIL` is used:

```text
use only for controlled local/staging setup
avoid in production
remove/disable after setup if not needed
do not commit real admin credentials
```

Production admin should be created through secure process.

---

## 24. Demo Data Rules

`ENABLE_DEMO_DATA` controls whether demo seed data is used.

Recommended:

```text
local: true allowed
staging: true allowed if clearly synthetic
production: false
```

Production demo data is allowed only if:

```text
clearly labeled
controlled
not mixed with real tourist analysis
removed/archived after testing
```

---

## 25. Safe `.env.example` Rules

`.env.example` should contain:

```text
all required variable names
placeholder values only
comments explaining purpose
no real secrets
no real database URLs
no real tokens
```

---

## 26. Unsafe Examples

Do not do this:

```env
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=real-service-key
NEXT_PUBLIC_DATABASE_URL=postgresql://real-prod-url
LINE_CHANNEL_SECRET=real-secret-committed-to-git
```

Do not:

```text
paste production .env into issue/PR
send secrets to Codex in prompts
log process.env
print signed URLs in client console unnecessarily
```

---

## 27. Environment Checklist

### Local

```text
[ ] .env.local exists.
[ ] Uses local/dev Supabase.
[ ] Does not use production secrets.
[ ] Demo data uses synthetic records.
[ ] npm run dev works.
```

### Staging

```text
[ ] Staging app URL configured.
[ ] Staging Supabase URL configured.
[ ] Staging anon/service keys configured.
[ ] Staging storage buckets configured.
[ ] Staging auth redirects configured.
[ ] Staging smoke tests pass.
```

### Production

```text
[ ] Production app URL configured.
[ ] Production Supabase URL configured.
[ ] Production anon/service keys configured.
[ ] Production storage buckets configured.
[ ] Production auth redirects configured.
[ ] Demo data disabled.
[ ] No secrets committed.
[ ] Smoke tests planned.
```

---

## 28. Troubleshooting

### 28.1 App cannot connect to Supabase

Check:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
Supabase project status
network/firewall
correct environment selected
```

---

### 28.2 Admin API returns unauthorized

Check:

```text
Supabase Auth session
admin_users row
role assignment
permission seed data
inactive admin flag
auth redirect URL
```

---

### 28.3 Storage upload fails

Check:

```text
bucket exists
service role key server-side
storage policy
file size limit
MIME validation
storage path generation
visit ownership
```

---

### 28.4 Certificate download fails

Check:

```text
certificate-files bucket
certificate metadata
storage path
signed URL generation
TTL value
ownership check
service role server-side
```

---

### 28.5 Dashboard empty unexpectedly

Check:

```text
date filter timezone
visits exist
certificate/survey records exist
filters too narrow
dashboard query joins
metric denominator
RLS/service role behavior
```

---

### 28.6 Export fails

Check:

```text
export permission
EXPORT_MAX_ROWS
export-files bucket
CSV generation
audit log insert
signed URL TTL
private identifier whitelist
```

---

### 28.7 LINE linking fails

Check:

```text
NEXT_PUBLIC_LIFF_ID
LINE_CHANNEL_ID
LINE_CHANNEL_SECRET
LIFF endpoint URL
server-side ID token verification
guest fallback
browser inside/outside LINE
```

---

## 29. Environment Security Review

Before release, verify:

```text
[ ] No secret uses NEXT_PUBLIC_ prefix.
[ ] Service role key not in browser bundle.
[ ] Database URL not in browser bundle.
[ ] LINE secret not in browser bundle.
[ ] .env.local not committed.
[ ] Vercel variables set per environment.
[ ] Supabase project matches environment.
[ ] Storage buckets match environment.
[ ] Auth redirect URLs match environment.
```

---

## 30. Final Environment Rule

Environment configuration is part of system security.

A wrong environment value can cause:

```text
data leak
production data corruption
broken QR codes
broken auth
public private files
wrong dashboard data
failed certificate downloads
unsafe exports
```

Treat environment variables as production-critical configuration, not simple setup details.
