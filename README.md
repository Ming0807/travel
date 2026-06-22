# Fullstack Tourism
# Southern Border Tourism Data & Intelligence Platform

A production-oriented tourism database and analytics platform for the southern border provinces of Thailand: **Yala**, **Pattani**, and **Narathiwat**.

The core purpose of this project is to build a high-quality local tourism database that can support sustainable tourism planning, visitor behavior analysis, dashboard reporting, and long-term policy decisions.

This project is not only a tourist check-in system. The QR/PWA/certificate/digital stamp features are engagement mechanisms designed to encourage tourists to provide useful data voluntarily. The main system objective remains:

> To collect, structure, analyze, and visualize tourist data for sustainable tourism development in Thailand's southern border region.

---

## 1. Project Vision

The platform should help local tourism administrators, university researchers, provincial agencies, and tourism planners understand:

- Who visits the southern border provinces
- Where tourists come from
- Which attractions they visit
- How they travel
- How much they spend
- How satisfied they are
- Which places need improvement
- Which tourism routes or campaigns should be promoted
- How tourism benefits can be distributed more sustainably across local communities

The system should be designed as a serious, real-world information system, not a simple classroom CRUD application.

---

## 2. Core Concept

The platform combines three major layers:

```text
Tourist Engagement Layer
    QR / PWA / Digital Certificate / Digital Stamp / Guest / Optional Google / Optional LINE

Tourism Database Layer
    Tourist Profile / Visit Records / Travel Behavior / Attractions / Expenses / Satisfaction

Tourism Intelligence Layer
    Dashboard / Reports / Sustainable Tourism Indicators / Data Export / Planning Insights
```

The engagement layer exists to solve a practical problem:

> Tourists usually do not want to fill in long forms.

Therefore, the platform gives tourists an immediate value first, such as a digital certificate, photo memory card, or digital travel stamp. After that, the system gradually asks for additional optional data that can support tourism planning.

---

## 3. Target Area

The platform focuses on the southern border tourism area:

1. Yala
2. Pattani
3. Narathiwat

The database must support attraction-level, district-level, province-level, and cross-province analysis.

---

## 4. Primary Users

### 4.1 Tourists

Tourists use the public-facing web application to:

- View attraction information
- Scan a QR code at a photo spot
- Upload a travel photo
- Create a digital certificate
- Receive a digital stamp
- Save a travel passport using guest mode first, with optional Google or LINE linking later
- Answer short optional survey questions

### 4.2 Tourism Staff

Tourism staff use the admin system to:

- Manage attractions
- Manage photo spots
- Manage attraction history and media
- Manage 360-degree content
- View tourist visit records
- Review uploaded photos
- Export data
- Monitor campaign performance

### 4.3 Administrators

Administrators manage:

- Users
- Roles
- Permissions
- Privacy settings
- Consent records
- Data import/export
- Audit logs
- Dashboard access

### 4.4 Researchers and Planners

Researchers and tourism planners use the dashboard to:

- Analyze tourist behavior
- Compare provinces and attractions
- Study spending patterns
- Analyze satisfaction
- Identify sustainable tourism opportunities
- Support policy and planning decisions

---

## 5. Key Data Dimensions

The system must collect and analyze five core dimensions.

### 5.1 Tourist Profile

Examples:

- Tourist display name
- Origin country
- Origin province
- Age group
- Preferred language
- Optional linked identity such as Google or LINE

The system should avoid collecting sensitive or unnecessary personal information.

### 5.2 Travel Behavior

Examples:

- Travel purpose
- Travel companion
- Group size
- Transport mode
- Overnight status
- Number of nights
- Visit date
- Campaign or QR source

### 5.3 Attractions Visited

Examples:

- Province
- District
- Attraction
- Photo spot
- Visit sequence
- Digital stamp earned
- Certificate generated

### 5.4 Expenses

Examples:

- Spending range
- Spending category
- Province of spending
- Approximate total expense
- Food, accommodation, transport, shopping, souvenir, activity, and other categories

For better user experience, the MVP should collect expense ranges rather than requiring exact amounts.

### 5.5 Satisfaction

Examples:

- Overall satisfaction score
- Safety score
- Cleanliness score
- Transport convenience score
- Information/signage score
- Service score
- Value for money score
- Revisit intention
- Recommendation intention
- Optional comment

---

## 6. Main Product Modules

### 6.1 Public Attraction Website

Public pages for tourists to view attraction details.

Required features:

- Attraction list
- Attraction detail page
- Province and category filters
- Attraction history
- Image gallery
- 360-degree media section
- Map location
- Travel information
- Photo spot entry point
- Call-to-action for certificate creation

### 6.2 QR Check-in and Visit Recording

Each attraction or photo spot has one QR code.

The QR code opens a PWA page such as:

```text
/c/[checkinCode]
```

The system should detect:

- Attraction
- Photo spot
- Campaign
- Browser language
- LINE environment or normal browser
- Existing tourist identity or anonymous device token

### 6.3 Digital Certificate

Tourists can upload a photo and receive a digital certificate or photo memory card.

The certificate is an incentive. It should not be treated as the main purpose of the system.

### 6.4 Digital Stamp and Passport

Tourists receive digital stamps when they visit attractions.

The digital passport helps encourage repeat participation across multiple attractions and provinces.

### 6.5 Survey, Expense, and Satisfaction Collection

The system should use progressive data collection.

Minimal required data first, optional planning data later.

### 6.6 Admin Back Office

The admin system manages:

- Attractions
- Photo spots
- Media
- Certificate templates
- QR codes
- Tourist records
- Visit records
- Survey records
- Dashboard access
- Export reports

### 6.7 Dashboard and Analytics

The dashboard must support:

- Executive overview
- Tourist profile analysis
- Travel behavior analysis
- Expense analysis
- Satisfaction analysis
- Attraction performance
- Sustainable tourism indicators
- Funnel analytics

---

## 7. Recommended Technical Stack

The recommended production-oriented stack is:

```text
Frontend: Next.js PWA
UI: Tailwind CSS + shadcn/ui
Backend: Next.js Server Actions and Route Handlers for MVP
Database: Supabase PostgreSQL
Storage: Cloudinary-first for development/Vercel through a server-side adapter; Supabase Storage fallback; university-hosted storage future
Authentication: Anonymous guest identity for tourists + Supabase Auth for admins + optional Google/LINE tourist linking
Charts: ECharts or ApexCharts
Map: Leaflet
Certificate Rendering: HTML/CSS to PNG
Deployment: Vercel + Supabase for MVP
```

For the first MVP, it is acceptable to use:

```text
Next.js + Supabase
```

Do not create a separate NestJS or Express backend during MVP setup. The Next.js codebase should still keep clear service and repository boundaries so a dedicated backend service can be considered after MVP if scale, queues, integrations, or mobile apps require it.

---

## 8. MVP Scope

The first MVP must prove that the platform can collect useful tourism data and visualize it.

### MVP must include:

- Public attraction pages
- Attraction detail page
- Dynamic attraction content
- QR code entry per photo spot
- Photo upload
- Minimal tourist form
- Digital certificate generation
- Tourist profile creation
- Visit record creation
- Optional survey
- Expense range collection
- Satisfaction score collection
- Admin attraction management
- Basic dashboard
- Data export

### MVP should not include yet:

- NFC
- Native mobile application
- Blockchain or NFT
- Full coupon partner system
- Advanced AI recommendation
- Forced GPS verification
- Complex forecasting
- Full automated government data import

---

## 9. Privacy and Data Protection Principles

The platform must follow privacy-by-design principles.

Important rules:

- Do not collect national ID numbers.
- Do not collect full home addresses.
- Do not require full legal names.
- Do not collect sensitive data unless there is a clear legal and academic reason.
- Use display name for certificate instead of legal name.
- Use province/country instead of full address.
- Make Google, LINE, email, and phone number optional for tourists.
- Store consent logs.
- Separate tourist identity from visit records.
- Use anonymized or aggregated data for dashboard reports whenever possible.

---

## 10. Data Quality Principles

The database must be designed for reliable analysis.

Rules:

- Use master data tables for provinces, districts, countries, attraction types, transport modes, travel purposes, and expense categories.
- Avoid free-text input when a controlled list is better.
- Store tourist profile separately from visit records.
- Store each visit separately.
- Store each attraction or photo spot visit clearly.
- Store survey answers in structured form.
- Use validation rules for scores, dates, and spending ranges.
- Use audit logs for admin changes.
- Use summary tables or materialized views for heavy dashboard queries.

---

## 11. High-Level Data Model

Core table groups:

```text
Geography
    countries
    provinces
    districts

Attractions
    attractions
    attraction_types
    attraction_images
    attraction_360_media
    photo_spots
    checkin_codes

Tourists
    tourists
    tourist_identities
    tourist_contacts
    consent_logs

Visits
    visits
    visit_destinations
    visit_photos
    certificates
    tourist_stamps

Survey and Planning Data
    survey_questions
    survey_answers
    satisfaction_surveys
    expense_categories
    visit_expenses

Analytics
    funnel_events
    daily_attraction_stats
    monthly_province_stats
    dashboard_cache

System
    users
    roles
    permissions
    audit_logs
    data_import_logs
```

---

## 12. Development Philosophy

Development should follow these principles:

1. Build the database correctly first.
2. Keep the tourist experience short and simple.
3. Use progressive data collection.
4. Avoid unnecessary personal data.
5. Make every feature support the five core data dimensions.
6. Build the dashboard from real questions, not decorative charts.
7. Optimize for mobile-first usage.
8. Keep admin workflows clean and practical.
9. Write maintainable code with clear module boundaries.
10. Document all important design decisions.

---

## 13. Success Criteria

The project is successful when it can:

- Record tourist data accurately
- Prevent unnecessary duplicate tourist profiles
- Track visits across multiple attractions
- Collect travel behavior data
- Collect expense and satisfaction data
- Generate a certificate as an engagement incentive
- Support repeat visits through digital stamps
- Provide usable dashboards for planning
- Export data for academic and administrative reports
- Protect tourist privacy
- Support future production deployment

---

## 14. Repository Documentation Map

Important documentation files:

```text
AGENTS.md
PROJECT_OVERVIEW.md
PRODUCT_REQUIREMENTS.md
MVP_SCOPE.md
docs/database/DATA_DICTIONARY.md
docs/modules/*.md
docs/dashboard/*.md
docs/security/*.md
tasks/*.md
.codex/skills/*/SKILL.md
```

Codex and other AI coding agents must read `AGENTS.md` before making any code changes.

---

## 15. Phase 01 Local Setup

Phase 01 establishes the Next.js MVP foundation only. It does not implement the full database schema, QR flow, upload flow, certificate generation, LINE LIFF, exports, or real dashboards yet.

```bash
# Use Node 22.x and pnpm 10.x.
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm run dev
```

Recommended verification commands:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

Environment variables are documented in `ENVIRONMENT.md` and stubbed in `.env.example`. Never commit `.env.local` or real Supabase/LINE secrets.

The MVP backend boundary is:

```text
UI Component
  -> Server Action / Route Handler
  -> Validation
  -> Auth / Permission / Ownership Guard
  -> Service Layer
  -> Repository Layer
  -> Supabase PostgreSQL / Storage Adapter
```

Current storage direction:

```text
Cloudinary for local development and Vercel deployment
Supabase Storage as supported fallback/legacy provider
University-managed storage as future provider behind the same adapter
```

Next suggested implementation phase:

```text
Phase 02: Database Schema
```
