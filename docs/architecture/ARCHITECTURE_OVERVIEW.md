# ARCHITECTURE_OVERVIEW.md

## 1. Purpose

This document provides a comprehensive overview of the system architecture for the Southern Border Tourism Data & Intelligence Platform.

---

## 2. Architecture Style

The system follows a **modular monolith** architecture using Next.js as the primary framework, with Supabase providing backend services.

```text
┌──────────────────────────────────────────────────────┐
│                    Presentation Layer                  │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────┐ │
│  │  Public PWA  │ │ Admin CMS    │ │  Dashboard    │ │
│  │  (Tourist)   │ │ (Staff/Admin)│ │  (Planner)    │ │
│  └──────┬──────┘ └──────┬───────┘ └───────┬───────┘ │
├─────────┼───────────────┼─────────────────┼──────────┤
│                    Application Layer                   │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────┐ │
│  │ Server       │ │ API Routes   │ │ Server        │ │
│  │ Components   │ │ /api/*       │ │ Actions       │ │
│  └──────┬──────┘ └──────┬───────┘ └───────┬───────┘ │
├─────────┼───────────────┼─────────────────┼──────────┤
│                    Service Layer                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐  │
│  │Tourist │ │Visit   │ │Cert    │ │Dashboard     │  │
│  │Service │ │Service │ │Service │ │Service       │  │
│  └────┬───┘ └────┬───┘ └────┬───┘ └──────┬───────┘  │
├───────┼──────────┼──────────┼────────────┼───────────┤
│                    Data Layer                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │              Supabase PostgreSQL                  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │ │
│  │  │  Tables   │ │  RLS     │ │  Functions/Views │ │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │ │
│  ├──────────────────────────────────────────────────┤ │
│  │              Supabase Storage                     │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │ │
│  │  │  Photos   │ │  Certs   │ │  Templates       │ │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │ │
│  ├──────────────────────────────────────────────────┤ │
│  │              Supabase Auth                        │ │
│  │  ┌──────────┐ ┌──────────┐                       │ │
│  │  │  Admin    │ │  JWT     │                       │ │
│  │  └──────────┘ └──────────┘                       │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## 3. Layer Responsibilities

### 3.1 Presentation Layer

| Component | Technology | Users | Responsibility |
|---|---|---|---|
| Public PWA | Next.js App Router + React | Tourists | Attraction pages, QR check-in, certificate flow |
| Admin CMS | Next.js App Router + React | Staff, Admin | Attraction management, visit records, data export |
| Dashboard | Next.js + ECharts/ApexCharts | Planners, Researchers | Analytics, metrics, reports |

### 3.2 Application Layer

| Component | Technology | Responsibility |
|---|---|---|
| Server Components | React Server Components | Data fetching, SSR rendering |
| API Routes | Next.js Route Handlers | REST endpoints for external/async operations |
| Server Actions | Next.js Server Actions | Form submissions, mutations from UI |

### 3.3 Service Layer

Business logic is organized into service modules:

| Service | Responsibility |
|---|---|
| TouristService | Profile CRUD, identity management, duplicate detection |
| VisitService | Visit creation, photo linking, completion tracking |
| CertificateService | Template rendering, file generation, storage |
| StampService | Stamp assignment, uniqueness check, passport data |
| SurveyService | Survey submission, expense recording, satisfaction |
| DashboardService | Metric calculation, aggregation, caching |
| ExportService | CSV generation, data scoping, audit logging |
| AuthService | Admin auth, role verification, permission check |
| FunnelService | Event tracking, conversion calculation |

### 3.4 Data Layer

| Component | Technology | Responsibility |
|---|---|---|
| PostgreSQL | Supabase-managed | Relational data storage, queries, views |
| RLS | Supabase RLS | Row-level access control for client queries |
| Storage | Supabase Storage | File storage for photos, certificates, templates |
| Auth | Supabase Auth | Admin authentication, JWT sessions |

---

## 4. Key Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js App Router | SSR + API routes + server actions in one framework |
| Database | Supabase PostgreSQL | Managed PostgreSQL with auth, storage, real-time |
| Styling | Tailwind CSS | Rapid UI development, mobile-first |
| UI Components | shadcn/ui | Accessible, customizable, TypeScript-first |
| Language | TypeScript | Type safety, better DX, fewer runtime errors |
| Validation | Zod | Schema-based validation shared between client/server |
| Charts | ECharts or ApexCharts | Rich charting for dashboards |
| Maps | Leaflet | Lightweight map component for attraction locations |

See `docs/architecture/adr/` for detailed Architecture Decision Records.

---

## 5. Module Boundaries

The system is divided into 13 functional modules:

```text
Module 01: Public Attractions          → Presentation + Data
Module 02: QR Check-in                 → Presentation + Service + Data
Module 03: Tourist Profile             → Service + Data
Module 04: Visit Record                → Service + Data
Module 05: Photo Upload                → Service + Storage + Data
Module 06: Certificate Generation      → Service + Storage + Data
Module 07: Digital Stamp & Passport    → Service + Data
Module 08: Survey/Expense/Satisfaction → Service + Data
Module 09: Admin CMS                   → Presentation + Service + Data
Module 10: Dashboard Analytics         → Presentation + Service + Data
Module 11: Report Export               → Service + Data
Module 12: LINE LIFF (Optional)        → Presentation + Service
Module 13: Official Data Import        → Service + Data
```

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization
- Tourist: Guest token (browser localStorage) → no Supabase Auth
- Admin: Supabase Auth (email/password) → JWT → role-based middleware

### 6.2 Error Handling
- Client: React error boundaries + toast notifications
- Server: Try/catch in server actions → structured error responses
- API: Consistent `{ success, data, error }` response format

### 6.3 Validation
- Client-side: Zod schemas + React Hook Form
- Server-side: Same Zod schemas revalidated before database operations

### 6.4 Logging & Audit
- Admin actions → `audit_logs` table
- Tourist funnel → `funnel_events` table
- System errors → server-side logging

### 6.5 Internationalization
- String externalization for Thai/English
- Browser language detection
- Content stored with language variants where needed

---

## 7. Deployment Architecture

```text
┌─────────────┐     ┌──────────────────┐
│   Vercel     │────▶│  Supabase Cloud  │
│  (Next.js)   │     │  ┌────────────┐  │
│              │     │  │ PostgreSQL  │  │
│  SSR/SSG     │     │  │ Auth       │  │
│  API Routes  │     │  │ Storage    │  │
│  Edge Funcs  │     │  │ Realtime   │  │
└──────┬──────┘     │  └────────────┘  │
       │             └──────────────────┘
       │
┌──────▼──────┐
│   Tourist    │
│   Browser    │
│   (PWA)      │
└─────────────┘
```

---

## 8. Scalability Considerations

| Concern | Strategy |
|---|---|
| Database queries | Summary tables, indexes, pagination |
| File storage | Supabase Storage with CDN |
| API load | Edge functions, server-side caching |
| Dashboard | Pre-aggregated data, cache layer |
| Image optimization | Thumbnails, WebP conversion |
| Bundle size | Dynamic imports, code splitting |

---

## 9. Future Architecture Evolution

The current architecture supports future migration:

```text
Current (MVP):
    Next.js handles everything (frontend + backend + API)

Future (Production):
    Next.js → Frontend + SSR
    NestJS  → Dedicated backend API
    Supabase → Database + Storage (no direct client access)
```

The service layer abstraction makes this migration possible without rewriting business logic.
