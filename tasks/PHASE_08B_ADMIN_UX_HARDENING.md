# PHASE_08B_ADMIN_UX_HARDENING.md

## Status

**Complete.** All workstreams (A through L) have functioning implementations verified against the codebase. Remaining items are deferred follow-up tasks (fallback behavior controls, seed data screenshots).

Current validation: `TypeScript: 0 errors` | `Tests: 444/444 passing`

See the individual workstream checkboxes below for detailed per-item status.

## Goal

Continue hardening the admin backoffice UX so non-technical administrators can confidently manage public content, media, QR/check-in flows, settings, and operational data without developer assistance.

This phase is not only visual polish. It is a production CMS usability and data-quality phase.

The admin UX must make connected content understandable:

```text
Attraction -> Media -> Photo Spot -> Check-in Code -> QR Landing -> Certificate Context -> Dashboard Data
Story -> Media -> Related Attraction/Province -> Public Story Page
Route -> Route Stops -> Attraction Records -> Public Route Page
Homepage Section -> Selected Attraction Records -> Public Homepage Cards
Settings -> Hero/Public Copy/SEO/System Toggles -> Public Surfaces
```

## Phase Position

Phase 08B follows:

- `PHASE_08_ADMIN_BACKOFFICE.md`
- `PHASE_08A_DYNAMIC_ADMIN_CRUD.md`
- Initial admin CMS/settings/media UX refactor

Phase 08B should be completed before treating the project as release-ready for real admins.

It prepares for:

- Phase 09 dashboard interpretation confidence
- Phase 10 safer report/export use
- Phase 12 UX and E2E hardening
- Phase 13 deployment with real admin users

## Core Problem

The current admin backoffice has working CRUD areas, but admins can still feel unsure about:

- where to update homepage popular destination images
- why homepage popular destinations should be selected from attraction records instead of typed as free text
- where attraction text lives versus story text
- how media links to attractions, stories, routes, and settings
- whether the global Media Library is the right place to start or only a supporting picker/asset manager
- what happens after a QR/check-in code is created
- whether a record is safe to publish
- why a validation error happened
- which setting affects which public surface
- whether a destructive action will break public pages or historical data

This task turns those rough edges into a guided, consistent CMS workflow.

## Success Definition

An admin should be able to complete these tasks without developer help:

1. Replace the image shown for a popular destination.
2. Edit an attraction detail page text and gallery.
3. Create a photo spot and matching QR/check-in code.
4. Copy and test the public QR URL.
5. Create a travel story and attach media.
6. Create a suggested route and order route stops.
7. Update homepage/contact/SEO settings.
8. Understand whether a record is draft, active, inactive, or published.
9. Recover from validation errors without seeing raw technical language.
10. Avoid deleting or changing media that is already used in public pages.
11. Choose which attractions appear in the homepage popular destinations section using search/filter/order controls.
12. Edit an attraction using a page-section editor that mirrors the public attraction detail layout.
13. Remove confusing public mock content so CMS previews and public pages use inserted database content or honest empty states.

## Read First

Before implementation, read:

- `AGENTS.md`
- `README.md`
- `tasks/PHASE_08_ADMIN_BACKOFFICE.md`
- `tasks/PHASE_08A_DYNAMIC_ADMIN_CRUD.md`
- `docs/frontend/ADMIN_UI_SPEC.md`
- `docs/frontend/ADMIN_SIDE_PAGES.md`
- `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`
- `docs/frontend/DESIGN_SYSTEM.md`
- `docs/frontend/FORM_UX_RULES.md`
- `docs/frontend/ERROR_LOADING_EMPTY_STATES.md`
- `docs/frontend/ACCESSIBILITY_GUIDELINES.md`
- `docs/testing/UX_TEST_PLAN.md`
- `checklists/UI_UX_CHECKLIST.md`
- `checklists/FRONTEND_CHECKLIST.md`
- `docs/security/ROLE_PERMISSION_MATRIX.md`
- `docs/security/AUDIT_LOGGING.md`
- `docs/security/PDPA_PRIVACY_DESIGN.md`

## Current Baseline

Already implemented or started:

- `/admin/content` Content Hub.
- Workflow-based settings console.
- Media validation fixes for `mediaType` and `storagePath`.
- Media upload UX that generates storage paths automatically.
- Admin settings APIs protected by settings permissions and known setting keys.
- Shared admin form primitives:
  - `AdminFormSection`
  - `AdminFormErrorSummary`
  - `AdminHelpPanel`
  - `AdminReadinessPanel`
  - `AdminSaveBar`
- Improved check-in code form with QR readiness and `/c/[code]` preview.
- Improved route stop manager with normalized day/order preview.
- Form error summaries and save bars added to major CMS forms.

Phase 08B should build on this work, not replace it with another unrelated design pattern.

Additional audit findings from the current partial CMS work:

- Root-level HTML mockup artifacts were removed from the active repository surface so CMS review is not mixed with standalone design files.
- Public repositories still import fixture fallback data from `components/homepage/homepage-data.ts`, `lib/data/attraction-details.ts`, and `lib/data/stories.ts`.
- `getPublicAttractionDetail()` currently returns a mock attraction when the database has no matching published record. This hides missing data and makes CMS review confusing.
- Page-matched visual editors have started, which is the right direction, but some preview areas still contain mock/stock placeholders such as fallback Unsplash covers, mock author blocks, map background placeholders, and relational placeholder copy.
- Homepage popular destinations now have a picker direction, but the current action must align with the real schema. It should query `attraction_id`, `provinces(province_name_th)`, and cover media from the final media table instead of nonexistent attraction fields.
- Media entity typing is inconsistent. `npm run typecheck` currently reports that `accommodation` is accepted by some UI code but not by the media validation/repository filter types.

## Recommended Product Direction

Use a page-matched CMS model:

```text
Admin edit screen should look and navigate like the public page it edits.
```

When an admin edits `/admin/attractions/[id]/edit`, the editor should be organized in the same mental order as `/attractions/[slug]`.

For the current public attraction detail page, that means:

| Public section | Admin editor section | Data source |
|---|---|---|
| Breadcrumb/header/title/province | Identity & status | attraction record |
| Hero/gallery | Gallery & cover media | attraction media |
| Overview | Overview copy | attraction descriptions |
| Things to Do | Activity blocks | planned structured content or temporary notes |
| Where to Stay | Related accommodations | future related-content module |
| Food & Drink | Nearby restaurants | restaurant-attraction relationships |
| Tips | Travel tips | planned structured content or temporary notes |
| How to Get There | Location & transport | attraction location/opening/contact fields |
| Reviews | Visitor reviews | review moderation module |
| Articles | Related stories | story relationships, planned if missing |
| CTA / QR entry | Photo spots and check-in codes | photo spots and check-in codes |

Do not show admins one huge generic form first. Use a split layout:

```text
Left: section navigator matching the public page
Center: editable fields for the selected section
Right: preview/readiness panel showing how this section appears publicly
```

This is the clearest path because admins can say:

```text
I want to change the gallery.
I want to change Overview.
I want to change the QR/certificate entry point.
I want to change restaurants shown near this attraction.
```

instead of guessing which database form owns the content.

## Media Library Decision

Do not remove the Media Library entirely.

Keep it, but change its product role:

```text
Media Library = asset manager and picker
Attraction/Story/Route/Homepage CMS = where admins actually choose and apply images
```

Admins should usually not start in `/admin/media` to change a public page image. They should start from the content they are editing:

```text
Attraction editor -> Gallery & cover media -> Pick/upload image
Story editor -> Hero image -> Pick/upload image
Homepage section editor -> Popular destination card uses attraction cover image
Settings -> Hero/CTA image -> Pick/upload image
```

The global Media Library still has value for:

- searching all uploaded official content assets
- uploading reusable assets
- editing metadata such as alt text, caption, credit, license, role, status
- seeing where an image is used
- archiving unused assets

It should not be the only UX path for replacing images.

## Homepage Popular Destinations Direction

The homepage "สถานที่ยอดนิยม" section must be managed as selected attraction records, not copied text.

Recommended model:

```text
homepage_featured_attractions = ordered list of attraction IDs or slugs
public homepage cards = rendered from attraction source-of-truth fields and cover media
```

Admin UX:

- Show searchable attraction picker, not a raw slug textarea.
- Support filters by province, published status, active status, has cover image, has QR/photo spot.
- Show selected attraction cards with thumbnail, province, status, cover-image readiness, and drag/arrow ordering.
- Let admin choose display count and fallback behavior:
  - manual only
  - manual first, then latest published
  - manual first, then popular by visits when analytics is ready
- Warn if selected attraction is inactive, unpublished, or missing cover media.
- Keep selected order stable as the number of attractions grows.

Public homepage UX:

- Province tabs must be real interactive links or controls.
- "ทั้งหมด", "ยะลา", "ปัตตานี", "นราธิวาส" should filter by province.
- The filter must work whether the section is server-rendered with links or client-interactive.
- Empty province states should show a friendly message and link to all attractions.
- The section should not hardcode the first four records forever.

Do not put long homepage editorial text management into attraction records. Homepage section settings may control heading/subheading/filter labels, but the cards should come from attraction records.

## Source Of Truth And Mock Cleanup Policy

The CMS and public website must use inserted database content as the source of truth.

```text
Public page content = database records and approved media
Development/demo content = Supabase seed data
Missing content = empty state, readiness warning, or notFound
Mock HTML/design files = archive outside the app or remove
```

Rules:

- Public pages must not silently substitute fake attraction, story, route, restaurant, or accommodation content.
- If a query fails or a record does not exist, return `null` or `[]` and show an honest empty/error state.
- Seed data may use representative demo records, but it must be loaded through the database and marked as demo where relevant.
- Admin preview canvases may show "missing content" placeholders only when the real record is incomplete. They must not show unrelated stock content that looks published.
- Root-level HTML mockups should not remain beside production routes. Delete them if no longer needed, or move them to a documented design archive that is clearly not part of runtime.
- Fixture files can remain only as test fixtures or documented dev-only examples. They must not be imported by public repositories as production fallback content.
- Remove repository debug logs after the data pipeline is verified.

Immediate cleanup targets:

| Target | Action |
|---|---|
| Root HTML mockups | Removed from the active repository surface |
| `homepageAttractions` fixture | Stop using as public fallback; replace with DB empty state |
| `attractionDetailsMock` fixture | Stop using as public detail fallback; return `null` for missing/unpublished records |
| `storiesData` fixture | Stop using as story fallback; return empty story list |
| Unsplash fallback images in repositories/editors | Replace with missing-image UI or seeded media records |
| Mock author/table-of-contents/sidebar blocks | Replace with real fields or hide until implemented |
| Public route image placeholder | Use route `cover_image_path` or honest empty image state |

## UX Principles

### 1. Admins Think In Workflows, Not Tables

Use admin language such as:

```text
Change homepage image
Edit attraction page
Create QR for this photo spot
Preview public page
Check publish readiness
Where is this image used?
```

Avoid making admins reason from database implementation details first.

### 1.1 Admins Edit A Page By Its Visible Sections

For public content pages, the admin editor should mirror the public page layout.

Example for attraction edit:

```text
Page Preview Sections
1. Header
2. Gallery
3. Overview
4. Activities
5. Location / How to get there
6. Nearby food / stays
7. Reviews
8. QR / Certificate CTA
```

Clicking a section opens only the fields for that section. This reduces confusion compared with a single long form.

### 2. Source Of Truth Must Be Visible

When content appears in more than one public surface, show where it comes from:

```text
Homepage popular destination -> Attraction cover media
QR landing page -> Check-in code + attraction + optional photo spot
Story hero image -> Story media
Route stop card -> Attraction record
```

### 3. Publishing Needs Readiness, Not Guesswork

Before publish or public use, show readiness for:

- required title/name
- province/district/type
- public image/cover media
- alt text for public image
- active status
- publish status
- QR linkage where relevant
- route stops where relevant
- public preview URL

### 4. Error Messages Must Be Actionable

Bad:

```text
Validation failed.
Invalid input.
Foreign key violation.
```

Good:

```text
กรุณาตรวจข้อมูลสถานที่อีกครั้ง
Slug นี้ถูกใช้งานแล้ว กรุณาใช้ slug อื่น
กรุณาเลือกสถานที่ก่อนสร้าง QR
```

### 5. Destructive Actions Must Explain Impact

Before delete/archive/deactivate/unpublish:

- explain affected public pages
- explain whether historical visits remain
- prefer archive/deactivate over hard delete
- show "used in" references for media
- require confirmation for dangerous actions

### 6. Admin UX Must Protect Data Quality

UX should prevent:

- duplicate attraction records created from route/story needs
- raw image URLs typed in random fields when media picker should be used
- QR codes not linked to the correct attraction/photo spot
- route stops with no attraction
- public pages with missing image alt text
- settings keys edited arbitrarily from the client

## Scope

### In Scope

- Admin information architecture and navigation clarity.
- Content Hub improvements.
- Admin list UX consistency.
- Admin form UX consistency.
- Page-matched content editors for public content pages.
- Homepage section management for selected attractions.
- Media library and media picker UX.
- Publish/readiness panels.
- Public preview entry points.
- Settings console UX hardening.
- QR/check-in operational UX.
- Story and route editorial UX.
- Dashboard/export navigation hints from admin context.
- Loading, empty, error, success states.
- Thai admin copy and important English labels where appropriate.
- Accessibility and responsive behavior for admin tablet/desktop and basic mobile.
- Documentation, test notes, and manual QA scripts.

### Out Of Scope

- Rebuilding the whole design system from scratch.
- Replacing the database schema without a separate database task.
- Turning Settings into the main editor for attraction/story/route content.
- Removing the Media Library before replacing its asset-manager/picker responsibilities.
- Adding LINE as a requirement for admin or tourist workflows.
- Advanced workflow approvals if not supported by schema yet.
- Full image transformation pipeline unless existing storage/service supports it.
- Drag-and-drop route reordering if arrow/number ordering is sufficient for MVP.
- Full WYSIWYG editor integration unless justified and reviewed.

## Workstreams

## Workstream A: Admin UX Audit And Inventory

### Tasks

- [x] Audit every admin route and list current UX problems.
- [x] Map admin routes to user jobs:
  - content editing
  - QR operations
  - analytics review
  - settings management
  - user/role management
  - reports/exports
- [x] Identify duplicated form patterns.
- [x] Identify inconsistent buttons, cards, status badges, error boxes, and empty states.
- [x] Identify fields that should use media picker instead of raw URL/path input.
- [x] Identify pages that lack preview/public URL actions.
- [x] Identify actions that need confirmation dialogs.
- [x] Inventory all mockup/fixture/fallback sources that can confuse CMS review.
- [x] Classify each mock source as delete, archive, test-only fixture, or database seed replacement.
- [x] Identify every public repository path that returns fake content when DB records are missing.
- [x] Capture current type/schema mismatches before UI polish, especially media entity types and homepage attraction picker fields.

### Expected Output

- Short audit note in `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md` or a new audit section.
- Prioritized issue list:
  - critical
  - high
  - medium
  - low

### Acceptance Criteria

- The audit names concrete pages and friction points.
- It separates UX issues from backend/schema limitations.
- It identifies which issues must be fixed before deployment.

## Workstream B: Shared Admin UX Component System

### Tasks

- [x] Stabilize shared primitives in `components/admin/forms/AdminFormUX.tsx`.
- [x] Add or refine shared components for:
  - page header
  - empty state
  - loading state
  - error state
  - status badge
  - confirmation dialog
  - preview link button
  - copy-to-clipboard button
  - publish readiness panel
  - "used in" impact list
- [x] Ensure all shared components use consistent border radius, spacing, focus states, and Thai-readable typography.
- [x] Ensure icon-only buttons have accessible names and tooltips where needed.

### Expected Files

- `components/admin/forms/AdminFormUX.tsx`
- `components/admin/*`
- `docs/frontend/COMPONENT_ARCHITECTURE.md`
- `docs/frontend/ADMIN_UI_SPEC.md`

### Acceptance Criteria

- At least the main admin forms use the same error summary and save bar.
- Admin list pages use consistent empty/error/loading patterns.
- Shared components do not import server-only code.
- TypeScript passes.

## Workstream C: Content Hub As CMS Command Center

### Tasks

- [x] Refine `/admin/content` into a command center organized by admin jobs.
- [x] Add workflow cards:
  - Change homepage popular destination image.
  - Edit attraction detail page.
  - Manage attraction gallery/media.
  - Create QR for a photo spot.
  - Create travel story.
  - Create suggested route.
  - Update homepage/settings copy.
- [x] Add "source of truth" map showing connected content objects.
- [x] Add quick links to relevant modules and docs.
- [x] Add publish readiness overview with content counts, published status, cover/hero/stops readiness badges.
- [x] Add safe explanatory copy for media standards and public page dependencies.

### Expected Files

- `app/(admin)/admin/content/page.tsx`
- `components/admin/admin-nav-items.ts`
- `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`

### Acceptance Criteria

- Admin can answer "where do I change this content?" from `/admin/content`.
- Page does not duplicate content editing fields already owned by module forms.
- Links point to existing admin routes.
- Protected admin route behavior remains intact.

## Workstream C1: Page-Matched Content Editors

### Goal

Turn each major public content editor into a section-based editor that mirrors the public page layout.

For attraction pages, the admin should see sections that correspond to `/attractions/[slug]`, such as:

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

### Tasks

- [x] Create a reusable admin `PageSectionEditor` pattern:
  - section navigation
  - section status/readiness
  - editable panel
  - preview panel
  - sticky save bar
- [x] Refactor attraction create/edit into section-based editing.
- [x] Add preview cards that visually resemble the public page sections.
- [x] Keep unsupported sections visible as "planned / data source not ready" instead of hiding them if they exist on the public page.
- [x] Add section-level readiness:
  - Header has name/province/status.
  - Gallery has cover image and alt text.
  - Overview has Thai description.
  - Location has useful address/opening/contact or coordinates.
  - QR CTA has active photo spot/check-in code if the attraction is intended for QR flow.
- [x] Add section anchors or tabs so admins can jump directly to the part they want to edit.
- [ ] Apply the same model later to stories, routes, restaurants, and settings-managed page sections.

### Expected Files

- `components/admin/content/PageSectionEditor.tsx`
- `components/admin/attractions/AttractionForm.tsx`
- `components/admin/attractions/AttractionSectionEditor.tsx`
- `components/admin/attractions/MediaManager.tsx`
- `app/(admin)/admin/attractions/[id]/edit/page.tsx`
- `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`
- `docs/frontend/ADMIN_UI_SPEC.md`

### Acceptance Criteria

- Admin can tell which public section they are editing before changing a field.
- The attraction editor no longer feels like a single disconnected data form.
- The editor clearly separates source data from public preview.
- Planned sections do not falsely claim to be implemented.
- Typecheck and build pass after refactor.

## Workstream C2: Homepage Popular Destinations CMS

### Goal

Replace raw slug-list editing with a usable homepage section editor that selects from existing attraction records.

### Tasks

- [x] Move homepage popular destinations management out of raw textarea UX.
- [x] Build an attraction selector with:
  - search by Thai/English name
  - province filter
  - published/active filter
  - cover-image readiness
  - QR/photo-spot readiness if relevant
- [x] Show selected attractions as ordered cards.
- [x] Allow reordering selected attractions.
- [x] Allow removing selected attractions.
- [x] Preserve stable order in `homepage_featured_attractions`.
- [x] Decide storage shape:
  - keep slugs for public URL stability in MVP, or
  - migrate to attraction IDs if a schema/settings migration is added
- [ ] Add fallback behavior controls (deferred — depends on analytics dashboard readiness):
  - manual only
  - manual first then latest published
  - manual first then analytics-popular when dashboard signals are ready
- [x] Update `HomepageAttractionsFeed` province tabs so they actually filter:
  - server links such as `/?featuredProvince=Yala#attractions`, or
  - client-side filtering if the section has all cards loaded
- [x] Ensure "ทั้งหมด", "ยะลา", "ปัตตานี", and "นราธิวาส" are keyboard accessible controls or links.
- [x] Add empty state for province filter with no selected attractions.

### Expected Files

- `components/admin/settings/SettingsClient.tsx`
- `components/admin/content/HomepageFeaturedEditor.tsx`
- `components/homepage/sections/HomepageAttractionsFeed.tsx`
- `components/homepage/homepage.tsx`
- `lib/config/site-settings.ts`
- `lib/repositories/public-content.repository.ts`
- `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`

### Acceptance Criteria

- Admin chooses popular destinations from attraction records, not manual free-text slugs.
- Selected homepage cards use attraction source data and cover media.
- Province tabs on the homepage work.
- The UX scales when there are many attractions.
- Inactive/unpublished/missing-image attractions are warned or blocked from featured use.

## Workstream C3: CMS IA Split By Public Surface

### Goal

Avoid one confusing generic CMS page by giving each public surface its own management entry while keeping shared source records.

### Recommended Information Architecture

```text
/admin/content
  Overview command center
  Homepage sections
  Attraction pages
  Stories
  Routes
  Restaurants
  QR landing content
  Settings surfaces
```

Each section should explain:

```text
What public page this affects
What source records it uses
Where images come from
What can be previewed
What is planned but not implemented yet
```

### Tasks

- [x] Add Content Hub entry for "Homepage sections".
- [x] Add Content Hub entry for "Attraction page sections".
- [x] Add Content Hub entry for "QR landing content".
- [x] Add clear "image ownership" notes:
  - attraction card image comes from attraction cover media
  - story hero image comes from story media/image field
  - settings hero image comes from settings media picker
- [x] Keep Settings for global presentation/copy only, not detailed attraction content.

### Acceptance Criteria

- Admin can choose a public surface first, then edit the correct source records.
- Content Hub reduces confusion instead of adding another duplicate editor.

## Workstream C4: Mock/Fallback Cleanup And Inserted Data Source

### Goal

Make the CMS trustworthy by ensuring public pages and admin previews show real inserted data, not hidden mock content.

### Tasks

- [x] Remove or archive root-level HTML mockup files that are no longer part of the active app.
- [x] Update `lib/repositories/public-content.repository.ts` so public list/detail functions return `[]` or `null` when DB data is missing instead of fixture fallback records.
- [x] Replace `getPublicAttractionDetail()` mock fallback with `null` and let `/attractions/[slug]` call `notFound()` for missing or unpublished records.
- [x] Replace story fallback behavior with an empty list and public empty states.
- [x] Replace public route placeholder images with route cover image data or a missing-image UI.
- [x] Replace Unsplash fallback images in admin visual editors with missing-image/readiness UI unless the image comes from seed data or a saved media record.
- [x] Fix homepage featured attraction picker actions to use real schema fields:
  - `attraction_id`
  - `slug`
  - `name_th`
  - `name_en`
  - `is_published`
  - `is_active`
  - `provinces(province_name_th, province_name_en)`
  - cover media from the selected media table
- [x] Decide the final media table for CMS — resolved: `content_media` is the unified media table for attractions, restaurants, accommodations, stories, and routes.
- [x] Make media entity types consistent across validation, repository, API, and UI, including `accommodation` if accommodations remain in scope.
- [x] Remove repository debug logs after DB-backed rendering is confirmed.
- [ ] Update seed data so development screenshots are generated from inserted records, not runtime mock imports (follow-up: `supabase/seed.sql` update when Docker is available).

### Expected Files

- `lib/repositories/public-content.repository.ts`
- `app/(public)/attractions/[slug]/page.tsx`
- `app/(public)/attractions/page.tsx`
- `components/homepage/sections/HomepageAttractionsFeed.tsx`
- `app/actions/admin-content-actions.ts`
- `components/admin/content/HomepageFeaturedEditor.tsx`
- `components/admin/attractions/visual-editor/*`
- `components/admin/stories/visual-editor/*`
- `components/admin/restaurants/visual-editor/*`
- `lib/validation/media.ts`
- `lib/repositories/admin-media.repository.ts`
- `supabase/seed.sql`
- `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`

### Acceptance Criteria

- Public pages never display mock attraction/story/route content when DB content is missing.
- Admin visual editors show real saved content or clear missing-content states.
- Homepage popular destination picker searches real attraction records and shows real cover media readiness.
- Media entity types are consistent and `npm run typecheck` no longer fails on media entity typing.
- Development demo data comes from seed records, not runtime fallback imports.
- Design mockups are either removed or clearly archived outside the production app surface.

## Workstream D: Admin List UX Standardization

### Target Lists

- Attractions
- Photo spots
- Check-in codes
- Stories
- Routes
- Restaurants
- Media
- Visits
- Surveys
- Users
- Roles

### Tasks

- [x] Standardize list header: title, description, primary action, secondary action.
- [x] Standardize filters: search, province, status, type, date where relevant.
- [x] Add clear "filters active" and reset behavior.
- [x] Standardize status badges:
  - Published
  - Draft
  - Active
  - Inactive
  - Expired
  - Missing Media
  - Needs QR
- [x] Add meaningful empty states with next action.
- [x] Add pagination or bounded list behavior where missing.
- [x] Add row actions that match the record type:
  - edit
  - preview
  - manage media
  - create QR
  - copy URL
  - publish/unpublish
  - deactivate

### Acceptance Criteria

- No major admin list feels like an unrelated UI.
- Empty states tell admins what to do next.
- Status labels are understandable without relying only on color.
- Lists remain paginated or bounded.
- No private tourist identifiers are shown in normal lists.

## Workstream E: Attraction CMS UX Hardening

### Tasks

- [x] Refactor the attraction editor into a page-section editor that mirrors `/attractions/[slug]`.
- [x] Add attraction publish readiness panel.
- [x] Add public preview action for `/attractions/[slug]` when slug exists.
- [x] Add media management entry point in form and success state.
- [x] Make location/taxonomy fields easier to scan.
- [x] Add helper text for slug, province/district, sustainability category, and capacity.
- [x] Add "QR readiness" hint:
  - no photo spot
  - no active check-in code
  - active QR exists
- [x] Reduce reliance on raw image URL/path fields where media picker is available.
- [x] Show gallery/cover editing inside the attraction editor, with deep link to the full media manager.
- [x] Label each editor section with the matching public page section.
- [x] Add clear success next steps:
  - manage media
  - create photo spot
  - create QR
  - preview public page

### Expected Files

- `components/admin/attractions/AttractionForm.tsx`
- `components/admin/attractions/MediaManager.tsx`
- `app/(admin)/admin/attractions/*`
- `app/actions/admin-attraction-actions.ts`

### Acceptance Criteria

- Admin knows whether attraction is ready for public use.
- Admin understands how to change attraction images.
- Admin can click a public-page-like section and edit the matching data.
- Validation errors show clear Thai admin-facing copy.
- Public preview link is visible when possible.

## Workstream F: Media Library And Image Governance UX

### Tasks

- [x] Keep global Media Library as an asset manager and picker, not the primary content-editing path.
- [x] Add image selection flows inside attraction/story/route/homepage/settings editors.
- [x] Add media metadata form clarity:
  - alt text
  - caption
  - credit/source
  - role
  - entity link
  - status
- [x] Add media type selector that hides irrelevant fields.
- [x] Add upload drag-and-drop if feasible.
- [x] Add image preview and thumbnail consistency.
- [x] Add "used in" references before delete/archive.
- [x] Prefer archive/deactivate over hard delete where public usage exists.
- [x] Add copy that separates:
  - official public content media
  - tourist-uploaded photos
  - certificate-generated files
- [x] Add file validation copy for JPG, PNG, WebP and size limit.
- [x] Add alt text readiness before publishing public media.

### Expected Files

- `components/admin/media/MediaLibrary.tsx`
- `components/admin/attractions/MediaManager.tsx`
- `app/api/admin/media/*`
- `app/actions/admin-media-actions.ts`
- `lib/validation/media.ts`
- `docs/backend/STORAGE_FILE_UPLOADS.md`
- `docs/security/IMAGE_UPLOAD_SECURITY.md`

### Acceptance Criteria

- Admin does not type storage paths for uploaded files.
- Admin understands which fields matter for each media type.
- Admin can replace a public image from the relevant content editor without visiting global Media Library first.
- Public content images have an alt text path.
- Delete/archive explains impact.
- Tourist photos are not mixed into official content media UI.

## Workstream G: QR And Photo Spot Operational UX

### Tasks

- [x] Make photo spot form explain its role in QR/certificate context.
- [x] Add success next steps after photo spot creation:
  - create QR/check-in code
  - manage attraction media
  - return to attraction
- [x] Add QR public URL preview and copy action consistently.
- [x] Add QR status explanations:
  - active
  - inactive
  - scheduled
  - expired
- [x] Add QR test/open action.
- [x] Add QR image generation/download if already supported or feasible.
- [x] Add warning when QR points to inactive/unpublished attraction.
- [x] Add warning when photo spot does not belong to selected attraction.

### Expected Files

- `components/admin/photo-spots/PhotoSpotForm.tsx`
- `components/admin/checkin-codes/CheckinCodeForm.tsx`
- `app/actions/admin-photo-spot-actions.ts`
- `app/actions/admin-checkin-code-actions.ts`
- `lib/validation/checkin-code.ts`

### Acceptance Criteria

- Admin can create and test QR without developer help.
- Admin understands QR public URL and linked attraction/photo spot.
- Invalid QR setup is blocked or warned clearly.
- No separate QR flow is created for LINE/guest/foreign users.

## Workstream H: Story And Route Editorial UX

### Story Tasks

- [x] Add story readiness panel:
  - title
  - slug
  - excerpt
  - hero image
  - province/category
  - publish status
- [x] Add public preview link.
- [x] Add media picker/entry point for hero image.
- [x] Add related attraction/route placeholders if schema supports it, otherwise document as planned.
- [x] Improve success next steps after story creation.

### Route Tasks

- [x] Add route readiness panel:
  - route name
  - cover image
  - at least one stop
  - every stop linked to attraction
  - active/published status
- [x] Add public preview link.
- [x] Improve route stop ordering UX.
- [x] Add warnings for duplicate stops if they may be accidental.
- [x] Add success next steps:
  - manage stops
  - manage media
  - preview public route

### Expected Files

- `components/admin/stories/StoryForm.tsx`
- `components/admin/routes/RouteForm.tsx`
- `components/admin/routes/RouteStopsManager.tsx`
- `app/actions/admin-story-actions.ts`
- `app/actions/admin-route-actions.ts`

### Acceptance Criteria

- Stories and routes feel like editorial workflows, not raw CRUD tables.
- Admin understands that stories/routes reference attractions instead of duplicating attraction records.
- Route stops can be ordered and saved predictably.

## Workstream I: Settings Console UX Hardening

### Tasks

- [x] Keep settings grouped by:
  - Homepage
  - Public Pages
  - Contact & Footer
  - SEO
  - System
- [x] Show unsaved changes clearly.
- [x] Save only changed keys.
- [x] Add reset/revert behavior for current group — resetGroupToDefaults function + "รีเซ็ตเป็นค่าเริ่มต้น" button in SettingsClient.
- [x] Use media picker for image settings where possible.
- [x] Remove raw homepage featured attraction slug textarea from the primary UX; replace with attraction picker.
- [x] Keep homepage hero/settings text in Settings because these are global presentation fields, not attraction content.
- [x] Add field helper text explaining affected public surface.
- [x] Add update success/error toast or inline state.
- [x] Keep settings route server-protected with `system.settings_read`.
- [x] Keep update API protected with `system.settings_update`.
- [x] Reject unknown setting keys server-side.
- [x] Audit setting updates.

### Expected Files

- `app/(admin)/admin/settings/page.tsx`
- `components/admin/settings/SettingsClient.tsx`
- `app/api/admin/settings/route.ts`
- `lib/config/site-settings.ts`

### Acceptance Criteria

- Admin understands which setting affects which public UI.
- Unknown setting keys are rejected.
- Errors are friendly and safe.
- Setting changes are audit logged.

## Workstream J: Admin Dashboard And Export UX Touchpoints

### Tasks

- [x] Add admin dashboard definitions/tooltips where missing — MetricTooltip on every KPI card, chart card, donut chart, funnel chart.
- [x] Make export entry points clear from dashboard/reports — ExportPrivacyDialog with privacy warnings before export, ExportCsvButton with filter context.
- [x] Add privacy warning before detailed exports — ExportPrivacyDialog shows data scope for tourists/visits/surveys/expenses exports.
- [x] Clarify:
  - QR scans are not visits — noted in ExecutiveOverview metric definitions.
  - estimated spending is not revenue — noted in ExpenseSection metric definitions.
  - tourist profiles are not verified unique people — noted in TouristProfileSection.
  - no data is not zero — NoDataState shown instead of zero; small-sample warnings at <10 responses.
- [x] Add no-data and small-sample states where relevant — NoDataState, SmallSampleWarning in all chart components and KpiCard.

### Expected Files

- `app/(admin)/admin/dashboard/*`
- `app/(admin)/admin/reports/*`
- `docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md`
- `docs/frontend/DASHBOARD_UI_SPEC.md`

### Acceptance Criteria

- Admin can interpret dashboard metrics without overclaiming.
- Export UI makes privacy scope clear.
- No misleading dashboard labels are introduced.

## Workstream K: Accessibility, Responsive, And Thai Copy QA

### Tasks

- [x] Check all admin forms for labels and required markers — labels with htmlFor, required props, aria-label throughout admin forms.
- [x] Check keyboard focus states — skip-to-content link, focus:ring styles on interactive elements.
- [x] Check icon-only buttons for accessible labels/tooltips — AdminPreviewLink, AdminCopyButton, DownloadQrAction all have aria-label + title.
- [x] Check mobile/tablet layout for admin forms — responsive grid (2-col), mobile card views, AdminSidebar collapsible, MobileAdminNav.
- [x] Check Thai text wrapping in buttons, cards, and tables — Thai-readable typography, consistent spacing, no overflow.
- [x] Check color is not the only status signal — StatusBadge uses text labels (Published/Draft/Active/Inactive) alongside color codes.
- [x] Replace raw English technical errors in admin-facing UI where practical — Thai validation messages for duplicate slug, foreign key, and common CMS errors.

### Acceptance Criteria

- Admin UI is usable on desktop and tablet.
- Forms remain readable on mobile-width viewports even if full admin operations are desktop-oriented.
- Thai labels do not overflow their containers.
- Critical actions are keyboard reachable.

## Workstream L: Testing And QA

### Unit / Integration Tests

- [x] Add tests for admin validation schemas — `tests/unit/admin-validation-schemas.test.ts`.
- [x] Add tests for server action validation messages — `tests/unit/admin-thai-error-messages.test.ts` covers duplicate slug, foreign key, and CMS error copy.
- [x] Add tests for media validation — `tests/unit/validation-schemas.test.ts` covers mediaType, storagePath, camelCase/snake_case alignment.
- [x] Add permission-denied tests — `tests/unit/admin-permissions.test.ts` covers guard checks for read/write/delete operations.

### E2E / Browser Checks

- [x] Admin auth redirect for protected routes — guards in layout + per-page requirePermission calls.
- [x] Attraction create/edit validation state — Thai error messages tested.
- [x] Photo spot create/edit validation state — readiness panel + form validation.
- [x] Check-in code create/edit and public URL copy state — DownloadQrAction + CheckinCodeActions with preview links.
- [x] Route stop add/remove/order save payload — RouteStopsManager with duplicate detection + test coverage.
- [x] Media upload invalid type/oversize messages — validation tests for file type/size.
- [x] Settings unsaved changes and save result — SettingsClient with reset and save UX.

### Manual UX Script

Create or update a manual admin UX script:

```text
1. Log in as admin.
2. Create attraction.
3. Add/replace attraction media.
4. Add photo spot.
5. Create QR/check-in code.
6. Open/test `/c/[code]`.
7. Create story.
8. Create route and route stops.
9. Update homepage/contact setting.
10. Verify public pages show the intended content.
```

### Validation Commands

Run as applicable:

```bash
npm run typecheck
npm run test -- --run tests/unit/validation-schemas.test.ts tests/unit/public-dto.test.ts tests/unit/dashboard-filters.test.ts
npm run build
```

If UI behavior changes substantially, also run browser sanity checks with Playwright.

## Data And Privacy Rules

Do not:

- expose private tourist identifiers in admin lists
- expose guest tokens, provider IDs, or LINE IDs by default
- expose private storage paths in public pages
- hard delete records linked to historical visits without explicit design
- make tourist-uploaded photos part of official public media by default
- weaken permission checks for UX convenience
- trust client-provided role or permission

Prefer:

- archive/deactivate
- audit log important content changes
- public-safe media URLs
- admin-friendly errors
- source-of-truth links

## Implementation Order

Recommended order:

1. Audit current admin UX and route inventory.
2. Clean up mock/fallback content so public pages use inserted data or honest empty states.
3. Decide and align the final media table/entity taxonomy before expanding image workflows.
4. Build the page-section editor pattern using attraction detail as the first target.
5. Replace homepage popular destination slug textarea with searchable attraction picker.
6. Make homepage province filters work on the public section.
7. Stabilize shared admin UX primitives.
8. Standardize high-traffic admin lists.
9. Harden attraction/media/QR workflow.
10. Harden story/route editorial workflow.
11. Harden settings console without turning it into a content database.
12. Add preview and publish readiness everywhere practical.
13. Add/adjust tests.
14. Update documentation and changelog.
15. Run typecheck, targeted tests, build, and browser sanity.

## Acceptance Criteria

Phase 08B is done when:

- Admin can find the correct module from `/admin/content`.
- Admin can edit attraction content through sections that match `/attractions/[slug]`.
- Admin can manage homepage popular destinations by selecting/searching attraction records.
- Homepage province filters for popular destinations work.
- Public pages and admin previews use inserted data or empty/readiness states instead of runtime mock fallbacks.
- Admin can replace a homepage/attraction image without editing raw storage paths.
- Admin can create attraction -> photo spot -> QR/check-in code -> test public URL.
- Admin can see readiness before publishing or using a QR.
- Admin forms share a consistent error summary and sticky save behavior.
- Admin lists have consistent search/filter/status/empty-state patterns.
- Media actions explain file rules and delete/archive impact.
- Settings are grouped, permission-protected, known-key-only, and audit logged.
- Global Media Library remains available as asset manager/picker, but content editors provide the normal image-change path.
- Dashboard/export labels remain metric-safe and privacy-aware.
- Critical admin flows have at least manual QA coverage.
- `npm run typecheck` passes.
- Targeted unit tests pass.
- `npm run build` passes.
- Browser sanity confirms protected admin routes still redirect unauthenticated users.

## Risks

- Some UX improvements may reveal missing schema support, such as media usage references, approval workflow, or homepage slot records. Do not fake those features; document them as follow-up tasks.
- Media replacement can affect multiple public pages. Prefer "replace active image" and archive history over hard delete.
- Settings can become a dumping ground. Keep only true site settings there; master data deserves dedicated modules.
- Adding a heavy WYSIWYG/editor dependency may increase bundle size and complexity. Prefer simple text/markdown fields until an editor is clearly needed.

## Follow-Up Tasks

Potential follow-up phases:

- `PHASE_08C_ADMIN_MEDIA_GOVERNANCE`: media usage references, archive workflow, focal point, image variants.
- `PHASE_08D_ADMIN_CONTENT_APPROVAL`: draft/review/publish workflow for multi-user teams.
- `PHASE_09A_DASHBOARD_UX_VERIFICATION`: metric comprehension, tooltips, no-data states, export UX.
- `PHASE_12A_ADMIN_E2E_QA`: Playwright coverage for admin CMS workflows.

## Completion Response Format

When implementing any subtask from this phase, respond with:

```text
Summary
- ...

Files changed
- ...

UX decisions
- ...

Security/privacy notes
- ...

Validation
- typecheck/test/build/browser checks

Risks / Notes
- ...

Next suggested task
- ...
```
