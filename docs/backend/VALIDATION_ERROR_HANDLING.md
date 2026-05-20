# VALIDATION_ERROR_HANDLING.md

## 1. Document Purpose

This document defines backend validation and error handling standards for the **Southern Border Tourism Data & Intelligence Platform**.

The backend must produce safe, predictable, user-friendly, and developer-useful errors without exposing sensitive implementation details.

This document applies to:

```text
server actions
API route handlers
service layer
repository layer
database constraint handling
storage operations
admin operations
tourist flow operations
dashboard/export operations
```

---

## 2. Error Handling Mission

The mission is:

```text
Protect data quality, help users recover, and never expose dangerous internal details.
```

The system must handle:

- invalid input
- missing records
- unauthorized actions
- duplicate data
- file upload problems
- certificate generation failures
- dashboard query failures
- export failures
- database constraint errors
- storage errors
- unexpected server errors

---

## 3. Core Principles

## 3.1 Validate Before Writing

Before writing to database or storage:

```text
parse input
validate type and format
validate business rules
validate permissions
validate related records
then write
```

Do not write first and clean up later unless unavoidable.

---

## 3.2 Never Trust Client Data

Never trust values from:

```text
localStorage
sessionStorage
URL params
form body
hidden inputs
frontend role state
frontend tourist_id
frontend visit_id
```

All important values must be verified server-side.

---

## 3.3 Do Not Leak Internals

Never show these to normal users:

```text
SQLSTATE
stack trace
raw SQL query
Supabase internal error details
storage bucket secrets
service role key
LINE tokens
provider_user_id
raw device token
```

---

## 3.4 Errors Must Be Actionable

A good error tells the user what to do next.

Bad:

```text
Invalid request
```

Good:

```text
This check-in code already exists. Please choose another code.
```

---

## 3.5 Keep Developer Detail in Logs

User response should be safe.

Server logs can contain more debugging context, but must still avoid secrets and unnecessary personal data.

---

## 4. Recommended Error Response Shape

For API routes:

```ts
type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    requestId?: string;
  };
};
```

For server actions:

```ts
type ActionErrorResponse = {
  success: false;
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};
```

Use one consistent pattern in implementation.

---

## 5. Success Response Shape

For API routes:

```ts
type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};
```

For server actions:

```ts
type ActionSuccessResponse<T> = {
  success: true;
  data: T;
};
```

---

## 6. Error Code Standards

Use stable uppercase snake case.

Examples:

```text
INVALID_INPUT
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_FAILED
DUPLICATE_RECORD
DATABASE_ERROR
STORAGE_ERROR
INTERNAL_ERROR
```

Domain-specific examples:

```text
QR_CODE_INVALID
QR_CODE_INACTIVE
QR_CODE_EXPIRED
ATTRACTION_UNAVAILABLE
PHOTO_SPOT_UNAVAILABLE
TOURIST_NOT_FOUND
VISIT_NOT_FOUND
PHOTO_REQUIRED
PHOTO_INVALID_TYPE
PHOTO_TOO_LARGE
UPLOAD_FAILED
CERTIFICATE_NOT_READY
CERTIFICATE_GENERATION_FAILED
STAMP_ALREADY_EARNED
SURVEY_ALREADY_SUBMITTED
DUPLICATE_SLUG
DUPLICATE_CHECKIN_CODE
EXPORT_FORBIDDEN
EXPORT_TOO_LARGE
OFFICIAL_IMPORT_INVALID_FILE
```

---

## 7. HTTP Status Code Standards

If using route handlers, use:

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

Recommended mapping:

```text
invalid JSON/body -> 400
validation failed -> 422
not logged in -> 401
no permission -> 403
record not found -> 404
duplicate conflict -> 409
file too large -> 413
rate limited -> 429
unexpected server error -> 500
```

---

## 8. Validation Layers

Validation must happen in layers.

## 8.1 Frontend Validation

Purpose:

```text
fast feedback
better UX
prevent common mistakes
```

Not sufficient for security.

## 8.2 Server Validation

Purpose:

```text
security
data integrity
business rule enforcement
```

Required for every mutation.

## 8.3 Database Constraints

Purpose:

```text
final protection
relationship integrity
unique constraints
check constraints
foreign keys
```

Database constraints are mandatory for critical rules.

---

## 9. Zod Validation Pattern

Recommended:

```ts
const parsed = schema.safeParse(input);

if (!parsed.success) {
  return {
    success: false,
    error: {
      code: "VALIDATION_FAILED",
      message: "Please check the submitted data.",
      fieldErrors: parsed.error.flatten().fieldErrors
    }
  };
}
```

Do not send raw Zod error object directly to user.

Map it to clean field errors.

---

## 10. Field Error Format

Use field names matching frontend form fields.

Example:

```json
{
  "displayName": ["Please enter the name you want on your certificate."],
  "originCountryId": ["Please select where you are from."]
}
```

Frontend should show field errors near inputs.

---

## 11. Form-Level Error Format

Use form-level error when issue is not tied to one field.

Examples:

```text
We could not save your profile. Please try again.
You do not have permission to perform this action.
This QR code is not available.
```

---

## 12. Tourist-Friendly Error Messages

Tourist errors should be:

```text
short
friendly
non-technical
actionable
```

Examples:

```text
Please select where you are from.
Please choose a photo to continue.
This photo is too large. Please upload a smaller image.
We could not create your certificate. Please try again.
This QR code is currently not available.
```

Thai examples:

```text
กรุณาเลือกว่าคุณมาจากที่ไหน
กรุณาเลือกรูปภาพเพื่อไปต่อ
รูปภาพนี้มีขนาดใหญ่เกินไป กรุณาอัปโหลดรูปที่เล็กลง
ไม่สามารถสร้างใบประกาศได้ กรุณาลองใหม่
QR Code นี้ยังไม่เปิดใช้งานหรือถูกปิดใช้งานแล้ว
```

---

## 13. Admin-Friendly Error Messages

Admin errors should be precise.

Examples:

```text
This slug is already used by another attraction.
This check-in code already exists.
The selected photo spot does not belong to this attraction.
This record has historical data and cannot be deleted. You can deactivate it instead.
```

Do not show raw database errors.

---

## 14. Dashboard Error Messages

Dashboard errors should be section-aware.

Examples:

```text
Could not load dashboard data. Please try again.
Could not load satisfaction metrics.
No data available for the selected filters.
```

If one chart fails, do not fail the entire dashboard if possible.

---

## 15. Export Error Messages

Export errors:

```text
You do not have permission to export this data.
No records found for the selected filters.
This export is too large. Please narrow the date range or filters.
Could not generate export. Please try again.
```

Do not expose query details.

---

## 16. Database Constraint Error Mapping

Database constraints should be mapped to domain errors.

## 16.1 Duplicate Attraction Slug

Database:

```text
unique attractions.slug
```

Response:

```text
code: DUPLICATE_SLUG
message: This slug is already used by another attraction.
status: 409
```

## 16.2 Duplicate Check-in Code

Database:

```text
unique checkin_codes.code
```

Response:

```text
code: DUPLICATE_CHECKIN_CODE
message: This check-in code already exists.
status: 409
```

## 16.3 Duplicate Tourist Identity

Database:

```text
unique tourist_identities(provider, provider_user_id)
```

Response:

```text
code: IDENTITY_ALREADY_LINKED
message: This account is already linked to another profile.
status: 409
```

## 16.4 Duplicate Tourist Stamp

Database:

```text
unique tourist_stamps(tourist_id, attraction_id)
```

Response:

```text
code: STAMP_ALREADY_EARNED
message: You already collected this stamp.
status: 200 or 409 depending on context
```

In certificate flow, duplicate stamp is not fatal.

Return:

```text
stampResult.status = already_earned
```

## 16.5 Duplicate Survey for Visit

Database:

```text
unique satisfaction_surveys.visit_id
```

Response:

```text
code: SURVEY_ALREADY_SUBMITTED
message: Survey has already been submitted for this visit.
status: 409
```

Or update existing survey if business rule allows.

---

## 17. Foreign Key Error Mapping

Common foreign key errors:

```text
invalid attraction_id
invalid photo_spot_id
invalid tourist_id
invalid visit_id
invalid checkin_code_id
```

User-facing messages:

```text
The selected attraction is no longer available.
The selected photo spot is no longer available.
We could not find your travel profile.
We could not find your visit record.
```

Admin-facing message:

```text
The selected related record is invalid or no longer available.
```

---

## 18. Check Constraint Error Mapping

Examples:

```text
satisfaction score not between 1 and 5
group size less than 1
invalid completion status
invalid approval status
```

Messages:

```text
Please select a rating from 1 to 5.
Please enter a valid group size.
Invalid completion status.
Invalid approval status.
```

---

## 19. QR Error Handling

## 19.1 Invalid Code

Condition:

```text
checkin code not found
```

Response:

```text
code: QR_CODE_INVALID
message: This QR code is not valid.
status: 404
```

## 19.2 Inactive Code

Condition:

```text
is_active = false
```

Response:

```text
code: QR_CODE_INACTIVE
message: This QR code is currently not available.
status: 403
```

## 19.3 Expired Code

Condition:

```text
now > ends_at
```

Response:

```text
code: QR_CODE_EXPIRED
message: This QR code has expired.
status: 403
```

## 19.4 Attraction Unavailable

Condition:

```text
linked attraction inactive or missing
```

Response:

```text
code: ATTRACTION_UNAVAILABLE
message: This attraction is currently not available for check-in.
status: 404 or 403
```

---

## 20. Tourist Profile Error Handling

## 20.1 Missing Display Name

```text
code: VALIDATION_FAILED
field: displayName
message: Please enter the name you want on your certificate.
```

## 20.2 Missing Origin

```text
code: VALIDATION_FAILED
field: originCountryId
message: Please select where you are from.
```

## 20.3 Consent Missing

```text
code: CONSENT_REQUIRED
field: hasConsented
message: Please confirm consent so we can create your certificate and store your visit record.
```

## 20.4 Identity Conflict

```text
code: IDENTITY_ALREADY_LINKED
message: This account is already linked to another profile.
```

---

## 21. Photo Upload Error Handling

## 21.1 No File

```text
code: PHOTO_REQUIRED
message: Please choose a photo to continue.
status: 422
```

## 21.2 Invalid Type

```text
code: PHOTO_INVALID_TYPE
message: Please upload a JPEG, PNG, or WebP image.
status: 422
```

## 21.3 Too Large

```text
code: PHOTO_TOO_LARGE
message: This photo is too large. Please upload a smaller image.
status: 413
```

## 21.4 Upload Failed

```text
code: UPLOAD_FAILED
message: We could not upload your photo. Please try again.
status: 500
```

## 21.5 Metadata Save Failed

```text
code: PHOTO_METADATA_SAVE_FAILED
message: Your photo uploaded, but we could not save the record. Please try again.
status: 500
```

Backend should consider cleanup of orphaned files.

---

## 22. Certificate Error Handling

## 22.1 Visit Not Found

```text
code: VISIT_NOT_FOUND
message: We could not find your visit record. Please start again.
```

## 22.2 Photo Missing

```text
code: PHOTO_REQUIRED
message: Please upload a photo before creating your certificate.
```

## 22.3 Template Missing

```text
code: CERTIFICATE_TEMPLATE_NOT_FOUND
message: Certificate template is not available. Please try again later.
```

## 22.4 Generation Failed

```text
code: CERTIFICATE_GENERATION_FAILED
message: We could not create your certificate. Please try again.
```

## 22.5 Duplicate Generate

If existing certificate found:

```text
success: true
data: existing certificate
```

or:

```text
code: CERTIFICATE_ALREADY_EXISTS
message: Your certificate has already been created.
```

MVP recommendation:

Return existing certificate to avoid frustrating user.

---

## 23. Stamp Error Handling

## 23.1 Already Earned

Not fatal.

Response inside certificate success:

```json
{
  "stampResult": {
    "status": "already_earned"
  }
}
```

Message:

```text
You already collected this stamp. Your new visit was still recorded.
```

## 23.2 No Stamp Available

Not fatal.

Message:

```text
Your certificate was created, but this attraction does not have a stamp yet.
```

## 23.3 Stamp Insert Failed

Partial success.

Message:

```text
Your certificate is ready, but we could not add the stamp right now.
```

Do not remove certificate.

---

## 24. Survey Error Handling

## 24.1 Visit Not Found

```text
code: VISIT_NOT_FOUND
message: We could not find your visit record.
```

## 24.2 Invalid Score

```text
code: VALIDATION_FAILED
field: overallScore
message: Please select a rating from 1 to 5.
```

## 24.3 Invalid Group Size

```text
code: VALIDATION_FAILED
field: groupSize
message: Please enter a valid group size.
```

## 24.4 Already Submitted

```text
code: SURVEY_ALREADY_SUBMITTED
message: Survey has already been submitted for this visit.
```

Business option:

- return existing survey
- update existing survey
- block duplicate

MVP recommendation:

Block or update intentionally; do not create duplicate.

---

## 25. Admin Error Handling

## 25.1 Unauthorized

```text
code: UNAUTHORIZED
message: Please sign in to continue.
status: 401
```

## 25.2 Forbidden

```text
code: FORBIDDEN
message: You do not have permission to perform this action.
status: 403
```

## 25.3 Duplicate Slug

```text
code: DUPLICATE_SLUG
message: This slug is already used by another attraction.
status: 409
```

## 25.4 Delete Blocked

```text
code: DELETE_BLOCKED
message: This record has historical data and cannot be deleted. You can deactivate it instead.
status: 409
```

## 25.5 Invalid Relationship

```text
code: INVALID_RELATIONSHIP
message: The selected photo spot does not belong to this attraction.
status: 422
```

---

## 26. Storage Error Handling

Storage operations can fail due to:

```text
invalid bucket
permission denied
file too large
network failure
path conflict
storage service error
```

Map to:

```text
STORAGE_UPLOAD_FAILED
STORAGE_DELETE_FAILED
STORAGE_SIGNED_URL_FAILED
STORAGE_PERMISSION_DENIED
```

User messages should be friendly.

Do not expose bucket secrets or service internals.

---

## 27. Partial Success Handling

Some workflows may partially succeed.

## 27.1 Certificate Created but Stamp Failed

Return success with warning.

```ts
{
  success: true,
  data: {
    certificateId: 123,
    stampResult: {
      status: "failed",
      message: "Your certificate is ready, but we could not add the stamp right now."
    }
  }
}
```

## 27.2 Photo Uploaded but Metadata Failed

This is problematic.

Options:

```text
delete orphan file
retry metadata insert
log orphan cleanup task
return upload failed message
```

MVP:

- log error
- return friendly error
- avoid exposing storage path

## 27.3 Import Partial Success

Return:

```text
partial_success
```

with counts:

```text
records_processed
records_inserted
records_failed
```

---

## 28. Logging Guidelines

Log enough to debug.

Recommended log fields:

```text
error_code
safe_message
internal_message
request_id
user_id if admin
tourist_id if safe and needed
entity_type
entity_id
timestamp
route/action name
```

Do not log:

```text
service role key
LINE tokens
raw uploaded file
full device token
raw provider_user_id unless strictly necessary
large personal data
```

---

## 29. Request ID

Production should include a request ID in logs and optionally error response.

Example:

```text
requestId: req_abc123
```

User-facing message:

```text
If the problem continues, contact support with reference ID: req_abc123.
```

MVP can skip if no monitoring exists.

---

## 30. Unexpected Error Handling

Unexpected errors should return:

```text
code: INTERNAL_ERROR
message: Something went wrong. Please try again.
status: 500
```

Admin may see slightly more context, but not secrets.

Log internal details server-side.

---

## 31. Retry Rules

Retries are appropriate for:

```text
network failures
temporary upload failures
certificate generation transient failures
dashboard load failures
export generation failures
```

Retries are not appropriate for:

```text
invalid input
forbidden action
duplicate slug
invalid QR code
inactive QR code
```

---

## 32. Validation Testing Checklist

Test:

```text
invalid QR
inactive QR
expired QR
missing display name
missing consent
invalid origin
invalid visit date
invalid photo type
large photo
missing visit
duplicate slug
duplicate check-in code
duplicate stamp
duplicate survey
invalid dashboard filter
unauthorized admin
forbidden export
storage upload failure
database insert failure
unexpected error
```

---

## 33. MVP Acceptance Checklist

```text
[ ] Standard error response format exists.
[ ] Zod validation maps to fieldErrors.
[ ] QR errors are mapped correctly.
[ ] Photo upload errors are mapped correctly.
[ ] Certificate errors are user-friendly.
[ ] Duplicate slug maps to friendly message.
[ ] Duplicate check-in code maps to friendly message.
[ ] Duplicate stamp is non-fatal.
[ ] Survey duplicate is handled.
[ ] Admin unauthorized/forbidden errors work.
[ ] Raw stack traces are not shown.
[ ] Raw SQL errors are not shown.
[ ] Storage errors are safe.
[ ] Critical errors are logged server-side.
```

---

## 34. Do Not Do

Do not:

```text
Show SQLSTATE to user.
Return stack traces to frontend.
Trust frontend validation only.
Return raw Supabase error object directly.
Use one generic error for all validation fields.
Ignore partial failures.
Delete certificate if stamp fails.
Treat duplicate stamp as fatal to tourist flow.
Log secrets.
Log raw uploaded file data.
```

---

## 35. Final Error Handling Rule

A production system is judged by how it behaves when things go wrong.

Errors should protect the system, help users recover, and preserve data integrity.
