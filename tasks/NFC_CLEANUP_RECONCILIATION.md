# NFC Cleanup Reconciliation

Phase 23 S5 / W6. Held; production cleanup remains disabled.

## Verified Gaps

The legacy cleanup service calls generic `deletePrivateFile` with a storage path.
Its claim has no provider-account binding or fencing token. Queue acknowledgement
uses asset ID only, and unfinished early items consume batch capacity indefinitely.
Do not connect this service to a scheduler or expose it to operators as safe cleanup.

## Required Outcome

Inspect existing registered evidence without mutation first. Separate retained
report evidence, registered intent-bound evidence, pre-intent legacy evidence and
existing cleanup tombstones. Inventory classification does not grant deletion.
An intent record alone does not prove current provider account or settlement.
Objects missing from the database cannot be discovered by this inventory; they
require a separately scoped private-provider inventory and reconciliation.

## Ordered Tasks

- [ ] W6.1 Metadata-only, tag-scoped inventory RPC; page 20 plus lookahead,
  deterministic asset-ID cursor, no path/owner/hash/provider account in output.
  Verify readonly transaction and anonymous/authenticated denial on PostgreSQL.
  RPC implemented; local replay verifies pagination, exact metadata fields and
  legacy/intent distinction. Attached and legacy acknowledgement fixtures remain.
- [ ] W6.2 Strict repository, manage-permission-first service and default-off
  inventory action; do not reuse destructive claim RPC for a read operation.
- [ ] W6.3 Tag-local operator inventory with explicit retention/legacy/cleanup
  states, mobile layout and no deletion controls. Audit reads without raw locators.
- [ ] W6.4 Registered cleanup lease/backoff replacement: exact fencing, current
  report-attachment exclusion, provider/account/key/content binding and fairness.
  No generic delete fallback for unbound legacy evidence.
- [ ] W6.5 Read-only private-provider legacy inventory with explicit account scope,
  bounded paging and operator reconciliation evidence. Never infer ownership from
  name or age alone, and do not enumerate outside the approved private namespace.
- [ ] W6.6 Settlement, deletion race and lost-ack staging acceptance; retain
  tombstones and safely revisit late arrivals. Separate machine authentication,
  rollout, rollback and monitoring approval from local test success.

## Inventory Contract

Return asset ID, created timestamp, provider kind, attachment boolean, intent
presence and cleanup state (none/pending/acknowledged). The acknowledged state
means the legacy database records a deletion acknowledgement, not an independent
current provider-absence verification. Use one SQL statement/snapshot. No calls
to claim, finalize, complete or delete. Do not change the immutable asset table.

## September 14 Checkpoint

The disposable platform replay passes 75 migrations and the inventory checks:
24 registered assets span two cursor pages without duplicates or skipped
lookahead; exactly one has an intent; another tag returns no rows. A read-only
transaction accepts the RPC and both browser roles are denied. No production
migration, inventory endpoint or deletion was activated. Auth/storage remain
compatibility stubs. W6 is not complete.
