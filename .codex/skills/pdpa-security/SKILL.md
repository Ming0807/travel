---
name: pdpa-security
description: Use when building, reviewing, or debugging security, privacy, consent, access control, data minimization, RLS, storage protection, exports, audit logging, anonymization, and PDPA compliance.
---

# PDPA Security Skill

## Purpose

Use this skill when building, reviewing, refactoring, or debugging security, privacy, consent, access control, data minimization, RLS, storage protection, exports, audit logging, and anonymization for the **Southern Border Tourism Data & Intelligence Platform**.

The platform collects tourist data, uploaded photos, visit records, certificates, stamps, survey answers, expense ranges, satisfaction scores, and dashboard analytics. It must be designed to protect people while still supporting tourism planning.

---

## When to Use This Skill

Use this skill for tasks involving:

```text
PDPA/privacy design
consent management
data minimization
role/permission model
admin authentication
tourist ownership
RLS policies
storage bucket policies
image upload security
dashboard privacy
export privacy
audit logging
data retention
anonymization
safe errors
secret management
security tests
```

Use together with:

```text
backend-api
supabase-postgresql
database-design
frontend-nextjs-pwa
testing-qa
```

for implementation tasks.

---

## Required Context

Before security/privacy work, read:

```text
CODEX_MAIN_PROMPT.md
docs/security/SECURITY_REQUIREMENTS.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/CONSENT_MANAGEMENT.md
docs/security/ROLE_PERMISSION_MATRIX.md
docs/security/ROW_LEVEL_SECURITY.md
docs/security/AUDIT_LOGGING.md
docs/security/DATA_ANONYMIZATION.md
docs/security/IMAGE_UPLOAD_SECURITY.md
docs/backend/AUTHORIZATION_RULES.md
docs/backend/FILE_UPLOAD_FLOW.md
docs/backend/ERROR_HANDLING.md
docs/database/DATA_RETENTION_POLICY.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/BACKEND_CHECKLIST.md
checklists/DATABASE_CHECKLIST.md
checklists/TESTING_CHECKLIST.md
```

---

## Security and Privacy Mission

The mission is:

```text
Collect only useful tourism planning data, protect it by default, and prevent unauthorized access or misleading disclosure.
```

The system should be safe even when:

```text
someone calls APIs directly
a viewer tries to mutate data
a tourist tries to access another tourist's data
a file upload is malicious
an export is requested
a dashboard query is made
an error occurs
```

---

# Core Privacy Principles

---

## Data Minimization

Collect only what is needed.

Before certificate, allow only:

```text
display name
origin country/province
age group
consent
photo for certificate
```

Do not require or add by default:

```text
national ID
passport number
full address
exact birthdate
phone
email
LINE
religion
ethnicity
health data
political data
income
```

Use:

```text
age group instead of exact age
origin area instead of full address
spending range instead of exact income
optional survey instead of forced long form
```

---

## Purpose Limitation

Each field must have a purpose.

Examples:

```text
display name -> certificate display
photo -> certificate image
origin -> tourism profile dashboard
age group -> demographic distribution
expense range -> estimated spending insight
satisfaction -> attraction improvement
travel behavior -> planning dashboard
funnel events -> UX improvement
```

Do not collect data "just in case."

---

## Consent

Consent must be:

```text
visible
specific enough
not pre-checked
recorded
versioned
timestamped
source-tracked
language-aware
```

Consent must be required before storing tourist profile/visit data.

Separate consent for:

```text
certificate/data collection
photo usage
optional survey
LINE identity linking
notifications/marketing future
public sharing future
```

Do not combine all purposes into one vague consent.

---

# Required Consent Model

---

## Consent Record Fields

Recommended:

```text
consent_record_id
tourist_id
visit_id
consent_version
consent_type
purpose_key
has_consented
consented_at
withdrawn_at
source
language
created_at
```

Purpose examples:

```text
certificate_generation
tourism_planning_analytics
photo_for_certificate
optional_survey
passport_persistence
line_linking
marketing_notifications future
public_sharing future
```

---

## Consent UI Rules

Frontend must:

```text
show short consent
link full privacy notice
not pre-check checkbox
show photo purpose before upload
show survey optional notice
show LINE linking optional notice
```

Backend must:

```text
reject missing required consent
store consent evidence
not rely only on client checkbox
```

---

# Role and Permission Security

---

## Required Roles

```text
super_admin
admin
viewer
```

Rules:

```text
viewer is read-only
viewer cannot mutate data
viewer cannot export detailed data
admin manages tourism content
super_admin manages users/roles
```

---

## Permission Groups

Recommended:

```text
dashboard.read
attraction.read
attraction.create
attraction.update
attraction.publish
photo_spot.manage
checkin_code.manage
media.manage
visit.read
survey.read
certificate.read
stamp.read
export.summary
export.detailed
audit.read
user.manage
role.manage
system.manage
```

Adapt to the existing permission naming, but preserve the intent.

---

## Authorization Rule

Backend must enforce permission checks.

Do not rely on:

```text
hidden UI buttons
localStorage role
client-provided permission list
route naming only
```

---

# Tourist Ownership Security

---

## Ownership Checks Required

Check ownership before:

```text
photo upload to visit
certificate generation
certificate download/access
survey submit
passport access
private photo access
private certificate access
```

Do not trust:

```text
tourist_id from browser
visit_id from hidden input
certificate_id from URL without ownership
guest token without server validation
```

---

## Safe Failure

For unauthorized tourist access, return:

```text
403 FORBIDDEN
```

or safe:

```text
404 NOT_FOUND
```

Avoid leaking whether another tourist's resource exists.

---

# Secret Management

---

## Server-Only Secrets

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
SUPABASE_DATABASE_URL
LINE_CHANNEL_SECRET
LINE_LOGIN_CHANNEL_SECRET
CRON_SECRET
EXPORT_SIGNING_SECRET
private API tokens
```

Allowed public variables:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID optional
```

---

## Secret Rules

Do not:

```text
commit .env.local
log secrets
return secrets in API responses
put service role key in client components
store tokens in database unless required and protected
```

---

# RLS and Database Security

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
audit_logs
export_jobs
admin_users
roles
permissions
admin_user_roles
role_permissions
```

---

## Public-Safe Tables

Public read may be allowed for:

```text
published active attractions
public attraction media
safe reference tables
public stamp assets
```

Public views are recommended to avoid exposing admin/private columns.

---

## RLS Rules

If using direct Supabase client access:

```text
enable RLS on sensitive tables
deny public access by default
allow only safe public views/tables
use server-side service role for controlled mutations
```

Remember:

```text
service role bypasses RLS
```

Therefore backend must still enforce authorization and ownership when using service role.

---

# Storage Security

---

## Bucket Access Strategy

Recommended:

```text
attraction-media: public read/admin write
stamp-assets: public read/admin write
visit-photos: private/controlled
certificate-files: private/controlled
export-files: private
official-imports: private
temp-uploads: private
```

Do not make every bucket public.

---

## Tourist Photo Security

Tourist photos:

```text
private or controlled
used for certificate
not public by default
not used for face recognition
not stored as base64 in database
path contains no personal data
```

---

## Certificate File Security

Certificates:

```text
private or controlled by default
downloadable by owner via safe access
not public unless user chooses sharing future
path contains no personal data
signed URLs short-lived
signed URLs not stored permanently
```

---

## Export File Security

Exports:

```text
private
permission-controlled
short-lived signed URL
expires_at required if stored
audit log required
cleanup planned
```

---

# File Upload Security

---

## Tourist Uploads

Allow:

```text
image/jpeg
image/png
image/webp
```

Reject:

```text
SVG
PDF
HTML
JavaScript
empty file
oversized file
wrong ownership
```

Rules:

```text
validate server-side
do not trust file extension
generate storage path server-side
do not use original filename
do not include tourist data in path
```

---

## Admin Uploads

Admin uploads require:

```text
authentication
permission
file validation
audit log for important media changes
```

---

# Dashboard Privacy

---

## Dashboard Must Be Aggregated

Dashboard may show:

```text
counts
percentages
averages
ranges
ranked attractions
province summaries
funnel conversion
planning insight cards
```

Dashboard must not show by default:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw IP
raw user agent
private photo path
private certificate path
raw comments
```

---

## Dashboard Label Safety

Use correct labels:

```text
Tourist Profiles
Estimated Spending
QR Scans
Total Visits
Average Satisfaction
```

Avoid misleading labels:

```text
Verified Unique Tourists
Official Arrivals
Revenue
Income
```

Misleading metrics are a trust/privacy risk because they distort planning.

---

# Export Privacy

---

## Default Export Exclusions

Default exports must exclude:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw IP
raw user agent
raw photo path
private certificate path
raw comments unless permitted
```

---

## Export Requirements

Exports must:

```text
require authentication
require permission
validate filters
use safe column whitelist
enforce row limit
create audit log
preserve Thai text
escape CSV correctly
store file privately if stored
expire stored files
```

---

## Raw Comments

Raw comments may contain personal or sensitive content.

Rules:

```text
exclude raw comments by default
require special permission if included
show privacy warning
audit comment export
consider anonymization/redaction
```

---

# Audit Logging

---

## Audit Required For

```text
exports
raw comment access/export
user/role changes
attraction publish/deactivate
check-in code create/deactivate
admin media upload/update/delete
official data import
anonymization/deletion
permission denied events where useful
```

---

## Audit Safety

Audit logs must not store:

```text
secrets
tokens
signed URLs
full exported rows
raw uploaded files
unnecessary personal data
```

Audit logs should store:

```text
actor
action
entity type/id
result
timestamp
sanitized metadata
filters/row count for exports
```

---

# Error Handling Security

---

## User-Facing Errors Must Not Include

```text
stack trace
SQL query
SQLSTATE raw details
raw Supabase error object
service role key
database URL
private storage path
provider_user_id
guest token
LINE token
signed URL
```

Use stable error codes and friendly messages.

---

# Data Retention and Anonymization

---

## Retention Plan

Define retention for:

```text
tourist profiles
tourist identities
visit photos
certificates
survey comments
exports
temp uploads
audit logs
funnel events
```

---

## Anonymization

Support or plan:

```text
remove/unlink identities
anonymize display name
delete photos
revoke/delete certificates
redact comments
preserve safe aggregated analytics
record anonymization audit log
```

---

# LINE Privacy

---

## LINE Rules

LINE is optional.

Do not:

```text
require LINE for certificate
require LINE for stamp
trust frontend LINE user ID
show LINE ID in dashboard
export LINE ID by default
store raw LINE token unnecessarily
treat linking as marketing consent
```

If LINE is linked:

```text
verify token server-side
record separate consent
store provider_user_id securely
exclude from analytics/export by default
```

---

# Security Testing

---

## Required Security Tests

Add tests or manual proof for:

```text
anonymous admin access blocked
viewer mutation blocked
viewer detailed export blocked
tourist ownership violation blocked
invalid file type rejected
oversized file rejected
private files not public
dashboard excludes identifiers
exports exclude identifiers
consent required
service role not in frontend
safe error responses
```

---

# Review Checklist

Before accepting security/privacy-sensitive work:

```text
[ ] Data minimization respected.
[ ] Consent captured and stored.
[ ] Backend validates required consent.
[ ] LINE/email optional.
[ ] Auth required for admin.
[ ] Permissions enforced server-side.
[ ] Tourist ownership enforced server-side.
[ ] Private buckets remain private.
[ ] Unsafe file uploads rejected.
[ ] Dashboard aggregated and private.
[ ] Exports permission-controlled and private.
[ ] Audit logs created for sensitive actions.
[ ] Secrets remain server-only.
[ ] Errors are safe.
[ ] Tests or manual verification exist.
```

---

## Critical Blockers

Block if:

```text
service role key exposed
anonymous admin data access
viewer mutation/export allowed
tourist ownership bypass
tourist photos public unintentionally
certificate files public unintentionally
consent missing
LINE required for all tourists
dangerous file uploads accepted
exports include private identifiers by default
dashboard exposes provider_user_id
raw SQL/stack trace shown to users
```

---

# Task Prompt Template

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Build/fix/review security or privacy area.]

Context:
This system collects tourist data, photos, certificates, visits, surveys, and dashboard analytics. Security and privacy must be built in from the start.

Read first:
- .codex/skills/pdpa-security/SKILL.md
- docs/security/SECURITY_REQUIREMENTS.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- docs/security/CONSENT_MANAGEMENT.md
- docs/security/ROLE_PERMISSION_MATRIX.md
- checklists/SECURITY_PDPA_CHECKLIST.md

Requirements:
- [specific requirements]
- Enforce server-side validation.
- Enforce permissions/ownership where relevant.
- Keep data minimization.
- Keep privacy-safe defaults.
- Add tests where practical.

Do not:
- Do not expose secrets.
- Do not rely only on frontend checks.
- Do not require LINE/email/phone before certificate.
- Do not make private files public.
- Do not export private identifiers by default.
- Do not show raw errors.

Completion response:
Summary
Files changed
Validation
Security/privacy notes
Risks / Notes
Next suggested task
```

---

# Output Format

When completing security/privacy work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- typecheck/lint/test/build results

Security/privacy notes
- data minimization
- consent
- auth/authorization
- ownership
- storage/RLS
- export/dashboard privacy

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

Security and privacy are not a final polish step.

If the system collects real tourist data, the system must protect that data from the first migration, first API route, first upload, first dashboard, and first export.
