# UNIT_TEST_PLAN.md

## 1. Document Purpose

This document defines the unit test plan for the **Southern Border Tourism Data & Intelligence Platform**.

Unit tests verify small, isolated pieces of logic such as validation, formatting, permission checks, dashboard formulas, storage path generation, error mapping, and CSV escaping.

Unit tests should be fast, deterministic, and easy to run during development.

---

## 2. Unit Test Mission

The mission of unit testing is:

```text
Catch logic errors early before they become broken tourist flows, wrong dashboard metrics, privacy leaks, or bad exports.
```

Unit tests should protect:

```text
validation rules
business formulas
permission helpers
data transformation
file validation
dashboard calculations
export formatting
error mapping
utility functions
```

---

## 3. Recommended Unit Test Stack

Recommended tools:

```text
Vitest
TypeScript
Zod
React Testing Library for isolated components
```

Optional:

```text
msw for mocking requests
faker for synthetic data
```

Unit tests should not require:

```text
real Supabase project
real storage bucket
real LINE API
real browser camera
real production database
```

---

## 4. What Should Be Unit Tested

Good unit test targets:

```text
pure functions
schema validation
calculation logic
mapping logic
permission helper logic
formatting functions
small UI components
error normalization
CSV escaping
storage path builders
```

Poor unit test targets:

```text
full QR flow
actual file upload to Supabase
real database writes
real browser downloads
full dashboard page with live data
```

Those belong to integration or E2E tests.

---

## 5. Suggested Test Directory Structure

Recommended:

```text
tests/
  unit/
    validation/
    permissions/
    dashboard/
    export/
    storage/
    certificate/
    tourist/
    utils/
```

Alternative colocated structure:

```text
src/server/services/__tests__/
src/lib/__tests__/
src/components/__tests__/
```

Either is acceptable if consistent.

---

## 6. Naming Convention

Use descriptive test names.

Good:

```text
should reject missing display name
should return null conversion when denominator is zero
should not include tourist name in storage path
should exclude LINE ID from default export columns
```

Bad:

```text
test 1
works
schema test
dashboard check
```

---

## 7. Test Data Rules

Use synthetic data only.

Do not use:

```text
real tourist name
real LINE ID
real email
real photos
real passport/national ID
real private addresses
```

Good synthetic examples:

```text
displayName: "Test Tourist"
originCountryId: 219
ageGroup: "25_34"
attractionName: "Sample Attraction"
```

---

# Validation Unit Tests

---

## 8. Tourist Profile Validation Tests

Target:

```text
tourist profile schema
minimal profile form schema
```

Test cases:

```text
valid profile passes
missing display name fails
display name too long fails
empty display name fails
missing origin fails
invalid origin id fails
missing age group fails
invalid age group fails
missing consent fails
unchecked consent fails
valid preferred language passes
invalid preferred language fails
```

Important rule:

```text
email and LINE must not be required for certificate flow.
```

---

## 9. Consent Validation Tests

Target:

```text
consent schema
consent service input validation
```

Test cases:

```text
valid required consent passes
missing consent version fails
missing purpose key fails
hasConsented false fails for required flow
unknown consent type fails
unknown source fails
Thai language consent passes
English language consent passes
```

Expected error code:

```text
CONSENT_REQUIRED
VALIDATION_FAILED
```

---

## 10. Visit Creation Validation Tests

Target:

```text
visit schema
visit input parser
```

Test cases:

```text
valid attraction id passes
invalid attraction id fails
missing attraction id fails
valid photo spot id passes
photo spot id optional if flow allows
invalid visit date fails
future visit date handling follows business rule
invalid completion status fails
group size below 1 fails
nights below 0 fails
```

---

## 11. Survey Validation Tests

Target:

```text
survey schema
expense schema
satisfaction schema
```

Test cases:

```text
valid survey passes
overall score 1 passes
overall score 5 passes
overall score 0 fails
overall score 6 fails
null optional score passes
invalid revisit intention fails
invalid recommendation intention fails
comment too long fails
valid spending range passes
invalid spending range fails
valid transport mode id passes
invalid travel purpose id fails
```

Important rule:

```text
null satisfaction is not zero.
```

---

## 12. Admin Attraction Validation Tests

Target:

```text
admin attraction form schema
```

Test cases:

```text
valid attraction passes
missing Thai name fails if required
missing slug fails if required
invalid slug fails
duplicate slug handled at service/database level
invalid province id fails
invalid district id fails
invalid latitude fails
invalid longitude fails
invalid publish status fails
invalid external URL fails
```

---

## 13. Check-in Code Validation Tests

Target:

```text
check-in code schema
```

Test cases:

```text
valid code passes
empty code fails
code with spaces fails
code with unsafe URL characters fails
missing attraction id fails
invalid photo spot id fails
starts_at after ends_at fails
inactive flag accepted
```

---

# Permission Unit Tests

---

## 14. Permission Helper Tests

Target:

```text
hasPermission
requirePermission
requireAnyPermission
requireAllPermissions
```

Test cases:

```text
super_admin has all required permissions
admin has attraction.create
admin does not have user.manage
viewer has dashboard.read
viewer does not have export.visit_records
inactive admin is blocked
missing user is unauthorized
missing permission returns forbidden
```

---

## 15. Role Matrix Tests

Target:

```text
role permission seed/mapping constants
```

Test cases:

```text
super_admin includes user.manage
admin includes dashboard.read
admin includes attraction.update
admin excludes role.update
viewer includes dashboard.read
viewer excludes mutation permissions
viewer excludes export permissions
```

---

# Dashboard Formula Unit Tests

---

## 16. Funnel Conversion Tests

Target:

```text
calculateFunnelStages
calculateConversionRate
calculateDropoffRate
```

Test cases:

```text
previous 100 current 60 returns conversion 0.6
previous 100 current 60 returns dropoff 0.4
previous 0 current 0 returns null conversion/dropoff
previous null returns null conversion/dropoff
current greater than previous allowed but flagged or returns > 1 based on design
```

Important rule:

```text
do not return 0 when denominator is zero.
```

---

## 17. Survey Completion Rate Tests

Target:

```text
calculateSurveyCompletionRate
```

Test cases:

```text
4 surveys / 10 certificates returns 0.4
0 surveys / 10 certificates returns 0
0 surveys / 0 certificates returns null
2 surveys / 0 certificates returns null or guarded invalid state
```

---

## 18. Average Satisfaction Tests

Target:

```text
calculateAverageScore
```

Test cases:

```text
[5, 4, 3] returns 4
[5, 4, null, 3] returns 4
[null, null] returns null
[] returns null
[0] rejected before calculation or ignored based on validation
```

Important rule:

```text
null is not zero.
```

---

## 19. Estimated Spending Tests

Target:

```text
calculateEstimatedSpendingRange
```

Test cases:

```text
0_500 + 501_1000 returns min 501 max 1500 if using exact seeded values
open-ended range sets hasOpenEndedRange true
prefer_not_to_answer ignored from total
empty list returns null min/max
```

Expected result should include:

```text
estimatedMin
estimatedMax
hasOpenEndedRange
responseCount
```

---

## 20. Attraction Concentration Tests

Target:

```text
calculateAttractionConcentration
```

Test cases:

```text
top 3 visits 60 / total 100 returns 0.6
total 0 returns null
single attraction returns 1.0
empty list returns null
```

---

## 21. Planning Quadrant Tests

Target:

```text
classifyAttractionPlanningQuadrant
```

Test cases:

```text
high visit high satisfaction -> flagship
high visit low satisfaction -> improvement priority
low visit high satisfaction -> promotion opportunity
low visit low satisfaction -> needs diagnosis
missing satisfaction -> insufficient data
response count below threshold -> low confidence/insufficient data
```

---

# Storage and File Unit Tests

---

## 22. File Type Validation Tests

Target:

```text
validateImageMimeType
```

Test cases:

```text
image/jpeg accepted
image/png accepted
image/webp accepted
image/svg+xml rejected for tourist upload
application/pdf rejected
text/html rejected
application/javascript rejected
empty MIME rejected
```

---

## 23. File Size Validation Tests

Target:

```text
validateFileSize
```

Test cases:

```text
5 MB tourist photo accepted if exactly limit
5 MB + 1 byte rejected
0 byte rejected
negative size rejected
admin attraction image 10 MB accepted
stamp asset over 2 MB rejected
```

---

## 24. Storage Path Generation Tests

Target:

```text
generateVisitPhotoPath
generateCertificatePath
generateAttractionImagePath
```

Test cases:

```text
path contains year/month
path contains visit id where expected
path contains random id
path does not contain tourist display name
path does not contain email
path does not contain LINE ID
path does not contain original filename
extension matches detected MIME type
```

---

## 25. Signed URL Safety Tests

Target:

```text
storage URL helper
```

Test cases:

```text
database stores storage_path not signed URL
signed URL expiration is set
private bucket path not returned as public URL
invalid path fails safely
```

---

# Certificate Unit Tests

---

## 26. Certificate Template Selection Tests

Target:

```text
selectCertificateTemplate
```

Test cases:

```text
attraction-specific template selected first
province-specific template selected second
global default selected as fallback
language fallback works
inactive template ignored
missing template returns CERTIFICATE_TEMPLATE_NOT_FOUND
```

---

## 27. Certificate Generation Guard Tests

Target:

```text
certificate service validation helpers
```

Test cases:

```text
missing visit fails
photo not belonging to visit fails
inactive template fails
existing certificate returns existing result
invalid generated file type fails
duplicate generation does not create duplicate
```

---

## 28. Stamp Award Result Tests

Target:

```text
normalizeStampAwardResult
```

Test cases:

```text
earned returns success message
already_earned is non-fatal
no_stamp_available is non-fatal
failed returns warning but certificate remains success
```

---

# Export Unit Tests

---

## 29. CSV Escaping Tests

Target:

```text
escapeCsvValue
generateCsv
```

Test cases:

```text
plain text unchanged
value with comma quoted
value with quote escaped
value with newline quoted
Thai text preserved
null converted to blank or configured missing label
```

---

## 30. Export Column Tests

Target:

```text
getDefaultExportColumns
```

Test cases:

```text
visit export includes visit_id
visit export includes attraction_name
visit export excludes email
visit export excludes LINE user ID
visit export excludes provider_user_id
visit export excludes photo path
survey export excludes comments unless permission
comments included only with export.comments
```

---

## 31. Export File Name Tests

Target:

```text
generateExportFileName
```

Test cases:

```text
filename includes export type
filename includes timestamp
filename has .csv extension
filename contains no personal data
filename is URL/filesystem safe
```

---

# Error Handling Unit Tests

---

## 32. Error Mapping Tests

Target:

```text
mapDatabaseError
mapStorageError
mapZodError
```

Test cases:

```text
duplicate slug maps to DUPLICATE_SLUG
duplicate check-in code maps to DUPLICATE_CHECKIN_CODE
duplicate stamp maps to STAMP_ALREADY_EARNED
foreign key error maps to INVALID_RELATIONSHIP or NOT_FOUND
storage upload failure maps to UPLOAD_FAILED
zod error maps to fieldErrors
unexpected error maps to INTERNAL_ERROR
```

---

## 33. Safe Error Response Tests

Target:

```text
createErrorResponse
```

Test cases:

```text
does not include stack trace
does not include SQL query
does not include service key
includes stable error code
includes user-safe message
includes fieldErrors when validation fails
```

---

# Utility Unit Tests

---

## 34. Date Formatting Tests

Target:

```text
formatVisitDate
formatThaiBuddhistDate
formatDateRange
```

Test cases:

```text
English date formatted correctly
Thai date formatted correctly
Thai Buddhist year correct
invalid date handled safely
date range start after end rejected by validation
```

---

## 35. Slug Generation Tests

Target:

```text
generateSlug
normalizeSlug
```

Test cases:

```text
spaces become hyphens
uppercase becomes lowercase
unsafe characters removed
duplicate handling delegated to service/database
Thai slug policy follows design
empty string fails
```

---

## 36. Currency Formatting Tests

Target:

```text
formatEstimatedSpending
```

Test cases:

```text
min/max displays Estimated ฿min - ฿max
open-ended displays Estimated ฿min+
null displays No data
does not use word Revenue
```

---

# Component Unit Tests

---

## 37. Form Component Tests

Target components:

```text
MinimalProfileForm
SurveyForm
PhotoUploadField
AdminAttractionForm
CheckinCodeForm
```

Test cases:

```text
shows required field errors
submit disabled while loading
consent checkbox not pre-checked
photo accepted format hint visible
survey optional text visible
```

---

## 38. Dashboard Component Tests

Target components:

```text
KpiCard
DashboardFilterBar
FunnelChart
ChartEmptyState
ExportButton
```

Test cases:

```text
KPI card shows No data for null
percentage displays correctly
filter emits selected values
empty state renders when data empty
export button shows loading state
```

---

## 39. Certificate UI Component Tests

Target:

```text
CertificatePreview
CertificateDownloadCard
StampEarnedCard
```

Test cases:

```text
renders display name
renders attraction name
handles long display name
shows existing certificate state
shows stamp already earned as non-fatal
```

---

# Test Execution

---

## 40. Local Commands

Suggested commands:

```bash
npm run test
npm run test:unit
npm run test:watch
npm run typecheck
npm run lint
```

Recommended package scripts:

```json
{
  "test": "vitest",
  "test:unit": "vitest run tests/unit",
  "test:watch": "vitest --watch",
  "typecheck": "tsc --noEmit",
  "lint": "next lint"
}
```

---

## 41. CI Requirements

Minimum CI should run:

```text
typecheck
lint
unit tests
build
```

Unit tests must be fast enough to run on every pull request.

---

## 42. Unit Test Acceptance Checklist

```text
[ ] Tourist profile validation tests exist.
[ ] Consent validation tests exist.
[ ] Survey validation tests exist.
[ ] File type/size validation tests exist.
[ ] Storage path tests exist.
[ ] Dashboard formula tests exist.
[ ] Funnel conversion tests exist.
[ ] Satisfaction average tests exist.
[ ] Spending estimate tests exist.
[ ] Permission helper tests exist.
[ ] Export column privacy tests exist.
[ ] CSV escaping tests exist.
[ ] Error mapping tests exist.
[ ] Safe error response tests exist.
```

---

## 43. Do Not Do

Do not:

```text
Write tests that depend on production data.
Use real personal data in fixtures.
Test only happy paths.
Mock away the logic being tested.
Ignore null/empty cases.
Treat missing satisfaction as zero.
Allow export tests to include private identifiers.
Generate storage paths using original filenames.
```

---

## 44. Future Enhancements

Possible future improvements:

```text
property-based tests for CSV escaping
snapshot tests for export headers
golden metric test datasets
visual component tests
accessibility unit checks
mutation testing for critical formulas
```

---

## 45. Final Unit Test Rule

Unit tests should make critical rules hard to accidentally break.

If a rule affects privacy, metrics, permissions, or certificate completion, it deserves a unit test.
