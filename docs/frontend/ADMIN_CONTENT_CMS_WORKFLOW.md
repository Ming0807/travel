# Admin Content CMS Workflow

## Purpose

This document defines the admin CMS workflow for managing the content that appears on the public website, QR landing pages, attraction details, stories, routes, and homepage highlight sections.

## Current Homepage Contract

The redesigned homepage reuses published CMS records instead of maintaining duplicate card content:

- Featured attractions provide card text, cover image, category, rating, review count, and map coordinates.
- Featured routes provide the recommended route list and retain the order selected in Settings.
- Published stories provide the editorial section; unpublished or missing records are never replaced with mock stories.
- Hero and section-level presentation text remain Settings-owned metadata.
- Statistics retain their existing analytics definitions and are labelled as recorded system data, not website traffic or real-time data.
- The old newsletter-looking CTA is retired because no subscription backend exists. The final CTA links to the working Digital Passport and leaderboard flows.
- The previous testimonial highlight section is not rendered on the homepage until it has a dedicated, verifiable content source.

For the Yala pilot, remove references to Pattani and Narathiwat from public presentation settings. The components also guard stale multi-province hero copy, but Settings should still be corrected at the source.

The goal is simple:

```text
An admin should know where content comes from, how to change it, how to preview it, and how to publish it safely.
```

This workflow supports these core project dimensions:

- Attractions Visited
- Travel Behavior
- Satisfaction
- Sustainable Tourism Planning
- Public Content Quality

## Mental Model

Admins should not need to think in database tables first. The UI should explain the system as connected content objects.

```text
Attraction = source of truth
Media = reusable image/video asset
Story = editorial content linked to attractions or provinces
Route = curated travel path linked to attractions
Photo Spot = check-in/certificate point linked to one attraction
QR Code = public entry point linked to attraction and optional photo spot
Homepage Slot = selection of existing published content
```

## P2 Story Platform Direction

The approved P2 direction expands Story into a shared content platform with separate workflows:

```text
Editorial article  draft -> review -> approval -> scheduled/published -> archived
Traveler story     submitted -> moderation -> approved/rejected -> published -> archived
```

Both workflows share Media Library, taxonomy, search, public rendering, and recommendation infrastructure. They must remain separate queues in admin UX.

The editor will use hybrid structured content: TipTap JSON is the canonical editable document and sanitized HTML remains available for rendering and compatibility with existing stories. Public recommendations begin with curated relationships and deterministic relevance scoring. They must not be labeled AI.

Recommendation behavior is deliberately explainable:

- active editorial relationships appear first and may carry a short Thai reason;
- automatic candidates are limited to records that are publicly published and have managed cover media;
- province, shared destination, overlapping tags, primary topic, freshness, and content readiness contribute separate internal score components;
- engagement contributes only after the configured minimum sample is reached, so early traffic cannot distort ordering;
- diversity prevents one province or topic from filling every recommendation slot when alternatives exist;
- public cards show one Thai explanation, never the score or an AI claim;
- story create, edit, publish, unpublish, taxonomy, and cover changes invalidate Story and Attraction public surfaces.

See:

- `docs/superpowers/specs/2026-07-16-story-cms-recommendation-dashboard-design.md`
- `tasks/PHASE_16A_STORY_CMS_RECOMMENDATION_DASHBOARD_UX.md`

Important rule:

```text
Do not duplicate attraction names, descriptions, or images inside homepage cards.
Homepage and featured sections should reference existing attraction, story, route, or media records.
```

## Source Of Truth: No Runtime Mock Fallback

The admin CMS must be reviewed against real inserted database records, not runtime mock data.

The correct rule is:

```text
Public content comes from database records and approved media.
Development demo content comes from seed data.
Missing data shows an empty state, readiness warning, or notFound.
```

Do not let public repositories silently replace missing content with mock attractions, mock stories, or stock images. This creates a false preview and makes admins unsure which CMS field controls the public page.

Current cleanup targets:

| Area | Required change |
|---|---|
| Root HTML mockups | Removed from the active app surface |
| Homepage attraction fixtures | Stop using as public fallback; use inserted attractions |
| Attraction detail mock | Return `null` for missing/unpublished records instead of mock detail data |
| Story fixtures | Return an empty list when no published stories exist |
| Admin visual editors | Show saved content or clear missing-content placeholders, not unrelated stock content |
| Repository debug logs | Remove after DB-backed rendering is verified |

Root-level design files should not sit next to runtime app files once the CMS is being validated. Historical design references should live only in documentation or a clearly named archive.

Implemented baseline:

- `/admin/content` now acts as the CMS command center with workflow cards, quick-create links, and a source-of-truth map.
- Public attraction, story, restaurant, route, and homepage content paths now use database records or honest empty states instead of runtime fixture fallback content.
- Public story detail pages render saved story `content` from `travel_stories` and no longer generate mock article body sections.
- Homepage featured attractions use selected attraction records and cover media readiness instead of copied homepage card data.
- Homepage featured attraction settings are managed through a searchable attraction picker with province filters and readiness counts instead of a raw slug textarea.
- Public homepage popular-destination province tabs filter the displayed selected attraction records in place and show an empty state when a province has no featured items.
- Settings supports direct group links such as `/admin/settings?tab=homepage` so the Content Hub can send admins to the correct surface.
- Story and route admin forms show public-page readiness panels and preview links after records are saved.
- Story administration now separates team-authored articles at `/admin/stories` from traveler submissions at `/admin/stories/submissions`, while sharing URL-backed filters, pagination, taxonomy, and export behavior.
- Story list actions open the editor or media workflow and no longer expose a quick-publish control that bypasses the editorial state machine.
- The editorial story content drawer now writes canonical TipTap JSON and compatible HTML through the atomic editorial action, creates an immutable revision on each successful save, detects optimistic-lock conflicts, and keeps a browser-local recovery draft without presenting it as a server save.
- Unsaved story content is protected when admins use Cancel, the drawer close button, backdrop click, Escape, or browser navigation. Legacy HTML stories are normalized into structured content only after an explicit edit and save.
- Story header and metadata drawers save only their own changed fields through the same atomic editorial action. The editor shares the newest optimistic version across drawers so sequential saves do not create false conflicts.
- Story metadata uses controlled topics instead of a free-text category for recommendation/search signals, and includes geography, primary language, SEO, and scheduling intent.
- Story status changes use the domain workflow actions rather than a direct status dropdown. Server-side readiness and permission checks remain authoritative.
- The editor sidebar derives a Thai publish-readiness checklist and document outline from saved structured content, and shows revision history only when the current admin has `story.revision_read`.
- Inline story images are selected from Media Library, require accessible alt text, and store the media asset UUID plus normalized storage path instead of an external URL. Canonical document version 2 supports this managed reference while version 1 numeric media references remain readable during migration.
- The public Story Hub uses URL-backed server filters and 12-item pagination for search, province, topic, and author type. Story detail prefers canonical structured content, generates a table of contents, preserves image dimensions and captions, and falls back to the legacy sanitized HTML path only when structured content is unavailable.
- Public Story metadata includes canonical, Open Graph, Twitter, and Article JSON-LD fields. Legacy external cover URLs are intentionally excluded from public DTOs so editors must replace stock or unmanaged images through Media Library.
- Main CMS image surfaces use saved media paths or missing-image states instead of Unsplash fallback images.
- Public attraction detail sections now use a shared, content-aware section model so public navigation and the attraction visual editor use the same order and localized labels.
- Public attraction mobile section navigation uses a jump selector instead of rows that look expandable but only scroll.
- Content Health now flags official content that still uses likely stock/demo media paths so admins can replace public images with verified assets.
- Content Health issues now contain deep links that navigate directly to the specific visual editor section (e.g., `#gallery` or `#settings`) to fix the exact problem.
- Media used-in lookup has a dedicated `/api/admin/media/references?storagePath=...` endpoint for content-media workflows.
- Root-level HTML prototype/mockup files were removed from the active app surface.
- Settings UI correctly guides admins back to the Content Hub when attempting to modify specific attraction records.

## Recommended CMS Direction

Use public-page-matched editors for content-heavy pages.

The admin editor should follow the same section order that the visitor sees on the public page. For example, the attraction editor should map to `/attractions/[slug]`:

| Public attraction section | Admin editor section | Notes |
|---|---|---|
| Header/title/province | Identity & publishing | Name, slug, province, status |
| Gallery | Cover & gallery media | Cover image, gallery ordering, alt text |
| Overview | Overview content | Short and long description |
| Things to Do | Activities | Planned structured content if schema is missing |
| Where to Stay | Related stays | Planned related-content module |
| Food & Drink | Nearby restaurants | Restaurant relationship data |
| Tips | Travel tips | Planned structured content if schema is missing |
| How to Get There | Location & access | Address, opening hours, coordinates, contact |
| Reviews | Reviews | Review moderation module |
| Articles | Related stories | Story relationship data, planned if schema is missing |
| CTA / QR entry | QR and certificate context | Photo spots and check-in codes |

Recommended layout:

```text
Left: page section navigator
Center: edit fields for selected section
Right: public preview and readiness
```

This helps admins understand exactly what part of the public page they are editing.

## Content Map

| Public surface | Admin owner | Main source | Admin path |
|---|---|---|---|
| Homepage popular destinations | Content editor | Published attractions and cover media | `/admin/content`, `/admin/attractions`, `/admin/media` |
| Attraction detail page | Attraction editor | Attraction record and media gallery | `/admin/attractions/[attractionId]/edit` |
| Attraction gallery | Media editor | Media assets linked to attraction | `/admin/media` or attraction media section |
| Travel stories | Content editor | Story records, story media, related attractions | `/admin/stories` |
| Suggested routes | Route editor | Route records and ordered route stops | `/admin/routes` |
| QR landing page | Operations admin | Attraction, photo spot, check-in code | `/admin/photo-spots`, `/admin/checkin-codes` |
| Certificate context | Operations admin | Visit, attraction, photo spot, certificate template | Certificate/admin modules |

## Scenario: Change Popular Destination Image

When an admin wants to update the image for a popular destination on the homepage:

1. Open `/admin/content`.
2. Choose Homepage sections or Popular Destinations.
3. Search and select the attraction that appears in the homepage section.
4. Open the attraction cover/gallery editor from that selected card.
5. Upload or choose an approved image.
6. Add required metadata:
   - alt text
   - caption
   - credit or source
   - license or usage note
   - linked attraction
7. Set the image role, such as cover or homepage-ready gallery image.
8. Preview the homepage card and attraction detail page.
9. Save as draft if review is needed, or publish if the user has permission.

Recommended UX:

- Show where the image is currently used.
- Warn before replacing an image used by homepage, stories, or attraction pages.
- Allow replacing the public image without deleting the old asset.
- Keep historical media records for audit and rollback.
- Do not require admins to type slugs or storage paths for normal image replacement.

## Scenario: Choose Homepage Popular Destinations

The homepage popular destinations section should select attraction records, not copy content into settings.

Recommended workflow:

1. Open `/admin/content`.
2. Choose Homepage sections.
3. Open Popular Destinations.
4. Search attractions by Thai/English name.
5. Filter by province:
   - ทั้งหมด
   - ยะลา
   - ปัตตานี
   - นราธิวาส
6. Filter by readiness:
   - published
   - active
   - has cover image
   - has QR/photo spot if needed
7. Add selected attractions to the homepage list.
8. Reorder selected cards.
9. Preview the homepage section.
10. Save.

Rules:

- The card title, province, slug, and cover image come from the attraction record.
- Homepage settings may control the section title, subtitle, display count, and fallback behavior.
- The selection UI should not be a raw textarea of slugs.
- When there are many attractions, search and filters are required.
- Public province tabs in the homepage popular destinations section must actually filter the displayed cards.

Implementation warning:

- The picker must query real attraction schema fields such as `attraction_id`, `slug`, `name_th`, `name_en`, `is_published`, `is_active`, and `provinces(province_name_th, province_name_en)`.
- Cover readiness should come from the final media source `content_media`.
- Do not add a `cover_image_path` shortcut to attractions only to make the picker easier. That would duplicate image ownership and confuse the CMS.
- If no matching attraction exists, show "no results" instead of adding demo cards.

## Scenario: Edit Attraction Detail Content

When an admin wants to edit text and images inside an attraction page:

1. Open `/admin/content`.
2. Choose attraction content management.
3. Open `/admin/attractions`.
4. Search by name, province, district, type, or status.
5. Open the attraction edit page.
6. Edit structured sections:
   - basic information
   - location
   - short description
   - long description
   - history
   - opening hours
   - media
   - publishing status
7. Preview the public attraction page.
8. Save draft or publish.

Publishing should show readiness warnings when key content is missing:

- no cover image
- missing Thai or English title
- missing province or district
- no active check-in code when the attraction is intended for QR flow
- missing alt text on public images

## Scenario: Create Or Edit A Story

Stories are editorial content. They should not replace the attraction record.

Recommended workflow:

1. Create a story in `/admin/stories`.
2. Choose story type, province, and related attractions.
3. Write title, summary, and body content.
4. Attach a hero image from the media library.
5. Add gallery images if needed.
6. Preview mobile and desktop layouts.
7. Publish when content, image rights, and links are ready.

Story UX should make related content visible:

- related attraction cards
- route links
- public preview URL
- SEO title and description
- publish status
- last updated by

## Scenario: Create Or Edit A Travel Route

Routes are curated sequences of attractions.

Recommended workflow:

1. Create a route in `/admin/routes`.
2. Add route name, summary, province scope, duration, and travel theme.
3. Add ordered route stops from existing attractions.
4. Set optional notes for each stop.
5. Add route cover image or select one from a stop attraction.
6. Preview the public route page.
7. Publish.

Routes should not create duplicate attraction records. Every route stop should reference an existing attraction.

## Scenario: Manage QR And Photo Spot Content

QR content should be operational and reliable.

Recommended workflow:

1. Create or edit the attraction first.
2. Create photo spots linked to that attraction.
3. Create one check-in code per QR point.
4. Preview `/c/[checkinCode]`.
5. Confirm the QR landing page shows the right attraction, photo spot, image, and certificate context.

Do not create separate QR codes for LINE users, foreign tourists, or guest users. The same QR should detect context after opening.

## Media Management Standards

A production CMS should treat images as reusable assets, not random uploads.

Decision:

```text
Keep the global Media Library, but make it a supporting asset manager and picker.
Do not make it the only place admins must visit to change public images.
```

Normal image workflows should start from the content being edited:

| Admin task | Primary path | Media Library role |
|---|---|---|
| Change attraction cover | Attraction editor -> Gallery | Pick/upload asset |
| Change story hero | Story editor -> Hero image | Pick/upload asset |
| Change route cover | Route editor -> Cover image | Pick/upload asset |
| Change homepage hero | Settings -> Homepage hero | Pick/upload asset |
| Change popular destination card | Homepage section -> selected attraction -> cover media | Asset metadata/usage |

Required media metadata:

| Field | Purpose | Admin Status |
|---|---|---|
| file | Original uploaded asset | ✅ Stored |
| mime type | Validate allowed formats | ✅ Stored |
| file size | Prevent heavy public pages | ✅ Stored |
| width and height | Generate responsive variants | ❌ Not captured — planned |
| alt text | Accessibility and SEO | ✅ Required before publish |
| caption | Public context when needed | ✅ Optional field |
| credit | Attribution and governance | ⚠️ Not enforced |
| license or usage note | Legal usage clarity | ⚠️ Not enforced |
| linked entity | Attraction, story, route, or province | ✅ Stored as `entity_type` + `entity_id` |
| role | Cover, gallery, hero, thumbnail, QR landing | ✅ `is_cover` boolean; other roles not yet distinguished |
| status | Draft, approved, published, archived | ✅ `is_active` + `lifecycle_status` |
| uploaded by | Audit trail | ✅ Via `logAdminMutation()` |
| updated at | Content freshness | ✅ `updated_at` timestamp |

Allowed public image types:

```text
image/jpeg
image/png
image/webp
```

Recommended generated variants:

| Variant | Use | Admin Status | Tourist Status |
|---|---|---|---|
| thumbnail | Admin tables and media picker | ❌ Future — migration pending | ❌ Not applicable |
| card | Homepage and listing cards | ❌ Future — not yet planned | ❌ Not applicable |
| hero | Attraction/story hero sections | ❌ Future — not yet planned | ❌ Not applicable |
| gallery | Detail image gallery | ❌ Future — not yet planned | ❌ Not applicable |
| og | Social sharing image | ❌ Future — not yet planned | ❌ Not applicable |

> **Current reality**: Admin upload stores raw files as-is. No thumbnail, no WebP conversion, no responsive variants.
> **Tourist upload**: Already uses sharp to resize + WebP convert (`app/actions/photo-actions.ts`).
> **Next step**: Admin media optimization (WebP conversion + thumbnail only) is planned as a migration — see `docs/backend/STORAGE_FILE_UPLOADS.md §12.3`.

Image UX recommendations:

- Use drag and drop upload plus a normal file picker.
- Show upload progress and validation errors.
- Generate the storage path automatically after upload; do not ask admins to type storage paths for uploaded files.
- Use friendly media type options such as image, panorama, video 360, embed, and external URL, then show only the fields needed for that type.
- Keep global media library actions in plain language: supported formats, max file size, delete impact, and retry guidance must be visible before or during the action.
- Require alt text before publishing public images.
- Show focal point controls instead of forcing every image into one crop.
- Use thumbnails in admin lists.
- Show "used in" references before archive or replacement.
- Archive media instead of hard deleting when it has public usage or historical records.
- Keep tourist-uploaded photos separate from official public content media.

## CRUD UX Pattern

Each content module should follow the same admin pattern.

List pages should include:

- search
- filters
- pagination
- sort
- thumbnail or status preview
- status labels
- last updated timestamp
- row actions

Create pages should include:

- clear required fields
- guided sections
- a top error summary that maps technical field names to admin-friendly labels
- a readiness panel for connected content such as QR codes, route stops, and publishable records
- save draft
- save and preview
- publish only when permission and readiness pass

Edit pages should use tabs or sections:

```text
Overview
Content
Media
Publishing
Connections
Audit
```

For public content editors, prefer public-page sections over generic CRUD tabs.

Example:

```text
Attraction editor sections:
Header
Gallery
Overview
Activities
Location
Nearby food/stays
Reviews
Related stories
QR / Certificate CTA
Publishing
```

Record actions should include:

- preview public page
- duplicate only when appropriate
- publish or unpublish
- archive instead of hard delete
- view audit history

Current implementation pattern:

- shared form primitives live in `components/admin/forms/AdminFormUX.tsx`
- check-in code forms show QR readiness and `/c/[code]` preview before save
- check-in code forms and lists support opening the public QR landing and downloading a printable QR image from the admin UI
- QR readiness warns when the linked attraction is inactive or unpublished so staff do not print a code for an unavailable public page
- check-in code creation can receive `attraction_id` and `photo_spot_id` from upstream attraction/photo spot actions so admins do not re-select context after saving a related record
- photo spot forms explain the operational chain from Photo Spot -> Check-in Code -> QR Landing -> Certificate Context and show next actions after save
- route stop management shows the normalized day/order sequence before save
- attraction, photo spot, route, story, and restaurant forms share the same error summary and save bar behavior
- attraction edit uses a visual page-matched editor with a public page map for Header, Gallery, Overview, Location, QR flow, Related content, and Publish readiness
- attraction section forms include helper text for slug, province, district, sustainability category, and visitor capacity so admins understand data-quality impact before publishing
- the attraction visual editor provides direct actions for public URL preview, media management, and QR/check-in code management from the editor toolbar
- the global Media Library is framed as an official asset manager and picker with search, drag/drop upload, file-rule copy, and clear separation from tourist uploads and generated certificate files
- content media managers show cover, active, and missing-alt readiness so public images can be checked from the content editor before publishing
- story and route forms show saved-record readiness panels so admins can see which public page fields are ready before publishing
- route public pages use `/routes/[slug]`; the admin route form now edits `slug`, validates duplicates, and can show a saved-record public preview link

## Settings UX Pattern

Settings should be a grouped console, not one long technical form.

Recommended groups:

```text
Homepage
Public Pages
Contact & Footer
SEO
System
```

Rules:

- Load current values before editing.
- Save only changed setting keys.
- Use media picker controls for images instead of raw URL-only fields where possible.
- Keep feature toggles separate from content text.
- Protect the page with `system.settings_read`.
- Protect updates with `system.settings_update`.
- Audit setting changes.
- Avoid arbitrary setting keys from the client.

## Permissions

Recommended permission split:

| Permission | Capability |
|---|---|
| `attraction.read` | View attraction records |
| `attraction.write` | Create and edit attraction content |
| `media.read` | View media library |
| `media.write` | Upload and edit media metadata |
| `story.read` | View stories |
| `story.write` | Create and edit stories |
| `route.read` | View routes |
| `route.write` | Create and edit routes |
| `content.publish` | Publish public-facing content |
| `audit.read` | View content change history |

Frontend visibility is only convenience. Server actions and route handlers must enforce permissions.

## Development Team Plan

Recommended team lanes:

| Lane | Responsibility |
|---|---|
| Product and content ops | Define content workflow, required fields, publishing policy, editorial ownership |
| UX/UI | Design Content Hub, media picker, preview, publish readiness, mobile admin behavior |
| Frontend admin CMS | Build list/form/media/preview UI in Next.js with TypeScript |
| Backend/API | Implement server actions or route handlers, validation, permissions, audit logs |
| Database/storage | Model media relationships, homepage slots, indexes, storage policies, responsive variants |
| QA/content review | Test CRUD, permissions, image validation, preview, publishing, rollback |

## MVP Acceptance Criteria

The CMS workflow is acceptable when:

- Admin can understand where to update homepage popular destination images.
- Admin can replace an attraction cover image without touching unrelated data.
- Admin can preview public pages before publishing.
- Public content references source records instead of duplicated homepage text.
- Image metadata and alt text are required for published official content.
- Admin lists are searchable, filterable, and paginated.
- Publish/unpublish/archive actions are permission-protected.
- Important content changes are audit logged or explicitly planned.

## Recent Defenses (June 2026)

Security hardening applied to all tourist-submitted content:

- **XSS protection**: Tourist story submissions are normalized to plain text via `normalizePlainText()` in `app/actions/tourist-story-actions.ts`. The pipeline decodes all HTML entity variants (named, decimal, hex, double-encoded) before stripping tags. Stored content is pure plain text. Review comments are rendered as React text nodes (not `dangerouslySetInnerHTML`).
- **Rendering guards**: Public story detail page and admin story editor now check `authorType !== "tourist"` before using `dangerouslySetInnerHTML`. Tourist content always renders as safe paragraphs.
- **Strict validation**: Province IDs are validated with `/^\d+$/` (rejecting floats, hex, exponents, junk). Province existence is verified via DB before story insertion.
- **OAuth identity**: `resolveTouristId()` in `lib/auth/guards.ts` supports Google, email, and LINE OAuth sessions, falling back to anonymous_device guest cookies. No identity creation/linking in story submission — only resolve.

These defenses apply to all admin CMS content operations where tourist-submitted data is displayed or stored.

## Implementation Note

`/admin/content` is the recommended command center for content operations. It should guide admins to the correct module instead of forcing them to guess whether a change belongs in attractions, media, stories, routes, photo spots, or QR codes.

When linking from the Content Hub into Settings, prefer group-specific URLs such as `/admin/settings?tab=homepage` so admins land on the relevant editor instead of scanning the full settings console.
