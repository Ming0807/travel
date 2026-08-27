# Phase 22: Attraction-Level Analytics and Improvement Evidence

Status: Planned

Priority: P1 decision support

## Goal

Allow authorized staff to analyze each attraction independently and translate visitor evidence into traceable improvement work.

## Required Views

- Attraction overview with date, campaign, collection mode, and entry-channel filters
- Unique tourists, visits, repeat visits, certificates, stamps, and survey completion
- Funnel from entry to check-in, photo, certificate, optional survey, and research evaluation
- Tourist origin, age group, language, companion, transport, overnight, and visit-purpose distributions
- Self-reported expense range and category, never labelled as business revenue
- Overall and dimension-level satisfaction with denominator per metric
- Revisit, recommendation, comments, controlled issue categories, and data-quality coverage
- Trend comparison and transparent benchmark against selected peer attractions
- Improvement issue, owner, action, due date, status, baseline, and follow-up evidence

## Delivery Tasks

### Task 22.1: Metric Contract

- [ ] Define every attraction metric, unit, denominator, date field, source table, filters, missing-data rule, and decision use.

### Task 22.2: Query and Index Audit

- [ ] Audit existing summary views, repository queries, indexes, and collection-mode filters before adding schema.

### Task 22.3: Tested Read Models

- [ ] Implement typed, permission-aware attraction analytics read models with calculation regression tests.

### Task 22.4: Attraction Overview

- [ ] Build attraction selection, date/campaign/mode/channel filters, KPI summary, coverage, and comparison context.

### Task 22.5: Funnel and Engagement

- [ ] Add unique-tourist/visit-safe entry, check-in, photo, certificate, survey, research, stamp, and repeat-visit analysis.

### Task 22.6: Tourist and Travel Behavior

- [ ] Add privacy-safe origin, age, language, companion, transport, overnight, purpose, and time distributions.

### Task 22.7: Expense, Satisfaction, and Feedback

- [ ] Add self-reported expense, satisfaction dimensions, revisit/recommendation, comment coverage, and issue categories.

### Task 22.8: Improvement Workflow

- [ ] Connect evidence to reviewed issue, owner, action, baseline, due date, status, evidence, and follow-up monitoring.

### Task 22.9: Export and Privacy

- [ ] Add permission-checked de-identified exports with small-sample suppression and filter metadata.

### Task 22.10: Performance and QA

- [ ] Verify query plans, indexes, no-data/low-sample states, responsive charts, metric parity, and production build.

## Analytics Rules

- Every metric states unit, denominator, date field, source table, calculation, and missing-data rule.
- Suppress or qualify small samples; never imply representativeness or causality.
- Exclude simulated and internal pilot records by default from field-tourism claims.
- Support CSV/XLSX export only through existing permission and privacy boundaries.
- Drill-down may show operational records only to authorized roles; public analytics remain aggregated.

## Acceptance Criteria

- Staff can answer what is happening at one attraction, for whom, where the flow loses users, what visitors report, and what action should follow.
- Calculations match repository tests and dashboard metric documentation.
- Empty and low-sample states are honest and actionable.
