# Phase 23 Entry Session Integration

Date: 2026-09-04. Implements the approved ADR-010; release remains disabled.

## Contract

- Default-off `CHECKIN_ENTRY_SESSIONS_ENABLED`; NFC additionally requires
  `NFC_CHECKIN_ENABLED`. Legacy QR remains unchanged while disabled.
- Canonical QR/NFC entry creates/reuses a server session bound to a hash of the
  dedicated two-hour browser cookie, code assignment, channel and optional tag.
  The browser cookie is independent of the persistent tourist identity. Its raw
  value is not stored in the new table or URL.
- `flow=<uuid>` survives navigation and research-return URLs. It is not a bearer
  credential: every read/submission also requires the matching browser cookie.
  Different source assignments use distinct sessions; the same source within
  the fixed two-hour window reuses its session, including after completion.
- Record immutable assignment snapshots. Validate code availability, publication,
  photo spot and NFC revocation inside SQL at both session read and visit creation.
- Lock the session row to create/link one Visit atomically. Concurrent retries
  return the same Visit; a different tourist cannot claim an already linked Visit.
  Different sessions are separate starts, not deduplicated verified people.
- Entry cohort classification is initially `unknown`: never infer field/Pilot
  eligibility for pre-Visit abandonment from later completed visits. Channel
  charts remain gated until the pre-Visit evidence-scope contract is implemented.
- Explicit invalid/disabled NFC and invalid/expired/wrong-browser flow context
  fail closed. Direct legacy entry remains unknown, never guessed QR or NFC.
- NFC emits no `qr_scanned`. Existing QR funnel events are retained; new entry
  denominators will come from session rows rather than HTTP request counts.
- No GPS, email, mandatory login, or extra tourist form fields.

## Tasks

- [x] Add session table, RLS, immutable context and atomic begin/read/create-visit RPCs.
- [x] Verify real PostgreSQL constraints, browser/code binding, revocation, concurrent retry and atomic XP in a disposable local database (24 assertions on 2026-09-05).
- [x] Add typed repository and server-only owner hashing/feature flags.
- [x] Integrate canonical route, landing/start/identity navigation and research return.
- [x] Integrate minimal-profile submission without changing legacy flow when disabled.
- [ ] Add regressions for feature-off, malformed hints, NFC event separation, wrong browser, multiple tabs and replay.
- [ ] Run focused tests, typecheck, lint, build; update migration/release notes.

## Not Included

Staff provisioning, activation in production, device acceptance,
and final research evidence remain separate Phase 23 tasks. No migration is run
against production, no real participant records are changed, and no push is
required before the controlled integration gate is ready.

## Continuation Notes (2026-09-05)

Canonical navigation and form integration are implemented. Channel trend and
conversion charts are connected to attraction analytics, with accessible tables,
as-of outcome filtering, cross-date coverage and complementary suppression.
XP creation is in the same SQL transaction as the Visit; concurrent replay
returns the existing Visit without awarding XP again.

Verification on 2026-09-05: eight focused files passed 85 tests, including
cross-date coverage and four channel-panel quality-state regressions. Typecheck
and production build passed (63 generated pages). Build used local Node 26.1.0;
the project requires Node 22, so matching-runtime release QA remains pending.
Synthetic visual fixtures passed overflow checks at 390/1440px and chart-view
switching; these do not replace authenticated or physical-device acceptance.
The visual harness emitted an initial Recharts container-size warning despite
rendering correctly; trace the originating chart during remaining visual QA.
Focused ESLint and `git diff --check` passed.

Pre-Visit scope assignment is implemented by the additive 20260905000000
migration and verified locally (36 SQL assertions). The shared scope predicate
now covers executive live queries, attraction analytics and peers.

Remaining release gates: deployment-scope acceptance, public/summary SQL audit, explicit multi-tab research
correlation review, current-role authenticated QA, physical QR/NFC tests,
matching-runtime verification and a controlled rollout review. Channel CSV/XLSX
export is implemented locally with suppression/denominator parity; executive
channel summary remains pending. Do not mark Phase 21/22/23 fully complete.

Rollout stays disabled. Apply neither new migration automatically nor any
production feature flag while these gates remain open.
