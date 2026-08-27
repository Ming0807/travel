# Phase 23: NFC Check-in Entry Channel

Status: Planned

Priority: P1 field accessibility and channel resilience

## Goal

Add NFC as a second physical entry channel while keeping one canonical check-in, tourist identity, visit, certificate, stamp, survey, and research flow.

## Architecture Decision

NFC tags open the same canonical `/c/[code]` route used by QR. The resolved check-in records an explicit `entry_channel` such as `qr`, `nfc`, `direct`, or `unknown`. NFC must not create a parallel tourist or visit model.

## Work Items

### Task 23.1: NFC ADR and Threat Model

- [ ] Define canonical URL payload, supported tags/devices, ownership, overlay/rewrite threats, verification, and incident response.

### Task 23.2: Additive Data Contract

- [ ] Define NFC tag registry, assignment, lifecycle, replacement, revocation, audit, and entry-channel fields.

### Task 23.3: Canonical Resolution

- [ ] Route NFC through the existing `/c/[code]` resolver and record channel attribution without duplicating visits or rewards.

### Task 23.4: Admin Provisioning UX

- [ ] Add provision, encode payload, verify, activate, deactivate, replace, audit, and installation-record workflows.

### Task 23.5: Public Verification UX

- [ ] Show official domain, attraction, location context, and revoked/unknown recovery before collecting personal data.

### Task 23.6: Physical Deployment Guide

- [ ] Define visible NFC labels, QR fallback, tamper evidence, tag ID, installation photos, field checks, and replacement procedure.

### Task 23.7: Channel Analytics

- [ ] Compare QR, NFC, direct, and unknown entry conversion using correct session/visit denominators.

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
