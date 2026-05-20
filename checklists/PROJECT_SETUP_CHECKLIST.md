# PROJECT_SETUP_CHECKLIST.md

## 1. Document Purpose

This checklist defines the project setup requirements for the **Southern Border Tourism Data & Intelligence Platform**.

Use this checklist before starting development with Codex, before running the first migration, before connecting Supabase, and before deploying the first MVP version.

The goal is to make sure the project starts cleanly, consistently, and professionally.

---

## 2. Project Setup Mission

The setup mission is:

```text
Create a clean, reproducible, secure, and maintainable project foundation before building features.
```

A good setup prevents:

```text
messy folder structure
unclear environment variables
broken local development
inconsistent formatting
missing documentation
unsafe secrets
bad migration workflow
confusing Codex tasks
```

---

## 3. Recommended Tech Stack Confirmation

Before coding, confirm the selected stack.

Recommended MVP stack:

```text
Next.js
TypeScript
Tailwind CSS
Supabase PostgreSQL
Supabase Auth
Supabase Storage
Server Actions / Route Handlers
Zod
Playwright
Vitest
```

Optional:

```text
LINE LIFF
React Hook Form
TanStack Table
Recharts
html-to-image
date-fns
```

Checklist:

```text
[ ] Tech stack decision is documented in ADR_001_TECH_STACK.md.
[ ] Next.js PWA strategy is documented.
[ ] Supabase PostgreSQL decision is documented.
[ ] LINE LIFF is marked optional, not required.
[ ] Guest flow is supported for tourists without LINE.
[ ] Certificate rendering strategy is documented.
```

---

## 4. Repository Structure

Expected root structure:

```text
fullstack-tourism/
  README.md
  AGENTS.md
  PROJECT_OVERVIEW.md
  PRODUCT_REQUIREMENTS.md
  MVP_SCOPE.md
  ROADMAP.md
  CHANGELOG.md
  CONTRIBUTING.md
  SECURITY.md
  DEPLOYMENT.md
  ENVIRONMENT.md
  docs/
  prompts/
  tasks/
  checklists/
  .github/
  .codex/
```

Checklist:

```text
[ ] Repository root exists.
[ ] README.md exists.
[ ] AGENTS.md exists.
[ ] PROJECT_OVERVIEW.md exists.
[ ] PRODUCT_REQUIREMENTS.md exists.
[ ] MVP_SCOPE.md exists.
[ ] ROADMAP.md exists.
[ ] CHANGELOG.md exists.
[ ] CONTRIBUTING.md exists.
[ ] SECURITY.md exists.
[ ] DEPLOYMENT.md exists.
[ ] ENVIRONMENT.md exists.
[ ] docs/ folder exists.
[ ] prompts/ folder exists.
[ ] tasks/ folder exists.
[ ] checklists/ folder exists.
[ ] .github/ folder exists.
[ ] .codex/skills/ folder exists.
```

---

## 5. Application Folder Structure

Recommended Next.js structure:

```text
src/
  app/
    (public)/
    (tourist)/
    admin/
    api/
  components/
    ui/
    public/
    tourist/
    admin/
    dashboard/
    certificate/
  server/
    actions/
    services/
    repositories/
    validators/
    auth/
    storage/
  lib/
    constants/
    utils/
    config/
    types/
  styles/
```

Checklist:

```text
[ ] src/app exists.
[ ] src/components exists.
[ ] src/server exists.
[ ] src/lib exists.
[ ] Public/tourist/admin areas are separated.
[ ] Server-side services are separated from UI components.
[ ] Validation schemas are centralized.
[ ] Shared constants are centralized.
[ ] Types are centralized or generated.
```

---

## 6. Supabase Project Setup

Checklist:

```text
[ ] Supabase project created.
[ ] Project region selected intentionally.
[ ] Database password stored securely.
[ ] Supabase URL copied.
[ ] Supabase anon key copied.
[ ] Supabase service role key copied only to server-side environment.
[ ] Supabase Auth enabled.
[ ] Supabase Storage enabled.
[ ] Local development connection tested.
[ ] Migration workflow selected.
```

Important:

```text
Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
```

---

## 7. Supabase Local Setup Optional

If using Supabase local CLI:

```text
[ ] Supabase CLI installed.
[ ] supabase init completed.
[ ] Local Supabase can start.
[ ] Local database reset works.
[ ] Local migrations can run.
[ ] Seed data can run.
[ ] Local storage/test buckets configured if needed.
```

Suggested commands:

```bash
supabase init
supabase start
supabase db reset
```

---

## 8. Environment Files

Required files:

```text
.env.local
.env.example
```

Checklist:

```text
[ ] .env.local exists locally.
[ ] .env.local is ignored by git.
[ ] .env.example exists.
[ ] .env.example contains variable names only, no real secrets.
[ ] Required environment variables are documented in ENVIRONMENT.md.
[ ] Deployment environment variables are configured separately.
```

---

## 9. Required Environment Variables

Public-safe variables:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LIFF_ID optional
```

Server-only variables:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
LINE_CHANNEL_SECRET optional
CRON_SECRET optional
EXPORT_SIGNING_SECRET optional
```

Checklist:

```text
[ ] NEXT_PUBLIC_APP_URL configured.
[ ] NEXT_PUBLIC_SUPABASE_URL configured.
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY configured.
[ ] SUPABASE_SERVICE_ROLE_KEY configured server-side only.
[ ] SUPABASE_DATABASE_URL configured server-side only if needed.
[ ] Optional LINE variables documented but not required.
[ ] CRON_SECRET configured if cron endpoints exist.
```

---

## 10. Git Configuration

Checklist:

```text
[ ] Git repository initialized.
[ ] .gitignore exists.
[ ] .env files ignored.
[ ] node_modules ignored.
[ ] build outputs ignored.
[ ] local temp files ignored.
[ ] commit history starts with clean baseline.
```

Recommended `.gitignore` items:

```text
.env
.env.local
.env.*.local
node_modules
.next
dist
coverage
playwright-report
test-results
.DS_Store
```

---

## 11. Package Setup

Checklist:

```text
[ ] package.json exists.
[ ] Project name is clear.
[ ] TypeScript installed/configured.
[ ] Next.js installed.
[ ] React installed.
[ ] Tailwind CSS installed/configured.
[ ] ESLint installed/configured.
[ ] Prettier installed/configured.
[ ] Vitest installed/configured.
[ ] Playwright installed/configured.
[ ] Required scripts exist.
```

Recommended scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:unit": "vitest run tests/unit",
  "test:integration": "vitest run tests/integration",
  "test:e2e": "playwright test",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

---

## 12. TypeScript Setup

Checklist:

```text
[ ] tsconfig.json exists.
[ ] strict mode enabled.
[ ] path aliases configured if used.
[ ] noImplicitAny enabled or covered by strict.
[ ] TypeScript build passes.
```

Recommended:

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 13. Tailwind CSS Setup

Checklist:

```text
[ ] Tailwind installed.
[ ] tailwind.config.ts exists.
[ ] globals.css imports Tailwind layers.
[ ] Design tokens configured or planned.
[ ] Thai/English font strategy documented.
[ ] Public/tourist/admin UI can share design system.
```

Recommended fonts:

```text
Inter
Prompt
Sarabun
```

Use only what the project needs to avoid performance issues.

---

## 14. Code Quality Tools

Checklist:

```text
[ ] ESLint configured.
[ ] Prettier configured.
[ ] Typecheck script works.
[ ] Formatting script works.
[ ] Lint script works.
[ ] Import aliases work.
[ ] Unused code rules considered.
```

Optional:

```text
[ ] Husky/pre-commit hooks configured.
[ ] lint-staged configured.
```

---

## 15. Testing Setup

Checklist:

```text
[ ] Vitest configured.
[ ] Unit test folder exists.
[ ] Integration test folder exists.
[ ] Playwright installed.
[ ] Playwright config exists.
[ ] Test environment variables documented.
[ ] Test seed data strategy documented.
[ ] At least one sample test runs.
```

Suggested folders:

```text
tests/unit
tests/integration
tests/e2e
tests/security
```

---

## 16. Database Migration Setup

Checklist:

```text
[ ] Migration folder exists.
[ ] Initial schema migration planned.
[ ] Seed data script planned.
[ ] Migration naming convention defined.
[ ] Rollback/restore approach documented.
[ ] Local migration tested.
[ ] Staging migration tested before production.
```

Recommended migration naming:

```text
YYYYMMDDHHMM_description.sql
```

Examples:

```text
202605190900_create_reference_tables.sql
202605190930_create_tourism_core_tables.sql
202605191000_create_dashboard_indexes.sql
```

---

## 17. Seed Data Setup

Required seed groups:

```text
provinces
districts
countries
age groups
transport modes
travel purposes
travel companions
expense categories
spending ranges
attraction types
admin roles
permissions
certificate templates
sample attractions
sample photo spots
sample check-in codes
```

Checklist:

```text
[ ] Seed file exists or is planned.
[ ] Seed data can run repeatedly safely.
[ ] Seed data does not create duplicate rows.
[ ] Test seed data is separated from production seed data.
[ ] Sample tourist data is synthetic.
```

---

## 18. Authentication Setup

Checklist:

```text
[ ] Supabase Auth configured.
[ ] Admin login flow selected.
[ ] Admin users table planned.
[ ] Role/permission tables planned.
[ ] Admin session server-side check planned.
[ ] Viewer/admin/super_admin roles seeded.
[ ] Tourist flow does not require Supabase login.
[ ] Guest tourist identity strategy documented.
```

---

## 19. Storage Bucket Setup

Required buckets:

```text
attraction-media
visit-photos
certificate-files
stamp-assets
export-files
official-imports
temp-uploads
```

Checklist:

```text
[ ] attraction-media bucket configured.
[ ] visit-photos bucket configured as private/controlled.
[ ] certificate-files bucket configured as private/controlled.
[ ] stamp-assets bucket configured.
[ ] export-files bucket configured as private.
[ ] official-imports bucket configured as private if used.
[ ] temp-uploads bucket configured as private if used.
[ ] Bucket policies documented.
```

---

## 20. Public Routes Setup

Checklist:

```text
[ ] Public home route planned.
[ ] Public attractions route planned.
[ ] Attraction detail route planned.
[ ] QR/check-in route planned.
[ ] Certificate flow route planned.
[ ] Passport route planned.
[ ] Survey route planned.
[ ] Error/unavailable pages planned.
```

Recommended routes:

```text
/
/attractions
/attractions/[slug]
/checkin/[code]
/visit/[visitId]/photo
/visit/[visitId]/certificate
/passport
/survey/[visitId]
```

Route design can change, but must be documented.

---

## 21. Admin Routes Setup

Checklist:

```text
[ ] /admin route planned.
[ ] /admin/dashboard route planned.
[ ] /admin/attractions route planned.
[ ] /admin/photo-spots route planned.
[ ] /admin/checkin-codes route planned.
[ ] /admin/visits route planned.
[ ] /admin/surveys route planned.
[ ] /admin/reports route planned.
[ ] /admin/users route planned for super_admin.
```

---

## 22. API/Server Action Setup

Checklist:

```text
[ ] Public data actions/routes planned.
[ ] Tourist flow actions/routes planned.
[ ] Admin actions/routes planned.
[ ] Dashboard actions/routes planned.
[ ] Export actions/routes planned.
[ ] Error response format planned.
[ ] Service result pattern planned.
[ ] Validation pattern planned.
```

Recommended server layers:

```text
validators -> services -> repositories -> database/storage
```

---

## 23. Design System Setup

Checklist:

```text
[ ] Color palette selected.
[ ] Typography selected.
[ ] Button styles defined.
[ ] Form input styles defined.
[ ] Card styles defined.
[ ] Dashboard KPI card styles defined.
[ ] Loading/empty/error states defined.
[ ] Mobile-first rules documented.
[ ] Accessibility baseline documented.
```

Documents:

```text
docs/frontend/DESIGN_SYSTEM.md
docs/frontend/UI_UX_PRINCIPLES.md
```

---

## 24. PWA Setup

Checklist:

```text
[ ] PWA requirement documented.
[ ] Manifest planned.
[ ] App icon planned.
[ ] Offline fallback considered.
[ ] QR flow works without requiring install.
[ ] Passport guest storage limitations documented.
```

MVP PWA can be basic.

Do not let PWA complexity delay QR-to-certificate flow.

---

## 25. LINE LIFF Optional Setup

If LINE LIFF is included:

```text
[ ] LIFF app created.
[ ] LIFF ID configured.
[ ] LINE callback/domain configured.
[ ] LINE ID token verification planned server-side.
[ ] LINE linking consent documented.
[ ] LINE is optional.
[ ] Guest/foreign tourist path still works.
```

If not included in MVP:

```text
[ ] LINE marked as optional future phase.
```

---

## 26. Security Baseline Setup

Checklist:

```text
[ ] SECURITY.md exists.
[ ] PDPA/privacy docs exist.
[ ] Consent strategy exists.
[ ] Role/permission matrix exists.
[ ] RLS/storage strategy exists.
[ ] Audit logging strategy exists.
[ ] Data anonymization strategy exists.
[ ] Image upload security strategy exists.
```

---

## 27. Documentation Setup for Codex

Checklist:

```text
[ ] AGENTS.md exists.
[ ] CODEX_MAIN_PROMPT.md exists.
[ ] CODEX_TASK_TEMPLATE.md exists.
[ ] CODEX_REVIEW_PROMPT.md exists.
[ ] CODEX_DEBUG_PROMPT.md exists.
[ ] .codex/skills exists.
[ ] Project tasks are broken into phases.
[ ] Codex instructions warn against breaking architecture.
[ ] Codex instructions require tests and docs updates.
```

---

## 28. GitHub Setup

Checklist:

```text
[ ] .github/copilot-instructions.md exists.
[ ] Pull request template exists.
[ ] Issue template exists.
[ ] Branch naming convention documented.
[ ] PR review rules documented.
```

Recommended branch names:

```text
feature/qr-checkin-flow
feature/database-schema
fix/certificate-upload
docs/dashboard-requirements
```

---

## 29. CI/CD Setup

Minimum CI:

```text
[ ] install dependencies
[ ] typecheck
[ ] lint
[ ] unit tests
[ ] build
```

Future CI:

```text
[ ] integration tests
[ ] E2E tests
[ ] security tests
[ ] migration check
[ ] secret scan
```

---

## 30. Deployment Setup

Checklist:

```text
[ ] Hosting provider selected.
[ ] Build command documented.
[ ] Environment variables configured.
[ ] Database migration process documented.
[ ] Storage bucket setup documented.
[ ] Custom domain optional.
[ ] HTTPS enabled.
[ ] Smoke test steps documented.
```

---

## 31. Initial Development Order

Recommended order:

```text
1. Project setup
2. Database schema and seed data
3. Auth and roles
4. Public attraction pages
5. QR/check-in flow
6. Tourist profile and consent
7. Photo upload
8. Certificate generation
9. Stamp/passport
10. Survey
11. Admin CMS
12. Dashboard
13. Export
14. Security hardening
15. Testing and deployment
```

Checklist:

```text
[ ] Phase order accepted.
[ ] First Codex task is small and clear.
[ ] Database schema is built before feature-heavy UI.
[ ] Dashboard metrics are defined before implementation.
```

---

## 32. Common Setup Mistakes to Avoid

Do not:

```text
start coding without schema plan
put service role key in frontend
skip .env.example
skip seed data
mix tourist/admin routes without separation
build dashboard from raw frontend aggregation
require LINE for all tourists
require too many fields before certificate
skip database constraints
skip permissions until later
```

---

## 33. Project Setup Acceptance Checklist

```text
[ ] Repository structure is ready.
[ ] Next.js project runs locally.
[ ] TypeScript strict mode enabled.
[ ] Tailwind configured.
[ ] Supabase project configured.
[ ] Environment variables documented.
[ ] .env.local ignored by git.
[ ] .env.example exists.
[ ] Storage bucket strategy documented.
[ ] Migration workflow selected.
[ ] Seed data strategy defined.
[ ] Auth/role strategy defined.
[ ] Public/tourist/admin routes planned.
[ ] Testing tools configured.
[ ] Documentation folders exist.
[ ] Codex prompts/skills exist or are planned.
[ ] Security/privacy docs exist.
[ ] Build/lint/typecheck commands work.
```

---

## 34. Final Project Setup Rule

Do not rush into feature coding before the foundation is clean.

A production-oriented project starts with structure, environment, security, database planning, and documentation.
