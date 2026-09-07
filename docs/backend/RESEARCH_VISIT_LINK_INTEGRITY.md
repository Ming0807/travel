# Research Visit Link Integrity

Migration: `20260907001000_guard_research_visit_rebinding.sql`.

A tourist research session can acquire its first Visit association once. The link
RPC locks that session, validates its access token and Visit owner/check-in code,
and rejects a different Visit or tourist after binding. Repeating the same owned
Visit is a no-op, including completed evaluations: no timestamps or statuses change.
Withdrawn, excluded and expired sessions cannot link. Public roles cannot execute
the RPC; the existing server ownership guard remains required.

The service rejects known rebinding before writes; SQL arbitrates concurrent
requests. Credentials for the Visit are only stored after RPC success. Deploying
code before this migration remains fail-closed for completed-link retries, but
database-level rebinding protection requires applying the migration.

Local verification uses the real replacement RPC and a minimal session schema in
the disposable `entry_session_qa` harness. Covers wrong token/owner, concurrent
different-Visit linking, exact no-op replay, completed replay, withdrawn rejection
and anonymous/authenticated denial. It is not complete research-schema validation.

Migration `20260907003000_correlate_research_entry_sessions.sql` adds a nullable,
indexed `entry_session_id` FK. The entry-aware acceptance RPC records this exact
association in the same transaction as consent creation/rotation. Once present it
cannot change or be cleared. A trigger verifies study, code, tourist participant
type and exact entry Visit, including direct writes. A different Visit at the same
code is not sufficient. If binding fails, the whole acceptance call rolls back,
including any legacy token rotation. Existing records remain null, with no guessed
backfill. Legacy acceptance remains available and does not acquire entry provenance.

The local harness now covers acceptance replay/concurrency, cross-entry collision
rollback, wrong first Visit denial, exact Visit/no-op retry and direct rebinding
denial. Its consent writer is a stub; full-schema consent integration remains a
release gate. Existing permissions and entry snapshot validation are preserved.
No production migration was applied by the agent.

Remaining: acceptance token rotation on valid retries,
bounded credential migration (ADR-011), full-schema and authenticated mobile QA.
Do not mark cross-tab research or pilot activation complete from this patch alone.
