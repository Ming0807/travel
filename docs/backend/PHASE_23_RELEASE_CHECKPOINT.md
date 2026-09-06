# Phase 23 Default-Off Release Checkpoint

The user authorized a code push on September 6. Publishing code is not permission
to migrate production or activate NFC/research entry attribution.

## Rollout State

Keep `CHECKIN_ENTRY_SESSIONS_ENABLED=false` and `NFC_CHECKIN_ENABLED=false`.
Unset flags also default to false. Do not configure a production hash secret in
source control. The existing QR path remains the default while these flags are off.
Admin NFC management reports unavailable data if its registry is not installed.

## Migration Order

Apply only after staging approval, in this order:

1. `20260904000000_add_nfc_tag_registry.sql`
2. `20260904001000_add_checkin_entry_sessions.sql`
3. `20260905000000_snapshot_entry_research_scope.sql`
4. `20260905001000_guard_nfc_activation_assignment.sql`
5. `20260906000000_bind_entry_research_acceptance.sql`

Existing research-core migrations are prerequisites. These migrations are
additive; they do not label historical Visits as QR/NFC or grant research consent.
No production SQL was executed by the agent during this checkpoint.
The user subsequently reported applying all SQL in Supabase. Record that as
user-reported until read-only object/grant verification succeeds; do not rerun
migrations just because SQL Editor execution may not populate migration history.
Use `node scripts/verify-nfc-release-schema.mjs` for the narrow read-only check.

September 6 verification: Supabase REST OpenAPI (read-only) exposes all three new
tables, the three research snapshot columns and the entry-aware consent RPC.
The direct PostgreSQL hostname did not resolve, so production grants/triggers were
not independently verified. Local disposable schema/grant checks passed. Do not
interpret REST object discovery as full production behavior or permission QA.

## Evidence And Remaining Gates

Release verification on Node 22.23.2: 336 test files / 2,444 tests passed;
Next.js production build and its TypeScript check passed (63 generated pages).
ESLint passed for staged source/test scripts after removing one unused test import.
Staged whitespace and high-risk credential-pattern checks passed. Temporary QA
screenshots and browser output were excluded from the commit.

Disposable local PostgreSQL: 44 assertions passed. The new consent wrapper is
tested with a downstream legacy-RPC stub; verify real consent insertion, replay,
withdrawal and concurrent deployment changes on a complete staging schema.

Before activation, finish authenticated permission/browser QA, NFC hardware tests,
public aggregate evidence-scope audit, extended-use cookie/header-size review,
entry-to-Visit research correlation review and installation evidence workflows.
Executive channel summary and remaining Phase 24 work are not declared complete.

## Rollback

Disable both rollout flags together, leaving additive tables and recorded evidence
intact. Do not delete migrations or backfill/reclassify prior records. Open entry
flows may need a fresh scan through the legacy path; communicate this during a
controlled rollout. Use the previous application commit if a default-off regression
is detected. Avoid destructive database rollback.
