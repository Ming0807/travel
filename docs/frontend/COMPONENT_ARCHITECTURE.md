# COMPONENT_ARCHITECTURE.md

## 1. Document Purpose

This document defines the frontend component architecture for the **Southern Border Tourism Data & Intelligence Platform**.

The goal is to prevent messy UI code and make the frontend maintainable, scalable, testable, and production-ready.

This document should guide developers and AI coding agents when creating React/Next.js components.

---

## 2. Component Architecture Mission

The frontend must support multiple product areas:

```text
Public tourism website
Tourist QR/PWA flow
Certificate and passport experience
Admin CMS
Dashboard analytics
Report/export
```

The component architecture must make these areas consistent while keeping concerns separated.

---

## 3. Core Principles

## 3.1 Separate Page, Feature, and Shared Components

Do not put all UI logic inside page files.

Recommended separation:

```text
Page components = route-level composition
Feature components = business-specific UI
Shared components = reusable UI primitives and patterns
Service layer = data and business operations
```

---

## 3.2 Keep Components Small and Purposeful

A component should have one clear responsibility.

Good:

```text
AttractionCard
PhotoUploadCard
CertificatePreview
DashboardKpiCard
```

Bad:

```text
BigPageThatDoesEverything
```

---

## 3.3 Avoid Business Logic in UI Components

UI components should not contain complex database or analytics logic.

Good:

```text
component receives props
service fetches data
server action handles mutation
```

Bad:

```text
dashboard component contains long SQL query and rendering logic together
```

---

## 3.4 Reuse Patterns, Not Random Styles

Use shared components for common patterns.

Examples:

```text
Button
Card
StatusBadge
DataTable
FilterBar
EmptyState
LoadingState
ErrorState
```

Do not duplicate similar UI blocks with slightly different styling.

---

## 4. Recommended Folder Structure

If using Next.js App Router:

```text
src/
  app/
    (public)/
    (tourist)/
    (admin)/
    api/

  components/
    ui/
    layout/
    public/
    tourist/
    admin/
    dashboard/
    certificate/
    passport/
    survey/
    shared/

  features/
    attractions/
    checkin/
    tourists/
    visits/
    photos/
    certificates/
    stamps/
    surveys/
    dashboard/
    admin/
    exports/

  lib/
    supabase/
    auth/
    validation/
    utils/
    constants/
    i18n/

  services/
    attraction-service.ts
    checkin-service.ts
    tourist-service.ts
    visit-service.ts
    photo-service.ts
    certificate-service.ts
    stamp-service.ts
    survey-service.ts
    dashboard-service.ts
    export-service.ts

  types/
    database.ts
    attraction.ts
    tourist.ts
    visit.ts
    dashboard.ts

  hooks/
    use-language.ts
    use-guest-identity.ts
    use-visit-flow.ts
    use-dashboard-filters.ts
```

Exact paths may vary, but separation of responsibility must remain.

---

## 5. Component Layer Definitions

## 5.1 UI Primitives

Location:

```text
components/ui/
```

Purpose:

Reusable low-level components.

Examples:

```text
Button
Input
Textarea
Select
Checkbox
RadioGroup
Dialog
Card
Badge
Tabs
Toast
Skeleton
```

Rules:

- no business-specific data fetching
- no attraction/tourist-specific logic
- accessible by default
- styled consistently
- reusable across app

---

## 5.2 Layout Components

Location:

```text
components/layout/
```

Examples:

```text
PublicLayout
TouristFlowLayout
AdminLayout
DashboardLayout
PublicHeader
AdminSidebar
AdminTopbar
Footer
MobileSafeArea
```

Rules:

- layout components control structure
- avoid business mutations
- provide consistent navigation and spacing

---

## 5.3 Public Components

Location:

```text
components/public/
```

Examples:

```text
AttractionCard
AttractionHero
AttractionGallery
AttractionFilterBar
AttractionMapSection
ProvinceSection
PublicCtaSection
```

Purpose:

Public-facing attraction and tourism website.

---

## 5.4 Tourist Flow Components

Location:

```text
components/tourist/
```

Examples:

```text
QrLandingCard
StepProgress
TouristProfileMiniForm
OriginSelector
AgeGroupSelector
VisitDateField
ConsentBox
FlowActionBar
```

Purpose:

QR/PWA flow and tourist participation.

---

## 5.5 Photo Components

Location:

```text
components/tourist/photo/
```

or:

```text
components/photo/
```

Examples:

```text
PhotoUploadCard
PhotoPreview
UploadProgress
PhotoGuidelines
```

---

## 5.6 Certificate Components

Location:

```text
components/certificate/
```

Examples:

```text
CertificatePreview
CertificateCanvas
CertificateDownloadPanel
CertificateSuccessCard
CertificateTemplateFrame
```

Rules:

- certificate visual component should be exportable to image
- avoid direct database calls inside visual certificate component
- receive render data as props

---

## 5.7 Passport Components

Location:

```text
components/passport/
```

Examples:

```text
PassportHeader
StampCard
StampGrid
PassportProgress
SavePassportPrompt
GuestPassportWarning
```

---

## 5.8 Survey Components

Location:

```text
components/survey/
```

Examples:

```text
SurveyIntro
SurveyStepCard
TravelBehaviorStep
ExpenseStep
SatisfactionStep
RatingInput
ChipChoiceGroup
SurveyCompleteCard
```

---

## 5.9 Admin Components

Location:

```text
components/admin/
```

Examples:

```text
AdminPageHeader
AdminSection
AdminDataTable
AdminFilterBar
AdminStatusBadge
AdminActionMenu
ConfirmDeactivateDialog
AuditInfoPanel
```

---

## 5.10 Dashboard Components

Location:

```text
components/dashboard/
```

Examples:

```text
KpiCard
ChartCard
MetricTooltip
DashboardFilterBar
VisitsByProvinceChart
TopAttractionsTable
FunnelChart
SatisfactionSummaryCard
ExpenseDistributionChart
DataFreshnessNote
```

Rules:

- chart components receive already-prepared data
- metric definitions should be referenced
- do not fetch huge data inside chart components

---

## 6. Feature Layer

Location:

```text
features/
```

Feature folders group business-specific UI, validation, actions, and types.

Example:

```text
features/attractions/
  components/
  actions/
  schemas/
  queries/
  types.ts
  constants.ts
```

Recommended feature folders:

```text
attractions
checkin
tourists
visits
photos
certificates
stamps
surveys
dashboard
admin
exports
official-data
```

---

## 7. Service Layer

Location:

```text
services/
```

Purpose:

Keep business/data operations outside UI components.

Examples:

```text
resolveCheckinCode(code)
createTouristProfile(input)
createVisit(input)
uploadVisitPhoto(input)
generateCertificate(input)
awardStampForVisit(visitId)
submitSurvey(input)
getExecutiveDashboardMetrics(filters)
exportVisits(filters)
```

Rules:

- services may call database client or server actions
- services validate business assumptions
- services should be testable
- services should not render UI

---

## 8. Validation Layer

Location:

```text
lib/validation/
```

or feature-specific:

```text
features/tourists/schemas/profile-schema.ts
```

Recommended:

```text
Zod schemas
```

Validation examples:

```text
touristProfileSchema
visitCreateSchema
photoUploadSchema
surveySubmitSchema
attractionFormSchema
checkinCodeSchema
dashboardFilterSchema
exportFilterSchema
```

Rules:

- validate client-side for UX
- validate server-side for security
- share schemas where practical
- do not trust frontend validation only

---

## 9. Type Layer

Location:

```text
types/
```

Recommended types:

```text
Database generated types
Attraction
TouristProfile
Visit
VisitPhoto
Certificate
Stamp
SurveyResponse
DashboardFilters
DashboardMetric
ExportType
```

If using Supabase, generate database types from schema.

Do not manually drift far from database schema.

---

## 10. Constants Layer

Location:

```text
lib/constants/
```

Examples:

```text
AGE_GROUPS
SPENDING_RANGES
OVERNIGHT_STATUS_OPTIONS
SUPPORTED_LANGUAGES
FUNNEL_EVENT_NAMES
COMPLETION_STATUSES
PHOTO_ALLOWED_MIME_TYPES
MAX_PHOTO_SIZE_BYTES
```

Rules:

- constants should match backend/database constraints
- avoid magic strings scattered across UI
- update constants when migration changes allowed values

---

## 11. Public Website Component Architecture

## 11.1 Attraction List Page

Composition:

```text
AttractionListPage
  PublicPageHeader
  AttractionFilterBar
  AttractionCardGrid
    AttractionCard
  Pagination or LoadMore
  EmptyState
```

Data source:

```text
attraction-service.getPublishedAttractions(filters)
```

## 11.2 Attraction Detail Page

Composition:

```text
AttractionDetailPage
  AttractionHero
  AttractionGallery
  AttractionInfoSection
  AttractionHistorySection
  AttractionMapSection
  Attraction360Section
  PhotoSpotSection
  CertificateCtaSection
```

Data source:

```text
attraction-service.getPublishedAttractionBySlug(slug)
```

---

## 12. Tourist Flow Component Architecture

## 12.1 QR Landing

Composition:

```text
CheckinPage
  QrLandingCard
  AttractionSummaryCard
  BenefitList
  FlowActionBar
  LanguageSwitcher
  ErrorState
```

Service:

```text
checkin-service.resolveCheckinCode(code)
checkin-service.recordFunnelEvent(...)
```

## 12.2 Profile Step

Composition:

```text
TouristProfilePage
  StepProgress
  ReturningProfileCard
  TouristProfileMiniForm
    DisplayNameField
    OriginSelector
    AgeGroupSelector
    VisitDateField
    ConsentBox
  FlowActionBar
```

Service:

```text
tourist-service.findOrCreateTourist(...)
visit-service.createVisit(...)
```

## 12.3 Photo Step

Composition:

```text
PhotoUploadPage
  StepProgress
  PhotoUploadCard
  PhotoPreview
  UploadProgress
  FlowActionBar
```

Service:

```text
photo-service.uploadVisitPhoto(...)
```

## 12.4 Certificate Step

Composition:

```text
CertificatePage
  StepProgress
  CertificatePreview
  CertificateDownloadPanel
```

Service:

```text
certificate-service.generateCertificate(...)
stamp-service.awardStampForVisit(...)
```

## 12.5 Success Step

Composition:

```text
VisitSuccessPage
  CertificateSuccessCard
  StampEarnedCard
  SavePassportPrompt
  SurveyCtaCard
```

---

## 13. Admin Component Architecture

## 13.1 Attraction List

Composition:

```text
AdminAttractionsPage
  AdminPageHeader
  AdminFilterBar
  AdminDataTable
    StatusBadge
    AdminActionMenu
  Pagination
```

Service:

```text
attraction-service.listAdminAttractions(filters)
```

## 13.2 Attraction Form

Composition:

```text
AttractionFormPage
  AdminPageHeader
  AttractionForm
    BasicInfoSection
    LocationSection
    ContentSection
    PublishingSection
  SaveActionBar
```

Validation:

```text
attractionFormSchema
```

## 13.3 Check-in Code Management

Composition:

```text
CheckinCodesPage
  AdminPageHeader
  AdminFilterBar
  AdminDataTable
  CheckinCodeFormDialog
  QrPreviewDialog
```

---

## 14. Dashboard Component Architecture

Dashboard components should separate:

```text
data fetching
data transformation
visual rendering
metric explanation
```

Recommended:

```text
DashboardPage
  DashboardFilterBar
  ExecutiveKpiGrid
    KpiCard
  ChartGrid
    ChartCard
  InsightTables
  DataFreshnessNote
```

Service:

```text
dashboard-service.getExecutiveMetrics(filters)
dashboard-service.getFunnelMetrics(filters)
```

Chart components should receive data like:

```ts
type ChartPoint = {
  label: string;
  value: number;
};
```

Do not make chart components responsible for SQL joins.

---

## 15. Component Props Guidelines

## 15.1 Prefer Explicit Props

Good:

```ts
<AttractionCard
  name={attraction.name}
  provinceName={attraction.provinceName}
  imageUrl={attraction.coverImageUrl}
/>
```

Avoid passing huge untyped objects if only a few fields are needed.

## 15.2 Use Typed Props

Every component should have typed props.

Example:

```ts
type AttractionCardProps = {
  name: string;
  provinceName: string;
  imageUrl?: string;
  href: string;
};
```

## 15.3 Avoid Prop Drilling

If many deeply nested components need the same flow context, use a small context provider or dedicated hook.

Do not create huge global context for everything.

---

## 16. Server and Client Component Rules

If using Next.js App Router:

## 16.1 Server Components

Use for:

```text
public attraction page data fetching
admin initial list data
dashboard initial data
static content
SEO metadata
```

## 16.2 Client Components

Use for:

```text
forms
file upload
certificate image export
interactive filters
modals
charts if library requires client
language switcher
local storage guest token
```

## 16.3 Rule

Make components server by default unless interactivity requires client.

Do not add `"use client"` to large page trees unnecessarily.

---

## 17. Error Boundary Strategy

Use error boundaries for:

```text
tourist flow
admin pages
dashboard
certificate generation
```

Component-level error states should be used for recoverable errors.

Do not crash full app for one chart failure.

---

## 18. Loading and Suspense Strategy

Use loading components for:

```text
route-level loading
dashboard cards
admin tables
photo upload
certificate generation
export generation
```

Examples:

```text
AttractionCardSkeleton
DashboardKpiSkeleton
AdminTableSkeleton
CertificateGeneratingState
```

---

## 19. Empty State Components

Shared `EmptyState` should support:

```text
icon
title
description
action
```

Examples:

```text
No attractions found
No visits in selected date range
No stamps collected yet
No survey responses yet
```

---

## 20. Status Badge System

Use one `StatusBadge` component with variants.

Examples:

```text
published
draft
active
inactive
pending
approved
rejected
generated
completed
warning
```

Do not create random badge styles per page.

---

## 21. Form Component Patterns

Recommended pattern:

```text
schema validation
controlled or form-library state
field-level error
server-side validation
submit loading state
toast success/error
```

For complex admin forms, use section components.

For tourist forms, use step-focused components.

---

## 22. Data Table Component Pattern

DataTable should support:

```text
columns
rows
loading state
empty state
pagination
row actions
status badges
responsive behavior
```

For mobile admin table, use horizontal scroll or card list fallback.

---

## 23. Chart Component Pattern

ChartCard should include:

```text
title
description
metric definition tooltip
chart
loading state
empty state
error state
```

Do not render charts with undefined or misleading data.

---

## 24. Naming Conventions

## 24.1 Component Names

Use PascalCase.

Examples:

```text
AttractionCard
TouristProfileMiniForm
CertificatePreview
DashboardFilterBar
AdminDataTable
```

## 24.2 Hook Names

Use camelCase and `use` prefix.

Examples:

```text
useGuestIdentity
useVisitFlow
useDashboardFilters
useUploadPhoto
```

## 24.3 Service Names

Use clear domain names.

Examples:

```text
attractionService
visitService
certificateService
dashboardService
```

---

## 25. Import Rules

Prefer absolute imports if configured.

Example:

```ts
import { Button } from "@/components/ui/button";
import { getPublishedAttractions } from "@/services/attraction-service";
```

Avoid long relative imports:

```ts
../../../../components/ui/button
```

---

## 26. Testing Component Architecture

Component tests should cover:

```text
render with data
loading state
empty state
error state
form validation
button click
accessibility basics
```

Critical flow tests:

```text
QR landing
tourist profile form
photo upload
certificate preview
passport stamp card
survey submit
admin attraction form
dashboard filter
```

---

## 27. Anti-Patterns

Do not:

```text
Put all code in page.tsx.
Duplicate button/card styles everywhere.
Put SQL queries inside chart components.
Use untyped props.
Create one global context for all app state.
Make all components client components.
Hardcode attraction data.
Mix admin and tourist layout components.
Ignore loading/empty/error states.
```

---

## 28. Component Review Checklist

Before accepting a component:

```text
[ ] Component has a clear responsibility.
[ ] Props are typed.
[ ] Styling uses design system.
[ ] Loading/empty/error states are considered.
[ ] Accessibility basics are met.
[ ] Business logic is not mixed unnecessarily.
[ ] Component is reusable if pattern repeats.
[ ] No private data is exposed.
[ ] No hardcoded production data.
```

---

## 29. Final Component Rule

A good component architecture makes the app easy to change.

If changing one feature requires editing many unrelated pages, the architecture is too tightly coupled.
