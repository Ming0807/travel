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

The active design source is `docs/frontend/DASHBOARD_UI_SPEC.md`. The implementation rationale and page-by-page plan are in `docs/superpowers/specs/2026-08-05-admin-analytics-visual-system-design.md` and `docs/superpowers/plans/2026-08-05-admin-analytics-visual-redesign.md`.

## Page Foundation

- `DashboardPageHeader` owns the decision-oriented page title, date scope, data source, freshness timestamp, and page actions for the protected dashboard routes.
- `DashboardPageFailure` maps validation, authentication, permission, and query failures to distinct recovery copy. A service failure must not be presented as an empty dataset.
- `DashboardShell` composes the page foundation, navigation, shared filters, content, interpretation note, and alerts. New dimension pages must provide a typed `page` key instead of creating another local header.
- `DashboardShell` owns the `Suspense` boundary for navigation and filters because both read request search parameters in Client Components under Next.js 16 prerendering.
- `dashboard-navigation` is the single source for protected analytics route order, full sidebar labels, compact tab labels, and icons. Desktop and mobile navigation must not define separate analytics vocabulary.
- `buildDashboardNavigationHref` carries only whitelisted analytics scope between pages and translates the shared snake-case query contract to the attraction workspace camel-case contract. Unsupported query parameters are intentionally dropped.
- `DashboardFilters` keeps date, province, and attraction as the primary scope. District, attraction type, audience, travel behavior, and satisfaction filters live in the advanced panel; every applied dimension must also appear as a removable chip.
- Executive previous-period comparison is opt-in. It uses the immediately preceding equal-length calendar range, does not run on the public evidence page, and keeps current-period results visible if the optional comparison query fails.
- KPI count deltas use relative percentage change. Rate deltas use percentage points. Missing, zero-baseline, or truncated evidence cannot produce a directional percentage.
