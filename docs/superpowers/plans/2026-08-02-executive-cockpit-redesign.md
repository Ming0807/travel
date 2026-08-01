# Executive Cockpit Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a compact, decision-oriented executive analytics cockpit for the Yala rollout using the existing trusted dashboard view model.

**Architecture:** Keep `DashboardShell` responsible for shared context, filters, tabs, and alerts. Keep `ExecutiveOverview` responsible for composition only. Add focused presentation components that derive funnel and satisfaction summaries from `DashboardViewModel` without fetching data or changing metric formulas.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS, SVG, Vitest, Testing Library.

## Global Constraints

- Do not change database queries, migrations, permissions, or metric formulas.
- QR scans are funnel events and must never be labelled as visits.
- Missing values and zero denominators must display a no-data message rather than a misleading zero.
- Use Thai-first labels, `4-6px` corners, restrained shadows, and no gradients.
- Preserve URL-driven filters, CSV export behavior, privacy warnings, and responsive access to every dashboard tab.

---

### Task 1: Compact Shared Dashboard Context and Filters

**Files:**
- Modify: `components/dashboard/DashboardShell.tsx`
- Modify: `components/dashboard/DashboardFilters.tsx`
- Test: `tests/unit/dashboard-ux.test.tsx`

**Interfaces:**
- Consumes: `DashboardViewModel["filters"]` and `DashboardReferenceOptions`.
- Produces: the same `DashboardFilters` public component API and unchanged URL query names.

- [ ] **Step 1: Add a failing interaction test**

Render `DashboardFilters`, assert that the compact summary is visible, expand it, and assert the date and destination controls are available.

- [ ] **Step 2: Verify the test fails**

Run `npx vitest run tests/unit/dashboard-ux.test.tsx --maxWorkers=1`; expect failure because the compact filter summary does not exist.

- [ ] **Step 3: Implement the compact context and expandable filter form**

Keep all existing form names and remove links. Reduce desktop pre-chart height while preserving normal-flow expansion and 44px controls.

- [ ] **Step 4: Verify dashboard UX tests pass**

Run `npx vitest run tests/unit/dashboard-ux.test.tsx --maxWorkers=1`; expect all tests to pass.

### Task 2: Funnel Completion Summary

**Files:**
- Create: `components/dashboard/ExecutiveFunnelSummary.tsx`
- Modify: `components/dashboard/ExecutiveOverview.tsx`
- Test: `tests/unit/dashboard-executive-cockpit.test.tsx`

**Interfaces:**
- Consumes: `stages: FunnelStage[]`.
- Produces: `ExecutiveFunnelSummary({ stages }: { stages: FunnelStage[] })`.

- [ ] **Step 1: Write failing funnel tests**

Cover QR scan, certificate, and survey counts; assert `ยังคำนวณไม่ได้` when the QR or certificate denominator is zero.

- [ ] **Step 2: Verify the tests fail**

Run `npx vitest run tests/unit/dashboard-executive-cockpit.test.tsx --maxWorkers=1`; expect module-not-found failure.

- [ ] **Step 3: Implement the SVG ring and stage summary**

Use a solid orange progress stroke, clamp visual progress to `0..100`, and include an accessible data table. Do not use CSS or SVG gradients.

- [ ] **Step 4: Verify funnel tests pass**

Run the same Vitest command; expect all funnel tests to pass.

### Task 3: Experience Quality Summary

**Files:**
- Create: `components/dashboard/ExecutiveExperienceSummary.tsx`
- Modify: `components/dashboard/ExecutiveOverview.tsx`
- Test: `tests/unit/dashboard-executive-cockpit.test.tsx`

**Interfaces:**
- Consumes: `satisfaction: DashboardViewModel["satisfaction"]`.
- Produces: `ExecutiveExperienceSummary({ satisfaction }: { satisfaction: DashboardViewModel["satisfaction"] })`.

- [ ] **Step 1: Add failing satisfaction tests**

Assert average, response count, revisit rate, recommendation rate, score distribution, and no-data copy.

- [ ] **Step 2: Verify the new tests fail**

Run the focused cockpit test; expect missing-component assertions to fail.

- [ ] **Step 3: Implement the compact quality panel**

Use semantic text, a restrained multi-color distribution bar, small-sample warning, and a screen-reader table.

- [ ] **Step 4: Verify cockpit tests pass**

Run the focused cockpit test; expect all tests to pass.

### Task 4: Executive Cockpit Composition

**Files:**
- Modify: `components/dashboard/ExecutiveOverview.tsx`
- Modify: `components/dashboard/KpiCard.tsx`
- Modify: `components/dashboard/TrendChart.tsx`
- Modify: `components/dashboard/BarChartCard.tsx`
- Test: `tests/unit/dashboard-ux.test.tsx`

**Interfaces:**
- Consumes: existing `DashboardViewModel` properties only.
- Produces: the unchanged `ExecutiveOverview({ data })` public API.

- [ ] **Step 1: Add layout contract assertions**

Assert the four primary KPI keys and the presence of the trend, funnel, attraction, and experience regions.

- [ ] **Step 2: Replace the province chart and five-card grid**

Compose a four-cell KPI band, a `2:1` trend/funnel row, and a `2:1` attraction/experience row. Remove the Yala-only province comparison from the executive page.

- [ ] **Step 3: Run focused tests and detector**

Run dashboard unit tests and `node .agents/skills/impeccable/scripts/detect.mjs --json` for changed TSX files; expect zero failures and zero warnings.

### Task 5: Documentation and Production Verification

**Files:**
- Modify: `docs/dashboard/EXECUTIVE_DASHBOARD.md`
- Modify: `docs/superpowers/specs/2026-08-02-executive-cockpit-redesign-design.md` only if implementation reveals a contradiction.

**Interfaces:**
- Consumes: completed UI behavior.
- Produces: documented executive dashboard hierarchy and chart interpretation.

- [ ] **Step 1: Update dashboard documentation**

Record the four KPI band, funnel ring, experience panel, Yala-only province-chart decision, and responsive behavior.

- [ ] **Step 2: Run quality checks**

Run `npm run lint`, `npm run typecheck`, `npm test -- --run`, and `npm run build`; expect exit code `0` for each.

- [ ] **Step 3: Run visual QA**

Check `/admin/dashboard` at desktop and `375x844`, verify no horizontal overflow, then smoke all eight analytics routes and inspect console warnings/errors.

- [ ] **Step 4: Commit and push**

Stage only the cockpit, tests, and documentation. Commit with `feat: build executive analytics cockpit` and push `main` after verifying the remote head matches the local commit.
