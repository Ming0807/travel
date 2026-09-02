# Phase 21-22 Design: Research Pilot and Attraction Intelligence

## Decision

Implement two connected admin workspaces without changing the normal tourist reward flow:

1. **Research Control Center** owns approval evidence, ethics, pretest, mobile QA, version freeze, pilot review, and the activation decision.
2. **Attraction Intelligence Workspace** owns attraction-scoped evidence, transparent denominators, data-quality warnings, and links to the existing improvement workflow.

Research participation remains optional. Declining or withdrawing from research never blocks check-in, certificate, stamp, passport, or tourism survey behavior.

## Research Activation Model

Every study is explicitly classified as `pilot` or `final_collection`.

- A pilot study may deploy only `pilot_internal` or `simulated_usability` entry points.
- A final-collection study may use `field_observation`, but can activate only after required pilot evidence and an immutable freeze snapshot are recorded.
- Evidence records contain no participant names or raw responses.
- Freeze snapshots are immutable and record protocol, consent, notice, instrument, task, scoring, retention, withdrawal, language, inclusion, application revision, and database revision versions.
- Pilot decisions use `revise`, `repeat_pilot`, or `ready_for_field`. Only `ready_for_field` satisfies the final activation gate.

## Attraction Analytics Scope

The default claim scope includes operational visits and final-study `field_observation` records. It excludes `pilot_internal`, `simulated_usability`, and any session belonging to a pilot study.

Filters:

- attraction (required)
- date range based on `visits.visit_date`
- campaign/check-in code
- evidence scope (`field_claim`, `all_operational`, `pilot_only`, `simulated_only`)
- entry channel derived from funnel metadata/check-in context when available

Views:

- KPI and data-quality coverage
- visit trend and repeat behavior
- completion funnel using unique visits, never raw event counts
- tourist origin, age, language, companion, transport, overnight, and purpose
- self-reported expense range/category, never business revenue
- satisfaction dimensions with an independent denominator per metric
- revisit/recommend intention and comment coverage
- reviewed issues and improvement actions from the existing production workflow

## Privacy and Interpretation

- Aggregated segments below `n=10` are suppressed.
- Totals remain visible when permission policy permits, but segmented values are qualified.
- Every metric exposes its unit, denominator, date field, source, missing-data rule, and decision use.
- The UI states that pilot and observational findings describe association and observed behavior, not causation or province-wide representativeness.

## UX Direction

Use the admin visual language: white surfaces, near-black text, coral accent, restrained green for verified states, squared 4-8 px corners, clear table/chart hierarchy, and no decorative gradients. Mobile layouts stack controls, preserve 44 px targets, and turn wide evidence tables into horizontally scrollable regions.

## Acceptance

- No final field activation without evidence and freeze gates.
- No pilot/simulated records in default field claims.
- Attraction metrics are typed and regression-tested.
- Each chart states its denominator and no-data/low-sample condition.
- Existing improvement issues/actions remain the only production action workflow.
