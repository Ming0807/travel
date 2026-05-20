# CODEX_FRONTEND_PROMPT.md

## 1. Purpose

Use this prompt when asking Codex to build, review, refactor, or debug frontend work for the **Southern Border Tourism Data & Intelligence Platform**.

The frontend must support real tourist participation and real admin workflows. It is not only a visual layer.

The frontend directly affects whether tourists complete the QR-to-certificate flow and whether administrators trust the dashboard.

---

## 2. Frontend Mission

The frontend mission is:

```text
Create a fast, mobile-first, privacy-aware, rewarding, and professional user experience that helps collect useful tourism planning data.
```

The frontend must serve:

```text
tourists
returning tourists
foreign/non-LINE tourists
admin users
viewer users
super admins
research/planning users
```

---

## 3. Required Opening Instruction for Codex

Start frontend tasks with:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.
Build a mobile-first, privacy-aware, production-oriented frontend.
Do not require LINE/email/phone before certificate.
Do not weaken security, privacy, validation, permissions, or dashboard metric correctness.
```

---

## 4. Documents to Read Before Frontend Work

Codex should read:

```text
CODEX_MAIN_PROMPT.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
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
docs/testing/E2E_TEST_PLAN.md
checklists/FRONTEND_CHECKLIST.md
checklists/UI_UX_CHECKLIST.md
checklists/SECURITY_PDPA_CHECKLIST.md
```

For dashboard frontend:

```text
docs/dashboard/DASHBOARD_REQUIREMENTS.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
checklists/DASHBOARD_CHECKLIST.md
```

---

## 5. Recommended Frontend Stack

Use:

```text
Next.js App Router
TypeScript
Tailwind CSS
React components
Server Actions / Route Handlers
Zod validation
```

Optional:

```text
shadcn/ui
React Hook Form
Recharts
TanStack Table
html-to-image
PWA manifest
```

Do not introduce large libraries without a clear reason.

---

## 6. Frontend Architecture Rules

Follow:

```text
page/route
  -> feature component
  -> shared UI component
  -> server action/API call
  -> backend service
```

Rules:

```text
business rules must not live only in client components
permissions must not rely only on hidden buttons
validation must exist server-side
tourist ownership must be checked server-side
dashboard metrics must be server-side
frontend must not import server-only secrets
```

---

## 7. Folder Structure Guideline

Recommended:

```text
src/
  app/
    (public)/
      page.tsx
      attractions/
    (tourist)/
      checkin/
      visit/
      passport/
      survey/
    admin/
      dashboard/
      attractions/
      photo-spots/
      checkin-codes/
      visits/
      reports/
      users/
  components/
    ui/
    public/
    tourist/
    admin/
    dashboard/
    certificate/
    forms/
  lib/
    constants/
    utils/
    types/
    validation/
```

Keep public/tourist/admin UI separated.

---

# Global Frontend Rules

---

## 8. UI/UX Rules

Tourist frontend must be:

```text
mobile-first
fast
short
clear
reward-focused
privacy-aware
trustworthy
multilingual-ready
```

Admin frontend must be:

```text
professional
structured
permission-aware
dashboard-ready
efficient
clear
```

---

## 9. Critical UX Rules

Do not:

```text
put long academic text first on QR landing
ask long survey before certificate
force LINE login
force email
force phone number
ask national ID
ask full address
hide certificate behind survey
hide download button
show raw technical errors
```

Do:

```text
show certificate benefit quickly
keep minimal form short
explain photo purpose
show consent clearly
make survey optional
support guest/non-LINE path
show loading/retry states
```

---

## 10. Mobile Rules

Checklist for every tourist page:

```text
CTA visible on mobile
no horizontal scroll
touch targets are large enough
forms are easy to tap
photo upload works on phone
certificate preview fits
download button visible
survey fields not cramped
```

Recommended touch target:

```text
44px height
```

---

## 11. Accessibility Rules

Frontend must include:

```text
input labels
visible focus states
clear error messages
button accessible names
sufficient text contrast
keyboard navigation where possible
non-color-only meaning
alt text for meaningful images
chart titles and text/table alternatives where needed
```

---

## 12. Loading / Empty / Error States

Every important flow must include:

```text
loading state
empty state where relevant
error state
success state
retry option where useful
```

Important areas:

```text
QR landing
profile form
photo upload
certificate generation
survey submit
passport
admin lists
dashboard sections
export actions
```

User-facing errors must not show:

```text
stack trace
SQL query
raw Supabase error
service key
private storage path
```

---

# Tourist Frontend

---

## 13. QR Landing Page Rules

Route example:

```text
/checkin/[code]
```

Requirements:

```text
show attraction name
show province/location context
show photo spot context if available
explain certificate/travel memory benefit
show clear primary CTA
support Thai
support English if multilingual
work without login
work without LINE
handle invalid/inactive/expired code safely
load quickly on mobile
```

Do not:

```text
create a visit from QR scan alone
count QR scan as visit
expose admin notes
show private storage paths
```

---

## 14. QR Landing UX Copy Guidance

Good headings:

```text
Create your digital certificate
Get your travel memory from this place
สร้างใบประกาศดิจิทัลของคุณ
รับบัตรที่ระลึกจากสถานที่นี้
```

Good helper copy:

```text
Upload your photo and receive a digital certificate from this attraction.
```

Thai:

```text
อัปโหลดรูปของคุณ แล้วรับใบประกาศดิจิทัลจากสถานที่ท่องเที่ยวนี้
```

Avoid:

```text
Register to submit data for database research
```

---

## 15. Minimal Tourist Profile Form

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

UX requirements:

```text
form completed in 60-90 seconds
consent checkbox not pre-checked
field errors near fields
loading state on submit
duplicate submit prevented
```

---

## 16. Consent UI

Requirements:

```text
short consent text
privacy notice link
photo purpose explanation
aggregated planning explanation
Thai version
English version if multilingual
not pre-checked
required before profile save
```

Consent text should communicate:

```text
data used to generate certificate
data used in aggregated tourism planning
photo not public unless user chooses to share
```

---

## 17. Photo Upload UI

Requirements:

```text
accept JPEG/PNG/WebP
show accepted formats
show max size
reject invalid file before upload for UX
backend still validates
show preview
show loading/progress
show retry
allow re-upload if permitted
work on mobile camera/gallery
handle HEIC unsupported case gracefully if not supported
```

Do not:

```text
show raw storage path
store large base64 permanently
proceed to certificate before successful upload
```

---

## 18. Certificate Preview UI

Requirements:

```text
show display name
show attraction name
show visit date
show uploaded photo
look professional
handle long display name
work on mobile
show generate button
show loading state
prevent duplicate click
allow back/re-upload if safe
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

## 19. Certificate Success UI

Requirements:

```text
show success message
show certificate preview/result
show download button clearly
show stamp earned/already-earned
show optional survey CTA
show passport/save CTA if implemented
allow finish without survey
allow finish without LINE
```

Bad UX:

```text
survey required before download
```

---

## 20. Passport / Stamp UI

Requirements:

```text
show earned stamps
show empty passport state
show attraction/province context
show earned date if useful
explain guest limitation
optional save/link to LINE/email if implemented
do not expose provider_user_id
work on mobile
```

---

## 21. Optional Survey UI

Survey appears after certificate.

Requirements:

```text
clearly optional
1-2 minutes max
logical sections
spending uses ranges
satisfaction scale clear
comment optional
skip/finish path
loading state
thank-you state
```

Fields may include:

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
revisit intention
recommendation intention
optional comment
```

---

## 22. Foreign / Non-LINE Tourist UI

Requirements:

```text
English flow works
guest path works
LINE not required
origin country selection works
certificate can be generated
survey can be completed
passport limitation explained
```

---

## 23. Returning Tourist UI

Requirements:

```text
existing profile reused
less repeated input
new attraction creates new certificate/stamp opportunity
same attraction repeat shows already-earned stamp gracefully
no confusing duplicate errors
```

---

# Public Attraction Frontend

---

## 24. Public Attraction List

Requirements:

```text
show only published active attractions
show image/name/province/short description
province filter or planned
search or planned
loading state
empty state
error state
mobile card layout
optimized images
```

---

## 25. Public Attraction Detail

Requirements:

```text
show attraction name
show province/district
show description/history
show images
show 360 media if configured
show visitor-friendly info
show CTA/check-in context if appropriate
support Thai/English
handle missing translations gracefully
mobile responsive
```

Must not show:

```text
admin notes
draft content
private paths
internal-only fields
```

---

# Admin Frontend

---

## 26. Admin Layout

Requirements:

```text
protected layout
sidebar/topbar
current page highlight
logout
account menu
permission-based nav
responsive desktop/tablet
clear empty/error states
```

Backend still enforces permissions.

---

## 27. Admin Attraction CMS

Requirements:

```text
list page
search/filter
create form
edit form
publish/unpublish
deactivate
image/media upload
province/district selectors
slug handling
Thai/English fields
validation errors
loading/success/error states
confirm destructive actions
preview public page or link if possible
```

---

## 28. Admin Photo Spot UI

Requirements:

```text
photo spot list
create/edit form
linked attraction
active/inactive status
QR placement/instruction fields if relevant
deactivate action
validation messages
loading states
```

---

## 29. Admin Check-in Code UI

Requirements:

```text
check-in code list
create form
attraction selector
photo spot selector
code generation or validation
active/inactive status
start/end date if supported
copy QR link
download QR image if implemented
test/open QR link
deactivate confirmation
```

Admin should not need developer help to create a QR code.

---

## 30. Admin Visit / Survey UI

Requirements:

```text
visit list paginated
filters
survey summary/list if implemented
sensitive fields hidden by default
raw comments permission-controlled
no private identifiers by default
```

---

## 31. Admin Export UI

Requirements:

```text
export button/menu
permission-controlled visibility
clear export type choices
privacy warning
filter-aware export
loading state
success/download state
error state
no-data state
too-large export message
```

---

# Dashboard Frontend

---

## 32. Dashboard Global Rules

Dashboard UI must:

```text
show filters
show data freshness
show metric definitions
show limitations
show loading/empty/error states
avoid misleading labels
protect privacy
```

Important labels:

```text
Tourist Profiles, not Verified Unique Tourists
Estimated Spending, not Revenue
QR Scans and Visits separate
No data for missing/null
```

---

## 33. Dashboard Components

Recommended components:

```text
DashboardPageHeader
DashboardFilterBar
DataFreshnessNote
KpiGrid
KpiCard
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

## 34. Dashboard UX Rules

Checklist:

```text
null metrics show No data
zero denominator shows No data
average satisfaction shows response count
estimated spending includes Estimated label
QR scans and visits visually separated
tooltips define metrics
charts have titles
tables are readable
mobile/tablet layout acceptable
```

---

## 35. Dashboard Privacy Rules

Dashboard must not show:

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

# Frontend Security Rules

---

## 36. Secret Safety

Client code must never include:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
LINE_CHANNEL_SECRET
CRON_SECRET
private API tokens
```

Allowed public env vars:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID optional
```

---

## 37. Client Trust Boundary

Frontend may improve UX but must not be trusted for security.

Do not trust:

```text
role from localStorage
tourist_id from localStorage
visit_id from hidden input without server ownership
file extension
client-only consent validation
client-only export permission
```

Backend must verify.

---

## 38. Browser Storage Rules

Browser storage may store:

```text
guest session token/id if designed
language preference
non-sensitive UI state
```

Browser storage must not store:

```text
service secrets
admin role as trusted source
raw provider_user_id if avoidable
large persistent base64 photos
private signed URLs long-term
```

---

# Performance Frontend Rules

---

## 39. Bundle Performance

Rules:

```text
tourist QR page must not load admin/dashboard bundle
dashboard chart libraries should not load on public pages
360 media lazy-loaded
large admin tables paginated
certificate rendering optimized
images optimized
fonts optimized
```

---

## 40. Image Performance

Rules:

```text
use optimized public attraction images
use lazy loading below the fold
set width/height where possible
compress stamp assets
optimize certificate template assets
avoid very large hero images
```

---

# Frontend Testing Rules

---

## 41. Unit/Component Tests

Recommended:

```text
MinimalProfileForm validation display
consent checkbox default unchecked
PhotoUpload invalid file message
CertificatePreview long name handling
KpiCard null = No data
DashboardFilterBar emits values
ExportButton loading/error state
```

---

## 42. E2E Tests

Required for MVP:

```text
public attraction page loads
active QR flow works
invalid QR safe error
tourist QR-to-certificate flow
photo upload
certificate download
optional survey
returning tourist
admin login
admin attraction CRUD
admin check-in code creation
dashboard filters
export flow
viewer permission denied
```

---

## 43. Manual UX Tests

Required:

```text
real phone QR scan
mobile photo upload
mobile certificate download
Thai flow
English/non-LINE flow
LINE browser if LIFF used
admin QR creation without developer help
dashboard interpretation by non-developer
```

---

# Frontend Task Prompt Template

---

## 44. Standard Frontend Task Prompt

Use this:

```text
You are Codex working on the Southern Border Tourism Data & Intelligence Platform.

Task:
[Describe frontend task.]

Context:
[Explain why this UI matters.]

Read first:
- CODEX_MAIN_PROMPT.md
- prompts/CODEX_FRONTEND_PROMPT.md
- docs/frontend/FRONTEND_REQUIREMENTS.md
- docs/frontend/UI_UX_PRINCIPLES.md
- docs/frontend/DESIGN_SYSTEM.md
- docs/frontend/FORM_UX_RULES.md
- docs/security/PDPA_PRIVACY_DESIGN.md
- checklists/FRONTEND_CHECKLIST.md
- checklists/UI_UX_CHECKLIST.md
- [add task-specific docs]

Requirements:
- [List UI behavior.]
- Add loading/empty/error states.
- Make it responsive.
- Follow design system.
- Keep accessibility basics.
- Connect to server action/API if needed.
- Do not move business/security logic only into UI.

Security/Privacy:
- Do not expose secrets.
- Do not show private identifiers.
- Do not trust localStorage for permissions/ownership.
- Keep LINE/email optional unless task explicitly says otherwise.

Testing:
- Add component/E2E tests if practical.
- Run relevant validation commands if available.

Do not:
- Do not require LINE/email/phone before certificate.
- Do not hide certificate behind survey.
- Do not show raw technical errors.
- Do not break mobile layout.
- Do not load admin/dashboard bundle into tourist pages.

Completion response:
Summary
Files changed
Validation
UX notes
Risks / Notes
Next suggested task
```

---

# Specialized Frontend Prompts

---

## 45. QR Landing Frontend Prompt

```text
Task:
Build or improve the QR/check-in landing page.

Requirements:
- Mobile-first.
- Shows attraction/photo spot context.
- Explains certificate benefit quickly.
- Clear primary CTA.
- Handles active/invalid/inactive/expired states.
- Works without login/LINE.
- Thai text required.
- English path if multilingual.
- Loading/error states.
- No admin/private data.

Do not:
- Do not create visit from QR scan alone.
- Do not count QR scan as visit.
- Do not require LINE.
```

---

## 46. Minimal Profile Form Frontend Prompt

```text
Task:
Build or improve the minimal tourist profile form.

Requirements:
- Fields: display name, origin, age group, consent.
- Consent not pre-checked.
- Short helper text.
- Field-level errors.
- Loading state.
- Duplicate submit prevented.
- Mobile-friendly.

Do not:
- Do not require email.
- Do not require LINE.
- Do not require phone.
- Do not ask national ID/full address/exact birthdate.
```

---

## 47. Photo Upload Frontend Prompt

```text
Task:
Build or improve the tourist photo upload UI.

Requirements:
- Accept JPEG/PNG/WebP.
- Show format/size hint.
- Preview after upload.
- Loading/progress state.
- Retry/re-upload.
- Friendly invalid file errors.
- Mobile camera/gallery support.

Do not:
- Do not show raw storage path.
- Do not proceed to certificate before successful upload.
- Do not store large base64 persistently.
```

---

## 48. Certificate Frontend Prompt

```text
Task:
Build or improve certificate preview/success UI.

Requirements:
- Professional template.
- Display name/photo/attraction/visit date.
- Long name handling.
- Generate loading state.
- Download button visible.
- Stamp earned/already-earned state.
- Optional survey CTA after success.
- Mobile-friendly.

Do not:
- Do not include email/LINE/internal ID.
- Do not block download behind survey.
- Do not require LINE.
```

---

## 49. Dashboard Frontend Prompt

```text
Task:
Build or improve dashboard frontend for [section].

Requirements:
- Protected admin route.
- Filters.
- KPI/chart/table layout.
- Loading/empty/error states.
- Metric tooltips.
- Data limitations.
- Export UI if relevant.
- Privacy-safe display.
- Mobile/tablet acceptable.

Critical labels:
- Tourist Profiles, not verified unique people.
- Estimated Spending, not revenue.
- QR Scans and Visits separate.
- No data for null/zero denominator.

Do not:
- Do not fetch all raw rows to frontend.
- Do not show private identifiers.
- Do not mislabel metrics.
```

---

## 50. Admin CMS Frontend Prompt

```text
Task:
Build or improve admin CMS UI for [area].

Requirements:
- Protected route.
- Permission-aware UI.
- List/create/edit forms.
- Validation errors.
- Loading/success/error states.
- Destructive confirmation.
- Responsive admin layout.
- Clear active/inactive/published status.

Do not:
- Do not rely only on hidden buttons for security.
- Do not expose admin-only data publicly.
- Do not hard delete historical data without backend rule.
```

---

# Frontend Review Checklist

---

## 51. Before Accepting Frontend Work

Check:

```text
[ ] Mobile tourist flow works.
[ ] Required fields are minimal.
[ ] Consent UX is correct.
[ ] LINE/email/phone are not required.
[ ] Photo upload has preview/loading/error.
[ ] Certificate download is visible.
[ ] Survey is optional after certificate.
[ ] Guest/non-LINE flow works.
[ ] Admin UI has permissions/confirmation.
[ ] Dashboard labels are accurate.
[ ] Private identifiers are not shown.
[ ] Loading/empty/error states exist.
[ ] Accessibility basics are present.
[ ] No secrets in client code.
```

---

## 52. Critical Frontend Blockers

Block if:

```text
LINE required for all tourists
email/phone/national ID required before certificate
survey required before certificate/download
consent missing or pre-checked
photo upload unusable on mobile
certificate download hidden/broken
dashboard calls estimated spending revenue
dashboard counts QR scans as visits
client code contains service role key
private identifiers shown in dashboard/export UI
```

---

## 53. Frontend Completion Response Format

Codex should respond:

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

## 54. Final Frontend Rule

The frontend should make tourists feel that giving data is worth it.

Reward first, ask respectfully, keep it short, protect privacy, and make the dashboard honest.
