---
name: documentation-report
description: Use when creating, reviewing, or updating documentation and academic/report materials including README, architecture docs, database docs, module docs, dashboard docs, security docs, testing docs, and academic report chapters.
---

# Documentation Report Skill

## Purpose

Use this skill when creating, reviewing, refactoring, or updating documentation and academic/report materials for the **Southern Border Tourism Data & Intelligence Platform**.

This project is both:

```text
a production-oriented tourism data system
an academic/university-level database project
```

Documentation must support:

```text
Codex development
system architecture
database design
security/privacy review
dashboard metric explanation
testing evidence
deployment readiness
academic report chapters
presentation/demo
future maintenance
```

Documentation must not falsely claim that unimplemented features are complete.

---

## When to Use This Skill

Use this skill for tasks involving:

```text
README
project overview
product requirements
MVP scope
architecture docs
database docs
ERD/data dictionary
module docs
frontend/backend docs
dashboard docs
security/PDPA docs
testing docs
academic report chapters
use case reports
dashboard reports
deployment docs
Codex prompts
checklists
changelog
release notes
```

Use together with domain skills when documenting technical areas:

```text
database-design
supabase-postgresql
frontend-nextjs-pwa
backend-api
dashboard-analytics
pdpa-security
testing-qa
deployment-release
```

---

## Required Context

Before documentation work, read relevant documents from:

```text
README.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
ROADMAP.md
docs/00_INDEX.md
docs/architecture/
docs/database/
docs/modules/
docs/frontend/
docs/backend/
docs/dashboard/
docs/security/
docs/testing/
docs/reports/
prompts/
checklists/
```

For academic report work, read:

```text
docs/reports/ACADEMIC_REPORT_STRUCTURE.md
docs/reports/CHAPTER_1_INTRODUCTION.md
docs/reports/CHAPTER_2_THEORY_RELATED_WORK.md
docs/reports/CHAPTER_3_SYSTEM_ANALYSIS_DESIGN.md
docs/reports/CHAPTER_4_IMPLEMENTATION.md
docs/reports/CHAPTER_5_CONCLUSION.md
docs/reports/DATA_DICTIONARY_REPORT.md
docs/reports/ERD_REPORT.md
docs/reports/USE_CASE_REPORT.md
docs/reports/DASHBOARD_REPORT.md
```

---

## Documentation Mission

Documentation must make the system understandable, buildable, reviewable, and defensible.

It should answer:

```text
What problem does the system solve?
Who uses it?
What data is collected and why?
How does the QR-to-certificate flow work?
How does the database support dashboard analytics?
How is privacy protected?
How are dashboard metrics defined?
How is the system tested?
How is the system deployed?
What is included in MVP?
What is future work?
```

---

# Core Documentation Rules

---

## Rule 1: Be Accurate

Do not write that a feature exists if it is only planned.

Use clear status labels:

```text
Implemented
In progress
Planned
Optional
Future
Out of MVP
```

Bad:

```text
The system imports official tourism data automatically.
```

Good:

```text
Official tourism data import is planned for a future phase. The database design reserves tables and integration strategy for this purpose.
```

---

## Rule 2: Preserve Product Strategy

Documentation must preserve the core strategy:

```text
reward first
minimal required data first
optional survey after reward
LINE optional
guest and foreign tourist support
privacy by design
dashboard metric honesty
```

Do not document a flow that requires LINE/email/survey before certificate unless the project intentionally changes direction.

---

## Rule 3: Use Consistent Terminology

Use these terms consistently:

```text
Tourist Profile
Visit
QR Scan
Landing View
Certificate
Digital Stamp
Digital Passport
Optional Survey
Estimated Spending
Average Satisfaction
Survey Completion Rate
Tourist Profiles
Total Visits
```

Avoid misleading terms:

```text
Verified Unique Tourists
Official Arrivals
Revenue
Income
Total Population
```

unless methodology is defined and verified.

---

## Rule 4: Privacy-Safe Writing

Do not suggest collecting unnecessary sensitive data.

Avoid recommending:

```text
national ID
passport number
full address
exact birthdate
required phone
required email
required LINE
exact income
religion
ethnicity
health data
political data
```

Use:

```text
age group
origin country/province
spending range
optional comment
aggregated analytics
```

---

## Rule 5: Explain Limitations

Documentation should clearly state:

```text
local platform visits are not official tourist arrivals
tourist profiles are system profiles, not verified unique people
estimated spending is self-reported/range-based
satisfaction data comes from optional surveys
dashboard insights depend on sample size
QR scans are not visits
```

This protects academic and production credibility.

---

# Project Documentation

---

## README.md

README should include:

```text
project name
short description
problem statement
main features
tech stack
quick start
environment variables
folder structure
development commands
testing commands
deployment overview
important privacy/security notes
documentation index
```

Do not include secrets.

---

## PROJECT_OVERVIEW.md

Should explain:

```text
project background
southern border tourism context
core problem
target users
system concept
QR-to-certificate incentive strategy
dashboard planning purpose
MVP scope
future vision
```

---

## PRODUCT_REQUIREMENTS.md

Should include:

```text
business goals
user personas
functional requirements
non-functional requirements
data requirements
dashboard requirements
security/privacy requirements
MVP acceptance criteria
out-of-scope items
```

---

## MVP_SCOPE.md

Must clearly separate:

```text
MVP
Post-MVP
Optional
Future
Out of scope
```

MVP should include:

```text
public attractions
QR/check-in
minimal tourist profile and consent
photo upload
certificate generation
digital stamp/passport basics
optional survey
admin CMS
dashboard basics
privacy-safe export
security basics
testing/deployment basics
```

MVP can postpone:

```text
LINE LIFF
advanced PWA
official data import automation
background export jobs
AI insights
public sharing
advanced PDF reports
```

---

## ROADMAP.md

Should follow phases:

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

Each phase should include:

```text
goal
tasks
dependencies
acceptance criteria
risks
```

---

# Architecture Documentation

---

## Architecture Overview

Must include:

```text
system context
frontend/backend/database/storage boundaries
public/tourist/admin areas
server-side validation/auth/permission strategy
Supabase usage
storage bucket strategy
dashboard aggregation strategy
deployment overview
```

---

## Diagrams

Use text/Markdown diagrams where possible:

```text
system context diagram
module architecture
data flow
sequence flows
QR-to-certificate sequence
certificate generation sequence
admin CMS sequence
dashboard query flow
export flow
```

Keep diagrams readable and update them when architecture changes.

---

## ADRs

Architecture Decision Records should include:

```text
status
context
decision
alternatives considered
consequences
related documents
```

Example ADR topics:

```text
Next.js PWA as core
Supabase PostgreSQL
guest-first identity
single QR entry flow
certificate as incentive
dashboard summary tables
privacy by design
```

---

# Database Documentation

---

## Data Dictionary

Data dictionary must include:

```text
table name
purpose
column name
data type
nullable
constraints
foreign key
default
description
privacy sensitivity
dashboard relevance
```

Critical tables:

```text
tourists
tourist_identities
visits
visit_photos
certificates
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

---

## ERD Documentation

Should explain:

```text
entity groups
key relationships
cardinality
repeat visit logic
duplicate stamp prevention
certificate-visit relationship
survey-visit relationship
admin/RBAC model
audit/export relationship
```

Important clarification:

```text
visits allow repeat records
tourist_stamps prevents duplicate stamp per tourist-attraction
QR scans are funnel events, not visits
```

---

## Database Requirements

Must cover:

```text
normalization
constraints
indexes
data quality
analytics readiness
privacy minimization
RLS/storage relation
retention/anonymization
seed data
migration process
```

---

# Module Documentation

Each module doc should include:

```text
module purpose
users
features
data involved
frontend routes
backend APIs/services
database tables
security/privacy requirements
UX requirements
validation rules
acceptance criteria
test cases
future improvements
```

Module examples:

```text
Public Attractions
QR Check-in
Tourist Profile
Visit Record
Photo Upload
Certificate Generation
Digital Stamp Passport
Survey Expense Satisfaction
Admin Attraction CMS
Dashboard Analytics
Report Export
LINE LIFF Optional
Official Data Import
```

---

# Frontend Documentation

Frontend docs should include:

```text
routes
layouts
components
public/tourist/admin separation
design system
form UX rules
responsive rules
accessibility
PWA strategy
loading/empty/error states
```

Route docs should mention:

```text
purpose
auth requirement
data source
important states
privacy notes
```

---

# Backend Documentation

Backend docs should include:

```text
API guidelines
endpoint list
input/output examples
validation rules
error codes
auth/permission rules
ownership rules
file upload flow
certificate rendering flow
export flow
background jobs
```

Endpoint docs should include:

```text
method
path
auth
permission
input
output
errors
privacy notes
test cases
```

Do not expose secrets in docs.

---

# Dashboard Documentation

Dashboard docs must include:

```text
metric dictionary
formula
denominator
filters
data source
null/zero behavior
privacy constraints
limitations
visualization type
acceptance tests
```

Critical metric documentation:

```text
QR scans are not visits
Estimated Spending is not Revenue
Missing satisfaction is No data/null
Tourist Profiles are not verified unique people
```

Each dashboard section should explain:

```text
planning question
metrics
charts
filters
interpretation
limitations
suggested actions
```

---

# Security and PDPA Documentation

Security docs must include:

```text
data minimization
consent management
role/permission matrix
RLS strategy
storage bucket policy
audit logging
data anonymization
image upload security
export privacy
safe error handling
secret management
```

Consent docs should include:

```text
purpose
consent version
when shown
where stored
how withdrawal/anonymization is handled or planned
```

---

# Testing Documentation

Testing docs should include:

```text
testing strategy
unit test plan
integration test plan
E2E test plan
UX test plan
performance test plan
security test plan
acceptance criteria
test data strategy
manual QA scripts
release gate
```

Testing docs must explicitly cover:

```text
QR-to-certificate flow
photo upload validation
certificate idempotency
stamp duplicate prevention
tourist ownership
admin permissions
dashboard formula correctness
export privacy
mobile test
```

---

# Academic Report Documentation

---

## Academic Report Structure

Recommended structure:

```text
Chapter 1: Introduction
Chapter 2: Theory and Related Work
Chapter 3: System Analysis and Design
Chapter 4: Implementation
Chapter 5: Conclusion and Recommendations
Appendices: ERD, Data Dictionary, Use Cases, UI Screenshots, Test Cases
```

---

## Chapter 1: Introduction

Should include:

```text
background and importance
problem statement
objectives
scope
expected benefits
definitions
```

Project-specific angle:

```text
southern border tourism data gap
need for local tourist participation database
sustainable tourism planning
incentive-based data collection
dashboard support
```

---

## Chapter 2: Theory and Related Work

Should include:

```text
database systems
relational database design
ERD
normalization
web application architecture
tourism information systems
sustainable tourism indicators
dashboard/BI concepts
PDPA/privacy by design
PWA/mobile-first concepts
QR code technology
digital certificate/passport concepts
```

Only cite sources that are actually verified.

Do not invent citations.

---

## Chapter 3: System Analysis and Design

Should include:

```text
stakeholders
user roles
requirements
use cases
system architecture
data flow
ERD
data dictionary
UI/UX design
security design
dashboard design
```

---

## Chapter 4: Implementation

Should include:

```text
technology stack
database implementation
frontend implementation
backend implementation
QR flow
photo upload
certificate generation
digital passport
survey
admin CMS
dashboard
export
testing evidence
screenshots
```

Be honest about MVP vs planned features.

---

## Chapter 5: Conclusion

Should include:

```text
summary of results
benefits
limitations
future improvements
lessons learned
recommendations
```

Limitations may include:

```text
sample size
optional survey response rate
guest identity limitations
LINE optional integration not in MVP
official data import future
dashboard confidence limitations
```

---

# Documentation Style Rules

---

## Writing Style

Use:

```text
clear headings
short paragraphs
tables where useful
consistent terminology
actionable requirements
explicit acceptance criteria
```

Avoid:

```text
vague claims
overly promotional text
unsupported official claims
contradictions
large unstructured walls of text
```

---

## Status Labels

Use:

```text
MVP
Post-MVP
Optional
Future
Not implemented
Implemented
Planned
```

This prevents confusion.

---

## Cross-References

Add related docs references when useful:

```text
See docs/database/DATA_DICTIONARY.md
See docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
See docs/security/PDPA_PRIVACY_DESIGN.md
```

---

## Evidence and Citations

For academic documents:

```text
Use verified citations only.
Do not fabricate sources.
Record source title, publisher, URL, accessed date if needed.
Use paraphrase unless quoting is necessary.
```

For technical internal docs, citations are usually not required unless referencing external standards/laws/frameworks.

---

# Documentation Review Checklist

Before accepting documentation:

```text
[ ] Matches current project strategy.
[ ] Does not falsely claim planned features are implemented.
[ ] Uses consistent terminology.
[ ] Preserves guest/non-LINE flow.
[ ] Preserves survey-after-reward flow.
[ ] Preserves privacy/data minimization.
[ ] Dashboard metrics are defined correctly.
[ ] QR scans and visits are separated.
[ ] Estimated spending not called revenue.
[ ] Security/PDPA requirements included.
[ ] Acceptance criteria included where useful.
[ ] Related docs updated if behavior changed.
```

---

## Critical Documentation Blockers

Block documentation if it:

```text
claims LINE is required for all tourists
puts survey before certificate as mandatory
calls QR scans visits
calls estimated spending revenue
labels Tourist Profiles as verified unique people
recommends national ID/full address collection
exposes secrets or keys
claims unimplemented features are complete
contradicts database/dashboard/security docs
```

---

# Documentation Task Prompt

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Create/update documentation.]

Context:
Documentation must support production-oriented development, academic reporting, and future maintenance.

Read first:
- .codex/skills/documentation-report/SKILL.md
- CODEX_MAIN_PROMPT.md
- relevant docs in docs/
- relevant checklists/

Requirements:
- Keep terminology consistent.
- Be accurate about implemented vs planned.
- Preserve privacy/security rules.
- Preserve dashboard metric definitions.
- Add acceptance criteria where useful.
- Update related docs if needed.

Do not:
- Do not invent implemented features.
- Do not invent citations.
- Do not recommend over-collecting personal data.
- Do not contradict metric definitions.
- Do not expose secrets.

Completion response:
Summary
Files changed
Documentation notes
Validation
Risks / Notes
Next suggested task
```

---

# Output Format

When completing documentation work, respond:

```text
Summary
- ...

Files changed
- ...

Documentation notes
- status labels
- assumptions
- cross-references

Validation
- link/path checks
- consistency checks

Risks / Notes
- ...

Next suggested task
- ...
```

---

## Final Rule

Documentation is part of system quality.

If the documentation is inaccurate, the implementation plan, academic report, dashboard interpretation, and production readiness will all become unreliable.
