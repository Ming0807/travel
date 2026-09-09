# NFC Field Check Records

Status: database/service foundation and admin form/history implemented. Evidence-photo
linkage and full-schema staging remain pending. Do not activate this migration in production
as part of this checkpoint.

The private storage adapter and additive photo-registry migration are documented
in `docs/security/NFC_EVIDENCE_STORAGE.md`. No photo upload endpoint or bucket
provisioning is included yet; the current UI evidence reference remains plain text.

## Purpose And Boundary
Staff report an inspection at a known tag. This is operational evidence for
Attractions Visited data quality, not a tourist Visit, verified physical presence,
consent or an automatic activation decision. URL verification and tag lifecycle
remain separate. A recorded pass is staff-reported, not independently attested.

## Contract
`nfc_field_checks` stores an immutable request ID, tag ID/version/status snapshot,
authenticated inspector ID, location note, device/browser label, platform, separate
NFC and QR results, issue notes, optional evidence reference and server report time.
`reported_at` is submission time, not a claimed historical inspection timestamp.
At least one channel must be tested; failed channels require an issue explanation.
No tourist identity, GPS, email, photograph or arbitrary JSON payload is collected.
Evidence references are internal operational identifiers, never rendered as URLs.

`record_nfc_field_check` locks the request identity, returns the original ID on an
identical retry and rejects a changed payload/inspector. New records lock the tag,
reject stale versions and snapshot current status without updating the tag. NFC
passes require prior URL verification and cannot refer to a revoked tag. A pass
on a non-active tag does not prove public check-in succeeds; activation/device
acceptance is a separate gate. Failed inspections can still be recorded.

Only service_role can execute the write RPC. Its actor parameter comes exclusively
from `requirePermission('checkin_code.manage')`, never client input. Reads require
`checkin_code.read`, scope to one tag and paginate ten rows ordered by report time
and request ID. RLS denies public access; service role has SELECT but no direct
write. A trigger blocks UPDATE/DELETE even when table-owner writes are attempted.
Corrections require a new report; no silent rewriting of historical evidence.

## Migration And Remaining Tasks
Additive migration: `20260908000000_add_nfc_field_checks.sql`, after the NFC registry
and current lifecycle guards. No seed, reset, public flag, schedule or existing tag
change. Do not drop records to roll back application code.

- Implemented per-tag inspection form, result controls and paginated history.
- Request ID stays stable on network retries; corrected reports require a new ID.
- Add approved media references for optional non-identifying installation photos;
  reuse image processing and private storage, not the public CMS media picker.
- Implemented missing-migration, stale-version and failed-save recovery messages.
- Verify full-schema role access, realistic devices and field acceptance before rollout.

Server actions `saveAdminNfcFieldCheckAction` and `getAdminNfcFieldChecksAction`
expose the guarded service to the per-tag panel. Errors are sanitized with specific
stale-version, replay-conflict and ineligible-pass recovery messages. History loads
only on request and after successful save; missing migration does not query during
the existing tag list server render. No NFC/QR lifecycle behavior is changed.

Local PostgreSQL harness: 174 assertions including simultaneous duplicate submission,
payload conflict, stale version, immutable history, role denial and preserved retry
after a tag changes. The harness uses minimal surrounding schema, not full staging.

September 9 photo-registry checkpoint: the expanded harness passes 209 assertions,
including private-path constraints, immutable metadata, atomic photo claims,
cross-actor/tag rejection, upload expiry, replay identity and role denial. The
new `record_nfc_field_check_with_photos` RPC wraps the existing report RPC in the
same transaction, accepts zero to three ordered asset IDs, and rejects attaching
photos retrospectively to an existing report. Application integration is pending.
