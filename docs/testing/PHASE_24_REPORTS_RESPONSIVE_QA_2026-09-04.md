# Phase 24 Reports and Responsive QA

Date: 2026-09-04. Scope: Task 24.9 analytical reports/saved views and the first
Task 24.10 shared-chart responsive slice. No database migration.

## Implemented

- Browser-local aggregate views with resolved dates, field/Pilot presets,
  controlled query metadata, corrupt-entry isolation and storage-error recovery.
- CSV/XLSX report metadata and union-column output, preserving columns introduced
  after the first analytical row. Explicit invalid formats are rejected.
- Authenticated export audits include denial/failure and occur after successful
  file generation. Low-sample attraction exports are blocked as a whole.
- Advanced filter values survive collapse and navigation; mobile has an in-panel
  apply action. Existing decimal score filters remain available.
- Shared bars show full Thai labels above the bars on small screens; score bars
  retain the 0-5 scale. Desktop axis abbreviations preserve Thai graphemes.
- Donut legends wrap without widening the page. Hidden desktop charts are not
  mounted at mobile widths. The export dialog scrolls within the viewport.

## Verification Evidence

- Full-suite checkpoint: 318 files, 2,272 tests passed. This was followed by UI
  refinements and focused regression runs, not a second full-suite run.
- Post-refinement targeted regression: 8 files, 59 tests passed; the compact-bar
  and Thai-label suite then passed 3 tests after its final assertion was added.
- TypeScript and targeted ESLint passed. Production build completed with 63
  generated static pages; dynamic routes remain dynamic.
- Actual component browser harness: normal, empty and low-sample fixtures at
  360, 390, 768, 1024 and 1440 px. All 15 cases had document scroll width equal to
  viewport width; the final sweep logged no browser errors or warnings.
- Normal fixtures had two visible SVG charts at mobile widths and five on wider
  screens. Empty fixtures had none; suppressed attraction series were omitted.
- At 360x700, the download button remained reachable inside the scrollable
  dialog; the advanced-filter form retained `pilot_only`, district 1 and score
  3.2. Screenshot artifacts are in ignored `output/playwright/phase24-*.png`.

## Limitations and Next Gate

The Vite harness imports real components and application CSS but uses synthetic
data and stubbed navigation. It does not prove authenticated Next.js routing,
font integration, live database parity, role permissions, or production latency.
Live smoke-test credentials were unavailable. No authentication was bypassed.

The local runtime is Node 26.1.0; the package declares Node 22.x. Build/tests
passed with an engine warning, but Node 22 release parity remains a release gate.
PDF/print layouts, full-page mobile ordering, complete accessibility/contrast
coverage and Task 24.11 query-plan baselines remain unchecked in the phase plan.
