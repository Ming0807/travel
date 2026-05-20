# CONTRIBUTING.md

## 1. Purpose

This document defines how to contribute to the **Southern Border Tourism Data & Intelligence Platform**.

This project is a production-oriented university-level tourism database and dashboard system for the southern border provinces of Thailand:

```text
Yala
Pattani
Narathiwat
```

The system is designed to collect tourist participation data through a low-friction QR-to-certificate experience and transform that data into dashboard insights for sustainable tourism planning.

This repository must be developed with care because it handles:

```text
tourist profile data
visit records
uploaded photos
digital certificates
digital stamps/passports
optional survey data
expense ranges
satisfaction scores
admin accounts
dashboard analytics
exports
audit logs
```

---

## 2. Contribution Philosophy

All contributions must improve at least one of these:

```text
tourist completion rate
data quality
privacy protection
security
admin usability
dashboard accuracy
system performance
test coverage
academic/report quality
production readiness
```

A contribution is not acceptable if it improves appearance while weakening:

```text
data integrity
privacy
security
consent
authorization
tourist ownership
dashboard metric correctness
export safety
```

---

## 3. Core Product Rules

The product strategy is:

```text
reward first
ask minimal data first
ask deeper questions after the reward
make LINE optional
make survey optional
support guest and foreign tourists
avoid repeated data entry
protect privacy by design
```

Before certificate, collect only:

```text
display name
origin country/province
age group
consent
photo
```

Do not require before certificate:

```text
LINE
email
phone number
national ID
passport number
full address
exact birthdate
long survey
income
```

Survey must appear after certificate and must be optional.

LINE must be optional.

---

## 4. Project Stack

Preferred stack:

```text
Next.js App Router
TypeScript
Tailwind CSS
Supabase PostgreSQL
Supabase Auth
Supabase Storage
Server Actions / Route Handlers
Zod validation
Vitest
Playwright
```

Optional/future:

```text
LINE LIFF
PWA enhancement
dashboard summary tables
background jobs
official data import
advanced report generation
```

Do not introduce a new major dependency without a clear reason.

---

## 5. Required Reading Before Development

Before working on any task, read:

```text
CODEX_MAIN_PROMPT.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
docs/00_INDEX.md
docs/architecture/ARCHITECTURE_OVERVIEW.md
docs/testing/ACCEPTANCE_CRITERIA.md
```

Then read the area-specific docs.

Database tasks:

```text
prompts/CODEX_DATABASE_PROMPT.md
.codex/skills/database-design/SKILL.md
.codex/skills/supabase-postgresql/SKILL.md
docs/database/
checklists/DATABASE_CHECKLIST.md
```

Frontend tasks:

```text
prompts/CODEX_FRONTEND_PROMPT.md
.codex/skills/frontend-nextjs-pwa/SKILL.md
.codex/skills/ux-ui-design/SKILL.md
docs/frontend/
checklists/FRONTEND_CHECKLIST.md
checklists/UI_UX_CHECKLIST.md
```

Backend tasks:

```text
prompts/CODEX_BACKEND_PROMPT.md
.codex/skills/backend-api/SKILL.md
docs/backend/
checklists/BACKEND_CHECKLIST.md
```

Dashboard tasks:

```text
prompts/CODEX_DASHBOARD_PROMPT.md
.codex/skills/dashboard-analytics/SKILL.md
docs/dashboard/
checklists/DASHBOARD_CHECKLIST.md
```

Security/privacy tasks:

```text
.codex/skills/pdpa-security/SKILL.md
docs/security/
checklists/SECURITY_PDPA_CHECKLIST.md
```

Testing tasks:

```text
prompts/CODEX_TESTING_PROMPT.md
.codex/skills/testing-qa/SKILL.md
docs/testing/
checklists/TESTING_CHECKLIST.md
```

Deployment tasks:

```text
.codex/skills/deployment-release/SKILL.md
DEPLOYMENT.md
ENVIRONMENT.md
checklists/PRODUCTION_RELEASE_CHECKLIST.md
```

---

## 6. Branching Guidance

Recommended branch naming:

```text
feature/phase-05-qr-checkin
feature/certificate-generation
fix/photo-upload-validation
refactor/dashboard-service
docs/database-dictionary
test/export-privacy
security/storage-policies
```

Keep branches focused.

Avoid mixing unrelated changes in one branch.

---

## 7. Task Scope Rules

Good task examples:

```text
Implement active/invalid/inactive/expired QR resolution.
Add certificate idempotency tests.
Create dashboard metric service for satisfaction summary.
Add privacy-safe export column whitelist.
```

Bad task examples:

```text
Build the whole system.
Refactor everything.
Add dashboard, admin, LINE, and deployment in one PR.
```

Split large tasks by:

```text
database
backend
frontend
tests
documentation
deployment
```

---

## 8. Implementation Phase Order

Use this order unless explicitly changed:

```text
PHASE_01_PROJECT_SETUP
PHASE_02_DATABASE_SCHEMA
PHASE_03_AUTH_IDENTITY
PHASE_04_PUBLIC_ATTRACTION_PAGES
PHASE_05_QR_CHECKIN_FLOW
PHASE_06_CERTIFICATE_GENERATION
PHASE_07_SURVEY_EXPENSE_SATISFACTION
PHASE_08_ADMIN_BACKOFFICE
PHASE_09_DASHBOARD
PHASE_10_REPORT_EXPORT
PHASE_11_LINE_LIFF_OPTIONAL
PHASE_12_TESTING_HARDENING
PHASE_13_DEPLOYMENT
```

Do not build optional integrations before the core QR-to-certificate flow works.

---

## 9. Architecture Rules

Use this flow:

```text
Frontend UI
  -> Server Action / Route Handler
  -> Validator
  -> Auth / Permission / Ownership Guard
  -> Service Layer
  -> Repository Layer
  -> Supabase PostgreSQL / Storage
```

Rules:

```text
Do not put business rules only in React components.
Do not trust frontend validation.
Do not trust localStorage role.
Do not trust client-provided tourist_id.
Do not expose service role keys.
Do not fetch raw dashboard rows into frontend.
Do not store images as base64 in the database.
```

---

## 10. Code Style

Use:

```text
TypeScript strict types
clear names
small focused functions
Zod schemas
server-side validation
service/repository separation
centralized constants
safe error codes
privacy-safe DTOs
tests for critical logic
```

Avoid:

```text
unsafe any
hardcoded secrets
large monolithic files
copy-pasted dashboard formulas
raw Supabase errors in API responses
unrelated rewrites
silent behavior changes
```

---

## 11. Database Contribution Rules

When changing schema:

```text
add migration
add/update constraints
add/update indexes
update data dictionary
update ERD/relationships if needed
update seed data if needed
update tests if practical
```

Critical database rules:

```text
QR scans are not visits.
Repeat visits are allowed.
Duplicate stamps are prevented by tourist-attraction uniqueness.
Certificate generation should be idempotent per visit.
Missing optional survey values should be null, not zero.
```

Never add:

```text
unique(tourist_id, attraction_id)
```

to `visits`, because that blocks repeat visits.

---

## 12. Security and Privacy Contribution Rules

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
SUPABASE_DATABASE_URL
LINE_CHANNEL_SECRET
CRON_SECRET
EXPORT_SIGNING_SECRET
private API tokens
```

Never collect by default:

```text
national ID
passport number
full address
exact birthdate
required phone
required email
required LINE
exact income
sensitive personal attributes
```

Always verify server-side where relevant:

```text
authentication
authorization
tourist ownership
file validation
consent requirement
export permission
dashboard access
storage access
```

---

## 13. Frontend Contribution Rules

Tourist-facing pages must be:

```text
mobile-first
fast
clear
reward-focused
privacy-aware
guest-friendly
LINE-optional
```

Required states:

```text
loading
empty
error
success
retry where useful
```

Do not block certificate download behind:

```text
survey
LINE linking
email capture
phone capture
```

---

## 14. Backend Contribution Rules

Backend must enforce:

```text
validation
auth
permissions
ownership
consent
storage safety
safe errors
audit logs where relevant
```

Backend must not rely only on:

```text
hidden UI buttons
client form validation
localStorage role
hidden tourist_id fields
```

---

## 15. Dashboard Contribution Rules

Dashboard metrics must match `docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md`.

Critical rules:

```text
QR Scans are separate from Total Visits.
Tourist Profiles are not verified unique people.
Estimated Spending is not Revenue.
Missing Satisfaction is No data/null, not zero.
Zero denominator returns No data/null.
```

Dashboard responses must be:

```text
server-side aggregated
filter-aware
privacy-safe
bounded
```

---

## 16. Export Contribution Rules

Exports must:

```text
require authentication
require permission
validate filters
use safe column whitelist
enforce row limits
create audit logs
preserve Thai text
escape CSV correctly
exclude private identifiers by default
```

Default exports must exclude:

```text
email
LINE user ID
provider_user_id
guest token
device token
private photo path
private certificate path
raw comments unless permission allows
```

---

## 17. Testing Requirements

For substantial changes, add or update tests.

Important test categories:

```text
unit tests
integration tests
E2E tests
security/privacy tests
dashboard metric tests
export privacy tests
manual mobile QA
```

Critical tests:

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
dashboard formulas
export privacy
safe errors
```

Use synthetic data only.

Do not use production data.

---

## 18. Required Commands Before PR

Run where applicable:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

If configured:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

If a command is not available or not run, document it in the PR.

Do not claim tests passed if they were not run.

---

## 19. Pull Request Requirements

Each PR must include:

```text
clear summary
phase/task reference
files changed
security/privacy notes
testing evidence
known risks
documentation updates if relevant
screenshots for UI changes
```

Use:

```text
.github/pull_request_template.md
```

---

## 20. Review Requirements

Reviewers should check:

```text
functional correctness
architecture boundaries
database integrity
security/privacy
tourist UX
admin UX
dashboard metric accuracy
export privacy
performance risk
test coverage
documentation consistency
```

Block PRs that expose secrets, break consent, bypass permissions, leak private data, or produce misleading dashboard metrics.

---

## 21. Issue Requirements

Issues should include:

```text
type
summary
expected behavior
current behavior
steps to reproduce if bug
affected role
affected module
acceptance criteria
security/privacy considerations
testing requirements
priority
```

Use:

```text
.github/ISSUE_TEMPLATE.md
```

---

## 22. Documentation Contribution Rules

Update docs when behavior changes.

Relevant docs may include:

```text
docs/database/DATA_DICTIONARY.md
docs/backend/API_ENDPOINTS.md
docs/frontend/ROUTES_STRUCTURE.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/testing/ACCEPTANCE_CRITERIA.md
CHANGELOG.md
```

Do not claim planned features are implemented.

Use status labels:

```text
Implemented
In progress
Planned
Optional
Future
Out of MVP
```

---

## 23. Changelog Rules

Update `CHANGELOG.md` for user-visible or architecture-relevant changes.

Use categories:

```text
Added
Changed
Fixed
Removed
Security
Performance
Documentation
Migration
Known Issues
```

Do not include secrets or real personal data.

---

## 24. Critical Blockers

Do not merge if:

```text
service role key exposed
anonymous admin access possible
viewer can mutate/export detailed data
tourist ownership bypass exists
consent is missing
LINE required for all tourists
survey required before certificate
tourist photos public unintentionally
certificate files public unintentionally
export includes private identifiers by default
dashboard counts QR scans as visits
estimated spending labeled revenue
missing satisfaction treated as zero
build fails without explanation
```

---

## 25. Final Contribution Rule

Every contribution must preserve the core promise:

```text
A tourist can scan QR, complete a short privacy-aware flow, receive a certificate, earn a stamp, and optionally answer a survey — while the system produces trustworthy, privacy-safe tourism planning data.
```
