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

Remaining: acceptance token rotation, immutable entry-to-session correlation,
bounded credential migration (ADR-011), full-schema and authenticated mobile QA.
Do not mark cross-tab research or pilot activation complete from this patch alone.
