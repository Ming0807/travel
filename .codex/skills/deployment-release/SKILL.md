---
name: deployment-release
description: Use when preparing, reviewing, or debugging deployment and release processes including environment setup, Supabase deployment, storage buckets, migrations, smoke tests, rollback plans, and production readiness.
---

# Deployment Release Skill

## Purpose

Use this skill when preparing, reviewing, debugging, or documenting deployment and release processes for the **Southern Border Tourism Data & Intelligence Platform**.

The system handles tourist data, uploaded photos, certificates, stamps, surveys, admin operations, dashboards, and exports. Deployment must be controlled, repeatable, secure, and testable.

This skill covers:

```text
environment setup
staging/production separation
Supabase deployment
storage buckets
environment variables
migrations
seed data
build checks
smoke tests
release checklist
rollback plan
monitoring
backup
production readiness
```

---

## When to Use This Skill

Use this skill for tasks involving:

```text
deployment setup
Vercel/hosting setup
Supabase production setup
environment variables
storage buckets
database migrations
release checklist
staging testing
production smoke tests
rollback strategy
monitoring
backup/restore
CI/CD
production hardening
```

Use together with:

```text
supabase-postgresql
pdpa-security
testing-qa
performance-optimization
documentation-report
```

for deployment-sensitive work.

---

## Required Context

Before deployment/release work, read:

```text
CODEX_MAIN_PROMPT.md
DEPLOYMENT.md
ENVIRONMENT.md
SECURITY.md
docs/testing/ACCEPTANCE_CRITERIA.md
docs/testing/PERFORMANCE_TEST_PLAN.md
docs/testing/SECURITY_TEST_PLAN.md
docs/security/SECURITY_REQUIREMENTS.md
docs/security/ROW_LEVEL_SECURITY.md
docs/security/IMAGE_UPLOAD_SECURITY.md
docs/database/MIGRATION_GUIDE.md
docs/database/SEED_DATA_GUIDE.md
checklists/PRODUCTION_RELEASE_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/PERFORMANCE_CHECKLIST.md
checklists/TESTING_CHECKLIST.md
```

---

## Deployment Mission

The deployment mission is:

```text
Release the system safely without exposing secrets, losing data, weakening privacy, or breaking the tourist QR-to-certificate flow.
```

A release is not ready unless:

```text
build passes
environment variables are correct
database migrations are applied safely
storage buckets are configured
security checks pass
core tourist flow works
admin flow works
dashboard metrics work
exports are privacy-safe
smoke tests pass
rollback plan exists
```

---

# Environment Strategy

---

## Recommended Environments

Use at least:

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

Rules:

```text
local uses local/dev database
staging uses staging database/storage
production uses production database/storage
tests never use production data
```

---

## Environment Separation

Do not share:

```text
production database with staging
production storage with staging
production service role key with local
production secrets in repository
real tourist data in tests
```

---

## Environment Variables

Public-safe:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID optional
```

Server-only:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
DATABASE_URL
LINE_CHANNEL_SECRET optional
LINE_CHANNEL_ID optional
CRON_SECRET optional
EXPORT_SIGNING_SECRET optional
```

Rules:

```text
service role key server-only
database URL server-only
LINE secrets server-only
no secrets committed
.env.example contains names only
.env.local ignored
```

---

# Hosting

---

## Recommended Hosting

Common MVP hosting:

```text
Vercel for Next.js
Supabase for database/auth/storage
```

Other hosting is possible if it supports:

```text
server-side environment variables
Next.js server features
secure HTTPS
deployment logs
rollbacks
cron/job protection if used
```

---

## HTTPS

Production must use HTTPS.

QR codes should point to HTTPS URLs.

Do not use localhost URLs in production QR codes.

---

# Supabase Deployment

---

## Database Migration Deployment

Before applying migrations to production:

```text
backup production database
review migration
test migration on local/staging
confirm migration is non-destructive or planned
apply during controlled release window if needed
verify schema after migration
```

Do not run destructive migration on production without backup/rollback plan.

---

## Seed Data Deployment

Production seed should include:

```text
reference data
roles
permissions
certificate templates
required system settings
```

Production seed should not include:

```text
fake tourist data
test LINE IDs
demo personal data
test photos
random admin accounts
```

Demo/staging seed may include synthetic sample data.

---

## Supabase Type Generation

After schema changes:

```text
generate/update TypeScript database types if project uses them
commit generated types if part of project convention
verify typecheck
```

---

# Storage Deployment

---

## Required Buckets

Create/configure:

```text
attraction-media
stamp-assets
visit-photos
certificate-files
export-files
official-imports
temp-uploads
```

Access strategy:

```text
attraction-media: public read/admin write
stamp-assets: public read/admin write
visit-photos: private/controlled
certificate-files: private/controlled
export-files: private
official-imports: private
temp-uploads: private
```

Do not make all buckets public.

---

## Storage Policy Checks

Before release, verify:

```text
public can read published attraction media
public cannot write media
public cannot list/read tourist photos
public cannot list/read certificate files
public cannot list/read export files
admin upload requires permission via backend
signed URLs are short-lived
```

---

# Auth and Admin Release

---

## Admin Users

Before release:

```text
create super_admin account securely
create admin accounts only as needed
create viewer accounts only as needed
disable test accounts
verify inactive admin blocked
verify password/email policy if applicable
```

Do not commit admin credentials.

---

## Auth Redirects

If using Supabase Auth or external auth:

```text
configure production redirect URL
configure staging redirect URL
remove localhost-only redirect for production where appropriate
test login/logout
```

---

# LINE LIFF Release

If LINE is implemented:

```text
configure LIFF URL for production
configure LIFF URL for staging if possible
set NEXT_PUBLIC_LIFF_ID correctly
keep LINE channel secret server-only
test inside LINE browser
test outside LINE browser
verify guest fallback
verify LINE optional
verify token verification server-side
```

Do not release if LINE becomes mandatory for certificate flow.

---

# Build and CI

---

## Required Build Checks

Before release, run:

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

Do not claim a command passed if not run.

---

## CI/CD

Recommended CI checks:

```text
typecheck
lint
unit tests
build
migration lint/review if available
secret scan
E2E on staging before production where possible
```

---

# Release Testing

---

## Staging Smoke Test

On staging, verify:

```text
public home loads
public attraction list loads
public attraction detail loads
active QR resolves
invalid QR safe error
inactive QR safe unavailable
minimal profile works
consent required
photo upload works
certificate generation works
certificate download works
stamp earned works
optional survey works
passport works
admin login works
admin attraction CMS works
admin QR creation works
dashboard loads
dashboard filters work
export works
viewer restrictions work
```

---

## Production Smoke Test

After production release, verify carefully:

```text
production URL loads
public attraction page loads
test QR code resolves
admin login works
dashboard loads
storage signed URL generation works
export disabled/works according to permission
error pages safe
```

Do not create uncontrolled fake data in production.

If test data is needed in production, use a clearly marked controlled test attraction and remove it after verification if appropriate.

---

# Release Gate

---

## MVP Release Requirements

Do not release MVP unless:

```text
QR-to-certificate flow works
guest/non-LINE flow works
consent is required
photo upload validation works
certificate generation idempotent
stamp duplicate prevention works
survey optional
admin CMS works
dashboard metric formulas tested
export privacy tested
permissions tested
tourist ownership tested
storage privacy verified
environment secrets secure
build passes
smoke tests pass
```

---

## Critical Release Blockers

Block release if:

```text
service role key exposed
production .env committed
tourist photos public unintentionally
certificates public unintentionally
export files public
anonymous admin access
viewer can mutate/export detailed data
tourist can access another tourist data
consent missing
QR-to-certificate flow broken
photo upload accepts unsafe files
dashboard counts QR scans as visits
estimated spending labeled revenue
missing satisfaction shown as 0
LINE required for all tourists
build fails
```

---

# Rollback Plan

---

## Application Rollback

Hosting should support rollback to previous deployment.

Before release, know:

```text
previous deployment ID/version
rollback command or UI path
expected rollback time
who can perform rollback
```

---

## Database Rollback

Database rollback is harder.

Before production migrations:

```text
backup database
know migration changes
prepare down/rollback script if practical
avoid destructive migrations
test migration on staging
```

If rollback is not practical, document forward-fix plan.

---

## Storage Rollback

For storage changes:

```text
avoid deleting files during release
version templates/assets when possible
keep previous certificate templates if needed
do not remove buckets casually
```

---

# Backup and Recovery

---

## Backup Plan

Production should have:

```text
database backups
storage retention plan
export file expiry
audit log retention
recovery procedure
backup access restrictions
```

At minimum, document how Supabase backups are handled for the selected plan.

---

## Recovery Checklist

Know how to recover:

```text
database schema/data
storage files
environment variables
admin access
certificate templates
role/permission seed data
```

---

# Monitoring and Logging

---

## Runtime Monitoring

Monitor:

```text
API errors
QR landing errors
photo upload failures
certificate generation failures
dashboard query failures
export failures
auth failures
storage errors
database errors
cron/job failures
```

---

## Product/Funnel Monitoring

Monitor:

```text
QR scans
landing views
minimal form completion
photo upload completion
certificate generation
survey completion
passport save
drop-off stages
```

Performance and funnel should be interpreted together.

---

## Logging Rules

Logs must not contain:

```text
service role key
database URL
LINE token
guest token
provider_user_id
signed URLs
raw uploaded file contents
raw export rows
unnecessary personal data
```

---

# Performance Release Checks

Before release:

```text
QR landing tested on mobile
photo upload tested with 2 MB and 5 MB images
certificate generation tested on mobile
dashboard loads with seed/staging data
export row limit works
large images optimized
admin lists bounded/paginated
```

---

# Security Release Checks

Before release:

```text
secret scan completed
service role server-only
RLS/storage policies verified
anonymous admin blocked
viewer mutation blocked
tourist ownership blocked
invalid file types rejected
dashboard privacy verified
export privacy verified
safe errors verified
```

---

# Deployment Documentation

Deployment docs should include:

```text
hosting provider
environment variables
Supabase setup
storage buckets
migration process
seed process
build commands
release checklist
rollback plan
smoke tests
monitoring
known risks
```

Do not include actual secrets.

---

# Changelog and Release Notes

Before release, update:

```text
CHANGELOG.md
release notes if used
MVP scope status
known issues
```

Release notes should include:

```text
features added
bugs fixed
security/privacy notes
migration notes
known limitations
next steps
```

---

# Deployment Task Prompt

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Prepare/fix/review deployment or release item.]

Context:
Deployment must be secure, repeatable, and safe for tourist data.

Read first:
- .codex/skills/deployment-release/SKILL.md
- DEPLOYMENT.md
- ENVIRONMENT.md
- SECURITY.md
- checklists/PRODUCTION_RELEASE_CHECKLIST.md
- checklists/SECURITY_PDPA_CHECKLIST.md
- checklists/TESTING_CHECKLIST.md

Requirements:
- [specific deployment requirements]
- Keep secrets server-only.
- Keep staging/production separate.
- Verify storage bucket policy.
- Verify migrations/seed process.
- Add smoke test steps.
- Document rollback/risks if relevant.

Do not:
- Do not commit secrets.
- Do not use production data in tests.
- Do not make private buckets public.
- Do not run destructive migrations without backup plan.
- Do not release if core flow/security is broken.

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

# Output Format

When completing deployment/release work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- build/test/deploy command results

Deployment notes
- environment
- migrations
- storage
- smoke tests
- rollback

Security/privacy notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

A deployment is not successful just because the app builds.

A release is successful only when the core tourist flow, admin flow, dashboard, exports, storage privacy, environment secrets, and smoke tests are all verified.
