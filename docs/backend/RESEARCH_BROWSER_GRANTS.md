# Research Browser Grants Foundation

Status: database foundation plus server-only adapters. Not wired into application authentication.
Migration: `20260907002000_add_research_browser_grants.sql`.
Context lookup: `20260907004000_resolve_research_grant_context.sql`, after exact
entry provenance migration `20260907003000_correlate_research_entry_sessions.sql`.
Atomic acceptance: `20260907005000_accept_research_browser_grant.sql` (dormant).

## Contract
The composite key is a browser credential hash plus research session ID. No raw
browser token, participant profile or photo is stored. Grants are not consent and
do not replace tourist ownership checks. Bind validates both existing session token
hashes under a row lock, after taking the study lock in acceptance-compatible order.
Repeats do not extend expiry or revive revoked grants. Expiry is bounded by session
creation plus 30 days and the current study retention date. Older legacy credentials
must keep their existing path if migration is rejected; never delete them on failure.

Resolve requires the browser hash and exact public session code. It returns only
server-side RPC credential hashes and the linked Visit. These are capabilities,
not chart/API response data: never send them to a client, log or export. Live session
status, withdrawal and study retention are rechecked. Current token hashes are read
from the session so credential rotation does not invalidate a previously issued grant.
This does not yet repair cookie-only callers or initial concurrent acceptance.

The new browser acceptance RPC checks the independent entry-browser proof, then
serializes calls per entry. Existing verified grants reuse current session token
hashes; proposed new tokens do not invalidate them on retry. Every acceptance still
passes through the existing deployment, instrument freeze and consent checks.
Consent and grant binding commit together or both roll back. Existing sessions
without a resolvable grant return `RESEARCH_GRANT_MIGRATION_REQUIRED`; knowing an
entry UUID cannot take over old/revoked/ambiguous research access.

This RPC is not a drop-in replacement for cookie-only acceptance: on a replay the
proposed raw tokens are intentionally not stored. Its caller must resolve the grant,
not write those proposed tokens into legacy cookies. Stable browser provisioning,
service integration and explicit legacy migration must precede activation.

Context resolution accepts an exact Visit or entry UUID plus the browser hash,
restricts to tourist sessions, and reuses the authoritative live-grant resolver.
It reads at most two matching candidates and returns a result only when exactly
one remains. Ambiguous sessions fail closed, never newest/first-row selection.
The server adapter validates the returned context again. Legacy migration now
proves that Visit-based lookup returns the same public session before retiring
the cookie; successful public-code lookup alone is insufficient.

Revoke targets one browser/session pair without changing other grants or the
research consent record. Research withdrawal still uses its authoritative existing
transaction; all grants then fail resolution through session status.

RLS and table privileges deny direct reads/writes to anon, authenticated and
service_role. Only the explicit RPCs are service-role executable. No app caller,
automatic migration, public flag or cron job is enabled by this migration.

## Cleanup
Cleanup accepts 1..1000 rows per call, uses expiry order and SKIP LOCKED. Expired
rows/tombstones are retained until 30 days after grant creation so a removed
revocation cannot be reissued with a still-valid legacy credential. Session deletion
cascades grants. Include this metadata window in the retention review before rollout;
no participant answers are duplicated here. The scheduled cleanup integration remains
pending and must use existing authenticated maintenance infrastructure.

## Remaining Integration
`research-browser-grant.repository.ts` validates proof and RPC responses and exposes
no public server action. `research-browser.ts` provides a fixed-size Secure/HttpOnly
host-only cookie and a dormant legacy Visit migration helper. It must not be called
by the live flow until grant-based Visit/entry lookup is integrated. It binds, reads
back the exact Visit, renews the same browser token and only then removes that Visit
cookie. Failure before removal leaves old credentials untouched. No browser token
is generated implicitly in migration, avoiding competing initial response tokens.

Issue a stable browser token before concurrent acceptance; add typed server-only
integrate the atomic acceptance RPC and typed context resolver,
verified migration of existing cookies, selective withdrawal and expiry recovery.
Do not merely wrap the current rotating-token RPC and claim race safety. Preserve
unmigrated cookies and compatibility while flags are off. Complete full-schema,
cross-tab and real mobile tests before switching the application to grants.
