# ADR-011: Bounded Research Browser Credentials

## Status
Proposed, 2026-09-07; implementation checkpoint updated 2026-09-08. Database
foundation, exact-context server integration, atomic acceptance and default-off
browser preparation are implemented. Automatic legacy Visit migration, cleanup
scheduling and full rollout verification remain pending. Keep the research rollout
gate open; implemented code is not production activation approval.
See [current readiness](../../backend/RESEARCH_BROWSER_GRANTS.md).

## Context
Entry-scoped cookies isolate simultaneous check-in flows. Visit-scoped cookies
retain evaluation and withdrawal access for 30 days. Each Visit currently adds
an approximately 413-byte name/value pair to every request because Path is `/`.
Synthetic measurements using the current payload: 5 Visits = 2,073 bytes;
10 = 4,148; 20 = 8,298; 30 = 12,448. These exclude global/entry/auth cookies.
No infrastructure limit is assumed from these measurements. The unbounded growth
itself is incompatible with extended field collection.

Legacy acceptance rotates the session's access/withdrawal hashes on retry.
The grant migration must resolve this explicitly: repeated acceptance must not
invalidate another live tab or a saved Visit credential. The Visit-link RPC has
separate first-association/no-op protection; that alone does not fix token rotation.

## Proposed Decision
Use one high-entropy HttpOnly browser research credential referencing a server-side
grant registry. Store only credential hashes; bind individual grants to the exact
research session and entry/Visit. Keep existing research consent, provenance and
tourist ownership checks authoritative. A browser grant is neither tourist identity
nor consent. Do not automatically transfer research rights when accounts merge.

Migrate legacy credentials only after validating their existing access/withdrawal
tokens and session binding server-side. Add a grant transactionally before deleting
that corresponding cookie. Preserve other tabs and all unmigrated cookies. A failed
migration must retain the existing access path. Do not bulk-evict old credentials.
Server-side grants must expire no later than existing credential/session retention,
and withdrawal must revoke only its session grant. Retain explicit recovery/support
instructions when browser storage is cleared; do not promise cross-device recovery.

## Alternatives Considered
- Delete oldest Visit cookies: rejected; silently removes return/withdrawal access.
- One JSON cookie: rejected; still grows and concurrent tab writes lose updates.
- localStorage: rejected; exposes bearer credentials to client scripts.
- Narrow cookie Path: insufficient; withdrawal and server-action routes span paths.

## Implementation Gate
Document registry schema, indexes, cleanup and RLS/service-only RPCs; test parallel
acceptance, same-session replay, credential rotation, expiry, migration rollback,
multiple Visits, selective withdrawal and guest/account ownership. Verify header
size stays bounded after many sessions. Provide additive migration and rollback
compatibility before activation. Do not turn this proposal into production SQL
without completing its implementation and tests.
