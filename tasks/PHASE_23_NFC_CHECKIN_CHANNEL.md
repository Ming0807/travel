# Phase 23: NFC Check-in Entry Channel

Status: In progress; registry and read-only resolution foundation implemented locally. Public flow, channel graphs, staff provisioning, and device rollout remain gated.

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
- [ ] Apply and verify migration in staging before any public NFC activation.
- [ ] Implement the entry-session/visit correlation contract and migration for channel analytics; preserve existing `visits.entry_channel` values.

### Task 23.3: Canonical Resolution

- [x] Implement read-only NFC resolution using current QR availability checks; reject revoked, inactive, invalid, and reassigned tags without QR fallback.
- [ ] Integrate `/c/[code]?nfc=<token>` behind a default-off rollout flag; do not emit `qr_scanned` for NFC.
- [ ] Bind channel context to the entry session/code and revalidate on landing and submission.
- [ ] Correlate entry, visit, and rewards with duplicate/retry protection and multi-tab tests.

### Task 23.4: Admin Provisioning UX

- [ ] Add provision, encode payload, verify, activate, deactivate, replace, audit, and installation-record workflows.

### Task 23.5: Public Verification UX

- [ ] Show official domain, attraction, location context, and revoked/unknown recovery before collecting personal data.

### Task 23.6: Physical Deployment Guide

- [ ] Define visible NFC labels, QR fallback, tamper evidence, tag ID, installation photos, field checks, and replacement procedure.

### Task 23.7: Channel Analytics

- [ ] 23.7a: Add versioned server-recorded entry sessions, channel attribution, visit linkage, and retry deduplication before adding claims to graphs.
- [ ] 23.7b: Calculate channel distribution and daily trends from distinct entry sessions; keep direct and unknown visible and admin imports separate.
- [ ] 23.7c: Calculate session-to-visit/certificate/survey conversion on the same entry cohort and common as-of cutoff; display numerator, denominator, pending follow-ups, and missing linkage.
- [ ] 23.7d: Add a compact channel comparison to executive overview and an expanded channel panel to attraction analytics, with shared Recharts tokens and accessible data tables.
- [ ] 23.7e: Carry applied place/date/campaign/evidence filters through charts, drill-down, and CSV/XLSX; disable unavailable comparisons rather than inventing zeros.
- [ ] 23.7f: Test unknown historical data, forged hints, repeated taps, low samples, suppression, and unequal cohort coverage; do not infer old channels retrospectively.

### Task 23.8: Security and Permission Tests

- [ ] Test unsafe redirects, revoked/reassigned tags, duplicate taps, authorization, audit, and historical-record preservation.

### Task 23.9: Real-Device QA

- [ ] Test supported iPhone and Android devices, Safari/Chrome, weak network, browser fallback, and QR fallback.

### Task 23.10: Controlled Rollout

- [ ] Pilot a small tag set, monitor conversion/errors/incidents, and document go/no-go evidence before wider deployment.

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

Foundation: `20260904000000_add_nfc_tag_registry.sql`, `lib/nfc/contract.ts`,
`lib/repositories/nfc-tag.repository.ts`, and `lib/services/nfc-checkin.service.ts`.
No production route imports these new services yet. Do not encode or install
tags until canonical-route integration and real-device QA pass. No SQL has been
run against production by this batch.

Next order: session/visit contract -> canonical integration and retry safety ->
staff provisioning/public verification UX -> channel graphs -> device QA ->
small controlled rollout. Phase 21 operational evidence continues in parallel;
Phase 22/24 release gaps remain visible in the cross-phase readiness plan.

See `docs/dashboard/PHASE_21_23_READINESS_AND_CHANNEL_UX.md` for the chart design,
metric definitions, UX priorities, and phase completion boundaries.
