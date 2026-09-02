# Phase 21: Research Pilot Activation

Status: Technical activation controls implemented locally; real approval evidence, pretest, mobile-device QA, controlled Pilot, and final field activation remain operational work

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

## Exit Gate

Final collection begins only after the instrument/version freeze and required ethics/administrative approval are documented. Declining research must never block the normal tourist reward flow.

## Honest Completion Boundary

The software controls in this phase can be completed and tested in the repository. Advisor approval, ethics determination, expert review, pretest, real-device QA, participant Pilot sessions, and the `ready_for_field` decision are real-world activities. They remain unchecked until the team performs them and records genuine evidence; no migration or seed file may manufacture them.
