---
name: frontend-nextjs-pwa
description: Use when building, reviewing, or debugging frontend work with Next.js, TypeScript, Tailwind CSS, and PWA including public pages, tourist flow, admin backoffice, dashboard UI, certificate UI, responsive layout, and mobile-first design.
---

# Frontend Next.js PWA Skill

## Purpose

Use this skill when building, reviewing, refactoring, or debugging frontend work for the **Southern Border Tourism Data & Intelligence Platform** using Next.js, TypeScript, Tailwind CSS, and PWA-ready design.

The frontend must support:

```text
public attraction pages
QR/check-in landing
tourist minimal profile and consent
photo upload
certificate preview/generation
digital stamp/passport
optional survey
admin backoffice
dashboard analytics
exports
mobile-first/PWA-ready usage
Thai/English UX
```

The frontend is part of the data collection strategy. If the tourist experience is slow, confusing, or too demanding, the database will not receive useful data.

---

## When to Use This Skill

Use this skill for tasks involving:

```text
Next.js App Router
React components
Tailwind CSS
routing structure
public pages
tourist flow pages
admin pages
dashboard UI
certificate UI
PWA basics
responsive layout
frontend performance
client/server component boundaries
frontend validation UX
loading/empty/error states
```

Use the UX/UI skill together with this skill when a task affects conversion, visual design, or user trust.

---

## Required Context

Before frontend implementation, read:

```text
CODEX_MAIN_PROMPT.md
prompts/CODEX_FRONTEND_PROMPT.md
docs/frontend/FRONTEND_REQUIREMENTS.md
docs/frontend/UI_UX_PRINCIPLES.md
docs/frontend/DESIGN_SYSTEM.md
docs/frontend/ROUTES_STRUCTURE.md
docs/frontend/TOURIST_SIDE_PAGES.md
docs/frontend/ADMIN_SIDE_PAGES.md
docs/frontend/FORM_UX_RULES.md
docs/frontend/PWA_REQUIREMENTS.md
docs/frontend/RESPONSIVE_GUIDELINES.md
docs/frontend/ACCESSIBILITY_GUIDELINES.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/testing/UX_TEST_PLAN.md
checklists/FRONTEND_CHECKLIST.md
checklists/UI_UX_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
checklists/PERFORMANCE_CHECKLIST.md
```

For dashboard frontend, also read:

```text
docs/dashboard/DASHBOARD_REQUIREMENTS.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
checklists/DASHBOARD_CHECKLIST.md
```

---

## Frontend Mission

Create a frontend that is:

```text
mobile-first
fast
trustworthy
reward-focused
privacy-aware
accessible
professional
admin-friendly
dashboard-ready
PWA-ready
```

The tourist flow must be simple enough for real tourists using mobile phones at attractions.

---

# Technology Assumptions

---

## Recommended Stack

Use:

```text
Next.js App Router
TypeScript
Tailwind CSS
React
Server Actions / Route Handlers
Zod validation
```

Optional:

```text
React Hook Form
shadcn/ui
Recharts
TanStack Table
html-to-image
next-pwa or custom manifest/service worker strategy
```

Do not introduce a heavy dependency unless it solves a clear problem.

---

## Client and Server Component Boundary

Rules:

```text
Use server components for data fetching where practical.
Use client components only for interactivity.
Do not import server-only code into client components.
Do not import service role Supabase client into client code.
Do not put secrets into NEXT_PUBLIC variables.
```

Client components are appropriate for:

```text
forms
photo upload UI
certificate preview interactivity
dashboard filters
charts
dialogs
menus
upload progress
```

Server components/actions are appropriate for:

```text
public attraction data loading
QR resolution
form submission
server validation
admin permission checks
dashboard aggregation
export generation
storage signed URL generation
```

---

## Environment Variable Rules

Client-safe:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID optional
```

Server-only:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
SUPABASE_DATABASE_URL
LINE_CHANNEL_SECRET
CRON_SECRET
EXPORT_SIGNING_SECRET
```

Do not use server-only variables in client components.

---

# Folder and Route Structure

---

## Recommended `src/app` Structure

```text
src/app/
  (public)/
    page.tsx
    attractions/
      page.tsx
      [slug]/
        page.tsx
  (tourist)/
    checkin/
      [code]/
        page.tsx
    visit/
      [visitId]/
        photo/
          page.tsx
        certificate/
          page.tsx
    passport/
      page.tsx
    survey/
      [visitId]/
        page.tsx
  admin/
    layout.tsx
    page.tsx
    dashboard/
      page.tsx
    attractions/
      page.tsx
    photo-spots/
      page.tsx
    checkin-codes/
      page.tsx
    visits/
      page.tsx
    reports/
      page.tsx
    users/
      page.tsx
```

The exact route structure may change, but must remain documented.

---

## Recommended Component Structure

```text
src/components/
  ui/
  public/
  tourist/
  admin/
  dashboard/
  certificate/
  forms/
```

Guidelines:

```text
shared components go in ui
tourist-specific components go in tourist
admin-specific components go in admin
dashboard charts/cards go in dashboard
certificate template components go in certificate
form components go in forms
```

Do not mix admin dashboard-heavy components into public tourist pages.

---

# Public Pages

---

## Public Home Page

Must:

```text
load without authentication
explain project value clearly
link to attractions
support Thai
support English if multilingual
be mobile responsive
avoid admin/private data
load fast
```

Optional:

```text
province highlights
featured attractions
digital passport explanation
sustainable tourism message
```

---

## Public Attraction List

Must:

```text
show only published active attractions
show optimized image/name/province/short description
support province filter or plan it
support search or plan it
show loading/empty/error states
work on mobile
```

Do not:

```text
show unpublished content
show inactive attractions
show admin notes
show private storage paths
```

---

## Attraction Detail Page

Must:

```text
show attraction name
show province/district
show description/history
show images
show 360 media if configured
show visitor-friendly info
support Thai/English content
handle missing translations gracefully
be mobile responsive
```

360 media should be lazy-loaded and not block the initial page.

---

# Tourist Flow

---

## QR Landing Page

Route example:

```text
/checkin/[code]
```

Must:

```text
work without login
work without LINE
resolve active QR
handle invalid/inactive/expired QR safely
show attraction/photo spot context
show certificate/travel memory benefit quickly
show clear CTA
support Thai
support English if multilingual
load quickly on mobile
```

Critical rules:

```text
QR scan is not a visit.
QR scan should not create full tourist record.
QR page must not expose admin/private data.
```

Good CTA examples:

```text
Create My Certificate
Get My Travel Memory
สร้างใบประกาศของฉัน
รับบัตรที่ระลึก
```

Avoid:

```text
Submit Data
Register for Database
```

---

## Minimal Tourist Profile Form

Required before certificate:

```text
display name
origin country/province
age group
consent
```

Optional:

```text
preferred language
```

Must not require:

```text
LINE
email
phone
national ID
passport number
full address
exact birthdate
```

UX rules:

```text
short form
field-level errors
loading state
duplicate submit prevention
consent not pre-checked
mobile-friendly inputs
```

---

## Consent UI

Must:

```text
show clear short consent
not pre-check checkbox
link to privacy notice
explain certificate use
explain aggregated tourism planning use
explain photo purpose before upload
separate LINE/email/marketing consent if implemented
```

Do not hide consent in tiny gray text.

---

## Photo Upload UI

Must:

```text
accept JPEG/PNG/WebP
show allowed formats
show max file size
show preview
show loading/progress
show retry/re-upload
handle invalid file with friendly message
handle mobile camera/gallery
```

Client-side checks improve UX, but backend validation is still required.

Do not:

```text
show raw storage path
store large base64 persistently
proceed to certificate before upload success
```

---

## Certificate UI

Certificate preview must:

```text
show display name
show tourist photo
show attraction name
show visit date
look professional
handle long names
fit mobile screen
show generate button
show loading state
prevent duplicate click
```

Certificate must not show:

```text
email
LINE ID
internal tourist ID
phone
national ID
full address
```

---

## Certificate Success UI

Must:

```text
show success message
show download button clearly
show stamp earned/already-earned
show optional survey CTA
show passport/save CTA if implemented
allow finish without survey
allow finish without LINE
```

Do not block certificate download behind survey.

---

## Digital Passport UI

Must:

```text
show earned stamps
show empty state
show attraction/province context
explain guest limitation
support optional LINE/email save if implemented
work without LINE
work on mobile
```

Do not show provider_user_id or guest token.

---

## Optional Survey UI

Survey must:

```text
appear after certificate
be optional
be short enough for 1-2 minutes
use spending ranges
use clear satisfaction scale
make comment optional
allow skip/finish
show loading/thank-you states
```

Do not ask sensitive or unnecessary personal questions.

---

# Admin Frontend

---

## Admin Layout

Must:

```text
require admin authentication
use sidebar/topbar navigation
highlight current page
show logout/account menu
show permission-aware nav
work on desktop/tablet
show loading/empty/error states
```

Backend must still enforce permissions.

---

## Admin Attraction CMS

Must:

```text
list attractions
create attraction
edit attraction
publish/unpublish
deactivate
upload/manage media
select province/district
handle slug
support Thai/English fields
show validation errors
confirm destructive actions
```

---

## Admin Photo Spot CMS

Must:

```text
list photo spots
create/edit photo spot
link to attraction
show active/inactive status
manage instruction fields
deactivate safely
```

---

## Admin Check-in Code CMS

Must:

```text
list check-in codes
create QR/check-in code
link to attraction/photo spot
generate or validate code
show active/inactive/expired state
copy QR link
download QR image if implemented
test/open QR link
deactivate code
```

An admin should be able to create and test QR points without developer help.

---

## Admin Export UI

Must:

```text
show export options clearly
require permission
hide restricted exports from viewer
show privacy warning
show loading/success/error states
handle no-data and too-large cases
```

---

# Dashboard Frontend

---

## Dashboard Rules

Must:

```text
be protected
show date/province/attraction filters
show metric definitions/tooltips
show loading/empty/error states
show data freshness
show data limitations
show privacy-safe aggregated data
```

Critical labels:

```text
Tourist Profiles, not Verified Unique Tourists
Estimated Spending, not Revenue
QR Scans separate from Visits
No data for missing/null values
```

Do not fetch all raw data into the frontend.

---

## Dashboard Components

Recommended:

```text
DashboardPageHeader
DashboardFilterBar
DataFreshnessNote
KpiCard
KpiGrid
ChartCard
MetricTooltip
EmptyState
LoadingState
ErrorState
ExportMenu
InsightCard
FunnelChart
RankedTable
```

---

## Dashboard Accessibility

Charts must have:

```text
title
readable legend
not color-only meaning
text/table alternative for important data
accessible filters
```

---

# PWA Requirements

---

## PWA MVP

PWA can be basic in MVP.

Recommended:

```text
manifest
app icon
theme color
mobile-friendly layout
installability optional
offline fallback planned
```

The QR flow must work from browser without install.

Do not let PWA complexity delay the core QR-to-certificate flow.

---

## Offline / Poor Network Behavior

Must handle:

```text
slow loading
upload failure
certificate generation failure
retry
friendly error messages
no blank screens
```

Offline-first data sync is future unless explicitly requested.

---

# Performance

---

## Frontend Performance Rules

Must:

```text
optimize public images
lazy-load 360 media
lazy-load dashboard chart libraries
avoid loading admin code on tourist pages
avoid huge client state
show loading immediately
prevent duplicate submits
```

Do not:

```text
load Recharts on QR landing
load admin table components on tourist pages
render thousands of table rows
store huge base64 in React state long-term
```

---

# Security and Privacy

---

## Frontend Security Rules

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
LINE_CHANNEL_SECRET
CRON_SECRET
private API tokens
```

Never trust:

```text
role from localStorage
tourist_id from localStorage
visit_id from hidden input without backend ownership
file extension as proof of safety
client-only consent validation
```

---

## Privacy UI Rules

Must communicate:

```text
why data is collected
photo use
aggregated planning use
survey optionality
LINE/email optionality
certificate/private sharing behavior
```

Do not show private identifiers in dashboard/admin UI by default.

---

# Testing

---

## Component Tests

Recommended:

```text
MinimalProfileForm validation
consent checkbox default unchecked
PhotoUpload invalid file message
CertificatePreview long name
KpiCard No data state
Dashboard filters
ExportButton states
```

---

## E2E Tests

Important:

```text
active QR flow
invalid/inactive QR states
QR-to-certificate flow
photo upload
certificate download
optional survey
returning tourist
admin login
admin attraction CRUD
admin QR creation
dashboard filters
export flow
viewer permission denied
```

---

## Manual Mobile Testing

Required before release:

```text
real phone QR scan
mobile photo upload
mobile certificate download
Thai flow
English/non-LINE flow
LINE browser if LIFF used
```

---

# Frontend Task Output Format

When completing frontend work, respond:

```text
Summary
- ...

Files changed
- ...

Validation
- typecheck/lint/test/build results

UX notes
- mobile behavior
- loading/empty/error states
- accessibility notes

Security/privacy notes
- ...

Risks / Notes
- ...

Next suggested task
- ...
```

---

# Frontend Review Checklist

Before accepting frontend work:

```text
[ ] Tourist flow works on mobile.
[ ] QR page explains benefit quickly.
[ ] Minimal form is short.
[ ] Consent is visible and not pre-checked.
[ ] LINE/email/phone not required.
[ ] Photo upload has preview/loading/error/retry.
[ ] Certificate download is clear.
[ ] Survey is optional after certificate.
[ ] Admin UI is permission-aware.
[ ] Dashboard labels are correct.
[ ] No private identifiers shown.
[ ] No client secrets exposed.
[ ] Loading/empty/error states exist.
[ ] Accessibility basics included.
```

---

## Critical Frontend Blockers

Block if:

```text
LINE required for all tourists
email/phone/national ID required before certificate
survey required before certificate download
consent missing or pre-checked
certificate download hidden/broken
photo upload unusable on mobile
dashboard calls estimated spending revenue
dashboard counts QR scans as visits
service role key in client code
private identifiers shown in dashboard/export UI
```

---

## Final Rule

The frontend should reward the tourist first, then respectfully ask for more data.

A fast, trustworthy, mobile-first frontend is essential for database quality.
