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
- Missing answers stay missing; they must not be rendered as zero.
- Tables may scroll inside their container, but the page must not overflow horizontally.

The active design source is `docs/frontend/DASHBOARD_UI_SPEC.md`. The implementation rationale and page-by-page plan are in `docs/superpowers/specs/2026-08-05-admin-analytics-visual-system-design.md` and `docs/superpowers/plans/2026-08-05-admin-analytics-visual-redesign.md`.
