# TASK_INDEX.md

## Southern Border Tourism Platform Task Index

| Task | Status | Purpose |
|---|---|---|
| `PHASE_01_PROJECT_SETUP.md` | Done / verify as needed | Next.js fullstack foundation |
| `PHASE_02_DATABASE_SCHEMA.md` | Partially implemented | Core schema foundation |
| `PHASE_02A_DATABASE_DDL_DML_TEST_DATA.md` | Implemented / local reset blocked | Database-first DDL/DML hardening and complete development seed |
| `PHASE_03_AUTH_IDENTITY.md` | Implemented / hardening needed | Admin auth and guest tourist identity |
| `PHASE_04_PUBLIC_ATTRACTION_PAGES.md` | Implemented / dynamic data wiring needed | Public tourism portal pages |
| `PHASE_04A_DYNAMIC_PUBLIC_CONTENT.md` | Completed | Database-backed homepage, attractions, stories, routes, and public-safe DTOs |
| `PHASE_05_QR_CHECKIN_FLOW.md` | Implemented / E2E verification needed | QR landing and minimal form entry |
| `PHASE_06_CERTIFICATE_GENERATION.md` | Implemented / rendering hardening needed | Certificate reward flow |
| `PHASE_07_SURVEY_EXPENSE_SATISFACTION.md` | Implemented / seeded data verification needed | Optional post-certificate survey |
| `PHASE_08_ADMIN_BACKOFFICE.md` | Implemented / CRUD expansion needed | Admin CMS foundation |
| `PHASE_08A_DYNAMIC_ADMIN_CRUD.md` | Completed | Admin CRUD for frontend-managed public content |
| `PHASE_08B_ADMIN_UX_HARDENING.md` | Completed | Admin CMS UX hardening, media workflow clarity, readiness, settings, and QA |
| `PHASE_09_DASHBOARD.md` | Implemented / seeded metric verification needed | Aggregated dashboard analytics |
| `PHASE_10_REPORT_EXPORT.md` | Implemented / privacy regression testing needed | Privacy-safe report export |
| `PHASE_11_LINE_LIFF_OPTIONAL.md` | Implemented foundation | Optional LINE passport linking |
| `PHASE_12_TESTING_HARDENING.md` | Completed | Stability, security, performance, and QA |
| `PHASE_12A_ADMIN_E2E_QA.md` | Implemented | Authenticated non-destructive admin smoke tests against the real app |
| `PHASE_13_DEPLOYMENT.md` | In progress | Release health gates implemented; preview/staging and operational sign-off remain |
| `PHASE_13A_CLOUDINARY_STORAGE_DEPLOYMENT.md` | Completed | Cloudinary-first Vercel storage with future university-storage path |
| `PHASE_16A_STORY_CMS_RECOMMENDATION_DASHBOARD_UX.md` | In progress (P2) | Full Story CMS, explainable recommendations, operational admin home, and analytical dashboard UX |
| `PHASE_16B_YALA_ADMIN_ANALYTICS_PRODUCTION.md` | In progress (P2) | Yala-first launch scope, privacy-safe engagement, command center, and production analytics |
| `PHASE_18_RESEARCH_EVALUATION_LAYER.md` | Core technical implementation complete | Versioned research consent, real-vs-simulated separation, system evaluation, operator decision tasks, and de-identified research analytics |
| `PHASE_20_PUBLIC_HOMEPAGE_VISUAL_FIDELITY.md` | Ready for delegated implementation | Reference-led public homepage visual redesign with production logic preserved |
| `PHASE_21_RESEARCH_PILOT_ACTIVATION.md` | Advisor direction approved / activation gated | Instrument freeze, ethics confirmation, pilot QA, and controlled field activation |
| `PHASE_22_ATTRACTION_LEVEL_ANALYTICS.md` | Planned | Per-attraction operational, funnel, tourism, satisfaction, and improvement analytics |
| `PHASE_23_NFC_CHECKIN_CHANNEL.md` | Planned | NFC entry through the canonical QR/check-in flow with channel analytics and tag governance |

## Immediate Priority

Proceed to Phase 13 preview/staging release verification. Run `PHASE_12A_ADMIN_E2E_QA.md` against the deployment before production sign-off.

Reason:

- Core admin UX hardening is complete.
- Authenticated local smoke now covers the real application without destructive mutations.
- Preview/staging must still prove environment configuration, storage, migrations, and runtime behavior before production release.

## P2 Product Expansion

Phase 16A is active and its Story CMS/recommendation foundation is implemented through explainable recommendations. Phase 16B continues the approved P2 stream with privacy-safe engagement, a reversible Yala pilot scope, and the production admin/analytics redesign. Neither phase supersedes the Immediate Priority above.

- `tasks/PHASE_16A_STORY_CMS_RECOMMENDATION_DASHBOARD_UX.md`
- `tasks/PHASE_16B_YALA_ADMIN_ANALYTICS_PRODUCTION.md`
- `docs/superpowers/specs/2026-07-16-story-cms-recommendation-dashboard-design.md`
- `docs/superpowers/plans/2026-07-16-story-cms-recommendation-dashboard.md`
- `docs/superpowers/plans/2026-07-30-yala-admin-analytics-production.md`

## Research Readiness

The advisor has approved the research direction. Phase 18's generic technical foundation is implemented. Phase 21 now governs instrument freeze, ethics confirmation, pilot QA, and final field activation; no final collection begins until those gates are documented.

- `docs/research/RESEARCH_BLUEPRINT.md`
- `docs/superpowers/specs/2026-08-08-research-evaluation-layer-design.md`
- `tasks/PHASE_18_RESEARCH_EVALUATION_LAYER.md`
- `tasks/PHASE_21_RESEARCH_PILOT_ACTIVATION.md`

## Public Experience and Entry Channels

Phase 20 is the next delegated visual batch. It changes public presentation only and must preserve production logic. Phase 22 adds decision-grade per-attraction analytics. Phase 23 adds NFC as a second physical entry channel into the same canonical check-in flow.

- `tasks/PHASE_20_PUBLIC_HOMEPAGE_VISUAL_FIDELITY.md`
- `tasks/PHASE_22_ATTRACTION_LEVEL_ANALYTICS.md`
- `tasks/PHASE_23_NFC_CHECKIN_CHANNEL.md`
