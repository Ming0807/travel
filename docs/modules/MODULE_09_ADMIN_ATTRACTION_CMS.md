# MODULE_09_ADMIN_ATTRACTION_CMS.md

## 1. Module Name

**Admin Attraction CMS Module**

---

## 2. Module Purpose

The Admin Attraction CMS Module allows authorized staff to manage tourism attraction content, photo spots, QR/check-in codes, attraction images, and related public-facing information.

This module is the operational backbone of the platform.

Without a clean admin CMS, the public attraction pages, QR flow, certificate flow, stamp system, and dashboard analytics cannot be maintained properly.

---

## 3. Business Purpose

The project must support real tourism data collection and planning.

Administrators and tourism staff need to manage:

- attraction records
- attraction descriptions and history
- attraction images
- 360-degree media
- photo spots
- QR/check-in codes
- stamp definitions
- publish status
- active/inactive status

This module ensures that data used by tourists and dashboards is controlled, accurate, and maintainable.

---

## 4. Core Design Decision

Admin CMS should manage master data and operational content.

It should not mix unrelated dashboard calculations, tourist form logic, or certificate rendering logic inside attraction CRUD screens.

Correct separation:

```text
Admin CMS = manage attraction and check-in source data
Tourist flow = collect tourist participation data
Dashboard = analyze collected data
```

---

## 5. Primary Users

## 5.1 Super Admin

Can manage all data, users, roles, and system settings.

## 5.2 Admin

Can manage attractions, photo spots, QR codes, templates, and dashboard.

## 5.3 Tourism Staff

Can manage assigned attraction content and view related visits.

## 5.4 Viewer or Researcher

Can view dashboard or read-only records depending on permission.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- Admin login protection
- Admin dashboard shell
- Attraction list
- Create attraction
- Edit attraction
- Deactivate attraction
- Publish/unpublish attraction
- Manage attraction images or cover image
- Manage photo spots
- Manage check-in codes
- Display QR/check-in URLs
- Basic visit record access
- Basic status labels
- Search/filter/pagination
- Basic audit log creation for important changes

## 6.2 In Scope for Phase 2

Phase 2 may include:

- Full role permission matrix
- Advanced media library
- 360-degree media management
- Certificate template editor
- Stamp definition editor
- QR PDF export
- Bulk import attractions
- Official attraction reference linking
- Content approval workflow
- Multi-language content workflow
- Admin activity timeline
- Advanced audit log UI

## 6.3 Out of Scope

This module does not directly handle:

- tourist photo upload flow
- certificate rendering engine
- dashboard metric calculation logic
- LINE LIFF login flow
- public survey UX

It manages source data used by those modules.

---

## 7. Related Modules

This module connects to:

```text
MODULE_01_PUBLIC_ATTRACTIONS.md
MODULE_02_QR_CHECKIN.md
MODULE_05_PHOTO_UPLOAD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_07_DIGITAL_STAMP_PASSPORT.md
MODULE_10_DASHBOARD_ANALYTICS.md
MODULE_11_REPORT_EXPORT.md
```

---

## 8. Required Data Tables

This module manages or reads:

```text
attractions
attraction_types
attraction_images
attraction_360_media
photo_spots
checkin_codes
certificate_templates
stamp_definitions
provinces
districts
users
roles
permissions
audit_logs
```

It may read:

```text
visits
certificates
tourist_stamps
satisfaction_surveys
visit_expenses
```

for admin operational views.

---

## 9. Admin Route Structure

Recommended routes:

```text
/admin
/admin/attractions
/admin/attractions/new
/admin/attractions/[attractionId]
/admin/attractions/[attractionId]/edit
/admin/attractions/[attractionId]/images
/admin/attractions/[attractionId]/photo-spots
/admin/photo-spots
/admin/checkin-codes
/admin/visits
/admin/tourists
/admin/surveys
/admin/settings
```

MVP minimum:

```text
/admin
/admin/attractions
/admin/photo-spots
/admin/checkin-codes
/admin/visits
```

---

## 10. Admin Dashboard Shell

Admin pages should use a consistent layout:

```text
sidebar navigation
top bar
page title
search/filter area
main content table/form
status badges
pagination
action buttons
```

Required navigation items for MVP:

```text
Dashboard
Attractions
Photo Spots
Check-in Codes
Visits
Reports/Export
Settings
```

---

## 11. Attraction Management

## 11.1 Attraction List

Admin attraction list should show:

```text
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

Actions:

```text
view
edit
manage photo spots
copy public link
publish/unpublish
deactivate
```

## 11.2 Attraction Filters

Required filters:

```text
search by name
province
district
attraction type
published status
active status
```

## 11.3 Pagination

Required.

Do not load all attractions at once.

## 11.4 Create/Edit Attraction Fields

Required MVP fields:

```text
province_id
district_id
attraction_type_id
slug
name_th
name_en
short_description_th
short_description_en
description_th
description_en
history_th
history_en
latitude
longitude
address_text
opening_hours
is_published
is_active
```

Optional:

```text
sustainability_category
estimated_capacity_per_day
contact_info
```

---

## 12. Attraction Validation Rules

## 12.1 Required Fields

Required:

```text
province_id
slug
name_th
is_active
is_published
```

Recommended:

```text
district_id
attraction_type_id
name_en
short_description_th
```

## 12.2 Slug Rules

```text
unique
lowercase
URL-safe
hyphen-separated
stable after publication
```

## 12.3 Coordinate Rules

```text
latitude between -90 and 90
longitude between -180 and 180
```

Coordinates are optional but must be valid if provided.

## 12.4 Publish Rules

Before publishing, attraction should have:

```text
name_th
province
description or short description
cover image or acceptable placeholder
at least one active photo spot/check-in code if certificate flow is expected
```

MVP may allow publish with incomplete content but should warn admin.

---

## 13. Attraction Image Management

## 13.1 MVP Requirements

Admin should be able to:

```text
upload cover image
upload gallery image
set cover image
edit caption
edit alt text
deactivate image
reorder images
```

If image management is too large for MVP, one cover image path is acceptable temporarily, but final schema should support `attraction_images`.

## 13.2 Image Fields

```text
storage_path
alt_text_th
alt_text_en
caption_th
caption_en
display_order
is_cover
is_active
```

## 13.3 Image Rules

- Use optimized images.
- Do not upload unsupported file types.
- Use alt text where possible.
- Do not store base64 in database.
- Do not delete images used historically without review.

---

## 14. 360 Media Management

## 14.1 MVP Status

Optional.

## 14.2 Phase 2 Fields

```text
media_type
media_url
title_th
title_en
description_th
description_en
display_order
is_active
```

## 14.3 Rules

- Validate URL or storage path.
- Do not embed unsafe scripts.
- Show preview if possible.
- Hide inactive media from public pages.

---

## 15. Photo Spot Management

Photo spots are physical or prepared points where tourists take photos and scan QR.

## 15.1 Photo Spot List

Admin list should show:

```text
photo spot name
attraction
province
active status
display order
check-in code count
actions
```

## 15.2 Create/Edit Photo Spot Fields

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

## 15.3 Validation

Required:

```text
attraction_id
spot_name_th
is_active
```

Rules:

- photo spot must belong to attraction.
- inactive photo spot should not appear in public QR flow.
- do not hard delete photo spots with historical visits.

---

## 16. Check-in Code Management

Check-in codes are used to generate QR links.

## 16.1 Check-in Code List

Admin list should show:

```text
code
attraction
photo spot
active status
start/end date
public URL
scan count optional
actions
```

## 16.2 Create/Edit Check-in Code Fields

```text
code
attraction_id
photo_spot_id optional
label
is_active
starts_at optional
ends_at optional
```

## 16.3 Validation

Rules:

- code required.
- code unique.
- code URL-safe.
- attraction_id required.
- photo_spot_id must belong to same attraction if provided.
- starts_at must be before ends_at if both exist.

## 16.4 Public URL

Pattern:

```text
/c/[code]
```

Example:

```text
/c/YLA001
```

Admin should be able to copy this URL.

## 16.5 QR Generation

MVP:

```text
Show URL and optionally show QR image using frontend QR component.
```

Phase 2:

```text
Download QR as PNG/PDF.
Print QR sheet.
```

---

## 17. Stamp Definition Management

MVP can seed one stamp per attraction.

Admin management may be Phase 2.

Fields:

```text
attraction_id
stamp_name_th
stamp_name_en
description_th
description_en
stamp_image_path
is_active
```

Rules:

- active attraction should have stamp definition if passport feature is enabled.
- old earned stamps should remain visible if stamp definition changes.

---

## 18. Certificate Template Management

MVP can use one default seeded template.

Phase 2 admin should manage:

```text
template name
background image
layout config
language
attraction-specific template
default status
active status
preview
```

Rules:

- do not delete template used by existing certificates.
- deactivate instead.
- old certificates should remain valid.

---

## 19. Visit Record Access

Admin CMS may include basic visit record list.

Fields shown:

```text
visit_id
visit_date
tourist display name
origin
attraction
photo spot
completion status
certificate status
survey status
created_at
```

Filters:

```text
date range
province
attraction
completion status
origin
```

Rules:

- paginate.
- do not expose private identity fields by default.
- export controlled by permission.

---

## 20. Admin Forms UX

Admin forms should be professional and efficient.

Requirements:

- clear labels
- required field markers
- validation messages
- save/cancel buttons
- status badges
- preview public page link
- dirty state warning if possible
- consistent layout
- responsive desktop/tablet support

Avoid:

- overly long ungrouped forms
- hidden critical fields
- destructive actions without confirmation
- hard deletes by default

---

## 21. Status Rules

Use status fields:

```text
is_active
is_published
approval_status
completion_status
```

## 21.1 is_active

Controls operational availability.

## 21.2 is_published

Controls public visibility.

## 21.3 Deactivate Instead of Delete

Attractions, photo spots, check-in codes, templates, and stamp definitions should usually be deactivated, not deleted.

---

## 22. Audit Logging

Important admin actions should create audit logs.

Actions:

```text
attraction.create
attraction.update
attraction.publish
attraction.unpublish
attraction.deactivate
photo_spot.create
photo_spot.update
photo_spot.deactivate
checkin_code.create
checkin_code.update
checkin_code.deactivate
image.upload
image.deactivate
data.export
```

Audit log should store:

```text
actor_user_id
action
entity_type
entity_id
old_values_json
new_values_json
created_at
```

Do not store secrets in audit logs.

---

## 23. Permissions

MVP can use simplified admin role.

Production should support:

```text
attraction.read
attraction.create
attraction.update
attraction.deactivate
photo_spot.read
photo_spot.create
photo_spot.update
checkin_code.read
checkin_code.create
checkin_code.update
visit.read
dashboard.read
export.create
user.manage
audit.read
```

---

## 24. Security Requirements

## 24.1 Authentication

Admin routes must require login.

## 24.2 Authorization

Admin actions should check permissions.

## 24.3 Server-Side Validation

Do not rely only on frontend validation.

## 24.4 Public Data Protection

Unpublished and inactive content should not appear publicly.

## 24.5 Storage Security

Admin uploads should validate type and size.

## 24.6 No Secrets

Do not expose:

```text
Supabase service role key
storage private credentials
LINE secret
internal admin IDs in public response
```

---

## 25. Performance Requirements

Admin lists must use:

```text
pagination
search
filters
indexes
```

Do not load all records.

Important indexes:

```text
attractions(province_id)
attractions(district_id)
attractions(attraction_type_id)
attractions(slug)
attractions(is_published, is_active)
photo_spots(attraction_id)
checkin_codes(code)
checkin_codes(attraction_id)
visits(attraction_id, visit_date)
```

---

## 26. Error Handling

## 26.1 Save Failed

Message:

```text
Could not save changes. Please check the form and try again.
```

## 26.2 Duplicate Slug

Message:

```text
This slug is already used by another attraction.
```

## 26.3 Duplicate Check-in Code

Message:

```text
This check-in code already exists.
```

## 26.4 Unauthorized

Message:

```text
You do not have permission to perform this action.
```

## 26.5 Delete Blocked

Message:

```text
This record has related historical data and cannot be deleted. You can deactivate it instead.
```

---

## 27. Dashboard Impact

Admin CMS directly affects dashboard quality.

Bad admin data leads to bad analytics.

Examples:

- wrong province -> wrong province dashboard
- duplicate attraction -> split visit counts
- wrong photo spot -> bad QR performance data
- inactive QR still displayed -> failed tourist flow
- missing attraction type -> weak category analysis

Admin forms must protect data quality.

---

## 28. Export Impact

Admin-managed data should be available for export:

```text
attractions
photo spots
check-in codes
visit records
survey records
dashboard summaries
```

Export actions should be permission-controlled and logged.

---

## 29. Edge Cases

## 29.1 Attraction Has Visits

Do not delete.

Allow deactivate/unpublish only.

## 29.2 Photo Spot Has Visits

Do not delete.

Deactivate only.

## 29.3 Check-in Code Printed Already

If code must stop working, deactivate and show friendly unavailable page.

## 29.4 Slug Changed After Publishing

May break public links.

Warn admin.

## 29.5 Province Changed After Visits

Historical dashboards may change if visit joins current attraction province.

Production may need visit snapshot.

MVP can accept current relation but document the risk.

## 29.6 Image Upload Fails

Do not save broken image record.

Show error.

---

## 30. Example User Stories

## 30.1 Admin Creates Attraction

As an admin, I want to create an attraction so tourists can view it and check in.

Acceptance:

```text
Given I am logged in
When I fill required attraction fields and save
Then the attraction is created and can be published
```

## 30.2 Admin Creates Photo Spot

As an admin, I want to create a photo spot under an attraction.

Acceptance:

```text
Given an attraction exists
When I create a photo spot
Then it is linked to the attraction
```

## 30.3 Admin Creates Check-in Code

As an admin, I want to create a QR/check-in code for a photo spot.

Acceptance:

```text
Given an attraction and photo spot exist
When I create a unique check-in code
Then the system provides a public URL
```

## 30.4 Admin Deactivates Attraction

As an admin, I want to deactivate an attraction without losing history.

Acceptance:

```text
Given an attraction has visits
When I deactivate it
Then it disappears from public pages
But historical visit records remain
```

---

## 31. MVP Acceptance Checklist

```text
[ ] Admin routes are protected.
[ ] Attraction list exists.
[ ] Admin can create attraction.
[ ] Admin can edit attraction.
[ ] Admin can publish/unpublish attraction.
[ ] Admin can deactivate attraction.
[ ] Admin can manage photo spots.
[ ] Admin can manage check-in codes.
[ ] Check-in code URL is visible/copyable.
[ ] Forms validate required fields.
[ ] Lists are paginated.
[ ] Public pages only show published active attractions.
[ ] Important changes create audit logs or are ready for audit logging.
[ ] No hard delete of historical data.
```

---

## 32. Do Not Do

Do not:

```text
Allow public users into admin routes.
Hard delete attractions with visits.
Hard delete photo spots with visits.
Allow duplicate slugs.
Allow duplicate check-in codes.
Let photo spot reference wrong attraction.
Expose unpublished attractions publicly.
Store image base64 in database.
Load all admin records without pagination.
Skip validation because admin is trusted.
```

---

## 33. Future Enhancements

Possible future features:

```text
content approval workflow
advanced roles and permissions
bulk import/export
QR PDF generation
media library
360 media viewer/editor
certificate template editor
stamp designer
official attraction reference linking
admin analytics per attraction
change history timeline
```

---

## 34. Definition of Done

This module is done when:

```text
[ ] Admin can manage attraction source data.
[ ] Admin can manage photo spots.
[ ] Admin can manage check-in codes.
[ ] Public pages reflect published content.
[ ] QR flow uses admin-managed codes.
[ ] Data validation protects dashboard quality.
[ ] Admin actions are secured.
[ ] Historical records are preserved.
[ ] Documentation and tests are updated.
```
