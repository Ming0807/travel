# Phase 24 Executive and Attraction Visual QA

Date: 2026-09-04. Scope: executive decision overview and single-attraction
responsive hierarchy. No migration, dependency upgrade, or database mutation.

## Implemented

- Five compact outcome KPIs, wide visit trend, concise evidence disclosures,
  attraction comparison, experience quality, funnel and existing planning KPIs.
- Recharts radial score and stage bars; shared tooltip treatment and unique
  gradient IDs. No invented forecasts, benchmarks, revenue or visitor counts.
- Comparative scatter requires 30 responses per place and two eligible places
  before drawing reference lines. Pending places remain visible without scores.
- True even-count median; single-date caution; absent funnel stages no longer
  become zero conversion. All ratios retain their original event units.
- Links preserve supported scope. The narrower attraction-route contract is
  disclosed beside its link rather than implying audience-filter parity.
- Single-attraction headline KPIs reduced to four. Secondary metrics and action
  totals are flat rows; decisions appear ahead of detailed distributions.
- Detailed attraction distributions start collapsed below 640 px and defer
  their chart render until opened. Wide layouts keep all three groups open.
- Shared successful-query states now distinguish no records, filtered-to-zero,
  and incomplete page evidence; request and permission failures remain separate.
- Single-attraction channel, campaign, and check-in filters now use an optional
  disclosure. Campaign options are derived from check-in references, not typed
  as raw numeric IDs; mobile has a local submit action after the advanced fields.
- Executive brief and attraction-improvement review now have dedicated print/PDF
  layouts. Admin chrome, filters, and interactive controls are excluded while
  the analytical evidence and definitions remain visible.

## Browser Evidence

The loopback Vite harness imports actual production components and application
CSS, using explicitly synthetic typed DTOs. It has no database/auth adapter.

- Executive: normal, empty and low-sample states at 360, 390, 768, 1024, 1440 px.
- Attraction: the same 15-case viewport/state sweep.
- Both sweeps: document scroll width equals viewport width; no browser errors
  or warnings. An intrinsic-width hidden table defect was reproduced and fixed.
- Executive desktop has four actual Recharts surfaces; icon SVGs are excluded
  from chart counts. One-date and insufficient-comparison states do not fabricate
  another plotted series or reference line.
- Keyboard Enter opens evidence disclosures. Hovering an attraction point shows
  its full name, recorded visits, score and response count.
- Executive links were inspected for dates, evidence scope and fractional score.
- Screenshots: ignored `output/playwright/phase24-executive-*.png` and
  `output/playwright/phase24-attraction-*.png`.
- Final attraction check: 360 px and 1440 px both matched viewport scroll width,
  emitted no warning/error, and exposed closed/open detail groups respectively.
- Attraction filter default/active states at 360 px and 1440 px matched viewport
  width, preserved the selected NFC/campaign values, and emitted no warning/error.
- Chromium print emulation produced a three-page A4 landscape executive brief
  with five complete KPIs, paired charts/decision evidence, no clipped edge, and
  no interactive controls. This is presentation QA from synthetic aggregates;
  the attraction-review print route still requires authenticated production data.

## Verification Checkpoint

- Final focused regression checkpoint: 6 files/63 tests passed, covering the
  executive cockpit, overview, page states, attraction filter hierarchy,
  responsive attraction workspace, and shared dashboard UX.
- TypeScript and scoped ESLint passed after the final print and responsive-state
  implementation.
- Production build passed, including all 63 generated static pages.
- Earlier full-suite evidence is recorded in
  `PHASE_24_REPORTS_RESPONSIVE_QA_2026-09-04.md`; it is not a new full-suite run.

## Release Limitations

This is component-level visual evidence, not authenticated Next.js or production
sign-off. Role smoke tests, real database/export parity, performance baselines,
and Node 22 release parity remain open. Local Node is 26.1.0 and emits the known
engine warning. No authentication bypass or production write was used.

Other Phase 24 work remains tracked: complete advanced scope parity, query plans
and latency, authenticated accessibility/role checks, and controlled release.
The phase is not marked complete by these visual changes.
