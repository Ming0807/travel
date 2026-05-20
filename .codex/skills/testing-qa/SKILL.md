---
name: testing-qa
description: Use when writing, reviewing, or debugging tests and QA processes including unit tests, integration tests, E2E tests, security tests, privacy tests, dashboard metric tests, export tests, permission tests, ownership tests, and manual QA.
---

# Testing QA Skill

## Purpose

Use this skill when writing, reviewing, refactoring, or debugging tests and QA processes for the **Southern Border Tourism Data & Intelligence Platform**.

This platform is not a simple classroom CRUD app. It collects tourist data, uploads photos, generates certificates, awards digital stamps, collects optional survey data, produces dashboard analytics, and exports privacy-sensitive datasets.

Testing must prove that the platform is:

```text
functionally correct
privacy-safe
secure
dashboard-accurate
mobile-usable
performance-aware
export-safe
admin-ready
production-oriented
```

---

## When to Use This Skill

Use this skill for tasks involving:

```text
unit tests
integration tests
E2E tests
security tests
privacy tests
dashboard metric tests
export tests
file upload tests
permission tests
ownership tests
manual QA
test data setup
acceptance testing
release testing
bug regression tests
```

Use together with domain-specific skills:

```text
backend-api
frontend-nextjs-pwa
database-design
dashboard-analytics
certificate-rendering
digital-passport-stamp
pdpa-security
performance-optimization
```

---

## Required Context

Before testing work, read:

```text
CODEX_MAIN_PROMPT.md
prompts/CODEX_TESTING_PROMPT.md
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
checklists/PERFORMANCE_CHECKLIST.md
checklists/PRODUCTION_RELEASE_CHECKLIST.md
```

For feature tests, also read the relevant module docs.

---

## Testing Mission

The testing mission is:

```text
Prove that the platform works safely for real tourists, real administrators, and real planning dashboards.
```

Testing must protect:

```text
QR-to-certificate flow
data quality
consent
tourist ownership
admin permissions
file upload safety
certificate idempotency
stamp duplicate prevention
survey optionality
dashboard formula correctness
export privacy
mobile UX
```

---

# Core QA Rules

---

## Rule 1: Use Synthetic Data Only

Tests must not use:

```text
real tourist names
real LINE IDs
real phone numbers
real emails
real national ID/passport numbers
real photos
production database data
real addresses
```

Use synthetic data:

```text
Test Tourist
Test Attraction Yala
anonymous_device_test_001
line_test_user_001
test@example.test
```

---

## Rule 2: Test Negative Paths

Do not test only happy paths.

Every important feature should test:

```text
invalid input
missing required input
unauthorized access
forbidden role
wrong ownership
duplicate submission
null/missing data
unsafe file upload
large file
invalid QR
inactive QR
expired QR
empty/no-data state
```

---

## Rule 3: Test Privacy Absence

For dashboard/export/API responses, assert that private fields are absent.

Forbidden by default:

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
raw comments
service role key
signed URL persisted
```

---

## Rule 4: Test Metrics, Not Only UI Rendering

Dashboard tests must check numbers and formulas.

Critical dashboard assertions:

```text
QR scans are not visits.
Tourist Profiles are not verified unique people.
Estimated Spending is not Revenue.
Missing satisfaction is null/No data, not 0.
Zero denominator returns null/No data.
Average satisfaction excludes null.
```

---

## Rule 5: Test Direct API Bypass

For security-sensitive features, test direct backend/API calls.

Do not assume hidden UI buttons are enough.

Examples:

```text
viewer directly calls create attraction API
tourist A directly calls certificate API for tourist B visit
anonymous directly calls export API
invalid file directly uploaded
```

---

# Test Levels

---

## Unit Tests

Use for:

```text
validation schemas
permission helpers
ownership helpers
dashboard formulas
CSV escaping
file validation
storage path generation
certificate idempotency helpers
stamp duplicate logic
error mapping
```

Good unit tests are fast, deterministic, and focused.

---

## Integration Tests

Use for:

```text
QR resolution
profile + visit + consent creation
photo upload metadata
certificate generation
stamp award
survey submission
admin CMS
dashboard services
exports
audit logging
```

Integration tests should verify database state and service behavior.

---

## E2E Tests

Use for:

```text
tourist QR-to-certificate flow
returning tourist flow
admin CMS flow
dashboard flow
export flow
permission-denied flows
mobile tourist flow
```

E2E tests should verify real user outcomes.

---

## Security Tests

Use for:

```text
anonymous access block
viewer mutation block
viewer export block
tourist ownership block
invalid file upload
private file access
secret exposure
safe errors
```

---

## Manual QA

Manual QA is required for:

```text
real phone QR scan
mobile photo upload
mobile certificate download
Thai language
English/non-LINE tourist path
LINE browser if LIFF is implemented
dashboard interpretation
admin QR creation workflow
```

---

# Required Test Data

---

## Reference Seed Data

Tests should have stable seed data for:

```text
Yala
Pattani
Narathiwat
Thailand
countries
districts
age groups
transport modes
travel purposes
travel companions
spending ranges
expense categories
attraction types
roles
permissions
certificate template
stamp definition
```

---

## Scenario Seed Data

Create synthetic scenarios:

```text
published active attraction
unpublished attraction
inactive attraction
active photo spot
inactive photo spot
active check-in code
inactive check-in code
expired check-in code
tourist A
tourist B
guest identity A
guest identity B
admin user
viewer user
super admin user
visit with certificate
visit without photo
visit with survey
visit with null satisfaction
visit with expense range
```

---

# Critical Test Suites

---

## QR Check-in Test Suite

Must cover:

```text
active QR resolves
invalid QR safe error
inactive QR unavailable
expired QR unavailable
inactive attraction blocked
inactive photo spot blocked
public response excludes admin/private fields
QR scan does not create visit
QR scan not counted as visit
funnel event recorded if implemented
```

---

## Minimal Profile and Consent Test Suite

Must cover:

```text
valid minimal profile
missing display name rejected
missing origin rejected if required
missing age group rejected if required
missing consent rejected
consent record created
consent version/source/timestamp stored
email not required
LINE not required
phone not required
national ID not accepted
full address not accepted
guest identity created or reused
visit created
```

---

## Photo Upload Test Suite

Must cover:

```text
JPEG accepted
PNG accepted
WebP accepted
SVG rejected
PDF rejected
HTML/JS rejected
oversized file rejected
empty file rejected
wrong visit ownership rejected
storage path generated server-side
storage path has no personal data
metadata created after upload
orphan cleanup or cleanup risk documented
```

---

## Certificate Test Suite

Must cover:

```text
valid certificate generation
photo belongs to visit
wrong tourist ownership rejected
missing photo rejected
certificate record created
certificate file stored
certificate idempotency
double click/duplicate retry safe
visit status updated
stamp awarded
already-earned stamp handled
survey not required
LINE not required
download available
private identifiers excluded
```

---

## Digital Passport / Stamp Test Suite

Must cover:

```text
stamp awarded after certificate
duplicate stamp prevented
repeat visit allowed
same attraction already-earned state
second attraction earns new stamp
passport shows only own stamps
tourist A cannot see tourist B passport
provider_user_id excluded
guest token excluded
guest path works without LINE
optional linking does not block flow
```

---

## Survey Test Suite

Must cover:

```text
survey optional after certificate
certificate remains downloadable if skipped
valid survey accepted
scores 1-5
invalid score rejected
optional comment empty allowed
comment length limited
spending range stored
travel behavior stored
missing optional values stored as null
wrong ownership rejected
duplicate survey behavior controlled
```

---

## Admin Test Suite

Must cover:

```text
anonymous blocked from admin
viewer can read allowed dashboard
viewer cannot mutate data
viewer cannot export detailed data
admin can create/update attraction
admin can create photo spot
admin can create check-in code
duplicate check-in code rejected
deactivated code unavailable publicly
super admin can manage users/roles if implemented
audit logs created for sensitive actions
```

---

## Dashboard Test Suite

Must cover:

```text
executive KPI formulas
tourist profile distributions
travel behavior metrics
expense metrics
satisfaction metrics
funnel metrics
sustainable tourism insight classification
date filter
province filter
attraction filter
empty/no-data state
zero denominator state
null satisfaction handling
privacy-safe response
```

Critical assertions:

```text
QR scans are not visits.
Estimated spending is not revenue.
Missing satisfaction is not 0.
Tourist Profiles are not verified unique people.
```

---

## Export Test Suite

Must cover:

```text
admin export allowed
viewer detailed export denied
anonymous export denied
filters applied
CSV headers correct
CSV escaping works
Thai text preserved
row limit enforced
too-large export rejected
audit log created
private identifiers excluded
raw comments excluded by default
```

Default export must exclude:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw photo path
private certificate path
raw comments unless permission allows
```

---

# Test Commands

---

## Recommended Commands

Use commands configured by the project.

Common examples:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

Supabase/local DB if configured:

```bash
supabase db reset
supabase test
```

Do not claim commands passed if they were not run.

---

# Bug Regression Rules

---

## Regression Test Requirement

When fixing a bug, add a regression test if the bug affects:

```text
QR flow
consent
photo upload
certificate generation
stamp duplicate prevention
tourist ownership
admin permissions
dashboard formulas
exports
storage privacy
safe errors
```

If no test is added, explain why.

---

## Bug Fix Validation

For every bug fix:

```text
reproduce or reason clearly
identify root cause
fix root cause
test fixed behavior
test related failure path
document remaining risk
```

---

# Manual QA Scripts

---

## Tourist Manual QA

Tester should verify:

```text
scan QR on real phone
understand benefit within 5 seconds
fill minimal profile
understand consent
upload photo
preview certificate
generate certificate
download certificate
see stamp
skip survey
complete survey optionally
open passport
repeat with another attraction
```

Observe:

```text
confusion
hesitation
privacy concern
upload failure
slow loading
mobile layout issues
certificate quality
survey willingness
```

---

## Admin Manual QA

Tester should verify:

```text
login
create attraction
create photo spot
create QR/check-in code
copy/open QR link
deactivate QR code
view dashboard
apply filters
interpret metrics
export report
```

---

## Dashboard Interpretation QA

Ask:

```text
What is the difference between QR Scans and Visits?
What does Tourist Profiles mean?
What does Estimated Spending mean?
Why is satisfaction No data?
Which attraction should be promoted?
Which attraction needs improvement?
```

Dashboard passes if the tester does not misinterpret key metrics.

---

# Test Review Checklist

Before accepting test work:

```text
[ ] Tests use synthetic data.
[ ] Happy path covered.
[ ] Negative path covered.
[ ] Security/privacy assertions included.
[ ] Dashboard formulas verified if relevant.
[ ] Export CSV content inspected if relevant.
[ ] File upload invalid cases covered if relevant.
[ ] Ownership violations covered if relevant.
[ ] Permission bypass covered if relevant.
[ ] Tests are deterministic.
[ ] Commands run or not-run reason documented.
```

---

## Release Test Gate

Do not release MVP unless there is automated or manual evidence for:

```text
QR-to-certificate flow
consent required
photo upload validation
certificate idempotency
stamp duplicate prevention
survey optional flow
guest/non-LINE flow
tourist ownership
admin permissions
dashboard metric correctness
export privacy
mobile tourist flow
safe errors
```

---

## Critical Testing Blockers

Block release if untested:

```text
tourist ownership
admin permissions
export privacy
dashboard metric formulas
photo upload validation
certificate generation
consent requirement
QR invalid/inactive/expired states
service role exposure
```

---

# Task Prompt Template

Use this prompt:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Write/review/refactor/debug tests for feature.]

Context:
Testing must prove the platform works safely for real tourists, admins, dashboards, and exports.

Read first:
- .codex/skills/testing-qa/SKILL.md
- prompts/CODEX_TESTING_PROMPT.md
- docs/testing/TESTING_STRATEGY.md
- docs/testing/[RELEVANT_TEST_DOC].md
- checklists/TESTING_CHECKLIST.md

Requirements:
- Use synthetic data only.
- Test happy path and failure paths.
- Include security/privacy assertions where relevant.
- Include dashboard/export formula/content assertions where relevant.
- Keep tests deterministic.
- Run relevant commands if available.

Do not:
- Do not use production data.
- Do not test only UI rendering for metrics.
- Do not weaken assertions.
- Do not remove failing tests without fixing cause.

Completion response:
Summary
Files changed
Validation
Coverage notes
Remaining gaps
Risks / Notes
Next suggested task
```

---

# Output Format

When completing testing work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- command results

Coverage notes
- happy paths
- negative/security/privacy paths
- edge cases

Remaining gaps
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

Testing must prove that the system is safe, correct, and useful.

If the QR-to-certificate flow, permissions, ownership, dashboard metrics, and export privacy are not tested, the platform is not ready.
