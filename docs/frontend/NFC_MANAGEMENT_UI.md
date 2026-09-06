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

Visual QA: synthetic component fixture at `tests/visual/dashboard/nfc.html`,
360/768/1440 widths. No production tags or research records are changed by this
fixture. Full authenticated page and physical read-back QA remain required.
