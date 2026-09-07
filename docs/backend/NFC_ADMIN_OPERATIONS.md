# NFC Admin Operations

Route: `/admin/checkin-codes/[id]/nfc`.
Read permission: `checkin_code.read`. Mutation permission: `checkin_code.manage`.
Actions: `saveAdminNfcAction` and `getAdminNfcHistoryAction`; all enforce permissions
on the server through the management service. Client controls are not authority.
The action accepts only `create` or `change` at runtime. Unknown commands fail
before service dispatch, including malformed calls that bypass TypeScript.
Failed operations do not invalidate pages or expose database error details.

Tags inherit assignment from the chosen check-in code in SQL. New tags are draft.
Staff encode the generated HTTPS URL using a suitable external NFC writer,
then read it back independently and submit the exact URL plus an inspection
reference. Verification and activation are distinct operations.

Updates include the last observed version; stale writes fail without overwriting.
Revocation is permanent. Replacements require a revoked original and have their
own token, verification and activation. A unique replacement reference prevents
multiple replacements from silently racing. Original audit history remains.

Replacement retries return the existing direct successor without changing its
label, reason, verification or lifecycle. The service requires a revoked original
and the same check-in code. A unique-conflict retry reads the winning successor;
other database errors remain failures. This is replacement-specific idempotency,
not deduplication of unrelated new-tag creation. Existing revoked successors are
returned as revoked; create their own replacement rather than resurrecting them.

Migration `20260907000000_guard_nfc_replacement_code.sql` also enforces same-code
replacement for direct service-role inserts. Apply after the existing NFC migrations.
It adds a trigger and does not rewrite legacy chains. Audit any existing cross-code
chains separately; do not silently repair immutable historical assignments.

Create actions return a local `tagHref` for the saved/recovered tag. The `tagId`
filter is UUID-validated and combined with the route's check-in code, never used
to bypass code scope or permissions. Clear filters returns to the full code list.

History reads are cursor-paginated by version, twenty events per request. Public
entry routes never expose admin history. No tourist PII is present in tag events.
Do not paste participant details into inspection references or change reasons.

Audit rows include the current admin display name via the existing actor foreign
key, not email, account UUID or other profile fields. Names are not historical
snapshots and may change when staff edit their profiles; event actor IDs remain
immutable in storage. Missing names are labeled unavailable, never guessed.

Activation SQL revalidates publication, active dates, spot and assignment snapshots.
Tags do not prove physical presence; copied NFC URLs retain NFC attribution.
Both public rollout flags stay off until installation/device and research gates pass.

Remaining: installation photos/records, current-role E2E, full multi-tab research
acceptance and physical tag QA. This local UI is not a production activation.

September 6 action-boundary regression suite: 25 tests across actions, service and
repository passed on Node 22. Covers unknown commands, missing read/manage
permissions, invalid history cursors, forged actor fields, version conflicts and
safe error responses. These mocked tests do not replace authenticated browser QA.
