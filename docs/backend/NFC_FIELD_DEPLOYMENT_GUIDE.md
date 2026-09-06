# NFC Field Deployment Gate

Status: operational draft; not authorization to install or activate production tags.

## Before Installation

1. Confirm approved site, photo spot and collection deployment. Test/Pilot tags
   must not be used to represent field data. Unknown classification is not field evidence.
2. Confirm the configured official HTTPS origin and the existing QR fallback.
3. Provision a draft under the correct check-in code. Record the tag label and ID.
4. Encode only the generated URL with a compatible NFC writer. Never put personal
   data, admin tokens, database keys or research credentials on the tag.
5. Read back independently from the physical tag. Compare the complete URL and
   submit the inspection reference. Do not claim a copied URL is a physical test.

## Acceptance Record

Record site/spot, tag ID, installation reference, inspector, date/time, device,
OS/browser, actual destination URL, QR fallback result and any failures. Keep
installation photos free of identifiable visitors. The installation-record UI
is not complete; retain approved operational evidence separately until then.

Test supported iPhone and Android devices, guest and signed-in flows, NFC/QR
fallback, weak connection, retry, browser handoff and certificate completion.
Verify one intended entry/Visit/reward on retry and correct channel labels.
NFC URL attribution is not verified physical presence or a unique-person count.

## Activation and Inspection

Activate only after the release/device gates pass. Use visible official-domain
and site labels with a readable QR fallback; inspect for replacement stickers
and physical tampering. Device support varies: no universal Web NFC writer is
promised by this website.

For suspected tampering, revoke immediately, preserve the audit record, remove
the compromised label and provision a replacement with a new token. Repeat
read-back and acceptance before activating it. Never reactivate a revoked token.

## Rollback

Pause the pilot deployment and disable NFC rollout when required. Keep ordinary
QR available according to its tested compatibility path. Do not delete historical
entries, Visits or consent records to conceal a failed rollout. Record the incident
and require a new go/no-go review before resuming.
