# Dashboard Components

Dashboard UI components belong here.

Dashboards must consume server-side aggregated, privacy-safe data. They must not fetch raw tourist rows into the browser.

## Visual Contract

- Thai-first labels and explanations.
- White, near-black, and warm orange are the shared visual base.
- Use 4-6px corners, 1px borders, and no more than an 8px shadow blur.
- Keep KPI groups compact; do not turn every metric into a floating card.
- Detailed routes use an 8:4 evidence-to-interpretation layout on wide screens and a single column on mobile.
- Every important chart needs a readable table or structured text equivalent.
- Use the shared Recharts-based chart components for line, bar, donut, funnel, and scatter views; keep metric formulas and privacy suppression in the service layer.
- Missing answers stay missing; they must not be rendered as zero.
- Tables may scroll inside their container, but the page must not overflow horizontally.
- Below 640px, shared category and attraction score charts use `CompactBarList`
  with full labels above bars and exact values. Wider views mount Recharts only
  while visible, preventing zero-size chart warnings. Fixed score scales stay 0-5.
- `dashboard-chart-theme.ts` owns the category palette, tooltip surface and
  grapheme-safe abbreviated axis labels. Full labels remain in tooltips/tables.
- Donut legend labels wrap within a `min-w-0` container rather than widening the page.

The active design source is `docs/frontend/DASHBOARD_UI_SPEC.md`. The implementation rationale and page-by-page plan are in `docs/superpowers/specs/2026-08-05-admin-analytics-visual-system-design.md` and `docs/superpowers/plans/2026-08-05-admin-analytics-visual-redesign.md`.

## Page Foundation

- `DashboardPageHeader` owns the decision-oriented page title, date scope, data source, freshness timestamp, and page actions for the protected dashboard routes.
- `DashboardPageFailure` maps validation, authentication, permission, and query failures to distinct recovery copy. A service failure must not be presented as an empty dataset.
- `DashboardShell` composes the page foundation, navigation, shared filters, content, interpretation note, and alerts. New dimension pages must provide a typed `page` key instead of creating another local header.
- `DashboardShell` owns the `Suspense` boundary for navigation and filters because both read request search parameters in Client Components under Next.js 16 prerendering.
- Advanced filters stay mounted when collapsed, preserving applied and draft
  values in `FormData`; a complete filter key remounts them on scope navigation.
- Browser-local saved views retain the resolved date range. Storage rejection
  must show an actionable error without breaking the analytical workspace.

## Component Visual Checks

The isolated harness in `tests/visual/dashboard` renders real UI components with
synthetic data and application CSS. It does not replace authenticated route,
permission, data-parity, or Next font integration checks.
- `dashboard-navigation` is the single source for protected analytics route order, full sidebar labels, compact tab labels, and icons. Desktop and mobile navigation must not define separate analytics vocabulary.
- `buildDashboardNavigationHref` carries only whitelisted analytics scope between pages and translates the shared snake-case query contract to the attraction workspace camel-case contract. Unsupported query parameters are intentionally dropped.
- `DashboardFilters` keeps date, province, and attraction as the primary scope. District, attraction type, audience, travel behavior, and satisfaction filters live in the advanced panel; every applied dimension must also appear as a removable chip.
- Executive previous-period comparison is opt-in. It uses the immediately preceding equal-length calendar range, does not run on the public evidence page, and keeps current-period results visible if the optional comparison query fails.
- KPI count deltas use relative percentage change. Rate deltas use percentage points. Missing, zero-baseline, or truncated evidence cannot produce a directional percentage.
- Executive KPI evidence distinguishes operational system records from survey evidence. Survey metrics show their answer count and denominator, and remain labelled as limited below the documented minimum sample.
- `ExecutiveDecisionSummary` may describe the largest comparable KPI change, but its deterministic copy must state the metric boundary and avoid claiming why the change occurred.
- `AttractionPeerComparison` compares one attraction with at most three displayed peers from the same active province/type/date/evidence population. It discloses the full eligible count and rank denominator, suppresses small survey cells, and keeps detailed dimensions behind progressive disclosure.
- Attraction trend, satisfaction, and funnel components accept an optional aggregate improvement context. Their action links carry no comments or personal identifiers and open a human-reviewed draft in the existing improvement workflow.
- The attraction improvement timeline is the audit surface for baseline, ownership, due/overdue state, follow-up window, implementation evidence, workflow history, and the required verification outcome.
- `DistributionEvidenceStrip` gives optional-field charts one shared answered/denominator, coverage, missingness, and evidence-strength contract without adding another decorative card.
- `BarChartCard`, `DonutChartCard`, and the protected Funnel workspace support aggregate mark selection and filter only their on-page aggregate table. They never receive respondent identity or private comment fields.
- `SatisfactionSegmentComparison` displays two age-group means only when both groups have at least 30 valid overall scores and always labels the result as descriptive, not causal.
- `DashboardQualityCenter` is the shared confidence strip for all general analytics pages. It displays field/pilot/simulated scope, freshness, sample, coverage, missingness, suppression, truncation, audit metadata, and operational collection gaps.
- Dashboard narratives and server-side exports use the same quality gates. Reaching the bounded row limit, stale summary data, `n < 10`, or relevant coverage below 20% blocks the claim/export rather than returning a partial result.
