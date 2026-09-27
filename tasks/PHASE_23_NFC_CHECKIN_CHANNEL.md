# Phase 23: NFC Check-in Entry Channel

Status: In progress; registry, default-off canonical NFC/session flow, admin lifecycle tools, field-check reporting, and parts of channel analytics are implemented locally. Production schema/flag state, remaining public/installation UX, some analytics parity, and physical rollout remain gated. See [Phase 23 status audit](../docs/testing/PHASE_23_STATUS_AUDIT_2026-09-27.md).

Priority: P1 field accessibility and channel resilience

## Goal

Add NFC as a second physical entry channel while keeping one canonical check-in, tourist identity, visit, certificate, stamp, survey, and research flow.

## Architecture Decision

NFC tags open the same canonical `/c/[code]` route used by QR. The resolved check-in records an explicit `entry_channel` such as `qr`, `nfc`, `direct`, or `unknown`. NFC must not create a parallel tourist or visit model.

## Work Items

### Task 23.1: NFC ADR and Threat Model

- [x] Define canonical URL payload, device acceptance boundaries, ownership, overlay/rewrite threats, verification, and incident response in ADR-010.

### Task 23.2: Additive Data Contract

- [x] Define immutable tag assignments, verification, lifecycle, replacement, revocation, and atomic audit.
- [x] Add an additive registry migration and a read-only typed repository with isolated PostgreSQL tests.
- [ ] Apply and independently verify the required migration chain in staging before any public NFC activation; current deployed schema is not established by local evidence or user-reported SQL application.
- [x] Implement the entry-session/visit correlation contract and additive migration for channel analytics; preserve existing `visits.entry_channel` values. Local disposable-PostgreSQL evidence exists; deployment remains pending.

### Task 23.3: Canonical Resolution

- [x] Implement read-only NFC resolution using current QR availability checks; reject revoked, inactive, invalid, and reassigned tags without QR fallback.
- [x] Integrate `/c/[code]?nfc=<token>` behind default-off rollout flags; the NFC route does not emit `qr_scanned`.
- [x] Bind channel context to the browser-bound entry session/code and revalidate assignment/tag lifecycle on read and Visit creation.
- [ ] Correlate entry, Visit, and rewards with duplicate/retry protection; local SQL tests cover atomic retry, but explicit multi-tab/research-correlation acceptance remains pending.

### Task 23.4: Admin Provisioning UX

- [x] Add guarded tag provision/payload, read-back verification, activate/deactivate/revoke, replace, and audit workflows. Encoding is performed with an external NFC writer; installation records/photos are tracked separately and remain incomplete.

### Task 23.5: Public Verification UX

- [ ] Complete NFC-specific public verification/recovery UX for official domain, attraction/location context, and revoked/unknown tags before collecting personal data. Local success and failure UI now preserve NFC context, display configured official host and location, and provide physical-sign recovery guidance. Five viewport sizes passed component QA; deployed and physical-device acceptance remain pending.

Recovery checkpoint (2026-09-27): NFC failures no longer claim that the attraction
itself is closed. The landing page retains `nfc_unavailable`, does not record a
landing event for rejection, and offers contact/home links with instructions to
retry the physical tag or scan the QR on the sign. It does not construct a QR
bypass URL or reveal registry lifecycle details. Four focused test files passed
38 tests; targeted ESLint passed. A follow-up added successful-entry official
host/location verification and passed 42 focused tests, 10 responsive browser
cases, TypeScript, and Node 22 production build. No schema or rollout flags
changed. Real-device and deployed acceptance remain outstanding.

Follow-up: `/checkin/[code]` and `/checkin/[code]/start` now reject duplicate
`flow` values before session resolution, so a malformed bound entry cannot
fall back to a legacy visit. The start page preserves NFC recovery when a
session is blocked and repeats the official host/location check before the
personal form; an invalid host blocks the form and start event. Focused page
tests observed both direct-entry cases failing before this addition, then
passed after the fix. This is application-level hardening; live device
and authenticated end-to-end acceptance remain open.

### Task 23.6: Physical Deployment Guide

- [ ] Complete the physical installation-record workflow. The operational guide covers visible official-domain labels, QR fallback, tamper checks, tag identity, field checks, and replacement; installation photos/records and full field acceptance are not complete.

### Task 23.7: Channel Analytics

- [x] 23.7a: Add versioned server-recorded entry sessions, channel attribution, Visit linkage, and retry deduplication before adding entry-cohort claims to graphs.
- [ ] 23.7b: Complete channel distribution/trend scope with direct and unknown visible and admin imports separate. QR/NFC entry-session and Visit-channel views exist locally, but the entry cohort does not provide a complete common session denominator for every Visit channel.
- [x] 23.7c: Calculate session-to-Visit/certificate/survey conversion on the same entry cohort and common as-of cutoff; show numerator/base and quality states. Local analytics tests/docs evidence this implementation; authenticated staging remains pending.
- [x] 23.7d: Add compact channel comparison to executive overview and expanded attraction channel panel with shared Recharts presentation and accessible data tables.
- [ ] 23.7e: Carry applied place/date/campaign/evidence filters through charts, drill-down, and CSV/XLSX; disable unavailable comparisons rather than inventing zeros. Local code/tests exist, but filter/peer-comparison parity is under separate review and is not signed off here.
- [x] 23.7f: Add regression coverage for unknown history, forged hints, repeated taps/retry, low samples, suppression, and cohort coverage; never infer old channels retrospectively. Evidence is automated/local, not production-data validation.

### Task 23.8: Security and Permission Tests

- [x] Add and execute local automated regressions for unsafe payload origins, revoked/reassigned tags, duplicate/retry behavior, authorization boundaries, audit/lifecycle, and immutable historical records. Authenticated full-schema/staging permission acceptance remains pending.

### Task 23.9: Real-Device QA

- [ ] Test supported physical iPhone and Android devices, Safari/Chrome, weak network, browser fallback, and QR fallback. No physical-device evidence found.

### Task 23.10: Controlled Rollout

- [ ] Run an approved small-tag pilot, monitor conversion/errors/incidents, and record human go/no-go evidence before wider deployment. No pilot or human approval evidence found.

## Security Rules

- A tag contains only an opaque public check-in code URL, never tourist data or secrets.
- Use HTTPS and the official domain; reject unsafe redirects.
- Admin can revoke a compromised tag without deleting historical visits.
- Physical replacement/overlay risk is addressed through visible site verification and operational inspection, not hidden behind technical claims.

## Acceptance Criteria

- QR and NFC enter the same production flow and award the same idempotent rewards.
- Analytics can compare entry channels with correct denominators.
- Compromised tags can be revoked and replaced safely.

## Current Delivery and Next Order

Local delivery includes the NFC registry/resolver; the `/c/[code]` route and
browser-bound entry sessions; session-to-Visit/reward idempotency; guarded admin
tag lifecycle and audit; field-check forms/history; and executive/attraction
channel analytics. These are locally implemented and have focused test evidence,
not proof of current production schema, current deployed flags, authenticated
staging behavior, physical tag acceptance, or pilot approval. Both NFC and entry
session rollout flags must remain default-off until the documented release gates
are evidenced. No schema or environment state was queried or changed for this audit.

Remaining order: verify deployment schema/migration state read-only in staging;
finish NFC-specific public recovery and installation records; close analytics
scope/filter/export parity review; complete authenticated and multi-tab acceptance;
run physical-device QA; then obtain an explicit human pilot/go-no-go decision.
See `docs/testing/PHASE_23_STATUS_AUDIT_2026-09-27.md` for evidence and residual
gates. Phase 21/22/24 readiness remains separately tracked.

See `docs/dashboard/PHASE_21_23_READINESS_AND_CHANNEL_UX.md` for the chart design,
metric definitions, UX priorities, and phase completion boundaries.
