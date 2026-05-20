# DEPLOYMENT.md

## 1. Purpose

This document defines the deployment and release process for the **Southern Border Tourism Data & Intelligence Platform**.

The platform is a production-oriented tourism database and analytics system for the southern border provinces of Thailand:

```text
Yala
Pattani
Narathiwat
```

The system handles:

```text
tourist profiles
visit records
photo uploads
digital certificates
digital stamps/passports
optional survey responses
expense ranges
satisfaction scores
admin accounts
dashboard analytics
exports
audit logs
```

Deployment must therefore be secure, repeatable, privacy-aware, and testable.

---

## 2. Deployment Goals

The deployment process must ensure that:

```text
the app builds successfully
environment variables are configured correctly
database migrations are applied safely
Supabase Storage buckets are configured securely
admin authentication works
tourist QR-to-certificate flow works
dashboard metrics work
exports are privacy-safe
private files are protected
release can be rolled back if needed
```

A deployment is not successful just because the app is online.

A deployment is successful only when the core tourist flow, admin flow, dashboard, storage privacy, and security checks all pass.

---

## 3. Recommended Deployment Stack

Recommended MVP deployment stack:

```text
Application Hosting: Vercel
Database: Supabase PostgreSQL
Authentication: Supabase Auth
File Storage: Supabase Storage
Frontend/Backend Runtime: Next.js App Router
Domain: HTTPS custom domain or Vercel preview domain
```

Optional/future:

```text
Dedicated NestJS backend
Background worker
Queue system
Object storage CDN
Dashboard summary refresh jobs
Official tourism data import jobs
```

For MVP, **Next.js + Supabase + Vercel** is acceptable.

---

## 4. Environments

Use at least three environments:

```text
local
staging
production
```

Optional:

```text
preview
test
```

---

## 5. Environment Responsibilities

### 5.1 Local

Purpose:

```text
developer testing
feature development
local migrations
local seed data
unit/integration testing
```

Rules:

```text
uses local or development Supabase project
may contain synthetic demo data
must not contain production tourist data
must not use production service role key
```

---

### 5.2 Staging

Purpose:

```text
pre-release testing
E2E testing
security/privacy verification
admin workflow testing
dashboard validation
demo preparation
```

Rules:

```text
separate Supabase project from production
separate storage buckets from production
synthetic or controlled demo data only
safe for realistic testing
must mirror production configuration as closely as possible
```

---

### 5.3 Production

Purpose:

```text
real deployment
real tourist data collection
real admin workflows
real dashboard/export usage
```

Rules:

```text
only production-approved migrations
only production-approved environment variables
private data protected
storage policies verified
secrets never exposed
test data avoided unless explicitly controlled
```

---

## 6. Deployment Architecture

Recommended architecture:

```text
Tourist / Admin Browser
        |
        | HTTPS
        v
Vercel / Next.js App
        |
        | Server Actions / Route Handlers
        v
Supabase PostgreSQL
Supabase Auth
Supabase Storage
```

Important boundary:

```text
Browser must never receive service role key.
Admin/tourist security must be enforced server-side.
Storage access to private files must be controlled through backend/signed URLs.
Dashboard metrics must be aggregated server-side.
```

---

## 7. Deployment Prerequisites

Before deployment, verify that the repository has:

```text
README.md
AGENTS.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
ROADMAP.md
SECURITY.md
ENVIRONMENT.md
DEPLOYMENT.md
CONTRIBUTING.md
CHANGELOG.md
docs/
prompts/
tasks/
checklists/
.codex/skills/
.github/
```

Implementation prerequisites:

```text
package.json exists
Next.js app builds
TypeScript configured
Tailwind configured
Supabase client configured
environment variables documented
migrations prepared
storage buckets documented
testing scripts available
```

---

## 8. Required Commands

Recommended commands before deployment:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

If configured:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:security
```

Supabase commands if using Supabase CLI:

```bash
supabase status
supabase db reset
supabase migration up
supabase gen types typescript --local > src/lib/types/database.types.ts
```

Do not claim a command passed if it was not run.

---

## 9. Environment Variables

Environment variables are documented in:

```text
ENVIRONMENT.md
```

Production must separate:

```text
public client variables
server-only secrets
optional integration secrets
deployment/runtime secrets
```

Critical rule:

```text
SUPABASE_SERVICE_ROLE_KEY must never be exposed to the browser.
```

---

## 10. Public Environment Variables

These may be exposed to the browser:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID optional
```

Only use `NEXT_PUBLIC_` for values that are safe for the browser.

---

## 11. Server-Only Environment Variables

These must stay server-side only:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
DATABASE_URL
LINE_CHANNEL_SECRET
LINE_CHANNEL_ID
CRON_SECRET
EXPORT_SIGNING_SECRET
```

Never use server-only values in client components.

Never prefix secrets with `NEXT_PUBLIC_`.

---

## 12. Supabase Setup

Each environment should have its own Supabase project or equivalent separation.

Required Supabase components:

```text
PostgreSQL database
Auth
Storage
RLS policies
storage buckets
service role key
anon key
database connection string
```

---

## 13. Supabase Database Deployment

### 13.1 Before Applying Migrations

Before production migration:

```text
review migration file
test migration locally
test migration on staging
backup production database
confirm migration is non-destructive or has rollback plan
confirm required indexes/constraints exist
confirm data dictionary updated
```

### 13.2 Migration Rules

Migration files should be stored in:

```text
supabase/migrations/
```

Recommended naming:

```text
YYYYMMDDHHMM_description.sql
```

Example:

```text
202605190900_create_reference_tables.sql
202605190930_create_tourism_core_tables.sql
202605191000_create_security_tables.sql
```

### 13.3 Production Migration Checklist

```text
[ ] Migration reviewed.
[ ] Migration tested locally.
[ ] Migration tested on staging.
[ ] Backup available.
[ ] Rollback/forward-fix plan documented.
[ ] Data dictionary updated.
[ ] Generated database types updated if used.
[ ] Application build passes after migration.
```

---

## 14. Supabase Seed Deployment

Production seed should include:

```text
Yala/Pattani/Narathiwat provinces
district/reference data
countries
age groups
transport modes
travel purposes
travel companions
expense categories
spending ranges
attraction types
roles
permissions
certificate templates
required system settings
```

Production seed must not include:

```text
fake tourist records
real personal test data
test LINE IDs
test phone numbers
test emails
test photos
temporary demo exports
```

Staging seed may include synthetic data.

---

## 15. Supabase Storage Buckets

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

Recommended access policy:

```text
attraction-media: public read / admin write
stamp-assets: public read / admin write
visit-photos: private or controlled
certificate-files: private or controlled
export-files: private
official-imports: private
temp-uploads: private
```

Critical rule:

```text
Do not make all buckets public.
```

---

## 16. Storage Verification Checklist

Before production release:

```text
[ ] attraction-media public read works.
[ ] stamp-assets public read works.
[ ] public cannot write to attraction-media.
[ ] public cannot write to stamp-assets.
[ ] public cannot list/read visit-photos.
[ ] public cannot list/read certificate-files.
[ ] public cannot list/read export-files.
[ ] signed URLs are generated server-side.
[ ] signed URLs are short-lived.
[ ] signed URLs are not stored permanently.
[ ] storage paths contain no tourist personal data.
```

Storage paths must not include:

```text
tourist display name
email
LINE user ID
provider_user_id
guest token
phone number
original filename
```

---

## 17. Authentication Deployment

Admin authentication should use:

```text
Supabase Auth
admin_users table
roles
permissions
admin_user_roles
role_permissions
```

Before release:

```text
[ ] Super admin account created securely.
[ ] Admin account created only as needed.
[ ] Viewer account created only as needed.
[ ] Test accounts disabled or removed from production.
[ ] Inactive admin is blocked.
[ ] Anonymous users cannot access admin routes.
[ ] Viewer cannot mutate data.
[ ] Viewer cannot export detailed data.
```

Do not commit admin credentials.

---

## 18. Auth Redirect URLs

If Supabase Auth is used, configure allowed redirect URLs:

Local:

```text
http://localhost:3000
http://localhost:3000/auth/callback
```

Staging:

```text
https://staging-domain.example.com
https://staging-domain.example.com/auth/callback
```

Production:

```text
https://production-domain.example.com
https://production-domain.example.com/auth/callback
```

Only use real configured domains.

---

## 19. Vercel Deployment

### 19.1 Project Setup

Recommended Vercel setup:

```text
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
Output Directory: default Next.js
Node Version: project default or current LTS
```

### 19.2 Environment Variables

Configure variables per environment:

```text
Production
Preview
Development
```

Never store production secrets in development/preview unless intentionally required and access-controlled.

### 19.3 Deployment Checks

Before merging to production branch:

```text
[ ] Preview deployment builds.
[ ] Typecheck passes.
[ ] Lint passes.
[ ] Tests pass or not-run reason documented.
[ ] No secrets exposed in browser bundle.
[ ] Environment variables are set in Vercel.
```

---

## 20. Domain and HTTPS

Production must use HTTPS.

QR codes must point to HTTPS production or staging URLs.

Do not print QR codes that point to:

```text
localhost
temporary preview URL
wrong staging URL
expired demo domain
```

QR code URL should be stable.

Recommended QR path:

```text
https://your-domain.com/checkin/[code]
```

or project route equivalent:

```text
https://your-domain.com/c/[checkinCode]
```

---

## 21. LINE LIFF Deployment

LINE LIFF is optional and post-MVP unless explicitly included.

If used:

```text
[ ] LIFF app created.
[ ] LIFF endpoint URL configured.
[ ] NEXT_PUBLIC_LIFF_ID set correctly.
[ ] LINE_CHANNEL_ID set server-side if needed.
[ ] LINE_CHANNEL_SECRET set server-side.
[ ] Token verification happens server-side.
[ ] Guest fallback works.
[ ] Non-LINE browser works.
[ ] Foreign/non-LINE tourists can complete certificate flow.
```

Critical rule:

```text
LINE must not be required for certificate generation.
```

---

## 22. Pre-Deployment Checklist

Before staging deployment:

```text
[ ] npm run typecheck passes.
[ ] npm run lint passes.
[ ] npm run test passes or reason documented.
[ ] npm run build passes.
[ ] Environment variables configured.
[ ] Supabase migrations applied to staging.
[ ] Supabase seed data applied to staging.
[ ] Storage buckets configured.
[ ] Admin account configured.
[ ] QR test code exists.
[ ] Test attraction exists.
[ ] Test certificate template exists.
```

Before production deployment:

```text
[ ] Staging smoke tests passed.
[ ] Production environment variables configured.
[ ] Production database backup available.
[ ] Production migrations reviewed.
[ ] Storage policies verified.
[ ] Admin accounts secured.
[ ] Test/demo data removed or controlled.
[ ] Rollback plan ready.
[ ] CHANGELOG.md updated.
```

---

## 23. Staging Smoke Test

After staging deployment, verify:

```text
[ ] Public home page loads.
[ ] Public attraction list loads.
[ ] Public attraction detail page loads.
[ ] Active QR opens correct landing page.
[ ] Invalid QR shows safe error.
[ ] Inactive QR shows safe unavailable page.
[ ] Expired QR shows safe expired/unavailable page.
[ ] Minimal tourist profile form works.
[ ] Missing consent is rejected.
[ ] Photo upload works.
[ ] Invalid file upload is rejected.
[ ] Certificate preview works.
[ ] Certificate generation works.
[ ] Certificate download works.
[ ] Stamp earned or already-earned state works.
[ ] Optional survey can be skipped.
[ ] Optional survey can be submitted.
[ ] Passport page works.
[ ] Admin login works.
[ ] Admin attraction CMS works.
[ ] Admin photo spot CMS works.
[ ] Admin check-in code creation works.
[ ] Dashboard loads.
[ ] Dashboard filters work.
[ ] Export works with permission.
[ ] Viewer cannot export detailed data.
```

---

## 24. Production Smoke Test

After production deployment, verify carefully:

```text
[ ] Production URL loads.
[ ] Public attraction page loads.
[ ] Controlled test QR resolves.
[ ] Admin login works.
[ ] Dashboard loads.
[ ] Storage signed URL generation works.
[ ] Private storage is not public.
[ ] Export behavior works according to permission.
[ ] Safe error pages appear for invalid QR.
[ ] No secrets appear in browser.
```

Do not create uncontrolled fake tourist data in production.

If production testing requires data, use a clearly labeled controlled test attraction and remove/archive it afterward if appropriate.

---

## 25. Critical Release Gate

Do not release if any of these are true:

```text
service role key exposed
production secrets committed
anonymous admin access possible
viewer can mutate data
viewer can export detailed data
tourist can access another tourist's data
consent is missing
photo upload accepts dangerous files
tourist photos are public unintentionally
certificate files are public unintentionally
export files are public
QR-to-certificate flow broken
certificate requires survey
certificate requires LINE
dashboard counts QR scans as visits
estimated spending is labeled revenue
missing satisfaction is treated as 0
build fails
```

---

## 26. Rollback Plan

### 26.1 Application Rollback

Vercel supports deployment rollback.

Before release, record:

```text
previous deployment ID
new deployment ID
release branch/commit
rollback owner
rollback trigger conditions
```

Rollback triggers:

```text
critical QR flow broken
admin login broken
private data leak
service role exposure
storage privacy misconfiguration
production build unstable
```

---

### 26.2 Database Rollback

Database rollback is harder than app rollback.

Before production migration:

```text
create backup
review migration
avoid destructive changes
prepare down migration if practical
prepare forward-fix plan
test on staging
```

If migration is destructive, it must have explicit approval and backup.

---

### 26.3 Storage Rollback

Storage rollback rules:

```text
do not delete existing production files casually
version certificate templates/assets
avoid changing bucket public/private state without verification
keep previous assets until new deployment is stable
```

---

## 27. Backup and Recovery

Production should have a backup strategy for:

```text
PostgreSQL database
Supabase Storage files
certificate templates
admin accounts
role/permission seed data
audit logs
exports
environment variables
```

At minimum, document:

```text
Supabase backup capability for selected plan
manual export/backup process
who can restore
how long backups are retained
```

---

## 28. Monitoring

Recommended monitoring areas:

```text
QR landing errors
QR-to-certificate conversion
photo upload failures
certificate generation failures
stamp award failures
survey submission errors
dashboard query errors
export failures
auth failures
storage errors
database errors
API latency
```

Product funnel monitoring:

```text
qr_scanned
landing_viewed
certificate_started
minimal_form_completed
photo_uploaded
certificate_generated
survey_started
survey_completed
passport_saved
```

---

## 29. Logging Rules

Logs must not contain:

```text
service role key
database URL
LINE token
guest token
provider_user_id
signed URLs
raw uploaded file contents
raw exported rows
unnecessary personal data
```

Use sanitized logs.

---

## 30. Performance Release Checks

Before release:

```text
[ ] QR landing tested on mobile.
[ ] QR landing tested on slow network or throttled network.
[ ] Photo upload tested with 2 MB image.
[ ] Photo upload tested with 5 MB image.
[ ] Oversized photo rejection tested.
[ ] Certificate generation tested on mobile.
[ ] Dashboard loads with staging data.
[ ] Dashboard does not fetch raw personal rows.
[ ] Export row limit works.
[ ] Admin lists are paginated/bounded.
[ ] Large public images optimized.
```

---

## 31. Security Release Checks

Before release:

```text
[ ] Secret scan completed.
[ ] Service role key server-only.
[ ] RLS/storage policies verified.
[ ] Anonymous admin access blocked.
[ ] Viewer mutation blocked.
[ ] Viewer detailed export blocked.
[ ] Tourist ownership enforced.
[ ] Invalid file types rejected.
[ ] Dashboard excludes private identifiers.
[ ] Export excludes private identifiers by default.
[ ] Safe errors verified.
[ ] Consent required before tourist/visit save.
```

---

## 32. Deployment Checklist

### Staging

```text
[ ] Environment variables set.
[ ] Database migrated.
[ ] Seed applied.
[ ] Storage buckets configured.
[ ] Admin user configured.
[ ] Build passes.
[ ] Smoke tests pass.
[ ] E2E tests pass or manual equivalent documented.
```

### Production

```text
[ ] Production environment variables set.
[ ] Production secrets verified.
[ ] Database backup available.
[ ] Migration reviewed.
[ ] Storage policies verified.
[ ] Admin accounts verified.
[ ] Build passes.
[ ] Release notes updated.
[ ] Rollback plan ready.
[ ] Production smoke tests scheduled.
```

---

## 33. Release Notes

Update:

```text
CHANGELOG.md
```

Release notes should mention:

```text
features added
bugs fixed
database migrations
security/privacy changes
dashboard metric changes
export behavior changes
known issues
rollback notes if relevant
```

---

## 34. Known Deployment Risks

Common risks:

```text
wrong Supabase project URL
wrong anon key
service role key exposed to frontend
missing storage bucket
bucket accidentally public
auth redirect URL misconfigured
migration not applied
seed missing roles/permissions
certificate template missing
QR code points to staging/localhost
dashboard queries too slow
export too large
```

Each release should check these risks explicitly.

---

## 35. Deployment Task Template

Use this when asking Codex to work on deployment:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Prepare/fix/review deployment item.]

Context:
Deployment must be secure, repeatable, and safe for tourist data.

Read first:
- DEPLOYMENT.md
- ENVIRONMENT.md
- SECURITY.md
- .codex/skills/deployment-release/SKILL.md
- checklists/PRODUCTION_RELEASE_CHECKLIST.md
- checklists/SECURITY_PDPA_CHECKLIST.md
- checklists/TESTING_CHECKLIST.md

Requirements:
- Keep secrets server-only.
- Keep staging and production separated.
- Verify Supabase/storage configuration.
- Add smoke test steps.
- Document rollback/risks if relevant.

Do not:
- Do not commit secrets.
- Do not use production data in tests.
- Do not make private buckets public.
- Do not run destructive migrations without backup plan.
- Do not release if core security or QR flow is broken.

Completion response:
Summary
Files changed
Validation
Deployment notes
Security/privacy notes
Risks / Notes
Next suggested task
```

---

## 36. Final Deployment Rule

A deployment is ready only when the system works safely for:

```text
tourists
foreign/non-LINE tourists
admins
dashboard users
export users
maintainers
```

The minimum production-ready proof is:

```text
QR-to-certificate flow works
guest/non-LINE flow works
admin access is protected
private files are private
dashboard metrics are correct
exports are privacy-safe
core tests/smoke tests pass
rollback plan exists
```
