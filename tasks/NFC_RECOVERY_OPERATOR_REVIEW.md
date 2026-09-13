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
- [ ] W5.6: SQL/adapter/service/UI verification and operator acceptance notes.

## Acceptance Boundaries

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
