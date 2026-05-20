# SECURITY_TEST_PLAN.md

## 1. Document Purpose

This document defines the security test plan for the **Southern Border Tourism Data & Intelligence Platform**.

The platform handles tourist data, uploaded photos, certificate files, optional survey responses, spending ranges, satisfaction data, admin operations, dashboards, exports, and possible LINE LIFF integration.

Security testing must verify that the system protects data and prevents unauthorized access.

---

## 2. Security Testing Mission

The mission is:

```text
Verify that users, tourists, admins, storage, APIs, exports, and database access follow the intended security and privacy rules.
```

Security tests should catch:

```text
admin auth bypass
permission bypass
tourist ownership bypass
private photo/certificate exposure
export privacy leaks
unsafe file uploads
RLS policy mistakes
service key exposure
raw error leakage
cron endpoint exposure
LINE identity trust mistakes
```

---

## 3. Related Documents

This plan aligns with:

```text
docs/security/SECURITY_REQUIREMENTS.md
docs/security/ROLE_PERMISSION_MATRIX.md
docs/security/ROW_LEVEL_SECURITY.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/CONSENT_MANAGEMENT.md
docs/security/IMAGE_UPLOAD_SECURITY.md
docs/security/AUDIT_LOGGING.md
docs/backend/AUTHORIZATION_RBAC.md
docs/backend/VALIDATION_ERROR_HANDLING.md
docs/testing/E2E_TEST_PLAN.md
```

---

## 4. Security Test Categories

Security testing should cover:

```text
authentication
authorization
tourist ownership
input validation
file upload security
storage access
RLS/database access
dashboard privacy
export privacy
audit logging
consent enforcement
error leakage
environment secret exposure
cron/background job protection
LINE LIFF security optional
```

---

## 5. Test Roles

Use test users:

```text
anonymous user
guest tourist A
guest tourist B
LINE-linked tourist future
viewer admin
admin
super_admin
inactive admin
```

Never use real accounts in automated security tests.

---

## 6. Security Test Data

Use synthetic data:

```text
test tourist profile
test visit
test photo
test certificate
test survey
test attraction
test QR code
test admin accounts
```

Do not use real tourist data.

---

# Authentication Tests

---

## 7. Admin Route Authentication Tests

Test routes:

```text
/admin
/admin/dashboard
/admin/attractions
/admin/checkin-codes
/admin/visits
/admin/reports
/admin/users
/admin/audit-logs
```

Anonymous expected result:

```text
redirect to login
or 401/403 for API routes
```

Must not return:

```text
admin page data
dashboard data
visit records
exports
audit logs
```

---

## 8. Admin API Authentication Tests

Test API routes:

```text
/api/admin/*
/api/dashboard/*
/api/exports/*
/api/admin/audit-logs
```

Anonymous requests must return:

```text
401 UNAUTHORIZED
```

or equivalent safe error.

Must not return stack trace or internal error.

---

## 9. Inactive Admin Tests

Scenario:

```text
admin account exists but is_active = false
```

Test:

```text
inactive admin cannot access dashboard
inactive admin cannot call admin APIs
inactive admin cannot export
```

Expected:

```text
403 FORBIDDEN or account inactive message
```

---

# Authorization Tests

---

## 10. Viewer Permission Tests

Viewer can:

```text
view dashboard if allowed
view read-only content
```

Viewer cannot:

```text
create attraction
update attraction
publish attraction
create QR/check-in code
deactivate QR/check-in code
upload admin media
export detailed visit data
view audit logs
manage users
```

Test both:

```text
UI route/button behavior
direct API calls
```

Direct API calls must be blocked.

---

## 11. Admin Permission Tests

Admin can:

```text
create/update attractions
manage photo spots
manage check-in codes
view dashboard
export allowed datasets
```

Admin cannot normally:

```text
manage users
manage roles
read audit logs unless granted
export personal data
change system settings
```

---

## 12. Super Admin Permission Tests

Super admin can:

```text
manage users
manage roles
read audit logs
perform restricted admin actions
```

Still must not bypass:

```text
file validation
input validation
safe export rules unless explicitly intended
```

---

## 13. Permission Helper Tests

Security integration tests should verify:

```text
requirePermission blocks missing permission
requireAnyPermission works
requireAllPermissions works
inactive admin blocked before permission check
missing admin user blocked
```

---

# Tourist Ownership Tests

---

## 14. Tourist Visit Ownership Tests

Scenario:

```text
tourist A owns visit A
tourist B owns visit B
```

Test:

```text
tourist B cannot upload photo to visit A
tourist B cannot generate certificate for visit A
tourist B cannot submit survey for visit A
tourist B cannot access passport/stamps of tourist A
tourist B cannot download certificate of tourist A unless public sharing exists
```

Expected:

```text
403 or 404 safe response
```

Avoid revealing whether the resource exists.

---

## 15. Guest Token Security Tests

Test:

```text
missing guest token cannot access guest passport
invalid guest token cannot access passport
modified guest token fails
guest token cannot be used for admin access
guest token not exposed in exports
guest token not shown in dashboard
```

---

## 16. LINE Identity Security Tests Future

If LINE is implemented, test:

```text
frontend LINE profile is not trusted alone
ID token is verified server-side
forged LINE user ID rejected
LINE ID not displayed in dashboard
LINE ID not exported by default
LINE linking does not imply marketing consent
foreign/non-LINE guest flow still works
```

---

# Input Validation Security Tests

---

## 17. Tourist Form Validation Security Tests

Send direct API requests with:

```text
missing display name
very long display name
script tags in display name
invalid origin id
invalid age group
missing consent
unchecked consent
extra unexpected fields
```

Expected:

```text
validation error
safe response
no database corruption
```

---

## 18. Admin Form Validation Security Tests

Test:

```text
script tags in attraction title/description
invalid slug
invalid latitude/longitude
invalid external URL
unsafe iframe/embed URL
invalid province/district relationship
overly long text fields
```

Expected:

```text
validated/sanitized/rejected
no unsafe script execution
```

---

## 19. Dashboard Filter Validation Tests

Test API filters:

```text
invalid date
start_date after end_date
non-integer province id
attraction not in province
huge date range
invalid enum values
SQL injection-like strings
```

Expected:

```text
VALIDATION_FAILED
safe error
no SQL error leak
```

---

## 20. Export Filter Validation Tests

Test:

```text
invalid export type
invalid format
invalid date range
huge unbounded export
forbidden privacy level
SQL injection-like filter
```

Expected:

```text
validation or permission error
no export generated
audit denied/failure for sensitive attempts
```

---

# File Upload Security Tests

---

## 21. Tourist Photo Upload Tests

Test files:

```text
valid JPEG
valid PNG
valid WebP
SVG file
PDF file
HTML file renamed .jpg
JavaScript file renamed .png
empty file
oversized file
```

Expected:

```text
valid files accepted
invalid files rejected
storage path server-generated
metadata not created for rejected files
```

---

## 22. File Path Security Tests

Verify generated paths do not include:

```text
tourist display name
email
LINE ID
guest token
original filename
```

Paths should use:

```text
safe ids/random ids
year/month grouping
safe extension
```

---

## 23. Admin Media Upload Security Tests

Test:

```text
viewer cannot upload admin media
admin invalid file rejected
SVG rejected in MVP
large image rejected
storage path safe
audit log created for admin upload
```

---

## 24. Certificate File Upload Tests

If frontend-rendered certificate is uploaded:

```text
invalid file type rejected
too-large certificate rejected
visit ownership required
photo belongs to visit
template active
duplicate certificate not created
```

---

# Storage Security Tests

---

## 25. Private Bucket Access Tests

Buckets to test:

```text
visit-photos
certificate-files
export-files
official-imports
temp-uploads
```

Anonymous direct access should fail.

No public listing.

Signed URL behavior:

```text
valid signed URL works
expired signed URL fails if expiration test possible
signed URL not stored permanently in database
```

---

## 26. Public Bucket Access Tests

Buckets:

```text
attraction-media
stamp-assets
```

Expected:

```text
public read works
public write fails
admin write requires permission
```

---

## 27. Storage Deletion Tests

Test:

```text
anonymization deletes tourist photo
expired export cleanup deletes export file
orphan cleanup does not delete referenced file
```

Future if cleanup jobs implemented.

---

# RLS and Database Security Tests

---

## 28. RLS Sensitive Table Tests

Using anon key or non-privileged client, verify no access to:

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
```

Expected:

```text
no rows returned or permission denied
```

---

## 29. Public Content RLS Tests

Anonymous can read:

```text
published active attractions
safe reference tables
public attraction images
stamp assets
```

Anonymous cannot read:

```text
unpublished attractions
inactive attractions
admin-only fields
draft media
```

---

## 30. Admin RLS/Permission Tests

If direct Supabase client is used for admin:

```text
viewer can select allowed rows
viewer cannot update
admin can update attraction if permission
super_admin can read audit logs
```

If all admin operations are server-side, test server authorization instead.

---

# Dashboard Privacy Tests

---

## 31. Dashboard Response Privacy Tests

Dashboard API responses must not include:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw IP
raw user agent
uploaded photo path
private certificate path
raw comments by default
```

Test all dashboard endpoints:

```text
executive
tourist profile
travel behavior
expense
satisfaction
funnel
sustainability
```

---

## 32. Dashboard Aggregation Tests

Verify dashboard uses aggregated metrics, not raw personal lists.

Examples:

```text
tourist profile distribution uses counts
satisfaction uses averages/counts
expense uses ranges/distribution
funnel uses event/stage counts
```

---

# Export Security Tests

---

## 33. Export Permission Tests

Test:

```text
viewer cannot export
admin can export allowed summary
admin cannot export personal data unless permission
super_admin/restricted role required for personal data export
comments export requires export.comments
```

---

## 34. Export Privacy Tests

Default exports must exclude:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw photo path
private certificate URL/path
raw comments unless permitted
```

Test CSV text directly.

---

## 35. Export Audit Tests

Every export must create audit log with:

```text
actor
export_type
filters
row_count
privacy_level
timestamp
result
```

Audit log must not include:

```text
full exported rows
signed URL
secrets
```

---

## 36. Export File Access Tests

If exports are stored:

```text
export file stored in private bucket
download URL is signed/short-lived
expired export cannot be downloaded
export cleanup removes file
```

---

# Consent and Privacy Tests

---

## 37. Consent Required Tests

Test:

```text
submit profile without consent -> blocked
submit profile with consent -> succeeds
consent checkbox not pre-checked in UI
consent version stored
consent source stored
consented_at stored
```

---

## 38. Optional Flow Privacy Tests

Test:

```text
survey is optional
LINE linking is optional
email future optional
passport save optional
certificate download not blocked by survey
communication consent separate from LINE linking
```

---

## 39. Certificate Privacy Tests

Certificate must not include:

```text
email
LINE ID
internal tourist id
device token
full address
national ID
```

Certificate may include:

```text
display name
photo
attraction
visit date
```

---

# Audit Logging Security Tests

---

## 40. Sensitive Action Audit Tests

Audit required for:

```text
export
role assignment
user deactivation
attraction publish/deactivate
check-in code deactivate
official data import
raw comments export
personal data export attempt
```

Denied sensitive attempts should also be audited where designed.

---

## 41. Audit Log Access Tests

Test:

```text
viewer cannot read audit logs
admin cannot read audit logs unless permission
super_admin can read audit logs
anonymous cannot read audit logs
```

---

## 42. Audit Sanitization Tests

Audit logs must not contain:

```text
password
service role key
LINE token
guest token
provider_user_id
signed URL
raw uploaded file content
full request body
```

---

# Error Leakage Tests

---

## 43. Safe Error Response Tests

Trigger errors:

```text
validation error
not found
permission denied
database duplicate key
foreign key error
storage upload failure
unexpected server error
```

Responses must not expose:

```text
stack trace
SQL query
SQLSTATE details
service key
bucket internals
raw Supabase error object
```

---

## 44. 404/Unavailable Page Tests

Public pages for invalid resources should not leak:

```text
whether unpublished attraction exists
admin-only details
database ids
stack traces
```

---

# Environment Secret Tests

---

## 45. Frontend Bundle Secret Scan

Verify frontend bundle/source does not contain:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
LINE_CHANNEL_SECRET
CRON_SECRET
private API tokens
```

Allowed public variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_LIFF_ID
```

---

## 46. Repository Secret Scan

Check repository for:

```text
.env
service role key
database password
LINE secret
private tokens
real credentials
```

Use:

```text
git-secrets
trufflehog
gitleaks
```

optional.

---

# Cron and Background Job Security Tests

---

## 47. Cron Endpoint Tests

If cron endpoints exist:

```text
GET /api/cron/cleanup without secret -> 401/403
GET /api/cron/cleanup with wrong secret -> 401/403
GET /api/cron/cleanup with valid secret -> success
```

Cron endpoints must not be public.

---

## 48. Background Job Permission Tests

Admin-triggered jobs require:

```text
system.job_run
```

Test:

```text
viewer cannot trigger job
normal admin cannot trigger restricted job
super_admin can trigger allowed job
```

---

# LINE LIFF Security Tests Future

---

## 49. LINE Token Verification Tests

If implemented:

```text
valid LINE ID token accepted
invalid token rejected
expired token rejected
token with wrong audience rejected
frontend-provided userId without verified token rejected
```

---

## 50. LINE Consent Tests

Test:

```text
LINE linking consent recorded
LINE linking not marketing consent
LINE ID not exported
LINE ID not visible in dashboard
unlink future removes identity
```

---

# Security Test Execution

---

## 51. Suggested Commands

```bash
npm run test:security
npm run test:e2e:security
npm run test:rls
```

Suggested package scripts:

```json
{
  "test:security": "vitest run tests/security",
  "test:rls": "vitest run tests/security/rls",
  "test:e2e:security": "playwright test tests/e2e/permissions.spec.ts"
}
```

---

## 52. Security Test Frequency

Run:

```text
unit security tests on every PR
permission/export tests on every PR
RLS tests before deployment
file upload tests before release
secret scan before release
full security checklist before production
```

---

# Security Acceptance Checklist

---

## 53. MVP Security Acceptance Checklist

```text
[ ] Anonymous users cannot access admin routes.
[ ] Admin APIs require authentication.
[ ] Viewer cannot mutate data.
[ ] Viewer cannot export detailed data.
[ ] Admin cannot manage users unless permitted.
[ ] Tourist cannot access another tourist's visit/certificate/passport.
[ ] Consent is required before profile/visit save.
[ ] Google/LINE are optional, and email remains a future optional identity.
[ ] Invalid file types are rejected.
[ ] Large files are rejected.
[ ] Tourist photos are private or controlled.
[ ] Certificate files are private or controlled.
[ ] Dashboard responses exclude personal identifiers.
[ ] Default exports exclude personal identifiers.
[ ] Exports require permission.
[ ] Exports create audit logs.
[ ] Audit logs do not contain secrets.
[ ] Service role key is not exposed to frontend.
[ ] Sensitive tables are not publicly readable.
[ ] Error responses do not leak internals.
```

---

## 54. Critical Security Release Blockers

Do not release if:

```text
service role key is exposed
anonymous can access admin data
viewer can export detailed data
tourist can access another tourist's photo/certificate
export includes LINE ID/email by default
tourist photos are public unintentionally
RLS exposes tourist identities
file upload accepts dangerous file types
raw SQL/stack traces visible to users
```

---

## 55. Do Not Do

Do not:

```text
Trust frontend-only permissions.
Trust tourist_id from localStorage.
Expose service role key.
Make all storage buckets public.
Allow SVG tourist uploads.
Export personal identifiers by default.
Skip audit logging for exports.
Ignore RLS tests if direct Supabase access exists.
Use real personal data in security tests.
Leave cron endpoints public.
```

---

## 56. Future Enhancements

Possible future improvements:

```text
automated secret scanning in CI
dependency vulnerability scanning
SAST
DAST
manual penetration test checklist
2FA admin testing
admin session anomaly tests
rate limit tests
malware scanning tests
privacy request workflow tests
public share token security tests
```

---

## 57. Final Security Testing Rule

Security testing must verify the real controls, not just the UI.

If a user can bypass the browser and call an API directly, the backend, database, storage, and permissions must still protect the data.
