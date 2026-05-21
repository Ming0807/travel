# PHASE_02A_DATABASE_DDL_DML_TEST_DATA.md

## Status

DDL/DML implemented; local Supabase reset attempted but blocked because Docker Desktop / Docker daemon is not running in the current environment.

## Goal

Stabilize the Supabase PostgreSQL foundation before expanding dynamic frontend, admin CRUD, dashboard analytics, and exports.

This phase focuses on:

1. DDL correctness
2. DML seed completeness
3. Rerunnable development data
4. Dashboard-ready synthetic transaction data
5. Privacy-safe test fixtures

---

## Why This Phase Exists

The public frontend now includes richer destination, story, about, contact, dashboard preview, and admin official data screens. These screens need a reliable database foundation instead of scattered mock data.

The correct order is:

```text
DDL -> DML -> repository/service wiring -> frontend/admin CRUD -> dashboard/export verification
```

---

## DDL Tasks

- [x] Review migration order.
- [x] Fix official data key types to match `provinces.province_id` and `attractions.attraction_id`.
- [x] Remove broad official data RLS policies for `anon` / generic `authenticated` users.
- [x] Add data quality indexes and constraints for idempotent seed data.
- [x] Add `supabase/config.toml` so local reset/seed validation can run through Supabase CLI.
- [ ] Validate migrations on a clean local Supabase database.
- [x] Update data dictionary for new travel stories and official data tables.
- [x] Update relationships/indexing docs for new constraints and indexes.

---

## DML Tasks

- [x] Replace incomplete seed data with a comprehensive development seed.
- [x] Seed reference/master data.
- [x] Seed public tourism content.
- [x] Seed photo spots and check-in codes.
- [x] Seed certificate templates and stamp definitions.
- [x] Seed synthetic tourists, anonymous identities, consents, visits, certificates, stamps, surveys, and expenses.
- [x] Seed funnel events for QR scans, landing views, certificate events, survey events, and passport events.
- [x] Seed admin roles/permissions aligned with application permission keys.
- [x] Seed sample audit logs/export jobs/import logs.
- [x] Seed official tourism stats separately from platform visits.

---

## Required Seed Coverage

| Seed Group | Minimum |
|---|---:|
| Countries | 10 |
| Provinces | 10 |
| Districts | 25 |
| Attraction types | 10 |
| Attractions | 15 |
| Photo spots | 20 |
| Check-in codes | 20 |
| Travel stories | 8 |
| Suggested routes | 4 |
| Demo tourist profiles | 12 |
| Demo visits | 25 |
| Certificates | 15 |
| Stamps | 15 |
| Surveys | 12 |
| Expense rows | 20 |
| Funnel events | 60 |

---

## Product Rules to Preserve

- Guest mode works first.
- No LINE/Google/email/phone before certificate.
- Survey is optional and appears after certificate.
- QR scan is not a visit.
- Landing view is not a visit.
- Visit is created after minimal profile and consent.
- Repeat visits are allowed.
- Duplicate stamps are prevented.
- Estimated spending is not revenue.
- Missing satisfaction is No data, not `0`.
- Tourist profiles are not verified unique people.
- Dashboard/export must not expose private identifiers.

---

## Acceptance Criteria

- Migrations can run in order on a clean local database.
- Seed can run more than once without duplicate master data.
- Seed includes public content for dynamic homepage/attraction/story pages.
- Seed includes QR codes for tourist check-in testing, including `DEMO-CODE-123`.
- Seed includes synthetic dashboard data across Yala, Pattani, Narathiwat, Songkhla, and Satun.
- Seed does not include real personal data, real LINE IDs, real Google subjects, real emails, or real phone numbers.
- Official data remains separate from platform visit data.
- Sensitive tables remain private by default.
- Admin official data import requires server-side permission checks.

---

## Validation

Run if practical:

```bash
npm run typecheck
npm run test
npm run build
supabase db reset
supabase db lint
```

Do not claim Supabase commands passed unless they were actually run against a local database.

Latest validation note:

```text
npx supabase db reset
status: failed/not completed
reason: Docker daemon was not available (dockerDesktopLinuxEngine pipe missing).
```

---

## Next Phase After This

Phase 04A / Phase 08A: connect the new public frontend and admin CRUD screens to database-backed repositories using public-safe DTOs and server-side permission checks.
