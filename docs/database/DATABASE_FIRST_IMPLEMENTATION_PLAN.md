# Database-First Implementation Plan

## 1. Purpose

This plan defines the database-first reset for the **Southern Border Tourism Data & Intelligence Platform** after the recent public frontend, admin CRUD, dashboard, and official data work.

The goal is to make the database strong enough for development and testing before more UI and backend modules are expanded.

This plan keeps the main product strategy unchanged:

- Guest-first QR-to-certificate flow
- Minimal pre-certificate tourist data
- Optional post-certificate survey
- Optional Google/LINE account linking
- Privacy-safe dashboard and exports
- Admin-managed dynamic tourism content

---

## 2. Why Database First

The latest frontend direction introduces richer public pages, stories, official data screens, and dynamic admin CRUD expectations. These screens should not remain dependent on scattered mock data.

The next development priority should therefore be:

1. Stabilize DDL.
2. Seed realistic DML.
3. Connect frontend/admin services to database-backed data.
4. Test flows with seeded content and synthetic participation records.

This prevents the application from looking complete while the data model is still incomplete.

---

## 3. Development Order

| Order | Workstream | Output | Status |
|---:|---|---|---|
| 1 | DDL audit and repair | Clean migrations, fixed FK types, constraints, indexes | Implemented, Supabase config added, local reset blocked by Docker daemon |
| 2 | DML seed strategy | Rerunnable master/demo seed data | Implemented, static review complete, local reset blocked by Docker daemon |
| 3 | Public dynamic data | Public attraction/story/homepage queries from DB | Planned |
| 4 | Admin CRUD completion | Admin creates content used by public pages | Planned |
| 5 | Dashboard verification | Metrics populated from synthetic demo data | Planned |
| 6 | Export verification | Privacy-safe export with seeded data | Planned |
| 7 | E2E development dataset | QR-to-certificate test path works after reset | Planned |

---

## 4. DDL Scope

DDL must support these domain groups:

| Group | Tables |
|---|---|
| Geography and reference data | `countries`, `provinces`, `districts`, `attraction_types`, `transport_modes`, `travel_purposes`, `travel_companions`, `expense_categories`, `spending_ranges`, `age_groups` |
| Public tourism content | `attractions`, `attraction_media`, `photo_spots`, `suggested_routes`, `suggested_route_stops`, `travel_stories` |
| QR and visit loop | `checkin_codes`, `funnel_events`, `tourists`, `tourist_identities`, `consent_records`, `visits` |
| Reward system | `visit_photos`, `certificate_templates`, `certificates`, `stamp_definitions`, `tourist_stamps` |
| Survey and planning data | `satisfaction_surveys`, `visit_expenses` |
| Admin and governance | `admin_users`, `roles`, `permissions`, `role_permissions`, `admin_user_roles`, `audit_logs` |
| Reporting | `export_jobs` |
| Official data integration | `data_import_logs`, `official_tourism_stats`, `official_attraction_refs` |

---

## 5. DDL Rules

### 5.1 Identity and Visit Rules

- `tourists` represents a tourist profile, not a verified unique human.
- `tourist_identities` stores provider links such as `anonymous_device`, `line`, `google`, or future `email`.
- `visits` allows repeat visits.
- `tourist_stamps` prevents duplicate stamps with `unique(tourist_id, attraction_id)`.
- QR scans and landing views belong in `funnel_events`, not `visits`.

### 5.2 Reward Flow Rules

- Certificate generation must be idempotent per visit.
- A certificate must never require survey, LINE, Google, email, or phone.
- A stamp is awarded after certificate generation.
- Survey records are optional and linked to visits.

### 5.3 Dashboard Metric Rules

- QR scans are not visits.
- Landing views are not visits.
- Estimated spending is not revenue.
- Missing satisfaction is `null` / No data, not `0`.
- Zero denominator returns No data.
- Dashboard query support requires indexes on date, attraction, province, completion status, and funnel events.

### 5.4 Privacy and RLS Rules

- Sensitive tables must not be publicly readable.
- Public reads are limited to active/published attraction content and safe reference data.
- Admin and import operations must go through Next.js server code with permission checks.
- Service role is server-only.
- Private storage paths, provider IDs, guest tokens, and internal identity values are never public UI/default export data.

---

## 6. DML Seed Scope

Seed data must be rerunnable, synthetic, and useful for development.

### 6.1 Master Data

Required seed groups:

- Countries: Thailand, ASEAN neighbors, common foreign origins, Other, Prefer not to answer
- Provinces: Yala, Pattani, Narathiwat, Songkhla, Satun, and common domestic origin provinces
- Districts: key districts for Yala, Pattani, Narathiwat, Songkhla, and Satun
- Attraction types
- Travel companions
- Transport modes
- Travel purposes
- Expense categories
- Spending ranges
- Age groups
- Roles and permissions

### 6.2 Public Content Demo Data

Seed enough content for:

- Homepage discovery cards
- Attraction list and detail pages
- Search/filter by province and attraction type
- Stories page
- Suggested routes
- Photo spot QR landing pages
- Certificate/stamp demos

Recommended minimum:

| Content | Minimum |
|---|---:|
| Attractions | 15 |
| Photo spots | 20 |
| Check-in codes | 20 |
| Travel stories | 8 |
| Suggested routes | 4 |
| Certificate templates | 2 |
| Stamp definitions | 15 |

### 6.3 Transaction Demo Data

Seed synthetic records for dashboard testing:

| Data | Purpose |
|---|---|
| Tourist profiles | Profile counts and origin distribution |
| Anonymous identities | Guest mode testing |
| Consent records | PDPA/data collection proof |
| Visits | Visit trends, province split, attraction performance |
| Funnel events | QR scan and conversion analytics |
| Visit photos | Certificate flow fixtures without real photos |
| Certificates | Reward funnel and download/export checks |
| Tourist stamps | Passport progress |
| Optional surveys | Satisfaction and behavior analytics |
| Visit expenses | Estimated spending distribution |
| Export jobs/audit logs | Admin governance and export testing |
| Official stats | Official-vs-platform comparison future |

All demo records must use fake/synthetic identities and storage paths.

---

## 7. Seed Dataset Design

The development seed should include multiple data shapes:

- Completed QR-to-certificate visits
- Visits with certificate but skipped survey
- Visits with optional survey completed
- Repeat visits to the same attraction
- A tourist with multiple stamps
- Attractions with high visits and low satisfaction
- Attractions with high satisfaction and low visits
- Funnel events without visit creation
- Official statistics separate from platform visits
- Admin import log samples

This gives the dashboard and admin screens useful states to test without production data.

---

## 8. Validation Plan

Run what is practical in the local environment:

| Command | Purpose |
|---|---|
| `npm run typecheck` | Verify TypeScript compatibility after schema-aligned types/services |
| `npm run test` | Verify unit tests |
| `npm run build` | Verify Next.js route compilation |
| `supabase db reset` | Verify migrations and seed on a local database, only when safe |
| `supabase db lint` | Check database warnings if Supabase CLI is available |

If a local Supabase database is not running, report migration reset as not run.

---

## 9. Acceptance Criteria

- DDL runs on a clean local Supabase database.
- DML seed is rerunnable.
- Seed includes enough public content for homepage, attractions, stories, routes, QR, passport, dashboard, and admin lists.
- Seed includes synthetic transaction data for dashboard metrics.
- Official data tables use the same key types as the main schema.
- Admin-only official data import is not exposed through broad public/authenticated RLS.
- Public-safe content remains public-readable only when active/published.
- Sensitive tourist, visit, identity, certificate, survey, export, and audit data remains private.
- Dashboard rules remain intact: QR scans are not visits, estimated spending is not revenue, missing satisfaction is No data.

---

## 10. Next Implementation Tasks

1. Finish DDL hardening migration review.
2. Replace the current seed with a complete synthetic development seed.
3. Run local migration/seed validation when Docker Desktop is running.
4. Connect public attraction/story pages to public-safe database repositories.
5. Complete dynamic admin CRUD for stories/media/routes if required by the new frontend.
6. Use seeded transaction records to verify dashboard and export outputs.
