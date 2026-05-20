# 00_INDEX.md

## 1. Purpose

This document is the documentation index for the **Southern Border Tourism Data & Intelligence Platform**.

It explains what each documentation file is for, when it should be read, and how the files connect to each other.

AI coding agents, developers, researchers, and project reviewers should use this file as the main navigation document.

---

## 2. Documentation Philosophy

This project must be documented like a serious production-oriented information system.

Documentation must support:

- Clear system understanding
- Controlled AI-assisted development
- Database quality
- UX consistency
- Privacy and security awareness
- Dashboard and analytics correctness
- Academic reporting
- Future maintenance

The documentation should prevent the project from becoming an unstructured collection of pages and CRUD screens.

---

## 3. Required Reading Order

Before writing code, read files in this order:

```text
1. README.md
2. AGENTS.md
3. PROJECT_OVERVIEW.md
4. PRODUCT_REQUIREMENTS.md
5. MVP_SCOPE.md
6. ROADMAP.md
7. docs/00_INDEX.md
8. docs/02_SYSTEM_OVERVIEW.md
9. Relevant module documentation
10. Relevant task documentation
11. Relevant skill documentation
```

For database work, also read:

```text
docs/database/DATABASE_REQUIREMENTS.md
docs/database/ERD_OVERVIEW.md
docs/database/DATA_DICTIONARY.md
docs/database/DATA_QUALITY_RULES.md
```

For frontend work, also read:

```text
docs/frontend/UI_UX_PRINCIPLES.md
docs/frontend/ROUTES_STRUCTURE.md
docs/frontend/FORM_UX_RULES.md
```

For backend work, also read:

```text
docs/backend/API_DESIGN_GUIDELINES.md
docs/backend/API_ENDPOINTS.md
docs/backend/VALIDATION_RULES.md
```

For dashboard work, also read:

```text
docs/dashboard/DASHBOARD_REQUIREMENTS.md
docs/dashboard/DASHBOARD_METRICS_DICTIONARY.md
```

For privacy or security work, also read:

```text
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/CONSENT_MANAGEMENT.md
docs/security/ROLE_PERMISSION_MATRIX.md
```

---

## 4. Root-Level Documentation

## 4.1 README.md

### Purpose

High-level introduction to the project.

### Contains

- Project vision
- Core concept
- User groups
- Key data dimensions
- Main modules
- Recommended stack
- MVP summary
- Privacy principles
- Data quality principles
- Development philosophy

### When to Read

Always read first.

---

## 4.2 AGENTS.md

### Purpose

Main instruction file for AI coding agents.

### Contains

- Golden rules
- Architecture rules
- Database rules
- UX rules
- Security rules
- Testing rules
- Prohibited shortcuts
- Definition of done

### When to Read

Every time before using Codex or another AI coding agent.

---

## 4.3 PROJECT_OVERVIEW.md

### Purpose

Explains the project background and system concept.

### Contains

- Project summary
- Main problem
- Goals
- Target users
- Data flow
- Identity strategy
- Dashboard purpose
- Sustainable tourism planning focus

### When to Read

Before planning features or explaining the system to others.

---

## 4.4 PRODUCT_REQUIREMENTS.md

### Purpose

Defines product-level requirements.

### Contains

- Functional requirements
- Non-functional requirements
- Feature priorities
- Acceptance criteria
- MVP product boundaries

### When to Read

Before implementing any product feature.

---

## 4.5 MVP_SCOPE.md

### Purpose

Defines what is included and excluded from the MVP.

### Contains

- MVP objective
- MVP features
- MVP exclusions
- Acceptance checklist
- Demo script
- MVP risks

### When to Read

Before starting a development phase or deciding whether a feature belongs in MVP.

---

## 4.6 ROADMAP.md

### Purpose

Defines development sequence.

### Contains

- Development phases
- Milestones
- Recommended Codex task order
- Version roadmap
- Risk management

### When to Read

Before planning tasks or assigning work.

---

## 5. Core Documentation Folder

## 5.1 docs/00_INDEX.md

This file.

### Purpose

Documentation navigation and reading order.

---

## 5.2 docs/01_PROJECT_BACKGROUND.md

### Purpose

Academic and domain background of the project.

### Should Contain

- Problem statement
- Southern border tourism context
- Sustainable tourism context
- Need for local tourism data
- Importance of dashboard planning
- Relationship to official tourism data

### Status

Planned

---

## 5.3 docs/02_SYSTEM_OVERVIEW.md

### Purpose

Formal system overview.

### Should Contain

- System layers
- Main actors
- Main workflows
- Data lifecycle
- Module overview
- Integration overview
- Technical overview

### Status

Created or in progress

---

## 5.4 docs/03_STAKEHOLDERS.md

### Purpose

Identify all stakeholders and their interests.

### Should Contain

- Tourists
- Local tourism offices
- Provincial administrators
- University researchers
- Attraction staff
- System administrators
- Community enterprises
- Policy planners

### Status

Planned

---

## 5.5 docs/04_USER_ROLES.md

### Purpose

Define system roles and permissions.

### Should Contain

- Tourist
- Guest tourist
- Returning tourist
- Staff
- Admin
- Viewer
- Researcher
- Super admin

### Status

Planned

---

## 5.6 docs/05_USER_JOURNEY.md

### Purpose

Describe user journeys.

### Should Contain

- First-time tourist flow
- Returning tourist flow
- Foreign tourist flow
- Admin flow
- Researcher dashboard flow
- QR error flow
- Survey completion flow

### Status

Planned

---

## 5.7 docs/06_FEATURE_REQUIREMENTS.md

### Purpose

Detailed feature-level requirements.

### Should Contain

- Feature descriptions
- User stories
- Inputs
- Outputs
- Validations
- Acceptance criteria

### Status

Planned

---

## 5.8 docs/07_NON_FUNCTIONAL_REQUIREMENTS.md

### Purpose

Define quality requirements.

### Should Contain

- Performance
- Security
- Privacy
- Reliability
- Usability
- Accessibility
- Maintainability
- Scalability

### Status

Planned

---

## 5.9 docs/08_MVP_DEFINITION.md

### Purpose

More detailed MVP definition linked to implementation.

### Should Contain

- MVP user flows
- MVP screens
- MVP database tables
- MVP dashboard metrics
- MVP exclusions
- MVP acceptance tests

### Status

Planned

---

## 5.10 docs/09_PRODUCTION_READINESS.md

### Purpose

Checklist for production-level maturity.

### Should Contain

- Security hardening
- Performance readiness
- Monitoring
- Backups
- Error handling
- Data retention
- Access control
- Deployment readiness

### Status

Planned

---

## 5.11 docs/10_GLOSSARY.md

### Purpose

Define project terms.

### Should Contain

- Tourist
- Visit
- Check-in
- Digital stamp
- Digital passport
- Certificate
- Attraction
- Photo spot
- Funnel event
- Sustainable tourism indicator

### Status

Planned

---

## 6. Business Documentation

Folder:

```text
docs/business/
```

Purpose:

Explain tourism, planning, and data strategy.

Planned files:

```text
TOURISM_PROBLEM_ANALYSIS.md
SOUTHERN_BORDER_CONTEXT.md
SUSTAINABLE_TOURISM_INDICATORS.md
TOURIST_DATA_COLLECTION_STRATEGY.md
TOURIST_INCENTIVE_STRATEGY.md
DIGITAL_PASSPORT_STRATEGY.md
OFFICIAL_DATA_INTEGRATION_STRATEGY.md
```

Use these files when discussing domain logic, academic relevance, or planning strategy.

---

## 7. Architecture Documentation

Folder:

```text
docs/architecture/
```

Purpose:

Explain technical structure and major design decisions.

Planned files:

```text
ARCHITECTURE_OVERVIEW.md
SYSTEM_CONTEXT_DIAGRAM.md
MODULE_ARCHITECTURE.md
FRONTEND_ARCHITECTURE.md
BACKEND_ARCHITECTURE.md
DATABASE_ARCHITECTURE.md
STORAGE_ARCHITECTURE.md
AUTHENTICATION_ARCHITECTURE.md
DATA_FLOW.md
SEQUENCE_FLOWS.md
ADR_INDEX.md
```

Subfolder:

```text
docs/architecture/adr/
```

Purpose:

Record architecture decision records.

Planned ADR files:

```text
ADR_001_TECH_STACK.md
ADR_002_NEXTJS_PWA_AS_CORE.md
ADR_003_SUPABASE_POSTGRESQL.md
ADR_004_IDENTITY_STRATEGY.md
ADR_005_QR_SINGLE_ENTRY_FLOW.md
ADR_006_CERTIFICATE_AS_INCENTIVE.md
ADR_007_DASHBOARD_SUMMARY_TABLES.md
ADR_008_PRIVACY_BY_DESIGN.md
```

Use ADRs when a decision affects future implementation direction.

---

## 8. Database Documentation

Folder:

```text
docs/database/
```

Purpose:

Define the database model and data rules.

Planned files:

```text
DATABASE_REQUIREMENTS.md
ERD_OVERVIEW.md
TABLE_GROUPS.md
DATA_DICTIONARY.md
RELATIONSHIPS.md
INDEXING_STRATEGY.md
DATA_QUALITY_RULES.md
DATA_RETENTION_POLICY.md
MIGRATION_GUIDE.md
SEED_DATA_GUIDE.md
ANALYTICS_TABLES.md
```

Database documentation is critical because this project is fundamentally a database project.

Any schema change must update database documentation.

---

## 9. Module Documentation

Folder:

```text
docs/modules/
```

Purpose:

Define each major system module.

Planned files:

```text
MODULE_01_PUBLIC_ATTRACTIONS.md
MODULE_02_QR_CHECKIN.md
MODULE_03_TOURIST_PROFILE.md
MODULE_04_VISIT_RECORD.md
MODULE_05_PHOTO_UPLOAD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_07_DIGITAL_STAMP_PASSPORT.md
MODULE_08_SURVEY_EXPENSE_SATISFACTION.md
MODULE_09_ADMIN_ATTRACTION_CMS.md
MODULE_10_DASHBOARD_ANALYTICS.md
MODULE_11_REPORT_EXPORT.md
MODULE_12_LINE_LIFF_OPTIONAL.md
MODULE_13_OFFICIAL_DATA_IMPORT.md
```

Each module document should include:

- Purpose
- User stories
- Required data
- Main flows
- API needs
- UI needs
- Validation rules
- Acceptance criteria
- Edge cases

---

## 10. Frontend Documentation

Folder:

```text
docs/frontend/
```

Purpose:

Define UX, UI, routes, and frontend implementation rules.

Planned files:

```text
FRONTEND_REQUIREMENTS.md
UI_UX_PRINCIPLES.md
DESIGN_SYSTEM.md
ROUTES_STRUCTURE.md
TOURIST_SIDE_PAGES.md
ADMIN_SIDE_PAGES.md
FORM_UX_RULES.md
PWA_REQUIREMENTS.md
RESPONSIVE_GUIDELINES.md
ACCESSIBILITY_GUIDELINES.md
```

Use these files when implementing tourist-facing or admin-facing screens.

---

## 11. Backend Documentation

Folder:

```text
docs/backend/
```

Purpose:

Define API, validation, services, and backend behavior.

Planned files:

```text
BACKEND_REQUIREMENTS.md
API_DESIGN_GUIDELINES.md
API_ENDPOINTS.md
VALIDATION_RULES.md
ERROR_HANDLING.md
FILE_UPLOAD_FLOW.md
CERTIFICATE_RENDERING_FLOW.md
AUTHORIZATION_RULES.md
BACKGROUND_JOBS.md
```

Use these files when implementing server actions, API routes, services, or backend modules.

---

## 12. Dashboard Documentation

Folder:

```text
docs/dashboard/
```

Purpose:

Define dashboard requirements and metric calculations.

Planned files:

```text
DASHBOARD_REQUIREMENTS.md
EXECUTIVE_DASHBOARD.md
TOURIST_PROFILE_DASHBOARD.md
TRAVEL_BEHAVIOR_DASHBOARD.md
EXPENSE_DASHBOARD.md
SATISFACTION_DASHBOARD.md
SUSTAINABLE_TOURISM_DASHBOARD.md
FUNNEL_ANALYTICS_DASHBOARD.md
DASHBOARD_METRICS_DICTIONARY.md
```

Every dashboard metric should include:

- Metric name
- Definition
- Data source
- Calculation
- Filters
- Interpretation
- Planning value

---

## 13. Security Documentation

Folder:

```text
docs/security/
```

Purpose:

Define privacy, consent, roles, permissions, and security controls.

Planned files:

```text
SECURITY_REQUIREMENTS.md
PDPA_PRIVACY_DESIGN.md
CONSENT_MANAGEMENT.md
ROLE_PERMISSION_MATRIX.md
ROW_LEVEL_SECURITY.md
AUDIT_LOGGING.md
DATA_ANONYMIZATION.md
IMAGE_UPLOAD_SECURITY.md
```

Use these files when changing identity, authentication, authorization, upload, export, or personal data handling.

---

## 14. Testing Documentation

Folder:

```text
docs/testing/
```

Purpose:

Define test plans and acceptance criteria.

Planned files:

```text
TESTING_STRATEGY.md
UNIT_TEST_PLAN.md
INTEGRATION_TEST_PLAN.md
E2E_TEST_PLAN.md
UX_TEST_PLAN.md
PERFORMANCE_TEST_PLAN.md
SECURITY_TEST_PLAN.md
ACCEPTANCE_CRITERIA.md
```

Testing documents should be updated before major releases.

---

## 15. Academic Report Documentation

Folder:

```text
docs/reports/
```

Purpose:

Support university report writing.

Planned files:

```text
ACADEMIC_REPORT_STRUCTURE.md
CHAPTER_1_INTRODUCTION.md
CHAPTER_2_THEORY_RELATED_WORK.md
CHAPTER_3_SYSTEM_ANALYSIS_DESIGN.md
CHAPTER_4_IMPLEMENTATION.md
CHAPTER_5_CONCLUSION.md
DATA_DICTIONARY_REPORT.md
ERD_REPORT.md
USE_CASE_REPORT.md
DASHBOARD_REPORT.md
```

These files should help convert the system into a complete academic project report.

---

## 16. Prompts Folder

Folder:

```text
prompts/
```

Purpose:

Reusable prompts for Codex and development workflows.

Planned files:

```text
CODEX_MAIN_PROMPT.md
CODEX_TASK_TEMPLATE.md
CODEX_REVIEW_PROMPT.md
CODEX_REFACTOR_PROMPT.md
CODEX_DEBUG_PROMPT.md
CODEX_DATABASE_PROMPT.md
CODEX_FRONTEND_PROMPT.md
CODEX_BACKEND_PROMPT.md
CODEX_DASHBOARD_PROMPT.md
CODEX_TESTING_PROMPT.md
```

Use these files to keep AI-assisted development consistent.

---

## 17. Tasks Folder

Folder:

```text
tasks/
```

Purpose:

Break implementation into manageable phases.

Planned files:

```text
TASK_INDEX.md
PHASE_01_PROJECT_SETUP.md
PHASE_02_DATABASE_SCHEMA.md
PHASE_03_AUTH_IDENTITY.md
PHASE_04_PUBLIC_ATTRACTION_PAGES.md
PHASE_05_QR_CHECKIN_FLOW.md
PHASE_06_CERTIFICATE_GENERATION.md
PHASE_07_SURVEY_EXPENSE_SATISFACTION.md
PHASE_08_ADMIN_BACKOFFICE.md
PHASE_09_DASHBOARD.md
PHASE_10_REPORT_EXPORT.md
PHASE_11_LINE_LIFF_OPTIONAL.md
PHASE_12_TESTING_HARDENING.md
PHASE_13_DEPLOYMENT.md
```

Each phase file should include:

- Objective
- Context
- Files to read
- Tasks
- Acceptance criteria
- Do not do list
- Testing notes

---

## 18. Checklists Folder

Folder:

```text
checklists/
```

Purpose:

Quality gates before release.

Planned files:

```text
PROJECT_SETUP_CHECKLIST.md
DATABASE_CHECKLIST.md
FRONTEND_CHECKLIST.md
BACKEND_CHECKLIST.md
UI_UX_CHECKLIST.md
DASHBOARD_CHECKLIST.md
SECURITY_PDPA_CHECKLIST.md
PERFORMANCE_CHECKLIST.md
TESTING_CHECKLIST.md
PRODUCTION_RELEASE_CHECKLIST.md
```

Use checklists at the end of each phase.

---

## 19. Codex Skills Folder

Folder:

```text
.codex/skills/
```

Purpose:

Specialized instructions for Codex by task type.

Planned skill folders:

```text
project-planning/
database-design/
supabase-postgresql/
frontend-nextjs-pwa/
ux-ui-design/
backend-api/
certificate-rendering/
digital-passport-stamp/
dashboard-analytics/
line-liff-integration/
pdpa-security/
testing-qa/
performance-optimization/
documentation-report/
deployment-release/
```

Each folder should contain:

```text
SKILL.md
```

Optional future contents:

```text
scripts/
references/
assets/
```

---

## 20. Documentation Update Rules

Update documentation when:

- Database schema changes
- API endpoints change
- User flow changes
- Dashboard metric changes
- Security rules change
- Role permissions change
- File upload behavior changes
- Certificate generation changes
- Deployment environment changes

Do not let documentation become outdated.

---

## 21. Suggested Next Documentation Order

After this file, create:

```text
docs/02_SYSTEM_OVERVIEW.md
docs/database/DATABASE_REQUIREMENTS.md
docs/database/ERD_OVERVIEW.md
docs/database/DATA_DICTIONARY.md
docs/modules/MODULE_01_PUBLIC_ATTRACTIONS.md
docs/modules/MODULE_02_QR_CHECKIN.md
tasks/TASK_INDEX.md
.codex/skills/project-planning/SKILL.md
```

---

## 22. Final Note

The documentation is part of the product.

A well-documented system helps:

- Codex produce better code
- Developers avoid wrong assumptions
- Reviewers understand project quality
- Academic evaluators see professional planning
- Future maintainers continue the project safely
