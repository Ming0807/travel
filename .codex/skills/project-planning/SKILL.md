---
name: project-planning
description: Use when planning, sequencing, scoping, or reviewing work including implementation phases, MVP scope, task prioritization, roadmap review, release readiness, and preventing scope creep.
---

# Project Planning Skill

## Purpose

Use this skill when planning, sequencing, scoping, or reviewing work for the **Southern Border Tourism Data & Intelligence Platform**.

This project is a production-oriented tourism database and dashboard system for the southern border provinces of Thailand:

```text
Yala
Pattani
Narathiwat
```

The project goal is to collect tourist participation data in a way that supports:

```text
tourist data recording
travel behavior analysis
tourism promotion planning
dashboard analytics
sustainable tourism development
```

This skill helps Codex avoid building random isolated features and instead develop the system in a controlled, phase-based, production-oriented way.

---

## When to Use This Skill

Use this skill when the task involves:

```text
planning implementation phases
breaking work into tasks
creating MVP scope
prioritizing features
reviewing roadmap
deciding next task
creating Codex task prompts
checking release readiness
preventing scope creep
aligning frontend/backend/database work
```

Do not use this skill for deep implementation details unless the task is about planning or sequencing that implementation.

---

## Core Project Principle

The system must not be treated as a basic CRUD project.

It must be designed as:

```text
tourist incentive system
tourism data collection system
admin CMS
analytics/dashboard platform
privacy-aware data system
sustainable tourism planning tool
```

Every task should help one of these outcomes.

---

## Product Context

The project concept:

```text
Tourists scan a QR code at a tourist attraction/photo spot.
They see a mobile landing page.
They enter minimal information.
They upload a photo.
They receive a digital certificate/travel memory card.
They earn a digital stamp.
They may optionally answer a short survey.
Admins manage attractions, photo spots, QR codes, dashboard, and exports.
```

The system collects useful data without forcing long forms before the tourist receives value.

---

## Key Product Challenge

The main challenge is:

```text
How do we encourage tourists to give useful data voluntarily?
```

The planning answer:

```text
reward first
ask minimal data first
ask deeper questions after the reward
make survey optional
make LINE optional
support guest and foreign tourists
avoid repeated data entry
make certificate/stamp worth receiving
```

Do not plan tasks that violate this strategy.

---

## Required Product Rules

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
```

Survey should happen after certificate and must be optional.

---

## Recommended Tech Stack

Recommended MVP stack:

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
advanced reports
```

Do not plan optional technologies as blockers for MVP.

---

## Planning Order

Use this phase order unless explicitly changed:

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

---

## Phase 1: Project Setup

Goal:

```text
Create a clean, reproducible foundation.
```

Tasks:

```text
initialize Next.js project
configure TypeScript strict mode
configure Tailwind
create folder structure
create .env.example
configure lint/typecheck/test scripts
create documentation structure
prepare Codex prompts/skills
```

Exit criteria:

```text
app runs locally
typecheck/lint/build scripts exist
environment variables documented
folder structure ready
no secrets committed
```

---

## Phase 2: Database Schema

Goal:

```text
Create analytics-ready, privacy-aware schema.
```

Tasks:

```text
create reference tables
create attraction/photo spot/check-in tables
create tourist/identity/visit tables
create photo/certificate/stamp tables
create survey/expense/satisfaction tables
create consent/audit/admin/export tables
add constraints
add indexes
seed reference data
update data dictionary and ERD
```

Exit criteria:

```text
migrations run
seed data works
Yala/Pattani/Narathiwat exist
repeat visits allowed
duplicate stamps prevented
consent model exists
admin roles exist
dashboard indexes exist
```

---

## Phase 3: Auth and Identity

Goal:

```text
Separate admin authentication from tourist guest identity.
```

Tasks:

```text
admin login
admin_users table integration
role/permission helpers
guest tourist identity strategy
optional identity linking design
ownership guards
```

Exit criteria:

```text
anonymous cannot access admin
viewer/admin/super_admin roles work
guest tourist can use flow without login
ownership checks planned or implemented
```

---

## Phase 4: Public Attraction Pages

Goal:

```text
Show public tourism content professionally.
```

Tasks:

```text
public attraction list
attraction detail page
published/inactive handling
public media
360 media placeholder/embed
mobile responsive UI
```

Exit criteria:

```text
published attractions visible
unpublished/inactive hidden
public pages do not expose private/admin fields
mobile layout works
```

---

## Phase 5: QR Check-in Flow

Goal:

```text
Create the main tourist entry point.
```

Tasks:

```text
/checkin/[code] route
active QR resolution
invalid/inactive/expired QR states
landing page UX
certificate CTA
funnel events
```

Exit criteria:

```text
active QR works
invalid/inactive/expired safe pages work
tourist understands benefit quickly
QR scan is not visit
no login/LINE required
```

---

## Phase 6: Certificate Generation

Goal:

```text
Deliver the reward that motivates participation.
```

Tasks:

```text
minimal profile form
consent capture
visit creation
photo upload
certificate preview
certificate generation
stamp award
passport basics
download
```

Exit criteria:

```text
tourist can complete QR-to-certificate flow
photo upload safe
certificate idempotent
stamp duplicate prevented
survey not required
guest/non-LINE path works
```

---

## Phase 7: Survey, Expense, Satisfaction

Goal:

```text
Collect deeper planning data after the reward.
```

Tasks:

```text
optional survey page
travel behavior fields
expense range fields
satisfaction score fields
revisit/recommendation
optional comment
survey validation
dashboard-ready storage
```

Exit criteria:

```text
survey optional
certificate remains downloadable
survey data stored correctly
missing answers are null, not zero
spending is range-based estimate
```

---

## Phase 8: Admin Backoffice

Goal:

```text
Allow authorized admins to manage tourism content and QR points.
```

Tasks:

```text
admin layout
attraction CMS
photo spot CMS
check-in code CMS
media upload
visit/survey lists if needed
permission-aware UI
audit logs
```

Exit criteria:

```text
admin can create attractions/photo spots/QR codes
viewer cannot mutate
audit logs created
public status reflects admin changes
```

---

## Phase 9: Dashboard

Goal:

```text
Turn data into planning insight.
```

Tasks:

```text
executive dashboard
tourist profile dashboard
travel behavior dashboard
expense dashboard
satisfaction dashboard
funnel dashboard
sustainable tourism insights
filters
tooltips
privacy-safe aggregation
```

Exit criteria:

```text
metrics match dictionary
filters work
privacy-safe responses
QR scans not visits
estimated spending not revenue
missing satisfaction not zero
```

---

## Phase 10: Report Export

Goal:

```text
Allow safe report generation and academic/planning use.
```

Tasks:

```text
CSV exports
dashboard summary export
visit export
survey export
expense export
permission checks
privacy-safe columns
audit log
row limits
```

Exit criteria:

```text
admin can export allowed data
viewer cannot export detailed data
exports exclude private identifiers by default
audit logs created
large export safe
```

---

## Phase 11: LINE LIFF Optional

Goal:

```text
Improve passport persistence for LINE users without blocking non-LINE users.
```

Tasks:

```text
LIFF setup
LINE ID token verification
optional passport linking
LINE consent
fallback guest flow
foreign/non-LINE support
```

Exit criteria:

```text
LINE optional
guest flow still works
foreign tourists supported
LINE ID not exposed/exported
```

---

## Phase 12: Testing and Hardening

Goal:

```text
Prove the system is safe and correct.
```

Tasks:

```text
unit tests
integration tests
E2E tests
security tests
performance checks
mobile manual testing
export privacy tests
dashboard metric tests
```

Exit criteria:

```text
QR-to-certificate tested
permissions tested
ownership tested
dashboard formulas tested
export privacy tested
mobile flow tested
```

---

## Phase 13: Deployment

Goal:

```text
Deploy safely to staging/pilot/production-oriented environment.
```

Tasks:

```text
environment setup
database migration
storage buckets
auth redirects
deployment config
smoke tests
monitoring plan
backup/rollback plan
```

Exit criteria:

```text
staging deploy works
environment variables configured
storage policies correct
smoke tests pass
release checklist completed
```

---

## MVP Scope Rules

MVP must include:

```text
public attractions
QR/check-in
minimal tourist profile
consent
photo upload
certificate generation
stamp/passport basics
optional survey
admin attraction/photo spot/check-in CMS
dashboard basics
privacy-safe export
security basics
```

MVP can postpone:

```text
LINE LIFF
advanced PWA
official data import automation
background export jobs
materialized dashboard tables
AI insight generation
public sharing features
advanced report PDF
```

Do not let optional features delay the core QR-to-certificate data flow.

---

## Prioritization Rules

When choosing between tasks, prioritize:

```text
1. Data model correctness
2. Core tourist QR-to-certificate flow
3. Security/privacy/consent
4. Admin ability to manage QR/content
5. Dashboard metric correctness
6. Export safety
7. UX polish
8. Optional integrations
```

---

## Task Sizing Rules

Prefer small tasks that can be completed and reviewed.

Good task:

```text
Implement active/invalid/inactive/expired QR resolution service and tests.
```

Bad task:

```text
Build the whole app.
```

Split large tasks by:

```text
database
backend service
frontend UI
tests
documentation
```

---

## Dependencies to Respect

Do not build:

```text
dashboard before metric definitions/schema
certificate before photo upload/visit model
survey dashboard before survey schema
export before permissions and column rules
LINE before guest flow works
admin CMS before role/permission foundation
```

---

## Planning Checklist

Before proposing next task, check:

```text
[ ] What phase are we in?
[ ] What dependency must come first?
[ ] Is database support ready?
[ ] Is security/privacy impact understood?
[ ] Is the task small enough?
[ ] Is the expected output testable?
[ ] Does it preserve guest/non-LINE flow?
[ ] Does it support dashboard/analytics quality?
```

---

## Output Format for Planning Tasks

When planning, respond with:

```text
Current phase
- ...

Goal
- ...

Recommended next task
- ...

Why this task now
- ...

Inputs/docs to read
- ...

Expected files
- ...

Acceptance criteria
- ...

Risks
- ...

Next after this
- ...
```

---

## Output Format for Roadmap Updates

When updating roadmap, respond with:

```text
Roadmap change summary
- ...

Added
- ...

Changed
- ...

Removed/postponed
- ...

Reasoning
- ...

Impact on MVP
- ...

Risks
- ...

Recommended next step
- ...
```

---

## Critical Planning Warnings

Never plan a path that:

```text
requires LINE for all tourists
requires email/phone/national ID before certificate
puts survey before certificate reward
counts QR scans as visits
calls estimated spending revenue
shows private identifiers in dashboard/export
makes tourist photos public by default
skips consent
skips permission checks
builds dashboard without metric definitions
```

---

## Planning Review Questions

Before accepting a plan, ask:

```text
Does this help collect useful tourist data?
Does this reduce tourist friction?
Does this protect privacy?
Does this support dashboard metrics?
Does this avoid over-collecting personal data?
Can a non-LINE foreign tourist still complete the flow?
Can an admin use this without developer help?
Can it be tested?
```

---

## Final Rule

Plan the project as a serious production-oriented tourism data platform.

The right order is:

```text
foundation
schema
security
core tourist flow
admin control
analytics
exports
hardening
deployment
```

Do not optimize optional integrations before the core data collection loop works.
