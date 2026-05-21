# BACKEND_ARCHITECTURE.md

## 1. Purpose

This document describes the backend architecture including API design, server actions, service layer, and security boundaries.

---

## 2. Backend Strategy

### MVP Approach

```text
Next.js handles all backend logic:
    ├── Server Actions  → Form mutations (tourist flow, admin CRUD)
    ├── API Routes      → REST endpoints (exports, webhooks, async ops)
    └── Server Components → Data fetching (SSR pages)
```

### Future Migration Path

```text
Next.js → Frontend + SSR only
NestJS  → Dedicated backend API
         ├── Controllers
         ├── Services
         ├── Guards
         └── DTOs/Validators
```

The service layer is designed for portability between these architectures.

---

## 3. Server Actions (Primary Backend Pattern)

### 3.1 Convention

```text
src/actions/
├── tourist.actions.ts      → Tourist profile CRUD
├── visit.actions.ts        → Visit creation, update
├── certificate.actions.ts  → Certificate generation
├── stamp.actions.ts        → Stamp assignment
├── survey.actions.ts       → Survey submission
├── attraction.actions.ts   → Admin attraction CRUD
├── photo-spot.actions.ts   → Photo spot management
├── checkin-code.actions.ts → Check-in code management
├── export.actions.ts       → Data export
└── auth.actions.ts         → Admin authentication
```

### 3.2 Action Pattern

```typescript
// Example: create visit action
'use server'

import { visitSchema } from '@/lib/validators/visit'
import { VisitService } from '@/services/visit.service'

export async function createVisit(formData: FormData) {
  // 1. Parse and validate input
  const parsed = visitSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error } }
  }

  // 2. Execute business logic via service
  const result = await VisitService.create(parsed.data)

  // 3. Return structured response
  return { success: true, data: result }
}
```

---

## 4. API Routes (Secondary Pattern)

Used for operations that don't fit the server action model:

```text
src/app/api/
├── exports/
│   └── route.ts            → CSV export with streaming
├── certificates/
│   └── [id]/download/
│       └── route.ts        → Certificate file download
├── webhooks/
│   └── line/
│       └── route.ts        → LINE webhook handler
└── health/
    └── route.ts            → Health check endpoint
```

---

## 5. Service Layer

### 5.1 Service Design

Services encapsulate business logic and are independent of the transport layer:

```text
src/services/
├── tourist.service.ts
├── visit.service.ts
├── certificate.service.ts
├── stamp.service.ts
├── survey.service.ts
├── attraction.service.ts
├── dashboard.service.ts
├── export.service.ts
├── funnel.service.ts
├── auth.service.ts
└── storage.service.ts
```

### 5.2 Service Responsibilities

| Service | Responsibilities |
|---|---|
| TouristService | Create/find tourist, manage identities, detect duplicates, link identities |
| VisitService | Create visit, link photo, update behavior, check completion |
| CertificateService | Load template, render image, upload to storage, create record |
| StampService | Check uniqueness, create stamp, query passport data |
| SurveyService | Save travel behavior, expenses, satisfaction, validate scores |
| AttractionService | CRUD attractions, manage images, manage photo spots |
| DashboardService | Calculate metrics, aggregate data, format for charts |
| ExportService | Generate CSV, scope data, log export action |
| FunnelService | Track events, calculate conversion rates |
| AuthService | Verify admin session, check role, verify permissions |
| StorageService | Upload files, generate signed/controlled URLs, hide Cloudinary/Supabase/future university storage details |

---

## 6. Database Access Pattern

### 6.1 Supabase Client Setup

```text
src/lib/supabase/
├── server.ts       → Server-side client (service role for admin ops)
├── client.ts       → Client-side client (anon key for public reads)
└── admin.ts        → Admin client (service role, restricted use)
```

### 6.2 Query Pattern

- **Server Components:** Use `createServerComponentClient()` for direct queries
- **Server Actions:** Use `createServerActionClient()` for mutations
- **API Routes:** Use `createRouteHandlerClient()` for REST endpoints
- **Never expose** service role key to client-side code

---

## 7. Validation Architecture

### 7.1 Shared Schemas

```text
src/lib/validators/
├── tourist.ts          → Tourist profile schema
├── visit.ts            → Visit record schema
├── photo.ts            → Photo upload schema
├── survey.ts           → Survey response schema
├── satisfaction.ts     → Satisfaction schema
├── expense.ts          → Expense schema
├── attraction.ts       → Attraction CRUD schema
├── photo-spot.ts       → Photo spot schema
├── checkin-code.ts     → Check-in code schema
└── common.ts           → Shared types (date, id, pagination)
```

### 7.2 Double Validation

```text
Client (React Hook Form + Zod)  →  optimistic validation
    ↓
Server (Zod schema revalidation)  →  authoritative validation
    ↓
Database (constraints, checks)  →  final safety net
```

---

## 8. Error Handling

### 8.1 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  }
}
```

### 8.2 Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Not authorized for this action |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate or conflicting data |
| FILE_ERROR | 422 | File upload validation failed |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## 9. Security Architecture

### 9.1 Authentication Flow

```text
Tourist: No auth required
    → Guest token in localStorage
    → Sent as header or cookie for identity resolution

Admin: Supabase Auth
    → Email/password login
    → JWT stored in httpOnly cookie
    → Server validates JWT on every request
    → Role extracted from user metadata or user_roles table
```

### 9.2 Authorization Middleware

```text
Admin routes protected by:
    1. Auth middleware → verify JWT
    2. Role middleware → check required role
    3. Server action → verify permission for specific operation
```

---

## 10. Background Processing

For MVP, background tasks are handled synchronously. For production:

| Task | MVP Approach | Production Approach |
|---|---|---|
| Certificate rendering | Synchronous in server action | Queue + worker |
| Thumbnail generation | On upload | Queue + worker |
| Dashboard aggregation | On-demand query | Scheduled cron job |
| Data export | Synchronous download | Queue + email delivery |
| Funnel event tracking | Synchronous insert | Async queue |

See `docs/backend/BACKGROUND_JOBS.md` for detailed background job design.
