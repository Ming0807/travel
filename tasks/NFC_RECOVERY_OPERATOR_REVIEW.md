# NFC Recovery Operator Review

Part of Phase 23 S5 / W5. Held implementation; not rollout approval.

## Design

Extend the existing NFC tag management surface with a lazy-loaded metadata panel.
Do not add another global navigation destination for the same installation task.
Use `checkin_code.manage` for recovery operations, independently of the worker's
machine authentication. Keep browser upload confirmation owner-only.

Display queue status separately from intent lifecycle. An abandoned intent can
still be pending reconciliation; available evidence can still need verification.
Database time determines waiting, ready, processing, review and completed status.
The operator sees timestamps, attempt count and bounded outcome categories, not
lease tokens, original actors, hashes, storage paths, accounts or signed URLs.

Use tag-scoped pages of 20 with one lookahead row. History uses a descending
event-ID cursor and 20-row pages. Queue transactions append sanitized immutable
events atomically. Installation backfill records a snapshot, never invented
past attempts. Renewal and takeover events remain distinguishable through event
type and attempt count. Expired leases are not reported as currently processing.

Alternatives considered: a global recovery dashboard duplicates tag context;
only showing last outcome cannot explain retries. A tag-local panel backed by
bounded queue/history RPCs preserves context and supplies genuine history.

## Tasks

- [x] W5.1: Held event journal with service-only access and transactional triggers.
- [x] W5.2: Bounded, metadata-only tag listing/history RPCs and strict adapters.
- [x] W5.3: Permission-first service, default-off gate and sanitized read audit.
- [x] W5.4: Responsive tag-local panel, meaningful empty/error/disabled states,
  accessible controls and pagination; verify desktop/mobile screenshots.
- [ ] W5.5: Retry policy with current authority checks and transactional operator
  audit. No generic reset of review-required jobs and no content override.
  Backend, gated browser action and retained-request UX implemented and locally
  verified; complete-platform and operator acceptance remain open.
- [ ] W5.6: SQL/adapter/service/UI verification and operator acceptance notes.

## Acceptance Boundaries

### Retry Mutation Contract

The operator queues an inspection; the request never uploads, finalizes, deletes
or performs provider I/O. Only deferred absent/provider_unavailable jobs with no
lease, no completion and no review hold qualify. The observed attempt count must
still match. A 60-second minimum since the last worker attempt prevents rapid
manual polling; jobs already due need no manual rescheduling. Keep worker attempt
counts/backoff history, and allow at most one manual request per asset/attempt.

Use a browser-generated request UUID retained across ambiguous failures, a
controlled reason code, exact tag/asset scope and observed attempt count. SQL
serializes request identity and job authority. It verifies the current operator's
active admin/role assignment (super_admin or explicit checkin_code.manage /
system.all), then original owner availability and live tag/version for a new
request. This matches the current guard: generic content roles do not implicitly
grant checkin_code.manage. Lock qualifying RBAC rows until transaction end.

The queue update, immutable retry receipt, bounded retry_requested event and
audit_logs entry must commit together. Any audit failure rolls back all changes.
An exact authorized replay returns the existing receipt even after the worker
progresses; it never reschedules twice. Changed request bindings are conflicts.
Never accept a client-supplied operator identity. Review-required, leased and
completed jobs cannot be reset by this contract. SQL and UI remain held until
transactional/concurrency/permission and browser acceptance checks pass.

No production SQL, scheduler activation, remote deletion or automatic review
resolution. Do not treat a content-conflict review as an ordinary retry. Read
auditing uses existing application audit behavior; mutation audit must be in the
same database transaction as any eventual retry. Complete-platform permissions,
private-provider staging and physical-device acceptance remain separate gates.

## Local Evidence (September 13, 2026)

- Disposable PostgreSQL + real processor/readback + strict review adapters:
  15 cases pass. Includes event backfill, atomic rollback, role denial, tag scope,
  job lookahead pages and string-ID history cursors.
- Repository/service 15 tests and server-action 2 tests pass. A malformed event
  ID regression initially exposed a BigInt conversion exception; validation now
  rejects it before conversion and returns the bounded response error.
- Playwright fixture at 360/768/1440: loading, history paging, next/previous job
  pages work; no page-error exception or horizontal document overflow. Screenshots
  inspected at `.tmp/nfc-recovery-{width}.png` (local QA artifacts, not committed).
- Next production build completes TypeScript and all 66 generated static pages.
- Scoped ESLint passes. No flags enabled and no production migration applied.

The combined suite encountered a Vitest worker-start timeout for the component
suite while build/browser work was active. A separate rerun passed all five
component tests (74.83 seconds, mostly module import), giving 37 passing cases
across separate successful results. This is not a claim that the combined run
passed. Full live-admin auth integration and operator acceptance are not
established by the fixture.

## Retry Foundation Evidence (September 13, 2026)

The held retry RPC, receipt table, strict adapter and permission-first service
are implemented. An independent default-off operator retry gate supplements the
recovery gate. A gated browser action now invokes this service; no scheduler is
activated. The
history validator/UI recognizes the bounded retry_requested event.

The disposable processor/review/retry suite passes 33 cases; retry unit tests
pass 22 and review unit tests pass 15, totaling 70. New SQL tests first failed
because the RPC was absent. Tests then caught a due-time crossing during an
authority lock wait; a final database-time recheck now rejects that request.
Concurrent requests produce one receipt/audit per attempt. Exact replay remains
idempotent after worker completion but requires current permission. Audit
failure rolls back scheduling and history. Full deployed-schema/session behavior
are not proven by these tests. W5.5 remains incomplete.

## Retry Browser Evidence (September 13, 2026)

Four focused suites pass 42 tests, including duplicate pending submission,
ambiguous response replay, mismatched acknowledgement, definite rejection and
retention after list refresh removes the target row. The refresh error test now
waits for the actual enabled control before interaction; its initial run clicked
while the previous transition was still pending.
Four additional flag cases pass in a separate 19-test review-suite rerun,
bringing distinct passing cases to 46. Invalid operator flags suppress retry
without hiding the read-only listing.

Playwright fixture passes at 360/768/1440 pixels with no document overflow or
page exception. All three screenshots inspected. This proves fixture interaction,
not live authentication/provider behavior. Full reload/navigation still loses
the in-memory request; database uniqueness remains the duplicate-write guard.
No production flags, SQL or scheduler activated.
Scoped ESLint and TypeScript pass. The production build compiles successfully,
passes its TypeScript phase and generates all 66 static pages. Browser fixture
and its Vite server were closed after verification.
