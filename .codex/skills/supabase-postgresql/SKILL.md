---
name: supabase-postgresql
description: Use when implementing, reviewing, or debugging Supabase PostgreSQL, Supabase Auth, Supabase Storage, RLS policies, migrations, seed data, storage buckets, signed URLs, and Supabase-specific backend integration.
---

# Supabase PostgreSQL Skill

## Purpose

Use this skill when implementing, reviewing, refactoring, or debugging **Supabase PostgreSQL**, Supabase Auth, Supabase Storage, RLS policies, migrations, seed data, and Supabase-specific backend integration for the **Southern Border Tourism Data & Intelligence Platform**.

The platform uses Supabase as the database/storage/auth foundation. Supabase must be configured in a production-oriented way:

```text
secure
privacy-aware
migration-controlled
RLS-aware
storage-safe
dashboard-ready
export-safe
```

---

## When to Use This Skill

Use this skill for tasks involving:

```text
Supabase project setup
PostgreSQL migrations
SQL schema
seed data
Supabase Auth
admin user linking
RLS policies
storage buckets
storage policies
service role usage
anon client usage
signed URLs
database functions
views/materialized views
Supabase CLI
environment variables
deployment database setup
```

---

## Required Context

Before Supabase/PostgreSQL work, read:

```text
CODEX_MAIN_PROMPT.md
prompts/CODEX_DATABASE_PROMPT.md
docs/database/DATABASE_REQUIREMENTS.md
docs/database/MIGRATION_GUIDE.md
docs/database/SEED_DATA_GUIDE.md
docs/database/INDEXING_STRATEGY.md
docs/database/ANALYTICS_TABLES.md
docs/security/ROW_LEVEL_SECURITY.md
docs/security/SECURITY_REQUIREMENTS.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/IMAGE_UPLOAD_SECURITY.md
docs/backend/STORAGE_FILE_UPLOADS.md
checklists/DATABASE_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/PROJECT_SETUP_CHECKLIST.md
```

---

## Supabase Mission

Use Supabase to provide:

```text
PostgreSQL database
Auth for admin users
Storage for media/photos/certificates/exports
RLS and policies for data protection
server-side service role operations
anon-safe public reads
migration and seed workflow
```

Supabase must not become a shortcut that bypasses backend security.

---

# Environment and Secret Rules

---

## Environment Variables

Public-safe:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_LIFF_ID optional
```

Server-only:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
DATABASE_URL optional
LINE_CHANNEL_SECRET optional
CRON_SECRET optional
EXPORT_SIGNING_SECRET optional
```

Rules:

```text
SUPABASE_SERVICE_ROLE_KEY must never be exposed to browser.
DATABASE_URL must never be exposed to browser.
Service role client must only be created in server-only files.
Anon client can be used in browser only for public/RLS-safe operations.
.env.local must not be committed.
.env.example must contain variable names only.
```

---

## Client Boundary Rules

Use separate clients:

```text
browser anon client
server anon client
server service role client
```

Rules:

```text
server service role client only in server code
admin-sensitive actions should go through backend services
public frontend should not directly access sensitive tables
tourist ownership cannot rely on client-side data alone
```

Do not import service role client into client components.

---

# Supabase Auth

---

## Admin Auth Model

Recommended:

```text
Supabase Auth user
  -> admin_users.auth_user_id
  -> admin_user_roles
  -> roles
  -> permissions
```

Rules:

```text
Only admin/staff use Supabase Auth in MVP.
Tourists do not need Supabase Auth.
Guest tourist flow must work without login.
LINE/email identity linking is optional and separate.
```

Admin checks:

```text
current auth user exists
admin_users row exists
admin user is_active
permissions resolved server-side
```

Do not:

```text
treat any Supabase Auth user as admin automatically
trust JWT role claims alone unless explicitly designed
trust localStorage role
```

---

## Tourist Identity

Tourists may use:

```text
anonymous_device provider
line provider optional
email provider future
```

Tourist identity is app-level data, not necessarily Supabase Auth.

Rules:

```text
guest identity token must be random
guest identity must be verified server-side
LINE ID token must be verified server-side if implemented
foreign/non-LINE tourists must still complete core flow
```

---

# Migrations

---

## Migration Folder

Recommended:

```text
supabase/migrations/
```

or project-established equivalent.

Migration naming:

```text
YYYYMMDDHHMM_description.sql
```

Examples:

```text
202605190900_create_reference_tables.sql
202605190930_create_tourism_core_tables.sql
202605191000_create_security_tables.sql
202605191030_create_storage_policies.sql
```

---

## Migration Quality Rules

Migrations must:

```text
run on empty database
be ordered
be readable
include constraints
include indexes
include RLS where needed
avoid destructive changes without plan
avoid hardcoded secrets
be reviewed before production
```

Use comments where schema meaning is not obvious.

---

## Migration Safety Checklist

Before completing migration work:

```text
[ ] primary keys exist
[ ] foreign keys exist
[ ] unique constraints exist
[ ] check constraints exist
[ ] timestamps exist
[ ] indexes exist
[ ] RLS strategy applied or documented
[ ] seed data compatibility verified
[ ] data dictionary updated
```

---

# Seed Data

---

## Seed Folder

Recommended:

```text
supabase/seed.sql
```

or:

```text
supabase/seeds/
```

depending on project setup.

---

## Required Seed Data

Seed:

```text
Yala province
Pattani province
Narathiwat province
districts
countries including Thailand
age groups
preferred languages
transport modes
travel purposes
travel companions
expense categories
spending ranges
attraction types
roles
permissions
role_permissions
certificate templates
sample staging/demo attraction
sample photo spot
sample check-in code
stamp definition sample
```

---

## Seed Rules

Seeds must be:

```text
idempotent
rerunnable
free of real personal data
stable enough for tests
separated between production reference seed and demo/test seed where possible
```

Use:

```sql
insert ... on conflict do update
```

or equivalent where appropriate.

Do not seed:

```text
real tourist data
real LINE IDs
real emails of real people
real phone numbers
real private photos
```

---

# Row Level Security

---

## RLS Principle

RLS should protect sensitive tables when direct client access exists.

If all sensitive operations use server-side service role, backend must still enforce:

```text
authentication
authorization
tourist ownership
privacy-safe responses
```

RLS is not a replacement for backend service logic, and service role bypasses RLS.

---

## Sensitive Tables

Sensitive tables should not be publicly readable:

```text
tourists
tourist_identities
visits
visit_photos
certificates
satisfaction_surveys
visit_expenses
consent_records
funnel_events if sensitive/session data included
audit_logs
export_jobs
admin_users
roles
permissions
role_permissions
admin_user_roles
```

---

## Public-Safe Tables

Public read may be allowed for:

```text
published active attractions
published active attraction images
safe reference tables
public stamp assets
```

Even public tables should avoid private/admin fields in public views.

---

## RLS Policy Design

Recommended pattern:

```text
Enable RLS on sensitive tables.
Deny public access by default.
Allow public read only through specific views/policies for safe content.
Use server-side service role for controlled mutations.
Use explicit policies for authenticated admin read/write only if direct Supabase client is used.
```

---

## Public Views

For public attraction pages, consider safe views:

```text
public_attractions
public_attraction_images
public_photo_spots
```

Views should include only:

```text
published active rows
safe public columns
no admin notes
no private storage paths
```

---

## RLS Review Checklist

Check:

```text
[ ] RLS enabled on sensitive tables.
[ ] anon cannot read sensitive rows.
[ ] anon can only read safe public content.
[ ] authenticated user is not automatically admin.
[ ] admin policies match role/permission design or server controls.
[ ] service role used only server-side.
[ ] tests/manual checks verify anon access.
```

---

# Storage

---

## Required Buckets

Recommended buckets:

```text
attraction-media
stamp-assets
visit-photos
certificate-files
export-files
official-imports
temp-uploads
```

---

## Bucket Access Strategy

Recommended:

```text
attraction-media: public read, admin write
stamp-assets: public read, admin write
visit-photos: private/controlled
certificate-files: private/controlled
export-files: private
official-imports: private
temp-uploads: private
```

Do not make all buckets public.

---

## Storage Path Rules

Paths should be generated server-side.

Good examples:

```text
visit-photos/2026/05/{visit_id}/{random_id}.jpg
certificates/2026/05/{visit_id}/{certificate_id}.png
exports/2026/05/{export_job_id}.csv
attractions/{attraction_id}/{random_id}.webp
```

Do not include:

```text
tourist display name
email
LINE ID
provider_user_id
guest token
original filename
phone
```

---

## Signed URL Rules

Use signed URLs for private file access when needed.

Rules:

```text
signed URLs should be short-lived
generate signed URLs server-side
do not store signed URLs permanently
do not log signed URLs
do not export signed URLs
```

---

## Upload Rules

Tourist photo uploads:

```text
accept JPEG/PNG/WebP
reject SVG/PDF/HTML/JS
validate MIME type server-side
validate file size server-side
verify visit ownership
store metadata after successful upload
cleanup file if metadata insert fails where practical
```

Admin uploads:

```text
require admin auth
require media permission
validate file type/size
audit media changes
```

---

# Service Role Usage

---

## Service Role Safety

The service role bypasses RLS.

Use it only:

```text
inside server-only backend services
for controlled mutations
for storage writes
for admin operations after permission checks
for dashboard aggregation after auth/permission checks
```

Never use it:

```text
in client components
in public browser code
in files imported by client components
in NEXT_PUBLIC variables
```

---

## Service Role Checklist

Before using service role:

```text
[ ] Is this file server-only?
[ ] Is auth/permission/ownership checked before sensitive operation?
[ ] Is response privacy-safe?
[ ] Are errors sanitized?
[ ] Are secrets not logged?
```

---

# Database Functions and Views

---

## Views

Use views for:

```text
public-safe attraction content
dashboard summary projections
export-safe projections
```

Rules:

```text
views must not expose private identifiers unless restricted
public views should filter active/published rows
views should use clear column names
```

---

## Database Functions

Use functions carefully for:

```text
complex dashboard aggregation
summary table refresh
safe RPC operations
```

Rules:

```text
validate inputs where applicable
respect security definer risks
avoid leaking private rows
document function purpose
test function behavior
```

Be careful with `security definer`.

---

# Dashboard and Analytics in Supabase

---

## Live Queries vs Summary Tables

MVP may use live aggregate queries if data is small.

Production should consider:

```text
daily_attraction_stats
monthly_province_stats
daily_funnel_stats
daily_satisfaction_stats
daily_expense_stats
materialized views
scheduled refresh
```

Summary tables must not contain personal identifiers.

---

## Metric Query Rules

Dashboard queries must preserve definitions:

```text
QR scans are not visits.
Tourist Profiles are distinct tourist_id through visits.
Estimated Spending is not revenue.
Null satisfaction excluded from average.
Zero denominator returns null.
```

---

## Performance Indexes

Ensure indexes for:

```text
visits(visit_date)
visits(attraction_id, visit_date)
visits(tourist_id)
attractions(slug)
attractions(province_id)
checkin_codes(code)
certificates(visit_id)
tourist_stamps(tourist_id, attraction_id)
satisfaction_surveys(visit_id)
visit_expenses(visit_id)
funnel_events(event_name, event_time)
funnel_events(attraction_id, event_time)
```

---

# Supabase CLI Workflow

---

## Common Commands

Use as applicable:

```bash
supabase init
supabase start
supabase stop
supabase db reset
supabase migration new create_tourism_core_tables
supabase migration up
supabase db diff
supabase gen types typescript --local > src/lib/types/database.types.ts
```

Commands may vary by project setup.

Do not claim commands were run if they were not.

---

## Local Development

Recommended:

```text
local Supabase for schema/migration testing
staging Supabase for E2E and preview deployments
production Supabase only for validated releases
```

Never run destructive experimental migrations directly on production.

---

# Type Generation

---

## Supabase Types

If using generated types:

```text
generate database types after migrations
store types in src/lib/types/database.types.ts
update imports if schema changes
```

After schema changes, run type generation if configured.

---

# Supabase Task Prompt Template

---

## Standard Prompt

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Describe Supabase/PostgreSQL task.]

Context:
[Explain why this matters.]

Read first:
- CODEX_MAIN_PROMPT.md
- .codex/skills/supabase-postgresql/SKILL.md
- .codex/skills/database-design/SKILL.md
- docs/database/MIGRATION_GUIDE.md
- docs/database/SEED_DATA_GUIDE.md
- docs/security/ROW_LEVEL_SECURITY.md
- docs/security/IMAGE_UPLOAD_SECURITY.md
- checklists/DATABASE_CHECKLIST.md
- checklists/SECURITY_PDPA_CHECKLIST.md

Requirements:
- [List migration/RLS/storage/seed requirements.]
- Keep service role server-only.
- Preserve privacy-safe defaults.
- Add/update indexes and constraints.
- Update generated types if configured.
- Add/update tests or verification notes.

Validation:
- Run relevant Supabase command if available.
- Report not-run commands honestly.

Do not:
- Do not expose service role key.
- Do not make private buckets public.
- Do not disable RLS broadly.
- Do not store signed URLs permanently.
- Do not seed real personal data.

Completion response:
Summary
Files changed
Validation
Supabase notes
Security/privacy notes
Risks / Notes
Next suggested task
```

---

# Specialized Supabase Prompts

---

## Migration Prompt

```text
Task:
Create or update Supabase migration for [schema area].

Requirements:
- Create ordered SQL migration.
- Add tables/columns/constraints/indexes.
- Add comments if useful.
- Enable RLS where needed.
- Do not destructively change production data without plan.
- Update data dictionary if schema changes.
```

---

## RLS Prompt

```text
Task:
Add or review RLS policies for [tables].

Requirements:
- Sensitive tables protected.
- Public content readable only if published/active.
- Admin access controlled or server-only.
- Anonymous cannot read tourist/visit/certificate/survey/audit/export data.
- Test or document anon/auth behavior.
```

---

## Storage Bucket Prompt

```text
Task:
Configure or document Supabase Storage buckets and policies.

Requirements:
- attraction-media public read/admin write.
- stamp-assets public read/admin write.
- visit-photos private/controlled.
- certificate-files private/controlled.
- export-files private.
- official-imports/temp-uploads private.
- Public write disabled.
- Signed URL strategy documented.
```

---

## Seed Prompt

```text
Task:
Create or update Supabase seed data.

Requirements:
- Seed location/reference values.
- Seed roles/permissions.
- Seed certificate template.
- Seed demo attraction/photo spot/check-in code if appropriate.
- Make seed rerunnable.
- Use synthetic data only.
```

---

## Type Generation Prompt

```text
Task:
Regenerate Supabase TypeScript database types after schema changes.

Requirements:
- Run configured type generation command if available.
- Update type imports if needed.
- Do not manually fake generated types unless necessary and documented.
```

---

# Review Checklist

Before accepting Supabase work, check:

```text
[ ] migrations are ordered and safe
[ ] constraints are present
[ ] indexes are present
[ ] RLS strategy is applied or documented
[ ] service role remains server-only
[ ] anon client cannot read sensitive tables
[ ] storage buckets match privacy rules
[ ] private files are not public
[ ] seed data is rerunnable
[ ] no real personal data seeded
[ ] generated types updated if needed
[ ] docs updated
```

---

## Critical Blockers

Block if:

```text
SUPABASE_SERVICE_ROLE_KEY in client code
private bucket made public unintentionally
RLS disabled broadly on sensitive tables
anon can read tourists/visits/certificates/surveys/audit/export data
export files public
tourist photos public unintentionally
signed URLs stored permanently
real personal data in seed
destructive migration without plan
```

---

# Completion Response Format

Codex should respond:

```text
Summary
- ...

Files changed
- ...

Validation
- supabase command results
- tests/typecheck results

Supabase notes
- migrations
- RLS
- storage
- seed/types

Security/privacy notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

Supabase is powerful, but it is not automatically safe.

Use Supabase with explicit migrations, strong constraints, clear RLS/storage policies, server-only service role usage, and privacy-safe application logic.
