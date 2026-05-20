# DATABASE_ARCHITECTURE.md

## 1. Purpose

This document describes the database architecture including table organization, relationship strategy, and access patterns.

---

## 2. Database Technology

- **Engine:** PostgreSQL 15+ (Supabase-managed)
- **Extensions:** uuid-ossp, pgcrypto
- **Security:** Row Level Security (RLS) enabled
- **Naming:** snake_case for all tables and columns

---

## 3. Table Group Organization

```text
┌─────────────────────────────────────────────────┐
│  GEOGRAPHY                                       │
│  countries, provinces, districts                 │
├─────────────────────────────────────────────────┤
│  ATTRACTION MASTER DATA                          │
│  attraction_types, attractions, attraction_images│
│  attraction_360_media, photo_spots, checkin_codes│
├─────────────────────────────────────────────────┤
│  TOURIST DATA                                    │
│  tourists, tourist_identities, tourist_contacts  │
│  consent_logs                                    │
├─────────────────────────────────────────────────┤
│  VISIT DATA                                      │
│  visits, visit_photos, certificates              │
│  tourist_stamps, stamp_definitions               │
├─────────────────────────────────────────────────┤
│  SURVEY & PLANNING DATA                          │
│  travel_companions, transport_modes              │
│  travel_purposes, expense_categories             │
│  visit_expenses, satisfaction_surveys            │
│  survey_questions, survey_answers                │
├─────────────────────────────────────────────────┤
│  ENGAGEMENT DATA                                 │
│  campaigns, certificate_templates                │
│  funnel_events                                   │
├─────────────────────────────────────────────────┤
│  ANALYTICS DATA                                  │
│  daily_attraction_stats, monthly_province_stats  │
│  dashboard_cache                                 │
├─────────────────────────────────────────────────┤
│  SYSTEM DATA                                     │
│  users, roles, permissions, user_roles           │
│  role_permissions, audit_logs                    │
│  data_import_logs, system_settings               │
└─────────────────────────────────────────────────┘
```

---

## 4. Key Relationships

### 4.1 Tourist → Visits → Attractions

```text
tourists (1) ──── (N) visits (N) ──── (1) attractions
    │                    │
    │                    ├── (1) visit_photos
    │                    ├── (1) certificates
    │                    ├── (N) visit_expenses
    │                    └── (1) satisfaction_surveys
    │
    ├── (N) tourist_identities
    ├── (N) tourist_stamps
    └── (N) consent_logs
```

### 4.2 Attraction → Photo Spots → Check-in Codes

```text
attractions (1) ──── (N) photo_spots (1) ──── (N) checkin_codes
    │
    ├── (N) attraction_images
    ├── (N) attraction_360_media
    ├── (1) stamp_definitions
    └── (1) provinces ──── (1) districts
```

---

## 5. Access Patterns

### 5.1 High-Frequency Queries (Tourist Flow)

| Query | Tables | Index Needed |
|---|---|---|
| Resolve check-in code | checkin_codes | `idx_checkin_codes_code` (unique) |
| Find tourist by identity | tourist_identities | `idx_identity_provider_key` |
| Check stamp uniqueness | tourist_stamps | `unique(tourist_id, attraction_id)` |
| List attraction images | attraction_images | `idx_images_attraction_id` |

### 5.2 Medium-Frequency Queries (Admin)

| Query | Tables | Index Needed |
|---|---|---|
| List visits by date range | visits | `idx_visits_visit_date` |
| Filter visits by province | visits + attractions | `idx_visits_attraction_id` |
| Search tourists by name | tourists | `idx_tourists_display_name` |

### 5.3 Low-Frequency Queries (Dashboard)

| Query | Tables | Strategy |
|---|---|---|
| Total visits by province | visits + attractions | Summary table or materialized view |
| Satisfaction by attraction | satisfaction_surveys | Summary table |
| Spending distribution | visit_expenses | Aggregation query |
| Funnel conversion | funnel_events | Aggregation with date filter |

---

## 6. Data Integrity Rules

| Rule | Implementation |
|---|---|
| One stamp per tourist-attraction | UNIQUE constraint on `tourist_stamps(tourist_id, attraction_id)` |
| Valid province reference | FK constraint `attractions.province_id → provinces.id` |
| Valid attraction on visit | FK constraint `visits.attraction_id → attractions.id` |
| Satisfaction score range | CHECK constraint `overall_score BETWEEN 1 AND 5` |
| Active check-in codes only | Application-level check + `is_active` column |
| No orphan photos | FK constraint `visit_photos.visit_id → visits.id` |
| Consent before data | Application-level enforcement |

---

## 7. Row Level Security (RLS)

| Table | Public Access | Admin Access |
|---|---|---|
| attractions (published) | SELECT | ALL |
| tourists | None (server-only) | SELECT |
| visits | None (server-only) | SELECT |
| certificates | SELECT own (by tourist_id) | SELECT ALL |
| audit_logs | None | SELECT (admin+) |
| funnel_events | None | SELECT |

Tourist-facing operations use the **service role** through server actions (no direct client DB access for mutations).

---

## 8. Migration Strategy

```text
Migrations stored in:  supabase/migrations/
Naming convention:     YYYYMMDDHHMMSS_description.sql
Execution:             supabase db push (dev) / supabase db push --linked (prod)
Rollback:              Manual rollback scripts
```

See `docs/database/MIGRATION_GUIDE.md` for detailed procedures.
