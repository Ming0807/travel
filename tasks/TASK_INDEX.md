# TASK_INDEX.md

## Southern Border Tourism Platform Task Index

| Task | Status | Purpose |
|---|---|---|
| `PHASE_01_PROJECT_SETUP.md` | Done / verify as needed | Next.js fullstack foundation |
| `PHASE_02_DATABASE_SCHEMA.md` | Partially implemented | Core schema foundation |
| `PHASE_02A_DATABASE_DDL_DML_TEST_DATA.md` | Implemented / local reset blocked | Database-first DDL/DML hardening and complete development seed |
| `PHASE_03_AUTH_IDENTITY.md` | Implemented / hardening needed | Admin auth and guest tourist identity |
| `PHASE_04_PUBLIC_ATTRACTION_PAGES.md` | Implemented / dynamic data wiring needed | Public tourism portal pages |
| `PHASE_04A_DYNAMIC_PUBLIC_CONTENT.md` | Started | Database-backed homepage, attractions, stories, routes, and public-safe DTOs |
| `PHASE_05_QR_CHECKIN_FLOW.md` | Implemented / E2E verification needed | QR landing and minimal form entry |
| `PHASE_06_CERTIFICATE_GENERATION.md` | Implemented / rendering hardening needed | Certificate reward flow |
| `PHASE_07_SURVEY_EXPENSE_SATISFACTION.md` | Implemented / seeded data verification needed | Optional post-certificate survey |
| `PHASE_08_ADMIN_BACKOFFICE.md` | Implemented / CRUD expansion needed | Admin CMS foundation |
| `PHASE_08A_DYNAMIC_ADMIN_CRUD.md` | Planned | Admin CRUD for frontend-managed public content |
| `PHASE_09_DASHBOARD.md` | Implemented / seeded metric verification needed | Aggregated dashboard analytics |
| `PHASE_10_REPORT_EXPORT.md` | Implemented / privacy regression testing needed | Privacy-safe report export |
| `PHASE_11_LINE_LIFF_OPTIONAL.md` | Implemented foundation | Optional LINE passport linking |
| `PHASE_12_TESTING_HARDENING.md` | In progress | Stability, security, performance, and QA |
| `PHASE_13_DEPLOYMENT.md` | Planned | Deployment and release |
| `PHASE_13A_CLOUDINARY_STORAGE_DEPLOYMENT.md` | In progress | Cloudinary-first Vercel storage with future university-storage path |

## Immediate Priority

Complete local `supabase db reset` validation for `PHASE_02A_DATABASE_DDL_DML_TEST_DATA.md`, then continue `PHASE_04A_DYNAMIC_PUBLIC_CONTENT.md`, `PHASE_08A_DYNAMIC_ADMIN_CRUD.md`, and `PHASE_13A_CLOUDINARY_STORAGE_DEPLOYMENT.md`.

Reason:

- The new frontend wants dynamic content.
- Admin CRUD should manage real records used by public pages.
- Dashboard/export testing needs seeded transaction data.
- DDL/DML issues are cheaper to fix before more features depend on them.
- Vercel development needs Cloudinary-backed uploads/certificates before end-to-end tourist flow testing.
