# Phase 16A: Story CMS, Recommendation, and Dashboard UX

Status: In progress (domain, schema, and editorial service foundation complete)
Priority: P2
Approved direction: 2026-07-16

## Boundary

This phase is intentionally P2. It must not replace, hide, or mark complete the separate P0/P1 production-release work.

## Goal

Build a full editorial Story/Blog CMS, explainable content recommendations, a task-oriented admin home, and a clearer analytics dashboard.

## Source Documents

- `docs/superpowers/specs/2026-07-16-story-cms-recommendation-dashboard-design.md`
- `docs/superpowers/plans/2026-07-16-story-cms-recommendation-dashboard.md`
- `docs/frontend/ADMIN_CONTENT_CMS_WORKFLOW.md`
- `docs/frontend/ADMIN_UI_SPEC.md`
- `docs/frontend/DASHBOARD_UI_SPEC.md`
- `docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md`

## Workstreams

1. Story domain contracts and schema
2. Editorial workflow and UGC moderation
3. Structured editor, revisions, SEO, scheduling, and readiness
4. Public Blog/Story information architecture
5. Curated and rule-based recommendations
6. Privacy-safe engagement signals
7. `/admin` operational command center
8. `/admin/dashboard` analytical hierarchy
9. Accessibility, performance, testing, and documentation

## Non-Goals

- AI-generated editorial decisions
- opaque personalization without enough data
- mandatory tourist tracking
- external headless CMS migration
- changes to the deferred P0/P1 production backlog

## Acceptance Criteria

- Editorial articles and tourist submissions have separate, understandable workflows.
- Admin can recover revisions and schedule publish-ready stories.
- Public stories render structured, accessible content with relevant recommendations.
- Recommendations are explainable and exclude non-public content.
- `/admin` answers operational questions while `/admin/dashboard` answers analytical questions.
- All dashboard metrics remain privacy-safe and definition-accurate.
- Documentation accurately distinguishes implemented and planned behavior.

## Status Checklist

- [x] Product direction approved
- [x] Design specification written
- [x] Implementation plan written
- [x] Story domain contracts implemented
- [x] Database migration created and reviewed
- [x] Story platform schema migration applied and verified by the project owner
- [x] Atomic editorial-change RPC migration applied and confirmed by the project owner
- [x] Editorial service, validation, RBAC policy, optimistic locking, and revision repository implemented
- [ ] Existing visual editor migrated from compatibility actions to the atomic editorial action
- [ ] Editorial library and moderation queue implemented
- [ ] Structured editor and revisions implemented
- [ ] Public story experience implemented
- [ ] Recommendation engine implemented
- [ ] Operational dashboard implemented
- [ ] Analytics dashboard hierarchy implemented
- [ ] Full QA and documentation closeout completed
