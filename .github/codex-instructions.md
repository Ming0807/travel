# Codex Instructions

## 1. Project Identity

You are working on the **Southern Border Tourism Data & Intelligence Platform**.

This is a production-oriented university-level database project for collecting and analyzing tourist participation data in the southern border provinces of Thailand:

```text
Yala
Pattani
Narathiwat
```

The system supports:

```text
tourist data recording
travel behavior analysis
tourism promotion planning
dashboard analytics
sustainable tourism development
digital certificate generation
digital passport/stamp collection
privacy-safe exports
admin content management
```

This project must not be treated as a simple CRUD demo.

---

## 2. Core Product Strategy

The platform uses a value-first data collection strategy:

```text
Tourist scans QR code.
Tourist sees attraction/photo spot landing page.
Tourist enters minimal profile and consent.
Tourist uploads a photo.
Tourist receives a digital certificate/travel memory card.
Tourist earns a digital stamp.
Tourist may optionally answer a short survey.
Admins use dashboard and exports for tourism planning.
```

The product must make tourists want to participate.

---

## 3. Non-Negotiable UX Rules

Before certificate, collect only:

```text
display name
origin country/province
age group
consent
photo for certificate
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

Foreign/non-LINE tourists must be able to complete the core flow.

---

## 4. Recommended Tech Stack

Use the approved stack unless the task explicitly says otherwise:

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

Do not introduce large dependencies without a clear reason.

---

## 5. Architecture Rule

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

Do not put business rules only in React components.

Do not trust frontend validation.

Do not trust localStorage role or tourist_id.

Do not expose service role key to frontend.

---

## 6. Documentation to Read First

Before implementing any task, inspect the relevant docs.

Always start with:

```text
CODEX_MAIN_PROMPT.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
docs/00_INDEX.md
docs/architecture/ARCHITECTURE_OVERVIEW.md
docs/testing/ACCEPTANCE_CRITERIA.md
```

Then read the relevant module, checklist, and skill docs.

For database work:

```text
prompts/CODEX_DATABASE_PROMPT.md
.codex/skills/database-design/SKILL.md
.codex/skills/supabase-postgresql/SKILL.md
docs/database/
checklists/DATABASE_CHECKLIST.md
```

For frontend work:

```text
prompts/CODEX_FRONTEND_PROMPT.md
.codex/skills/frontend-nextjs-pwa/SKILL.md
.codex/skills/ux-ui-design/SKILL.md
docs/frontend/
checklists/FRONTEND_CHECKLIST.md
checklists/UI_UX_CHECKLIST.md
```

For backend work:

```text
prompts/CODEX_BACKEND_PROMPT.md
.codex/skills/backend-api/SKILL.md
docs/backend/
checklists/BACKEND_CHECKLIST.md
```

For dashboard work:

```text
prompts/CODEX_DASHBOARD_PROMPT.md
.codex/skills/dashboard-analytics/SKILL.md
docs/dashboard/
checklists/DASHBOARD_CHECKLIST.md
```

For security/privacy work:

```text
.codex/skills/pdpa-security/SKILL.md
docs/security/
checklists/SECURITY_PDPA_CHECKLIST.md
```

For testing work:

```text
prompts/CODEX_TESTING_PROMPT.md
.codex/skills/testing-qa/SKILL.md
docs/testing/
checklists/TESTING_CHECKLIST.md
```

---

## 7. Phase Order

Follow this implementation order unless the task explicitly says otherwise:

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

Do not build dashboard UI before metric definitions and schema are stable.

Do not build LINE before guest/non-LINE flow works.

Do not build exports before permissions and privacy rules exist.

---

## 8. Security Rules

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

Allowed public variables:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID optional
```

Server-side checks are mandatory for:

```text
authentication
authorization
tourist ownership
file validation
consent requirement
export permission
storage access
dashboard access
```

---

## 9. PDPA / Privacy Rules

Do not collect by default:

```text
national ID
passport number
full address
exact birthdate
phone as required field
email as required field
LINE as required field
religion
ethnicity
health data
political data
income
```

Use privacy-minimizing data:

```text
display name
origin country/province
age group
spending range
optional satisfaction score
optional comment
aggregated dashboard data
```

Consent must be:

```text
visible
not pre-checked
recorded
versioned
timestamped
source-tracked
purpose-linked
```

---

## 10. Database Rules

Core entities include:

```text
provinces
districts
countries
attractions
photo_spots
checkin_codes
tourists
tourist_identities
visits
visit_photos
certificate_templates
certificates
stamp_definitions
tourist_stamps
satisfaction_surveys
visit_expenses
funnel_events
consent_records
admin_users
roles
permissions
audit_logs
export_jobs
```

Critical rules:

```text
QR scans are funnel events, not visits.
Repeat visits are allowed.
Duplicate stamps for same tourist-attraction are not allowed.
Certificates should be idempotent per visit.
Survey is optional.
Missing optional values should be null, not fake zero.
```

---

## 11. Dashboard Rules

Dashboard metrics must be trustworthy.

Critical definitions:

```text
QR Scans != Visits
Tourist Profiles != verified unique humans
Estimated Spending != Revenue
Missing Satisfaction != 0
Zero denominator = No data
```

Dashboard responses must be aggregated and privacy-safe.

Do not return:

```text
email
LINE user ID
provider_user_id
guest token
device token
raw photo path
private certificate path
raw comments by default
```

---

## 12. Export Rules

Exports must:

```text
require authentication
require permission
validate filters
use safe column whitelist
enforce row limits
create audit log
preserve Thai text
escape CSV correctly
store files privately if stored
```

Default exports must exclude:

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

## 13. Testing Rules

For substantial changes, add or update tests where practical.

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
dashboard metric correctness
export privacy
safe errors
```

Use synthetic data only.

Do not use production data.

Do not claim tests passed if they were not run.

---

## 14. Performance Rules

Performance matters because tourists may use mobile networks outdoors.

Protect:

```text
QR landing speed
photo upload feedback
certificate generation feedback
dashboard aggregation
bounded exports
admin list pagination
```

Do not:

```text
load dashboard/chart libraries on QR landing
fetch all raw visits into frontend
allow unbounded exports
store huge base64 in database
render thousands of rows at once
```

---

## 15. Code Style

Use:

```text
TypeScript strict types
small focused functions
server-side validation
centralized constants
clear service/repository boundaries
safe error mapping
privacy-safe DTOs
tests for important logic
```

Avoid:

```text
unsafe any
large monolithic files
copy-pasted metric formulas
business logic only in UI
raw Supabase errors in API responses
hardcoded secrets
unrelated rewrites
```

---

## 16. Completion Response Format

When finishing a task, respond with:

```text
Summary
- What changed

Files changed
- path/to/file

Validation
- npm run typecheck: passed/failed/not run
- npm run lint: passed/failed/not run
- npm run test: passed/failed/not run
- npm run build: passed/failed/not run

Security/privacy notes
- Any relevant data/privacy impact

Risks / Notes
- Anything incomplete or uncertain

Next suggested task
- One clear next step
```

---

## 17. Critical Do Not Do List

Do not:

```text
Expose service role key to frontend.
Require LINE for all tourists.
Require email/phone/national ID before certificate.
Store image base64 in database.
Store signed URLs permanently.
Make tourist photos public by default.
Count QR scans as visits.
Call estimated spending revenue.
Treat missing satisfaction as zero.
Export personal identifiers by default.
Show provider_user_id in dashboard/export.
Skip backend permission checks.
Skip tourist ownership checks.
Hide certificate behind survey.
Break guest/non-LINE tourist flow.
```

---

## 18. Final Instruction

Build for real usage.

Every change should improve:

```text
tourist completion
data quality
privacy protection
admin usability
dashboard trust
production readiness
```

If a change improves UI but weakens data integrity, security, privacy, or metric correctness, do not make it.
