# INTEGRATION_TEST_PLAN.md

## 1. Document Purpose

This document defines the integration test plan for the **Southern Border Tourism Data & Intelligence Platform**.

Integration tests verify that multiple parts of the system work together correctly, such as service layer, database, storage, authentication, authorization, and exports.

Integration testing is critical because this platform depends on connected workflows, not isolated screens.

---

## 2. Integration Test Mission

The mission of integration testing is:

```text
Verify that business workflows correctly connect database records, storage files, permissions, services, and analytics.
```

Integration tests should catch:

```text
broken service workflows
missing database relationships
wrong transaction order
duplicate records
storage/database mismatch
permission gaps
dashboard metric drift
export privacy leaks
audit log missing
```

---

## 3. Recommended Integration Test Stack

Recommended:

```text
Vitest
Supabase local development or dedicated test database
Test storage bucket or mocked storage adapter
Test service layer
Seed scripts
TypeScript
```

Optional:

```text
Testcontainers
PostgreSQL Docker
Supabase CLI local stack
MSW for external service mocks
```

---

## 4. Integration Test Environment

Use a separate test environment.

Never use production.

Recommended test database:

```text
southern_tourism_test
```

or Supabase local project.

Test environment should have:

```text
test auth users
test roles
test permissions
test attractions
test photo spots
test check-in codes
test storage buckets
test certificate templates
```

---

## 5. Test Isolation Rules

Each integration test should:

```text
start with known seed data
create its own records
clean up after itself
avoid depending on test execution order
avoid real external APIs
avoid real personal data
```

Strategies:

```text
transaction rollback
test-specific IDs
database cleanup hooks
fresh schema reset
```

---

## 6. Seed Data Requirements

Minimum seed data:

```text
provinces: Yala, Pattani, Narathiwat
districts for each province
countries including Thailand
transport modes
travel purposes
travel companions
expense categories
attraction types
active attraction
inactive attraction
published attraction
unpublished attraction
photo spot
active check-in code
inactive check-in code
expired check-in code
certificate template
admin user
viewer user
super admin user
```

---

# Core Workflow Integration Tests

---

## 7. QR Check-in Resolution Tests

Target services:

```text
CheckinService
AttractionRepository
PhotoSpotRepository
FunnelEventService
```

Test cases:

```text
valid active QR returns public check-in context
invalid QR returns QR_CODE_INVALID
inactive QR returns QR_CODE_INACTIVE
expired QR returns QR_CODE_EXPIRED
QR linked to inactive attraction is blocked
QR linked to inactive photo spot is blocked
QR response excludes admin notes/private fields
QR scan records funnel event if implemented
```

Expected safe public fields:

```text
checkinCodeId
attractionId
photoSpotId
attractionName
photoSpotName
provinceName
heroImageUrl
shortDescription
```

Must not return:

```text
admin notes
private storage paths
internal secrets
```

---

## 8. Tourist Profile and Visit Creation Tests

Target services:

```text
TouristService
VisitService
ConsentService
FunnelEventService
```

Test cases:

```text
new guest tourist creates tourist profile
new guest tourist creates anonymous identity
minimal profile creates visit
consent record is created
missing consent rejects creation
existing guest identity reuses tourist profile
returning tourist does not duplicate tourist
visit is linked to attraction and photo spot
invalid photo spot for attraction rejected
minimal_form_completed funnel event recorded
```

Important database assertions:

```text
tourists row exists
tourist_identities row exists
visits row exists
consent_records row exists
foreign keys valid
```

---

## 9. Returning Tourist Integration Tests

Target services:

```text
TouristService
VisitService
StampService
PassportService
```

Test cases:

```text
returning guest token loads existing tourist profile
scan new attraction creates new visit
same profile reused
profile fields prefilled
new attraction can earn new stamp
same attraction repeat visit creates visit but not duplicate stamp
guest token cannot access another tourist
```

Important rule:

```text
Repeat visits are allowed.
Duplicate stamp per tourist-attraction is not allowed.
```

---

## 10. Photo Upload Integration Tests

Target services:

```text
PhotoService
StorageAdapter
VisitRepository
FunnelEventService
```

Test cases:

```text
valid JPEG upload stores file and metadata
valid PNG upload stores file and metadata
valid WebP upload stores file and metadata
PDF upload rejected
SVG tourist upload rejected
large file rejected
visit ownership required
photo metadata linked to visit
photo_uploaded funnel event recorded
storage upload failure does not create metadata
metadata insert failure attempts cleanup
```

Database assertions:

```text
visit_photos row created
visit_id correct
storage_path generated server-side
mime_type correct
file_size_bytes correct
```

Storage assertions:

```text
file exists in test bucket
path contains no personal data
```

---

## 11. Certificate Generation Integration Tests

Target services:

```text
CertificateService
PhotoService
StorageAdapter
VisitService
StampService
FunnelEventService
```

Test cases:

```text
valid certificate generation stores certificate file
certificate record created
visit status updated to certificate_generated
certificate_generated funnel event recorded
stamp awarded
duplicate generation returns existing certificate
certificate generation without photo rejected
certificate generation for another tourist rejected
invalid certificate file rejected
storage failure returns safe error
stamp already earned is non-fatal
stamp failure returns partial success warning
```

Database assertions:

```text
certificates row exists
certificate path exists
visit completion_status updated
tourist_stamps row exists when applicable
no duplicate certificate for same visit
no duplicate stamp for same tourist-attraction
```

---

## 12. Digital Passport and Stamp Integration Tests

Target services:

```text
PassportService
StampService
TouristService
```

Test cases:

```text
earned stamp appears in passport
passport shows stamps grouped by province/attraction
guest token can access own passport
LINE-linked identity can access same passport
wrong guest token cannot access passport
repeat visit same attraction does not duplicate stamp
new attraction adds new stamp
```

Important privacy assertion:

```text
passport response does not expose provider_user_id
```

---

## 13. Survey Submission Integration Tests

Target services:

```text
SurveyService
VisitService
ExpenseRepository
SatisfactionRepository
FunnelEventService
DashboardService optional
```

Test cases:

```text
valid survey submission creates satisfaction record
expense range saved
travel behavior saved
survey_completed funnel event recorded
visit status updated to survey_completed if designed
survey for another tourist rejected
duplicate survey blocked or updated based on business rule
invalid score rejected
missing optional fields allowed
comment length enforced
```

Database assertions:

```text
satisfaction_surveys row exists
visit_expenses row exists if expense answered
visits travel behavior fields updated or related tables updated
unique survey per visit enforced
```

---

# Admin Integration Tests

---

## 14. Admin Authentication and Authorization Tests

Target:

```text
AuthService
Authorization helpers
Admin APIs/services
```

Test cases:

```text
anonymous cannot access admin service
inactive admin blocked
viewer can read dashboard
viewer cannot create attraction
admin can create attraction
admin cannot manage users
super_admin can manage users
permission check works on direct API call
```

Important:

```text
Frontend hiding buttons is not enough.
Integration tests should call services/API directly.
```

---

## 15. Attraction CMS Integration Tests

Target services:

```text
AdminAttractionService
AuditService
MediaService optional
```

Test cases:

```text
admin creates attraction
slug uniqueness enforced
admin updates attraction
admin publishes attraction
admin unpublishes attraction
admin deactivates attraction
viewer cannot create/update
audit log created for create/update/publish/deactivate
hard delete blocked if historical data exists
```

Database assertions:

```text
attractions row exists
audit_logs row exists
is_published updated
is_active updated
```

---

## 16. Photo Spot CMS Integration Tests

Target services:

```text
AdminPhotoSpotService
AuditService
```

Test cases:

```text
admin creates photo spot
photo spot must belong to attraction
admin updates photo spot
admin deactivates photo spot
inactive photo spot hidden from public flow
viewer cannot mutate
audit log created
```

---

## 17. Check-in Code CMS Integration Tests

Target services:

```text
AdminCheckinCodeService
CheckinService
AuditService
```

Test cases:

```text
admin creates check-in code
code uniqueness enforced
unsafe code rejected
photo spot must belong to attraction
starts_at after ends_at rejected
admin deactivates check-in code
deactivated code no longer resolves publicly
audit log created
viewer cannot mutate
```

---

## 18. Admin Media Upload Integration Tests

Target services:

```text
MediaService
StorageAdapter
AuditService
Authorization
```

Test cases:

```text
admin uploads attraction image
viewer upload rejected
invalid image type rejected
large image rejected
metadata saved
public attraction media URL available if published
audit log created
```

---

# Dashboard Integration Tests

---

## 19. Executive Dashboard Metrics Tests

Target:

```text
DashboardService
```

Seed scenario:

```text
2 tourists
3 visits
2 certificates
2 stamps
1 survey
1 QR scan event not converted to visit
```

Expected:

```text
tourist_profile_count = 2
visit_count = 3
certificate_count = 2
stamp_count = 2
survey_completion_rate = 1/2
QR scan not counted as visit
```

---

## 20. Tourist Profile Dashboard Tests

Test cases:

```text
date filter counts tourists through visits
domestic and foreign origin distribution correct
age group distribution correct
preferred language distribution correct
identity provider distribution excludes provider_user_id
returning tourist count correct
```

---

## 21. Travel Behavior Dashboard Tests

Test cases:

```text
transport mode distribution correct
travel purpose distribution correct
average group size ignores null
overnight rate handles null denominator
average nights ignores null
province/attraction filters apply
```

---

## 22. Expense Dashboard Tests

Test cases:

```text
spending range distribution correct
estimated min/max correct
open-ended range handled
prefer_not_to_answer ignored in estimate
expense category distribution correct
expense by province applies filters
labels use estimated spending not revenue
```

---

## 23. Satisfaction Dashboard Tests

Test cases:

```text
average satisfaction ignores null
no responses returns null not zero
revisit intention rate handles null denominator
recommendation rate handles null denominator
low satisfaction alert works
small sample warning condition works
satisfaction by attraction correct
```

---

## 24. Funnel Dashboard Tests

Test cases:

```text
stage counts correct
conversion correct
dropoff correct
zero denominator returns null
funnel by attraction correct
funnel by photo spot correct
largest dropoff step correct
event counts not treated as unique tourists unless session logic exists
```

---

## 25. Sustainable Tourism Dashboard Tests

Test cases:

```text
high visit high satisfaction classified as flagship
high visit low satisfaction classified as improvement priority
low visit high satisfaction classified as promotion opportunity
low visit low satisfaction classified as needs diagnosis
insufficient response count lowers confidence
attraction concentration correct
data limitations returned
```

---

# Export and Reporting Integration Tests

---

## 26. Visit Export Integration Tests

Target:

```text
ExportService
AuditService
Dashboard/Repository queries
```

Test cases:

```text
admin can export visit CSV
viewer cannot export
CSV includes expected headers
CSV includes Thai text correctly
CSV excludes email
CSV excludes LINE user ID
CSV excludes provider_user_id
CSV excludes photo path
CSV excludes certificate private path
audit log created with filters and row count
```

---

## 27. Satisfaction Export Integration Tests

Test cases:

```text
survey export includes scores
survey export excludes comments by default
comments included only with export.comments permission
missing scores exported as blank/not answered
audit log created
```

---

## 28. Expense Export Integration Tests

Test cases:

```text
expense export includes spending range
expense export includes amount_min/amount_max
open-ended range handled
currency included
estimated label/metadata available
private identifiers excluded
```

---

## 29. Dashboard Summary Export Integration Tests

Test cases:

```text
dashboard summary export uses DashboardService
metric values match dashboard response
limitations included or referenced
audit log created
```

---

# Security and Privacy Integration Tests

---

## 30. Consent Integration Tests

Test cases:

```text
profile creation without consent rejected
profile creation with consent creates consent_records
consent version stored
consent source stored
photo usage notice exists in UI test or component test
survey optional notice exists
LINE link consent separate if implemented
```

---

## 31. Privacy Leak Integration Tests

Test API/export responses for absence of:

```text
email
LINE user ID
provider_user_id
guest token
device token
service role key
private storage path
signed URL stored in database
raw comments where not permitted
```

---

## 32. RLS/Database Access Integration Tests

If using Supabase RLS:

```text
anon cannot select tourists
anon cannot select tourist_identities
anon cannot select visits
anon cannot select visit_photos
anon cannot select certificates
anon can read published attractions
anon cannot read unpublished attractions
viewer cannot update attractions
admin policies work if direct access used
```

---

## 33. Audit Logging Integration Tests

Test:

```text
attraction publish audited
check-in code deactivate audited
export audited
role assignment audited
permission denied on sensitive export audited
audit metadata redacts secrets
audit log read requires audit.read
```

---

# Background/Job Integration Tests

---

## 34. Cleanup Job Integration Tests

Future test cases:

```text
temp uploads older than threshold deleted
orphan files deleted after safe threshold
referenced files not deleted
expired export files deleted
job run logged
cleanup failure logged
```

---

## 35. Summary Refresh Integration Tests

Future test cases:

```text
daily attraction stats refresh correct
monthly province stats refresh correct
funnel summary refresh correct
upsert does not duplicate summary rows
dashboard can read summary table
```

---

# Failure and Transaction Tests

---

## 36. Partial Failure Tests

Test:

```text
photo storage upload succeeds but metadata insert fails -> cleanup attempted
certificate file upload succeeds but DB insert fails -> cleanup attempted
certificate created but stamp award fails -> certificate remains available with warning
export generation fails -> audit failed result
survey submit partially fails -> no corrupted duplicate data
```

---

## 37. Idempotency Tests

Test:

```text
double-click minimal profile submit does not duplicate tourist identity
double-click photo upload follows defined replace/multiple policy
double-click certificate generation returns existing certificate
double-click survey submit blocked or updates based on rule
repeat visit same attraction creates visit but no duplicate stamp
```

---

# Test Execution

---

## 38. Suggested Commands

```bash
npm run test:integration
npm run test:db
npm run test:security
```

Suggested package scripts:

```json
{
  "test:integration": "vitest run tests/integration",
  "test:db": "vitest run tests/integration/database",
  "test:security": "vitest run tests/security"
}
```

---

## 39. CI Strategy

Integration tests can be slower than unit tests.

Recommended:

```text
run critical integration tests on every pull request
run full integration suite before release
run database/RLS tests before deployment
```

Minimum CI:

```text
unit tests
critical integration tests
build
```

---

## 40. Integration Test Acceptance Checklist

```text
[ ] QR resolution integration tests exist.
[ ] Tourist profile + visit creation tests exist.
[ ] Consent record integration tests exist.
[ ] Returning tourist tests exist.
[ ] Photo upload integration tests exist.
[ ] Certificate generation integration tests exist.
[ ] Stamp duplicate prevention tests exist.
[ ] Survey submit integration tests exist.
[ ] Admin CMS integration tests exist.
[ ] Permission integration tests exist.
[ ] Dashboard metric integration tests exist.
[ ] Export privacy integration tests exist.
[ ] Audit log integration tests exist.
[ ] RLS/security integration tests exist or are planned.
```

---

## 41. Do Not Do

Do not:

```text
Run integration tests against production.
Use real tourist data.
Skip cleanup.
Depend on test order.
Mock database when the goal is database integration.
Ignore partial failure cases.
Ignore permission checks.
Ignore export privacy.
```

---

## 42. Future Enhancements

Possible future improvements:

```text
Supabase local automated reset
testcontainers setup
golden dashboard dataset
export golden files
background job test harness
RLS policy regression tests
storage emulator
LINE LIFF mock server
```

---

## 43. Final Integration Test Rule

Integration tests should prove that the system workflows are actually connected correctly.

A feature is not production-ready until its database, service, storage, permission, and audit behavior work together.
