# Story CMS, Recommendation, and Dashboard P2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-oriented Story CMS, explainable content recommendations, an operational admin home, and a clearer analytical dashboard without changing the deferred P0/P1 production backlog.

**Architecture:** Keep `travel_stories` as the existing content identity, add structured content and normalized supporting tables, and place workflow rules in typed services between actions and repositories. Separate `/admin` operational queues from `/admin/dashboard` analytics while sharing the established admin shell and design tokens.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, TipTap, Zod, Supabase PostgreSQL, Recharts, Vitest, Testing Library, Playwright.

## Global Constraints

- Do not run `npm run db:migrations:check` until the user explicitly requests it.
- Do not implement or modify the existing P0/P1 release backlog in this plan.
- Use Thai-first admin labels.
- Preserve existing public story URLs.
- Preserve plain-text handling for tourist UGC.
- Do not label deterministic recommendations as AI.
- Do not expose personal identifiers in events, dashboards, recommendations, or exports.
- Add a failing test before each behavioral implementation.
- Keep `.tmp/` untracked and untouched.

## Planned File Boundaries

New domain files:

- `lib/content/story-document.ts`: structured document schema and compatibility conversion
- `lib/content/story-workflow.ts`: allowed states and transition rules
- `lib/content/story-readiness.ts`: publish readiness evaluation
- `lib/recommendations/story-recommendation.ts`: pure scoring and diversity rules
- `lib/services/story-editorial.service.ts`: authorization-independent editorial orchestration
- `lib/services/story-recommendation.service.ts`: public recommendation orchestration
- `lib/repositories/story-taxonomy.repository.ts`: topics and tags
- `lib/repositories/story-revision.repository.ts`: immutable revisions
- `lib/repositories/story-recommendation.repository.ts`: curated relationships and candidates

New UI areas:

- `components/admin/stories/library/*`: editorial library and filters
- `components/admin/stories/moderation/*`: UGC moderation queue
- `components/admin/stories/editor/*`: editor shell, outline, metadata, readiness, revisions
- `components/admin/operations/*`: operational home sections
- `components/dashboard/layout/*`: analytics overview hierarchy
- `components/stories/*`: public story hub, content renderer, TOC, recommendation rail

## Task 1: Lock Documentation and P2 Status

**Files:**

- Create: `tasks/PHASE_16A_STORY_CMS_RECOMMENDATION_DASHBOARD_UX.md`
- Modify: `tasks/TASK_INDEX.md`
- Modify: `docs/frontend/ADMIN_UI_SPEC.md`
- Modify: `docs/frontend/DASHBOARD_UI_SPEC.md`
- Modify: `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`

- [x] Add the approved design link and explicit P2-only boundary.
- [x] Separate implemented state from planned P2 capability.
- [x] Document `/admin` as operations and `/admin/dashboard` as analytics.
- [x] Add Story CMS, moderation, structured content, and recommendation routes.
- [x] Run Markdown path/link checks used by the repository.
- [ ] Commit: `docs: plan P2 story CMS and dashboard UX`

## Task 2: Add Story Domain Contracts

**Files:**

- Create: `lib/content/story-document.ts`
- Create: `lib/content/story-workflow.ts`
- Create: `lib/content/story-readiness.ts`
- Create: `tests/unit/story-document.test.ts`
- Create: `tests/unit/story-workflow.test.ts`
- Create: `tests/unit/story-readiness.test.ts`

- [x] Write failing tests for valid document nodes and unsafe/unknown nodes.
- [x] Write failing tests for editorial and UGC transition matrices.
- [x] Write failing readiness tests for title, excerpt, cover, topic, content, and SEO.
- [x] Implement strict Zod document schemas with a schema version.
- [x] Implement pure workflow and readiness functions.
- [x] Run targeted tests, typecheck, and ESLint.
- [x] Commit: `feat: add typed story content and workflow contracts`

## Task 3: Add Backward-Compatible Story Schema

**Files:**

- Create: `supabase/migrations/<timestamp>_add_story_editorial_platform.sql`
- Modify: `docs/database/DATA_DICTIONARY.md`
- Modify: `docs/database/RELATIONSHIPS.md`
- Modify: `docs/security/ROLE_PERMISSION_MATRIX.md`
- Create: `tests/unit/story-migration-contract.test.ts`

- [x] Write migration contract tests for fields, checks, indexes, RLS, and constraints.
- [x] Add structured content, SEO, scheduling, review, reading-time, and archive fields.
- [x] Add topics, tags, links, revisions, and curated recommendation tables.
- [x] Expand status constraints without breaking existing rows.
- [x] Add permissions for review, schedule, restore revision, and taxonomy management.
- [x] Add indexes for list/filter/publish/recommendation queries.
- [x] Verify migration is idempotent where repository convention requires it.
- [x] Do not apply the migration remotely in this task.
- [x] Commit: `feat: add story editorial platform schema`

## Task 4: Refactor Repository and Service Boundaries

**Files:**

- Modify: `lib/repositories/admin-story.repository.ts`
- Modify: `app/actions/admin-story-actions.ts`
- Create the repository/service files listed under Planned File Boundaries.
- Modify: `lib/validation/story.ts`
- Create: `tests/unit/story-editorial-service.test.ts`
- Modify: relevant admin story action tests.

- [x] Write failing tests for transitions, revisions, scheduling, and rollback on failure.
- [x] Keep authorization in guards/actions and persistence in repositories.
- [x] Make status canonical and synchronize legacy `is_published` behavior.
- [x] Save a revision on meaningful editorial changes through the atomic RPC.
- [x] Audit new workflow mutations without logging content bodies or secrets.
- [x] Run targeted tests, typecheck, and ESLint.
- [x] Commit: `refactor: add story editorial service boundary`

## Task 5: Build Editorial Library and Moderation Queue

**Files:**

- Modify: `app/(admin)/admin/stories/page.tsx`
- Create: `app/(admin)/admin/stories/submissions/page.tsx`
- Create components under `components/admin/stories/library/` and `moderation/`.
- Modify: `components/admin/admin-nav-items.tsx` or current nav owner.
- Create component and action tests.

- [x] Write failing filter and server-side query tests, plus authenticated route coverage.
- [x] Build server-side search, author type, province, topic, state, date, and readiness filters.
- [x] Separate editorial tabs from UGC moderation tabs.
- [x] Omit bulk selection until a safe, concrete bulk operation is defined.
- [x] Add Thai empty, invalid-filter recovery, and permission-protected states.
- [x] Verify 375px and desktop layouts with authenticated Playwright coverage.
- [x] Commit: `feat: add editorial library and UGC moderation queue`

## Task 6: Build Structured Editorial Studio

**Files:**

- Refactor: `components/admin/stories/visual-editor/StoryVisualEditor.tsx`
- Refactor: `components/admin/stories/visual-editor/SectionForms.tsx`
- Create components under `components/admin/stories/editor/`.
- Modify: `components/admin/forms/FormRichText.tsx`
- Create editor component tests.

- [x] Write failing tests for JSON output, legacy HTML loading, dirty state, save/cancel, and managed Media Library insertion.
- [x] Add document outline and automatic table of contents in the editorial preview.
- [x] Add metadata, taxonomy, SEO fields, schedule intent, readiness, workflow actions, and revision visibility.
- [x] Add autosave recovery to local storage without treating it as a server save.
- [x] Warn before leaving with unsaved changes.
- [x] Preserve server-side sanitization and restricted UGC rendering.
- [ ] Run Impeccable detection, accessibility checks, responsive screenshots, and tests (automated component checks complete; authenticated browser screenshots remain).
- [x] Add managed inline images with required alt text, optional captions, stable storage references, and version 1 compatibility.
- [ ] Commit: `feat: build structured story editorial studio`

## Task 7: Redesign the Public Blog and Story Experience

**Files:**

- Refactor: `app/(public)/stories/page.tsx`
- Refactor: `app/(public)/stories/[id]/page.tsx`
- Create components under `components/stories/`.
- Modify: `lib/repositories/public-content.repository.ts`
- Create public DTO and component tests.

- [ ] Write failing tests for pagination, filters, metadata, TOC, UGC safety, and missing media.
- [ ] Build a searchable story hub with topic, province, and content-type filters.
- [ ] Render structured content with stable image dimensions and accessible captions.
- [ ] Add Thai-first breadcrumbs, author/content-type labels, read time, and share controls.
- [ ] Add honest empty and not-found states.
- [ ] Verify metadata, canonical URLs, Open Graph image, and structured data.
- [ ] Commit: `feat: redesign public travel stories`

## Task 8: Add Explainable Story Recommendations

**Files:**

- Create recommendation domain/repository/service files.
- Modify public story detail and attraction article surfaces.
- Create: `tests/unit/story-recommendation.test.ts`
- Create repository integration tests with fixtures.

- [ ] Write failing tests for exclusions, weights, curated priority, diversity, minimum sample, and fallback.
- [ ] Implement candidate queries that return public-ready records only.
- [ ] Return score components and reason keys internally.
- [ ] Display one translated recommendation reason without exposing scores publicly.
- [ ] Add cache keys and invalidation after publish/taxonomy/relation changes.
- [ ] Commit: `feat: add explainable story recommendations`

## Task 9: Add Privacy-Safe Content Engagement

**Files:**

- Create a migration for event/aggregate storage if not included in Task 3.
- Create: `app/api/content/events/route.ts`
- Create validation, rate-limit, repository, and retention tests.
- Update PDPA and retention documentation.

- [ ] Write failing tests for allowed events, invalid origins, rate limiting, payload minimization, and no identifiers.
- [ ] Record impression, open, related click, and meaningful completion.
- [ ] Use short-lived anonymous deduplication only when needed.
- [ ] Add retention and aggregation rules.
- [ ] Keep engagement weight disabled until the minimum sample threshold is met.
- [ ] Commit: `feat: add privacy-safe content engagement signals`

## Task 10: Redesign `/admin` as an Operational Command Center

**Files:**

- Refactor: `app/(admin)/admin/page.tsx`
- Create components under `components/admin/operations/`.
- Add an aggregated operations service and DTO.
- Create component and service tests.

- [ ] Write failing tests for queue priority, counts, permissions, and empty state.
- [ ] Add compact KPIs, priority queue, scheduled content, readiness, recent activity, and shortcuts.
- [ ] Keep analytics charts out of this page.
- [ ] Use the reference image only for density and hierarchy, not domain content.
- [ ] Verify keyboard order, mobile drawer, 375px layout, and no horizontal overflow.
- [ ] Commit: `feat: add admin operational command center`

## Task 11: Refine `/admin/dashboard` Analytical Hierarchy

**Files:**

- Refactor: `components/dashboard/DashboardShell.tsx`
- Refactor: `components/dashboard/DashboardTabs.tsx`
- Refactor: `components/dashboard/ExecutiveOverview.tsx`
- Add focused layout components under `components/dashboard/layout/`.
- Modify: `docs/frontend/DASHBOARD_UI_SPEC.md`
- Add component and screenshot tests.

- [ ] Write failing tests for hierarchy, metric definitions, no-data rules, sample warnings, and filters.
- [ ] Create executive first viewport with KPI, trend, distribution, and action alerts.
- [ ] Move secondary analyses into clear drill-down navigation.
- [ ] Keep date/province/attraction filters visible and URL-backed.
- [ ] Provide table equivalents for charts and stable responsive dimensions.
- [ ] Verify all Thai labels and metric limitations.
- [ ] Commit: `refactor: clarify analytical dashboard hierarchy`

## Task 12: Production QA and Documentation Closeout

**Files:**

- Update relevant frontend, backend, database, security, dashboard, and testing docs.
- Add Playwright editorial and public recommendation journeys.
- Add visual screenshot outputs to ignored QA locations only.

- [ ] Run `git diff --check`.
- [ ] Run ESLint on all changed TS/TSX files with zero errors and warnings.
- [ ] Run `npm run typecheck`.
- [ ] Run targeted tests after every task.
- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build` and restore `next-env.d.ts` if generated.
- [ ] Run Playwright desktop/mobile tests against local or staging.
- [ ] Run Impeccable detection on changed admin/public UI.
- [ ] Confirm no migration was applied automatically.
- [ ] Update task status truthfully.
- [ ] Commit: `test: harden story CMS and dashboard P2 release`
