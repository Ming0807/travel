# NFC Management UI

The per-code NFC page is linked from the existing QR-code list. This preserves
one authoritative attraction/spot assignment and avoids a duplicate settings form.
The page uses the existing admin shell, 20-item pagination and status filter.

List items expose label, state and last-update version; details progressively show
encoding URL, verification/status forms and lazily loaded audit history. Small
screens stack labels and fields; long URLs wrap and copy controls stay reachable.
Revocation requires a visible confirmation checkbox. Server permission and lifecycle
checks apply independently. Network, stale-version and read-back mismatch messages
are explicit; no service-role database error is shown to staff.

Lifecycle forms reset on tag ID/version changes after server refresh. Pending
destructive commands, reasons and confirmations are not reused against a newer
version. Unverified drafts may be permanently revoked with confirmation without
inventing read-back evidence; activation still requires verification. Loaded history
resets when the displayed tag/version changes so staff can load the current audit.

After creation, a link opens the exact saved tag even when current pagination or
status filters exclude it. Replacement retries link the existing successor and
do not silently rewrite its data. The clear-filter action restores the code list.

Audit history shows localized event type, resulting status, current actor display
name, Bangkok time, version and reason. Long names/reasons wrap on small screens.

Visual QA: synthetic component fixture at `tests/visual/dashboard/nfc.html`,
360/768/1440 widths. No production tags or research records are changed by this
fixture. Full authenticated page and physical read-back QA remain required.

## Field Inspection Panel
The per-tag details now include a separate field-inspection form and lazy-loaded
ten-row history. Read-only staff see history only. Result selects distinguish
NFC/QR passed, failed and not tested; an unverified/revoked tag cannot select NFC
passed. Failures need explanatory notes, and at least one channel must be tested.
Location/device/platform/evidence-reference fields do not repeat attraction/code
selection. Optional evidence references are plain text, not links or uploads.

An uncertain save freezes the submitted fields and retains the same request ID
and payload for retry. Starting a new report is explicit and warns that the prior
submission may already be stored. Successful save refreshes history without changing
tag lifecycle. A tag/version change resets the panel. Missing SQL or permissions
produce a contained retry message rather than an empty-success state.

History renders separate outcome labels, Bangkok submission time, device, version,
notes and references. Audit IDs are behind a disclosure. Photo attachments and
staff display-name enrichment remain follow-up work; no visitor data is collected.

September 9 verification: 15 focused component/service tests passed, including
uncertain retry payload identity, read-only state, missing-schema feedback and
pagination. Build/TypeScript passed; explicit NFC/QR accessible labels were then
added after the browser test identified an ambiguous select name. Final scoped
ESLint and component rerun passed. Chromium fixture saved a simulated failed NFC /
passed QR report and showed history at 360/768/1440px with no horizontal overflow;
360px screenshot visually inspected. Artifacts: `.tmp/nfc-field-*.png`.
The fixture mocks server actions and is not authenticated staging or a real write.
