# PHASE_02_DATABASE_SCHEMA.md

## Status

Partially implemented, now being hardened through Phase 02A.

## Goal

Create an analytics-ready, privacy-aware Supabase PostgreSQL schema for the tourism platform.

The schema must support:

- Public attraction and story content
- QR check-in and funnel analytics
- Guest tourist identity
- Minimal visit recording
- Photo upload metadata
- Digital certificate generation
- Digital stamp/passport
- Optional post-certificate survey
- Expense and satisfaction analysis
- Admin CMS
- Dashboard metrics
- Privacy-safe exports
- Official data comparison without mixing official arrivals with platform visits

---

## Current Notes

The initial schema exists in `supabase/migrations/20260520000000_init_schema.sql`.

Additional migrations currently cover:

- Satisfaction/expense schema fix
- Supabase storage setup
- LINE optional identity linking metadata
- Storage security hardening
- Travel stories
- Official data import
- Database foundation hardening

Phase 02A adds a database-first reset plan because the frontend and admin screens now need richer dynamic data and stronger seed fixtures.

See:

- `docs/database/DATABASE_FIRST_IMPLEMENTATION_PLAN.md`
- `tasks/PHASE_02A_DATABASE_DDL_DML_TEST_DATA.md`

---

## Acceptance Criteria

- Clean migrations run in order.
- DDL separates QR scans, visits, certificates, stamps, surveys, expenses, and official data.
- Repeat visits are allowed.
- Duplicate stamps are prevented.
- Certificate generation is idempotent per visit.
- Survey is optional and dashboard-safe.
- Dashboard rules are preserved: QR scans are not visits, missing satisfaction is No data, estimated spending is not revenue.
- Sensitive data is private by default.
- Seed data is sufficient for development and testing.
