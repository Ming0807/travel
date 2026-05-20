# CODEX_BACKEND_PROMPT.md

## 1. Purpose

Use this prompt when asking Codex to build, review, refactor, or debug backend work for the **Southern Border Tourism Data & Intelligence Platform**.

The backend is the system authority. It must enforce validation, permissions, tourist ownership, privacy, storage safety, dashboard correctness, export safety, and audit logging.

Frontend checks are useful for UX, but they are not security controls.

---

## 2. Backend Mission

The backend mission is:

```text
Protect data integrity, enforce security and privacy, connect workflows safely, and produce trustworthy analytics for tourism planning.
```

The backend must support:

```text
public attraction data
QR/check-in resolution
tourist profile and consent
guest and optional LINE/email identity
visit creation
photo upload
certificate generation
digital stamp/passport
optional survey
admin CMS
dashboard services
CSV exports
audit logging
storage access
background jobs
```

---

## 3. Required Opening Instruction for Codex

Start backend tasks with:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.
Implement backend logic with server-side validation, permission checks, ownership checks, safe errors, and privacy-safe responses.
Do not trust frontend data for security.
Do not expose service role keys or private identifiers.
```

---

## 4. Documents to Read Before Backend Work

Codex should read:

```text
CODEX_MAIN_PROMPT.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
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
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/ROLE_PERMISSION_MATRIX.md
docs/security/ROW_LEVEL_SECURITY.md
docs/security/AUDIT_LOGGING.md
docs/security/IMAGE_UPLOAD_SECURITY.md
docs/database/DATABASE_REQUIREMENTS.md
checklists/BACKEND_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/TESTING_CHECKLIST.md
```

For dashboard backend:

```text
docs/dashboard/DASHBOARD_REQUIREMENTS.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
checklists/DASHBOARD_CHECKLIST.md
```

For export backend:

```text
docs/backend/EXPORT_REPORTING_SERVICES.md
docs/security/AUDIT_LOGGING.md
```

---

## 5. Backend Architecture

Use this layering:

```text
Route Handler / Server Action
  -> Validator
  -> Auth / Permission / Ownership Guard
  -> Service
  -> Repository
  -> Database / Storage
```

Rules:

```text
Route handlers should be thin.
Validation should be centralized.
Business logic belongs in services.
Database queries belong in repositories.
Storage logic belongs in storage adapter/helpers.
Authorization must be server-side.
Dashboard metrics must be server-side.
Exports must be permission-controlled and audited.
```

---

## 6. Recommended Backend Folders

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

Recommended service names:

```text
TouristService
VisitService
ConsentService
CheckinService
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

# Backend Rules

---

## 7. Server-Side Validation Rules

All external inputs must be validated server-side.

Validate:

```text
QR/check-in code
tourist profile input
consent input
visit input
file upload input
certificate generation input
survey input
admin content forms
dashboard filters
export filters
cron/job requests
```

Use:

```text
Zod or equivalent
```

Do not rely only on:

```text
HTML required attributes
client-side validation
hidden fields
localStorage
```

---

## 8. Authentication Rules

Admin backend endpoints must require authentication.

Rules:

```text
Anonymous user cannot access admin APIs.
Admin session must be verified server-side.
Admin user must exist in admin_users table.
Inactive admin must be blocked.
Guest tourist identity must not be treated as admin identity.
```

Protected APIs include:

```text
/api/admin/*
/api/dashboard/*
/api/exports/*
/api/audit/*
/api/jobs/*
```

---

## 9. Authorization Rules

Permissions must be checked server-side.

Required roles:

```text
super_admin
admin
viewer
```

Rules:

```text
viewer is read-only
viewer cannot mutate content
viewer cannot export detailed data
admin can manage tourism content
admin cannot manage users/roles unless permitted
super_admin can manage users/roles
```

Do not:

```text
trust role from localStorage
trust permission data from browser
only hide buttons in UI
```

---

## 10. Tourist Ownership Rules

Tourist APIs must verify ownership.

Check ownership before:

```text
photo upload to visit
certificate generation for visit
survey submit for visit
passport access
certificate download/access
photo access
```

Do not trust:

```text
tourist_id from localStorage
visit_id from hidden input
certificate_id from URL without ownership check
```

Safe failure:

```text
403 FORBIDDEN
or 404 NOT_FOUND
```

Do not reveal unnecessary details about another tourist's resource.

---

## 11. Guest Identity Rules

Tourists can use the system without login.

Rules:

```text
Guest identity can be represented by anonymous_device provider.
Guest token/session id must be random.
Guest token/session id must be validated server-side.
Returning guest can reuse tourist profile.
Guest flow must work without LINE.
Foreign/non-LINE tourists must complete core flow.
```

Do not:

```text
require LINE to create certificate
require email to create certificate
trust guest token as admin identity
```

---

# Service Result and Error Handling

---

## 12. Service Result Pattern

Use a consistent result pattern.

Recommended:

```ts
type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };
```

Service errors should include:

```text
code
message
fieldErrors optional
status optional
```

---

## 13. Error Code Rules

Use stable error codes.

Examples:

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
CERTIFICATE_TEMPLATE_NOT_FOUND
CERTIFICATE_ALREADY_EXISTS
STAMP_ALREADY_EARNED
SURVEY_ALREADY_SUBMITTED
EXPORT_TOO_LARGE
INTERNAL_ERROR
```

---

## 14. Safe Error Rules

User-facing/API errors must not include:

```text
stack trace
SQL query
SQLSTATE raw details
raw Supabase error object
service role key
database URL
storage private path unless safe
provider_user_id
guest token
LINE token
signed URL in logs
```

Log internal details server-side only when safe and sanitized.

---

# Public and Tourist Backend

---

## 15. Public Attraction Backend

Requirements:

```text
return only published active attractions
return safe public fields
return optimized media references
exclude admin notes
exclude draft fields
exclude private storage paths
handle not found safely
```

---

## 16. QR / Check-in Backend

Requirements:

```text
resolve active check-in code
detect invalid code
detect inactive code
detect expired code
verify attraction is active/published where relevant
verify photo spot active if linked
return safe attraction/photo spot context
record funnel event if implemented
```

Critical rules:

```text
QR scan is not a visit.
QR scan must not create full tourist profile.
QR response must not expose admin/private fields.
```

---

## 17. Tourist Profile + Consent Backend

Requirements:

```text
validate display name
validate origin country/province
validate age group
validate consent
create or reuse tourist
create or reuse tourist identity
create visit
create consent record
use transaction where appropriate
handle duplicate identity safely
return safe next-step data
```

Privacy rules:

```text
do not require email
do not require LINE
do not require phone
do not accept national ID
do not accept full address
do not accept exact birthdate
```

---

## 18. Photo Upload Backend

Requirements:

```text
verify visit ownership
validate MIME type
validate file size
reject SVG tourist upload
reject PDF/HTML/JS
generate storage path server-side
store in private/controlled bucket
insert visit_photos metadata
handle storage failure
cleanup file if metadata insert fails where practical
record photo_uploaded funnel event if implemented
return safe preview/access info
```

Do not:

```text
use original filename as final path
include personal data in path
make bucket public to fix access
store base64 in database
store signed URL permanently
```

---

## 19. Certificate Backend

Requirements:

```text
verify visit ownership
verify photo belongs to visit
verify template exists and active
generate/store certificate file
create certificate record
update visit completion status
award stamp
handle duplicate generation idempotently
handle duplicate stamp gracefully
record certificate_generated funnel event
return safe download/access info
```

Certificate must not include:

```text
email
LINE ID
internal tourist ID
phone
national ID
full address
```

---

## 20. Stamp / Passport Backend

Requirements:

```text
award stamp after certificate where applicable
enforce one stamp per tourist-attraction
allow repeat visits
return passport for current tourist only
return stamps grouped or sorted cleanly
exclude provider_user_id and guest token
handle already-earned state as non-fatal
```

---

## 21. Survey Backend

Requirements:

```text
verify visit ownership
validate scores 1-5
allow optional/null answers
validate spending range
validate travel behavior references
limit optional comment length
store satisfaction
store expense
store travel behavior
prevent/update duplicate survey according to policy
record survey_completed funnel event if implemented
```

Rules:

```text
survey optional
certificate not blocked by survey
missing satisfaction = null, not zero
spending is range-based estimate, not revenue
raw comments restricted
```

---

# Admin Backend

---

## 22. Admin Attraction Backend

Requirements:

```text
require authentication
require attraction permission
validate input
enforce unique slug
create/update attraction
publish/unpublish
deactivate
avoid unsafe hard delete
audit sensitive actions
return safe responses
```

---

## 23. Admin Photo Spot Backend

Requirements:

```text
require authentication
require permission
validate input
verify attraction exists
create/update/deactivate photo spot
ensure inactive spot unavailable publicly
audit actions
```

---

## 24. Admin Check-in Code Backend

Requirements:

```text
require authentication
require permission
validate code
enforce unique code
verify attraction exists
verify photo spot belongs to attraction
handle starts_at/ends_at
activate/deactivate
ensure deactivated code unavailable publicly
audit actions
```

---

## 25. Admin Media Backend

Requirements:

```text
require authentication
require media permission
validate file type/size
reject unsafe file types
generate storage path
store metadata
audit upload/update/delete
```

---

# Dashboard Backend

---

## 26. Dashboard Service Rules

Dashboard services must:

```text
validate filters
calculate metrics server-side
return aggregated data only
exclude personal identifiers
handle null/zero correctly
include counts/denominators where needed
use indexes/date filters
return data limitations where useful
```

Critical metric rules:

```text
QR scans are not visits.
Tourist profiles are not verified unique people.
Estimated spending is not revenue.
Missing satisfaction is null/No data, not zero.
Zero denominator returns null/No data.
Average satisfaction ignores null.
```

---

## 27. Dashboard Filter Rules

Validate:

```text
date range
province id
attraction id
origin filters
age group
transport mode
travel purpose
satisfaction score range
```

Rules:

```text
invalid filters rejected
province-attraction mismatch handled
large date ranges handled safely
timezone behavior consistent
```

---

# Export Backend

---

## 28. Export Service Rules

Exports must:

```text
require authentication
require permission
validate filters
use safe column whitelist
respect dashboard/date filters
enforce row limits
generate safe CSV
preserve Thai text
escape commas/quotes/newlines
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
raw comments unless permission
```

---

## 29. Export Audit Rules

Audit export with:

```text
actor
export_type
filters
row_count
privacy_level
result
timestamp
```

Do not audit:

```text
full exported rows
secrets
signed URLs
raw private tokens
```

---

# Storage Backend

---

## 30. Storage Adapter Rules

Centralize:

```text
bucket constants
path generation
file validation
upload
delete
signed URL generation
metadata helpers
```

Rules:

```text
private buckets remain private
signed URLs short-lived
signed URLs not stored permanently
paths contain no personal data
storage errors normalized
```

---

## 31. Bucket Rules

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

---

# Audit and Jobs

---

## 32. Audit Service Rules

Audit:

```text
exports
role/user changes
attraction publish/deactivate
check-in code create/deactivate
admin media changes
official data import
anonymization/deletion
sensitive denied attempts where designed
```

Audit logs must be sanitized.

---

## 33. Background Job Rules

If implemented:

```text
cron endpoints must be protected
summary refresh jobs idempotent
export cleanup safe
orphan file cleanup safe
job errors logged safely
```

Do not expose cron endpoints publicly without secret/platform protection.

---

# Backend Testing Rules

---

## 34. Required Unit Tests

Recommended:

```text
validation schemas
permission helpers
ownership helpers
file validation
storage path generation
dashboard formulas
CSV escaping
error mapping
```

---

## 35. Required Integration Tests

Recommended:

```text
QR resolution
tourist profile + visit + consent
photo upload metadata/storage
certificate generation
stamp duplicate prevention
survey submission
admin CMS permission checks
dashboard metrics
export privacy
audit logs
```

---

## 36. Required Security Tests

Recommended:

```text
anonymous admin access blocked
viewer mutation blocked
viewer export blocked
tourist ownership violation blocked
invalid file types rejected
private storage not public
export excludes identifiers
service role not exposed
safe errors
```

---

# Backend Task Prompt Template

---

## 37. Standard Backend Task Prompt

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Describe backend task.]

Context:
[Explain why this backend feature matters.]

Read first:
- CODEX_MAIN_PROMPT.md
- prompts/CODEX_BACKEND_PROMPT.md
- docs/backend/BACKEND_REQUIREMENTS.md
- docs/backend/API_DESIGN_GUIDELINES.md
- docs/backend/VALIDATION_RULES.md
- docs/backend/ERROR_HANDLING.md
- docs/security/SECURITY_REQUIREMENTS.md
- checklists/BACKEND_CHECKLIST.md
- checklists/SECURITY_PDPA_CHECKLIST.md
- [add task-specific docs]

Requirements:
- [List business/backend requirements.]
- Add server-side validation.
- Add auth/permission/ownership checks as relevant.
- Use service/repository structure.
- Return safe errors.
- Add audit logging if sensitive.
- Add tests where practical.

Security/Privacy:
- Do not expose service role key.
- Do not trust frontend role/tourist_id.
- Do not expose private identifiers.
- Do not return raw errors.
- Do not weaken RLS/storage privacy.

Validation:
- Run relevant tests/commands if available.

Do not:
- Do not put business logic only in UI.
- Do not skip permission checks.
- Do not skip ownership checks.
- Do not store base64 images in DB.
- Do not store signed URLs permanently.

Completion response:
Summary
Files changed
Validation
Security/privacy notes
Risks / Notes
Next suggested task
```

---

# Backend Review Checklist

---

## 38. Before Accepting Backend Work

Check:

```text
[ ] Input validation server-side.
[ ] Auth checks server-side.
[ ] Permission checks server-side.
[ ] Tourist ownership checks server-side.
[ ] Business logic in service layer.
[ ] DB queries typed/safe.
[ ] Storage access safe.
[ ] Errors safe.
[ ] Audit logs for sensitive actions.
[ ] Tests added where practical.
[ ] No secrets exposed.
```

---

## 39. Critical Backend Blockers

Block if:

```text
service role key in frontend
anonymous can access admin APIs
viewer can mutate/export
tourist ownership bypass
file upload accepts unsafe files
private files public unintentionally
export includes identifiers by default
dashboard metric rules broken
raw database errors returned
consent not enforced
```

---

## 40. Backend Completion Response Format

Codex should respond:

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

## 41. Final Backend Rule

The backend is the authority.

If the backend does not enforce validation, ownership, permissions, privacy, storage safety, and metric definitions, the system is not production-ready.
