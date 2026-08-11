# FRONTEND_ARCHITECTURE.md

## 1. Purpose

This document describes the frontend architecture including routing, component structure, state management, and rendering strategies.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14+ (App Router) | SSR, routing, server actions |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Accessible, customizable components |
| Forms | React Hook Form + Zod | Form handling + validation |
| Charts | ECharts or ApexCharts | Dashboard visualizations |
| Maps | Leaflet + React Leaflet | Attraction location maps |
| State | React Context + TanStack Query | Client state + server state |
| Icons | Lucide React | Consistent iconography |

---

## 3. Route Structure

### 3.1 Public Routes (Tourist-facing)

```text
/                               → Home / Attraction listing
/attractions                    → Attraction listing with filters
/attractions/[slug]             → Attraction detail page
/c/[checkinCode]                → QR check-in landing
/c/[checkinCode]/create         → Certificate creation flow
/c/[checkinCode]/certificate    → Certificate preview + download
/c/[checkinCode]/survey         → Optional survey
/passport                      → Digital passport (stamp collection)
/passport/certificates          → Certificate gallery
```

### 3.2 Admin Routes

```text
/admin                          → Admin dashboard overview
/admin/login                    → Admin authentication
/admin/attractions              → Attraction list + management
/admin/attractions/[id]         → Attraction detail/edit
/admin/attractions/new          → Create attraction
/admin/photo-spots              → Photo spot management
/admin/visits                   → Visit record list
/admin/visits/[id]              → Visit detail
/admin/tourists                 → Tourist record list
/admin/certificates             → Certificate management
/admin/templates                → Certificate template management
/admin/dashboard                → Full analytics dashboard
/admin/dashboard/tourist        → Tourist profile analytics
/admin/dashboard/behavior       → Travel behavior analytics
/admin/dashboard/expense        → Expense analytics
/admin/dashboard/satisfaction   → Satisfaction analytics
/admin/dashboard/sustainable    → Sustainable tourism indicators
/admin/dashboard/funnel         → Funnel analytics
/admin/exports                  → Data export
/admin/settings                 → System settings
/admin/audit                    → Audit logs
/admin/users                    → User management (super admin)
```

---

## 4. Component Architecture

### 4.1 Component Categories

```text
src/
├── app/                        → Next.js App Router pages
│   ├── (public)/               → Public route group
│   ├── (admin)/admin/          → Admin route group
│   └── api/                    → API route handlers
├── components/
│   ├── ui/                     → shadcn/ui base components
│   ├── common/                 → Shared components (header, footer, loading)
│   ├── checkin/                → QR check-in and certificate-entry components
│   │   ├── CheckinLanding.tsx
│   │   ├── CheckinProgress.tsx
│   │   ├── PhotoUploadClient.tsx
│   │   ├── MinimalForm.tsx
│   ├── tourist/                → Tourist account and public journey components
│   │   ├── CertificatePreview.tsx
│   │   ├── SurveyForm.tsx
│   │   └── PassportView.tsx
│   ├── admin/                  → Admin-facing components
│   │   ├── AttractionForm.tsx
│   │   ├── VisitTable.tsx
│   │   ├── DataExport.tsx
│   │   └── AuditLogTable.tsx
│   └── dashboard/              → Dashboard chart components
│       ├── KPICard.tsx
│       ├── ProvinceChart.tsx
│       ├── SatisfactionChart.tsx
│       └── FunnelChart.tsx
├── lib/                        → Utilities and configs
│   ├── supabase/               → Supabase client setup
│   ├── validators/             → Zod schemas
│   ├── utils/                  → Helper functions
│   └── constants/              → App constants
├── services/                   → Business logic (server-side)
├── types/                      → TypeScript type definitions
└── i18n/                       → Internationalization strings
```

### 4.2 Component Design Principles

1. **Server-first:** Use React Server Components by default
2. **Client when needed:** Add `'use client'` only for interactivity
3. **Composition:** Small, focused components composed together
4. **Type-safe:** All props typed with TypeScript interfaces
5. **Accessible:** ARIA attributes, keyboard navigation, focus management

---

## 5. Rendering Strategy

| Page Type | Rendering | Reason |
|---|---|---|
| Attraction listing | SSR + ISR | SEO + fresh data with revalidation |
| Attraction detail | SSR + ISR | SEO + dynamic content |
| QR check-in landing | SSR | Must resolve code server-side |
| Certificate creation | Client-side | Interactive multi-step flow |
| Certificate preview | SSR | Generate image server-side |
| Passport | Client-side | Device-specific data |
| Admin pages | SSR | Auth check server-side |
| Dashboard | SSR + client hydration | Charts need client-side rendering |

---

## 6. State Management

### 6.1 Server State

- **TanStack Query** for data fetching and caching
- Server Components fetch directly in component body
- Revalidation via `revalidatePath` or `revalidateTag`

### 6.2 Client State

- **React Context** for global UI state (language, theme)
- **React Hook Form** for form state
- **localStorage** for guest token and passport cache
- Component-level `useState` for local UI state

### 6.3 No Global Store

The architecture avoids global state managers (Redux, Zustand) in favor of:
- Server Components for server data
- TanStack Query for cached server data
- React Context for shared UI state

---

## 7. Mobile-First Design

### 7.1 Breakpoints

```text
sm:  640px   → Small tablets
md:  768px   → Tablets
lg:  1024px  → Small laptops
xl:  1280px  → Desktops
2xl: 1536px  → Large screens
```

### 7.2 Tourist Pages

- Designed for 360px width minimum
- Single-column layout on mobile
- Touch-friendly controls (min 44px targets)
- Bottom-anchored CTAs
- Minimal scrolling per step

### 7.3 Admin Pages

- Sidebar navigation on desktop
- Bottom tab navigation on mobile
- Responsive data tables
- Collapsible filters

---

## 8. Performance Budget

| Metric | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3.5s |
| Total bundle size (initial) | < 200KB gzipped |
| Image loading | Lazy load below fold |
| Route transitions | < 300ms |
