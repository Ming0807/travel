# BACKEND_CHECKLIST.md

## 1. Document Purpose

This checklist defines backend readiness requirements for the **Southern Border Tourism Data & Intelligence Platform**.

Use this checklist when building and reviewing:

```text
API routes
server actions
service layer
repositories
database access
storage access
auth/authorization
validation
certificate generation
dashboard services
exports
audit logs
background jobs
```

The backend must enforce real rules. Frontend validation and UI hiding are not enough.

---

## 2. Backend Mission

The backend mission is:

```text
Protect data integrity, enforce permissions, validate inputs, connect workflows, and produce trustworthy analytics.
```

The backend must ensure:

```text
tourist data is saved correctly
ownership is verified
admin permissions are enforced
files are stored safely
certificates are generated idempotently
stamps are not duplicated
dashboard metrics are correct
exports are privacy-safe
audit logs are created
errors are safe
```

---

## 3. Related Documents

This checklist must align with:

```text
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
docs/security/ROW_LEVEL_SECURITY.md
docs/database/DATABASE_REQUIREMENTS.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
```

---

## 4. Backend Architecture Checklist

Recommended layers:

```text
Route Handler / Server Action
  -> Validator
  -> Auth / Permission / Ownership Guard
  -> Service
  -> Repository
  -> Database / Storage
```

Checklist:

```text
[ ] API/server action entry points are organized.
[ ] Validation schemas are centralized.
[ ] Services contain business logic.
[ ] Repositories contain database queries.
[ ] Storage adapter is centralized.
[ ] Auth helpers are centralized.
[ ] Error handling is standardized.
[ ] Audit logging is centralized.
[ ] Dashboard metrics are calculated server-side.
```

---

## 5. Service Result Pattern

Checklist:

```text
[ ] Backend uses consistent success/error result format.
[ ] Errors have stable error codes.
[ ] Validation errors include field details.
[ ] Unexpected errors return safe messages.
[ ] Services do not throw raw DB errors to UI.
```

Recommended shape:

```ts
type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };
```

---

## 6. Backend Folder Structure

Recommended:

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
```

Checklist:

```text
[ ] Tourist services separated from admin services.
[ ] Dashboard services separated from UI.
[ ] Export services separated from dashboard.
[ ] Storage helpers separated from business services.
[ ] Permission helpers reused everywhere.
[ ] Validation schemas reused by routes/services.
```

---

# Authentication and Authorization Checklist

---

## 7. Admin Authentication

Checklist:

```text
[ ] Admin session is checked server-side.
[ ] Admin user exists in admin_users table.
[ ] Inactive admin is blocked.
[ ] Anonymous admin API request returns 401/403.
[ ] Admin login/logout flow works.
[ ] Auth errors are safe.
```

---

## 8. Permission Enforcement

Checklist:

```text
[ ] requirePermission helper exists.
[ ] requireAnyPermission helper exists or planned.
[ ] Backend checks permissions for admin actions.
[ ] Viewer cannot mutate data.
[ ] Viewer cannot export detailed data.
[ ] Admin cannot manage users unless permitted.
[ ] Super admin permissions are restricted to trusted users.
[ ] Direct API calls cannot bypass UI permissions.
```

Important backend rule:

```text
Never rely only on frontend hidden buttons.
```

---

## 9. Tourist Ownership Enforcement

Checklist:

```text
[ ] Guest token/session identity strategy exists.
[ ] Backend verifies tourist identity before loading passport.
[ ] Backend verifies visit belongs to tourist before photo upload.
[ ] Backend verifies visit belongs to tourist before certificate generation.
[ ] Backend verifies visit belongs to tourist before survey submit.
[ ] Tourist cannot access another tourist's photo/certificate/passport.
[ ] Guest token cannot access admin endpoints.
```

---

# Validation Checklist

---

## 10. General Validation

Checklist:

```text
[ ] All public inputs validated server-side.
[ ] All admin inputs validated server-side.
[ ] Dashboard filters validated server-side.
[ ] Export filters validated server-side.
[ ] File uploads validated server-side.
[ ] Unknown fields are ignored or rejected intentionally.
[ ] Validation errors are user-safe.
```

Use:

```text
Zod or equivalent
```

---

## 11. Tourist Profile Validation

Checklist:

```text
[ ] display_name required.
[ ] display_name max length enforced.
[ ] origin country/province validated.
[ ] age group controlled value.
[ ] preferred language controlled value.
[ ] consent required.
[ ] email not required.
[ ] LINE not required.
[ ] phone not required.
[ ] full address not required.
[ ] national ID not accepted.
```

---

## 12. Survey Validation

Checklist:

```text
[ ] overall_score 1-5 if present.
[ ] dimension scores 1-5 if present.
[ ] revisit/recommendation booleans validated.
[ ] comment length limited.
[ ] spending range controlled value.
[ ] transport mode valid.
[ ] travel purpose valid.
[ ] travel companion valid.
[ ] group_size >= 1 if present.
[ ] nights >= 0 if present.
```

---

## 13. Admin Content Validation

Checklist:

```text
[ ] attraction name required.
[ ] slug format validated.
[ ] province/district validated.
[ ] coordinates validated.
[ ] external URLs validated.
[ ] 360 embed URLs validated or restricted.
[ ] rich text sanitized if used.
[ ] publish status controlled.
[ ] photo spot belongs to attraction.
[ ] check-in code format validated.
[ ] date ranges validated.
```

---

# Public and Tourist APIs Checklist

---

## 14. Public Attraction APIs

Checklist:

```text
[ ] Public API returns only published active attractions.
[ ] Public API excludes admin notes.
[ ] Public API excludes private storage paths.
[ ] Public API returns safe media URLs only.
[ ] Missing/unpublished attraction returns safe 404.
```

---

## 15. QR / Check-in API

Checklist:

```text
[ ] Active check-in code resolves.
[ ] Invalid code returns safe error.
[ ] Inactive code returns safe unavailable response.
[ ] Expired code returns safe expired response.
[ ] Response includes safe public context.
[ ] Response excludes admin-only fields.
[ ] Funnel event recording is safe and optional.
```

---

## 16. Tourist Profile / Visit API

Checklist:

```text
[ ] Creates or reuses tourist profile.
[ ] Creates or reuses tourist identity.
[ ] Creates visit record.
[ ] Saves consent record.
[ ] Uses transaction where appropriate.
[ ] Prevents duplicate identity creation.
[ ] Does not require LINE/email.
[ ] Returns safe response.
```

---

## 17. Photo Upload API

Checklist:

```text
[ ] Verifies visit ownership.
[ ] Validates MIME type.
[ ] Validates file size.
[ ] Rejects SVG tourist upload.
[ ] Rejects PDF/HTML/JS.
[ ] Generates storage path server-side.
[ ] Uploads to private/controlled bucket.
[ ] Creates visit_photos metadata.
[ ] Records photo_uploaded funnel event if enabled.
[ ] Cleans up storage file if metadata insert fails.
[ ] Returns safe URL/path response.
```

Must not:

```text
[ ] return service role key.
[ ] return raw private storage path unless needed and safe.
[ ] store signed URL permanently.
```

---

## 18. Certificate Generation API

Checklist:

```text
[ ] Verifies visit ownership.
[ ] Verifies photo belongs to visit.
[ ] Verifies template exists and is active.
[ ] Generates or accepts certificate file safely.
[ ] Stores certificate file.
[ ] Creates certificate record.
[ ] Updates visit status.
[ ] Awards stamp.
[ ] Handles duplicate certificate generation idempotently.
[ ] Handles duplicate stamp as non-fatal.
[ ] Records certificate_generated funnel event.
[ ] Returns safe download/access info.
```

---

## 19. Passport API

Checklist:

```text
[ ] Verifies tourist identity.
[ ] Returns own stamps only.
[ ] Returns own certificates only if included.
[ ] Does not expose provider_user_id.
[ ] Does not expose guest token.
[ ] Handles empty passport state.
[ ] Works for guest path.
[ ] Works for optional LINE/email identity if implemented.
```

---

## 20. Survey API

Checklist:

```text
[ ] Verifies visit ownership.
[ ] Validates survey input.
[ ] Saves satisfaction response.
[ ] Saves expense data.
[ ] Saves travel behavior.
[ ] Prevents duplicate survey or updates according to business rule.
[ ] Records survey_completed funnel event.
[ ] Does not require survey before certificate.
[ ] Returns safe success response.
```

---

# Admin APIs Checklist

---

## 21. Attraction Admin API

Checklist:

```text
[ ] Requires authentication.
[ ] Requires attraction permission.
[ ] Validates input.
[ ] Enforces unique slug.
[ ] Creates attraction.
[ ] Updates attraction.
[ ] Publishes/unpublishes attraction.
[ ] Deactivates attraction.
[ ] Avoids hard delete if historical data exists.
[ ] Creates audit log.
```

---

## 22. Photo Spot Admin API

Checklist:

```text
[ ] Requires authentication.
[ ] Requires photo_spot permission.
[ ] Validates input.
[ ] Verifies attraction exists.
[ ] Creates photo spot.
[ ] Updates photo spot.
[ ] Deactivates photo spot.
[ ] Creates audit log.
```

---

## 23. Check-in Code Admin API

Checklist:

```text
[ ] Requires authentication.
[ ] Requires checkin_code permission.
[ ] Validates code format.
[ ] Enforces unique code.
[ ] Verifies attraction exists.
[ ] Verifies photo spot belongs to attraction.
[ ] Handles active/inactive status.
[ ] Handles start/end dates if supported.
[ ] Deactivates code safely.
[ ] Creates audit log.
```

---

## 24. Admin Media API

Checklist:

```text
[ ] Requires authentication.
[ ] Requires media permission.
[ ] Validates file type.
[ ] Validates file size.
[ ] Rejects unsafe file types.
[ ] Generates storage path.
[ ] Stores metadata.
[ ] Creates audit log.
```

---

# Dashboard Backend Checklist

---

## 25. Dashboard Service Requirements

Checklist:

```text
[ ] Dashboard metrics are calculated server-side.
[ ] Dashboard filters are validated.
[ ] Date range filter is required or defaulted.
[ ] Province filter works.
[ ] Attraction filter works.
[ ] Queries use indexes.
[ ] Response excludes personal identifiers.
[ ] Null/No data rules are implemented.
[ ] Dashboard limitations are returned or documented.
```

---

## 26. Executive Metrics

Checklist:

```text
[ ] tourist_profile_count uses distinct tourist_id through visits.
[ ] visit_count counts visits, not QR scans.
[ ] certificate_count counts certificates.
[ ] stamp_count counts stamps.
[ ] survey_completion_rate handles zero denominator.
[ ] average_satisfaction ignores null.
[ ] estimated_spending is labeled estimated.
[ ] top_attraction calculated by visit count.
```

---

## 27. Funnel Metrics

Checklist:

```text
[ ] QR scan count uses funnel_events.
[ ] Funnel stage order is centralized.
[ ] Conversion handles zero denominator.
[ ] Drop-off handles zero denominator.
[ ] Event count is not treated as unique people.
[ ] Funnel by attraction works.
[ ] Funnel by photo spot works or is planned.
```

---

## 28. Satisfaction Metrics

Checklist:

```text
[ ] Average satisfaction ignores null.
[ ] No responses returns null/No data.
[ ] Response count is included.
[ ] Low satisfaction threshold is configurable or documented.
[ ] Revisit intention denominator excludes null.
[ ] Recommendation intention denominator excludes null.
```

---

## 29. Expense Metrics

Checklist:

```text
[ ] Spending range distribution works.
[ ] Estimated min/max works.
[ ] Open-ended ranges handled.
[ ] prefer_not_to_answer excluded from estimate.
[ ] Expense category distribution works.
[ ] Spending is never labeled revenue in backend response labels.
```

---

# Export Backend Checklist

---

## 30. Export Service

Checklist:

```text
[ ] Export requires authentication.
[ ] Export requires permission.
[ ] Export filters are validated.
[ ] Export row limits are enforced.
[ ] CSV generation is safe.
[ ] Thai text is preserved.
[ ] Export excludes identifiers by default.
[ ] Export creates audit log.
[ ] Export error handling is safe.
```

---

## 31. Export Privacy

Default exports must exclude:

```text
[ ] email
[ ] LINE user ID
[ ] provider_user_id
[ ] guest token
[ ] device token
[ ] raw photo path
[ ] private certificate path
[ ] raw comments unless permitted
```

---

## 32. Export File Storage

If export files are stored:

```text
[ ] export-files bucket is private.
[ ] signed URL is short-lived.
[ ] expires_at is stored.
[ ] cleanup job exists or is planned.
[ ] signed URL is not stored permanently.
```

---

# Storage Backend Checklist

---

## 33. Storage Adapter

Checklist:

```text
[ ] Storage upload helper exists.
[ ] Storage signed URL helper exists.
[ ] Storage delete helper exists.
[ ] Bucket names are centralized constants.
[ ] Path generation is centralized.
[ ] File validation is centralized.
[ ] Storage errors are normalized.
```

---

## 34. Bucket Rules

Checklist:

```text
[ ] attraction-media public read/admin write.
[ ] visit-photos private/controlled.
[ ] certificate-files private/controlled.
[ ] stamp-assets public read/admin write.
[ ] export-files private.
[ ] temp-uploads private if used.
```

---

# Audit and Logging Checklist

---

## 35. AuditService

Checklist:

```text
[ ] AuditService exists.
[ ] Export actions are audited.
[ ] Attraction publish/deactivate audited.
[ ] Check-in code create/deactivate audited.
[ ] Role/user changes audited.
[ ] Sensitive denied actions audited where required.
[ ] Audit logs sanitize metadata.
[ ] Audit logs do not store secrets.
```

---

## 36. Application Logs

Checklist:

```text
[ ] Server logs include request id where possible.
[ ] Logs do not include secrets.
[ ] Logs do not include raw uploaded files.
[ ] Logs do not include raw tokens.
[ ] Unexpected errors are logged server-side.
[ ] User-facing errors are safe.
```

---

# Security Backend Checklist

---

## 37. Secret Safety

Checklist:

```text
[ ] SUPABASE_SERVICE_ROLE_KEY used only server-side.
[ ] DATABASE_URL used only server-side.
[ ] LINE_CHANNEL_SECRET used only server-side if implemented.
[ ] CRON_SECRET used only server-side if implemented.
[ ] Secrets are not logged.
[ ] Secrets are not returned in API responses.
```

---

## 38. RLS and Service Role

Checklist:

```text
[ ] RLS strategy is documented.
[ ] Sensitive tables are protected.
[ ] If using service role, backend enforces authorization manually.
[ ] Browser never receives service role key.
[ ] Direct client access is limited to safe public data or RLS-protected data.
```

---

## 39. Rate Limiting / Abuse Protection

MVP minimum:

```text
[ ] File size limits enforced.
[ ] Duplicate certificate generation controlled.
[ ] Duplicate survey controlled.
[ ] Export row limit enforced.
```

Production future:

```text
[ ] Upload rate limiting.
[ ] Funnel event rate limiting.
[ ] Admin login protection.
[ ] Export rate limiting.
[ ] Cron protection.
```

---

## 40. Cron / Background Jobs

Checklist:

```text
[ ] Cron routes require CRON_SECRET or platform protection.
[ ] Cleanup jobs are safe.
[ ] Summary refresh jobs are idempotent.
[ ] Export cleanup job exists or planned.
[ ] Orphan file cleanup exists or planned.
[ ] Job logs/audit exist where useful.
```

---

# Error Handling Checklist

---

## 41. Error Codes

Checklist:

```text
[ ] Stable error codes defined.
[ ] Validation error code exists.
[ ] Unauthorized error code exists.
[ ] Forbidden error code exists.
[ ] Not found error code exists.
[ ] Conflict/duplicate error code exists.
[ ] Storage error code exists.
[ ] Export error code exists.
```

Examples:

```text
VALIDATION_FAILED
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
DUPLICATE_CHECKIN_CODE
DUPLICATE_SLUG
PHOTO_INVALID_TYPE
PHOTO_TOO_LARGE
CERTIFICATE_ALREADY_EXISTS
EXPORT_TOO_LARGE
INTERNAL_ERROR
```

---

## 42. Safe Error Responses

Checklist:

```text
[ ] No stack trace in user response.
[ ] No SQL query in user response.
[ ] No raw Supabase error in user response.
[ ] No service key in user response.
[ ] No private storage path in user response.
[ ] Field errors returned when useful.
```

---

# Testing Backend Checklist

---

## 43. Unit Tests

Backend unit tests should cover:

```text
[ ] validation schemas.
[ ] permission helpers.
[ ] storage path generation.
[ ] dashboard formulas.
[ ] CSV escaping.
[ ] error mapping.
[ ] spending estimate calculation.
[ ] funnel conversion calculation.
```

---

## 44. Integration Tests

Backend integration tests should cover:

```text
[ ] QR resolution.
[ ] tourist profile + visit creation.
[ ] consent record creation.
[ ] photo upload metadata/storage.
[ ] certificate generation.
[ ] stamp award duplicate prevention.
[ ] survey submission.
[ ] admin attraction CRUD.
[ ] check-in code CRUD.
[ ] dashboard metrics.
[ ] export privacy.
[ ] audit log creation.
```

---

## 45. Security Tests

Checklist:

```text
[ ] Anonymous cannot access admin APIs.
[ ] Viewer cannot mutate data.
[ ] Viewer cannot export detailed data.
[ ] Tourist cannot access another tourist's data.
[ ] Invalid files are rejected.
[ ] Private storage is not public.
[ ] Export excludes identifiers.
[ ] Service role key not exposed.
[ ] Error responses are safe.
```

---

# Backend Release Checklist

---

## 46. MVP Backend Acceptance Checklist

```text
[ ] Backend architecture layers are separated.
[ ] Validation exists for all public/admin inputs.
[ ] Auth checks exist for admin APIs.
[ ] Permission checks exist for admin actions.
[ ] Tourist ownership checks exist.
[ ] Photo upload flow is safe.
[ ] Certificate generation is idempotent.
[ ] Stamp duplicate prevention works.
[ ] Survey submit works.
[ ] Dashboard services return correct metrics.
[ ] Export service is privacy-safe.
[ ] Audit logging exists for sensitive actions.
[ ] Error handling is standardized.
[ ] Storage adapter is centralized.
[ ] Environment secrets are server-only.
```

---

## 47. Do Not Do

Do not:

```text
trust frontend validation only.
trust role from localStorage.
trust tourist_id from localStorage.
use service role key in browser.
return raw database errors.
store signed URLs permanently.
store image base64 in database.
create dashboard metrics in frontend from raw rows.
export personal identifiers by default.
skip audit log for exports.
require LINE for all tourist flows.
```

---

## 48. Final Backend Rule

The backend is the authority.

If the backend does not enforce validation, ownership, permissions, privacy, and metric definitions, the system is not production-ready.
