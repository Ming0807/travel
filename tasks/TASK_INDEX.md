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
| `PHASE_16A_STORY_CMS_RECOMMENDATION_DASHBOARD_UX.md` | Planned (P2) | Full Story CMS, explainable recommendations, operational admin home, and analytical dashboard UX |

## Immediate Priority

Proceed to Phase 13 preview/staging release verification. Run `PHASE_12A_ADMIN_E2E_QA.md` against the deployment before production sign-off.

Reason:

- Core admin UX hardening is complete.
- Authenticated local smoke now covers the real application without destructive mutations.
- Preview/staging must still prove environment configuration, storage, migrations, and runtime behavior before production release.

## P2 Product Expansion

Phase 16A is approved as the next product-expansion stream after higher-priority release work. Its design and implementation plan are documented, but it does not supersede the Immediate Priority above.

- `tasks/PHASE_16A_STORY_CMS_RECOMMENDATION_DASHBOARD_UX.md`
- `docs/superpowers/specs/2026-07-16-story-cms-recommendation-dashboard-design.md`
- `docs/superpowers/plans/2026-07-16-story-cms-recommendation-dashboard.md`
