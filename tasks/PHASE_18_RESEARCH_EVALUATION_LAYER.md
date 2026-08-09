# Phase 18: Research Evaluation and Decision-Support Evidence

Status: Core technical implementation complete; final instrument/task content, authenticated mobile E2E, pilot, freeze, and field collection remain gated

Priority: P0 before final research data collection

Proposed: 2026-08-08

## Goal

Add a privacy-aware, versioned research layer that evaluates the real Smart Tourism system, separates real and simulated data, correlates behavioral evidence safely, measures whether tourism operators can make better decisions from the dashboard, and helps attraction managers turn feedback into traceable improvement actions.

## Source of Truth

- `docs/research/RESEARCH_BLUEPRINT.md`
- `docs/superpowers/specs/2026-08-08-research-evaluation-layer-design.md`
- `docs/security/PDPA_PRIVACY_DESIGN.md`
- `docs/security/CONSENT_MANAGEMENT.md`
- `docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md`

## Non-Goals

- Turning every production visit into research participation
- Blocking certificates when research consent is declined
- Mixing students simulating travel with real-tourist analytics
- Calling self-reported spending business revenue
- Treating funnel events as unique participants
- Building SEM or claiming causality without adequate design and sample size
- Collecting names, identity-provider IDs, photos, or private storage paths in research exports
- Adding paid/external runtime AI, opaque recommendation scores, or LLM processing of raw tourist feedback

## Workstream 18A: Protocol and Instrument Lock

- [ ] Advisor approves final title and geographic boundary.
- [ ] Advisor approves objectives, RQs, and confirmatory versus exploratory status.
- [ ] Sampling method and sample-size/power rationale are documented.
- [ ] Institutional ethics/research approval requirement is confirmed.
- [ ] Tourist instrument receives expert review and revision history.
- [ ] Whole-journey burden targets and pre-freeze item-reduction triggers are approved.
- [ ] Operator tasks, scoring rules, and interview guide are approved.
- [ ] Attraction-manager tasks, issue categories, thresholds, and follow-up rules are approved.
- [ ] Research notice, consent, withdrawal, retention, and exclusion rules are approved.
- [ ] Instrument version 1 and consent version 1 are frozen before final collection.

Exit gate: generic additive/versioned infrastructure may be built and tested, but no final instrument may be published, no production study may be activated, and no field collection may begin before all items above are signed off.

## Workstream 18B: Research Database Contract

- [x] Create one additive migration for `research_studies`.
- [x] Create versioned `research_instruments` and `research_items`.
- [x] Create `research_sessions` with participant type, collection mode, visit link, status, and inclusion flag.
- [x] Create research-specific consent and withdrawal records.
- [x] Create response and item-answer tables with strict scale/type constraints.
- [x] Create versioned operator-task and task-attempt tables.
- [x] Add study-to-check-in-code relation with foreign keys; do not rely on the orphan campaign placeholder.
- [x] Add typed research-session funnel correlation where approved.
- [x] Add unique constraints for one instrument response per session/version.
- [x] Add indexes for study, collection mode, status, submitted time, visit, and instrument.
- [x] Enable RLS and restrict writes/reads to approved server/admin boundaries.
- [x] Update data dictionary, ERD, privacy docs, and migration ledger.

Likely files:

- `supabase/migrations/<timestamp>_add_research_evaluation_layer.sql`
- `docs/database/DATA_DICTIONARY.md`
- `docs/database/ERD_OVERVIEW.md`
- `docs/security/CONSENT_MANAGEMENT.md`
- `docs/database/SUPABASE_SCHEMA_CHECKLIST.md`

## Workstream 18C: Operational Data-Quality Corrections

- [x] Add a facility-score decision that matches schema, survey UI, transaction, exports, and dashboards.
- [x] Remove silent `th` measurement bias for preferred language.
- [x] Auto-detect browser/request language and allow an explicit change.
- [x] Record whether language was detected or selected if the approved schema needs provenance.
- [x] Keep expense-range labels explicitly self-reported and non-revenue.
- [ ] If approved, add normalized multi-category expense selection with one primary and at most three categories.
- [x] Version tourism survey fields used during research collection.
- [x] Add regression tests proving missing values remain `null`, not zero or a fabricated default.

Likely files:

- `components/checkin/MinimalForm.tsx`
- `components/survey/MicroSurveyForm.tsx`
- `lib/validation/checkin.ts`
- `lib/validation/survey.ts`
- `lib/repositories/tourist.repository.ts`
- `lib/repositories/survey.repository.ts`
- a new additive survey/data-quality migration

## Workstream 18D: Tourist Research UX

- [x] Add an optional Thai-first research invitation for active study-linked check-ins.
- [x] Declining invitation continues the normal flow with no research session.
- [x] Add clear consent summary, full notice, contact, retention, and withdrawal links.
- [x] Create a research session only after valid consent.
- [x] Preserve the existing minimal check-in, photo, certificate, stamp, and tourism-survey value sequence.
- [x] Display realistic time estimates and progress for both optional forms.
- [x] Do not require tourism survey and research evaluation in one uninterrupted session.
- [x] Show research evaluation only to eligible consented sessions.
- [x] Render 5-point agreement controls with construct-neutral grouping and progress feedback.
- [x] Prevent duplicate submissions and preserve an already-completed state.
- [x] Handle weak network, refresh, back navigation, and expired/inactive studies.
- [x] Meet keyboard, screen-reader, focus, touch-target, and mobile safe-area requirements.
- [ ] Add unit, integration, and mobile E2E tests for accept, decline, submit, retry, and withdrawal paths.

Proposed routes:

- `/research/[studyCode]/invite`
- `/visit/[visitId]/evaluation`
- `/research/withdraw/[sessionCode]`

## Workstream 18E: Operator and Attraction-Manager Evaluation UX

- [x] Add admin/researcher controls to open an operator evaluation session.
- [x] Present fixed dashboard tasks without revealing the expected answer.
- [x] Capture task start/end, outcome, confidence, and coded notes.
- [x] Provide an operator evaluation instrument and interview-note workflow.
- [x] Ensure operator records do not require a tourist profile.
- [x] Provide the production site-manager workflow needed to inspect evidence, create an improvement action, and select a follow-up measure; final task wording remains an 18A approval item.
- [ ] Add tests for task ordering, timer persistence, completion, and role permissions.

## Workstream 18F: Research Analytics Workspace

- [x] Add `/admin/research` study list and readiness status.
- [x] Add study detail with collection-mode and date filters.
- [x] Add recruitment, consent, completion, withdrawal, exclusion, and missingness metrics.
- [x] Add unique-session funnel conversion, drop-off, and elapsed-time analysis.
- [x] Add construct/item distributions and reliability-ready output.
- [x] Add real-field tourism analysis with simulated/pilot data excluded by default.
- [x] Add incentive engagement and optional-data completion analysis using Certificate as the observable value-delivery denominator, with no causal claim.
- [x] Add operator task success, time, confidence, and theme summary.
- [x] Add attraction feedback dimensions, coverage, trends, controlled issue categories, and anonymized evidence drill-down.
- [x] Add reviewed improvement issues with transparent qualification rules and no opaque score.
- [x] Add action owner, priority, due date, status, baseline period, completion evidence, and follow-up period.
- [x] Implement `attraction_feedback_issues` and `attraction_improvement_actions` as production records, not research responses.
- [x] Keep issue categorization human-reviewed and rule-based for this phase.
- [x] Show before/after results as descriptive monitoring, not causal proof.
- [x] Display denominator, collection mode, submitted instrument versions, and date scope at metric or workspace level.
- [x] Apply small-sample suppression and no-data states.
- [x] Update dashboard metric dictionary with formulas and interpretation limits.

## Workstream 18G: Research Export and Reproducibility

- [x] Export study-scoped participant, response, answer, funnel, tourism, and operator-task datasets.
- [x] Replace tourist IDs with study participant codes.
- [x] Exclude display names, identity providers, user identifiers, photos, signed URLs, IP/user-agent hashes, and private paths.
- [x] Include study code, protocol version, consent version, instrument version, collection mode, inclusion status, and export timestamp.
- [x] Suppress or reject unsafe small-group exports according to policy.
- [x] Generate a data dictionary and analysis-ready codebook with each export.
- [x] Add export permission, audit-log, injection, formula-injection, and privacy regression tests.

## Workstream 18H: Pilot, Freeze, and Field Release

- [ ] Seed only a dedicated non-production research study for automated tests.
- [ ] Complete cognitive pretest and record item misunderstandings.
- [ ] Measure minimal-form, tourism-survey, evaluation, combined optional time, and stage abandonment.
- [ ] Trigger expert-led item reduction before freeze when approved burden gates fail.
- [ ] Complete end-to-end pilot on representative Android, iPhone, and desktop browsers.
- [ ] Verify funnel timing and research-session correlation against manual observation.
- [ ] Confirm pilot/internal records are excluded from final dashboards and exports.
- [ ] Freeze protocol, consent, instrument, tasks, dashboard formulas, and export schema.
- [ ] Record the exact production migration versions and deployment ID before collection.
- [ ] Run field-readiness checklist with advisor sign-off.

## Verification Matrix

- `git diff --check`
- ESLint on every changed TS/TSX file with 0 errors and 0 warnings
- `npm run typecheck`
- targeted research repository/action/component tests
- full `npm test -- --run`
- authenticated Playwright tests for tourist and research-admin flows
- `npm run build`
- post-build `next-env.d.ts` diff check
- Supabase migration verification against staging before production
- privacy review of a real generated research export
- mobile visual QA at 360, 375, 390, and 430 CSS pixels

## Definition of Done

- Research participation is voluntary and independently consented.
- Real, simulated, and pilot records cannot be silently combined.
- Every response and result is traceable to immutable study/instrument versions.
- Session-level behavior and self-reported evaluation can be analyzed without exposing identity.
- Operational and research dashboards have explicit, non-conflicting metric definitions.
- Operator decision-support outcomes are measured by tasks, not satisfaction alone.
- Attraction managers can move from privacy-safe feedback evidence to an owned, auditable improvement action and follow-up view.
- Production recommendations are explainable and reproducible without a paid AI dependency.
- Research evaluation length is justified by pilot burden evidence, not by item count alone.
- The final export is de-identified, documented, reproducible, and approved for analysis.
- Pilot records are excluded and the collection version is frozen before final fieldwork.

## Estimated Delivery

- Focused engineering work: 4-6 weeks for a three-person team, including the attraction-improvement workflow.
- Expert review, pilot, and instrument freeze: 1-2 weeks.
- Field collection: 2-3 weeks minimum.
- Analysis and report drafting: 1-2 weeks.
- Recommended total: 10-12 weeks, with manager task evaluation inside the study period.
- Compressed pilot: 8 weeks only if attraction follow-up is limited to workflow/task evaluation rather than mature before/after outcome evidence.
