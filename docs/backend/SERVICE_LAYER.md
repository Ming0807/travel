# SERVICE_LAYER.md

## 1. Document Purpose

This document defines the service layer architecture for the **Southern Border Tourism Data & Intelligence Platform**.

The service layer is where backend business rules live.

It prevents business logic from being scattered across:

```text
React components
page.tsx files
API route handlers
server actions
database triggers only
```

This document should guide developers and AI coding agents when implementing backend logic.

---

## 2. Service Layer Mission

The service layer mission is:

```text
Centralize business rules so the platform remains correct, secure, testable, and maintainable.
```

The service layer must protect:

- tourist data quality
- visit record integrity
- QR/check-in rules
- photo upload rules
- certificate generation rules
- duplicate stamp prevention
- survey data consistency
- admin authorization
- dashboard metric correctness
- export privacy rules

---

## 3. Why Service Layer Is Required

This platform is not a simple CRUD app.

It includes workflows such as:

```text
QR code resolution
guest identity reuse
tourist profile creation
visit creation
photo upload
certificate generation
stamp award
survey submission
dashboard aggregation
privacy-safe export
admin content management
```

Each workflow has business rules.

If those rules are placed directly in UI or route handlers, the system becomes fragile and hard to maintain.

---

## 4. Architecture Position

Recommended backend structure:

```text
Frontend UI
    |
Server Action / API Route Handler
    |
Service Layer
    |
Repository / Query Layer
    |
Database / Storage / External APIs
```

The route handler should coordinate HTTP details.

The service layer should coordinate business rules.

The repository/query layer should coordinate database operations.

---

## 5. Service Layer Responsibilities

The service layer is responsible for:

```text
business rule enforcement
workflow orchestration
input normalization
permission checks
transaction coordination
idempotency checks
error mapping
calling repositories
calling storage utilities
returning typed results
```

The service layer is not responsible for:

```text
rendering UI
styling components
building SQL strings in UI
holding React state
directly showing messages to users
```

---

## 6. Recommended Service Files

Recommended files:

```text
server/services/checkin-service.ts
server/services/tourist-service.ts
server/services/visit-service.ts
server/services/photo-service.ts
server/services/certificate-service.ts
server/services/stamp-service.ts
server/services/survey-service.ts
server/services/passport-service.ts
server/services/admin-attraction-service.ts
server/services/admin-photo-spot-service.ts
server/services/admin-checkin-code-service.ts
server/services/dashboard-service.ts
server/services/export-service.ts
server/services/official-data-import-service.ts
server/services/audit-service.ts
server/services/auth-service.ts
```

MVP can start with fewer files, but domain boundaries should remain clear.

---

## 7. Service Result Pattern

Use a consistent result pattern.

```ts
export type ServiceResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
        status?: number;
      };
    };
```

Benefits:

- predictable route handler behavior
- consistent UI error display
- easier testing
- no raw database errors leaked

---

## 8. Error Code Standards

Use stable error codes.

Examples:

```text
INVALID_INPUT
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
QR_CODE_INVALID
QR_CODE_INACTIVE
QR_CODE_EXPIRED
ATTRACTION_UNAVAILABLE
PHOTO_SPOT_UNAVAILABLE
TOURIST_NOT_FOUND
VISIT_NOT_FOUND
PHOTO_INVALID_TYPE
PHOTO_TOO_LARGE
UPLOAD_FAILED
CERTIFICATE_ALREADY_EXISTS
CERTIFICATE_GENERATION_FAILED
STAMP_ALREADY_EARNED
SURVEY_ALREADY_SUBMITTED
DUPLICATE_SLUG
DUPLICATE_CHECKIN_CODE
EXPORT_FORBIDDEN
INTERNAL_ERROR
```

Do not return raw SQL or storage errors to the frontend.

---

## 9. Service Input Validation

Service methods should receive already parsed input where possible, but they must still protect core rules.

Recommended layers:

```text
API/action schema validation
service business validation
repository/database constraints
```

Example:

```text
API validates visitDate is a date.
Service validates attraction context is valid.
Database validates foreign key relationships.
```

---

## 10. Repository Layer Boundary

Services should call repositories for data operations.

Example:

```ts
const checkinCode = await checkinRepository.findByCode(code);
```

Repository handles:

```text
database query
select fields
joins
pagination
simple inserts/updates
```

Service handles:

```text
is this code usable?
should this action be allowed?
what workflow comes next?
what error should be returned?
```

---

## 11. Transaction Strategy

Some workflows should be transactional.

Important workflows:

```text
create tourist + identity + consent
create visit + funnel event update
generate certificate + update visit + award stamp
submit survey + update visit status
admin deactivate + audit log
export action + audit log
```

If using Supabase client where full multi-step transactions are difficult, consider:

```text
PostgreSQL RPC functions
database transactions in server environment
careful compensation logic
idempotent operations
database constraints
```

Post-certificate survey submission uses the
`submit_post_certificate_survey` PostgreSQL RPC. Visit behavior, expense,
satisfaction, completion status, and the completion funnel event commit or roll
back together. `visit_expenses.visit_id` is unique and the RPC uses
`ON CONFLICT (visit_id) DO UPDATE` for retry-safe edits.

---

## 12. Idempotency Strategy

Idempotency prevents duplicate records from double clicks, retries, and refreshes.

Critical operations:

```text
create tourist identity
create visit
upload photo metadata
generate certificate
award stamp
submit survey
export job
```

MVP minimum:

```text
disable submit buttons
use database unique constraints
check existing records before creating new ones
map duplicate errors to friendly results
```

Production:

```text
idempotency_key table
session-based workflow keys
request deduplication
```

---

## 13. CheckinService

## 13.1 Purpose

Handles QR/check-in code resolution and QR landing business rules.

File:

```text
server/services/checkin-service.ts
```

## 13.2 Main Methods

```ts
resolveCheckinCode(code: string): Promise<ServiceResult<CheckinContext>>
recordFunnelEvent(input: FunnelEventInput): Promise<ServiceResult<void>>
validateCheckinContext(input: CheckinContextInput): Promise<ServiceResult<CheckinContext>>
```

## 13.3 Business Rules

`resolveCheckinCode` must check:

```text
code exists
code is active
starts_at <= now if starts_at exists
ends_at >= now if ends_at exists
linked attraction exists
linked attraction is active
linked attraction is published or allowed for check-in
linked photo spot is active if photo_spot_id exists
```

## 13.4 Safe Return Data

Return only safe public data:

```text
checkinCodeId
attractionId
photoSpotId
attractionName
photoSpotName
provinceName
districtName
heroImageUrl
shortDescription
```

Do not return:

```text
admin notes
private storage paths
internal secrets
unpublished data unless allowed by rule
```

---

## 14. TouristService

## 14.1 Purpose

Handles tourist profile, identity, guest recognition, and consent.

File:

```text
server/services/tourist-service.ts
```

## 14.2 Main Methods

```ts
findTouristByIdentity(provider: string, providerUserId: string): Promise<ServiceResult<TouristProfile>>
createOrReuseGuestTourist(input: TouristProfileInput): Promise<ServiceResult<TouristProfileResult>>
linkIdentityToTourist(input: LinkIdentityInput): Promise<ServiceResult<void>>
recordConsent(input: ConsentInput): Promise<ServiceResult<void>>
getReturningTouristProfile(input: ReturningTouristInput): Promise<ServiceResult<ReturningTouristProfile>>
```

## 14.3 Business Rules

Tourist service must enforce:

```text
guest token is random and non-personal
tourist identity uniqueness
LINE/email identity optional
display name required for certificate
origin country/province rule
age group controlled values
consent must be true before saving required profile
do not create duplicate tourist if identity already exists
```

## 14.4 Identity Rules

Identity table:

```text
tourist_identities
```

Unique constraint:

```text
unique(provider, provider_user_id)
```

Supported providers:

```text
anonymous_device
line
email
google future
```

---

## 15. VisitService

## 15.1 Purpose

Handles visit creation, validation, lifecycle, and travel behavior.

File:

```text
server/services/visit-service.ts
```

## 15.2 Main Methods

```ts
createVisit(input: CreateVisitInput): Promise<ServiceResult<VisitResult>>
getVisitForTourist(input: GetVisitInput): Promise<ServiceResult<VisitDetail>>
updateVisitCompletionStatus(input: UpdateVisitStatusInput): Promise<ServiceResult<void>>
updateTravelBehavior(input: TravelBehaviorInput): Promise<ServiceResult<void>>
detectPossibleDuplicateVisit(input: CreateVisitInput): Promise<ServiceResult<DuplicateCheckResult>>
```

## 15.3 Business Rules

Visit service must enforce:

```text
tourist exists
attraction exists
photo spot belongs to attraction if provided
check-in code matches attraction/photo spot if provided
visit_date is valid
completion_status is controlled
repeat visits are allowed
QR scans alone are not completed visits
```

## 15.4 Critical Rule

Do not apply this to visits:

```text
unique(tourist_id, attraction_id)
```

That uniqueness belongs to stamps, not visits.

---

## 16. PhotoService

## 16.1 Purpose

Handles tourist photo upload validation, storage, and metadata.

File:

```text
server/services/photo-service.ts
```

## 16.2 Main Methods

```ts
validatePhotoFile(file: FileLike): ServiceResult<ValidatedPhoto>
uploadVisitPhoto(input: UploadVisitPhotoInput): Promise<ServiceResult<VisitPhotoResult>>
replaceVisitPhoto(input: ReplaceVisitPhotoInput): Promise<ServiceResult<VisitPhotoResult>>
getVisitPhoto(input: GetVisitPhotoInput): Promise<ServiceResult<VisitPhoto>>
```

## 16.3 Business Rules

Photo service must enforce:

```text
visit exists
current tourist/session can upload for visit
file type is allowed
file size is allowed
storage path generated server-side
photo metadata stored in visit_photos
photo_uploaded funnel event recorded
visit status updated if appropriate
```

Allowed MIME types:

```text
image/jpeg
image/png
image/webp
```

Recommended max file size:

```text
5 MB
```

## 16.4 Storage Rule

Do not use:

```text
tourist name
email
LINE ID
original filename
```

as storage path.

Use generated random file names.

---

## 17. CertificateService

## 17.1 Purpose

Handles certificate preview data, generation record, storage, and workflow continuation.

File:

```text
server/services/certificate-service.ts
```

## 17.2 Main Methods

```ts
getCertificatePreviewData(input: CertificatePreviewInput): Promise<ServiceResult<CertificatePreviewData>>
generateCertificate(input: GenerateCertificateInput): Promise<ServiceResult<CertificateResult>>
getCertificateByVisit(input: GetCertificateByVisitInput): Promise<ServiceResult<Certificate>>
incrementDownloadCount(input: DownloadCertificateInput): Promise<ServiceResult<void>>
```

## 17.3 Business Rules

Certificate service must enforce:

```text
visit exists
photo belongs to visit
template exists and is active
current tourist/session can generate for visit
no private identity data on certificate
avoid duplicate certificate records
update visit status to certificate_generated
record certificate_generated funnel event
call StampService.awardStampForVisit
```

## 17.4 Idempotency Rule

MVP recommendation:

```text
one active certificate per visit
```

If certificate already exists, return existing record unless regeneration is explicitly supported.

---

## 18. StampService

## 18.1 Purpose

Handles digital stamp assignment and duplicate prevention.

File:

```text
server/services/stamp-service.ts
```

## 18.2 Main Methods

```ts
awardStampForVisit(visitId: number): Promise<ServiceResult<StampAwardResult>>
getTouristStamps(touristId: number): Promise<ServiceResult<TouristStamp[]>>
hasTouristEarnedStamp(input: StampCheckInput): Promise<ServiceResult<boolean>>
```

## 18.3 Business Rules

Stamp service must enforce:

```text
visit exists
tourist exists
attraction exists
active stamp definition exists
one stamp per tourist per attraction
repeat visits still allowed
duplicate stamp is not fatal
```

Required database constraint:

```text
unique(tourist_id, attraction_id)
```

## 18.4 Return Statuses

```text
earned
already_earned
no_stamp_available
failed
```

Certificate flow should continue if stamp is already earned or no stamp exists.

---

## 19. PassportService

## 19.1 Purpose

Handles tourist passport view and stamp progress.

File:

```text
server/services/passport-service.ts
```

## 19.2 Main Methods

```ts
getPassportByTourist(input: PassportInput): Promise<ServiceResult<PassportView>>
getPassportByGuestToken(guestToken: string): Promise<ServiceResult<PassportView>>
getProvinceProgress(touristId: number): Promise<ServiceResult<ProvinceProgress[]>>
```

## 19.3 Business Rules

Passport service must enforce:

```text
tourist can only access own passport
guest token maps to tourist identity
do not expose provider_user_id
show guest warning if only anonymous identity exists
```

---

## 20. SurveyService

## 20.1 Purpose

Handles post-certificate survey, travel behavior, expense, and satisfaction.

File:

```text
server/services/survey-service.ts
```

## 20.2 Main Methods

```ts
startSurvey(input: StartSurveyInput): Promise<ServiceResult<void>>
submitPostCertificateSurvey(input: SurveySubmitInput): Promise<ServiceResult<SurveySubmitResult>>
getSurveyByVisit(input: GetSurveyInput): Promise<ServiceResult<SurveyDetail>>
```

## 20.3 Business Rules

Survey service must enforce:

```text
visit exists
current tourist/session can submit for visit
survey is optional
controlled values are valid
scores are 1-5
group size valid
comment length limited
one survey per visit
visit status updated to survey_completed
survey_completed funnel event recorded
```

## 20.4 Missing Data Rule

Do not convert missing scores to zero.

Null means not answered.

---

## 21. AdminAttractionService

## 21.1 Purpose

Handles admin attraction CRUD, publishing, deactivation, and validation.

File:

```text
server/services/admin-attraction-service.ts
```

## 21.2 Main Methods

```ts
listAttractions(filters: AdminAttractionFilters): Promise<ServiceResult<PaginatedResult<AttractionAdminRow>>>
createAttraction(input: AttractionFormInput, actor: AdminActor): Promise<ServiceResult<AttractionResult>>
updateAttraction(input: UpdateAttractionInput, actor: AdminActor): Promise<ServiceResult<AttractionResult>>
publishAttraction(id: number, actor: AdminActor): Promise<ServiceResult<void>>
unpublishAttraction(id: number, actor: AdminActor): Promise<ServiceResult<void>>
deactivateAttraction(id: number, actor: AdminActor): Promise<ServiceResult<void>>
```

## 21.3 Business Rules

Admin attraction service must enforce:

```text
admin permission required
slug unique
required fields valid
coordinates valid
deactivate instead of hard delete
audit log important changes
publishing warnings when content incomplete
```

---

## 22. AdminPhotoSpotService

## 22.1 Purpose

Handles photo spot management.

Main methods:

```ts
listPhotoSpots(filters): Promise<ServiceResult<PaginatedResult<PhotoSpotAdminRow>>>
createPhotoSpot(input, actor): Promise<ServiceResult<PhotoSpotResult>>
updatePhotoSpot(input, actor): Promise<ServiceResult<PhotoSpotResult>>
deactivatePhotoSpot(id, actor): Promise<ServiceResult<void>>
```

Business rules:

```text
photo spot must belong to attraction
spot name required
inactive spots hidden from public flow
do not hard delete if historical visits exist
audit important changes
```

---

## 23. AdminCheckinCodeService

## 23.1 Purpose

Handles QR/check-in code management.

Main methods:

```ts
listCheckinCodes(filters): Promise<ServiceResult<PaginatedResult<CheckinCodeAdminRow>>>
createCheckinCode(input, actor): Promise<ServiceResult<CheckinCodeResult>>
updateCheckinCode(input, actor): Promise<ServiceResult<CheckinCodeResult>>
deactivateCheckinCode(id, actor): Promise<ServiceResult<void>>
```

Business rules:

```text
code unique
code URL-safe
attraction required
photo spot belongs to attraction
starts_at before ends_at
deactivation preserves history
audit important changes
```

---

## 24. DashboardService

## 24.1 Purpose

Handles dashboard metric calculation and aggregation.

File:

```text
server/services/dashboard-service.ts
```

## 24.2 Main Methods

```ts
getExecutiveMetrics(filters: DashboardFilters): Promise<ServiceResult<ExecutiveMetrics>>
getVisitsByProvince(filters: DashboardFilters): Promise<ServiceResult<ChartData>>
getVisitsByAttraction(filters: DashboardFilters): Promise<ServiceResult<ChartData>>
getTouristOriginDistribution(filters: DashboardFilters): Promise<ServiceResult<ChartData>>
getTravelBehaviorMetrics(filters: DashboardFilters): Promise<ServiceResult<TravelBehaviorMetrics>>
getExpenseMetrics(filters: DashboardFilters): Promise<ServiceResult<ExpenseMetrics>>
getSatisfactionMetrics(filters: DashboardFilters): Promise<ServiceResult<SatisfactionMetrics>>
getFunnelMetrics(filters: DashboardFilters): Promise<ServiceResult<FunnelMetrics>>
```

## 24.3 Business Rules

Dashboard service must enforce:

```text
filters valid
date range applied
private identity data excluded
missing satisfaction not treated as zero
spending labeled as estimated
QR scans not counted as completed visits
metric definitions followed
```

## 24.4 Performance Rule

MVP can use raw queries with indexes.

Production should move heavy queries to:

```text
summary tables
materialized views
dashboard cache
```

---

## 25. ExportService

## 25.1 Purpose

Handles privacy-safe data export.

File:

```text
server/services/export-service.ts
```

## 25.2 Main Methods

```ts
exportVisits(input: ExportInput, actor: AdminActor): Promise<ServiceResult<ExportFileResult>>
exportSatisfaction(input: ExportInput, actor: AdminActor): Promise<ServiceResult<ExportFileResult>>
exportExpenses(input: ExportInput, actor: AdminActor): Promise<ServiceResult<ExportFileResult>>
exportDashboardSummary(input: ExportInput, actor: AdminActor): Promise<ServiceResult<ExportFileResult>>
```

## 25.3 Business Rules

Export service must enforce:

```text
export permission required
filters valid
row limit if needed
privacy-safe fields by default
sensitive fields excluded unless high permission
export action audit logged
CSV uses UTF-8
missing data handled correctly
```

Default export must not include:

```text
email
LINE user ID
device token
provider_user_id
private photo path
private certificate path
```

---

## 26. OfficialDataImportService

## 26.1 Purpose

Handles future official tourism statistics import.

File:

```text
server/services/official-data-import-service.ts
```

## 26.2 Main Methods

```ts
previewOfficialStatsImport(file, actor): Promise<ServiceResult<ImportPreview>>
confirmOfficialStatsImport(input, actor): Promise<ServiceResult<ImportResult>>
listImportLogs(filters): Promise<ServiceResult<PaginatedResult<ImportLog>>>
linkOfficialAttractionRef(input, actor): Promise<ServiceResult<void>>
```

## 26.3 Business Rules

```text
permission required
source metadata required
CSV validation required
province mapping required
invalid rows not silently imported
local data not overwritten automatically
import logs created
```

MVP can document this without implementing full import.

---

## 27. AuditService

## 27.1 Purpose

Handles audit logging for important admin/system actions.

File:

```text
server/services/audit-service.ts
```

## 27.2 Main Methods

```ts
logAction(input: AuditLogInput): Promise<ServiceResult<void>>
logExport(input: ExportAuditInput): Promise<ServiceResult<void>>
logAdminChange(input: AdminChangeAuditInput): Promise<ServiceResult<void>>
```

## 27.3 Business Rules

Audit logs should include:

```text
actor_user_id
action
entity_type
entity_id
old_values_json
new_values_json
created_at
```

Do not log:

```text
secrets
raw tokens
service role keys
large file content
unnecessary personal data
```

---

## 28. AuthService

## 28.1 Purpose

Handles current user, role, permission, and tourist identity access.

Main methods:

```ts
getCurrentAdminUser()
requireAdmin()
requirePermission(permissionKey)
getTouristByGuestToken(guestToken)
verifyTouristVisitAccess(input)
verifyLineIdentity(input)
```

Rules:

```text
do not trust frontend role
do not trust localStorage IDs
server-side permission required
tourist can access only own data
```

---

## 29. Service Method Naming Rules

Use clear verb-based names:

Good:

```text
resolveCheckinCode
createOrReuseGuestTourist
createVisit
uploadVisitPhoto
generateCertificate
awardStampForVisit
submitPostCertificateSurvey
getExecutiveMetrics
exportVisits
```

Avoid vague names:

```text
handleData
processThing
saveAll
doStuff
```

---

## 30. Service Testing Strategy

Each service should have tests for:

```text
happy path
invalid input
missing related record
permission denied
duplicate record
partial failure
edge cases
```

Critical service tests:

```text
CheckinService invalid/inactive QR
TouristService reuse identity
VisitService repeat visits allowed
PhotoService rejects invalid file
CertificateService prevents duplicate certificates
StampService prevents duplicate stamps
SurveyService does not treat missing score as zero
DashboardService calculates visits correctly
ExportService excludes private fields
```

---

## 31. Service Layer Anti-Patterns

Do not:

```text
Put business logic directly in React components.
Put all business logic inside API route handlers.
Duplicate the same validation rule in many places without schema.
Trust client-provided IDs.
Return raw database rows with private fields.
Mix dashboard aggregation into UI charts.
Create tourist on every QR scan.
Create duplicate stamp for same attraction.
Export personal identifiers by default.
```

---

## 32. MVP Service Layer Acceptance Checklist

```text
[ ] CheckinService exists.
[ ] TouristService exists.
[ ] VisitService exists.
[ ] PhotoService exists.
[ ] CertificateService exists.
[ ] StampService exists.
[ ] SurveyService exists.
[ ] DashboardService exists.
[ ] ExportService exists or is planned.
[ ] Admin attraction/check-in services exist.
[ ] Service result pattern is consistent.
[ ] Services validate business rules.
[ ] Services do not expose private data.
[ ] Services map errors safely.
[ ] Services are testable.
```

---

## 33. Final Service Layer Rule

A production system should not depend on UI discipline for correctness.

The service layer is where the platform protects its data, privacy, and business rules.
