# CODEX_TESTING_PROMPT.md

## 1. Purpose

Use this prompt when asking Codex to create, improve, review, or debug tests for the **Southern Border Tourism Data & Intelligence Platform**.

This project is a production-oriented tourism database platform. Testing must prove that the system is correct, secure, privacy-safe, mobile-usable, and analytically trustworthy.

Testing must cover:

```text
tourist QR-to-certificate flow
minimal tourist profile and consent
photo upload security
certificate generation
digital stamp/passport
optional survey
admin CMS
dashboard metrics
exports
permissions
tourist ownership
PDPA/privacy
performance-sensitive flows
```

---

## 2. Testing Mission

The testing mission is:

```text
Prove that the platform can safely collect tourist participation data and convert it into trustworthy planning analytics.
```

Tests should protect:

```text
tourist experience
database integrity
privacy
permissions
file upload safety
certificate idempotency
stamp duplicate prevention
dashboard metric correctness
export safety
admin workflow correctness
```

---

## 3. Required Opening Instruction for Codex

Start testing tasks with:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.
Write tests that protect real product behavior, not only happy paths.
Use synthetic data only.
Do not use production data or real personal data.
Do not weaken assertions for security, privacy, dashboard metrics, or exports.
```

---

## 4. Documents to Read Before Testing Work

Codex should read:

```text
CODEX_MAIN_PROMPT.md
docs/testing/TESTING_STRATEGY.md
docs/testing/UNIT_TEST_PLAN.md
docs/testing/INTEGRATION_TEST_PLAN.md
docs/testing/E2E_TEST_PLAN.md
docs/testing/UX_TEST_PLAN.md
docs/testing/PERFORMANCE_TEST_PLAN.md
docs/testing/SECURITY_TEST_PLAN.md
docs/testing/ACCEPTANCE_CRITERIA.md
checklists/TESTING_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/DASHBOARD_CHECKLIST.md
checklists/PRODUCTION_RELEASE_CHECKLIST.md
```

For feature-specific tests, also read the relevant module docs.

Examples:

QR flow:

```text
docs/modules/MODULE_02_QR_CHECKIN.md
```

Photo upload:

```text
docs/modules/MODULE_05_PHOTO_UPLOAD.md
docs/security/IMAGE_UPLOAD_SECURITY.md
```

Dashboard:

```text
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
```

Export:

```text
docs/backend/EXPORT_REPORTING_SERVICES.md
docs/security/AUDIT_LOGGING.md
```

---

## 5. Recommended Testing Stack

Recommended:

```text
Vitest
React Testing Library
Playwright
TypeScript
Supabase local/test database
synthetic seed data
```

Optional:

```text
MSW
Testcontainers
Lighthouse CI
gitleaks/trufflehog
axe accessibility checks
```

---

## 6. Test Folder Structure

Recommended:

```text
tests/
  unit/
    validation/
    permissions/
    dashboard/
    export/
    storage/
    utils/
  integration/
    qr-checkin/
    tourist-flow/
    photo-upload/
    certificate/
    survey/
    admin/
    dashboard/
    export/
    security/
  e2e/
    tourist-certificate-flow.spec.ts
    admin-cms.spec.ts
    dashboard.spec.ts
    export.spec.ts
    permissions.spec.ts
  security/
    rls/
    storage/
    export/
    ownership/
```

Colocated tests are acceptable if the existing codebase already uses that pattern.

---

# Global Testing Rules

---

## 7. Test Data Rules

Use synthetic data only.

Do not use:

```text
real tourist names
real LINE IDs
real email addresses
real phone numbers
real photos
real national ID/passport numbers
real full addresses
production database data
```

Good examples:

```text
Test Tourist
test-tourist@example.test
anonymous_device_test_001
Sample Attraction
Yala Test Attraction
```

---

## 8. Test Isolation Rules

Tests should:

```text
not depend on execution order
not use production services
not mutate production data
clean up after themselves where needed
use test database/storage
use stable synthetic seed data
```

Integration/E2E tests should be able to run repeatedly.

---

## 9. Required Negative Tests

For every important feature, test failure cases:

```text
missing required fields
invalid enum values
unauthorized user
forbidden role
wrong tourist ownership
duplicate submit
invalid file type
oversized file
zero denominator
missing/null dashboard data
too-large export
invalid QR
inactive QR
expired QR
```

Do not test only happy paths.

---

## 10. Privacy Assertion Rule

For any dashboard/export/API response that could contain tourist data, assert absence of private identifiers.

Common forbidden fields:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw IP
raw user agent
private photo path
private certificate path
signed URL stored permanently
raw comments unless explicitly permitted
```

---

## 11. Dashboard Metric Assertion Rule

Dashboard tests must verify formulas, not only that UI renders.

Critical assertions:

```text
QR scans are not visits.
Tourist Profiles are not verified unique people.
Estimated Spending is not Revenue.
Missing satisfaction is null/No data, not 0.
Zero denominator returns null/No data.
Average satisfaction excludes null values.
Survey completion rate uses documented denominator.
```

---

## 12. Export Assertion Rule

Export tests must inspect the CSV content.

Test:

```text
headers
Thai text preservation
comma escaping
quote escaping
newline escaping
privacy exclusions
row limits
audit log creation
permission denial
```

Do not only test that a download button exists.

---

# Unit Testing Prompts

---

## 13. Unit Test Prompt Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Write unit tests for [module/function/schema].

Context:
[Explain why this logic matters.]

Read first:
- prompts/CODEX_TESTING_PROMPT.md
- docs/testing/UNIT_TEST_PLAN.md
- checklists/TESTING_CHECKLIST.md
- [relevant feature docs]

Requirements:
- Test happy path.
- Test invalid input.
- Test null/empty edge cases.
- Test privacy/security rules if relevant.
- Use synthetic data only.
- Keep tests deterministic.
- Do not mock away the logic being tested.

Validation:
- Run relevant test command if available.
- Report failures honestly.

Completion response:
Summary
Files changed
Validation
Coverage notes
Risks / Notes
Next suggested task
```

---

## 14. Validation Unit Tests

Prompt:

```text
Write unit tests for validation schemas.

Cover:
- tourist minimal profile
- consent
- visit creation
- survey
- expense
- satisfaction score
- admin attraction
- photo spot
- check-in code
- dashboard filters
- export filters

Important:
- LINE/email/phone are not required for certificate flow.
- Consent is required.
- National ID/full address/exact birthdate are not accepted.
- Satisfaction scores must be 1-5.
- Missing optional survey answers can be null.
```

---

## 15. Permission Unit Tests

Prompt:

```text
Write unit tests for permission helpers.

Cover:
- super_admin has all intended permissions
- admin can manage content
- admin cannot manage users unless permitted
- viewer can read dashboard
- viewer cannot mutate data
- viewer cannot export detailed data
- inactive admin is blocked
- missing user is unauthorized
- missing permission is forbidden
```

---

## 16. Dashboard Formula Unit Tests

Prompt:

```text
Write unit tests for dashboard metric formulas.

Cover:
- survey completion rate
- average satisfaction
- funnel conversion
- funnel drop-off
- estimated spending min/max
- open-ended spending range
- attraction concentration
- planning quadrant classification
- zero denominator
- null/missing values

Critical:
- Missing satisfaction is not 0.
- Estimated spending is not revenue.
- QR scans are not visits.
```

---

## 17. File Validation Unit Tests

Prompt:

```text
Write unit tests for file validation and storage path generation.

Cover:
- JPEG accepted
- PNG accepted
- WebP accepted
- SVG rejected
- PDF rejected
- HTML/JS rejected
- oversized file rejected
- empty file rejected
- generated path contains no tourist name
- generated path contains no email/LINE ID
- generated path does not use original filename
```

---

## 18. CSV/Export Unit Tests

Prompt:

```text
Write unit tests for CSV/export helpers.

Cover:
- comma escaping
- quote escaping
- newline escaping
- Thai text
- null value handling
- safe filename generation
- default export columns
- private identifier exclusions
- comment exclusion unless permission allows
```

---

# Integration Testing Prompts

---

## 19. Integration Test Prompt Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Write integration tests for [workflow].

Context:
[Explain workflow and why it matters.]

Read first:
- prompts/CODEX_TESTING_PROMPT.md
- docs/testing/INTEGRATION_TEST_PLAN.md
- checklists/TESTING_CHECKLIST.md
- [relevant feature docs]

Requirements:
- Use test database/storage or configured mocks.
- Use synthetic data only.
- Test happy path.
- Test important failure cases.
- Assert database state.
- Assert privacy/security constraints.
- Assert audit logs if relevant.
- Keep tests isolated and repeatable.

Validation:
- Run relevant integration test command if available.
- Report not-run commands honestly.

Completion response:
Summary
Files changed
Validation
Coverage notes
Risks / Notes
Next suggested task
```

---

## 20. QR Integration Tests

Prompt:

```text
Write integration tests for QR/check-in resolution.

Cover:
- active QR resolves
- invalid QR safe error
- inactive QR unavailable
- expired QR unavailable
- inactive attraction blocked
- inactive photo spot blocked
- public response excludes admin notes/private paths
- funnel event recorded if implemented

Important:
- QR scan does not create a visit.
- QR scan is not counted as visit.
```

---

## 21. Tourist Profile + Consent Integration Tests

Prompt:

```text
Write integration tests for minimal tourist profile and visit creation.

Cover:
- new guest tourist profile created
- anonymous identity created
- visit record created
- consent record created
- missing consent rejected
- returning guest reuses tourist
- duplicate identity handled safely
- invalid attraction/photo spot rejected
```

---

## 22. Photo Upload Integration Tests

Prompt:

```text
Write integration tests for tourist photo upload.

Cover:
- valid JPEG/PNG/WebP accepted
- invalid files rejected
- oversized file rejected
- wrong visit ownership rejected
- storage path is safe
- metadata created only after successful upload
- upload failure handled
- photo_uploaded funnel event recorded if implemented
```

---

## 23. Certificate Integration Tests

Prompt:

```text
Write integration tests for certificate generation.

Cover:
- valid certificate generation
- certificate record created
- certificate file stored
- visit status updated
- stamp awarded
- duplicate certificate generation idempotent
- duplicate stamp handled as already earned
- missing photo rejected
- wrong tourist ownership rejected
```

---

## 24. Survey Integration Tests

Prompt:

```text
Write integration tests for optional survey.

Cover:
- valid survey submission
- expense range stored
- travel behavior stored
- satisfaction stored
- optional comment can be empty
- invalid score rejected
- duplicate survey behavior controlled
- wrong tourist ownership rejected
- survey_completed event recorded if implemented
```

---

## 25. Admin Integration Tests

Prompt:

```text
Write integration tests for admin CMS and permissions.

Cover:
- anonymous blocked
- viewer can read allowed dashboard
- viewer cannot create/update/delete
- admin can create attraction
- admin can create photo spot
- admin can create check-in code
- duplicate check-in code rejected
- deactivated code unavailable publicly
- audit log created for sensitive actions
```

---

## 26. Dashboard Integration Tests

Prompt:

```text
Write integration tests for dashboard services using known seed data.

Cover:
- executive KPI values
- tourist profile distributions
- travel behavior metrics
- expense metrics
- satisfaction metrics
- funnel metrics
- filters
- empty/no-data states
- response privacy

Critical:
- visits != QR scans
- null satisfaction excluded
- estimated spending not revenue
- no private identifiers in response
```

---

## 27. Export Integration Tests

Prompt:

```text
Write integration tests for export service.

Cover:
- admin export success
- viewer export denied
- filters applied
- CSV generated correctly
- Thai text preserved
- private identifiers excluded
- comments excluded by default
- comments included only with permission if implemented
- audit log created
- too-large export rejected
```

---

# E2E Testing Prompts

---

## 28. E2E Test Prompt Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Write Playwright E2E tests for [flow].

Read first:
- prompts/CODEX_TESTING_PROMPT.md
- docs/testing/E2E_TEST_PLAN.md
- checklists/TESTING_CHECKLIST.md
- [relevant feature docs]

Requirements:
- Use synthetic staging/test data.
- Test realistic user steps.
- Assert visible user outcomes.
- Assert no raw technical errors.
- Add mobile viewport if tourist flow.
- Keep test stable.

Validation:
- Run Playwright test if available.
- Report if not run.

Completion response:
Summary
Files changed
Validation
Coverage notes
Risks / Notes
Next suggested task
```

---

## 29. Tourist QR-to-Certificate E2E Prompt

```text
Write E2E tests for the core tourist flow.

Steps:
1. Open active QR URL.
2. See attraction landing.
3. Start certificate flow.
4. Fill display name, origin, age group.
5. Check consent.
6. Upload valid photo.
7. See certificate preview.
8. Generate certificate.
9. Download certificate.
10. See stamp earned/already-earned message.
11. See optional survey CTA.

Also test:
- invalid QR
- inactive QR
- mobile viewport
```

---

## 30. Returning Tourist E2E Prompt

```text
Write E2E tests for returning tourist flow.

Steps:
1. Complete certificate flow at attraction A.
2. Open attraction B QR in same browser.
3. Verify profile is reused or shortened.
4. Generate certificate for attraction B.
5. Verify new stamp earned.
6. Repeat attraction A and verify no duplicate stamp error shown to user.
```

---

## 31. Admin E2E Prompt

```text
Write E2E tests for admin flow.

Steps:
1. Anonymous blocked from admin.
2. Admin login.
3. Create attraction.
4. Create photo spot.
5. Create check-in code.
6. Copy/open QR link.
7. Deactivate check-in code.
8. Verify public QR unavailable.
9. Open dashboard.
10. Export summary CSV.
```

---

# Security Testing Prompts

---

## 32. Security Test Prompt Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Write security tests for [area].

Read first:
- prompts/CODEX_TESTING_PROMPT.md
- docs/testing/SECURITY_TEST_PLAN.md
- checklists/SECURITY_PDPA_CHECKLIST.md
- docs/security/SECURITY_REQUIREMENTS.md

Requirements:
- Test unauthorized access.
- Test forbidden role.
- Test ownership violation.
- Test privacy response.
- Test safe errors.
- Test no secret exposure where practical.
- Use synthetic data only.

Do not:
- Do not weaken assertions.
- Do not use real personal data.
- Do not test against production.

Completion response:
Summary
Files changed
Validation
Security coverage notes
Risks / Notes
Next suggested task
```

---

## 33. Ownership Security Tests

Prompt:

```text
Write security tests for tourist ownership.

Cover:
- tourist A cannot upload photo to tourist B visit
- tourist A cannot generate certificate for tourist B visit
- tourist A cannot submit survey for tourist B visit
- tourist A cannot view tourist B passport
- tourist A cannot access tourist B certificate/photo
```

---

## 34. Export Privacy Tests

Prompt:

```text
Write security tests for export privacy.

Cover:
- viewer denied detailed export
- admin allowed safe export
- export excludes email
- export excludes LINE ID
- export excludes provider_user_id
- export excludes guest token
- export excludes private photo/certificate paths
- raw comments excluded by default
- audit log created
```

---

## 35. File Upload Security Tests

Prompt:

```text
Write security tests for file upload.

Cover:
- SVG rejected
- PDF rejected
- HTML disguised as image rejected
- JavaScript disguised as image rejected
- oversized file rejected
- empty file rejected
- wrong visit ownership rejected
- private bucket not publicly accessible if testable
```

---

# Performance Testing Prompts

---

## 36. Performance Test Prompt Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Add performance-oriented tests/checks for [area].

Read first:
- docs/testing/PERFORMANCE_TEST_PLAN.md
- checklists/PERFORMANCE_CHECKLIST.md

Requirements:
- Identify performance risk.
- Add test/check where practical.
- Avoid brittle timing assertions unless appropriate.
- Prefer query/payload/size/limit assertions.
- Document manual performance checks if automation is not practical.

Completion response:
Summary
Files changed
Validation
Performance notes
Risks / Notes
Next suggested task
```

---

## 37. Dashboard Performance Test Prompt

```text
Add tests/checks for dashboard performance.

Cover:
- dashboard response is aggregated
- response does not include raw personal rows
- ranked lists are bounded
- filters are required/defaulted
- large date range is handled safely
- queries use expected filter inputs where practical
```

---

## 38. Export Performance Test Prompt

```text
Add tests/checks for export performance and safety.

Cover:
- row limit enforced
- unbounded export rejected
- too-large export returns EXPORT_TOO_LARGE
- export does not return huge JSON payload
- CSV generation remains bounded for test dataset
```

---

# UX Testing Prompts

---

## 39. UX Test Prompt Template

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
Create or update UX/manual test cases for [flow].

Read first:
- docs/testing/UX_TEST_PLAN.md
- checklists/UI_UX_CHECKLIST.md

Requirements:
- Define task scenario.
- Define tester type.
- Define steps.
- Define success criteria.
- Define observation checklist.
- Include mobile and non-LINE path if tourist flow.
- Include privacy/trust questions where relevant.

Completion response:
Summary
Files changed
Validation
UX coverage notes
Risks / Notes
Next suggested task
```

---

# Test Review Checklist

---

## 40. Before Accepting Test Work

Check:

```text
[ ] Tests use synthetic data.
[ ] Tests avoid production services.
[ ] Happy path covered.
[ ] Failure path covered.
[ ] Security/privacy assertions included.
[ ] Dashboard formulas tested if relevant.
[ ] Export content inspected if relevant.
[ ] File validation tested if relevant.
[ ] Ownership tested if relevant.
[ ] Tests are deterministic.
[ ] Commands run or not-run reason documented.
```

---

## 41. Critical Testing Gaps

Block release if no test/manual evidence for:

```text
QR-to-certificate flow
consent required
photo upload validation
certificate idempotency
stamp duplicate prevention
tourist ownership
admin permissions
dashboard metrics
export privacy
service role not exposed
mobile tourist flow
```

---

# Testing Completion Format

---

## 42. Required Completion Response

Codex should respond:

```text
Summary
- ...

Files changed
- ...

Validation
- test command: passed/failed/not run
- typecheck/lint/build if relevant

Coverage notes
- happy paths covered
- negative/security/privacy paths covered
- edge cases covered

Remaining gaps
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## 43. Do Not Do

Do not:

```text
use production data
use real personal data
test only happy paths
remove failing tests without fixing cause
weaken privacy assertions
skip ownership tests
skip export content inspection
skip dashboard null/zero tests
claim tests passed if not run
```

---

## 44. Final Testing Rule

Testing must prove that the platform works safely for real tourists and real administrators.

If the QR-to-certificate flow, permissions, dashboard metrics, or export privacy are untested, the system is not ready.
