# CHANGELOG.md

All notable changes to the **Southern Border Tourism Data & Intelligence Platform** should be documented in this file.

This project follows a practical changelog style based on:

```text
Added
Changed
Fixed
Removed
Security
Performance
Documentation
Migration
Known Issues
```

The changelog must stay accurate. Do not claim a feature is implemented if it is only planned.

---

## Changelog Rules

When updating this file:

```text
Use clear dates.
Group changes by release/version.
Mention user-visible changes.
Mention database migrations.
Mention security/privacy changes.
Mention dashboard metric definition changes.
Mention export behavior changes.
Mention breaking changes.
Mention known issues honestly.
```

Do not include:

```text
secrets
tokens
private keys
real tourist data
real LINE user IDs
real emails/phone numbers
private file paths
raw production errors with sensitive data
```

---

## Version Format

Recommended:

```text
[0.1.0] - YYYY-MM-DD
```

For unreleased work:

```text
[Unreleased]
```

---

## Categories

Use these categories where relevant.

```text
Added
Changed
Fixed
Removed
Security
Performance
Documentation
Migration
Known Issues
```

---

## [Unreleased]

### Added

- Added RouteVisualEditor (`components/admin/routes/visual-editor/RouteVisualEditor.tsx`) — a page-matched visual editor for routes mirroring the public `/routes/[slug]` layout. Uses EditableBlock + Drawer pattern with hero/cover, overview, itinerary preview, and route info sections.
- Added route SectionForms (`components/admin/routes/visual-editor/SectionForms.tsx`) — header, content, settings, and cover image forms with MediaPickerModal integration and readiness indicators.
- Added 3 new admin unit test files: `admin-validation-schemas.test.ts` (60 tests covering 8 entity type schemas), `admin-permissions.test.ts` (18 tests covering hasPermission, ALL_PERMISSION_KEYS, isSiteSettingKey), and `admin-thai-error-messages.test.ts` (16 tests covering Thai-friendly validation message patterns).
- Added Playwright E2E test `admin-auth-redirect.spec.ts` (8 scenarios covering unauthorized redirect for 7 protected admin routes + public page exemption).
- Added manual admin UX test script `docs/testing/MANUAL_ADMIN_UX_TEST_SCRIPT.md` covering 12 comprehensive test categories with pass/fail tracking.
- Added audit log UX hardening to `AuditListClient.tsx` — action filter dropdown (13 prefixes), entity type dropdown (17 types), result status column with color-coded badges (success/failed/denied), mobile-first card layout, and active filter badges with inline removal.
- Added "Used-in" impact references workflow for Media Library — when clicking "Archive" on a media asset, the system now fetches content entity references (attraction, story, route, restaurant, etc.) via `GET /api/admin/media/[id]` **before** showing the confirmation dialog, so admins can see where the asset is used before deciding to archive.
- Added dedicated `GET` handler to `/api/admin/media/[id]` that returns used-in content references for a media asset without archiving it.
- Added media picker integration (MediaPickerModal) for story hero image and restaurant cover image in visual editors, reducing reliance on raw URL/path inputs.
- Added reusable ErrorBoundary component with graceful fallback UI, retry action, and dev detail mode, applied to `/admin/media` and `/admin/dashboard`.
- Added Playwright E2E test for Media Library archive/unarchive flow with API route interception, archived state verification, and error handling (3 scenarios).
- Added accessibility improvements to MediaLibrary: `aria-label`, `role="radiogroup"`, `aria-checked`, `aria-pressed`, keyboard navigation, focus trap on dialogs, and `loading="lazy"` on images.
- Added accessibility improvements to MediaManager: `aria-describedby` on select elements, `<fieldset>`+`<legend>` for checkbox groups.
- Added accessibility improvements to ConfirmDialog: `aria-labelledby` and `aria-describedby` linking to heading and message content with focus trap.
- Added load-testing scenarios for media upload/archive/list, settings update, and export API routes in `load-testing/load-test.js`.
- Added `/admin/content` as a workflow-first Content Hub for managing homepage content, attraction content, media, stories, routes, photo spots, and QR dependencies.
- Added admin CMS workflow documentation for popular destination images, attraction pages, stories, routes, media standards, CRUD UX, permissions, and development team lanes.
- Added a workflow-based Settings Console with grouped Homepage, Public Pages, Contact & Footer, SEO, and System settings.
- Added shared admin form UX primitives for guided CMS sections, top error summaries, readiness panels, help panels, and sticky save bars.
- Added QR/check-in form readiness guidance with public `/c/[code]` preview and copy action.
- Added printable QR download actions and public QR test links to check-in code admin screens.
- Added warnings when check-in codes point to inactive or unpublished attraction records.
- Added photo spot operational guidance and success next steps that carry attraction/photo spot context into QR check-in creation.
- Added route stop management guidance that previews normalized day/order sequencing before save.
- Added admin media validation tests for camelCase and legacy snake_case payloads.
- Added Phase 08B admin UX hardening task plan for CMS workflow clarity, media governance, QR operations, settings, readiness, accessibility, and QA.
- Expanded Phase 08B planning with page-matched CMS editors, homepage popular-destination attraction picker, working province filters, and Media Library role clarification.
- Added a CMS command-center version of `/admin/content` with workflow cards, quick-create links, and source-of-truth guidance for homepage, attractions, stories, routes, media, and QR work.
- Added a public-page map to the attraction visual editor so admins can see Header, Gallery, Overview, Location, QR flow, Related content, and Publish readiness before changing a section.
- Added a draft-first attraction quick-create guide that explains the next CMS steps before publishing.
- Added attraction editor helper text and district selection for slug, province/district, sustainability, and visitor-capacity data quality.
- Added Media Library search, drag-and-drop upload, file-rule guidance, asset readiness badges, and delete-impact confirmation for official public content assets.
- Added content media readiness summaries for cover images, active media, and missing alt text inside the content media manager.
- Added public-page readiness panels and preview entry points for story and route admin forms.
- Added project documentation guardrails for Codex, Copilot, pull requests, issues, prompts, and skills.
- Added contribution workflow guidance for production-oriented development.
- Added changelog structure for future release tracking.
- Added Phase 01 Next.js App Router project foundation with TypeScript, Tailwind CSS, Supabase client boundaries, route shells, homepage shell, and basic test configuration.
- Added Phase 09 MVP dashboard analytics foundation with protected `/admin/dashboard`, server-side filter validation, dashboard service/repository aggregation, KPI cards, profile/behavior/expense/satisfaction/funnel sections, sustainable tourism insight cards, and dashboard metric unit tests.
- Added Phase 08 admin backoffice documentation alignment for Next.js fullstack admin pages, server-side authorization guards, attraction CMS, photo spot CMS, check-in code CMS, read-only visits, read-only surveys, audit logging, and privacy-safe admin tables.
- Added Phase 11 optional LINE LIFF linking foundation with browser LIFF helper, optional linking UI, server-side LINE token verification routes, current guest profile linking, and LINE validation tests.
- Added Cloudinary-first private file storage adapter for development/Vercel deployment with Supabase Storage fallback and future university-storage placeholders.
- Added Supabase local project configuration for migration and seed validation.
- Added Phase 04A and Phase 08A task files for database-backed public content and admin CRUD expansion.

### Changed

- Wrapped 3 additional batch delete+insert patterns in atomic PostgreSQL RPC transactions: `sync_admin_user_roles()`, `sync_role_permissions()`, and `sync_attraction_related_content()` — prevents data loss if the insert step fails after the delete step commits.
- Refactored `updateAdminUser` in `admin-user.repository.ts` to call `sync_admin_user_roles` RPC instead of separate delete + insert.
- Refactored `updateRole` in `role.repository.ts` to call `sync_role_permissions` RPC instead of separate delete + insert.
- Refactored `updateAdminAttractionRelatedContent` in `admin-attraction.repository.ts` to call `sync_attraction_related_content` RPC instead of separate delete + insert. Removed now-unused `table` and `idColumn` variables.

- Extended DashboardShell data-source banner to explicitly clarify all four key dashboard metrics: QR scans are tracked separately from visits, tourist profiles are system profiles (not verified unique people), estimated spending is self-reported range data (not revenue), and missing values display as "No data" (not zero).
- Enhanced ExportCsvButton with a privacy confirmation dialog for detailed exports (tourists, visits, surveys) that explains what data is included, what is never included (PII), and important limitations before allowing download. Summary export still downloads directly.
- Integrated small-sample warning banners into TouristProfileSection, TravelBehaviorSection, ExpenseSection, and SatisfactionSection when response counts are below 10 — preventing over-interpretation of low-volume data.
- Wrapped route stops save in a proper PostgreSQL transaction via new RPC function `update_route_stops()` — deletes old stops and inserts new stops atomically so data is never lost if the insert fails.
- Created reusable `ListPageShell` component that standardizes the admin list page layout (header, create button, filters, empty state, pagination) and refactored 12 admin list pages to use it: attractions, stories, routes, restaurants, photo-spots, checkin-codes, visits, surveys, badges, messages, users, and roles.
- Added `headerActions` and `hideCreateButton` optional props to `ListPageShell` for read-only pages (visits, surveys, messages) that need export buttons or no create button.
- Standardized create button color across all admin list pages from mixed orange/teal to teal (`#0A6B62`) for visual consistency.
- Standardized empty state behavior across all admin list pages — all now include a create action button when no items are found.
- Refactored admin content media management so uploaded images generate storage paths automatically and URL/embed fields are shown only for media types that need them.
- Refactored attraction, photo spot, route, story, restaurant, check-in code, and route stop admin forms toward a shared, easier CMS form pattern.
- Refined admin media library copy, upload/delete messaging, category controls, and empty states for image management.
- Restricted admin settings updates to known setting keys and added audit logging for setting changes.
- Defined the CMS source-of-truth rule that public pages and admin visual previews must use inserted database records or honest empty/readiness states, not runtime mock fallbacks.
- Updated public attraction, story, restaurant, route, and homepage content surfaces to use saved database content, saved media paths, or clear empty states instead of runtime mock/stock fallback content.
- Updated public story detail pages to render saved `travel_stories.content` instead of generated placeholder article sections.
- Updated homepage popular-destination settings to use a searchable attraction picker with province filters, selected-card ordering, and missing image/publish readiness indicators.
- Updated the public homepage popular-destinations section so province tabs filter the displayed featured attractions in place and show an empty state when a province has no selected items.
- Updated Settings to support direct group links such as `/admin/settings?tab=homepage` from the CMS command center.
- Updated route admin CRUD to edit and validate stable public route slugs for `/routes/[slug]` preview links.
- Updated the attraction visual editor toolbar with direct public URL, media manager, and QR/check-in management actions.
- Updated tourist photo upload and certificate generation routes to use the server-side storage adapter instead of direct Supabase Storage calls.
- Updated database documentation for travel stories, official tourism stats, official attraction references, and data import logs.
- Connected homepage attraction and story sections to the public content repository with safe fallback.

### Changed

- Replaced raw English error messages in admin server actions (roles, users, certificate templates, content, reviews) with actionable Thai copy for better admin UX.

### Fixed

- Fixed React 19 `useActionState` stale-closure bug in all admin form actions — added missing `_prevState` parameter to `createStoryAction`, `updateStoryAction`, `createRestaurantAction`, `updateRestaurantAction`, `createRouteAction`, `updateRouteAction`, and `updateRouteStopsAction` (route actions already fixed via earlier route-stops debugging). This was causing `formData.get is not a function` errors across all admin CRUD forms using `.bind()` + `useActionState`.
- Fixed `ADMIN_MEDIA_CREATE_FAILED` error on `/admin/routes/[id]/media` (and other entity media pages) by refactoring `toPayload()` to dynamically insert only the matching entity column — avoids sending `accommodation_id: null` to remote Supabase where the column doesn't exist (migration `20260528001000` not applied).
- Enabled detailed Supabase error logging in all `admin-media.repository.ts` functions (create, list, read, update, archive, delete) to log `error.message`, `error.details`, `error.hint`, `error.code` before throwing.
- Fixed Turbopack crash on Windows by removing conflicting `tailwind.config.ts` (Tailwind v3 style) alongside Tailwind v4 CSS `@theme` config, and removing `experimental.turbo`/`turbo` from `next.config.ts` (Next.js 16 incompatible).
- Fixed missing `useState` and `MediaPickerModal` imports in restaurant visual editor `SettingsForm` that caused 4 TypeScript errors.
- Removed unused dead-code variable `duplicate` in `RouteStopsManager` that was declared but never consumed.
- Fixed admin media validation for `mediaType` and `storagePath` by aligning form field names and accepting legacy snake_case payloads.
- Fixed admin CRUD validation messages so common CMS errors use actionable admin-facing Thai copy instead of raw `Validation failed` or duplicate slug messages.
- Fixed admin client component redirect side effects in affected check-in code and route stop components.
- Fixed public Server Component newsletter placeholders that passed `onSubmit` handlers and caused a Next.js 16 runtime error.
- Fixed route and homepage route cards so missing route cover media no longer passes `null` into `next/image`.
- Fixed static public side pages that still used remote stock image fallbacks by replacing them with neutral saved-data or empty-state visual panels.
- Added `aria-label` attributes and `focus-visible` keyboard focus states to all icon-only buttons in admin status action components (attractions, accommodations, restaurants).
- Added `aria-hidden="true"` to decorative SVG icons inside actionable admin elements for screen reader compliance.

### Removed

- Removed standalone root-level HTML mockup/prototype files from the active repository surface so CMS review uses the real Next.js app and inserted data.
- Removed unused homepage fixture exports that carried stock image URLs into the CMS review surface.

### Security

- Added a server-side `media.read` permission guard to the `/admin/media` page before rendering the Media Library.
- Added server-side permission checks to admin settings APIs and admin media upload/list/delete routes.
- Added an admin session guard and AdminShell wrapper to `/admin/content`.
- Added repository-level contribution rules to prevent exposing service role keys, private identifiers, unsafe exports, and privacy-sensitive dashboard responses.
- Added server-only Supabase service-role client boundary and `.env.example` placeholders without real secrets.
- Added dashboard privacy guardrails through `dashboard.read` permission checks and aggregated dashboard responses that exclude provider IDs, guest tokens, private storage paths, raw comments, tourist IDs, and visit IDs.
- Documented Phase 08 server-side permission guard requirements for admin pages and mutations.
- Documented Phase 08 audit logging expectations for attraction, photo spot, check-in code, and sensitive denied admin actions.
- Added provider-specific LINE linking security so client-submitted LINE user IDs are not trusted and the legacy generic tourist identity-linking endpoint is disabled.
- Added Cloudinary secret handling rules and provider-neutral storage references so storage credentials and private paths remain server-only.

### Migration

- Added migration support for LINE identity linking metadata and dedicated consent fields for optional passport recovery consent.
- Added migration `20260528002000_add_suggested_route_slugs.sql` to backfill and require unique `suggested_routes.slug` values.
- Added database hardening migration and comprehensive development seed data for public content, QR check-ins, synthetic visits, certificates, stamps, surveys, funnel events, exports, and official statistics.

### Performance

- Added contribution guidance for QR landing, upload, certificate, dashboard, and export performance review.

### Documentation

- Documented `/admin/content` in admin side page, admin UI, and route structure specifications.
- Expanded Phase 08B CMS planning with mock/fallback cleanup, real inserted data as the public content source of truth, homepage picker schema alignment, and media entity type alignment.
- Updated the admin CMS workflow and data dictionary for the route slug model, homepage featured attraction picker, Settings deep links, and source-of-truth command center.
- Added development contribution rules.
- Added changelog policy and release note structure.
- Updated Phase 09 dashboard task/module/metric/privacy documentation to reflect the implemented MVP analytics route and live-query limitations.
- Updated Phase 08 admin documentation to avoid claiming full dashboard analytics, report/export jobs, LINE LIFF, or official data import automation as implemented.
- Aligned admin page, authorization, role/permission, audit logging, and Admin Attraction CMS docs around privacy-safe operational backoffice behavior.
- Documented Cloudinary-first deployment/storage architecture and future university-server storage migration path.
- Documented Phase 02A database-first validation status, including Docker daemon blocking local `supabase db reset`.

### Known Issues

- Full Phase 09 dashboard analytics and Phase 10 report/export workflows remain future work unless implemented and verified in a later change.
- Local Supabase reset has not completed because Docker Desktop / Docker daemon is not running in the current environment.
- Development seed screenshots still need a final pass after the local database is reset with the latest migrations.
- Phase 08B admin E2E coverage is incomplete: only `admin-auth-redirect.spec.ts` and `media-archive.spec.ts` were added. Broader admin flows (attraction CRUD, photo spot CRUD, check-in code CRUD, route stop management, settings CRUD, media governance workflows) are not yet covered by automated E2E tests.
- Dashboard query performance relies on live scanning of raw visit, tourist, and survey tables. No pre-aggregated summary tables or materialized views have been created yet; performance may degrade as data volume grows.
- Settings header save button dims to a disabled appearance when the fixed-bottom sticky save bar is visible — minor UX friction, the header button could be hidden entirely instead.
- `tourist-checkin.spec.ts` E2E test expects a `/visit/[id]/certificate/success` route that does not exist in the current route structure (the tourist flow was refactored; success state is handled inline on the preview page). The fix is to update the test expectations rather than restore the deleted route.

---

## [0.0.0] - Initial Planning Baseline

### Added

- Defined the project as a southern border tourism data and intelligence platform for Yala, Pattani, and Narathiwat.
- Defined the core product strategy: reward first, ask minimal data first, optional survey after certificate, guest-first, LINE-optional.
- Defined the high-level modules:
  - Public attraction pages
  - QR check-in
  - Minimal tourist profile
  - Consent management
  - Photo upload
  - Certificate generation
  - Digital stamp/passport
  - Optional survey
  - Admin CMS
  - Dashboard analytics
  - Privacy-safe export
  - Testing and deployment readiness
- Defined recommended stack:
  - Next.js App Router
  - TypeScript
  - Tailwind CSS
  - Supabase PostgreSQL
  - Supabase Auth
  - Supabase Storage
  - Zod
  - Vitest
  - Playwright

### Security

- Established privacy-by-design direction:
  - Do not require LINE, email, phone, national ID, passport number, full address, exact birthdate, or income before certificate.
  - Consent must be visible, not pre-checked, versioned, timestamped, and purpose-linked.
  - Dashboard and export outputs must exclude private identifiers by default.

### Documentation

- Established the documentation-first development approach for Codex-assisted implementation.

### Known Issues

- No production application has been implemented in this baseline.
- The project still requires actual code, migrations, tests, deployment configuration, and UI implementation in later phases.

---

## Future Release Template

Copy this section when creating a new release.

```markdown
## [x.y.z] - YYYY-MM-DD

### Added

- ...

### Changed

- ...

### Fixed

- ...

### Removed

- ...

### Security

- ...

### Performance

- ...

### Documentation

- ...

### Migration

- ...

### Known Issues

- ...
```

---

## Release Notes Guidance

For each release, include enough detail for:

```text
developer review
academic reporting
deployment tracking
security/privacy audit
dashboard metric traceability
database migration traceability
```

Example:

```text
### Added
- Implemented active/invalid/inactive/expired QR check-in resolution.
- Added public-safe QR landing page for attraction/photo spot context.

### Security
- QR response excludes admin notes and private storage paths.
- Invalid QR errors use safe user-facing messages.

### Migration
- Added checkin_codes table with unique code constraint and active/expiry fields.
```

---

## Critical Change Documentation

Always document these changes:

```text
database schema changes
RLS/storage policy changes
authentication/permission changes
tourist identity changes
consent text/version changes
dashboard formula changes
export column changes
file upload validation changes
certificate generation behavior changes
deployment/environment changes
```

---

## Dashboard Metric Change Note

If dashboard metrics change, include:

```text
metric name
old definition
new definition
reason
affected dashboard sections
test coverage
documentation updated
```

Example:

```text
### Changed
- Updated Survey Completion Rate denominator from total visits to generated certificates because the survey appears after the certificate reward.
```

---

## Security/Privacy Change Note

If security/privacy behavior changes, include:

```text
what changed
why it changed
data affected
risk reduction
tests or verification
```

Example:

```text
### Security
- Export service now excludes provider_user_id and guest_token from all default CSV exports.
- Added audit logging for export requests.
```

---

## Migration Change Note

If migrations are added, include:

```text
migration filename
tables changed
constraints/indexes added
backfill required or not
rollback notes if relevant
```

Example:

```text
### Migration
- Added `202605190930_create_tourism_core_tables.sql`.
- Created attractions, photo_spots, checkin_codes, tourists, tourist_identities, and visits.
- Added unique constraint on checkin_codes.code.
```

---

## Known Issue Guidance

Known issues must be honest and actionable.

Good:

```text
- LINE LIFF identity linking is not implemented in MVP; guest passport works only on the same browser/device.
```

Bad:

```text
- Some things may not work.
```

---

## Final Changelog Rule

The changelog is part of production and academic traceability.

Keep it truthful, specific, and safe.
