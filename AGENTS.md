# AGENTS.md

This file contains the operating instructions for AI coding agents working on the **Southern Border Tourism Data & Intelligence Platform**.

All agents must read this file before modifying the repository.

---

## 1. Project Identity

Project name:

```text
Southern Border Tourism Data & Intelligence Platform
```

Project purpose:

```text
Build a production-oriented tourism database and analytics platform for Yala, Pattani, and Narathiwat.
```

The system must support:

1. Tourist data collection
2. Travel behavior analysis
3. Attraction visit tracking
4. Expense analysis
5. Satisfaction analysis
6. Sustainable tourism planning
7. Dashboard and reporting
8. Digital certificate and stamp incentives
9. Privacy-aware data handling

This is not a simple CRUD project. Treat it as a real-world information system.

---

## 2. Golden Rule

Every feature must support the main academic and production objective:

> Create a high-quality southern border tourist database that can be used for sustainable tourism planning.

The QR, PWA, certificate, digital stamp, LINE, and email features are supporting mechanisms. They are not the main objective.

---

## 3. Core Data Dimensions

All implementation must preserve these five core dimensions:

```text
Tourist
Travel Behavior
Attractions Visited
Expenses
Satisfaction
```

When building a feature, always identify which of these dimensions it supports.

Examples:

- Certificate generation supports tourist engagement and visit recording.
- QR scanning supports attraction visit tracking.
- Optional survey supports travel behavior, expenses, and satisfaction.
- Dashboard supports planning and policy analysis.

---

## 4. Recommended Architecture

The target architecture is:

```text
Next.js PWA
    |
    |-- Public tourist pages
    |-- Admin dashboard
    |-- Tourist certificate flow
    |-- Optional LINE LIFF flow
    |
Supabase PostgreSQL
    |
    |-- Tourism database
    |-- Auth
    |-- Storage
    |
Optional Backend Layer
    |
    |-- NestJS or Next.js API routes
    |-- Certificate rendering
    |-- Secure file handling
    |-- Dashboard aggregation
```

For MVP development, using Next.js with Supabase is acceptable.

For production-oriented design, keep the code structured so a dedicated NestJS backend can be added later.

---

## 5. Technology Preferences

Use these technologies unless a task explicitly states otherwise:

```text
Frontend: Next.js
Language: TypeScript
Styling: Tailwind CSS
UI Components: shadcn/ui where appropriate
Database: Supabase PostgreSQL
Storage: Supabase Storage
Validation: Zod
Forms: React Hook Form
Charts: ECharts or ApexCharts
Maps: Leaflet
State/Data Fetching: TanStack Query or server actions depending on architecture
```

Avoid introducing heavy or unnecessary dependencies.

---

## 6. Development Principles

### 6.1 Production-Oriented Code

Write code as if the system may be deployed for real users.

Requirements:

- Clear structure
- Strict typing
- Good naming
- Error handling
- Validation
- Security awareness
- Responsive UI
- Accessible forms
- Maintainable modules
- No hardcoded production secrets

### 6.2 Mobile-First UX

Most tourists will use mobile phones.

All tourist-facing pages must be:

- Mobile-first
- Fast
- Easy to understand
- Short and low-friction
- Usable with weak internet
- Friendly for Thai and international visitors

### 6.3 Progressive Data Collection

Do not ask tourists to fill long forms before receiving value.

Preferred flow:

```text
Minimal form
    |
Generate certificate
    |
Earn stamp
    |
Ask optional survey
```

Required first-step data should be minimal.

Optional data should be requested after the tourist receives a certificate or stamp.

### 6.4 Privacy by Design

Do not collect personal data unless necessary.

Avoid:

- National ID number
- Full legal address
- Sensitive personal data
- Forced GPS location
- Required full legal name
- Required email or phone number before certificate creation

Prefer:

- Display name
- Country
- Province
- Age group
- Optional LINE
- Optional email
- Anonymous device identity
- Aggregated dashboard data

---

## 7. Identity Strategy

The system must support multiple identity methods.

Supported identity providers:

```text
anonymous_device
line
email
google_optional
```

The same tourist may have multiple identities.

Example:

```text
tourist_id: 123
identities:
  - anonymous_device
  - line
  - email
```

Important rule:

> Do not create a new tourist profile every time the same person visits a new attraction.

Separate:

```text
tourists = person/profile
visits = each tourism visit
tourist_stamps = earned attraction stamps
certificates = generated certificate records
```

---

## 8. QR Check-in Rules

Use one QR code per photo spot or attraction entry point.

Do not create separate QR codes for LINE users, foreign tourists, guest users, or email users.

The QR should open a neutral PWA route:

```text
/c/[checkinCode]
```

The system should then detect:

- Attraction
- Photo spot
- Campaign
- Browser language
- LINE environment
- Existing guest token
- Existing authenticated identity

Recommended flow:

```text
Scan QR
    |
Open check-in page
    |
Detect context
    |
Show appropriate identity options
    |
Continue as guest / LINE / email
    |
Upload photo
    |
Minimal form
    |
Generate certificate
    |
Optional survey
```

---

## 9. Certificate and Stamp Rules

The certificate and digital stamp are incentives for data collection.

They must not dominate the database design.

Certificate-related data must connect to:

- tourist
- visit
- attraction
- photo
- template
- generated file
- created_at

Stamp-related data must connect to:

- tourist
- attraction
- visit
- earned_at

A tourist can visit the same attraction multiple times, but should normally earn the attraction stamp once.

Therefore:

```text
visits = every visit
tourist_stamps = first earned stamp per attraction
```

---

## 10. Database Design Rules

### 10.1 General Rules

Use relational modeling carefully.

Avoid large mixed-purpose tables.

Use normalized master data where useful.

Prefer structured fields over free text.

Use clear foreign keys.

Add indexes for common dashboard and filtering fields.

### 10.2 Important Table Groups

Expected table groups:

```text
Geography
Attractions
Tourists
Visits
Expenses
Satisfaction
Certificates
Digital Stamps
Analytics
Security
Official Data Imports
```

### 10.3 Naming Conventions

Use snake_case for database table and column names.

Examples:

```text
tourists
tourist_identities
visit_expenses
satisfaction_surveys
photo_spots
checkin_codes
```

Use clear boolean names:

```text
is_active
is_primary
is_published
is_completed
has_consented
```

Use timestamp names consistently:

```text
created_at
updated_at
deleted_at
earned_at
generated_at
completed_at
```

### 10.4 Required Constraints

Where appropriate, include:

- Primary keys
- Foreign keys
- Unique constraints
- Check constraints
- Not-null constraints
- Indexes

Example:

```text
unique(tourist_id, attraction_id)
```

for stamp uniqueness.

---

## 11. Dashboard Rules

Dashboards must answer planning questions, not only display decorative charts.

Dashboard categories:

1. Executive overview
2. Tourist profile
3. Travel behavior
4. Attraction performance
5. Expense analysis
6. Satisfaction analysis
7. Sustainable tourism indicators
8. Funnel analytics

Every dashboard metric should have:

- Metric name
- Definition
- Data source table
- Filter dimensions
- Calculation rule
- Interpretation

Do not create charts without clear decision-making value.

---

## 12. Sustainable Tourism Rules

The system should help identify sustainable tourism opportunities.

Include indicators such as:

- Attraction popularity
- Tourist concentration
- Satisfaction by attraction
- Spending distribution
- Community-based attraction visits
- Revisit intention
- Recommendation intention
- Transport patterns
- Overnight stays
- Problem categories
- Province-level distribution

Planning insights should help answer:

- Which attractions need improvement?
- Which provinces need promotion?
- Which routes should be promoted?
- Where does tourism spending concentrate?
- Which tourist groups are most valuable?
- Which locations are overused or under-promoted?

---

## 13. Admin System Rules

Admin features must be practical and safe.

Expected admin modules:

- Attraction management
- Photo spot management
- 360 media management
- QR/check-in code management
- Certificate template management
- Tourist record view
- Visit record view
- Survey record view
- Dashboard view
- Export reports
- User and role management
- Audit logs

Admin lists must include:

- Search
- Filters
- Pagination
- Sort
- Status labels
- Safe delete or archive behavior

Avoid loading large datasets without pagination.

---

## 14. Form UX Rules

Tourist-facing forms must be short.

### Minimal required form

Ask only:

- Name on certificate
- Origin country/province
- Age group
- Visit date
- Consent checkbox

### Optional follow-up form

Ask:

- Travel companion
- Group size
- Transport mode
- Overnight status
- Spending range
- Satisfaction score
- Revisit intention
- Recommendation intention
- Optional comment

Use dropdowns, chips, sliders, or rating buttons instead of long text fields.

---

## 15. Language Rules

The system should support at least:

```text
Thai
English
```

Malay can be added later if required.

Implementation should not hardcode user-facing strings deeply inside business logic.

Use a structure that can support localization.

---

## 16. Security Rules

Never commit:

- API keys
- Supabase service role key
- LINE channel secret
- Production database URL
- Private credentials
- Real user data exports

Use environment variables.

Expected `.env` keys should be documented in `ENVIRONMENT.md`.

Use Supabase Row Level Security where direct client access is used.

Admin-only operations must not be exposed to anonymous users.

---

## 17. File Upload Rules

Tourist image upload must be handled carefully.

Requirements:

- Validate file type
- Validate file size
- Store original and generated certificate separately
- Generate thumbnail where useful
- Do not expose private storage paths directly unless intended
- Consider manual review workflow for inappropriate images
- Store photo metadata in the database

Allowed file types for MVP:

```text
image/jpeg
image/png
image/webp
```

Reject unsupported file types.

---

## 18. Error Handling Rules

User-facing errors must be understandable.

Bad:

```text
Database error
```

Good:

```text
We could not save your visit record. Please try again.
```

Admin-facing errors may include more technical detail, but must not expose secrets.

API errors should use consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  }
}
```

---

## 19. Testing Rules

Every major module should include tests or at least documented acceptance criteria.

Important test areas:

- QR check-in flow
- Tourist profile creation
- Returning tourist flow
- Photo upload
- Certificate generation
- Survey submission
- Expense data collection
- Satisfaction data collection
- Dashboard calculation
- Admin CRUD
- Permission checks
- Data validation

When writing code, also update or create relevant test notes.

---

## 20. Performance Rules

Performance matters because tourists may use mobile devices and weak internet.

Rules:

- Optimize images
- Use thumbnails
- Avoid heavy initial bundles
- Paginate admin tables
- Cache public attraction pages when possible
- Avoid dashboard queries directly over large raw tables
- Use summary tables or views for analytics
- Add database indexes for common filters

Common filter fields:

```text
province_id
district_id
attraction_id
visit_date
created_at
tourist_id
campaign_id
```

---

## 21. Documentation Rules

When adding or changing a module, update the relevant documentation.

Examples:

- Database changes -> update `docs/database/DATA_DICTIONARY.md`
- API changes -> update `docs/backend/API_ENDPOINTS.md`
- UI changes -> update `docs/frontend/ROUTES_STRUCTURE.md`
- Dashboard changes -> update `docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md`
- Security changes -> update `docs/security/*.md`

Do not leave documentation outdated after major implementation changes.

---

## 22. Task Execution Rules for Codex

Before coding:

1. Read `README.md`.
2. Read this `AGENTS.md`.
3. Read the relevant module documentation.
4. Read the related task file.
5. Identify affected files.
6. Make the smallest safe change.
7. Validate the result.
8. Update documentation if needed.

Do not rewrite unrelated files.

Do not introduce large architectural changes without documenting them as an ADR.

Do not remove privacy or validation logic to make implementation easier.

---

## 23. Commit and PR Guidance

Commit messages should be clear.

Recommended format:

```text
feat: add QR check-in landing flow
fix: validate survey score range
docs: update database table dictionary
refactor: separate tourist identity service
test: add visit creation test cases
```

Pull requests should explain:

- What changed
- Why it changed
- Screenshots if UI changed
- Database migration impact
- Security/privacy impact
- Testing performed

---

## 24. Prohibited Shortcuts

Do not:

- Store all tourist data in one table.
- Force LINE login before certificate creation.
- Require email before the tourist receives value.
- Store exact full addresses.
- Store national ID numbers.
- Store sensitive personal attributes unnecessarily.
- Use free-text fields when controlled values are needed.
- Build dashboards without clear metric definitions.
- Load all records into admin tables without pagination.
- Put service role keys in frontend code.
- Disable security rules for convenience.
- Ignore duplicate tourist identity handling.

---

## 25. Preferred Implementation Order

Recommended implementation sequence:

```text
1. Project setup
2. Database schema
3. Seed master data
4. Public attraction pages
5. QR check-in flow
6. Tourist identity handling
7. Photo upload
8. Certificate generation
9. Visit recording
10. Optional survey
11. Expense and satisfaction collection
12. Admin attraction management
13. Dashboard metrics
14. Export reports
15. Security hardening
16. Testing and deployment
```

---

## 26. Definition of Done

A task is done only when:

- The feature works
- The code is typed and validated
- User-facing errors are handled
- Security impact is considered
- Database changes are documented
- UI is responsive if user-facing
- Admin lists are paginated where needed
- Acceptance criteria are met
- Relevant documentation is updated

---

## 27. Final Reminder

This project must look and behave like a serious tourism data platform.

Always prioritize:

```text
Data quality
User experience
Privacy
Dashboard usefulness
Maintainability
Production readiness
```


