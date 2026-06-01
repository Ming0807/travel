# Phase 08C: Admin CMS UX Audit and Public Content Navigation

Status: Completed
Created: 2026-06-01
Baseline commit reviewed: `cec27e9 chore: checkpoint before content_media lifecycle governance audit`

## Context

This task follows the Phase 08B admin UX hardening work. The latest workspace includes additional uncommitted changes after the baseline commit, including admin content hub work, media lifecycle/archive handling, public content database wiring, content health pages, shared admin shells, and tests.

The audit result is positive overall: the project is still aligned with the goal of a practical, page-matched admin CMS. The main risk is not wrong direction. The main risk is fragmentation: content, settings, media, attraction visual editing, homepage featured placement, and content health now exist as separate entry points, but the admin needs one clear recommended path.

## Product Goal

Make admin content editing feel like editing the actual public page:

1. Admin understands which public section they are editing.
2. Admin can replace text and images without guessing where data lives.
3. Homepage featured destinations reuse attraction records instead of duplicate content.
4. Media is governed, searchable, reusable, and safely archived.
5. Public attraction pages use content-aware, localized section navigation.
6. Settings remains site-wide configuration, not a second CMS.

## Findings

### P0: Real destination pages must not show mismatched media

The public page `/attractions/pattani-old-town` currently renders a polished page, but the visible hero image appears unrelated to Pattani Old Town. Even if this is seed/demo data, it breaks trust for both tourists and admins.

Required outcome:

- Replace mismatched seed/media content with real inserted content.
- Add a content health rule that flags missing, placeholder, or suspicious stock/demo images on published pages.
- Public pages should not silently fall back to unrelated mock images.

### P1: Public section navigation is static instead of content-aware

Current public detail navigation includes:

- Overview
- Things to Do
- Food & Drink
- Travel Tips
- How to Get There
- Reviews Summary
- Recommended Articles

This information architecture is good, but the implementation should be data-driven. Some sections are rendered conditionally while the navigation always shows every item. This creates dead anchors when a section has no content.

Required outcome:

- Build section navigation from available page content.
- Show only sections that exist, or show an intentional empty state for required sections.
- Keep the admin visual editor page map in the same order as the public page.

### P1: Mobile navigation looks like an accordion but behaves like jump links

On mobile, the section list uses rows with a down chevron. This suggests the row will expand, but it actually scrolls to a section. That is a confusing affordance.

Required outcome:

- Use a real "jump to section" control, sticky compact chips, or a true accordion.
- If using an accordion, the section content must actually expand.
- Add safe bottom padding and anchor offsets so the mobile bottom nav does not cover section headings.

### P1: Desktop section tabs can clip long labels

The desktop tab row can clip labels such as "Recommended Articles" when combined with the right sidebar layout.

Required outcome:

- Avoid hidden or clipped tab text.
- Consider shorter localized labels, wrapping tabs, a sticky side index, or a compact overflow menu.

### P1: Language handling must be explicit

Public content is Thai-first, but section labels are English. This makes the page feel assembled from mixed systems.

Required outcome:

- Provide Thai and English section labels from one configuration.
- Default Thai labels:
  - ภาพรวม
  - กิจกรรม
  - อาหารและเครื่องดื่ม
  - คำแนะนำ
  - การเดินทาง
  - รีวิว
  - บทความแนะนำ
- Use English labels only when the active locale is English.
- Admin section labels should match the public labels.

### P1: Admin CMS now needs one recommended editing path

The current direction is good: content hub, visual editor, media governance, content health, settings, and list shells are all useful. But the admin experience needs a single main path so users do not wonder whether to edit content in Settings, Media, Content, or Attractions.

Required outcome:

- `/admin/content` becomes the main content command center.
- Attraction pages are edited through the attraction visual editor.
- Homepage featured destinations are selected from existing attraction records.
- Settings is reserved for site-wide configuration.
- Media Library remains useful as an asset management and audit tool, not the primary editing screen for normal content changes.

### P2: Media permission seed is incomplete

Code references `media.activate`, but seed permission data still appears to include `media.read`, `media.upload`, `media.update`, `media.deactivate`, and `media.delete` without `media.activate`.

Required outcome:

- Add `media.activate` to permission seed/migration data.
- Add or update tests for archive and unarchive permission behavior.
- Verify custom admin roles can unarchive media when intended.

### P2: Media reference endpoint should be clearer

Some admin media reference lookup currently uses a pattern like `/api/admin/media/0?storagePath=...`. It works, but it is semantically awkward.

Required outcome:

- Add a dedicated references endpoint such as `/api/admin/media/references?storagePath=...`.
- Keep the old route only as a compatibility fallback if needed.
- Update admin clients to use the dedicated endpoint.

### P2: Visual polish detector warnings remain

The impeccable detector reported low-contrast gray text on colored backgrounds in:

- `components/admin/attractions/MediaManager.tsx`
- `components/admin/settings/SettingsClient.tsx`

Required outcome:

- Replace gray-on-colored-panel text with foreground colors designed for amber/rose alert panels.
- Re-run the detector on touched UI files.

## Recommended Public Attraction Section Model

Use this as the shared source for both public page navigation and admin visual editor navigation.

| Section key | Thai label | English label | Required | Data source |
| --- | --- | --- | --- | --- |
| overview | ภาพรวม | Overview | Yes | attraction summary, description, highlights |
| things_to_do | กิจกรรม | Things to Do | No | nearby attractions, photo spots, activities |
| food_drink | อาหารและเครื่องดื่ม | Food & Drink | No | nearby restaurants, local food, related records |
| travel_tips | คำแนะนำ | Travel Tips | No | tips, best time, accessibility, safety |
| how_to_get_there | การเดินทาง | How to Get There | Yes | coordinates, address, transport notes |
| reviews | รีวิว | Reviews | No | satisfaction summaries, curated review summary |
| articles | บทความแนะนำ | Recommended Articles | No | related stories/articles/routes |

Rules:

- The page should not render a nav item if the matching section is absent.
- Required sections may render an honest empty state in admin, but public pages should avoid large empty placeholders.
- Admin readiness should be calculated per section.
- Section labels should come from one config file or helper, not duplicated across public/admin components.

## Workstreams

### A. Admin CMS Information Architecture

- Make `/admin/content` the main command center.
- Add clear cards/actions:
  - Edit attraction pages
  - Choose homepage featured destinations
  - Manage stories/articles
  - Review content health
  - Manage media library
- Add "recommended next action" states based on content health.
- Add breadcrumbs/deep links from content health issues to the exact editor section.
- Keep Settings focused on site-wide values such as branding, hero defaults, contact, SEO defaults, and system behavior.

### B. Public Attraction Navigation Redesign

- Replace static tab definitions with content-aware section configuration.
- Localize labels in Thai and English.
- Fix desktop clipping.
- Replace mobile faux accordion with a clearer jump control or true accordion.
- Add scroll-margin and bottom safe-area spacing for anchors.
- Verify `/attractions/pattani-old-town` and at least one low-content attraction.

### C. Admin Visual Editor Alignment

- Align the visual editor page map exactly with the public section config.
- Add section-level readiness badges.
- Make media slots explicit:
  - Hero image
  - Gallery images
  - Section images
  - Related article thumbnails
- Add direct "Preview public page" actions after save.
- Avoid showing editable controls for sections that are not enabled for that attraction type.

### D. Homepage Featured Destinations

- Ensure popular destinations are selected from attraction records.
- Provide search, province filters, status filters, and pagination for large future data.
- Allow ordering, pinning, and per-section visibility without duplicating attraction content.
- Add clear image source behavior: homepage card image should normally use the attraction cover media unless explicitly overridden.

### E. Media Governance Completion

- Add missing permission seed for `media.activate`.
- Create a dedicated media references endpoint.
- Confirm archive/unarchive cannot break published content without warning.
- Keep Media Library as a global asset audit and reuse surface.
- Add content usage visibility to every media asset detail.

### F. Source of Truth and Mock Cleanup

- Remove runtime mock fallbacks from public production paths.
- Keep fixtures only in tests or explicit seed/dev files.
- Add content health checks for:
  - missing cover image
  - mismatched placeholder image
  - missing Thai title
  - missing public summary
  - missing coordinates for travel section
  - unpublished records selected for homepage

### G. Settings UX Final Polish

- Reword settings sections so admins understand they are editing global behavior, not attraction content.
- Link from settings hero/home controls to `/admin/content` when the task is content placement.
- Fix remaining alert color contrast warnings.

### H. QA and Documentation

- Update admin CMS workflow docs after implementation.
- Add acceptance notes for content editor flows.
- Capture desktop and mobile screenshots for:
  - `/admin/content`
  - attraction visual editor
  - homepage featured destination picker
  - `/attractions/pattani-old-town`
- Keep screenshots in a local QA output folder and do not commit generated QA artifacts unless intentionally needed.

## Acceptance Criteria

- Admin can answer "Where do I change this public page section?" within one click from `/admin/content`.
- Admin can update the Pattani Old Town cover image without using raw storage paths.
- Homepage popular destinations are selected from existing attraction records with province filters working.
- Public attraction navigation only shows available sections.
- Public section labels match the active language.
- Mobile section navigation does not look expandable unless it expands.
- Desktop section navigation does not clip long labels.
- Published public pages do not use unrelated mock or stock fallback images.
- Media archive/unarchive permissions are seeded and tested.
- Settings no longer feels like a competing CMS.

## Validation Plan

Run:

```bash
npm run typecheck
npm test -- tests/unit/validation-schemas.test.ts tests/unit/media-archive-api.test.ts tests/unit/media-library-archive.test.tsx tests/integration/media-archive-flow.test.ts
```

Also run targeted browser QA:

```text
/attractions/pattani-old-town
/admin/content
/admin/settings
/admin/media
```

For authenticated admin pages, verify with an admin session:

- content command center
- attraction visual editor
- homepage featured destination picker
- media archive warning and references
- settings global controls

## Current Audit Evidence

- `npm run typecheck` passed.
- Targeted media, permission, section navigation, and validation tests passed: 200 tests.
- Public attraction desktop/mobile screenshots were captured locally.
- Admin content route redirects to login without an admin session, so authenticated CMS visual QA still needs a real session.
- Impeccable skill installed into `.agents/skills/impeccable` and `.github/skills/impeccable`.
- Impeccable detector reported no warnings on the touched UI files after the first implementation pass.

## Implementation Log

### 2026-06-01

- Added a shared attraction section model in `lib/content/attraction-sections.ts`.
- Reworked public attraction section navigation to be content-aware and localized.
- Replaced the mobile faux accordion with a jump selector.
- Aligned the attraction visual editor preview navigation with the shared section model.
- Replaced the decorative public location placeholder with a real coordinate card or an honest missing-coordinate state.
- Added `/api/admin/media/references?storagePath=...` for content-media used-in lookup.
- Added `media.activate` to seed permissions and created a migration for existing environments.
- Added a Content Health rule and filter for likely stock/demo media paths.
- Fixed the global anchor selector so Tailwind text color utilities work on link-styled buttons.
- Added deep links from Content Health issues to the specific visual editor sections (`#settings`, `#gallery`/`#cover`, `#content`).
- Updated `AttractionVisualEditor` and `StoryVisualEditor` to parse `#hash` from the URL on mount and open the respective drawer.
- Fixed alert color contrast in `MediaManager.tsx` and `SettingsClient.tsx` by using `text-amber-900`.
- Added a direct link from Homepage settings to the `/admin/content` hub.
- Added a link to the Content Health dashboard from the `/admin/content` hub.
- Updated `ADMIN_CONTENT_CMS_WORKFLOW.md` baseline to reflect these changes.
-  
 F i x e d  
 N a N   v a l i d a t i o n  
 e r r o r  
 i n  
 A c c o m m o d a t i o n F o r m   w h e n  
 a  
 n e w  
 i m a g e  
 i s  
 s e l e c t e d  
 f r o m  
 t h e  
 M e d i a  
 L i b r a r y .  
 U p d a t e d  
 A c c o m m o d a t i o n F o r m   t o  
 p a s s  
 t h e  
 i m a g e  
 s t o r a g e  
 p a t h  
 v i a  
 c o v e r M e d i a U r l   a n d  
 m o d i f i e d  
 t h e  
 s e r v e r  
 a c t i o n  
 t o  
 s e c u r e l y  
 l o o k  
 u p  
 o r  
 i n s e r t  
 t h e  
 c o n t e n t _ m e d i a   r e c o r d  
 v i a  
 l i n k M e d i a T o E n t i t y B y S t o r a g e P a t h .  
 