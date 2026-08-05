# Admin Analytics Visual System Redesign

## Purpose

Redesign the complete `/admin/dashboard` family so it looks and behaves like one professional tourism intelligence product. The approved visual direction is the generated executive dashboard, detailed analytics workspace, and mobile dashboard concepts from 5 August 2026.

The redesign changes layout, hierarchy, chart presentation, responsive behavior, and documentation. It does not invent new metrics, alter formulas, or expose raw personal data.

## Approved Visual Direction

### Executive Dashboard

- A compact product header and destination context.
- Four primary KPI cells in one clear band.
- A dominant visit-trend chart paired with a visible funnel summary.
- A ranked attractions table paired with experience quality.
- Charts and decisions appear in the first useful viewport on desktop.
- Data notes and filters remain available without dominating the page.

### Detailed Analytics

- The selected analysis category is visually obvious.
- Primary evidence occupies the wide column.
- Interpretive or planning insights occupy the narrow column.
- Supporting distributions and data tables follow below.
- Filters, sample size, source, and limitations remain visible and consistent.

### Mobile Dashboard

- Sidebar collapses to the existing mobile navigation.
- Filters become one disclosure row.
- KPI cards use a two-column grid where labels remain readable.
- Charts are structurally simplified for mobile instead of scaled-down desktop charts.
- Funnel stages become a vertical sequence.
- No horizontal page overflow at 375px.

## Visual Language

- Product register: calm, practical, trustworthy, research-ready.
- Palette: white, neutral gray, near-black, and brand orange `#B94727`.
- Teal, amber, rose, and blue are reserved for semantic analytics states.
- Corners: `4-6px` for panels and controls.
- Borders: one-pixel neutral separators.
- Shadows: optional and no more than `8px` blur.
- Typography: one Thai-capable sans family with fixed product UI sizing.
- No gradients, glassmorphism, oversized rounded cards, decorative blobs, or marketing composition.
- No nested cards. Use section bands, dividers, tables, and asymmetric layouts.

## Shared Information Architecture

Every analytics route uses this order:

1. Page identity and destination context.
2. Compact data context and URL-driven filters.
3. Analysis navigation.
4. Route-specific title, actions, and KPI strip.
5. Primary evidence and interpretation.
6. Supporting charts and accessible tables.
7. Data-quality alerts and limitations.

## Route Designs

### `/admin/dashboard`

- KPI: tourist profiles, recorded visits, certificates generated, survey completion.
- Primary: visit trend and QR-to-certificate-to-survey funnel.
- Secondary: ranked attractions and experience-quality summary.

### `/admin/dashboard/tourists`

- KPI: profiles represented, origin countries, Thai origin provinces, age groups with data.
- Primary: origin-country ranking and identity-provider distribution.
- Secondary: Thai origin provinces, age groups, and preferred languages.

### `/admin/dashboard/visits`

- KPI: average group size, answered group-size count, average nights, answered nights count.
- Primary: transport mode and travel purpose.
- Secondary: companion type and overnight status.

### `/admin/dashboard/attractions`

- KPI: visits represented, certificates, survey responses, attractions represented.
- Primary: ranked attraction performance and concentration interpretation.
- Secondary: auditable attraction performance table.

### `/admin/dashboard/expenses`

- KPI: estimated range, estimated minimum, estimated maximum, response count.
- Primary: spending-range distribution and methodology note.
- Secondary: expense-category distribution and accessible detail table.

### `/admin/dashboard/satisfaction`

- KPI: overall average, response count, revisit intention, recommendation intention.
- Primary: score summary and experience dimensions.
- Secondary: overall distribution and attraction comparison.

### `/admin/dashboard/funnel`

- KPI: QR scans, recorded visits, certificates generated, completed surveys.
- Primary: full stage funnel and largest valid drop-off.
- Secondary: conversion table and event-count limitation.

### `/admin/dashboard/sustainability`

- Primary: decision-oriented insights grouped by promotion, improvement, concentration, opportunity, and data quality.
- Every insight shows finding, evidence, suggested action, and confidence.
- No AI-generated or causal claim language.

## Analytics Integrity

- QR scans are funnel events, not visits.
- Tourist profiles are not verified unique people.
- Estimated spending is not revenue.
- Missing satisfaction is not zero.
- Zero or invalid rate denominators display no-data language.
- Existing `DashboardViewModel` remains the data contract for this phase.
- Do not add fake trend values, comparisons, heatmaps, or confidence measures.
- Tables remain available for chart verification and assistive technology.

## Responsive and Accessibility Requirements

- Desktop target: 1280px and 1440px.
- Mobile targets: 375x844 and 390x844.
- Minimum interactive target: 44px.
- Text contrast meets WCAG AA.
- Keyboard focus is visible.
- Tabs and wide tables may scroll inside their own containers only.
- Page-level horizontal overflow is prohibited.
- Every chart includes a semantic label, no-data state, and data-table equivalent where practical.

## Performance Constraints

- Do not add a new charting dependency for this phase.
- Reuse server-calculated aggregates.
- Keep client components limited to interaction or chart hover behavior.
- Avoid layout shifts by keeping chart dimensions stable.

## Acceptance Criteria

- The executive route visibly matches the approved generated composition rather than the previous stacked-card layout.
- All seven detailed analysis routes share one visual system while preserving their own decision purpose.
- Desktop and mobile screenshots show intentional layouts, not scaled variants.
- Existing permissions, filters, exports, metric definitions, and privacy boundaries remain unchanged.
- Focused tests, full lint, typecheck, full test suite, build, Impeccable detection, and browser smoke pass.

## Out of Scope

- New database migrations or analytics formulas.
- Real-time streaming metrics.
- Official arrival statistics.
- Predictive AI recommendations.
- Multi-province comparison before additional provinces are activated.
