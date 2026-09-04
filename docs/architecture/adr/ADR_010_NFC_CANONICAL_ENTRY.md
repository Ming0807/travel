# ADR-010: NFC Canonical Entry and Revocable Registry

## Status

Accepted for Phase 23 implementation, 2026-09-04. Physical rollout is not approved.

## Decision

Use one NDEF URI record containing the configured HTTPS origin followed by
`/c/<checkin-code>?nfc=<opaque-uuid>`. The token identifies a registered physical
tag assignment, not a tourist, identity credential, or proof of physical presence.
QR keeps its existing URL without the NFC token. No separate identity, visit,
certificate, stamp, or research flow is introduced.

The origin comes from trusted server configuration, never a request Host header
or an administrator-supplied redirect. Payload construction rejects credentials,
query strings, fragments, non-root paths, unsafe code characters, and non-HTTPS
origins. Encode the URL as URI, not a plain-text NDEF record.

### Registry and Lifecycle

- `nfc_tags` stores a generated public token, human label, code assignment,
  immutable snapshots of code/attraction/photo spot/campaign, lifecycle status,
  verification reference, actor, timestamps, and revision.
- States: draft -> active -> inactive -> active; any non-revoked state may be
  revoked. Activation requires a staff-recorded read-back verification. Revoked
  is terminal. Rows and audit events cannot be deleted through the application.
- Replacements are NEW draft rows with a new token pointing to an already
  revoked predecessor. The predecessor is never reactivated or reassigned.
- Database triggers enforce transitions and append audit events transactionally.
  Direct anonymous/authenticated database clients have no registry access.
- Each resolution compares the live check-in assignment against its snapshot.
  Reassigning an existing QR code makes its old NFC tag unavailable, rather than
  silently directing the installed tag to a different location or campaign.

### Resolution and Attribution

Validate the token and code, load the registry, reject inactive/revoked/mismatched
assignments, then run the existing publication, destination, photo-spot, and date
checks. Fail closed on registry errors. Never downgrade an invalid NFC request to
a QR success. The resolver is read-only and cannot create visits or award rewards.

The integration slice must revalidate at landing and form submission, not only
at the initial redirect. Carry context bound to the code/session. Unknown or
tampered context must not become a trusted channel. Do not log the public token
in analytics or export it; use internal registry ID in protected operational data.

NFC entry must NOT emit `qr_scanned`. Shared funnel steps retain their meaning;
new channel-entry events need their own denominator and deduplication contract.
Copied URLs and repeated requests are not verified taps or verified people.
Channel charts compare attributed sessions/visits, not hardware reads.

## Alternatives

1. Only `?source=nfc`: simple but cannot revoke individual tags or check assignment.
2. Web NFC reader as the required entry: adds browser/device dependency and
   permission friction. Not chosen for the tourist flow.
3. Registered NDEF URL (chosen): browser-independent payload format, operational
   revocation and shared flow, with explicit limitations around cloning.

## Threats and Operations

| Threat | Control and remaining limitation |
|---|---|
| Copied/replayed URL | No presence claim; session/reward idempotency remains required |
| Tag overlay/rewrite | Official domain and location verification, tamper label, field inspection; website cannot stop another-domain overlays |
| Compromised installed tag | Revoke, inspect site, replace with new token; retain history |
| Reassigned check-in code | Snapshot comparison denies the old assignment |
| Forged `source=nfc` | Ignore source hints; require registry validation |
| Database outage | Unavailable state, QR fallback offered separately, never silent reclassification |
| Client bypass | No browser DB writes; admin permission gates plus database constraints |

Use existing check-in read/write permissions for staff tools, plus existing
audit identity. Public errors disclose no internal notes or staff identifiers.
Installation checklist: label, official domain, location name, tag asset ID,
QR fallback, write/read-back, actual phone test, tamper seal, and inspection owner.
Do not irreversibly lock a physical tag before verifying its final payload.

## Delivery Boundaries

Foundation slice: registry migration, pure payload/assignment contracts,
read-only repository/resolver, isolated PostgreSQL and unit tests. No public
route activation, no seed tags, no production migration execution.

Next: guarded staff provisioning UI, public verification/error UX, per-step
context revalidation, channel attribution, then device QA and controlled rollout.
The staff UI should extend check-in management, not add duplicate attraction
forms: choose existing code -> inspect location -> create draft -> copy payload
-> read back -> verify -> activate. Show lifecycle, owner, and audit together.

## Device Evidence

Apple documents background reading of NDEF URI records and device-state limits:
[Adding Support for Background Tag Reading](https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading),
[Core NFC](https://developer.apple.com/videos/play/tech-talks/702/).
Android documents NDEF dispatch and HTTP(S) link handling:
[NFC basics](https://developer.android.com/develop/connectivity/nfc/nfc).
Consulted 2026-09-04. These documents inform the payload choice, but do not replace
real iPhone/Android acceptance tests. No universal device-support claim is made.
