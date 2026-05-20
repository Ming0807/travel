# BACKEND_REQUIREMENTS.md

## 1. Document Purpose

This document defines backend requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The backend must support a production-oriented tourism database system for Yala, Pattani, and Narathiwat.

The backend is responsible for:

- data integrity
- business rules
- validation
- authentication and authorization
- secure file handling
- certificate generation support
- dashboard data services
- export services
- audit logging
- privacy protection
- integration readiness

This document should guide backend developers, database designers, and AI coding agents such as Codex.

---

## 2. Backend Mission

The backend mission is:

```text
Protect the quality, security, and reliability of tourism data while supporting a smooth tourist and admin experience.
```

The frontend can provide a good user experience, but the backend must be the source of truth for:

```text
who can do what
what data is valid
which records can be created
which records can be updated
which files can be uploaded
which dashboard metrics are correct
which exports are allowed
```

---

## 3. Recommended Backend Stack

Recommended MVP stack:

```text
Next.js server actions / route handlers
Supabase PostgreSQL
Supabase Auth
Supabase Storage
TypeScript
Zod
```

Recommended architecture:

```text
Frontend UI
    |
Server Actions / API Route Handlers
    |
Service Layer
    |
Repository / Query Layer
    |
Supabase PostgreSQL / Storage
```

Alternative stack if using separate backend:

```text
NestJS
PostgreSQL
Supabase Auth or custom auth
S3-compatible storage
```

For this project, **Next.js + Supabase** is recommended for speed, simplicity, and production readiness with low cost.

---

## 4. Backend Application Areas

Backend must support these areas:

```text
Public attraction content
QR/check-in resolution
Tourist profile and identity
Visit creation and lifecycle
Photo upload metadata and storage
Certificate generation records
Digital stamp/passport
Survey, expense, and satisfaction data
Admin CMS
Dashboard analytics
Report/export
Optional LINE LIFF identity
Official data import future
Audit logging
```

---

## 5. Core Backend Principles

## 5.1 Backend Owns Business Rules

Important rules must not exist only in frontend.

Examples:

```text
check-in code must be active
photo spot must belong to attraction
tourist identity must be unique
visit must link to tourist and attraction
stamp must not duplicate tourist-attraction
survey must link to visit
admin export requires permission
```

These must be enforced server-side and, where possible, database-side.

---

## 5.2 Frontend Validation Is Not Enough

Frontend validation improves UX, but backend validation is required.

Required layers:

```text
frontend validation
server/API validation
database constraints
```

---

## 5.3 Database Is the Source of Truth

The database schema must protect important relationships and constraints.

Backend services should not rely on local state or client-provided assumptions.

---

## 5.4 Secure by Default

Backend must never expose:

```text
Supabase service role key
LINE channel secret
storage credentials
provider_user_id
raw device token
admin-only fields
private storage paths
```

---

## 5.5 Privacy by Design

Backend should collect only necessary data.

Do not add fields simply because they are easy to collect.

Avoid collecting:

```text
national ID
full address
phone number required
date of birth
religion
ethnicity
health data
income
```

---

## 6. Backend Architecture

## 6.1 Route Handler Layer

Responsible for:

```text
HTTP request/response
auth session extraction
input parsing
calling services
returning typed response
```

Should not contain long business logic.

## 6.2 Service Layer

Responsible for:

```text
business rules
orchestration
validation
permission checks
transaction-like workflows
error mapping
```

Examples:

```text
CheckinService
TouristService
VisitService
PhotoService
CertificateService
StampService
SurveyService
DashboardService
ExportService
AdminAttractionService
```

## 6.3 Repository / Query Layer

Responsible for:

```text
database queries
storage metadata access
read models
write operations
```

This layer can be simple for MVP, but query logic should not be scattered across UI.

## 6.4 Validation Layer

Responsible for:

```text
Zod schemas
business validators
input normalization
file validation
filter validation
```

## 6.5 Utility Layer

Responsible for:

```text
date formatting
slug generation
storage path generation
CSV generation
error mapping
language helpers
idempotency helpers
```

---

## 7. Recommended Backend Folder Structure

Example:

```text
src/
  app/
    api/
      checkin/
      tourists/
      visits/
      photos/
      certificates/
      stamps/
      surveys/
      dashboard/
      exports/
      admin/

  server/
    services/
      checkin-service.ts
      tourist-service.ts
      visit-service.ts
      photo-service.ts
      certificate-service.ts
      stamp-service.ts
      survey-service.ts
      dashboard-service.ts
      export-service.ts
      admin-attraction-service.ts

    repositories/
      attraction-repository.ts
      checkin-repository.ts
      tourist-repository.ts
      visit-repository.ts
      photo-repository.ts
      certificate-repository.ts
      stamp-repository.ts
      survey-repository.ts
      dashboard-repository.ts

    schemas/
      checkin-schema.ts
      tourist-schema.ts
      visit-schema.ts
      photo-schema.ts
      certificate-schema.ts
      survey-schema.ts
      admin-schema.ts
      dashboard-schema.ts
      export-schema.ts

    auth/
      require-admin.ts
      require-permission.ts
      get-current-user.ts
      tourist-identity.ts

    storage/
      photo-storage.ts
      certificate-storage.ts
      attraction-media-storage.ts

    utils/
      action-result.ts
      error-mapper.ts
      date-utils.ts
      idempotency.ts
      csv.ts
```

Exact implementation may vary, but separation must remain.

---

## 8. Authentication Requirements

## 8.1 Admin Authentication

Recommended:

```text
Supabase Auth
```

Admin routes and APIs must require authentication.

Protected areas:

```text
/admin/*
/api/admin/*
/api/dashboard/*
/api/exports/*
```

depending on role.

## 8.2 Tourist Authentication

Tourist-facing flow must not require full login.

Supported identity modes:

```text
anonymous_device
line optional
email optional future
```

The backend must support guest identity without making it equivalent to admin authentication.

## 8.3 Optional LINE Identity

LINE identity is optional.

Backend must support provider:

```text
line
```

in:

```text
tourist_identities
```

Do not store LINE ID directly in `tourists`.

---

## 9. Authorization Requirements

## 9.1 Admin Permissions

Backend must check permissions server-side.

Possible permissions:

```text
dashboard.read
attraction.read
attraction.create
attraction.update
attraction.deactivate
photo_spot.read
photo_spot.create
photo_spot.update
checkin_code.read
checkin_code.create
checkin_code.update
visit.read
tourist.read
survey.read
export.create
official_data.import
audit.read
user.manage
role.manage
```

MVP can start with a simplified admin role, but code structure should allow permissions later.

## 9.2 Tourist Authorization

Tourists should only access their own flow data.

Backend must verify:

```text
guest token / identity
visit belongs to tourist
photo belongs to visit
certificate belongs to visit
passport belongs to tourist
```

Do not trust IDs from localStorage without server verification.

---

## 10. Validation Requirements

All API/server actions must validate input.

Required schemas:

```text
resolveCheckinSchema
touristProfileSchema
createVisitSchema
photoUploadSchema
generateCertificateSchema
awardStampSchema
submitSurveySchema
attractionFormSchema
photoSpotFormSchema
checkinCodeFormSchema
dashboardFilterSchema
exportFilterSchema
```

Validation must happen before database writes.

See:

```text
docs/frontend/FORM_VALIDATION.md
```

---

## 11. Check-in Backend Requirements

## 11.1 Resolve Check-in Code

Function:

```text
resolveCheckinCode(code)
```

Must validate:

```text
code exists
code is active
starts_at and ends_at valid
linked attraction exists
linked attraction active
linked photo spot active if present
```

Must return safe public data only:

```text
checkin_code_id
attraction_id
photo_spot_id
attraction name
photo spot name
province
image
language-ready content
```

Must not return:

```text
admin notes
private storage paths
internal secrets
```

## 11.2 Funnel Event

Record:

```text
qr_scanned
landing_viewed
certificate_started
```

Before tourist profile exists, event may have:

```text
tourist_id = null
visit_id = null
session_id = random session
```

---

## 12. Tourist Profile Backend Requirements

## 12.1 Create or Reuse Tourist

Function:

```text
createOrReuseTouristProfile(input)
```

Must:

- validate minimal profile
- check existing identity
- create tourist if needed
- create tourist_identity if needed
- record consent
- return safe tourist profile summary

## 12.2 Identity Lookup

Use:

```text
tourist_identities(provider, provider_user_id)
```

Required unique constraint:

```text
unique(provider, provider_user_id)
```

## 12.3 Consent Logging

Backend must record:

```text
tourist_id
visit_id optional
consent_version
purpose
has_consented
consented_at
source
```

Consent checkbox must not be assumed.

---

## 13. Visit Backend Requirements

## 13.1 Create Visit

Function:

```text
createVisit(input)
```

Must validate:

```text
tourist exists
attraction exists
photo spot belongs to attraction if provided
check-in code maps to same attraction/photo spot if provided
visit_date valid
```

Recommended creation timing:

```text
after minimal tourist/profile form submit
```

Do not create a full tourist visit on QR scan alone.

## 13.2 Visit Status Updates

Function:

```text
updateVisitCompletionStatus(visitId, status)
```

Allowed statuses:

```text
started
minimal_form_completed
photo_uploaded
certificate_generated
survey_completed
abandoned
```

Backend should control transitions.

## 13.3 Duplicate Prevention

Use:

```text
session_id or idempotency key
```

to avoid duplicate visit creation from double submit.

Do not prevent legitimate repeat visits.

---

## 14. Photo Backend Requirements

## 14.1 Upload Photo

Function:

```text
uploadVisitPhoto(visitId, file)
```

Must validate:

```text
visit exists
current tourist/session can upload for visit
file exists
MIME type allowed
file size allowed
storage path generated server-side
```

Allowed MIME types:

```text
image/jpeg
image/png
image/webp
```

Recommended max:

```text
5 MB
```

## 14.2 Storage Path

Backend must generate path.

Recommended:

```text
visit-photos/{year}/{month}/{visit_id}/{random}.{extension}
```

Do not use tourist name or original filename as path.

## 14.3 Database Record

Create:

```text
visit_photos
```

with:

```text
visit_id
storage_path
mime_type
file_size_bytes
approval_status
uploaded_at
```

After success:

```text
record photo_uploaded event
update visit status if appropriate
```

---

## 15. Certificate Backend Requirements

## 15.1 Generate Certificate Record

The backend may not render image itself in MVP if frontend generates image, but backend must still:

- validate visit
- validate photo
- validate template
- upload generated certificate file
- create certificate record
- prevent duplicates
- update visit status
- record funnel event
- trigger stamp award

## 15.2 Certificate Record

Create:

```text
certificates
```

with:

```text
visit_id
template_id
photo_id
certificate_path
generated_at
download_count
```

## 15.3 Idempotency

Avoid duplicate certificate records from double-click.

Recommended MVP:

```text
one active certificate per visit
```

If existing certificate exists, return it or intentionally regenerate.

---

## 16. Stamp Backend Requirements

## 16.1 Award Stamp

Function:

```text
awardStampForVisit(visitId)
```

Must:

- get visit
- get tourist_id and attraction_id
- get active stamp definition
- check if stamp already exists
- create tourist_stamps if not exists
- handle duplicate unique constraint gracefully

Required unique constraint:

```text
unique(tourist_id, attraction_id)
```

## 16.2 Duplicate Stamp Behavior

If already earned:

```text
return already_earned
```

Do not fail certificate flow.

Do not block repeat visit.

---

## 17. Survey Backend Requirements

## 17.1 Submit Survey

Function:

```text
submitPostCertificateSurvey(visitId, input)
```

Must validate:

```text
visit exists
current tourist/session can submit for visit
controlled values are valid
satisfaction scores 1-5
group size valid
spending range valid
comment length valid
```

Must write to:

```text
visits
visit_expenses
satisfaction_surveys
survey_answers optional
```

## 17.2 One Survey per Visit

Recommended:

```text
unique(visit_id)
```

Allow update if tourist resubmits within allowed flow.

## 17.3 Funnel Events

Record:

```text
survey_started
survey_completed
```

---

## 18. Admin CMS Backend Requirements

Admin services must support:

```text
list attractions
create attraction
update attraction
publish/unpublish attraction
deactivate attraction
manage attraction images
manage photo spots
manage check-in codes
list visits
view survey data
```

Admin writes must:

- require authentication
- require permission
- validate input
- preserve historical records
- use deactivate instead of hard delete
- create audit logs for important actions

---

## 19. Dashboard Backend Requirements

Dashboard backend must provide metric services.

Functions:

```text
getExecutiveMetrics(filters)
getVisitsByProvince(filters)
getVisitsByAttraction(filters)
getTouristOriginDistribution(filters)
getTravelBehaviorMetrics(filters)
getExpenseMetrics(filters)
getSatisfactionMetrics(filters)
getFunnelMetrics(filters)
```

Rules:

- validate filters
- use date range
- avoid returning private data
- do not aggregate huge raw data in frontend
- use summary tables later if needed
- handle missing data honestly

Important:

```text
QR scan count is not visit count.
Missing satisfaction is not zero.
Spending range is estimated, not revenue.
```

---

## 20. Export Backend Requirements

Export service must:

- require permission
- validate filters
- generate CSV server-side
- exclude personal identifiers by default
- log export action
- handle large export limits
- return file response safely

Default exports must not include:

```text
email
LINE user ID
device token
provider_user_id
raw photo path
private certificate URL
```

---

## 21. Official Data Import Backend Requirements

MVP can be documentation-only.

Phase 2 backend should support:

```text
CSV upload
row validation
province mapping
import preview
import execution
import logs
error report
official-local comparison queries
```

Do not import official data into local visit tables.

Use:

```text
official_tourism_stats
official_attraction_refs
data_import_logs
```

---

## 22. Audit Logging Requirements

Backend should log important actions.

Actions:

```text
attraction.create
attraction.update
attraction.publish
attraction.unpublish
attraction.deactivate
photo_spot.create
photo_spot.update
checkin_code.create
checkin_code.update
checkin_code.deactivate
data.export
official_data.import
user.role_update
```

Audit log fields:

```text
actor_user_id
action
entity_type
entity_id
old_values_json
new_values_json
created_at
```

Do not log secrets.

---

## 23. File Storage Requirements

Storage buckets:

```text
visit-photos
certificate-files
attraction-media
temp-uploads optional
```

Backend must:

- validate file type
- validate file size
- generate safe storage path
- avoid personal data in paths
- handle upload/database failure
- control public/signed URL strategy

Do not store base64 files in database.

---

## 24. Error Handling Requirements

Backend must map technical errors to user-friendly messages.

Examples:

```text
unique violation checkin_codes.code
-> This check-in code already exists.

unique violation attractions.slug
-> This slug is already used.

unique violation tourist_stamps(tourist_id, attraction_id)
-> You already collected this stamp.

foreign key violation
-> The selected related record is invalid or no longer available.
```

Backend response should not expose:

```text
stack traces
SQLSTATE codes
internal query strings
secrets
```

---

## 25. Action Result Format

Recommended service/action response:

```ts
type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      code?: string;
    };
```

Use typed results consistently.

---

## 26. Transactions and Atomicity

Important workflows:

```text
create tourist + identity + consent
create visit + update funnel event
upload photo + create metadata
generate certificate + update visit + award stamp
submit survey + update visit status
```

Where possible, use transactions or safe compensating logic.

If storage upload succeeds but database insert fails:

- log error
- cleanup orphan file if possible
- return friendly error

---

## 27. Idempotency Requirements

Idempotency is important for:

```text
profile submit
visit creation
photo upload
certificate generation
stamp award
survey submit
export generation
```

MVP minimum:

- disable frontend buttons
- enforce database uniqueness
- handle duplicate insert gracefully

Production:

- idempotency keys for critical operations
- request deduplication

---

## 28. Rate Limiting and Abuse Protection

MVP may have limited protection, but production should consider rate limits for:

```text
QR event creation
photo upload
certificate generation
survey submission
export generation
admin login
```

At minimum, avoid open unlimited upload abuse.

---

## 29. Logging and Monitoring

Backend should log:

```text
unexpected errors
failed uploads
certificate generation failures
export attempts
import failures
permission denials
```

Do not log:

```text
secrets
raw photos
LINE IDs unless necessary
full personal data
```

Future:

```text
error monitoring
performance monitoring
audit dashboard
```

---

## 30. Performance Requirements

## 30.1 Public and Tourist Flow

Backend must keep QR and tourist flow fast.

Rules:

- query only necessary fields
- index check-in codes
- avoid heavy dashboard logic in tourist routes
- use optimized storage access
- avoid blocking third-party calls

## 30.2 Dashboard

Rules:

- use date filters
- use indexes
- avoid sending raw records to frontend for aggregation
- use summary tables/materialized views when data grows

## 30.3 Admin Tables

Rules:

- pagination
- filters
- debounced search
- avoid loading all records

---

## 31. Database Constraint Requirements

Critical constraints:

```text
unique attractions.slug
unique checkin_codes.code
unique tourist_identities(provider, provider_user_id)
unique tourist_stamps(tourist_id, attraction_id)
unique satisfaction_surveys(visit_id) recommended
foreign keys for all relationships
check constraints for statuses and score ranges
```

Backend should align with database constraints.

---

## 32. Environment Variables

Expected environment variables may include:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_LIFF_ID optional
LINE_CHANNEL_ID optional
LINE_CHANNEL_SECRET optional
CERTIFICATE_STORAGE_BUCKET
PHOTO_STORAGE_BUCKET
```

Rules:

- `NEXT_PUBLIC_*` only for safe public values.
- service role key must be server-only.
- LINE secret must be server-only.
- never commit `.env` files.

---

## 33. Security Requirements

Backend must protect:

```text
admin routes
export routes
storage writes
private data reads
identity linking
certificate generation
survey submission
```

Rules:

- validate auth server-side
- validate permissions server-side
- never trust client role
- never trust IDs from localStorage without verification
- use RLS if direct Supabase client access is used
- avoid exposing service role to browser

---

## 34. Privacy Requirements

Backend must enforce:

- minimal personal data collection
- consent logging
- privacy-safe exports
- no direct identity data in dashboards
- retention policy readiness
- anonymization future support

See:

```text
docs/database/DATA_RETENTION_POLICY.md
docs/database/DATA_QUALITY_RULES.md
```

---

## 35. Testing Requirements

Backend tests should cover:

```text
resolve valid QR
reject invalid QR
reject inactive QR
create guest tourist
reuse guest identity
create visit
prevent duplicate visit submit if idempotency used
upload valid photo
reject invalid photo
generate certificate record
prevent duplicate certificate
award new stamp
handle already earned stamp
submit survey
reject invalid survey score
admin create attraction
duplicate slug
duplicate check-in code
dashboard metric calculation
export permission
```

---

## 36. MVP Backend Acceptance Checklist

```text
[ ] Check-in code resolution works.
[ ] Funnel events can be recorded.
[ ] Guest tourist profile creation works.
[ ] Tourist identity uniqueness works.
[ ] Consent logging works.
[ ] Visit creation works.
[ ] Photo upload validation works.
[ ] Photo metadata is saved.
[ ] Certificate record creation works.
[ ] Certificate generation is idempotent enough for MVP.
[ ] Stamp award works.
[ ] Duplicate stamp is handled gracefully.
[ ] Survey submission works.
[ ] Admin attraction CRUD works.
[ ] Admin photo spot/check-in code management works.
[ ] Dashboard services return real metrics.
[ ] Export service is permission-protected.
[ ] Backend validation exists.
[ ] Important database constraints exist.
[ ] Secrets are not exposed.
```

---

## 37. Do Not Do

Do not:

```text
Put all business logic in frontend components.
Trust frontend validation only.
Expose service role key to browser.
Create visit for every QR scan automatically.
Create new tourist for every visit.
Force LINE identity.
Store uploaded files as base64 in database.
Generate duplicate certificate records from double-click.
Apply unique tourist-attraction rule to visits.
Export personal identifiers by default.
Show raw backend errors to tourists.
```

---

## 38. Final Backend Rule

The backend is responsible for data trust.

If the backend allows bad data, the dashboard becomes unreliable and the project fails as a planning system.
