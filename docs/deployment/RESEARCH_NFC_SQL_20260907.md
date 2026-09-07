# Research / NFC SQL Checkpoint: 2026-09-07

These migrations were added after the user's earlier SQL confirmation. The agent
has NOT applied them to production. Check migration history before applying; do
not blindly rerun files that are already applied.

Apply pending migrations in chronological order, after staging verification:

1. `20260907000000_guard_nfc_replacement_code.sql`: rejects NFC replacements assigned
   to a different check-in code; does not rewrite existing tags.
2. `20260907001000_guard_research_visit_rebinding.sql`: preserves the first Visit
   association and supports same-Visit retries, including completed sessions.
3. `20260907002000_add_research_browser_grants.sql`: server-only browser grant
   registry/RPC foundation. Application integration is still dormant.
4. `20260907003000_correlate_research_entry_sessions.sql`: captures immutable exact
   entry provenance during consent and rejects a Visit belonging to another entry.
5. `20260907004000_resolve_research_grant_context.sql`: service-only exact Visit/entry
   grant lookup; ambiguous matches return no capability. No runtime activation.
6. `20260907005000_accept_research_browser_grant.sql`: atomic consent/grant RPC with
   stable-token replay for verified browser grants. Existing live callers unchanged.

Prerequisites: the existing research core and all September 4-6 NFC/entry migrations.
No seed/reset/delete is required. No rollout environment flags should be enabled
as part of applying these files. Existing null entry provenance remains unknown;
there is no inferred historical backfill.

Local evidence: disposable PostgreSQL harness, 146 assertions;
read-only NFC object/permission verifier, 14 checks. These do not replace full-schema
staging, authenticated mobile flows or physical NFC testing. Valid acceptance retries
still rotate legacy credentials in existing live callers; the new atomic RPC is
dormant and bounded browser grant integration remains pending. Atomic acceptance
now uses the original consent RPC and consent table DDL; earlier wrapper scenarios
remain stubbed and surrounding schemas remain minimal. This is not full-schema QA.

Rollback: stop new entry/research rollout first; preserve captured provenance and
grants. Do not drop tables/columns or restore the unsafe link RPC to undo deployment.
Use a reviewed forward migration if complete-schema staging exposes a conflict.
