# Phase 23 NFC Foundation QA

## Scope

Registry lifecycle, assignment snapshots, immutable audit, safe payload builder,
read-only resolver and repository. No existing route, identity, visit/reward,
research response, or chart code is modified. No tags are seeded or activated.

## Red/Green Evidence

- Payload/assignment tests first failed because payload construction and equality
  were unimplemented, then passed after implementation.
- Resolver tests first showed 13 failures for valid, malformed, inactive,
  revoked, reassigned and repeat-lookup cases, then passed.
- Isolated PostgreSQL script first failed because the registry did not exist.
  The completed migration passed lifecycle/permission/immutability assertions.

## SQL Verification

Run `node scripts/verify-nfc-registry.mjs` with `NFC_TEST_DATABASE_URL` set to a
fresh loopback PostgreSQL database named `nfc_registry_qa`. The script refuses
remote hosts and other database names. It does not load `.env.local`.

The test creates only minimal parent-table fixtures, applies the registry
migration inside a transaction, tests failures through savepoints, and rolls
everything back. This verifies PostgreSQL constraints, triggers and grants,
not the complete Supabase migration chain or production deployment.

Checks include draft-only provisioning; read-back before activation; immutable
code/location/token; terminal revocation; new-token replacement; one replacement
per predecessor; no deletes; ordered atomic lifecycle audit; anonymous and
authenticated denial; and trigger-only event writes from the service role.

## Release Boundaries

- Do not run the new migration in production yet; prepare staging and canonical
  integration first. The unchanged QR flow does not query the new tables.
- No real-device NFC test or authenticated provisioning UI test is claimed.
- No QR/NFC graphs are activated by this batch. Their contract is documented,
  including entry-session/visit linkage and unknown-history handling.
- Node 26 is installed locally; the configured release runtime is Node 22.

## Final Results

- Focused NFC + existing QR/session regression suite: 6 files, 75 tests passed.
- Disposable PostgreSQL 16: 29 assertions passed; all test fixtures rolled back.
- `pnpm run typecheck`: passed.
- Scoped ESLint for new service/repository/contracts/tests/verification script: passed.
- `pnpm run build`: passed, including 63/63 static generation steps.
- `git diff --check`: passed. The full suite is deferred to the integration/phase
  gate; this foundation is unused by existing production routes.
- No UI was changed in this batch, so no new visual sign-off is claimed.
