# ADR-001: Technology Stack Selection

## Status

Accepted

## Context

The project needs a technology stack that supports:

- Mobile-first PWA for tourists
- Server-side rendering for SEO and performance
- Structured relational database for tourism data
- File storage for photos and certificates
- Authentication for admin users
- Dashboard with charts and maps
- TypeScript for type safety
- Rapid development by a small team

## Decision

The following stack is selected:

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 3+ |
| UI Components | shadcn/ui | Latest |
| Database | Supabase PostgreSQL | 15+ |
| Storage | Supabase Storage | — |
| Auth | Supabase Auth | — |
| Validation | Zod | 3+ |
| Forms | React Hook Form | 7+ |
| Charts | ECharts or ApexCharts | Latest |
| Maps | Leaflet + React Leaflet | Latest |
| Data Fetching | TanStack Query | 5+ |

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Vue/Nuxt | Team has more React experience |
| MySQL | PostgreSQL has better JSON, RLS, and extension support |
| Firebase | Less control over SQL queries and relational modeling |
| MongoDB | Tourism data is highly relational, not document-oriented |
| Plain CSS/SCSS | Tailwind provides faster development |

## Consequences

**Positive:**
- Full-stack TypeScript reduces context switching
- Supabase provides database + auth + storage in one service
- Next.js App Router enables server components and actions
- shadcn/ui provides accessible, customizable components
- Zod schemas are shared between client and server

**Negative:**
- Vendor lock-in with Supabase (mitigated by standard PostgreSQL)
- Next.js App Router is relatively new, some APIs may change
- shadcn/ui requires manual component installation
