# NFC Admin Operations

Route: `/admin/checkin-codes/[id]/nfc`.
Read permission: `checkin_code.read`. Mutation permission: `checkin_code.manage`.
Actions: `saveAdminNfcAction` and `getAdminNfcHistoryAction`; all enforce permissions
on the server through the management service. Client controls are not authority.

Tags inherit assignment from the chosen check-in code in SQL. New tags are draft.
Staff encode the generated HTTPS URL using a suitable external NFC writer,
then read it back independently and submit the exact URL plus an inspection
reference. Verification and activation are distinct operations.

Updates include the last observed version; stale writes fail without overwriting.
Revocation is permanent. Replacements require a revoked original and have their
own token, verification and activation. A unique replacement reference prevents
multiple replacements from silently racing. Original audit history remains.

History reads are cursor-paginated by version, twenty events per request. Public
entry routes never expose admin history. No tourist PII is present in tag events.
Do not paste participant details into inspection references or change reasons.

Activation SQL revalidates publication, active dates, spot and assignment snapshots.
Tags do not prove physical presence; copied NFC URLs retain NFC attribution.
Both public rollout flags stay off until installation/device and research gates pass.

Remaining: installation photos/records, current-role E2E, full multi-tab research
acceptance and physical tag QA. This local UI is not a production activation.
