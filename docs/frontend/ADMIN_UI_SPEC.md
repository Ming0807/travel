# ADMIN_UI_SPEC.md

## 1. Document Purpose

This document defines the Admin UI specification for the **Southern Border Tourism Data & Intelligence Platform**.

The admin interface must allow authorized users to manage attraction content, photo spots, QR/check-in codes, visits, survey data, dashboard access, reports, and future official data imports.

This document should guide frontend developers, backend developers, designers, and AI coding agents when building admin pages and components.

---

## 2. Admin UI Mission

The admin UI mission is:

```text
Make tourism data management accurate, safe, fast, and professional.
```

The admin interface must feel like a real production backoffice system, not a simple classroom CRUD demo.

It must protect:

- data quality
- public content quality
- QR flow reliability
- dashboard accuracy
- historical records
- privacy and permissions

---

## 3. Admin User Types

## 3.1 Super Admin

Can manage:

```text
users
roles
permissions
all attractions
all settings
all exports
audit logs
official data imports
```

## 3.2 Admin

Can manage:

```text
attractions
photo spots
check-in codes
dashboard
reports
survey data
```

## 3.3 Staff

Can manage or view assigned operational data.

Possible scope:

```text
assigned attractions
assigned photo spots
related visits
related feedback
```

## 3.4 Viewer

Can view dashboard and reports only.

## 3.5 Researcher

Can view analytics and export approved datasets.

---

## 4. Admin Route Overview

MVP routes:

```text
/admin
/admin/content
/admin/dashboard
/admin/attractions
/admin/attractions/new
/admin/attractions/[attractionId]/edit
/admin/photo-spots
/admin/checkin-codes
/admin/visits
/admin/reports
/admin/settings
```

Phase 2 routes:

```text
/admin/tourists
/admin/surveys
/admin/certificates
/admin/stamps
/admin/media
/admin/official-data
/admin/audit-logs
/admin/users
/admin/roles
```

---

## 5. Admin Layout Specification

## 5.1 Layout Structure

Admin pages should use:

```text
sidebar navigation
top bar
main content area
page header
filter/action bar
content card/table/form
```

## 5.2 Sidebar

Sidebar items for MVP:

```text
Content Hub
Dashboard
Attractions
Photo Spots
Check-in Codes
Visits
Reports
Settings
```

Phase 2:

```text
Tourists
Surveys
Certificates
Stamps
Official Data
Audit Logs
Users
```

## 5.3 Top Bar

Top bar should show:

```text
current page context
search optional
current admin user
role indicator
logout/action menu
```

## 5.4 Main Content Area

Rules:

- use consistent page padding
- keep max width readable for forms
- allow full width for dashboards and tables
- use cards for grouped content
- show breadcrumbs where helpful

---

## 6. Admin Page Header Pattern

Every admin page should have:

```text
title
short description
primary action button if applicable
secondary action if applicable
```

Example:

```text
Attractions
Manage public tourism attractions, content, photo spots, and QR check-in availability.
[Create Attraction]
```

---

## 7. Admin Table Pattern

Admin tables must support:

```text
search
filters
pagination
loading state
empty state
error state
row actions
status badges
```

Optional:

```text
sorting
column visibility
bulk actions
export selected
```

Do not load all records at once.

---

## 8. Admin Form Pattern

Admin forms should use sectioned layout.

Recommended form structure:

```text
Basic Information
Location
Content
Media
Publishing
System Metadata
Action Bar
```

Action bar:

```text
Save
Cancel
Preview
Deactivate optional
```

Rules:

- mark required fields
- validate client and server side
- show a top form error summary with admin-friendly field labels
- use readiness panels for connected workflows such as QR codes, route stops, media, and publishing
- use a consistent sticky save bar for create/edit forms
- show field errors
- disable save while saving
- show success/error feedback
- preserve form data after errors
- warn for destructive actions

Shared admin components are consolidated in:

```text
components/admin/
```

**Core layout & navigation:**
- `AdminShell` — main admin layout with sidebar + topbar
- `AdminPageHeader` — uniform page header (eyebrow, title, description, actions)

**List & table components:**
- `DataTable` — responsive table with consistent styling (rounded-2xl, shadow-card)
- `Pagination` — URL-param-driven page navigation with Thai labels
- `SearchInput` — debounced search (400ms) with URL param sync and clear button
- `FilterBar` / `FilterSelect` — URL-param-driven filter controls
- `StatusBadge` — colored status indicator (green/gold/gray/red/teal)

**Content/action components:**
- `AdminFormSection` — sectioned form card with optional icon header
- `AdminFormErrorSummary` — top-of-form error list with admin-friendly field labels
- `AdminHelpPanel` — contextual help box (info/warning/success tones)
- `AdminReadinessPanel` — grouped publish-readiness items with progress counter
- `AdminReadinessBadge` — single readiness status line (checkmark or warning)
- `AdminSaveBar` — sticky bottom save bar with cancel/submit/pending states
- `AdminPreviewLink` — public preview link (icon-only or labeled variant)
- `AdminCopyButton` — clipboard copy with 2-second "copied" feedback
- `AdminUsedInList` — "used in" impact list showing entity type + label + link
- `ExportButton` — download link that passes current URL filter params
- `SuccessNextSteps` — success state with contextual action cards

**State components:**
- `EmptyState` — icon + title + description + optional action
- `LoadingState` — spinner or skeleton variant
- `ErrorState` — error display with retry action and collapsible technical detail
- `ConfirmDialog` — portal-based modal (danger/warning/info tones) with keyboard escape

**Shared form primitives:**

```text
components/admin/forms/AdminFormUX.tsx
```

This module provides `AdminFormSection`, `AdminFormErrorSummary`, `AdminHelpPanel`, `AdminReadinessPanel`, `AdminSaveBar`, and the `readableFieldErrors` utility.

All components use consistent design tokens:

```text
Border radius:     rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)
Primary color:     #073F37 / #0A6B62
Error color:       rose-600 / rose-50
Warning color:     amber-600 / amber-50
Focus ring:        ring-2 ring-[#0A6B62]/50
Typography:        font-black for headings, font-bold for labels
Icon-only buttons: title + aria-label attributes
Accessibility:     role="status", role="alert", role="dialog", aria-modal
```

---

## 9. Status Badge System

Admin UI should use consistent badges.

Common badges:

```text
Published
Draft
Active
Inactive
Pending
Approved
Rejected
Generated
Completed
Abandoned
Survey Completed
No Survey
QR Active
QR Inactive
```

Rules:

- badge text must be clear
- color supports meaning but is not the only signal
- do not create random badge styles per page

---

## 10. Confirmation Dialog Pattern

Use confirmation dialogs for:

```text
deactivate attraction
unpublish attraction
deactivate photo spot
deactivate check-in code
delete if allowed
export sensitive data
revoke stamp
change role
```

Dialog should include:

```text
clear title
impact explanation
confirm button
cancel button
danger styling if destructive
```

Example:

```text
Deactivate this check-in code?
Tourists will no longer be able to use this QR code. Historical visit records will remain.
```

---

## 11. Admin Dashboard Home

Route:

```text
/admin
```

Purpose:

Provide quick operational overview.

MVP sections:

```text
KPI cards
recent visits
recent certificates
QR activity summary
quick actions
```

Quick actions:

```text
Create Attraction
Create Check-in Code
View Dashboard
Export Report
```

---

## 12. Content And Dashboard Pages

## 12.1 Content Hub Page

Route:

```text
/admin/content
```

Purpose:

Provide a workflow-first CMS command center for public content operations.

The page should answer common admin questions:

```text
Where do I change the homepage popular destination image?
Where do I edit attraction text and gallery images?
Where do stories connect to attractions?
Where do routes get their stops?
Which content affects the QR landing page?
```

Recommended sections:

```text
content source-of-truth map
workflow cards
public surface map
publish readiness checklist
quick links to attractions, media, stories, routes, photo spots, and QR codes
```

The Content Hub should not store duplicate content. It should route admins to the correct source record.

Content Hub should also expose public-surface workflows:

```text
Homepage sections
Attraction page sections
Story pages
Route pages
QR landing content
Settings surfaces
```

For content-heavy pages, the editor should mirror the public page sections. Example for an attraction detail page:

```text
Header
Gallery
Overview
Things to Do
Where to Stay
Food & Drink
Tips
How to Get There
Reviews
Related Articles
QR / Certificate CTA
Publishing
```

This section-based model helps admins understand what part of `/attractions/[slug]` they are editing.

CMS source-of-truth requirement:

```text
Admin previews and public pages must use inserted database content or honest empty states.
```

Do not use runtime mock attraction/story/route data as fallback in the CMS review path. Design mockups may be archived for reference, but public routes and admin visual editors must not silently show fake content when the database is missing records.

---

## 12.2 Admin Dashboard Analytics Page

Route:

```text
/admin/dashboard
```

This page follows:

```text
docs/frontend/DASHBOARD_UI_SPEC.md
```

Admin UI must provide:

```text
global filters
KPI cards
charts
insight tables
export actions
data freshness note
```

---

## 13. Attractions Admin Page

Route:

```text
/admin/attractions
```

## 13.1 Purpose

Manage attraction records used by public pages, QR check-ins, certificates, stamps, and dashboard analytics.

## 13.2 Table Columns

Recommended columns:

```text
cover image thumbnail
attraction name
province
district
type
published status
active status
photo spot count
check-in code count
updated_at
actions
```

## 13.3 Filters

```text
search by name
province
district
attraction type
published status
active status
```

## 13.4 Row Actions

```text
View
Edit
Preview public page
Manage photo spots
Manage check-in codes
Copy public URL
Publish/Unpublish
Deactivate
```

## 13.5 Empty State

```text
No attractions yet.
Create the first attraction to start building the tourism database.
```

Action:

```text
Create Attraction
```

---

## 14. Attraction Create/Edit Form

Routes:

```text
/admin/attractions/new
/admin/attractions/[attractionId]/edit
```

## 14.1 Required Sections

```text
Basic Information
Location
Descriptions and History
Media
360 Media optional
Publishing
```

Preferred UX direction:

```text
Use a page-section editor that follows the public attraction detail layout.
```

The editor may still save to the same attraction/media/photo spot/check-in records, but the admin-facing navigation should be:

```text
Header
Gallery
Overview
Location / How to Get There
Nearby Food / Stays
Reviews
Related Stories
QR / Certificate CTA
Publishing
```

Show a preview/readiness panel for the selected section.

## 14.2 Basic Information Fields

```text
name_th
name_en
slug
province_id
district_id
attraction_type_id
```

## 14.3 Location Fields

```text
address_text
latitude
longitude
opening_hours
map_url optional
```

## 14.4 Content Fields

```text
short_description_th
short_description_en
description_th
description_en
history_th
history_en
```

## 14.5 Publishing Fields

```text
is_published
is_active
```

## 14.6 Publishing Warning

If publishing with missing key data, show warning:

```text
This attraction is missing a cover image or active check-in code. It can be published, but the tourist flow may be incomplete.
```

## 14.7 Save Behavior

On save:

- validate fields
- save to database
- create audit log if implemented
- show success toast
- redirect or remain based on action

Actions:

```text
Save
Save and Preview
Cancel
```

---

## 15. Attraction Image Management

Route:

```text
/admin/attractions/[attractionId]/images
```

MVP can be inside edit page.

## 15.1 Required UI

```text
image upload
gallery grid
set as cover
edit alt text
edit caption
reorder
deactivate image
```

## 15.2 Image Card

Each card shows:

```text
thumbnail
cover badge if cover
caption
alt text status
active/inactive status
actions
```

## 15.3 Validation

Allowed:

```text
image/jpeg
image/png
image/webp
```

Do not store base64 in database.

---

## 16. Photo Spots Admin Page

Route:

```text
/admin/photo-spots
```

or nested:

```text
/admin/attractions/[attractionId]/photo-spots
```

## 16.1 Purpose

Manage prepared photo spots used for QR/certificate flow.

## 16.2 Table Columns

```text
photo spot name
attraction name
province
active status
display order
check-in code count
updated_at
actions
```

## 16.3 Filters

```text
search
province
attraction
active status
```

## 16.4 Actions

```text
Create Photo Spot
Edit
Create Check-in Code
Deactivate
```

---

## 17. Photo Spot Form

Fields:

```text
attraction_id
spot_name_th
spot_name_en
description_th
description_en
sample_image_path
latitude
longitude
display_order
is_active
```

Rules:

- photo spot must belong to attraction
- inactive spot should not appear in public check-in
- do not hard delete if visits exist
- explain that photo spots connect QR/certificate context to one attraction

---

## 18. Check-in Codes Admin Page

Route:

```text
/admin/checkin-codes
```

## 18.1 Purpose

Manage QR/check-in codes.

## 18.2 Table Columns

```text
code
attraction
photo spot
public URL
active status
starts_at
ends_at
scan count optional
actions
```

## 18.3 Filters

```text
search by code
province
attraction
active status
```

## 18.4 Actions

```text
Create Check-in Code
Edit
Copy URL
Preview QR
Download QR future
Deactivate
```

## 18.5 QR Preview

Show:

```text
QR image
public URL
copy button
attraction context
photo spot context
status
```

MVP can generate QR client-side from URL.

---

## 19. Check-in Code Form

Fields:

```text
code
attraction_id
photo_spot_id optional
label
is_active
starts_at optional
ends_at optional
```

Validation:

- code unique
- code URL-safe
- attraction required
- photo spot must belong to attraction
- starts_at before ends_at

UX:

- preview `/c/[code]` directly in the form
- copy the public QR landing URL
- show readiness for URL-safe code, selected attraction, and active status

---

## 20. Visits Admin Page

Route:

```text
/admin/visits
```

## 20.1 Purpose

View visit records and operational flow status.

## 20.2 Table Columns

```text
visit_id
visit_date
tourist display name
origin
attraction
province
photo spot
completion status
certificate status
survey status
created_at
actions
```

## 20.3 Filters

```text
date range
province
attraction
completion status
origin country
origin province
age group
```

Optional:

```text
transport mode
travel purpose
spending range
satisfaction score
```

## 20.4 Row Actions

```text
View details
View certificate if permission
View survey
```

Do not expose email/LINE/device token in normal list.

---

## 21. Visit Detail Page

Route:

```text
/admin/visits/[visitId]
```

MVP optional.

Recommended sections:

```text
Visit Summary
Tourist Profile Summary
Attraction Context
Certificate Status
Stamp Status
Survey/Expense/Satisfaction
Funnel Events
Audit Notes
```

Privacy:

- hide direct identity values unless permission allows
- show only necessary planning data

---

## 22. Tourists Admin Page

Route:

```text
/admin/tourists
```

MVP optional.

## 22.1 Purpose

View tourist profile summaries.

## 22.2 Table Columns

```text
tourist reference
display name
origin country/province
age group
preferred language
visit count
stamp count
created_at
latest_visit_date
```

Do not show by default:

```text
email
LINE user ID
device token
```

---

## 23. Survey Admin Page

Route:

```text
/admin/surveys
```

MVP optional if dashboard covers it.

## 23.1 Table Columns

```text
survey_id
visit_date
attraction
province
overall_score
revisit_intention
recommendation_intention
completed_at
actions
```

## 23.2 Filters

```text
date range
province
attraction
score range
low score only
```

Comments should be viewed carefully.

---

## 24. Reports Admin Page

Route:

```text
/admin/reports
```

## 24.1 Purpose

Export data and view report options.

## 24.2 Sections

```text
Dashboard Summary Export
Visit Records Export
Satisfaction Export
Expense Export
Funnel Export
Official Data Export future
```

## 24.3 Export UI

Fields:

```text
export type
date range
province
attraction
format
privacy level if supported
```

Action:

```text
Generate CSV
```

Export must check permission and log action.

---

## 25. Settings Page

Route:

```text
/admin/settings
```

MVP optional.

Possible sections:

```text
Homepage
Public Pages
Contact & Footer
SEO
System Features
Maintenance
```

Do not put complex master data management here if it deserves its own page.

Settings UX rules:

- Use section navigation instead of a very long mixed form.
- Use a media picker for configurable images.
- Save only changed setting groups or keys.
- Make unsaved changes visible.
- Require `system.settings_read` to view and `system.settings_update` to save.
- Server-side APIs must reject unknown setting keys.
- Sensitive setting changes should be audit logged.

Settings should not become the primary CMS for attraction/story/route content.

Keep in Settings:

```text
homepage hero text/images
public page headers
contact/footer
SEO defaults
system toggles
```

Move or expose through a dedicated CMS surface:

```text
homepage popular destination selection
attraction content
story content
route content
media attached to records
```

Homepage popular destinations should use a searchable attraction picker with province/status/readiness filters, not a raw slug textarea.

---

## 26. Official Data Admin Page

Future route:

```text
/admin/official-data
```

Purpose:

```text
import official statistics
link official attraction references
view import logs
compare official and local data
```

Not required for MVP implementation, but planned.

---

## 27. Audit Logs Page

Future route:

```text
/admin/audit-logs
```

Purpose:

```text
review important admin actions
exports
content changes
deactivations
imports
```

MVP can create logs without full UI.

---

## 28. Admin Search and Filter Standards

## 28.1 Search

Use debounced search for list pages.

Search should support:

```text
attraction name
slug
check-in code
photo spot name
```

## 28.2 Filters

Use URL query parameters.

Example:

```text
/admin/attractions?province=1&status=published&page=2
```

## 28.3 Clear Filters

Provide:

```text
Clear filters
```

when filters are active.

---

## 29. Admin Pagination Standards

Required for:

```text
attractions
photo spots
check-in codes
visits
tourists
surveys
exports
audit logs
```

Recommended default page size:

```text
10, 20, or 50
```

Do not load all records.

---

## 30. Admin Loading States

Use:

```text
table skeleton
form loading state
button spinner
chart skeleton
```

Messages:

```text
Loading records...
Saving changes...
Generating export...
```

---

## 31. Admin Empty States

Examples:

```text
No attractions yet.
No check-in codes yet.
No visits found for selected filters.
No survey responses yet.
No exports generated yet.
```

Each should explain next action.

---

## 32. Admin Error States

Examples:

```text
Could not load records. Please try again.
Could not save changes. Please review the form.
You do not have permission to perform this action.
This record cannot be deleted because it has historical data.
```

Do not show raw SQL errors.

---

## 33. Admin Accessibility Requirements

Admin UI must support:

- keyboard navigation
- visible focus states
- labeled inputs
- accessible tables
- accessible dialogs
- readable contrast
- button labels
- non-color-only status

---

## 34. Admin Security Requirements

Admin UI must:

- require authentication
- enforce permission server-side
- hide unavailable actions client-side
- never expose service role key
- never expose secrets
- protect exports
- log sensitive actions
- avoid public indexing

---

## 35. Admin Privacy Requirements

Admin UI should avoid unnecessary personal data.

Default lists should not show:

```text
email
LINE user ID
device token
private certificate URL
raw photo path
```

Detailed views may show more only with permission.

---

## 36. Admin Performance Requirements

Requirements:

- pagination
- indexed filters
- debounced search
- lazy load heavy sections
- avoid loading full image files in tables
- use thumbnails
- avoid client-side aggregation of huge data

---

## 37. Admin Component Requirements

Recommended components:

```text
AdminLayout
AdminSidebar
AdminTopbar
AdminPageHeader
AdminFilterBar
AdminDataTable
AdminActionMenu
StatusBadge
ConfirmDialog
FormSection
SaveActionBar
QrPreviewDialog
ExportDialog
AuditSummaryPanel
```

---

## 38. Admin Testing Checklist

Test:

```text
login required
unauthorized access
create attraction
edit attraction
duplicate slug
publish/unpublish
deactivate attraction
create photo spot
create check-in code
duplicate check-in code
copy QR URL
visit list filters
dashboard load
export permission
mobile/tablet layout
loading states
empty states
error states
```

---

## 39. MVP Acceptance Checklist

```text
[ ] Admin layout exists.
[ ] Admin routes are protected.
[ ] Sidebar navigation exists.
[ ] Dashboard link exists.
[ ] Attraction list exists.
[ ] Attraction create/edit form exists.
[ ] Attraction publish/unpublish works.
[ ] Attraction deactivate works.
[ ] Photo spot management exists.
[ ] Check-in code management exists.
[ ] QR public URL can be copied.
[ ] Visit list exists.
[ ] Reports/export page exists or export actions are available.
[ ] Tables use pagination.
[ ] Forms validate inputs.
[ ] Loading/empty/error states exist.
[ ] No private identity data is shown by default.
[ ] Destructive actions require confirmation.
```

---

## 40. Do Not Do

Do not:

```text
Expose admin routes publicly.
Skip server-side permission checks.
Hard delete attractions with visits.
Allow duplicate slugs.
Allow duplicate check-in codes.
Load all visits without pagination.
Show LINE user IDs in normal admin tables.
Show raw technical errors.
Mix tourist flow UI inside admin layout.
Use inconsistent button/table styles.
Use runtime mock data as public CMS fallback.
Duplicate attraction cover images into homepage settings.
Keep active design mockup HTML files beside production app routes.
```

---

## 41. Future Enhancements

Possible future features:

```text
advanced roles and permissions
user management
audit log viewer
media library
certificate template editor
stamp designer
official data import UI
bulk import/export
content approval workflow
admin notifications
advanced search
```

---

## 42. Final Admin UI Rule

The admin UI protects the quality of the entire platform.

Bad admin UX creates bad data, and bad data creates bad planning decisions.
