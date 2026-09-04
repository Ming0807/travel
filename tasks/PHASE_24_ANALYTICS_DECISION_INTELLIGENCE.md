# Phase 24: Production Analytics Decision Intelligence

Status: In progress; core slices through Task 24.9 implemented, Task 24.10 responsive chart hardening underway; unchecked acceptance items remain open

Priority: P1 production decision support and research readiness

## Goal

Turn the existing dashboard, attraction analytics, and research analytics into one coherent decision workspace that helps authorized users understand what changed, judge whether the evidence is strong enough, investigate the cause, and assign a traceable next action.

This phase improves the product and presentation of existing metrics. It does not invent official tourism statistics, infer causation from observational data, or expose personal records through charts.

## Product Decision

Use a role-aware `Decision Intelligence Workspace` built on the current typed analytics services and Recharts components.

- Keep deterministic calculations and documented metric contracts as the source of truth.
- Organize pages by decisions and user questions, not by chart type.
- Use progressive disclosure: summary first, evidence second, detail and definitions on demand.
- Connect attraction findings to the existing issue and improvement-action workflow.
- Keep AI out of metric calculation and automated recommendations. A future AI summary may only draft text from already approved aggregate evidence and must always be human-reviewed.

## Primary Users and Questions

| User | Questions the workspace must answer |
|---|---|
| Executive or tourism agency | What changed, where is attention needed, and how reliable is the evidence? |
| Analyst or researcher | Which filters, denominators, exclusions, and instrument versions produced this result? |
| Attraction manager | What is happening at this attraction, what should be improved, who owns the work, and did it improve? |
| Business stakeholder | Which aggregate visitor segments, travel behavior, and self-reported spending signals are useful for planning? |

## Information Architecture

The dashboard navigation remains compatible with existing URLs, but labels and page hierarchy follow this order:

1. Executive overview
2. Audience
3. Journey and conversion
4. Visitor experience
5. Economic signals
6. Attraction intelligence
7. Sustainability and action center
8. Research quality and pilot monitoring

The first screen of every area uses the same reading order:

`Scope and freshness -> key outcome -> comparison -> evidence strength -> recommended next action -> drill-down`

## Global Analytics Rules

- QR/NFC/direct entry, visits, tourist profiles, certificates, and survey responses remain separate units.
- QR scans are not visits; tourist profiles are not verified people.
- Self-reported spending is never labelled as revenue or economic impact.
- Missing values are excluded from the relevant denominator and never converted to zero.
- Values below the configured small-cell threshold are suppressed in charts, tables, exports, and narratives.
- Field, pilot, and simulated records remain visibly separated; field claims exclude pilot and simulated data by default.
- Comparisons are descriptive unless the research design explicitly supports causal inference.
- Every chart retains a text summary and accessible table or ranked-list equivalent.
- New charts are allowed only when they answer a documented decision question.

## Delivery Tasks

### Task 24.1: Analytics Product Audit and Baseline

- [x] Inventory every admin/public/research analytics route, metric, action, permission, query source, and responsive state.
- [ ] Reconcile obsolete Phase 09, 16A, 16B, 20, 21, and 22 task statuses against the current repository so work is not repeated.
- [ ] Capture baseline screenshots at 360, 390, 768, 1024, and 1440 px for normal, no-data, low-sample, loading, and error states.
- [x] Record duplicated page state, filter, card, and legacy chart components before changing shared behavior.
- [x] Add an approved page-by-page decision-question matrix to `docs/dashboard/DASHBOARD_REQUIREMENTS.md`.

**Acceptance:** every visible metric and control has an owner, decision purpose, data source, permission boundary, and target viewport.

### Task 24.2: Unified Navigation and Page States

- [x] Redesign dashboard navigation around the information architecture above while preserving existing route compatibility.
- [x] Add one reusable page header with title, purpose, data-as-of time, freshness state, active scope, and page actions.
- [x] Replace duplicated route-level dashboard service failure markup with shared typed page states.
- [x] Distinguish no records, filtered-to-zero, temporarily unavailable, permission denied, and incomplete-data states.
- [ ] Remove legacy analytics components only after repository usage tests prove they have no consumers.

**Acceptance:** users can tell where they are, what data they are viewing, how current it is, and how to recover from every empty or error state.

### Task 24.3: Filter, Comparison, and URL Contract

- [x] Keep date range and primary geography/attraction in a compact sticky filter bar on desktop and a collapsible bar on mobile.
- [x] Move audience, travel behavior, district, attraction type, and satisfaction range into a responsive advanced filter panel.
- [x] Move campaign, collection mode, and entry channel into the corresponding specialized advanced filter panels.
- [ ] Replace raw numeric IDs with searchable controlled options.
- [x] Preserve and safely translate the validated shared scope across dashboard tabs, desktop sidebar, and mobile navigation.
- [ ] Preserve all applied filters across export, drill-down, and browser history.
- [x] Add active-filter chips with clear-one and clear-all behavior.
- [x] Add named presets for field evidence and pilot QA.
- [x] Add an opt-in current-vs-previous-period contract with equal inclusive date ranges and safe zero/null handling.
- [ ] Add attraction comparison against the eligible peer median.

**Acceptance:** the same URL reproduces the same scope, exports match the visible scope, and invalid or unauthorized filters fail safely.

### Task 24.4: Executive Decision Brief

- [x] Present five outcome KPIs with prior-period delta, denominator, and evidence-strength label.
- [x] Add a concise deterministic brief answering `what changed`, `why it matters`, `evidence`, and `next action` without causal claims.
- [x] Keep visit trend, attraction matrix, experience quality, and funnel health as the primary visual sequence.
- [ ] Add target or benchmark markers only when the target source and comparison population are documented.
- [x] Prevent one-point series, suppressed groups, or weak samples from producing trend language.

**Acceptance:** an executive can identify the top three priorities and their limitations in under one minute without opening another page.

### Task 24.5: Attraction Comparison Workbench

- [x] Retain the complete Phase 22 single-attraction view and add comparison against up to three eligible attractions.
- [x] Compare visits, survey coverage, satisfaction dimensions, revisit/recommendation intent, funnel completion, and self-reported spending signals.
- [x] Show peer eligibility, rank denominator, date alignment, and suppression status beside every comparison.
- [x] Allow a chart point, low score, or funnel drop-off to open a prefilled reviewed issue draft without copying private comments.
- [x] Show open actions, owner, due date, overdue status, baseline, follow-up evidence, and outcome in one timeline.

**Acceptance:** an attraction manager can move from a supported finding to an assigned action and later compare follow-up evidence without leaving the workflow context.

### Task 24.6: Audience, Journey, Experience, and Economic Modules

- [x] Standardize chart selection: line/area for time, horizontal bar for ranked categories, funnel for ordered stages, scatter/quadrant for attraction decisions, and bullet/progress visuals for coverage or targets.
- [x] Add click-through from aggregate marks to a privacy-safe filtered detail table for authorized roles.
- [x] Pair each distribution with response coverage, missing rate, sample strength, and plain-language interpretation.
- [x] Add segment comparison only when both groups pass privacy and minimum-sample rules.
- [x] Keep expenses explicitly self-reported and show range/category coverage before interpretation.

**Acceptance:** each module answers a distinct planning question, uses the correct denominator, and avoids redundant charts.

### Task 24.7: Data Quality and Confidence Center

- [x] Add one shared quality strip for freshness, field/pilot/simulated scope, sample size, coverage, missingness, suppression, and truncation.
- [x] Add a quality details drawer showing source tables/views, metric version, date field, refresh time, and exclusions.
- [x] Grade evidence as insufficient, limited, usable, or strong using documented deterministic thresholds.
- [x] Block export and narrative claims when reads are truncated or required quality gates fail.
- [x] Surface data collection gaps as operational tasks rather than silently hiding them.

**Acceptance:** every conclusion exposes enough context for an advisor or analyst to audit why it can or cannot be used.

### Task 24.8: Research Pilot Monitoring

- [x] Separate participant recruitment, consent, completion, instrument burden, construct scores, and operator decision-task outcomes into a clear research sequence.
- [x] Add abandonment by evaluation step and median completion time against the approved pilot threshold.
- [x] Compare collection modes and participant types only as descriptive associations with suppression applied.
- [x] Add an instrument-version and freeze-status banner so mixed versions cannot be interpreted as one instrument accidentally.
- [x] Produce a pilot readiness checklist that links evidence records rather than relying on free-text claims.

**Acceptance:** the research team can make an evidence-based go/no-go decision before final field collection.

### Task 24.9: Reports, Exports, and Saved Views

- [x] Add saved aggregate views for authorized roles without saving raw personal identifiers in filter metadata.
- [x] Export visible aggregates with title, scope, generated-at time, denominator, exclusions, suppression note, and metric-version metadata.
- [x] Add print/PDF layouts for executive brief and attraction improvement review only after browser rendering matches the screen metrics.
- [x] Audit every authenticated export attempt and enforce existing permission boundaries.
- [x] Keep CSV/XLSX as analytical formats and PDF as a presentation format; do not make screenshots the source dataset.

**Acceptance:** another analyst can reproduce and correctly interpret a report from its embedded scope and definitions.

### Task 24.10: Responsive and Accessible Visual System

2026-09-04 checkpoint: shared category/attraction bars now have a full-label
mobile presentation, donut legends no longer widen small screens, and collapsed
advanced filters retain their values. A loopback-only component harness checks
normal, empty and low-sample fixtures at 360/390/768/1024/1440 px. This is component
visual evidence, not authenticated dashboard or role/permission sign-off.

Executive and single-attraction continuation (2026-09-04):

- [x] Restore the executive experience summary and existing supporting KPIs (spending estimate, stamps, top attraction) without creating new source metrics.
- [x] Replace cramped executive funnel chevrons with Recharts stage bars and full-label mobile rows.
- [x] Use a Recharts score ring, distinct trend gradient IDs, and explicit single-date limitations.
- [x] Keep low-response attractions visible as awaiting evidence; require 30 responses for comparative scatter points and two eligible places for reference lines.
- [x] Move single-attraction secondary KPIs into flat evidence rows and bring trend, interpretation and improvement actions ahead of detailed distributions.
- [x] Add executive drill-down links with shared scope translation; explicitly disclose the narrower attraction-route filter contract.
- [x] Collapse detailed single-attraction distributions below 640 px and defer hidden chart rendering; keep them open on wide layouts.
- [x] Add shared page-state recovery banners without turning missing evidence into zero or conflating query/permission failures with empty data.
- [ ] Complete authenticated browser QA and the remaining cross-page accessibility/release gates below.

- [ ] Define dashboard tokens for surfaces, borders, typography, series colors, semantic states, chart grids, tooltips, and focus states.
- [ ] Use orange/white/black as the product identity and restrained teal, green, amber, rose, and blue only for analytical meaning.
- [ ] Use low-radius panels, stable chart heights, no nested decorative cards, and no excessive gradients.
- [ ] On mobile, order content as summary, primary chart, interpretation, action; move advanced filters to a sheet/drawer.
- [ ] Verify keyboard navigation, visible focus, non-color cues, contrast, long Thai labels, chart summaries, and accessible tables.

**Acceptance:** no overlap, clipped labels, horizontal page overflow, color-only meaning, or inaccessible chart content at supported viewports.

### Task 24.11: Performance and Read Models

- [ ] Close Phase 22 query-plan verification using the exact Supabase Session Pooler URL.
- [ ] Record query latency and row-scan baselines for executive, attraction, research, and export scopes.
- [ ] Add or revise indexes only from measured query plans.
- [ ] Introduce daily summary/materialized read models only when bounded live queries miss the documented budget.
- [ ] Show summary freshness and refresh failure without substituting stale data silently.
- [ ] Keep chart libraries client-isolated so analytics pages do not move unrelated admin code into the client bundle.

**Acceptance:** normal filtered pages meet the documented server/query budget at realistic pilot volume and remain correct when summary refresh is delayed.

### Task 24.12: Production QA and Controlled Release

- [ ] Add calculation regression tests for period comparison, peer eligibility, suppression, missingness, and evidence grades.
- [ ] Add component tests for filter persistence, drill-down, error recovery, action creation, and export parity.
- [ ] Add Playwright visual regression for 360, 390, 768, 1024, and 1440 px across normal, no-data, low-sample, loading, and error states.
- [ ] Run authenticated role/permission smoke tests and verify no private identifier is present in HTML, chart props, logs, or exports.
- [ ] Run TypeScript, ESLint, focused tests, full tests at the phase gate, production build, and Lighthouse performance/accessibility checks.
- [ ] Release behind a reversible analytics UI flag, compare production metrics, and document rollback criteria.

**Acceptance:** release evidence proves metric correctness, privacy, accessibility, responsive quality, performance, and rollback readiness.

## Implementation Order

1. Tasks 24.1-24.3 establish the shared product foundation.
2. Tasks 24.4 and 24.7 make the executive view and evidence quality trustworthy.
3. Tasks 24.5-24.6 complete operational decision support.
4. Task 24.8 prepares the approved research pilot without mixing field and simulated claims.
5. Tasks 24.9-24.11 harden reporting and scale.
6. Task 24.12 is the production gate and is not deferred to a later phase.

Phase 21 operational approvals and participant preparation may proceed in parallel. Phase 23 NFC implementation begins after Tasks 24.1-24.3 lock the shared entry-channel filter and analytics contract.

## Definition of Done

- The interface is understandable without dashboard training and supports the four primary user roles.
- Every metric, comparison, narrative, drill-down, and export uses the same validated scope contract.
- Low samples, missing data, simulated records, and stale/truncated reads are visible and handled honestly.
- A supported attraction insight can become an owned improvement action with follow-up evidence.
- Research views support pilot go/no-go decisions without causal overclaiming.
- Responsive, accessibility, privacy, calculation, performance, and production-build gates pass.

## Estimated Schedule

| Workstream | Estimate |
|---|---:|
| Audit, architecture, shared filters, and page states | 4-6 working days |
| Executive and attraction decision workspaces | 5-7 working days |
| Audience, journey, experience, economic, and research modules | 5-7 working days |
| Reports, performance, accessibility, and production QA | 5-7 working days |

Expected Phase 24 duration: 3-4 focused weeks. Phase 21 field operations and advisor evidence can run in parallel. The broader research project remains achievable in 2-3 months if NFC rollout and optional AI features do not interrupt pilot activation and analytics QA.
