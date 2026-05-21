# ROADMAP.md

## 1. Document Purpose

This roadmap defines the recommended development sequence for the **Southern Border Tourism Data & Intelligence Platform**.

The roadmap is designed for AI-assisted development using Codex or similar coding agents.

The project must be built step by step, with strong documentation and clear acceptance criteria.

---

## 2. Roadmap Principles

### 2.1 Build the Data Foundation First

The database is the core of this project.

Do not start with visual UI only.

The first technical milestone should produce a clean schema for:

- Attractions
- Tourists
- Identities
- Visits
- Photos
- Certificates
- Stamps
- Surveys
- Expenses
- Satisfaction

### 2.2 Build a Complete Thin Slice

The first usable system should prove one full journey:

```text
Admin creates attraction
    |
Tourist scans QR
    |
Location-specific QR landing page
    |
Minimal form + photo
    |
Tourist creates certificate
    |
Stamp is awarded
    |
Optional sharing and optional survey
    |
Visit is stored
    |
Dashboard updates
```

A complete thin slice is better than many incomplete modules.

### 2.3 Keep MVP Small but Serious

The MVP should not be a toy.

It must include real data modeling, validation, consent, and dashboard metrics.

But it should avoid non-essential advanced features.

### 2.4 Add Complexity Only After the Main Loop Works

Do not add mandatory LINE, mandatory tourist Google login, advanced templates, official data import, or complex rewards before the core data collection loop works.

---

## 3. Phase Overview

```text
Phase 0: Documentation and Planning
Phase 1: Project Setup
Phase 2: Database Schema
Phase 3: Master Data and Seed Data
Phase 4: Public Attraction Pages
Phase 5: QR Check-in Flow
Phase 6: Tourist Identity and Profile
Phase 7: Photo Upload
Phase 8: Certificate Generation
Phase 9: Visit, Stamp, Survey, Expense, Satisfaction
Phase 10: Admin Back Office
Phase 11: Dashboard Analytics
Phase 12: Data Export and Reports
Phase 13: Privacy, Security, and Audit Hardening
Phase 14: Testing and Performance
Phase 15: Deployment
Phase 16: Optional Enhancements
```

---

## 4. Phase 0: Documentation and Planning

### Objective

Create the documentation required for controlled development.

### Required Outputs

- README.md
- AGENTS.md
- PROJECT_OVERVIEW.md
- PRODUCT_REQUIREMENTS.md
- MVP_SCOPE.md
- ROADMAP.md
- Database documentation
- Module documentation
- Task files
- Skills for Codex

### Acceptance Criteria

- Codex can understand the project from documentation.
- MVP scope is clear.
- Feature priorities are documented.
- Architecture direction is documented.

### Status

In progress

---

## 5. Phase 1: Project Setup

### Objective

Initialize the application codebase.

### Recommended Stack

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Supabase
Zod
React Hook Form
```

### Tasks

1. Create Next.js project.
2. Configure TypeScript.
3. Configure Tailwind CSS.
4. Configure base layout.
5. Configure environment variables.
6. Configure Supabase client.
7. Create folder structure.
8. Add linting and formatting.
9. Add base UI components.
10. Add route groups for public, tourist flow, and admin.

### Suggested Folder Structure

```text
src/
  app/
    (public)/
    (tourist)/
    admin/
    api/
  components/
  features/
  lib/
  schemas/
  services/
  types/
  styles/
```

### Acceptance Criteria

- Project runs locally.
- Tailwind works.
- Supabase client is configured.
- Basic routes load.
- Environment variables are documented.

### Dependencies

- Phase 0

---

## 6. Phase 2: Database Schema

### Objective

Create the first production-oriented database schema.

### Core Tables

```text
countries
provinces
districts
attraction_types
attractions
attraction_images
attraction_360_media
photo_spots
checkin_codes
tourists
tourist_identities
tourist_contacts
consent_logs
visits
visit_photos
certificate_templates
certificates
stamp_definitions
tourist_stamps
travel_companions
transport_modes
travel_purposes
expense_categories
visit_expenses
satisfaction_surveys
survey_questions
survey_answers
funnel_events
users
roles
permissions
audit_logs
```

### Tasks

1. Write schema migration.
2. Add primary keys.
3. Add foreign keys.
4. Add indexes.
5. Add check constraints.
6. Add timestamp fields.
7. Add soft delete or status fields where needed.
8. Document every table.
9. Prepare seed data.

### Acceptance Criteria

- Schema migration runs successfully.
- Tables are separated by responsibility.
- Dashboard-related indexes exist.
- Tourist and visit are separate entities.
- Identities are separate from tourists.
- Data dictionary is updated.

### Dependencies

- Phase 1

---

## 7. Phase 3: Master Data and Seed Data

### Objective

Add controlled reference data for clean input and analysis.

### Seed Data

- Countries
- Provinces: Yala, Pattani, Narathiwat
- Districts
- Attraction types
- Transport modes
- Travel companions
- Travel purposes
- Expense categories
- Age groups
- Satisfaction question definitions
- Default certificate template
- Example attractions
- Example photo spots

### Tasks

1. Create seed script.
2. Insert province data.
3. Insert master option data.
4. Insert sample attractions.
5. Insert sample QR/check-in codes.
6. Insert default certificate template.

### Acceptance Criteria

- Seed script runs successfully.
- Public pages can display sample attractions.
- Forms can use master data.
- No important dropdown uses hardcoded UI-only values.

### Dependencies

- Phase 2

---

## 8. Phase 4: Public Attraction Pages

### Objective

Create public pages for attraction discovery.

### Routes

```text
/
 /attractions
 /attractions/[slug]
```

### Tasks

1. Build landing page.
2. Build attraction list page.
3. Build attraction card component.
4. Build province filter.
5. Build attraction type filter.
6. Build search input.
7. Build attraction detail page.
8. Show history and description.
9. Show gallery.
10. Show map placeholder or Leaflet map.
11. Show 360 media placeholder.
12. Add call-to-action to certificate/check-in.

### Acceptance Criteria

- Attractions are loaded from database.
- Page is responsive.
- Filters work.
- Detail page is dynamic.
- Missing optional content does not break the UI.

### Dependencies

- Phase 3

---

## 9. Phase 5: QR Check-in Flow

### Objective

Create the QR entry point.

### Route

```text
/c/[checkinCode]
```

### Tasks

1. Resolve check-in code.
2. Validate active status.
3. Load attraction and photo spot.
4. Record qr_scanned event.
5. Show check-in landing page.
6. Show invalid code page.
7. Show inactive code page.
8. Detect browser language.
9. Detect whether user is in LINE browser if possible.
10. Provide options: continue as guest, save with Google later, save with LINE later.
11. Show attraction/photo spot context, certificate preview, and CTA before any form.

### Acceptance Criteria

- Valid code opens correct flow.
- Invalid code is handled gracefully.
- Inactive code is blocked.
- Funnel event is recorded.
- Same QR works for Thai, foreign, LINE, and non-LINE users.
- QR route does not open a long form first.
- Certificate CTA is clear and reward-first.

### Dependencies

- Phase 4

---

## 10. Phase 6: Tourist Identity and Profile

### Objective

Create tourist identity logic.

### Tasks

1. Generate anonymous device token.
2. Store anonymous identity.
3. Create tourist profile.
4. Retrieve returning guest profile.
5. Build minimal profile form.
6. Validate profile data.
7. Store consent log.
8. Prepare identity linking structure for Google/LINE later.
9. Do not use IP address as the main tourist identity mechanism.

### Minimal Form Fields

```text
display_name
origin_country_id or origin_province_id
age_group
visit_date
consent
```

### Acceptance Criteria

- Guest user can continue without login.
- Guest user can continue without Google, LINE, email, or phone number.
- Existing guest profile can later be linked to Google or LINE without creating a duplicate Tourist Profile.
- Tourist profile is created.
- Returning guest is recognized on same device.
- Consent is stored.
- No unnecessary personal data is required.

### Dependencies

- Phase 5

---

## 11. Phase 7: Photo Upload

### Objective

Allow tourists to upload photos for certificate generation.

### Tasks

1. Create upload UI.
2. Validate file type.
3. Validate file size.
4. Show preview.
5. Upload through the server-side storage adapter.
6. Store metadata in visit_photos.
7. Link photo to visit.
8. Handle upload errors.

### Acceptance Criteria

- Valid image uploads successfully.
- Invalid files are rejected.
- Preview works.
- Photo record links to correct visit.
- Storage path is not exposed insecurely.

### Dependencies

- Phase 6

---

## 12. Phase 8: Certificate Generation

### Objective

Generate a digital certificate or memory card.

### Tasks

1. Create default certificate template.
2. Create certificate preview component.
3. Render certificate using tourist and attraction data.
4. Include uploaded photo.
5. Export certificate as image.
6. Store generated certificate file.
7. Store certificate database record.
8. Provide download button.

### Acceptance Criteria

- Certificate can be generated.
- Certificate includes tourist display name.
- Certificate includes attraction name.
- Certificate includes visit date.
- Certificate includes uploaded photo.
- Certificate can be downloaded.
- Certificate record links to visit.

### Dependencies

- Phase 7

---

## 13. Phase 9: Visit, Stamp, Survey, Expense, Satisfaction

### Objective

Complete the tourism data collection model.

### Tasks

1. Create visit record after valid flow.
2. Assign digital stamp.
3. Prevent duplicate stamp for same tourist and attraction.
4. Allow multiple visits to same attraction.
5. Build optional survey form.
6. Store travel behavior data.
7. Store expense range.
8. Store satisfaction score.
9. Store revisit and recommendation intention.
10. Record survey completion event.

### Acceptance Criteria

- Visit record exists.
- Stamp record exists when eligible.
- Duplicate stamp is prevented.
- Survey can be skipped.
- Submitted survey links to visit.
- Expense data appears in database.
- Satisfaction data appears in database.

### Dependencies

- Phase 8

---

## 14. Phase 10: Admin Back Office

### Objective

Create admin tools for managing system data.

### Routes

```text
/admin
/admin/attractions
/admin/photo-spots
/admin/visits
/admin/tourists
/admin/surveys
/admin/settings
```

### Tasks

1. Create admin login.
2. Protect admin routes.
3. Build admin dashboard shell.
4. Build attraction CRUD.
5. Build photo spot CRUD.
6. Build check-in code display.
7. Build visit record list.
8. Build tourist record view.
9. Build survey response view.
10. Add filters and pagination.
11. Add status labels.
12. Add safe deactivation instead of hard delete.

### Acceptance Criteria

- Anonymous users cannot access admin.
- Admin can manage attractions.
- Admin can manage photo spots.
- Admin can view visits.
- Admin lists use pagination.
- Admin actions are validated.

### Dependencies

- Phase 9

---

## 15. Phase 11: Dashboard Analytics

### Objective

Build decision-oriented dashboards.

### Dashboard Sections

1. Executive overview
2. Tourist profile
3. Travel behavior
4. Attraction performance
5. Expense analysis
6. Satisfaction analysis
7. Funnel analytics

### Tasks

1. Define metric calculations.
2. Create dashboard query functions.
3. Build KPI cards.
4. Build charts.
5. Add date filter.
6. Add province filter.
7. Add attraction filter.
8. Add funnel visualization.
9. Add empty state handling.
10. Optimize queries.

### Acceptance Criteria

- Dashboard shows real data.
- Filters work.
- Metrics match definitions.
- Charts support planning questions.
- Dashboard is responsive.

### Dependencies

- Phase 10

---

## 16. Phase 12: Data Export and Reports

### Objective

Allow authorized data export.

### Tasks

1. Export visit records.
2. Export tourist profile summary.
3. Export survey data.
4. Export expense data.
5. Export satisfaction data.
6. Export dashboard summary.
7. Add CSV export.
8. Log export event.
9. Avoid exposing unnecessary personal data.

### Acceptance Criteria

- Admin can export CSV.
- Export respects filters if implemented.
- Export format is usable.
- Export does not include unnecessary sensitive data.
- Export action is logged.

### Dependencies

- Phase 11

---

## 17. Phase 13: Privacy, Security, and Audit Hardening

### Objective

Improve privacy and security before production demo.

### Tasks

1. Review collected data fields.
2. Add consent versioning.
3. Add audit logging.
4. Review Supabase RLS.
5. Protect admin APIs.
6. Validate all server-side inputs.
7. Validate file upload security.
8. Add rate limiting if needed.
9. Check environment variable usage.
10. Remove debug logs.

### Acceptance Criteria

- No secret is exposed.
- Admin-only actions are protected.
- Consent is recorded.
- Important actions are logged.
- Tourist-facing data collection is minimal.
- File upload is validated.

### Dependencies

- Phase 12

---

## 18. Phase 14: Testing and Performance

### Objective

Stabilize the MVP.

### Testing Areas

- QR flow
- Guest identity
- Returning tourist
- Photo upload
- Certificate generation
- Visit creation
- Stamp assignment
- Survey submission
- Admin CRUD
- Dashboard metrics
- Export
- Permissions

### Performance Tasks

1. Optimize images.
2. Add loading states.
3. Add pagination.
4. Check bundle size.
5. Add database indexes if missing.
6. Avoid slow dashboard queries.
7. Add cache where appropriate.

### Acceptance Criteria

- Core flow works consistently.
- No obvious broken mobile layouts.
- Dashboard loads acceptably.
- Forms show useful validation errors.
- Admin lists do not load all records at once.

### Dependencies

- Phase 13

---

## 19. Phase 15: Deployment

### Objective

Deploy the MVP for demonstration or production pilot.

### Recommended MVP Deployment

```text
Frontend: Vercel
Database: Supabase
Storage: Cloudinary-first storage adapter for development/Vercel, Supabase Storage fallback, university storage future
```

### Tasks

1. Configure environment variables.
2. Configure Supabase project.
3. Run migrations.
4. Run seed data.
5. Deploy Next.js app.
6. Test public routes.
7. Test admin login.
8. Test QR flow.
9. Test certificate generation.
10. Test dashboard.
11. Prepare demo QR codes.
12. Prepare fallback demo data.

### Acceptance Criteria

- Public app is accessible.
- Admin app is accessible.
- QR codes work.
- Database is connected.
- Storage works.
- Demo flow is stable.

### Dependencies

- Phase 14

---

## 20. Phase 16: Optional Enhancements

These features should only be built after MVP works.

## 20.1 LINE LIFF Integration

Purpose:

- Improve returning tourist experience for Thai users
- Save passport
- Send certificate links
- Use Rich Menu
- Must remain optional and should be offered after reward or from passport screens

## 20.2 Google Tourist Account Linking

Purpose:

- Save passport across devices
- Recover certificate history
- Reuse profile data after guest participation
- Support tourists who do not use LINE

Rule:

- Google must not block certificate creation or download for tourists.

## 20.3 Email Magic Link

Purpose:

- Support foreign tourists
- Allow passport recovery
- Send certificate link

## 20.4 Advanced Digital Passport

Purpose:

- Show province progress
- Show badge collection
- Encourage repeat visits

## 20.5 Certificate Template Editor

Purpose:

- Allow admin to configure layouts
- Support attraction-specific templates

## 20.5 360 Media Management

Purpose:

- Make public attraction pages richer
- Support immersive tourism promotion

## 20.6 Official Data Import

Purpose:

- Compare local collected data with official tourism statistics
- Integrate official attraction references

## 20.7 Sustainable Tourism Dashboard

Purpose:

- Show deeper planning indicators
- Identify under-promoted and over-concentrated areas

## 20.8 Campaign Module

Purpose:

- Track festivals, events, and promotion campaigns

## 20.9 Advanced Reports

Purpose:

- Generate PDF reports
- Generate academic report appendices
- Export dashboard charts

---

## 21. Recommended Codex Task Order

When using Codex, do not ask it to build everything at once.

Recommended task prompts:

```text
1. Read AGENTS.md and PROJECT_OVERVIEW.md. Create project structure only.
2. Create Supabase schema migration for core tables.
3. Create seed data for provinces and master data.
4. Build public attraction list page.
5. Build attraction detail page.
6. Build /c/[checkinCode] route.
7. Build guest identity service.
8. Build minimal tourist form.
9. Build photo upload service.
10. Build certificate preview and export.
11. Build visit creation and stamp logic.
12. Build optional survey form.
13. Build admin attraction CRUD.
14. Build admin photo spot CRUD.
15. Build dashboard metric queries.
16. Build dashboard UI.
17. Build CSV export.
18. Harden validation and security.
19. Add tests and fix bugs.
20. Prepare deployment.
```

Each task should be small enough to review safely.

---

## 22. Roadmap Milestones

## Milestone 1: Planning Complete

Includes:

- Project documentation
- MVP scope
- Database plan
- Architecture plan
- Task plan

## Milestone 2: Data Foundation Complete

Includes:

- Database schema
- Seed data
- Supabase setup
- Basic types

## Milestone 3: Public Tourism Site Complete

Includes:

- Attraction list
- Attraction detail
- Public content
- Photo spot display

## Milestone 4: QR and Tourist Flow Complete

Includes:

- QR route
- Guest identity
- Minimal form
- Photo upload
- Certificate
- Visit record

## Milestone 5: Survey and Planning Data Complete

Includes:

- Travel behavior
- Expense
- Satisfaction
- Stamp
- Basic passport

## Milestone 6: Admin Complete

Includes:

- Admin login
- Attraction management
- Photo spot management
- Visit records
- Export

## Milestone 7: Dashboard Complete

Includes:

- Executive dashboard
- Tourist profile dashboard
- Travel behavior dashboard
- Expense dashboard
- Satisfaction dashboard
- Funnel analytics

## Milestone 8: Demo Ready

Includes:

- Testing
- Performance check
- Security check
- Deployment
- Demo QR codes
- Sample data

---

## 23. Development Risk Management

### Risk: Scope Creep

Mitigation:

- Follow MVP_SCOPE.md.
- Do not build optional features before the core loop works.

### Risk: Weak Database Design

Mitigation:

- Review DATABASE_REQUIREMENTS.md and DATA_DICTIONARY.md.
- Keep tourist, visit, stamp, certificate, and survey data separate.

### Risk: Poor Tourist Completion Rate

Mitigation:

- Keep minimal form short.
- Give certificate before asking optional survey.
- Track funnel events.

### Risk: Duplicate Tourist Profiles

Mitigation:

- Use tourist_identities table.
- Use anonymous device ID.
- Allow identity linking.

### Risk: Privacy Problems

Mitigation:

- Avoid unnecessary personal data.
- Store consent logs.
- Use aggregated dashboard data.

### Risk: Dashboard Is Not Useful

Mitigation:

- Define metrics before charts.
- Connect every metric to planning questions.

### Risk: Certificate Rendering Takes Too Long

Mitigation:

- Start with one default template.
- Use simple HTML/CSS rendering.
- Optimize later.

---

## 24. Version Roadmap

## Version 0.1: Documentation

- Project documents
- Requirements
- MVP scope
- Roadmap
- Initial task list

## Version 0.2: Database Foundation

- Schema
- Seed data
- Data dictionary
- Basic Supabase setup

## Version 0.3: Public Site

- Attraction list
- Attraction detail
- Basic responsive UI

## Version 0.4: Tourist Flow

- QR route
- Guest identity
- Minimal form
- Photo upload

## Version 0.5: Certificate and Visit

- Certificate generation
- Visit record
- Stamp assignment

## Version 0.6: Survey and Planning Data

- Travel behavior
- Expense
- Satisfaction

## Version 0.7: Admin

- Admin login
- Attraction CRUD
- Photo spot CRUD
- Visit list

## Version 0.8: Dashboard

- Basic metrics
- Charts
- Filters
- Funnel

## Version 0.9: Hardening

- Validation
- Privacy
- Security
- Export
- Testing

## Version 1.0: MVP Release

- Deployed demo
- Stable flow
- Sample QR codes
- Demo data
- Presentation-ready dashboard

---

## 25. Final Roadmap Rule

Always build in this order:

```text
Database first
    |
One complete tourist flow
    |
Admin management
    |
Dashboard
    |
Security and testing
    |
Optional enhancements
```

Do not build advanced features before the core data collection loop is stable.
