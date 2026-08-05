# Admin Analytics Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild all eight admin analytics routes around the approved executive, detailed-analysis, and mobile visual concepts while preserving trusted metrics and privacy boundaries.

**Architecture:** Keep `DashboardShell` responsible for shared context, filters, and navigation. Add small shared presentation primitives for consistent panels and section headers. Keep every route section responsible for composition only and derive all visuals from the existing `DashboardViewModel`.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS, Phosphor Icons, SVG, Vitest, Testing Library, browser visual QA.

## Global Constraints

- Do not add database migrations, queries, dependencies, or metric formulas.
- QR scans are not visits; tourist profiles are not verified people; estimated spending is not revenue.
- Missing values and invalid denominators display Thai no-data language.
- Use Thai-first copy, `4-6px` corners, one-pixel separators, and shadows with at most `8px` blur.
- Use brand orange `#B94727` for primary analytics and selection; semantic colors retain their meanings.
- No gradients, glassmorphism, nested cards, decorative charts, or page-level horizontal overflow.
- Preserve URL filters, permissions, exports, accessible tables, and all public component APIs unless a task explicitly replaces one.

---

### Task 1: Shared Analytics Visual Foundation

**Files:**
- Create: `components/dashboard/AnalyticsPanel.tsx`
- Create: `components/dashboard/AnalyticsSectionHeader.tsx`
- Modify: `components/dashboard/DashboardShell.tsx`
- Modify: `components/dashboard/DashboardFilters.tsx`
- Modify: `components/dashboard/DashboardTabs.tsx`
- Test: `tests/unit/dashboard-ux.test.tsx`

**Interfaces:**
- Produces `AnalyticsPanel` for bordered analytical surfaces and `AnalyticsSectionHeader` for route title/actions.
- Preserves the existing `DashboardShell`, `DashboardFilters`, and `DashboardTabs` public APIs.

- [ ] Add failing assertions for compact context, active analysis navigation, mobile overflow containment, and 44px controls.
- [ ] Run `npx vitest run tests/unit/dashboard-ux.test.tsx --maxWorkers=1`; confirm the new contracts fail.
- [ ] Implement the shared surface, header, compact context, filter, and navigation vocabulary.
- [ ] Run the focused test and Impeccable detector; expect zero failures and warnings.

### Task 2: Executive Dashboard Composition

**Files:**
- Modify: `components/dashboard/ExecutiveOverview.tsx`
- Modify: `components/dashboard/ExecutiveFunnelSummary.tsx`
- Modify: `components/dashboard/ExecutiveExperienceSummary.tsx`
- Modify: `components/dashboard/KpiCard.tsx`
- Modify: `components/dashboard/TrendChart.tsx`
- Create: `components/dashboard/ExecutiveAttractionRanking.tsx`
- Test: `tests/unit/dashboard-executive-cockpit.test.tsx`

**Interfaces:**
- `ExecutiveAttractionRanking` consumes `DashboardViewModel["executive"]["topAttractions"]`.
- Existing executive component props stay unchanged.

- [ ] Add failing tests for the ranked table, funnel stage labels, experience dimensions, and invalid conversion state.
- [ ] Run the focused cockpit test; confirm the new composition contracts fail.
- [ ] Implement the 8/4 trend-funnel row and 8/4 ranking-experience row from the approved reference.
- [ ] Run focused tests and typecheck; expect success.

### Task 3: Tourist and Travel Behavior Analytics

**Files:**
- Modify: `components/dashboard/TouristProfileSection.tsx`
- Modify: `components/dashboard/TravelBehaviorSection.tsx`
- Modify: `components/dashboard/TouristDetailTable.tsx`
- Modify: `components/dashboard/TravelBehaviorDetailTable.tsx`
- Test: `tests/unit/dashboard-detail-layouts.test.tsx`

**Interfaces:**
- Consumes existing `data.touristProfile` and `data.travelBehavior` aggregates only.
- Preserves section component props.

- [ ] Add failing tests for route headings, KPI summaries, primary chart regions, sample notes, and table access.
- [ ] Implement asymmetric evidence layouts and compact KPI strips for both routes.
- [ ] Verify no missing values are converted to zero and focused tests pass.

### Task 4: Attraction Performance Analytics

**Files:**
- Modify: `components/dashboard/AttractionPerformanceSection.tsx`
- Test: `tests/unit/dashboard-detail-layouts.test.tsx`

**Interfaces:**
- Consumes existing `data.executive.topAttractions` only.
- Derives concentration language from visible visit counts without introducing a new metric API.

- [ ] Add failing tests for ranking, total counts, no-data behavior, and concentration interpretation.
- [ ] Implement the wide ranking chart, narrow planning interpretation, and full data table.
- [ ] Run focused tests and typecheck; expect success.

### Task 5: Expense and Satisfaction Analytics

**Files:**
- Modify: `components/dashboard/ExpenseSection.tsx`
- Modify: `components/dashboard/ExpenseDetailTable.tsx`
- Modify: `components/dashboard/SatisfactionSection.tsx`
- Modify: `components/dashboard/SatisfactionDetailTable.tsx`
- Test: `tests/unit/dashboard-detail-layouts.test.tsx`

**Interfaces:**
- Consumes existing expense ranges, categories, satisfaction averages, intentions, distributions, and response counts.
- Preserves all rate and missing-data semantics.

- [ ] Add failing tests for methodology copy, response counts, no-data scores, and accessible tables.
- [ ] Implement the detailed-analysis composition with evidence and interpretation panels.
- [ ] Run focused tests and validate Thai-first labels.

### Task 6: Funnel and Sustainability Analytics

**Files:**
- Modify: `components/dashboard/FunnelSection.tsx`
- Modify: `components/dashboard/FunnelChart.tsx`
- Modify: `components/dashboard/FunnelDetailTable.tsx`
- Modify: `components/dashboard/SustainableTourismSection.tsx`
- Test: `tests/unit/dashboard-detail-layouts.test.tsx`

**Interfaces:**
- Consumes existing funnel stages, largest drop-off, and rule-based insight records.
- Does not infer unique people from events or describe insights as AI predictions.

- [ ] Add failing tests for stage counts, invalid denominators, largest-drop evidence, insight confidence, and actions.
- [ ] Implement the full desktop funnel, vertical mobile sequence, and decision-oriented insight workspace.
- [ ] Run focused tests and typecheck; expect success.

### Task 7: Documentation, Responsive QA, and Release Verification

**Files:**
- Modify: `components/dashboard/README.md`
- Modify: `docs/dashboard/EXECUTIVE_DASHBOARD.md`
- Modify: `docs/dashboard/TOURIST_PROFILE_DASHBOARD.md`
- Modify: `docs/dashboard/TRAVEL_BEHAVIOR_DASHBOARD.md`
- Modify: `docs/dashboard/EXPENSE_DASHBOARD.md`
- Modify: `docs/dashboard/SATISFACTION_DASHBOARD.md`
- Modify: `docs/dashboard/FUNNEL_ANALYTICS_DASHBOARD.md`
- Modify: `docs/dashboard/SUSTAINABLE_TOURISM_DASHBOARD.md`

**Interfaces:**
- Documents the completed UI, preserved formulas, and responsive behavior.

- [ ] Update the UI markdown to match the implemented layouts and remove descriptions of superseded composition.
- [ ] Run `git diff --check`, targeted ESLint, `npm run typecheck`, focused tests, full lint, full tests, and `npm run build`.
- [ ] Restore `next-env.d.ts` after build if generated route types change it.
- [ ] Run Impeccable detection on every changed TSX file.
- [ ] Browser-smoke all eight routes at 1440px and 390px, verify no page overflow, inspect console errors, and capture representative screenshots.
- [ ] Dispatch a final Sol reviewer for spec compliance, analytics integrity, responsive UX, and test gaps; fix all important findings before commit and push.
