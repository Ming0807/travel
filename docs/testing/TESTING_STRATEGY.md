# TESTING_STRATEGY.md

## 1. Document Purpose

This document defines the overall testing strategy for the **Southern Border Tourism Data & Intelligence Platform**.

The system is intended to be production-oriented and usable for a real academic/university-level database project. Therefore, testing must cover more than whether pages render.

Testing must verify:

```text
database correctness
tourist flow usability
admin CMS reliability
backend business rules
security and privacy controls
dashboard metric accuracy
export correctness
PWA/mobile behavior
performance
deployment readiness
```

---

## 2. Testing Mission

The testing mission is:

```text
Prove that the system works correctly, protects data, supports real users, and produces trustworthy analytics.
```

Testing must protect against:

```text
broken tourist QR flow
bad database relationships
duplicate or dirty data
incorrect dashboard metrics
privacy leaks
unsafe exports
file upload vulnerabilities
slow pages
admin permission mistakes
deployment failures
```

---

## 3. Testing Scope

Testing applies to:

```text
frontend UI
tourist flow
admin backoffice
backend APIs/server actions
database schema
Supabase policies/RLS
storage/file upload
certificate generation
digital passport/stamps
survey/expense/satisfaction collection
dashboard analytics
exports/reports
security/PDPA controls
performance
deployment
```

---

## 4. Testing Levels

The project should use several levels of testing:

```text
unit tests
integration tests
end-to-end tests
database tests
API tests
security tests
performance tests
UX tests
accessibility tests
acceptance tests
manual QA
```

MVP does not need perfect coverage, but the most important flows must be tested.

---

## 5. Recommended Testing Stack

Recommended for Next.js/Supabase project:

```text
Vitest
React Testing Library
Playwright
TypeScript
ESLint
Prettier
Supabase local testing or test database
Zod schema tests
```

Optional:

```text
Lighthouse
axe-core / Playwright accessibility checks
k6 or Artillery for load testing
```

---

## 6. Test Environment Strategy

## 6.1 Local Development

Purpose:

```text
fast developer feedback
manual testing
unit/integration tests
```

Uses:

```text
local env variables
test database or local Supabase
seed data
mock storage where possible
```

## 6.2 Staging Environment

Purpose:

```text
pre-production validation
E2E testing
deployment testing
admin review
```

Should use:

```text
staging database
staging storage buckets
test LINE LIFF if needed
test data only
```

## 6.3 Production Environment

Purpose:

```text
real use
monitoring
smoke tests only
```

Do not run destructive tests in production.

---

## 7. Test Data Strategy

Use seed data for:

```text
provinces: Yala, Pattani, Narathiwat
districts
attraction types
attractions
photo spots
check-in codes
transport modes
travel purposes
travel companions
expense categories
certificate templates
admin users/roles
```

Use synthetic tourist data only.

Do not use real personal data in tests.

---

## 8. Critical User Journeys

The following journeys must be tested carefully.

## 8.1 Tourist QR to Certificate

```text
scan QR
view attraction landing page
start certificate flow
fill minimal profile
upload photo
preview certificate
generate certificate
download certificate
earn stamp
see optional survey prompt
```

## 8.2 Returning Tourist

```text
return with guest token
scan QR at another attraction
profile prefill works
minimal re-entry
new visit created
new stamp earned if new attraction
same attraction repeat visit allowed
duplicate stamp prevented
```

## 8.3 Optional Survey

```text
open survey after certificate
answer travel behavior
answer expense range
answer satisfaction
submit survey
dashboard metrics update
```

## 8.4 Admin CMS

```text
admin login
create attraction
add photo spot
create check-in code
publish attraction
view QR/check-in link
update attraction
deactivate check-in code
```

## 8.5 Dashboard and Export

```text
admin opens dashboard
uses filters
metrics load
charts display
export summary CSV
export visit CSV
export excludes private identifiers
audit log created
```

---

## 9. Unit Testing Strategy

Unit tests should cover small logic pieces.

Examples:

```text
Zod validation schemas
date formatting
currency/spending range calculation
dashboard metric formulas
funnel conversion calculation
permission helper logic
slug generation
storage path generation
error mapping
CSV escaping
```

---

## 10. Unit Test Examples

## 10.1 Funnel Conversion

Input:

```text
previous = 100
current = 60
```

Expected:

```text
conversion = 0.6
dropoff = 0.4
```

Input:

```text
previous = 0
current = 0
```

Expected:

```text
conversion = null
dropoff = null
```

## 10.2 Average Satisfaction

Input:

```text
scores = [5, 4, null, 3]
```

Expected:

```text
average = 4
```

Do not treat null as 0.

## 10.3 Estimated Spending

Input:

```text
ranges:
0_500
501_1000
5001_plus
```

Expected:

```text
min = 0 + 501 + 5001
max = 500 + 1000 + null/open-ended
hasOpenEndedRange = true
```

## 10.4 Storage Path

Generated path must not contain:

```text
tourist name
email
LINE ID
original filename
```

---

## 11. Integration Testing Strategy

Integration tests should verify modules working together.

Examples:

```text
tourist profile creation creates tourist + identity + consent + visit
photo upload creates storage object + visit_photos metadata
certificate generation creates certificate + updates visit + awards stamp
survey submit writes survey/expense/travel behavior
admin create attraction writes attraction + audit log
export creates CSV + audit log
```

---

## 12. API Testing Strategy

API/server actions should test:

```text
valid input
invalid input
unauthorized
forbidden
not found
duplicate conflict
ownership violation
file too large
invalid file type
success response shape
error response shape
```

APIs must not leak:

```text
stack traces
SQL errors
service keys
private paths
provider_user_id
```

---

## 13. Database Testing Strategy

Database tests should cover:

```text
foreign keys
unique constraints
check constraints
indexes
RLS policies
seed data
migration order
analytics queries
```

Critical constraints:

```text
unique attractions.slug
unique checkin_codes.code
unique tourist_identities(provider, provider_user_id)
unique tourist_stamps(tourist_id, attraction_id)
unique satisfaction_surveys(visit_id)
score ranges 1-5
status values
```

---

## 14. RLS Testing Strategy

Test with different clients:

```text
anonymous
tourist/guest via API
viewer admin
admin
super_admin
service role server-only
```

Required checks:

```text
anon can read published attractions
anon cannot read tourists
anon cannot read visits
anon cannot read tourist_identities
anon cannot read private photos
viewer cannot mutate data
admin can manage content
super_admin can read audit logs
```

---

## 15. Frontend Component Testing

Test key components:

```text
QR landing page
minimal profile form
photo upload component
certificate preview component
survey form
passport/stamp view
admin table
admin modal/form
dashboard KPI cards
dashboard filters
export button
empty/loading/error states
```

---

## 16. E2E Testing Strategy

Use Playwright for full flows.

Required MVP E2E tests:

```text
public attraction page loads
valid QR check-in flow
invalid QR error page
tourist certificate flow
returning tourist flow
survey submit flow
admin login
admin create attraction
admin create QR/check-in code
dashboard filter flow
export flow
permission denied flow
```

---

## 17. Security Testing Strategy

Security tests should verify:

```text
admin routes require login
admin APIs reject anonymous access
viewer cannot write
tourist cannot access another visit
invalid file type rejected
large upload rejected
export requires permission
exports exclude identifiers
private storage not public
service role not exposed in bundle
RLS blocks direct reads
cron endpoints protected
```

---

## 18. Privacy Testing Strategy

Privacy tests should verify:

```text
consent required before profile save
consent checkbox not pre-checked
LINE optional
email optional/future
survey optional
photo notice visible
certificate does not include private identifiers
dashboard shows aggregate data
exports exclude personal identifiers
raw comments restricted
anonymization strategy works future
```

---

## 19. Image Upload Testing Strategy

Test:

```text
valid JPG
valid PNG
valid WebP
SVG rejected
PDF rejected
HTML renamed .jpg rejected
large image rejected
missing file rejected
wrong visit ownership rejected
duplicate upload behavior
storage failure
metadata save failure
private URL strategy
```

---

## 20. Certificate Testing Strategy

Test:

```text
preview data loads
missing visit rejected
missing photo rejected
invalid template rejected
certificate generated
certificate file stored
certificate record created
duplicate generation returns existing
stamp awarded
duplicate stamp not fatal
download works
Thai certificate
English certificate
long display name
mobile rendering
```

---

## 21. Dashboard Metric Testing Strategy

Dashboard tests are critical because wrong numbers damage project credibility.

Test:

```text
visit count excludes QR scans
tourist profile count uses distinct tourist_id through visits
certificate count uses certificate records
stamp count follows unique tourist-attraction rule
survey completion handles zero denominator
average satisfaction ignores null
estimated spending labeled as estimated
funnel conversion handles zero denominator
filters apply correctly
```

---

## 22. Export Testing Strategy

Test:

```text
CSV generated
Thai text opens correctly
headers correct
commas/quotes/newlines escaped
permission required
audit log created
default export excludes email/LINE ID/provider_user_id
comments excluded unless permission
large export handled
no data export behavior
```

---

## 23. Performance Testing Strategy

MVP performance checks:

```text
QR landing loads quickly
tourist form submit is responsive
photo upload handles expected file size
certificate generation does not hang
admin list pagination works
dashboard queries complete within acceptable time
export small CSV completes
```

Future performance tests:

```text
1000 visits
10000 visits
large dashboard date range
large export
concurrent photo uploads
concurrent QR scans
```

---

## 24. Accessibility Testing Strategy

Test:

```text
keyboard navigation
form labels
error messages linked to fields
color contrast
button focus states
dashboard table alternatives
image alt text for attraction images
language switching
screen-reader friendly loading/error states
```

---

## 25. UX Testing Strategy

Tourist UX tests should measure:

```text
can user understand QR landing page?
can user complete minimal form quickly?
does user understand why data is requested?
is photo upload easy on mobile?
does certificate feel rewarding?
does survey feel optional and short?
does passport save value make sense?
```

Admin UX tests should measure:

```text
can admin create attraction?
can admin create QR/check-in code?
can admin understand dashboard metrics?
can admin export data safely?
```

---

## 26. Regression Testing Strategy

Before release, retest:

```text
QR flow
certificate generation
photo upload
survey submit
admin login
admin CRUD
dashboard metrics
export
permissions
storage access
```

Every major change should not break core flow.

---

## 27. Smoke Testing Strategy

After deployment, run quick smoke tests:

```text
home page loads
public attraction page loads
valid QR resolves
admin login works
dashboard loads
storage upload test in staging
export test in staging
```

Do not use real personal data for smoke testing.

---

## 28. Test Naming Convention

Use descriptive names.

Good:

```text
should reject inactive QR code
should not count QR scans as visits
should exclude LINE ID from default visit export
should return existing certificate on duplicate generation
```

Bad:

```text
test1
works
api test
```

---

## 29. Test File Organization

Recommended:

```text
tests/
  unit/
    validation/
    dashboard/
    utils/
  integration/
    tourist-flow/
    admin/
    exports/
  e2e/
    tourist-certificate.spec.ts
    admin-cms.spec.ts
    dashboard.spec.ts
    export.spec.ts
  security/
    permissions.spec.ts
    rls.spec.ts
    file-upload.spec.ts
```

If colocating tests:

```text
src/server/services/__tests__/
src/components/__tests__/
```

is also acceptable.

---

## 30. CI Testing Strategy

Recommended CI steps:

```text
install dependencies
typecheck
lint
unit tests
integration tests
build
E2E tests against preview/staging future
```

Minimum MVP CI:

```text
typecheck
lint
unit tests
build
```

---

## 31. Manual QA Checklist

Manual QA should verify:

```text
mobile layout
Thai/English text
real phone QR scan
photo upload from camera/gallery
certificate download on mobile
LINE browser behavior if used
admin CRUD
dashboard readability
export CSV in Excel
```

---

## 32. Definition of Done

A feature is not done until:

```text
implementation complete
validation implemented
error handling implemented
permission checks implemented if needed
unit/integration tests added where useful
manual QA completed for UI flow
documentation updated
no private data leaked
```

---

## 33. MVP Test Priority

Highest priority tests:

```text
tourist QR-to-certificate E2E
minimal profile validation
photo upload validation
certificate generation idempotency
stamp duplicate prevention
survey submit
admin attraction/check-in CRUD
dashboard metric correctness
export privacy
admin permission checks
```

Medium priority:

```text
passport save/link
official data import future
advanced dashboard insights
background jobs
```

---

## 34. Testing Responsibilities

Developers:

```text
unit tests
integration tests
API tests
fix failing tests
```

QA/manual tester:

```text
E2E manual flow
mobile testing
UX testing
browser testing
```

Project owner/researcher:

```text
acceptance testing
metric validation
academic report verification
```

Security reviewer:

```text
permission tests
privacy tests
export checks
storage checks
```

---

## 35. Bug Severity Levels

## 35.1 Critical

Examples:

```text
personal data leak
service role exposed
admin auth bypass
certificate generation completely broken
photo upload exposes private files
export includes LINE IDs by default
```

Release blocker.

## 35.2 High

Examples:

```text
QR flow broken for valid code
dashboard metrics incorrect
survey cannot submit
admin cannot create attractions
permissions wrong
```

Fix before release.

## 35.3 Medium

Examples:

```text
UI spacing issue
non-critical dashboard chart fails
minor validation message issue
export formatting issue
```

Fix before final submission if possible.

## 35.4 Low

Examples:

```text
minor typo
small alignment issue
non-blocking UX polish
```

Fix when convenient.

---

## 36. Test Evidence for Academic Report

For project reporting, keep evidence:

```text
screenshots of test flows
test case table
acceptance checklist
sample dashboard output
sample export file
database constraint explanation
security/privacy checklist
```

This supports academic documentation.

---

## 37. MVP Acceptance Checklist

```text
[ ] Test strategy document exists.
[ ] Critical user journeys are defined.
[ ] Unit test targets are defined.
[ ] Integration test targets are defined.
[ ] E2E test targets are defined.
[ ] Security test targets are defined.
[ ] Privacy test targets are defined.
[ ] Dashboard metric tests are defined.
[ ] Export tests are defined.
[ ] Manual QA checklist is defined.
[ ] Definition of Done is defined.
```

---

## 38. Do Not Do

Do not:

```text
Test only happy paths.
Skip permission tests.
Skip export privacy tests.
Use real personal data in tests.
Count dashboard visual rendering as metric correctness.
Ignore mobile testing.
Ignore LINE browser if LIFF is used.
Deploy without testing QR-to-certificate flow.
Treat missing satisfaction as zero in tests.
```

---

## 39. Future Enhancements

Possible future testing improvements:

```text
automated E2E in CI
visual regression testing
load testing
database migration tests
RLS automated tests
privacy snapshot tests
export golden file tests
Lighthouse CI
accessibility CI
security scanning
```

---

## 40. Final Testing Rule

Testing must prove that the system is useful, correct, secure, and trustworthy.

For this project, a beautiful interface is not enough if the data, permissions, dashboard metrics, or exports are wrong.
