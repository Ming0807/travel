# Check-in Entry Session Contract

Status: implemented locally, default-off. No production migration applied by agent.
Migration: `20260904001000_add_checkin_entry_sessions.sql`, after NFC registry
`20260904000000_add_nfc_tag_registry.sql`.

`checkin_entry_sessions` stores a UUID entry ID, server-HMAC browser binding,
immutable code/attraction/photo-spot/campaign snapshots, QR/NFC channel, optional
NFC tag ID, evidence scope, creation/expiry times and one unique linked Visit.
No raw browser token, location or personal contact data is stored here.
Migration `20260905000000_snapshot_entry_research_scope.sql` classifies new
entries from exactly one active deployment of an active, frozen research study.
The study ID and freeze timestamp are immutable provenance snapshots. Missing,
expired, paused, ambiguous or kind/mode-incompatible deployments remain unknown.
There is no historical backfill and no URL-controlled classification. Collection
context does not constitute consent or research inclusion.

Begin/read/create-visit RPCs validate live assignment, expiry and browser binding.
Begin serializes same-source requests and reuses a fixed two-hour session.
Create-visit locks the session row, links one Visit and inserts one 50-point
QR/NFC XP event transactionally. Replay by its tourist returns the same Visit;
a different tourist is rejected. NFC revocation prevents completion.

RLS and RPC grants restrict access to the server service role. Session context
is immutable, except the first Visit link. Do not expose this table to browsers.
The HMAC secret must remain stable during rollout; rotating it invalidates open
sessions. Disabling rollout flags does not delete existing sessions or Visits.

Local SQL verification uses `scripts/verify-checkin-entry-sessions.mjs` against
only a disposable loopback database named `entry_session_qa`. It resets that
fixture schema and must never be pointed at production.

Before activation: review retention/purge policy, deployment-scope acceptance,
device acceptance and rollback. Historical Visits are not backfilled as QR/NFC.

## Entry-Aware Research Consent

`20260906000000_bind_entry_research_acceptance.sql` follows the scope and NFC
activation migrations. The service first validates browser-bound flow ownership,
then compares invitation provenance before creating any credentials. Entry-aware
callers invoke `accept_entry_research_invitation`; callers without an entry retain
`accept_research_invitation`.

The wrapper checks expiry and assignment, locks the current study/deployment in
the legacy RPC's lock order, and compares study ID, frozen timestamp and mode to
the entry snapshot. Locks remain held while the existing consent RPC runs.
Changed or unavailable provenance cannot silently move consent to a new study.
Only the service role may invoke the wrapper; it is not a browser-facing API.

Evaluation and withdrawal select Visit-scoped HttpOnly credentials and still
require server-side Visit ownership. Withdrawal clears only the selected Visit
and clears the global legacy cookie only when it represents the same session.
No consent, survey answer or participant eligibility is inferred from a scan.

The disposable SQL harness uses a stub for the downstream legacy consent RPC
when testing this wrapper. Full-schema/staging acceptance remains a separate
release gate, as does scoped-cookie accumulation during extended field use.
