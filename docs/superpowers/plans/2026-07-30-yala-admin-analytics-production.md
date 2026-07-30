# Yala Pilot, Admin Command Center, and Analytics Production Plan

> **Execution rule:** Implement one task at a time with focused tests and a review checkpoint. Do not run `npm run db:migrations:check` until the project owner requests it.

**Goal:** Prepare a serious Yala-first production pilot with privacy-safe Story engagement, a task-oriented admin command center, and decision-grade analytics that remain ready for Pattani and Narathiwat later.

**Architecture:** Keep the existing three-province relational model and historical records. Add `destination_status` as a separate launch-scope contract because `provinces` is also the origin-province master for tourists; do not repurpose `is_active` or `is_target_area`. Store Story engagement as minimized anonymous events plus daily aggregates. Replace large raw-row dashboard reads with bounded SQL/RPC contracts before redesigning the analytical interface.

**Visual direction:** Align admin with the public brand using white, ink/black, and coral-orange. Use orange for primary actions, active selections, and focused signals only. Use 1px borders, 4-6px radius, restrained shadows, stable dimensions, and full-width work surfaces. Avoid gradients, glow, decorative animation, nested cards, oversized headings, and multicolor dashboard decoration.

## Product Principles

- Thai-first admin labels and explanations.
- `/admin` answers: "What needs attention now?"
- `/admin/dashboard` answers: "What should we decide or improve?"
- Yala-only is a launch scope, not destructive deletion.
- QR scans are not visits; visits are not unique tourists.
- Estimated spending is not revenue.
- Missing answers are not zero.
- Every analytical value includes its definition, sample size, and limitation where relevant.
- No raw identity, IP address, URL, referrer, guest token, tourist ID, or visit ID in Story engagement events.
- Public content and tourist flows must continue working if engagement recording fails.

## Release Sequence

### Task 1: Privacy-Safe Story Engagement

**Primary files**

- Create `supabase/migrations/20260730100000_add_story_engagement_signals.sql`
- Create `app/api/content/events/route.ts`
- Create `lib/content/story-engagement.ts`
- Create `lib/repositories/story-engagement.repository.ts`
- Create `lib/services/story-engagement.service.ts`
- Create `components/stories/StoryEngagementTracker.tsx`
- Modify Story hub/detail/recommendation surfaces
- Add validation, origin, hashing, repository, API, and retention tests
- Update PDPA, retention, API, data dictionary, and dashboard metric docs

**Acceptance criteria**

- [x] Allow only `story_impression`, `story_open`, `related_content_click`, and `meaningful_read_complete`.
- [x] Allow only `story_hub`, `story_detail`, and `related_rail` surfaces.
- [x] Reject unknown origins in production and never store origin or referrer.
- [x] Use HMAC-SHA256 for short-lived deduplication and rate limiting; never store raw nonce or IP.
- [x] Keep request body at or below 2 KB with strict fields and no arbitrary metadata.
- [x] Validate that source and related stories are currently public; reject self-related clicks.
- [x] Keep raw events for 30 days, deduplication for 24 hours, and long-term daily aggregates.
- [x] Use database-backed rate limiting suitable for distributed Vercel functions.
- [x] Make client tracking non-blocking and failure-silent.
- [x] Keep recommendation engagement weight disabled below the existing 100-sample threshold.

### Task 2: Reversible Yala-Only Launch Scope

**Primary files**

- Create `20260730020000_add_destination_launch_scope.sql`
- Create `20260730021000_enforce_destination_launch_scope.sql`
- Create `20260730022000_complete_thai_origin_and_yala_geography.sql` only after official-reference validation
- Update public repositories, route filters, homepage selections, sitemap, and admin pickers
- Add a real Yala content/relationship seed or import script separate from migrations
- Update deployment, seed, data dictionary, and release documentation

**Acceptance criteria**

- [ ] Do not delete Pattani or Narathiwat master data or historical records.
- [ ] Do not set `provinces.is_active=false` or change `is_target_area` to control launch visibility.
- [ ] Use `destination_status IN ('hidden', 'pilot', 'live', 'retired')` and a destination display order.
- [ ] Public pages, filters, feeds, sitemap, and recommendations show only active launch provinces.
- [ ] Admin creation/edit pickers default to Yala and clearly explain the pilot scope.
- [ ] Existing out-of-scope content remains stored and administrable but is excluded from public destination queries.
- [ ] QR, photo spot, stamp, review, and route visibility is validated through the parent attraction launch scope.
- [ ] Service-role repositories repeat the launch-scope check because they bypass RLS.
- [ ] Analytics replace province comparison with district, attraction type, and attraction comparisons while only one province is active.
- [ ] Tourist origin-province controls continue to include all valid Thai provinces.
- [ ] A future province can be enabled without schema changes or data restoration.
- [ ] Real seed/import scripts are idempotent and do not belong in `seed.sql` unless intended for a complete local reset.

### Task 3: Admin Visual Foundation

**Primary files**

- Refactor shared admin shell, sidebar, top bar, page header, filters, tables, status labels, drawers, and empty states
- Update `docs/frontend/ADMIN_UI_SPEC.md`
- Add visual token and component tests

**Acceptance criteria**

- [ ] White/ink/coral palette with semantic success/warning/error colors.
- [ ] Radius is 4-6px for operational surfaces; no nested card stacks.
- [ ] Active navigation uses a coral edge or compact selection state.
- [ ] Toolbar, filters, tables, drawers, focus rings, and mobile navigation share one system.
- [ ] Desktop density remains scannable; mobile controls remain at least 44px.
- [ ] No text overlap or horizontal overflow at required viewports.

### Task 4: Operational Admin Command Center

**Primary files**

- Refactor `app/(admin)/admin/page.tsx`
- Create `components/admin/operations/*`
- Create an aggregated operations DTO, repository, and service
- Add permission-aware service/component tests

**First viewport**

1. งานต้องจัดการ
2. เรื่องรออนุมัติ
3. ข้อความยังไม่อ่าน
4. เนื้อหานัดเผยแพร่ 7 วัน

**Operational sections**

- Priority queue: traveler stories, publish blockers, QR anomalies, missing media metadata
- Today operations: visits, successful certificates, surveys, funnel failures
- Content readiness: attractions, stories, routes, and media with drill-down
- Recent permission-scoped audit activity
- Quick actions for common admin work
- Compact module directory at the bottom

**Acceptance criteria**

- [ ] No analytical chart duplication from `/admin/dashboard`.
- [ ] Counts are permission-aware and have useful empty/error states.
- [ ] Priority ordering is deterministic and tested.
- [ ] Every queue item has a real destination and action.
- [ ] Keyboard order and mobile layout are verified.

### Task 5: Analytics Query Contract

**Primary files**

- Add bounded SQL functions or summary contracts for executive and domain analytics
- Refactor dashboard repository/service away from six raw 10,000-row reads
- Correct weighted aggregate calculations
- Update metric dictionary and performance documentation

**Acceptance criteria**

- [ ] No dashboard result silently truncates at 10,000 raw rows.
- [ ] Summary averages are weighted by valid response counts.
- [ ] Filters remain URL-backed across every tab.
- [ ] Analytics payload target is at most 150 KB for the executive view.
- [ ] Target first response P95 is at most 1.5 seconds on the production dataset.
- [ ] Every query supports date range plus active launch scope and relevant drill-down.

### Task 6: Analytical Dashboard Redesign

**Primary files**

- Refactor `components/dashboard/DashboardShell.tsx`
- Refactor `components/dashboard/DashboardTabs.tsx`
- Refactor `components/dashboard/ExecutiveOverview.tsx`
- Refactor shared charts, insight panels, tables, and all domain sections
- Add dashboard component, metric, accessibility, and screenshot tests

**Executive first viewport**

- Five definition-accurate KPIs
- Visit trend
- Top attractions
- ประเด็นที่ควรตัดสินใจ

**Preferred charts**

- Line chart for time trends
- Horizontal bars for ranking and comparison
- 100% stacked bars for composition
- Visits-versus-satisfaction quadrant for planning decisions
- Accessible table equivalents for every chart

**Acceptance criteria**

- [ ] KPI sparklines use their own metric series, not a shared visit series.
- [ ] No decorative donut collection or misleading color coding.
- [ ] Low sample sizes show warnings and suppress unsupported conclusions.
- [ ] Domain pages are fully Thai-first.
- [ ] Alerts have a complete view and stable dismissal identity.
- [ ] Date, scope, attraction, district, and type filters persist between tabs.

### Task 7: Production QA and Release Documentation

**Viewport matrix**

- 1440x900
- 1280x800
- 1024x768
- 768x1024
- 390x844
- 375x667

**States**

- real data
- no data
- low sample
- partial failure
- permission restricted
- mobile filter drawer

**Acceptance criteria**

- [ ] Authenticated Playwright uses the real application rather than mocked full-page HTML.
- [ ] Desktop/mobile screenshots are visually reviewed.
- [ ] `git diff --check`, changed-file ESLint, typecheck, focused tests, build, and post-build artifact checks pass.
- [ ] Full-suite timeout is reported separately from assertion failures.
- [ ] Impeccable detection reports no unresolved warnings in changed UI.
- [ ] SQL runbook lists created, applied, pending, and reversible migrations truthfully.

## SQL Run Ledger

Migrations already created before this plan and still requiring owner-side status confirmation:

- `20260730000000_harden_public_story_search.sql`
- `20260730010000_replace_story_recommendations_rpc.sql`

Created locally, not yet applied:

- `20260730100000_add_story_engagement_signals.sql`

Planned, not yet created or applied:

- `20260730020000_add_destination_launch_scope.sql`
- `20260730021000_enforce_destination_launch_scope.sql`
- `20260730022000_complete_thai_origin_and_yala_geography.sql`
- Dashboard analytics RPC/summary migration, timestamp to be assigned after metric contract tests

Never claim a migration is applied based only on a local file or successful build.
