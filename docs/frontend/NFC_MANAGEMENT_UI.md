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
