---
name: backend-api
description: Use when building, reviewing, refactoring, or debugging backend API/server-side logic including route handlers, server actions, validation, auth, RBAC, tourist ownership, file uploads, certificates, surveys, dashboards, exports, and audit logging.
---

# Backend API Skill

## Purpose

Use this skill when building, reviewing, refactoring, or debugging backend API/server-side logic for the **Southern Border Tourism Data & Intelligence Platform**.

The backend is the authority of the system. It must protect tourist data, enforce validation, verify ownership, enforce admin permissions, manage storage safely, generate dashboard metrics correctly, and create privacy-safe exports.

Frontend checks are for UX only. Backend checks are mandatory.

---

## When to Use This Skill

Use this skill for tasks involving:

```text
Next.js Route Handlers
Server Actions
service layer
repository layer
API endpoint design
validation
auth
RBAC permissions
tourist ownership
file upload backend
certificate backend
survey backend
dashboard backend
export backend
audit logging
background jobs
error handling
```

Use together with:

```text
database-design
supabase-postgresql
pdpa-security
testing-qa
```

when the task touches database, Supabase, security, or tests.

---

## Required Context

Before backend work, read:

```text
CODEX_MAIN_PROMPT.md
prompts/CODEX_BACKEND_PROMPT.md
docs/backend/BACKEND_REQUIREMENTS.md
docs/backend/API_DESIGN_GUIDELINES.md
docs/backend/API_ENDPOINTS.md
docs/backend/VALIDATION_RULES.md
docs/backend/ERROR_HANDLING.md
docs/backend/FILE_UPLOAD_FLOW.md
docs/backend/CERTIFICATE_RENDERING_FLOW.md
docs/backend/AUTHORIZATION_RULES.md
docs/backend/BACKGROUND_JOBS.md
docs/security/SECURITY_REQUIREMENTS.md
docs/security/ROLE_PERMISSION_MATRIX.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/database/DATABASE_REQUIREMENTS.md
checklists/BACKEND_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/TESTING_CHECKLIST.md
```

For dashboard/export work, also read:

```text
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
docs/backend/EXPORT_REPORTING_SERVICES.md
checklists/DASHBOARD_CHECKLIST.md
```

---

## Backend Mission

The backend must ensure:

```text
correct data
safe data
authorized access
privacy-safe responses
trusted dashboard metrics
safe exports
auditable sensitive actions
reliable tourist flow
```

A feature is not complete if it only works from the UI but can be bypassed through a direct API call.

---

# Architecture

---

## Required Backend Flow

Use this flow:

```text
Route Handler / Server Action
  -> Input Validator
  -> Auth / Permission / Ownership Guard
  -> Service
  -> Repository
  -> Database / Storage
```

Rules:

```text
Route handlers should be thin.
Validation must happen server-side.
Auth and permissions must happen server-side.
Ownership checks must happen server-side.
Business rules belong in services.
Queries belong in repositories.
Storage operations should use a centralized adapter/helper.
Errors must be mapped to safe responses.
```

---

## Recommended Folders

```text
src/server/
  actions/
  api/
  services/
  repositories/
  validators/
  auth/
  storage/
  dashboard/
  exports/
  jobs/
  audit/
  errors/
  types/
```

Recommended services:

```text
CheckinService
TouristService
VisitService
ConsentService
PhotoService
CertificateService
StampService
PassportService
SurveyService
AdminAttractionService
AdminPhotoSpotService
AdminCheckinCodeService
DashboardService
ExportService
AuditService
StorageService
```

---

# Validation

---

## Validation Rule

All external inputs must be validated server-side.

Validate:

```text
QR code
tourist profile form
consent
visit id
photo upload
certificate generation request
survey fields
admin attraction form
admin photo spot form
admin check-in code form
dashboard filters
export filters
cron/job requests
```

Do not rely on:

```text
client-side validation
HTML required attributes
hidden inputs
localStorage
trusted route params
```

---

## Recommended Validation Tool

Use:

```text
Zod
```

or the existing project-approved validation system.

Validation output should support:

```text
field errors
stable error codes
safe messages
```

---

## Tourist Profile Validation Rules

Required:

```text
display_name
origin country/province
age_group
consent
```

Must not require:

```text
LINE
email
phone
national ID
passport number
full address
exact birthdate
```

---

## Survey Validation Rules

Validate:

```text
overall_score 1-5 if present
dimension scores 1-5 if present
group_size >= 1 if present
nights >= 0 if present
transport_mode exists
travel_purpose exists
spending_range exists
comment length
```

Rules:

```text
missing optional answer = null
missing satisfaction is not 0
spending is range-based estimate
```

---

# Authentication and Authorization

---

## Admin Auth

Admin endpoints must:

```text
require Supabase Auth/session or configured auth
look up admin_users row
block inactive admin
resolve roles and permissions
return 401/403 safely
```

Never treat every authenticated Supabase user as an admin automatically.

---

## Permission Rules

Required roles:

```text
super_admin
admin
viewer
```

Rules:

```text
viewer is read-only
viewer cannot mutate
viewer cannot export detailed data
admin can manage tourism content
admin cannot manage users/roles unless permitted
super_admin can manage users/roles
```

Backend must enforce permissions even if UI hides buttons.

---

## Permission Helpers

Recommended helpers:

```text
requireAdmin()
requireActiveAdmin()
requirePermission(permissionKey)
requireAnyPermission(permissionKeys)
requireAllPermissions(permissionKeys)
```

Responses:

```text
UNAUTHORIZED for no session
FORBIDDEN for missing permission
```

---

# Tourist Ownership

---

## Ownership Rule

Tourist APIs must verify ownership before accessing or modifying tourist resources.

Check ownership for:

```text
visit
photo upload
certificate generation
certificate download/access
survey submission
passport/stamps
private file access
```

Do not trust:

```text
tourist_id from localStorage
visit_id from hidden input
certificate_id from URL
guest token without server validation
```

---

## Ownership Helpers

Recommended:

```text
resolveGuestOrLinkedTourist()
requireTouristVisitAccess()
requireTouristCertificateAccess()
requireTouristPassportAccess()
```

Wrong ownership should return:

```text
403 FORBIDDEN
```

or safe:

```text
404 NOT_FOUND
```

Avoid leaking another tourist's resource existence.

---

# Public APIs

---

## Public Attraction API

Must return only:

```text
published active attraction data
safe media references
safe reference labels
```

Must exclude:

```text
admin notes
draft content
private storage paths
internal-only fields
```

---

## QR Check-in API

Must:

```text
resolve active QR/check-in code
detect invalid code
detect inactive code
detect expired code
verify linked attraction is public/active
verify linked photo spot active if used
return public-safe context
record funnel event if implemented
```

Must not:

```text
create full visit from QR scan alone
count QR scan as visit
require login
require LINE
expose private fields
```

---

# Tourist APIs

---

## Profile + Visit Creation

Must:

```text
validate minimal profile
require consent
create/reuse tourist
create/reuse tourist identity
create visit
create consent record
use transaction where appropriate
return safe next-step response
```

Must not:

```text
require email
require LINE
require phone
accept national ID
accept full address
```

---

## Photo Upload Backend

Must:

```text
verify visit ownership
validate MIME type
validate file size
reject SVG/PDF/HTML/JS
generate storage path server-side
upload to private/controlled bucket
insert metadata
handle storage errors safely
cleanup orphan file where practical
record photo_uploaded event if implemented
```

Must not:

```text
store base64 in DB
store signed URL permanently
include personal data in storage path
make private bucket public
```

---

## Certificate Backend

Must:

```text
verify visit ownership
verify photo belongs to visit
verify template active
generate/store certificate
create certificate record
update visit status
award stamp
handle duplicates idempotently
record certificate_generated event
return safe download/access info
```

Must not include in certificate:

```text
email
LINE ID
internal tourist ID
phone
national ID
full address
```

---

## Passport Backend

Must:

```text
resolve tourist identity
return only own stamps
return only own certificate references if included
exclude provider_user_id
exclude guest token
handle empty passport
support guest flow
```

---

## Survey Backend

Must:

```text
verify visit ownership
validate optional answers
store travel behavior
store expense range
store satisfaction
prevent/update duplicate survey according to policy
record survey_completed event if implemented
```

Survey must remain optional.

---

# Admin APIs

---

## Admin Attraction API

Must:

```text
require auth
require permission
validate input
enforce unique slug
create/update attraction
publish/unpublish
deactivate
audit sensitive actions
```

Avoid hard deleting attractions with historical visits.

---

## Admin Photo Spot API

Must:

```text
require auth
require permission
validate input
verify attraction exists
create/update/deactivate photo spot
audit actions
```

---

## Admin Check-in Code API

Must:

```text
require auth
require permission
validate code
enforce unique code
verify attraction exists
verify photo spot belongs to attraction
handle active/expired state
deactivate safely
audit actions
```

---

# Dashboard Backend

---

## Dashboard API Rules

Dashboard endpoints must:

```text
require dashboard.read permission
validate filters
calculate metrics server-side
return aggregated data only
exclude private identifiers
handle null and zero correctly
use date filters
avoid unbounded raw data
```

Critical metric rules:

```text
QR scans are not visits.
Tourist Profiles are not verified unique people.
Estimated Spending is not Revenue.
Missing satisfaction is null/No data, not 0.
Zero denominator returns null/No data.
Average satisfaction excludes null.
```

---

# Export Backend

---

## Export API Rules

Exports must:

```text
require auth
require export permission
validate filters
use safe column whitelist
enforce row limit
preserve Thai text
escape CSV correctly
create audit log
store file privately if stored
return safe errors
```

Default exports must exclude:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw photo path
private certificate path
raw comments unless permitted
```

---

# Storage Backend

---

## Storage Adapter

Centralize:

```text
bucket constants
path generation
file validation
upload
delete
signed URL generation
metadata mapping
```

Bucket rules:

```text
attraction-media: public read/admin write
stamp-assets: public read/admin write
visit-photos: private/controlled
certificate-files: private/controlled
export-files: private
official-imports: private
temp-uploads: private
```

---

# Error Handling

---

## Safe Error Format

Use stable codes:

```text
VALIDATION_FAILED
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
QR_CODE_INVALID
QR_CODE_INACTIVE
QR_CODE_EXPIRED
CONSENT_REQUIRED
PHOTO_INVALID_TYPE
PHOTO_TOO_LARGE
PHOTO_UPLOAD_FAILED
CERTIFICATE_ALREADY_EXISTS
SURVEY_ALREADY_SUBMITTED
EXPORT_TOO_LARGE
INTERNAL_ERROR
```

Errors must not expose:

```text
stack trace
SQL query
raw Supabase error
service role key
database URL
private storage path
provider_user_id
signed URL in logs
```

---

# Audit Logging

---

## Audit Required For

```text
exports
role/user changes
attraction publish/deactivate
check-in code create/deactivate
admin media upload/update/delete
official data import
anonymization/deletion
sensitive denied attempts where designed
```

Audit logs must be sanitized.

Do not store:

```text
secrets
tokens
signed URLs
full exported rows
raw uploaded file content
```

---

# Background Jobs

---

## Job Rules

If jobs/cron are implemented:

```text
protect cron endpoints
use CRON_SECRET or platform protection
make jobs idempotent
log safe errors
clean expired exports
clean temp uploads
refresh summary tables safely
```

Do not expose cron endpoints publicly.

---

# Backend Testing

---

## Required Tests

For backend-sensitive work, add or update:

```text
unit tests
integration tests
security tests
```

Critical tests:

```text
validation
permissions
ownership
photo file validation
certificate idempotency
stamp duplicate prevention
survey optional behavior
dashboard formulas
export privacy
audit log creation
```

---

# Backend Review Checklist

Before accepting backend work:

```text
[ ] Server-side validation exists.
[ ] Auth checks exist.
[ ] Permission checks exist.
[ ] Tourist ownership checks exist.
[ ] Service/repository boundaries are reasonable.
[ ] Errors are safe.
[ ] Private identifiers are not returned.
[ ] Storage paths are safe.
[ ] Dashboard formulas are correct.
[ ] Export privacy is preserved.
[ ] Audit logs exist for sensitive actions.
[ ] Tests or validation evidence exists.
```

---

## Critical Backend Blockers

Block if:

```text
service role key in frontend
anonymous admin access
viewer mutation/export allowed
tourist ownership bypass
unsafe file upload
private bucket public unintentionally
export includes private identifiers by default
dashboard counts QR scans as visits
missing satisfaction shown as 0
consent not enforced
raw DB errors returned
```

---

# Output Format

When completing backend work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- typecheck/lint/test/build results

Security/privacy notes
- ...

Data/metric notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

The backend is the authority.

If validation, permissions, ownership, storage safety, dashboard formulas, or export privacy can be bypassed by direct API calls, the feature is not complete.
