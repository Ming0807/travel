# SYSTEM_CONTEXT_DIAGRAM.md

## 1. Purpose

This document presents the system context diagram (C4 Model Level 1) showing the platform's boundaries and external interactions.

---

## 2. System Context Diagram

```text
                    ┌─────────────────────┐
                    │    TAT / Official    │
                    │    Data Sources      │
                    └─────────┬───────────┘
                              │ (reference data import)
                              ▼
┌───────────┐      ┌─────────────────────────────────┐     ┌───────────────┐
│           │      │                                   │     │               │
│  Tourist  │─────▶│  Southern Border Tourism          │◀────│  Admin User   │
│  (Mobile) │◀─────│  Data & Intelligence Platform     │────▶│  (Browser)    │
│           │      │                                   │     │               │
└───────────┘      │  ┌─────────────┐ ┌────────────┐  │     └───────────────┘
                   │  │ Next.js PWA │ │ Supabase   │  │
                   │  │ Application │ │ Backend    │  │     ┌───────────────┐
                   │  └─────────────┘ └────────────┘  │     │               │
                   │                                   │◀────│  Researcher/  │
                   └──────────┬────────────────────────┘     │  Planner      │
                              │                              └───────────────┘
                              │ (optional)
                    ┌─────────▼───────────┐
                    │   LINE Platform      │
                    │   (LIFF / Messaging) │
                    └─────────────────────┘
```

---

## 3. External Actors

| Actor | Type | Interaction | Protocol |
|---|---|---|---|
| Tourist | Person | Scans QR, uploads photo, fills form, downloads certificate | HTTPS (browser) |
| Admin User | Person | Manages attractions, reviews visits, views dashboard | HTTPS (browser) |
| Researcher/Planner | Person | Views dashboards, exports data | HTTPS (browser) |
| LINE Platform | External System | Optional identity provider, messaging | HTTPS (LIFF SDK) |
| TAT / Official Sources | External System | Reference data for comparison | Manual import / CSV |

---

## 4. System Boundary

**Inside the system boundary:**

- Next.js web application (frontend + API)
- Supabase PostgreSQL database
- Supabase Auth (admin authentication)
- Supabase Storage (photos, certificates, templates)
- Dashboard analytics engine
- Export/report generation

**Outside the system boundary:**

- Tourist's mobile device and browser
- Admin's browser
- LINE Platform (optional integration)
- Official tourism data sources
- Email delivery service (future)
- CDN for static assets (provided by hosting)

---

## 5. Data Flows at Context Level

| Flow | From | To | Data |
|---|---|---|---|
| QR Check-in | Tourist | System | Check-in code, device info |
| Photo Upload | Tourist | System | Image file |
| Form Submission | Tourist | System | Profile data, consent |
| Certificate Download | System | Tourist | Generated certificate image |
| Attraction Content | System | Tourist | Attraction info, images |
| Content Management | Admin | System | Attraction data, configs |
| Dashboard View | System | Researcher | Aggregated metrics, charts |
| Data Export | System | Admin/Researcher | CSV files |
| Identity Verification | LINE Platform | System | LINE user ID, profile |
| Reference Import | Official Sources | System | Province/benchmark data |

---

## 6. Trust Boundaries

```text
┌─ Untrusted Zone ──────────────────────────────┐
│  Tourist browser (guest token, photo upload)   │
│  Public internet                                │
└────────────────────────────┬───────────────────┘
                             │ HTTPS + validation
┌─ DMZ / Application Zone ──▼───────────────────┐
│  Next.js server (SSR, API routes)              │
│  Input validation, rate limiting               │
│  Server actions with Zod schemas               │
└────────────────────────────┬───────────────────┘
                             │ Supabase client (service role)
┌─ Trusted Zone ─────────────▼───────────────────┐
│  Supabase PostgreSQL (RLS enabled)             │
│  Supabase Storage (bucket policies)            │
│  Supabase Auth (admin sessions)                │
└────────────────────────────────────────────────┘
```
