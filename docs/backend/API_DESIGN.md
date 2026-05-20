# API_DESIGN.md

## 1. Document Purpose

This document defines API design standards for the **Southern Border Tourism Data & Intelligence Platform**.

The API layer may be implemented using:

```text
Next.js Route Handlers
Next.js Server Actions
NestJS controllers
Supabase RPC functions
```

For this project, API design means the contract between frontend, backend services, and database.

This document should guide developers and AI coding agents when creating server actions, API routes, request/response types, validation, and error handling.

---

## 2. API Design Mission

The API mission is:

```text
Provide safe, predictable, validated, and well-structured access to platform functionality.
```

APIs must support:

- public attraction browsing
- QR/check-in resolution
- tourist profile creation
- visit creation
- photo upload
- certificate generation
- stamp award
- survey submission
- admin CMS
- dashboard metrics
- report/export
- optional LINE identity
- future official data import

---

## 3. API Style Recommendation

For MVP, use a hybrid approach:

```text
Server Components for simple reads
Server Actions for form mutations
Route Handlers for file upload, export, and public API-like actions
Service Layer for reusable business logic
```

Recommended:

```text
UI -> action/route handler -> service -> repository/database
```

Do not put database logic directly inside UI components.

---

## 4. API Design Principles

## 4.1 Validate Every Input

Every endpoint/action must validate input using schema.

Use:

```text
Zod
```

or equivalent validation.

## 4.2 Return Predictable Responses

Use consistent success/error format.

## 4.3 Do Not Expose Internal Errors

Never expose:

```text
SQLSTATE
stack trace
query details
service role key
storage internals
```

## 4.4 Use Correct Auth Level

Public routes should return only safe public data.

Admin routes must require admin auth and permissions.

Tourist routes must verify guest/identity context.

## 4.5 Keep APIs Purposeful

Do not create one giant endpoint that does everything.

Each API/action should have clear responsibility.

---

## 5. Standard Response Format

Recommended JSON result:

```ts
type ApiResult<T> =
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
      };
    };
```

For server actions, a simpler version is acceptable:

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

Use one consistent style per implementation.

---

## 6. Error Code Naming

Recommended error code style:

```text
UPPER_SNAKE_CASE
```

Examples:

```text
INVALID_INPUT
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
QR_CODE_INVALID
QR_CODE_INACTIVE
ATTRACTION_UNAVAILABLE
VISIT_NOT_FOUND
PHOTO_INVALID_TYPE
PHOTO_TOO_LARGE
CERTIFICATE_GENERATION_FAILED
STAMP_ALREADY_EARNED
DUPLICATE_CHECKIN_CODE
DUPLICATE_SLUG
EXPORT_FORBIDDEN
INTERNAL_ERROR
```

---

## 7. HTTP Status Code Guidance

If using REST route handlers:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
413 Payload Too Large
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

Examples:

- invalid form input -> 422
- unauthenticated admin -> 401
- no permission -> 403
- duplicate slug -> 409
- file too large -> 413
- unexpected failure -> 500

---

## 8. Public API Routes

Public routes do not require admin login.

They must return safe public data only.

Recommended routes:

```text
GET /api/public/attractions
GET /api/public/attractions/[slug]
GET /api/checkin/[code]
POST /api/funnel-events
```

Depending on Next.js server component design, attraction reads may not need API routes.

---

## 9. Public Attractions API

## 9.1 List Attractions

Route:

```text
GET /api/public/attractions
```

Query params:

```text
search
province_id
attraction_type_id
page
page_size
language
```

Returns:

```text
published active attractions only
```

Response data:

```ts
type PublicAttractionListItem = {
  attractionId: number;
  slug: string;
  name: string;
  provinceName: string;
  districtName?: string;
  attractionTypeName?: string;
  shortDescription?: string;
  coverImageUrl?: string;
};
```

Rules:

- do not return unpublished attractions
- do not return admin notes
- do not return private storage paths

---

## 9.2 Attraction Detail

Route:

```text
GET /api/public/attractions/[slug]
```

Returns:

```text
published active attraction detail
```

Response data:

```ts
type PublicAttractionDetail = {
  attractionId: number;
  slug: string;
  name: string;
  provinceName: string;
  districtName?: string;
  attractionTypeName?: string;
  shortDescription?: string;
  description?: string;
  history?: string;
  latitude?: number;
  longitude?: number;
  images: AttractionImageDto[];
  media360: Attraction360Dto[];
  photoSpots: PublicPhotoSpotDto[];
  certificateAvailable: boolean;
};
```

---

## 10. Check-in API

## 10.1 Resolve Check-in Code

Route:

```text
GET /api/checkin/[code]
```

Purpose:

Resolve QR code and return safe landing data.

Validation:

```text
code required
code URL-safe
code exists
code active
date window valid
attraction active
photo spot active if linked
```

Success response:

```ts
type CheckinResolveResponse = {
  checkinCodeId: number;
  code: string;
  attractionId: number;
  photoSpotId?: number;
  attractionName: string;
  photoSpotName?: string;
  provinceName: string;
  districtName?: string;
  heroImageUrl?: string;
  shortDescription?: string;
  languageDefaults: {
    suggestedLanguage: "th" | "en";
  };
};
```

Error cases:

```text
QR_CODE_INVALID
QR_CODE_INACTIVE
QR_CODE_EXPIRED
ATTRACTION_UNAVAILABLE
PHOTO_SPOT_UNAVAILABLE
```

Do not create visit here.

---

## 10.2 Record Funnel Event

Route:

```text
POST /api/funnel-events
```

Purpose:

Record non-sensitive funnel event.

Body:

```ts
type FunnelEventInput = {
  sessionId: string;
  eventName:
    | "qr_scanned"
    | "landing_viewed"
    | "certificate_started"
    | "minimal_form_completed"
    | "photo_uploaded"
    | "certificate_generated"
    | "survey_started"
    | "survey_completed"
    | "passport_saved";
  attractionId?: number;
  photoSpotId?: number;
  checkinCodeId?: number;
  visitId?: number;
  touristId?: number;
  metadata?: Record<string, unknown>;
};
```

Rules:

- validate eventName
- avoid personal data in metadata
- rate limit in production
- do not trust touristId blindly

---

## 11. Tourist Profile APIs

## 11.1 Create or Reuse Tourist Profile

Route:

```text
POST /api/tourists/profile
```

Purpose:

Create or reuse tourist profile with guest identity.

Body:

```ts
type TouristProfileInput = {
  guestToken: string;
  displayName: string;
  originCountryId?: number;
  originProvinceId?: number;
  ageGroup: string;
  preferredLanguage: "th" | "en";
  visitDate: string;
  checkinCodeId: number;
  attractionId: number;
  photoSpotId?: number;
  sessionId: string;
  hasConsented: true;
};
```

Response:

```ts
type TouristProfileResponse = {
  touristId: number;
  visitId: number;
  displayName: string;
  returningTourist: boolean;
};
```

Backend actions:

```text
validate profile
resolve or create tourist
create/update anonymous_device identity
record consent
create visit
record minimal_form_completed event
```

---

## 11.2 Get Returning Tourist

Route:

```text
GET /api/tourists/me?guestToken=...
```

or use server action/cookie.

Purpose:

Find returning guest profile.

Response:

```ts
type ReturningTouristResponse = {
  touristId: number;
  displayName: string;
  originCountryId?: number;
  originProvinceId?: number;
  ageGroup?: string;
  preferredLanguage?: "th" | "en";
  stampCount: number;
};
```

Rules:

- do not return other tourists
- guest token must map through tourist_identities
- do not return provider_user_id

---

## 12. Visit APIs

## 12.1 Create Visit

This can be part of profile submission.

Standalone route if needed:

```text
POST /api/visits
```

Body:

```ts
type CreateVisitInput = {
  touristId: number;
  attractionId: number;
  photoSpotId?: number;
  checkinCodeId?: number;
  visitDate: string;
  sessionId?: string;
};
```

Rules:

- verify tourist/session
- validate attraction context
- prevent accidental duplicate submit
- do not block legitimate repeat visits

---

## 12.2 Update Travel Behavior

Route:

```text
PATCH /api/visits/[visitId]/travel-behavior
```

Body:

```ts
type TravelBehaviorInput = {
  travelCompanionId?: number;
  groupSize?: number;
  transportModeId?: number;
  travelPurposeId?: number;
  overnightStatus?: "same_day" | "overnight" | "unknown" | "prefer_not_to_answer";
  nights?: number;
};
```

This may be included in survey submit instead.

---

## 13. Photo Upload API

## 13.1 Upload Visit Photo

Route:

```text
POST /api/photos/upload
```

Content type:

```text
multipart/form-data
```

Fields:

```text
visitId
file
sessionId optional
```

Validation:

```text
visit exists
current tourist/session owns visit
file type allowed
file size allowed
```

Response:

```ts
type PhotoUploadResponse = {
  photoId: number;
  visitId: number;
  previewUrl: string;
  mimeType: string;
  fileSizeBytes: number;
};
```

Allowed MIME types:

```text
image/jpeg
image/png
image/webp
```

Error codes:

```text
PHOTO_REQUIRED
PHOTO_INVALID_TYPE
PHOTO_TOO_LARGE
VISIT_NOT_FOUND
UPLOAD_FAILED
```

---

## 14. Certificate APIs

## 14.1 Get Certificate Preview Data

Route:

```text
GET /api/certificates/preview?visitId=...
```

or server action.

Returns:

```ts
type CertificatePreviewData = {
  visitId: number;
  touristDisplayName: string;
  attractionName: string;
  provinceName?: string;
  visitDateLabel: string;
  photoUrl: string;
  templateId: number;
  language: "th" | "en";
};
```

Rules:

- verify access
- photo must belong to visit
- do not expose private identity data

---

## 14.2 Generate Certificate

Route:

```text
POST /api/certificates/generate
```

Body options:

If frontend renders image and sends file/blob:

```text
multipart/form-data
visitId
photoId
templateId
certificateImage
sessionId
```

If backend renders:

```ts
type GenerateCertificateInput = {
  visitId: number;
  photoId: number;
  templateId?: number;
  language: "th" | "en";
  sessionId?: string;
};
```

Response:

```ts
type GenerateCertificateResponse = {
  certificateId: number;
  certificateUrl: string;
  visitId: number;
  stampResult: {
    status: "earned" | "already_earned" | "no_stamp_available" | "failed";
    stampId?: number;
  };
};
```

Backend actions:

```text
validate visit
validate photo
generate/upload certificate file or accept generated file
create/reuse certificate record
update visit status
record certificate_generated event
award stamp
return stamp result
```

---

## 14.3 Increment Download Count

Route:

```text
POST /api/certificates/[certificateId]/downloaded
```

Optional.

Must verify certificate belongs to current tourist/session or public share context.

---

## 15. Stamp and Passport APIs

## 15.1 Award Stamp

Usually internal service called by certificate generation.

Optional route:

```text
POST /api/stamps/award
```

Body:

```ts
type AwardStampInput = {
  visitId: number;
};
```

Response:

```ts
type AwardStampResponse = {
  status: "earned" | "already_earned" | "no_stamp_available";
  stampId?: number;
};
```

---

## 15.2 Get Passport

Route:

```text
GET /api/passport
```

Identity:

```text
guest token
LINE identity future
email identity future
```

Response:

```ts
type PassportResponse = {
  tourist: {
    displayName: string;
    preferredLanguage?: string;
  };
  totalStamps: number;
  stamps: Array<{
    stampId: number;
    stampName: string;
    attractionName: string;
    provinceName: string;
    earnedAt: string;
    stampImageUrl?: string;
  }>;
  guestWarning: boolean;
};
```

Rules:

- tourist only sees own passport
- do not expose provider_user_id

---

## 16. Survey APIs

## 16.1 Start Survey

Route:

```text
POST /api/surveys/start
```

Optional.

Records:

```text
survey_started funnel event
```

## 16.2 Submit Survey

Route:

```text
POST /api/surveys
```

Body:

```ts
type SurveySubmitInput = {
  visitId: number;
  sessionId?: string;

  travelCompanionId?: number;
  groupSize?: number;
  transportModeId?: number;
  travelPurposeId?: number;
  overnightStatus?: "same_day" | "overnight" | "unknown" | "prefer_not_to_answer";
  nights?: number;

  spendingRange?: "0_500" | "501_1000" | "1001_2000" | "2001_5000" | "5001_plus" | "prefer_not_to_answer";
  mainExpenseCategoryId?: number;

  overallScore?: number;
  safetyScore?: number;
  cleanlinessScore?: number;
  transportScore?: number;
  informationScore?: number;
  serviceScore?: number;
  valueForMoneyScore?: number;
  revisitIntention?: boolean;
  recommendationIntention?: boolean;
  comment?: string;
};
```

Response:

```ts
type SurveySubmitResponse = {
  visitId: number;
  surveyId: number;
  completionStatus: "survey_completed";
};
```

Rules:

- survey optional
- validate values
- one survey per visit
- update visit status
- record survey_completed event

---

## 17. Admin APIs

Admin APIs require authentication and permission.

Base:

```text
/api/admin/*
```

---

## 17.1 Attractions

Routes:

```text
GET /api/admin/attractions
POST /api/admin/attractions
GET /api/admin/attractions/[id]
PATCH /api/admin/attractions/[id]
POST /api/admin/attractions/[id]/publish
POST /api/admin/attractions/[id]/unpublish
POST /api/admin/attractions/[id]/deactivate
```

List query params:

```text
search
province_id
district_id
attraction_type_id
is_published
is_active
page
page_size
```

Create/update body:

```text
province_id
district_id
attraction_type_id
slug
name_th
name_en
short_description_th
short_description_en
description_th
description_en
history_th
history_en
latitude
longitude
address_text
opening_hours
is_published
is_active
```

Rules:

- validate slug
- prevent duplicate slug
- audit important actions
- do not hard delete attractions with visits

---

## 17.2 Photo Spots

Routes:

```text
GET /api/admin/photo-spots
POST /api/admin/photo-spots
PATCH /api/admin/photo-spots/[id]
POST /api/admin/photo-spots/[id]/deactivate
```

Body:

```text
attraction_id
spot_name_th
spot_name_en
description_th
description_en
latitude
longitude
display_order
is_active
```

Rules:

- photo spot must belong to attraction
- do not delete if visits exist

---

## 17.3 Check-in Codes

Routes:

```text
GET /api/admin/checkin-codes
POST /api/admin/checkin-codes
PATCH /api/admin/checkin-codes/[id]
POST /api/admin/checkin-codes/[id]/deactivate
```

Body:

```text
code
attraction_id
photo_spot_id
label
is_active
starts_at
ends_at
```

Rules:

- code unique
- code URL-safe
- photo spot belongs to attraction
- starts_at < ends_at

---

## 17.4 Visits

Routes:

```text
GET /api/admin/visits
GET /api/admin/visits/[id]
```

Query params:

```text
start_date
end_date
province_id
attraction_id
completion_status
origin_country_id
origin_province_id
age_group
page
page_size
```

Rules:

- paginate
- do not expose private identities by default

---

## 17.5 Surveys

Routes:

```text
GET /api/admin/surveys
GET /api/admin/surveys/[id]
```

Rules:

- comments may require permission
- paginate
- filter by date/province/attraction/score

---

## 18. Dashboard APIs

Base:

```text
/api/dashboard/*
```

Require:

```text
dashboard.read permission
```

Routes:

```text
GET /api/dashboard/executive
GET /api/dashboard/visits-by-province
GET /api/dashboard/visits-by-attraction
GET /api/dashboard/tourist-origin
GET /api/dashboard/travel-behavior
GET /api/dashboard/expenses
GET /api/dashboard/satisfaction
GET /api/dashboard/funnel
```

Query params:

```text
start_date
end_date
province_id
attraction_id
origin_country_id
age_group
```

Rules:

- validate filters
- return aggregated data
- do not return private identity fields
- include data freshness where possible

---

## 19. Export APIs

Routes:

```text
POST /api/exports/visits
POST /api/exports/satisfaction
POST /api/exports/expenses
POST /api/exports/dashboard-summary
POST /api/exports/funnel
```

Require:

```text
export.create permission
```

Body:

```ts
type ExportRequest = {
  exportType: "visits" | "satisfaction" | "expenses" | "dashboard_summary" | "funnel";
  format: "csv";
  filters: {
    startDate?: string;
    endDate?: string;
    provinceId?: number;
    attractionId?: number;
  };
};
```

Rules:

- validate permission
- validate filters
- log export
- exclude personal identifiers by default
- return CSV file or signed download URL

---

## 20. Optional LINE APIs

Future routes:

```text
POST /api/line/link
GET /api/line/callback
POST /api/line/unlink
```

LINE link body:

```ts
type LineLinkInput = {
  touristId: number;
  lineIdToken: string;
  sessionId?: string;
};
```

Rules:

- verify token server-side
- link to existing tourist profile
- do not create duplicate tourist if guest exists
- do not expose LINE user ID
- communication consent separate

---

## 21. Official Data Import APIs

Future routes:

```text
POST /api/admin/official-data/import/preview
POST /api/admin/official-data/import/confirm
GET /api/admin/official-data/imports
GET /api/admin/official-data/stats
POST /api/admin/official-data/attraction-refs/link
```

Require:

```text
official_data.import permission
```

Rules:

- validate file
- validate rows
- map provinces
- log import
- do not overwrite local data automatically

---

## 22. Authentication and Permission API Pattern

Recommended helper functions:

```text
getCurrentUser()
requireAdmin()
requirePermission(permissionKey)
requireTouristAccess(input)
```

Use in every protected route.

Do not trust frontend role.

---

## 23. Request Validation Pattern

Example route handler pattern:

```ts
const parsed = schema.safeParse(await request.json());

if (!parsed.success) {
  return errorResponse("INVALID_INPUT", "Please check the submitted data.", parsed.error.flatten().fieldErrors, 422);
}

const result = await service.doSomething(parsed.data);

if (!result.success) {
  return errorResponse(result.code, result.message, result.fieldErrors, result.status);
}

return successResponse(result.data);
```

---

## 24. File Upload API Pattern

For file uploads:

```text
parse multipart form
validate auth/session
validate file
generate server-side path
upload to storage
create database record
return safe URL or signed URL
```

Rules:

- do not accept user storage path
- do not trust file extension only
- do not store base64 in database
- handle upload/database failure

---

## 25. Pagination Pattern

Use for list APIs.

Request:

```text
page
page_size
```

Response:

```ts
type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
```

Rules:

- default page size reasonable
- max page size enforced
- avoid returning all records

Recommended:

```text
default page_size = 20
max page_size = 100
```

---

## 26. Filtering Pattern

Use explicit filters.

Example:

```ts
type VisitFilters = {
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  attractionId?: number;
  completionStatus?: string;
  originCountryId?: number;
  ageGroup?: string;
};
```

Rules:

- validate all filters
- ignore or reject invalid filters
- do not concatenate raw SQL from query params
- use parameterized queries or query builder

---

## 27. Sorting Pattern

If sorting is supported:

```text
sort_by
sort_direction
```

Allowed sort fields must be whitelisted.

Example:

```text
visit_date
created_at
attraction_name
```

Do not allow arbitrary SQL column names from client.

---

## 28. API Security Rules

Do not expose:

```text
service role key
database URL
LINE secret
provider_user_id
raw device token
private storage paths
stack traces
SQL statements
```

Do:

```text
validate input
check permission
sanitize output
rate limit sensitive routes later
log important actions
```

---

## 29. API Privacy Rules

Default API responses should not include:

```text
email
LINE user ID
device token
raw IP
private storage path
```

Use safe derived fields:

```text
identityProvider: "line"
hasEmailLinked: true
guestWarning: true
```

instead of raw identifiers.

---

## 30. API Performance Rules

- avoid unbounded list queries
- use pagination
- require date range for large dashboard/export
- index queried columns
- return only needed fields
- avoid N+1 queries
- use summary tables later

---

## 31. API Idempotency Rules

Important endpoints should be idempotent or duplicate-safe:

```text
POST /api/tourists/profile
POST /api/visits
POST /api/photos/upload
POST /api/certificates/generate
POST /api/stamps/award
POST /api/surveys
```

Minimum MVP:

- frontend disables duplicate submit
- backend checks existing records
- database constraints handle duplicates
- duplicate errors mapped to friendly response

---

## 32. API Logging Rules

Log:

```text
admin writes
exports
official imports
permission denials
unexpected errors
critical workflow failures
```

Do not log:

```text
secrets
raw file content
raw LINE tokens
unnecessary personal data
```

---

## 33. API Testing Checklist

Test endpoints/actions:

```text
public attraction list
public attraction detail
valid QR
invalid QR
inactive QR
tourist profile create
guest reuse
visit create
photo upload valid
photo upload invalid type
photo upload too large
certificate generate
duplicate certificate generate
stamp award new
stamp award already earned
survey submit
survey invalid score
admin attraction create
admin duplicate slug
admin check-in code duplicate
dashboard metrics
export permission
unauthorized admin
```

---

## 34. MVP API Acceptance Checklist

```text
[ ] Public attraction data can be read safely.
[ ] QR check-in code can be resolved.
[ ] Invalid/inactive QR returns friendly error.
[ ] Funnel events can be recorded.
[ ] Tourist profile can be created/reused.
[ ] Visit can be created.
[ ] Photo can be uploaded safely.
[ ] Certificate can be generated/stored.
[ ] Stamp can be awarded.
[ ] Survey can be submitted.
[ ] Admin attraction APIs work.
[ ] Admin photo spot/check-in APIs work.
[ ] Dashboard APIs return aggregated metrics.
[ ] Export API is permission-protected.
[ ] All inputs are validated.
[ ] Errors use consistent format.
[ ] Private identifiers are not exposed.
```

---

## 35. Do Not Do

Do not:

```text
Create one giant API endpoint for the whole flow.
Trust client-provided role.
Trust client-provided tourist_id without verification.
Return service role key or secrets.
Return LINE user ID in normal API responses.
Return private storage paths.
Allow unbounded list/export queries.
Use raw SQL string concatenation with query params.
Expose stack traces to users.
Put complex business logic directly in route handler.
```

---

## 36. Final API Rule

APIs are the contract of the system.

A clean API design makes the frontend easier, the backend safer, and the data more trustworthy.
