# Research Browser Grants Foundation

Status: database foundation only. Not wired into application authentication.
Migration: `20260907002000_add_research_browser_grants.sql`.

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
Issue a stable browser token before concurrent acceptance; add typed server-only
repository access, exact entry/Visit selection, atomic acceptance/grant creation,
verified migration of existing cookies, selective withdrawal and expiry recovery.
Do not merely wrap the current rotating-token RPC and claim race safety. Preserve
unmigrated cookies and compatibility while flags are off. Complete full-schema,
cross-tab and real mobile tests before switching the application to grants.
