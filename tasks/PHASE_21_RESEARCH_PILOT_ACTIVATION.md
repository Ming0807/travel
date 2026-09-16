# Phase 21: Research Pilot Activation

Status: Technical activation controls implemented and the Supabase schema verified; real approval evidence, pretest, mobile-device QA, controlled Pilot, and final field activation remain operational work

Priority: P0 before final research data collection

## Goal

Move the implemented Phase 18 research foundation into a controlled Yala pilot without mixing operational, simulated, pilot, and final field data.

## Work Items

### Task 21.1: Approval Record

- [x] Implement a traceable approval snapshot for title, boundary, objectives, RQs, analysis wording, dates, ethics status, and source reference.
- [ ] Record advisor approval date, approved title, geographic boundary, objectives, RQs, and exploratory/confirmatory wording.

### Task 21.2: Ethics and Consent Gate

- [x] Enforce approval and ethics fields in the activation gate without fabricating approval records.
- [ ] Confirm institutional ethics requirements, privacy notice, retention, withdrawal, and approval evidence.

### Task 21.3: Instrument Review

- [x] Implement versioned evidence records for expert review, cognitive pretest, completion time, abandonment, and missingness.
- [ ] Complete expert review and cognitive pretest of tourist, operator, and attraction-manager instruments.
- [ ] Reduce participant burden if completion time or abandonment exceeds the approved threshold.

### Task 21.4: Version Freeze

- [x] Implement an immutable database snapshot and post-freeze mutation guards for protocol, consent, instrument, task, deployment, scoring, retention, withdrawal, language, and inclusion versions.
- [ ] Record the real approved freeze snapshot after expert review and before activating the Pilot.

### Task 21.5: Pilot Configuration

- [x] Implement explicit `pilot` and `final_collection` study kinds, source-Pilot linking, and collection-mode guards in UI, service, and database.
- [ ] Configure the actual inactive Pilot study and controlled check-in entry points.

### Task 21.6: Research Flow QA

- [x] Implement a versioned mobile QA evidence gate in the Research Control Center.
- [ ] Run authenticated mobile E2E for accept, decline, retry, resume, submit, duplicate submit, and withdraw.

### Task 21.7: Controlled Pilot

- [x] Block Pilot field sessions and block non-field final sessions at both application and database boundaries.
- [ ] Execute the controlled Pilot with explicit `pilot_internal` and/or `simulated_usability` records.

### Task 21.8: Pilot Analysis and Activation Decision

- [x] Implement a Pilot review ledger and require `ready_for_field` from the linked Pilot before final activation.
- [ ] Review missingness, completion time, drop-off, reliability readiness, small-sample disclosure, and instrument changes.
- [ ] Activate final collection only after all freeze evidence is recorded.

### Task 21.9: Guided Research Operations UX (2026-09-04 Follow-up)

- [ ] Implement the readiness-first, next-action workflow and reduce repeated
  version/configuration entry without fabricating evidence or auto-freezing.
- [ ] Recheck mobile consent/decline/resume/withdrawal and current-build staff roles.

Detailed tasks 21.9a-e and release criteria are in
`docs/dashboard/PHASE_21_23_READINESS_AND_CHANNEL_UX.md`.

#### 2026-09-15: Evidence Entry Follow-up (21.9c, Partial)

- The draft-Pilot evidence form proposes the highest recorded version plus one
  separately for expert review, cognitive pretest, and mobile QA. A type with no
  records starts at one. This replaces the unconditional version-one default,
  which conflicts with the existing study/type/version unique constraint.
- Staff can edit the proposed number. Type switching preserves manual entries;
  clearing a number remains an invalid required field rather than accepting a
  hidden default. A refreshed ledger or different study starts a fresh entry.
- The interactive fields receive only evidence type/version pairs and labels.
  References, summaries, and participant metrics are not added to their props.
- This is a proposal from the loaded snapshot, not a version reservation.
  Concurrent submissions still rely on the existing database unique constraint.
  Permissions, audit logging, draft-only gates, and immutable freeze are unchanged.
- No approval, test outcome, date, participant count, or freeze manifest is
  generated. Other guided-workflow and real-device acceptance tasks remain open.
- Verification: six interactive-field tests plus eleven existing admin research
  validation tests passed on Node 22 (17 total); scoped ESLint and full-project
  `tsc --noEmit` passed. Initial Vitest worker startup timed out before running
  tests; the completed run used one threads worker without weakening assertions.
  Authenticated browser/mobile acceptance and a fresh production build were not
  run for this checkpoint; this is not a full Phase 21 release sign-off.

### 2026-09-16: Explicit Evidence Outcomes

- Reject missing or unrecognized evidence types/statuses in the server action
  using the existing schema enums. Previously the action silently converted them
  to `expert_review` / `passed`, before the service could validate the original
  value. Legitimate explicit outcomes still use the same permission-checked
  service and audit path.
- The evidence form now starts with a required empty status selection; staff
  choose the real outcome. No existing evidence rows or activation gates change.
- Regression coverage exercises invalid status/type, all three allowed outcomes,
  and sanitized service failures. This does not replace authenticated browser QA.
- Checkpoint verification: 20 action/schema tests passed using Node environment
  (these tests do not require a DOM); scoped ESLint passed. The default jsdom
  worker timed out before executing schema tests. Full-project TypeScript was
  intentionally stopped after prolonged execution without a result. A subsequent
  full-project `tsc --noEmit --extendedDiagnostics` passed: 6,149 files, 84.41s
  total, including 44.33s I/O reads and 2.81s checking. No exclusions or compiler
  checks were weakened. Browser QA and production build remain release gates.

### Approval Input Follow-up

- Approval actions reject missing/unknown ethics and analysis enums instead of
  converting them into an ethics exemption or descriptive-associational approval.
  A pending ethics state is not a recorded exemption.
- Draft forms without an existing decision show required empty selections;
  existing explicit decisions remain prefilled. The evidence confirmation and
  permission-checked service remain mandatory. No stored approval is rewritten.
- Verification: 30 action/schema tests passed, scoped ESLint passed, and the
  full-project TypeScript check passed (6,150 files, 46.30s). Authenticated
  browser QA and a fresh production build remain outstanding for this checkpoint.

### Production Build and Anonymous Runtime Check

- The Node 22 production build passed after the evidence/approval changes,
  including TypeScript and 66 generated static pages. This closes the build gate
  noted in the preceding checkpoints, not the authenticated/mobile QA gates.
- Running the built application exposed a real export bug: an anonymous request
  to `/api/admin/export/research` caught `NEXT_REDIRECT` and returned 500. The API
  now explicitly requests the guard's unauthenticated-throw mode, preserving its
  JSON 401 response and denial audit instead of using page navigation behavior.
- A regression test reproduced the 500 before the fix. Twelve export-route and
  privacy tests passed afterward, scoped ESLint passed, and a fresh production
  build passed again with TypeScript and 66 generated static pages.
- Anonymous HTTP requests against `next start` on loopback then verified 307
  login redirects for the research index/detail and JSON 401 for the export API.
  The temporary server was stopped. No participant records or approvals were
  created; normal request-denial audit logging remained enabled.
- These are HTTP authorization checks, not visual screenshots, authenticated
  permission coverage, or a full participant-flow acceptance test.

## Exit Gate

Final collection begins only after the instrument/version freeze and required ethics/administrative approval are documented. Declining research must never block the normal tourist reward flow.

## Honest Completion Boundary

The software controls in this phase can be completed and tested in the repository. Advisor approval, ethics determination, expert review, pretest, real-device QA, participant Pilot sessions, and the `ready_for_field` decision are real-world activities. They remain unchecked until the team performs them and records genuine evidence; no migration or seed file may manufacture them.
