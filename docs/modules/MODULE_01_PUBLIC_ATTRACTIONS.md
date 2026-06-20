# MODULE_01_PUBLIC_ATTRACTIONS.md

## 1. Module Name

**Public Attractions Module**

---

## 2. Module Purpose

The Public Attractions Module provides the public-facing tourism content layer of the platform.

This module allows tourists and general visitors to browse attraction information before or after scanning a QR code.

It supports the tourism promotion side of the platform while also serving as the entry context for data collection.

This module is not only a tourism website. It is the content foundation that connects attractions, photo spots, QR check-in, certificates, digital stamps, and dashboard analytics.

---

## 3. Business Purpose

The module supports the main project objective:

> Build a high-quality tourism database for Yala, Pattani, and Narathiwat that supports sustainable tourism planning.

It does this by providing structured attraction content that can be linked to:

- tourist visits
- QR check-in codes
- photo spots
- certificates
- digital stamps
- satisfaction scores
- dashboard metrics
- sustainable tourism indicators

Latest product role:

- Public attraction pages support discovery, SEO, trust, 360 media, stories, and suggested routes.
- They should not replace the location-specific QR landing page as the main data collection entry point.
- Certificate CTAs should explain that real certificate creation normally starts from a QR code at the attraction/photo spot.
- Public pages must not expose tourist_id, visit_id, provider_user_id, guest token, or private storage paths.

---

## 4. Primary Users

## 4.1 Tourist

Tourists use this module to:

- View attraction information
- Learn about attraction history
- View images
- View map/location
- View 360-degree media if available
- Start the certificate/check-in flow
- Understand why they should participate

## 4.2 Foreign Tourist

Foreign tourists use this module to:

- View English attraction information
- Continue without LINE
- Understand the certificate/passport benefit
- Access the same QR/PWA experience as Thai tourists

## 4.3 Tourism Staff

Tourism staff use the admin side to manage content displayed in this module.

## 4.4 Researcher or Planner

Researchers and planners use structured attraction data to connect visits, satisfaction, and spending to specific places.

---

## 5. Module Scope

## 5.1 In Scope for MVP

The MVP version of this module includes:

- Public attraction list page
- Public attraction detail page
- Province filter
- Attraction type filter
- Search by attraction name
- Cover image
- Attraction description
- Attraction history
- Map/location display
- Photo spot list or call-to-action
- Certificate call-to-action
- Homepage/discovery feed compatibility
- QR certificate explanation card
- Privacy/trust content for tourists
- Published/inactive visibility rules
- Basic Thai and English content structure

## 5.2 In Scope for Phase 2

Phase 2 may include:

- Full 360-degree media viewer
- Tourism route suggestions
- Nearby attractions
- Related digital stamps
- More advanced image gallery
- Multilingual Malay content
- SEO metadata improvements
- Official attraction reference display
- Public event/campaign section

## 5.3 Out of Scope for This Module

This module does not directly handle:

- Photo upload
- Certificate generation
- Tourist form submission
- Survey submission
- Admin authentication
- Dashboard calculations

Those are handled by other modules.

---

## 6. Related Modules

This module connects to:

```text
MODULE_02_QR_CHECKIN.md
MODULE_03_TOURIST_PROFILE.md
MODULE_04_VISIT_RECORD.md
MODULE_05_PHOTO_UPLOAD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_07_DIGITAL_STAMP_PASSPORT.md
MODULE_09_ADMIN_ATTRACTION_CMS.md
MODULE_10_DASHBOARD_ANALYTICS.md
```

---

## 7. Required Data Tables

This module reads from:

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

It may indirectly support writes to:

```text
funnel_events
```

when a user starts a check-in flow from a public attraction page.

---

## 8. Main Public Routes

Recommended routes:

```text
/
 /attractions
 /attractions/[slug]
 /provinces/[provinceSlug]
```

MVP minimum:

```text
/attractions
/attractions/[slug]
```

---

## 9. Route: /attractions

## 9.1 Purpose

Displays a searchable and filterable list of published attractions.

## 9.2 Required UI Elements

- Page title
- Search input
- Province filter
- Attraction type filter
- Attraction cards
- Empty state
- Loading state
- Error state
- Mobile-first layout

## 9.3 Attraction Card Fields

Each attraction card should show:

```text
cover image
name
province
district
attraction type
short description
button/link to detail page
```

Optional:

```text
badge for target province
badge for community-based tourism
badge for certificate available
```

## 9.4 Data Rules

Only show attractions where:

```text
is_published = true
is_active = true
```

## 9.5 Acceptance Criteria

```text
[x] User can open attraction list page.
[x] Published attractions are visible.
[x] Unpublished attractions are hidden.
[x] Inactive attractions are hidden.
[x] User can filter by province.
[x] User can filter by attraction type.
[x] User can search by attraction name.
[x] Page works on mobile.
[x] Empty state is clear.
```

---

## 10. Route: /attractions/[slug]

## 10.1 Purpose

Displays a full dynamic attraction detail page.

## 10.2 Required UI Sections

The detail page should include:

```text
hero section
attraction name
province and district
attraction type
image gallery
short description
history/background
map/location section
travel information
photo spots or certificate CTA
360 media section if available
related actions
```

## 10.3 Required Call-to-Action

The page must include a clear CTA:

```text
Create My Travel Certificate
```

or:

```text
Get Digital Stamp
```

Thai version:

```text
รับใบประกาศดิจิทัล
```

The CTA should lead to the QR/check-in flow when a valid check-in code exists.

## 10.4 Handling Missing Data

The page must not break if optional data is missing.

Rules:

- If no image exists, show placeholder.
- If no 360 media exists, hide section.
- If no coordinates exist, hide map or show "Location coming soon."
- If no English text exists, fallback to Thai or show available language.
- If no photo spot exists, show attraction-level certificate entry if available.

## 10.5 Acceptance Criteria

```text
[ ] Page loads by slug.
[ ] Page shows attraction name.
[ ] Page shows province/district.
[ ] Page shows description or history when available.
[ ] Page shows gallery or placeholder.
[ ] Page shows certificate/check-in CTA.
[ ] Page does not crash when optional media is missing.
[ ] Page is mobile-first and readable.
```

---

## 11. Content Requirements

## 11.1 Attraction Name

Required:

```text
name_th
```

Recommended:

```text
name_en
```

Rules:

- Thai name is required because the project area is in Thailand.
- English name is recommended for foreign tourists.
- Do not hardcode attraction names in frontend components.

---

## 11.2 Description

Recommended:

```text
short_description_th
short_description_en
description_th
description_en
```

Rules:

- Short description should be concise.
- Full description can be longer.
- Do not use unverified claims.
- If content is demo, mark it clearly during development.

---

## 11.3 History

Recommended:

```text
history_th
history_en
```

Rules:

- History should be separate from general description.
- Historical content should be reviewed before production.
- If unsure, use neutral wording.

---

## 11.4 Location

Recommended:

```text
latitude
longitude
address_text
```

Rules:

- Coordinates must be valid if provided.
- Do not invent exact coordinates.
- If coordinates are unknown, leave null.

---

## 11.5 Images

Images should include:

```text
storage_path
alt_text_th
alt_text_en
caption_th
caption_en
display_order
is_cover
```

Rules:

- Use optimized images.
- Provide alt text where possible.
- Avoid very large images on initial load.
- Use `media_assets` thumbnails when available instead of selecting non-existent `thumbnail_storage_path` directly from `content_media`.
- Use lazy loading.

---

## 11.6 360 Media

360 media may include:

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

MVP may display a placeholder if full viewer is not implemented.

---

## 12. UX Principles

## 12.1 Mobile First

Most tourists will use mobile devices.

Requirements:

- Large touch targets
- Readable font sizes
- Fast image loading
- Clear CTA
- Sticky or visible action button if useful
- Avoid dense text blocks
- Use collapsible sections for long history content

---

## 12.2 Low Friction

The page should quickly answer:

```text
What is this place?
Why is it interesting?
What can I do here?
How do I get my certificate/stamp?
```

Do not hide the certificate CTA too far down the page.

---

## 12.3 Clear Value Proposition

The public page should explain the benefit:

Example English:

```text
Create a free digital travel certificate and collect your Southern Border travel stamp.
```

Example Thai:

```text
สร้างใบประกาศดิจิทัลฟรี และสะสมตราประทับการท่องเที่ยวชายแดนใต้
```

---

## 12.4 International Visitor Support

The page should support foreign visitors.

Requirements:

- English content fields
- Language switcher or browser-language default
- Guest flow clearly available
- No forced LINE login
- Country-based origin support later in tourist form

---

## 13. Data Fetching Requirements

## 13.1 Attraction List Query

Must fetch:

```text
attraction_id
slug
name_th
name_en
short_description_th
short_description_en
province
district
attraction_type
cover_image
is_published
is_active
```

Filter:

```text
is_published = true
is_active = true
```

## 13.2 Attraction Detail Query

Must fetch:

```text
attraction core fields
province
district
attraction_type
images
360 media
photo_spots
active checkin_codes
```

Filter:

```text
slug = route slug
is_published = true
is_active = true
```

## 13.3 Photo Spot Query

Must fetch active photo spots:

```text
photo_spots.is_active = true
```

and active check-in codes when available:

```text
checkin_codes.is_active = true
```

---

## 14. Error Handling

## 14.1 Attraction Not Found

Show user-friendly page:

```text
Attraction not found.
```

Thai:

```text
ไม่พบข้อมูลสถานที่ท่องเที่ยว
```

Do not expose database error.

## 14.2 Attraction Not Published

Treat as not found for public users.

Admin may view unpublished attraction in admin preview.

## 14.3 Missing Content

Show graceful placeholders.

Do not show raw null values.

---

## 15. Performance Requirements

## 15.1 Image Optimization

Requirements:

- Use responsive image sizes.
- Lazy load non-critical images.
- Use cover image for cards.
- Avoid loading full gallery before needed.

## 15.2 Caching

Public attraction pages can be cached.

Potential strategies:

- Static generation
- Incremental revalidation
- Server-side caching
- Supabase query caching if appropriate

## 15.3 Query Performance

Indexes needed:

```text
attractions(slug)
attractions(province_id)
attractions(attraction_type_id)
attractions(is_published, is_active)
attraction_images(attraction_id)
photo_spots(attraction_id)
checkin_codes(attraction_id)
```

---

## 16. Accessibility Requirements

Requirements:

- Semantic headings
- Alt text for images
- Buttons with accessible labels
- Sufficient contrast
- Keyboard-friendly links
- Do not rely only on color
- Map should not be the only way to understand location

---

## 17. SEO Requirements

For public pages, include:

```text
title
description
open graph image
canonical URL if needed
structured heading hierarchy
```

MVP can implement basic metadata.

SEO is useful because attraction pages may be public-facing.

---

## 18. Admin Dependency

The public module depends on admin CMS.

Admin must be able to manage:

```text
attractions
images
photo spots
check-in codes
360 media
publish status
```

Until admin CMS is complete, seed data can be used.

---

## 19. Dashboard Dependency

Public attraction pages affect dashboard data because they lead users into check-in and certificate flow.

Important events:

```text
landing_viewed
certificate_started
```

These should be recorded when user interacts with CTA or check-in flow.

---

## 20. Security and Privacy

This module mostly displays public data.

Rules:

- Do not expose unpublished attractions.
- Do not expose internal IDs unnecessarily in URLs.
- Use slug or check-in code in public URLs.
- Do not expose admin-only fields.
- Do not expose storage paths if private.
- Do not include tourist data on public attraction pages.

---

## 21. Example User Stories

## 21.1 Tourist Browses Attractions

As a tourist, I want to see attractions in Yala, Pattani, and Narathiwat so that I can decide where to visit.

Acceptance:

```text
Given I open /attractions
When the page loads
Then I see published attractions
And I can filter by province
```

---

## 21.2 Tourist Views Attraction Detail

As a tourist, I want to read about an attraction before creating a certificate.

Acceptance:

```text
Given I open an attraction detail page
When the attraction exists and is published
Then I see description, images, location, and certificate CTA
```

---

## 21.3 Foreign Tourist Uses English Content

As a foreign tourist, I want to view attraction information in English.

Acceptance:

```text
Given English content exists
When I view the attraction page in English
Then English name and description are shown
```

---

## 21.4 Tourist Starts Certificate Flow

As a tourist, I want to start the certificate flow from the attraction page.

Acceptance:

```text
Given active check-in code exists
When I click Create My Travel Certificate
Then I am taken to the check-in/certificate flow
```

---

## 22. Edge Cases

## 22.1 No Image

Show placeholder image.

## 22.2 No English Content

Fallback to Thai content or show available language.

## 22.3 No Active Check-in Code

Show attraction information but hide certificate CTA or show:

```text
Certificate is not available for this attraction yet.
```

## 22.4 Attraction Inactive

Do not show publicly.

## 22.5 Attraction Published but Missing Coordinates

Show content without map.

## 22.6 Slow Image Loading

Show skeleton or placeholder.

---

## 23. MVP Acceptance Checklist

```text
[ ] Attraction list page exists.
[ ] Attraction detail page exists.
[ ] Attraction data loads from database.
[ ] Published/active filtering works.
[ ] Province filter works.
[ ] Attraction type filter works.
[ ] Search works.
[ ] Detail page shows images or placeholder.
[ ] Detail page shows description/history.
[ ] Detail page shows CTA for certificate/check-in.
[ ] No forced LINE dependency exists.
[ ] Mobile layout is clean.
[ ] Missing optional data does not crash the page.
```

---

## 24. Do Not Do

Do not:

```text
Hardcode attractions in frontend components.
Expose unpublished attractions publicly.
Require login to view attraction pages.
Require LINE to view attraction pages.
Use fake precise coordinates as production data.
Show raw database errors to users.
Load huge full-size images on attraction cards.
Mix admin editing logic into public display components.
```

---

## 25. Future Improvements

Possible future features:

```text
Nearby attractions
Tourism route recommendations
Event calendar
Community product section
Local food recommendations
Multilingual Malay content
Advanced map filters
Official attraction reference badge
User-generated public gallery after moderation
```

These are not required for MVP.

---

## 26. Definition of Done

This module is done when:

```text
[ ] Public attraction list works.
[ ] Public attraction detail works.
[ ] Data is dynamic.
[ ] Filters work.
[ ] Mobile UX is good.
[ ] Certificate CTA connects to QR/check-in flow.
[ ] Missing optional data is handled.
[ ] Public pages do not leak private/admin data.
[ ] Documentation and route structure are updated.
```
