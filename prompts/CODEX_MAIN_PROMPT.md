# CODEX_MAIN_PROMPT.md

## 1. Purpose

You are Codex working on the **Southern Border Tourism Data & Intelligence Platform**.

This is a production-oriented university-level database project for collecting tourist participation data in the southern border provinces of Thailand: **Yala, Pattani, and Narathiwat**.

The system must support:

```text
1. Recording tourist data
2. Analyzing travel behavior
3. Supporting tourism promotion planning
4. Building a dashboard for southern border tourism
5. Supporting sustainable tourism development
```

The project is not a simple CRUD demo. It must be designed like a real system that could be used by tourism staff, researchers, and local planning teams.

---

## 2. Core Product Concept

The platform allows tourists to scan a QR code at a prepared photo spot or attraction, upload/select a photo, receive a digital certificate or travel memory card, earn a digital stamp, and optionally answer a short survey.

The system collects data in a user-friendly way so the project can build a useful tourist database for planning.

Core data dimensions:

```text
tourist profile
travel pattern
visited attraction
photo/certificate participation
digital stamp/passport
expense range
satisfaction
funnel/drop-off behavior
dashboard analytics
```

---

## 3. Main User Problem

Tourists usually do not want to fill long forms.

Therefore, the system must:

```text
reward the tourist first
ask only minimal required data before certificate
move heavier questions after certificate
make survey optional
make LINE optional
support foreign/non-LINE tourists
avoid repeated data entry for returning tourists
```

Do not build a system that asks for too much data before giving value.

---

## 4. Recommended Tech Stack

Use the project-approved stack unless a task says otherwise:

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

Optional or future:

```text
LINE LIFF
PWA
Recharts
html-to-image
React Hook Form
TanStack Table
background jobs
dashboard summary tables
```

Do not introduce new major dependencies without a clear reason.

---

## 5. Key Architectural Rules

Follow this architecture:

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
Do not trust localStorage role or tourist_id.
Do not expose service role key to frontend.
Do not aggregate dashboard metrics from raw rows in the browser.
Do not store image base64 in the database.
Do not store signed URLs permanently.
```

---

## 6. Folder Structure Guideline

Recommended structure:

```text
src/
  app/
    (public)/
    (tourist)/
    admin/
    api/
  components/
    ui/
    public/
    tourist/
    admin/
    dashboard/
    certificate/
    forms/
  server/
    actions/
    services/
    repositories/
    validators/
    auth/
    storage/
    dashboard/
    exports/
    jobs/
    audit/
  lib/
    constants/
    utils/
    config/
    types/
  styles/
tests/
  unit/
  integration/
  e2e/
  security/
```

Keep public/tourist/admin concerns separated.

---

## 7. Documentation to Read First

Before implementing a task, inspect the relevant documents.

Start with:

```text
README.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
docs/00_INDEX.md
docs/architecture/ARCHITECTURE_OVERVIEW.md
docs/database/DATABASE_REQUIREMENTS.md
docs/frontend/FRONTEND_REQUIREMENTS.md
docs/backend/BACKEND_REQUIREMENTS.md
docs/security/SECURITY_REQUIREMENTS.md
docs/testing/ACCEPTANCE_CRITERIA.md
```

Then read module-specific docs before editing that module.

Examples:

For QR flow:

```text
docs/modules/MODULE_02_QR_CHECKIN.md
docs/frontend/TOURIST_SIDE_PAGES.md
docs/backend/API_ENDPOINTS.md
```

For certificate:

```text
docs/modules/MODULE_06_CERTIFICATE_GENERATION.md
docs/backend/CERTIFICATE_RENDERING_FLOW.md
docs/security/IMAGE_UPLOAD_SECURITY.md
```

For dashboard:

```text
docs/dashboard/DASHBOARD_REQUIREMENTS.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
docs/dashboard/EXECUTIVE_DASHBOARD.md
```

---

## 8. Development Priority

Build in this order unless the task says otherwise:

```text
1. Project setup
2. Database schema and seed data
3. Auth and role/permission foundation
4. Public attraction pages
5. QR/check-in flow
6. Tourist minimal profile and consent
7. Photo upload
8. Certificate generation
9. Digital stamp/passport
10. Optional survey: travel behavior, expense, satisfaction
11. Admin CMS
12. Dashboard analytics
13. Export/reporting
14. Security hardening
15. Performance optimization
16. Testing and deployment
```

Do not jump into dashboard UI before the metric definitions and schema are stable.

---

## 9. Tourist Flow Rules

The tourist flow must be low-friction.

Required before certificate:

```text
display name
origin country/province
age group
consent
photo for certificate
```

Do not require before certificate:

```text
LINE login
email
phone number
national ID
passport number
full address
exact birthdate
long survey
```

Survey should appear after certificate and must be optional.

---

## 10. QR / Check-in Rules

QR codes are public entry points.

Implement these rules:

```text
Active QR resolves to attraction/photo spot context.
Invalid QR shows safe error.
Inactive QR shows safe unavailable page.
Expired QR shows safe expired page.
QR scan is not the same as a visit.
QR scan must not create a full tourist record automatically.
Public QR response must not expose admin notes or private fields.
```

---

## 11. Returning Tourist Rules

The system should reduce repeated data entry.

Rules:

```text
Guest tourist identity can be stored locally but verified server-side.
Returning tourist profile can be reused.
Same tourist can visit many attractions.
Repeat visit to same attraction is allowed.
Duplicate stamp for same tourist-attraction is not allowed.
LINE/email linking is optional for passport persistence.
Foreign/non-LINE tourists must still complete the core flow.
```

---

## 12. Photo Upload Rules

Tourist photo upload is privacy-sensitive.

Allowed tourist uploads:

```text
image/jpeg
image/png
image/webp
```

Reject:

```text
SVG
PDF
HTML
JavaScript
empty file
oversized file
```

Rules:

```text
Validate file type and size server-side.
Verify visit ownership before upload.
Generate storage path server-side.
Do not use original filename as storage filename.
Do not include tourist name/email/LINE ID in path.
Store file in private/controlled bucket.
Store only metadata in database.
Do not store image base64 in database.
Do not store signed URL permanently.
```

---

## 13. Certificate Rules

Certificate is a reward and may contain personal data.

Rules:

```text
Certificate includes display name, tourist photo, attraction, and visit date.
Certificate must not include email, LINE ID, internal tourist ID, phone, national ID, or full address.
Certificate generation must be idempotent.
Duplicate click must not create duplicate certificate.
Certificate file must be private/controlled by default.
Public sharing must be user-initiated if implemented.
Stamp award failure should not break certificate if certificate was generated.
```

---

## 14. Stamp / Passport Rules

Digital stamp/passport encourages repeat visits.

Rules:

```text
Award stamp after certificate generation if stamp definition exists.
One tourist can earn one stamp per attraction.
Repeat visits are allowed.
Duplicate stamp should be handled gracefully.
Passport must show only the current tourist's own stamps.
Passport response must not expose provider_user_id or guest token.
Guest passport works on the same device/browser.
LINE/email save is optional.
```

---

## 15. Survey Rules

Survey is optional and after the reward.

Survey may collect:

```text
travel companion
group size
transport mode
travel purpose
overnight status
nights
spending range
expense category
overall satisfaction
service dimension scores
revisit intention
recommendation intention
optional comment
```

Rules:

```text
Do not block certificate download behind survey.
Use spending ranges, not exact income.
Use age group, not exact birthdate.
Comments are optional and restricted.
Satisfaction scores are 1-5.
Missing satisfaction is null, not zero.
```

---

## 16. Admin Rules

Admin features require authentication and permission.

Roles:

```text
super_admin
admin
viewer
```

Rules:

```text
Viewer is read-only.
Viewer cannot export detailed data.
Admin can manage content/check-in codes.
Admin cannot manage users/roles unless permitted.
Super admin manages users/roles.
Backend must enforce permissions.
Frontend button hiding is not enough.
Sensitive actions must be audited.
```

---

## 17. Dashboard Rules

Dashboard metrics must be trustworthy.

Rules:

```text
QR scans are not visits.
Tourist profiles are system profiles, not verified unique people.
Estimated spending is not revenue.
Missing satisfaction is No data/null, not zero.
Averages must show response count where relevant.
Zero denominator returns null/No data.
Dashboard must not expose personal identifiers.
Dashboard calculations must be server-side.
Frontend should not aggregate all raw rows.
```

Required dashboards/modules:

```text
executive overview
tourist profile
travel behavior
expense
satisfaction
funnel analytics
sustainable tourism
```

---

## 18. Export Rules

Exports are high-risk.

Rules:

```text
Export requires authentication.
Export requires permission.
Export filters must be validated.
Export creates audit log.
Default exports must exclude private identifiers.
Large exports must be limited or handled safely.
CSV must escape commas, quotes, and newlines.
Thai text must be preserved.
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
raw comments unless permitted
```

---

## 19. Security Rules

Always follow:

```text
Do not expose SUPABASE_SERVICE_ROLE_KEY to frontend.
Do not trust client role.
Do not trust tourist_id from client.
Do not trust visit_id without ownership check.
Do not make tourist photos public by default.
Do not show raw SQL errors.
Do not log secrets.
Do not store signed URLs permanently.
Do not expose provider_user_id in dashboard/export.
```

Use server-side checks for:

```text
authentication
authorization
tourist ownership
file validation
consent requirement
export permission
storage access
```

---

## 20. PDPA / Privacy Rules

The system should be privacy-safe.

Do not collect:

```text
national ID
passport number
full address
phone as required field
exact date of birth
religion
ethnicity
health data
political data
income
```

Do collect only what is useful for:

```text
certificate generation
tourist profile analysis
travel behavior analysis
expense range analysis
satisfaction analysis
sustainable tourism planning
```

Consent must be:

```text
visible
not pre-checked
versioned
recorded
linked to purpose
```

---

## 21. Storage Bucket Rules

Recommended buckets:

```text
attraction-media       public read / admin write
stamp-assets           public read / admin write
visit-photos           private or controlled
certificate-files      private or controlled
export-files           private
official-imports       private
temp-uploads           private
```

Never make every bucket public.

---

## 22. Database Rules

The database must support analytics and privacy.

Core entities:

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
role_permissions
admin_user_roles
audit_logs
export_jobs
official data future
analytics summary tables future
```

Important constraints:

```text
unique attractions.slug
unique checkin_codes.code
unique tourist_identities(provider, provider_user_id)
unique tourist_stamps(tourist_id, attraction_id)
one satisfaction survey per visit or controlled duplicate policy
scores 1-5
group_size >= 1
nights >= 0
```

---

## 23. Error Handling Rules

Use stable error codes.

Examples:

```text
VALIDATION_FAILED
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
QR_CODE_INVALID
QR_CODE_INACTIVE
QR_CODE_EXPIRED
CONSENT_REQUIRED
PHOTO_INVALID_TYPE
PHOTO_TOO_LARGE
PHOTO_UPLOAD_FAILED
CERTIFICATE_ALREADY_EXISTS
EXPORT_TOO_LARGE
INTERNAL_ERROR
```

User-facing errors must not include:

```text
stack trace
SQL query
raw Supabase error object
service key
database URL
private storage path
provider_user_id
```

---

## 24. Testing Rules

For every substantial task, add or update tests where practical.

Required test categories:

```text
unit
integration
E2E
security
performance/manual QA where relevant
```

Critical tests:

```text
QR-to-certificate E2E
consent required
photo upload validation
certificate idempotency
stamp duplicate prevention
survey optional flow
admin permissions
dashboard metric correctness
export privacy
tourist ownership
```

Do not claim completion if the core path is untested.

---

## 25. Performance Rules

Performance affects completion rate.

Rules:

```text
QR landing must be fast.
Tourist pages should not load admin/dashboard bundles.
Large images must be optimized.
Photo upload must show progress/loading.
Certificate generation must show loading.
Dashboard metrics must be server-side aggregated.
Large exports must be limited or backgrounded.
```

Avoid:

```text
fetching all raw visits to frontend
rendering huge tables without pagination
loading chart libraries on QR landing
large unoptimized hero images
unbounded CSV export
```

---

## 26. UI/UX Rules

Tourist-facing UI must be:

```text
mobile-first
short
clear
reward-focused
trustworthy
privacy-aware
```

Admin UI must be:

```text
professional
structured
permission-aware
clear
dashboard-friendly
```

Do not:

```text
put long academic explanation on QR landing
ask too many questions before certificate
force survey before certificate
force LINE
hide the download button
show misleading dashboard terms
```

---

## 27. Implementation Style

When editing code:

```text
Keep changes focused.
Avoid rewriting unrelated modules.
Use TypeScript types.
Use server-side validation.
Use reusable constants.
Use clear names.
Avoid magic strings.
Keep functions small and testable.
Update documentation when behavior changes.
```

Prefer:

```text
explicit service methods
typed DTOs
Zod schemas
centralized constants
safe error objects
server-side guards
```

Avoid:

```text
large monolithic files
business logic inside UI only
hardcoded permissions in many places
copy-pasted dashboard formulas
unsafe any types
```

---

## 28. Codex Task Execution Rules

For each task:

```text
1. Read relevant docs.
2. Inspect existing code.
3. Identify files to change.
4. Make focused changes.
5. Add/update tests if practical.
6. Run relevant commands if available.
7. Summarize changed files.
8. Mention risks or incomplete items honestly.
```

Do not silently ignore failing tests.

If blocked, explain:

```text
what failed
why it matters
what should be done next
```

---

## 29. Required Commands Before Completion

When possible, run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

For E2E tasks:

```bash
npm run test:e2e
```

If commands are unavailable or fail because setup is incomplete, document it clearly.

---

## 30. Completion Response Format

At the end of a Codex task, report:

```text
Summary
- What changed

Files changed
- path/to/file

Validation
- command/result

Risks / Notes
- anything incomplete or uncertain

Next suggested task
- one clear next step
```

Do not overstate success if tests were not run.

---

## 31. Critical Do Not Do List

Do not:

```text
Expose service role key to frontend.
Require LINE for all tourists.
Require email/phone/national ID before certificate.
Count QR scans as visits.
Call estimated spending revenue.
Treat missing satisfaction as zero.
Export personal identifiers by default.
Show provider_user_id in dashboard.
Make tourist photos public by default.
Store image base64 in database.
Store signed URLs permanently.
Trust localStorage role or tourist_id.
Skip backend permission checks.
Hide certificate behind survey.
Break guest/non-LINE tourist flow.
```

---

## 32. Final Project Rule

This system exists to collect useful tourism planning data by giving tourists a valuable, low-friction experience first.

Build for:

```text
real users
real admin workflows
real database quality
real privacy protection
real dashboard insight
```

The final system should feel like a serious production-oriented tourism data platform, not a classroom CRUD prototype.
