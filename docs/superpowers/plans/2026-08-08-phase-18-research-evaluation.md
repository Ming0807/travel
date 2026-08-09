# Phase 18 Research Evaluation Layer Implementation Plan

> **Execution rule:** Deliver one reviewable batch at a time with RED-GREEN-REFACTOR tests. The owner has approved technical implementation, but final instrument wording, research activation, and field collection remain blocked until advisor/ethics approval and version freeze.

**Goal:** Add a privacy-aware and versioned research layer to the existing Smart Tourism production system, correct operational data quality before fieldwork, evaluate dashboard decision support, and give attraction managers a permanent feedback-to-action workflow.

**Architecture:** Keep operational tourism records separate from research participation. A normal check-in never requires research consent. `research_studies` own immutable instrument and task versions; `research_sessions` are the unit for consented participation and correlation. Production attraction issues/actions are separate operational records that may be referenced by stakeholder evaluation but are never treated as survey responses. All privileged writes use server-only repositories/actions, RLS remains deny-by-default, and exports use participant codes rather than tourist identifiers.

**Release boundary:** Phase 18 engineering may create generic/versioned contracts and inactive test fixtures. Do not seed the final 22-item instrument, activate a production study, or collect final research data before advisor approval.

## Product and Research Invariants

- Declining research never blocks check-in, photo, certificate, stamp, passport, or leaderboard.
- Operational consent and research consent are different records with different purposes and retention rules.
- `field_observation`, `simulated_usability`, and `pilot_internal` cannot be silently combined.
- Funnel events are events, not unique people; research metrics use distinct eligible sessions as denominator.
- Missing language and scores remain `null`; they are never converted to Thai or zero for convenience.
- `facility_score` becomes a current survey dimension only when form, validation, transaction, analytics, export, and documentation ship together.
- Final research items are immutable after an instrument version is published.
- One session may submit each instrument version once; retries are idempotent.
- Research exports exclude names, identities, photos, private paths, IP/user-agent hashes, and raw tourist/visit identifiers.
- Attraction feedback issues and improvement actions are permanent production records with human-reviewed categories and auditable status changes.
- Small-sample suppression is enforced in research analytics and exports, not merely explained in UI text.
- Runtime AI is not required for Phase 18; classifications and recommendations remain transparent, rule-based, and human-reviewed.

## Release Sequence

### Task 1: Freeze the Technical Contract

**Files**

- Update `tasks/PHASE_18_RESEARCH_EVALUATION_LAYER.md`
- Update `docs/research/RESEARCH_BLUEPRINT.md`
- Add this plan

**Acceptance criteria**

- [x] Mark technical foundation as approved while keeping instrument activation and field collection gated.
- [x] Record table ownership, status vocabularies, retention boundary, role permissions, and export exclusions.
- [x] Define migration order and rollback-safe additive boundaries.
- [x] Keep unrelated Phase 16/backlog work paused.

### Task 2: Research Core Database Contract

**Test first**

- Create `tests/unit/research-core-migration.test.ts`.
- Assert tables, checks, unique constraints, immutable version rules, RLS, indexes, grants, and no public access.
- Run the focused test and confirm RED because the migration does not exist.

**Implementation**

- Create `supabase/migrations/20260808000000_add_research_core.sql`.
- Add `research_studies`, `research_instruments`, `research_items`, `research_sessions`, `research_consents`, `research_responses`, `research_answers`, `research_operator_tasks`, `research_operator_task_attempts`, and `research_checkin_codes`.
- Add typed nullable `research_session_id` to `funnel_events`; never use JSON metadata as the primary correlation contract.
- Add `research.read`, `research.manage`, and `research.export` permissions; grant only to existing privileged roles that should receive them.
- Add immutable/version/status constraints and one-response-per-session/version uniqueness.
- Enable RLS on every new table. Grant direct table access only to `service_role`; admin access remains server-mediated and permission checked.
- Do not seed final questionnaire wording or create an active production study.

**Verification**

- Migration contract test GREEN.
- Existing migration-state and RBAC tests remain GREEN.
- Manual SQL review for FK deletion semantics, PII minimization, and index selectivity.

### Task 3: Operational Survey and Language Data Quality

**Test first**

- Extend `tests/unit/survey-validation-extended.test.ts` for `facilityScore` and null preservation.
- Extend `tests/unit/survey-transaction-repository.test.ts` for the RPC parameter.
- Extend `tests/unit/survey-transaction-migration.test.ts` for atomic facility persistence and survey instrument version.
- Add focused check-in language tests proving missing language is `null` and detected/selected language is explicit.
- Confirm focused tests RED.

**Implementation**

- Create `supabase/migrations/20260808001000_harden_research_data_quality.sql`.
- Add `tourists.preferred_language_source` with controlled values and keep `preferred_language` nullable.
- Add a version identifier to tourism survey records used during research collection.
- Replace `submit_post_certificate_survey` atomically with `p_facility_score` and survey version support; retain all existing validation, ownership, idempotency, expense upsert, and funnel behavior.
- Add `facilityScore` to validation, action mapping, repository, current survey UI, admin detail/export, summary refresh, dashboard service/view model, and metric dictionary.
- Auto-detect supported browser/request language and allow an explicit selection in the reusable minimal profile form.
- Remove every silent `preferredLanguage || "th"` fallback in production paths.
- Keep expense range labelled as self-reported and not revenue. Defer multi-category expenses until advisor approves the additional burden.

**UX acceptance criteria**

- [x] Facility is one compact 1-5 rating, skippable like the other tourism questions.
- [x] Language defaults from browser/request context but can be changed without extra navigation.
- [x] Returning tourists see and may update the stored language without re-entering the whole profile.
- [x] No fabricated Thai value is saved when detection is unavailable.

### Task 4: Research Domain Services and Voluntary Consent

**Test first**

- Add repository/service tests for inactive study, invalid collection mode, decline, consent, withdrawal, expiry, duplicate session, duplicate response, and ownership.
- Verify no research session is created before affirmative consent.

**Implementation**

- Add `lib/validation/research.ts`.
- Add `lib/repositories/research.repository.ts` and `lib/services/research.service.ts`.
- Add server actions for invitation decision, response submission, and withdrawal.
- Use opaque public session codes; never expose sequential IDs or tourist IDs.
- Link visits/funnel events only after an approved consent boundary.
- Withdrawal marks research inclusion false and records reason/time without deleting independently lawful operational records.

### Task 5: Tourist Research Journey

**Test first**

- Add component and Playwright tests for invite accept/decline, refresh, retry, completed state, expired study, withdrawal, and 360/375/390/430 px layouts.

**Implementation**

- Add `/research/[studyCode]/invite`.
- Add `/visit/[visitId]/evaluation`.
- Add `/research/withdraw/[sessionCode]`.
- Present Thai-first purpose, expected time, voluntary status, retention, contact, and withdrawal before consent.
- Show evaluation only for eligible consented sessions.
- Render 5-point controls with stable touch targets, progress, save/retry, back-navigation protection, and clear completion state.
- Preserve reward-first flow and never require both optional surveys in one uninterrupted session.
- Record start, submit, skip/leave, and elapsed-time evidence against the research session.

**Activation gate**

- Build generic components from instrument records.
- Do not publish the final instrument or activate study routing until the advisor-approved version is inserted through the admin workflow.

### Task 6: Production Attraction Feedback-to-Action Contract

**Test first**

- Add `tests/unit/attraction-improvement-migration.test.ts`.
- Add permission, repository, state-transition, evidence-window, and audit tests.

**Implementation**

- Create `supabase/migrations/20260808002000_add_attraction_improvement_workflow.sql`.
- Add `attraction_feedback_issues`, `attraction_improvement_actions`, and action history/evidence records.
- Use controlled dimensions/categories, explicit evidence periods, response counts, baseline values, owner, priority, due date, status, follow-up period, and closure notes.
- Add `attraction_feedback.read` and `attraction_improvement.manage` permissions.
- Enforce state transitions server-side and keep action history append-only.
- Do not copy raw tourist comments into a management issue by default; reference privacy-safe aggregates and separately permission-gated excerpts only when approved.

### Task 7: Attraction Manager UX

**Test first**

- Add action/repository/component tests for create issue, create action, assign owner, change status, complete, reopen, filters, and permission-restricted state.

**Implementation**

- Add an improvement workspace under the relevant attraction admin detail.
- Show evidence first: dimension, period, valid-response denominator, trend, threshold, and limitation.
- Let an authorized manager accept/dismiss a suggested issue with a required rationale.
- Provide an owner-and-due-date action workflow with compact status history.
- Show descriptive baseline/follow-up monitoring without claiming causality.
- Keep Thai-first operational copy and link back to satisfaction analytics with preserved filters.

### Task 8: Operator Evaluation and Research Admin

**Test first**

- Add permission and task-order tests.
- Add timer persistence, task completion, confidence, and missing-data tests.

**Implementation**

- Add `/admin/research` study list/readiness workspace.
- Add study detail with collection-mode, instrument-version, date, inclusion, and participant-type filters.
- Add operator session/task runner that does not require a tourist profile.
- Capture task start/end, outcome, confidence, coded notes, and interview summary.
- Include an attraction-manager task that turns evidence into an improvement action and chooses a follow-up measure.

### Task 9: Research Analytics and De-identified Export

**Test first**

- Add formula tests for recruitment, consent, completion, withdrawal, exclusion, missingness, funnel conversion, elapsed time, and construct distributions.
- Add privacy tests that reject raw IDs, display names, identity providers, photos, paths, formula injection, and unsafe small groups.

**Implementation**

- Add bounded study-scoped repository/RPC contracts; do not load unbounded raw rows in the client.
- Exclude simulated/internal modes by default from real-field views.
- Display denominator, mode, study, instrument version, and date scope for every metric.
- Apply small-sample suppression before returning unsafe group breakdowns.
- Export participant, response, answer, funnel, tourism, and operator-task datasets with opaque participant codes plus a versioned codebook.
- Audit every export request and require `research.export`.

### Task 10: Pilot Readiness, Documentation, and Release

**Verification matrix**

- `git diff --check`
- ESLint on every changed TS/TSX file with 0 errors and 0 warnings
- `npm run typecheck`
- all focused migration/repository/service/component tests
- full `npm test -- --run`
- authenticated tourist/admin Playwright flows
- `npm run build`
- post-build `next-env.d.ts` diff check
- mobile visual QA at 360, 375, 390, and 430 CSS pixels
- staging migration apply and rollback rehearsal before production SQL
- privacy review of a generated export

**Documentation**

- Update `docs/database/DATA_DICTIONARY.md` and `docs/database/ERD_OVERVIEW.md`.
- Update `docs/security/CONSENT_MANAGEMENT.md`, PDPA, retention, RBAC, and audit documentation.
- Update `docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md`.
- Update route/API/admin workflow documentation.
- Keep `docs/database/SUPABASE_SCHEMA_CHECKLIST.md` as the truthful owner-side SQL ledger.

**Field-release gate**

- [ ] Advisor/ethics requirements confirmed.
- [ ] Final protocol, consent, instruments, tasks, formulas, and exports version-frozen.
- [ ] Cognitive pretest completed.
- [ ] Burden triggers reviewed; item reduction occurs only before freeze.
- [ ] Pilot/internal records excluded from final views and exports.
- [ ] Exact production migration versions and deployment ID recorded.

## Migration Ledger

Created locally and verified by contract/unit tests, but not marked as applied until owner-side Supabase verification:

- `20260808000000_add_research_core.sql`
- `20260808001000_harden_research_data_quality.sql`
- `20260808002000_add_attraction_improvement_workflow.sql`

Never mark a migration as applied based on a local file, unit test, or successful Next.js build. Owner-side Supabase verification is required after staging review.

## Commit Strategy

1. `docs: lock phase 18 technical execution contract`
2. `feat: add versioned research database core`
3. `fix: align tourism survey and language data quality`
4. `feat: add voluntary research consent and evaluation flow`
5. `feat: add attraction feedback improvement workflow`
6. `feat: add research analytics and de-identified export`
7. `test: complete phase 18 pilot readiness verification`

Each commit must pass its focused tests and `git diff --check`; no later commit may be used to hide a failing earlier contract.
