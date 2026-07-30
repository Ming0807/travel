# Phase 16B: Yala Pilot, Admin Command Center, and Analytics Production

Status: In progress
Priority: P2
Approved direction: 2026-07-30

## Goal

Deliver a reversible Yala-first pilot, privacy-safe Story engagement, a premium operational admin home, and production-grade analytical dashboards.

## Source Plan

- `docs/superpowers/plans/2026-07-30-yala-admin-analytics-production.md`
- `docs/superpowers/plans/2026-07-16-story-cms-recommendation-dashboard.md`
- `docs/frontend/ADMIN_UI_SPEC.md`
- `docs/frontend/DASHBOARD_UI_SPEC.md`
- `docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md`

## Workstreams

1. Privacy-safe Story engagement signals
2. Reversible Yala-only launch scope
3. Admin visual foundation
4. Operational command center
5. Bounded analytics SQL/RPC contracts
6. Thai-first analytical dashboard redesign
7. Authenticated browser QA and production documentation

## Non-Goals

- Deleting Pattani or Narathiwat master/historical data
- Calling deterministic recommendations AI
- Tracking identifiable tourists for Story analytics
- Treating QR scans as visits
- Treating estimated spending as revenue
- Styling-only dashboard changes that keep unsafe raw-query architecture

## Status Checklist

- [x] UX and analytics architecture audit completed
- [x] Story engagement privacy audit completed
- [x] Database scope/data audit completed
- [x] Detailed implementation plan written
- [x] Privacy-safe Story engagement implemented locally; migration and production secret pending
- [x] Yala launch scope implemented in code; two production migrations pending owner apply/verify
- [ ] Real Yala seed/import prepared and documented
- [ ] Admin visual foundation implemented
- [ ] Operational command center implemented
- [ ] Analytics SQL/RPC contract implemented
- [ ] Analytical dashboard redesigned
- [ ] Production browser QA completed
- [ ] SQL run ledger reconciled with the owner

## SQL Ledger (2026-07-30)

- `20260730110000_add_destination_launch_scope.sql`: created, not applied remotely
- `20260730111000_enforce_destination_launch_scope.sql`: created, not applied remotely
- `20260730112000_complete_thai_origin_and_yala_geography.sql`: planned only, not created; requires official reference validation

After applying the first two migrations, run:

```bash
npm run db:destination-scope:verify
```

Do not run `supabase/seed.sql` in production. It contains development/demo data and is not the approved Yala official-data import.

## Definition of Done

- Yala is the only active public launch province without destructive deletion.
- `/admin` prioritizes actionable operational work.
- `/admin/dashboard` presents definition-accurate, bounded, Thai-first decision support.
- Story engagement cannot identify a tourist and cannot block content use.
- UI follows the white/ink/coral operational design system on desktop and mobile.
- All new migrations are documented as created, applied, or pending.
