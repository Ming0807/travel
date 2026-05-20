# FRONTEND_REQUIREMENTS.md

## 1. Document Purpose

This document defines the frontend requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The frontend must support both:

- tourist-facing public/PWA experience
- admin/backoffice experience
- dashboard and reporting experience

The frontend must be fast, mobile-first, accessible, professional, and consistent with the project goal of building a production-oriented tourism data platform.

---

## 2. Frontend Mission

The frontend must make the system easy enough for tourists to use while collecting data good enough for planning.

The frontend must support:

```text
Public tourism discovery
QR check-in
Tourist profile form
Photo upload
Certificate generation
Digital stamp/passport
Optional survey
Admin CMS
Dashboard analytics
Report/export actions
```

The tourist-facing experience must be optimized for mobile because most users will scan QR codes using phones.

---

## 3. Recommended Frontend Stack

Recommended MVP stack:

```text
Next.js
TypeScript
Tailwind CSS
React
Supabase client/server integration
PWA support
```

Recommended UI libraries:

```text
Tailwind CSS
shadcn/ui or custom accessible components
Lucide icons
Recharts for dashboard charts
html-to-image for MVP certificate export
```

Optional future libraries:

```text
React Hook Form
Zod
TanStack Table
TanStack Query
Framer Motion
Map library
LINE LIFF SDK
```

---

## 4. Frontend Application Areas

The frontend should be divided into clear areas.

```text
Public Website
Tourist PWA Flow
Admin Backoffice
Dashboard Analytics
Report/Export
Authentication Pages
Error and System Pages
```

---

## 5. Public Website Requirements

## 5.1 Purpose

The public website introduces attractions and supports tourism promotion.

It should show:

- attraction list
- attraction details
- province filter
- attraction type filter
- images
- map/location
- 360 media if available
- certificate/check-in CTA

## 5.2 Required Pages

```text
/
 /attractions
 /attractions/[slug]
 /provinces/[provinceSlug] optional
 /about optional
```

## 5.3 Public Website Data

Reads from:

```text
attractions
attraction_types
attraction_images
attraction_360_media
photo_spots
checkin_codes
provinces
districts
```

## 5.4 Public Website Rules

- Show only published and active attractions.
- Do not expose admin-only fields.
- Do not require login.
- Do not require LINE.
- Use responsive layout.
- Load images efficiently.
- Support Thai and English where possible.

---

## 6. Tourist PWA Flow Requirements

## 6.1 Purpose

The tourist PWA flow is the core user journey for data collection.

It begins when tourist scans a QR code.

## 6.2 Required Routes

```text
/c/[checkinCode]
/visit/start
/visit/profile
/visit/photo
/visit/certificate
/visit/success
/passport
/survey/[visitId] optional
```

Exact route names may change, but the flow must remain clear.

## 6.3 Required Flow

```text
QR landing
    |
minimal profile
    |
photo upload
    |
certificate preview/generation
    |
stamp earned
    |
optional survey
    |
passport/save options
```

## 6.4 Tourist Flow Rules

- Keep first screen simple.
- Do not show long survey before reward.
- Do not force login.
- Do not force LINE.
- Allow guest mode.
- Allow foreign tourists.
- Show clear benefit.
- Minimize required fields.
- Use progress indicator.
- Provide friendly error states.
- Support mobile camera/gallery upload.

---

## 7. Admin Backoffice Requirements

## 7.1 Purpose

Admin backoffice manages source data and operations.

## 7.2 Required Pages

```text
/admin
/admin/attractions
/admin/attractions/new
/admin/attractions/[id]/edit
/admin/photo-spots
/admin/checkin-codes
/admin/visits
/admin/reports
/admin/settings
```

## 7.3 Admin UI Requirements

Admin UI should include:

- sidebar navigation
- top bar
- page title
- search and filter controls
- data table
- pagination
- create/edit forms
- status badges
- confirmation dialogs
- toast notifications
- audit-friendly actions

## 7.4 Admin Rules

- Admin routes must be protected.
- Server-side authorization is required.
- Validate forms on client and server.
- Do not hard delete historical records by default.
- Use deactivate/unpublish.
- Use pagination for lists.
- Do not expose service role key.

---

## 8. Dashboard Requirements

## 8.1 Purpose

Dashboard converts data into planning insights.

## 8.2 Required Pages

```text
/admin/dashboard
/admin/dashboard/executive
/admin/dashboard/tourists
/admin/dashboard/visits
/admin/dashboard/expenses
/admin/dashboard/satisfaction
/admin/dashboard/funnel
```

MVP can combine these into one dashboard page with sections.

## 8.3 Dashboard UI Requirements

Dashboard should have:

- global filters
- KPI cards
- charts
- insight tables
- empty states
- loading states
- data freshness note
- export button where appropriate

## 8.4 Required Filters

```text
date range
province
attraction
```

Optional:

```text
origin country
origin province
age group
transport mode
travel purpose
identity provider
```

## 8.5 Dashboard Rules

- Do not count missing data as zero.
- Do not expose private identity data.
- Use metric definitions.
- Use server-side queries or API services.
- Do not aggregate huge raw data in the browser.

---

## 9. Authentication Requirements

## 9.1 Tourist Authentication

Tourists must not be forced to log in.

Supported tourist identity modes:

```text
guest anonymous device
LINE optional
email optional future
```

## 9.2 Admin Authentication

Admin users must authenticate.

Recommended:

```text
Supabase Auth
```

Admin authentication must protect:

```text
/admin/*
dashboard pages
export actions
data management actions
```

## 9.3 Role-Based UI

Frontend should hide unavailable actions based on permission, but server must still enforce permissions.

Do not rely only on frontend hiding.

---

## 10. Internationalization Requirements

## 10.1 MVP Languages

MVP should support:

```text
Thai
English
```

## 10.2 Language Detection

Recommended:

- use browser language for initial tourist flow
- allow manual language switch
- fallback to Thai or English if content missing

## 10.3 Text Storage

Attraction content should support:

```text
name_th
name_en
description_th
description_en
history_th
history_en
```

## 10.4 Translation Rules

- Do not mix Thai and English randomly in one UI section unless intentional.
- Keep button labels short.
- Do not rely only on LINE for Thai users.

---

## 11. PWA Requirements

## 11.1 MVP PWA Goals

Tourist-facing flow should behave like a lightweight mobile app.

Required or recommended:

```text
mobile-first responsive layout
installable manifest future
offline fallback page future
fast loading
home screen compatible icon future
```

## 11.2 Important PWA Pages

```text
QR landing
certificate flow
passport page
```

## 11.3 Offline Behavior

MVP does not need full offline mode.

Future:

- show friendly offline page
- queue non-critical analytics events
- avoid losing in-progress form if possible

---

## 12. Form Requirements

## 12.1 Tourist Forms

Tourist forms must be short and friendly.

Required form types:

```text
minimal tourist profile
photo upload
optional survey
```

## 12.2 Admin Forms

Admin forms may be more detailed.

Required form types:

```text
attraction create/edit
photo spot create/edit
check-in code create/edit
image upload
settings
```

## 12.3 Form Rules

- Validate required fields.
- Show inline errors.
- Disable submit while saving.
- Prevent double submission.
- Keep values after validation errors.
- Use controlled values from master data.
- Avoid unnecessary required fields.

---

## 13. File Upload Requirements

## 13.1 Tourist Photo Upload

Requirements:

- mobile camera/gallery support
- preview
- JPEG/PNG/WebP only
- file size limit
- clear error messages
- upload progress/loading state
- secure storage path

## 13.2 Admin Media Upload

Requirements:

- validate file type
- validate file size
- preview
- alt text/caption
- cover image selection

---

## 14. Certificate UI Requirements

## 14.1 Certificate Preview

Certificate preview should show:

```text
tourist display name
uploaded photo
attraction name
visit date
branding
```

## 14.2 Certificate Export

MVP can use:

```text
React component + html-to-image
```

Required:

- download PNG
- store certificate record
- avoid duplicate generation
- friendly error handling

## 14.3 Visual Quality

Certificate should feel like a premium travel memory card.

It should not look like a plain form result.

---

## 15. Digital Passport UI Requirements

## 15.1 MVP Passport

Show:

```text
tourist display name
total stamps
stamp cards
attraction name
province
earned date
save options
```

## 15.2 Guest Warning

Guest passport should show:

```text
This passport is saved on this device only.
```

Offer:

```text
Save with Google
Save with LINE
Email save future
```

---

## 16. Survey UI Requirements

## 16.1 Post-Reward Survey

Survey should appear after certificate/stamp.

Do not block certificate download.

## 16.2 Survey Structure

Use short sections:

```text
travel behavior
expense
satisfaction
```

## 16.3 Survey Controls

Use:

- chips
- buttons
- star rating
- short inputs
- optional comment

Avoid long forms.

---

## 17. Component Requirements

Recommended reusable components:

```text
Button
Input
Select
SearchSelect
Textarea
DatePicker
FileUpload
ImagePreview
StatusBadge
DataTable
Pagination
FilterBar
KpiCard
ChartCard
EmptyState
LoadingState
ErrorState
ConfirmDialog
Toast
LanguageSwitcher
CertificateCard
StampCard
PassportProgress
```

---

## 18. Layout Requirements

## 18.1 Tourist Layout

Characteristics:

- mobile-first
- centered content
- clear CTA
- minimal navigation
- bottom action button when useful
- clean progress indicator

## 18.2 Public Layout

Characteristics:

- header
- hero sections
- attraction cards
- responsive grid
- footer
- language switch

## 18.3 Admin Layout

Characteristics:

- sidebar
- top bar
- content area
- tables/forms
- filters
- responsive desktop-first but tablet-friendly

---

## 19. Loading State Requirements

Every async screen should have loading state.

Examples:

```text
loading attraction
loading QR check-in
uploading photo
generating certificate
loading dashboard
exporting file
```

Do not leave blank screens.

---

## 20. Empty State Requirements

Empty states should explain what happened and what to do next.

Examples:

```text
No attractions found.
No visits in selected date range.
No satisfaction responses yet.
No stamps collected yet.
```

---

## 21. Error State Requirements

Error states should be friendly and actionable.

Do not show raw technical errors to tourists.

Examples:

```text
This QR code is not available.
We could not upload your photo. Please try again.
We could not generate your certificate.
```

Admin pages may show more detail, but still not raw secrets.

---

## 22. Accessibility Requirements

Frontend must follow basic accessibility rules:

- semantic headings
- alt text
- keyboard accessible controls
- clear focus states
- readable contrast
- label every input
- do not rely only on color
- error messages associated with fields
- buttons must describe action

---

## 23. Responsive Requirements

## 23.1 Mobile

Critical for tourist flow.

Support:

```text
360px width and above
touch-friendly buttons
large readable text
sticky CTA where appropriate
```

## 23.2 Tablet

Support public and admin viewing.

## 23.3 Desktop

Important for admin and dashboard.

---

## 24. Performance Requirements

## 24.1 Tourist Flow

Must be fast.

Rules:

- avoid heavy initial JavaScript
- optimize images
- lazy load non-critical sections
- show loading states
- minimize blocking requests

## 24.2 Dashboard

Rules:

- server-side aggregation
- avoid loading all raw data into browser
- use pagination
- lazy load heavy charts
- memoize where appropriate

## 24.3 Admin

Rules:

- table pagination
- indexed filters
- debounced search
- avoid huge image previews in lists

---

## 25. Data Fetching Requirements

Recommended:

```text
server components/server actions for protected data where appropriate
API routes or service layer for complex operations
client components for interactive forms
```

Rules:

- do not call Supabase service role from frontend.
- do not expose secrets.
- validate server-side.
- centralize data access in service functions.

---

## 26. State Management Requirements

MVP can use:

```text
React state
URL query parameters
server state from API/server components
local storage for guest token
```

Avoid complex global state unless needed.

Possible state categories:

```text
guest token
current flow context
language
form state
dashboard filters
admin table filters
```

---

## 27. URL State Requirements

Dashboard and admin filters should use URL query parameters where useful.

Example:

```text
/admin/dashboard?province=yala&start=2026-05-01&end=2026-05-31
```

Benefits:

- shareable
- reload-safe
- easier debugging

---

## 28. Security Requirements

Frontend must not expose:

```text
service role key
LINE channel secret
private storage credentials
raw provider_user_id
admin-only data in public routes
```

Use environment variables safely:

```text
NEXT_PUBLIC_* only for public values
server-only env for secrets
```

---

## 29. Privacy Requirements

Tourist-facing pages must explain:

- what data is collected
- why it is collected
- certificate/photo usage
- guest identity limitation
- optional Google/LINE save

Do not display:

```text
email
LINE ID
device token
internal IDs
```

in public pages.

---

## 30. Testing Requirements

Frontend should be tested for:

```text
QR route valid/invalid
minimal profile form
photo upload validation
certificate generation
passport display
survey submission
admin CRUD
dashboard filters
export action
mobile layout
empty states
error states
```

---

## 31. MVP Frontend Acceptance Checklist

```text
[ ] Public attraction list works.
[ ] Attraction detail page works.
[ ] QR check-in page works.
[ ] Guest flow works.
[ ] Minimal profile form works.
[ ] Photo upload works.
[ ] Certificate preview/generation works.
[ ] Stamp/passport success screen works.
[ ] Optional survey works or is prepared.
[ ] Admin attraction CMS works.
[ ] Admin photo spot/check-in code management works.
[ ] Dashboard overview works.
[ ] Export path works or is planned.
[ ] Thai/English structure exists.
[ ] Mobile UX is strong.
[ ] Loading/empty/error states exist.
[ ] No secret is exposed.
```

---

## 32. Do Not Do

Do not:

```text
Build desktop-only tourist flow.
Force LINE login.
Ask long survey before certificate.
Hardcode attraction data in components.
Expose unpublished attractions.
Aggregate all dashboard data in browser.
Ignore loading/error states.
Use raw database errors in UI.
Use free-text fields for analyzable values.
Expose service role key.
```

---

## 33. Final Rule

Frontend quality directly affects data quality.

If the UI is too difficult, tourists will not complete the flow.

If tourists do not complete the flow, the database and dashboard lose value.
