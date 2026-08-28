# ROUTES_STRUCTURE.md

## 1. Document Purpose

This document defines the recommended route structure for the **Southern Border Tourism Data & Intelligence Platform**.

The route structure must support:

- public tourism pages
- QR check-in flow
- tourist PWA flow
- digital passport
- optional survey
- admin CMS
- dashboard analytics
- report/export
- future LINE LIFF integration

This document should be used before implementing pages, layouts, navigation, proxy-based route protection, or route guards.

### Public Homepage Discovery Flow

The public homepage is a working discovery surface, not a marketing-only landing page. Its stable order is:

```text
Hero and search
Quick category actions
Attraction discovery with real CMS records
Three-step QR / certificate journey
Published stories
Recorded tourism statistics
Digital Passport and leaderboard call-to-action
```

Homepage search routes to the matching public directory and preserves the query parameter. Map content is shown only when a published attraction has valid coordinates. The current pilot scope is Yala; public navigation must not advertise Pattani or Narathiwat until those destinations are activated again.

The global header search uses the same routing contract on every public page. It opens an accessible search dialog, lets the visitor choose attractions, restaurants, accommodations, or stories, and sends the query to the matching real directory. It is not a decorative icon or a homepage anchor.

### Public Frontend Redesign Contract

The route-family UX/UI contract and executable migration order are maintained in:

- `docs/superpowers/specs/2026-08-11-public-frontend-system-redesign.md`
- `docs/superpowers/plans/2026-08-11-public-frontend-system-redesign.md`

Public routes are grouped by user job rather than forced into one layout: discovery listings, place/route details, editorial, reward/identity, focused QR/visit flow, and trust/legal/evidence. Focused QR, visit, account-linking, and research tasks hide global discovery navigation. All active public copy and filters use the Yala pilot scope.

Public discovery directories now share one compact information hierarchy:

```text
breadcrumb and page purpose
search/filter toolbar when the data contract supports filtering
truthful result count or unavailable state
featured result only when a real eligible record exists
responsive result list
next-step action
```

This contract applies to `/attractions`, `/stories`, `/routes`, `/restaurants`,
`/accommodations`, and `/360-vista`. Detail routes remain independent because
their job is reading or inspecting one record, not comparing a directory.

Restaurant category navigation is derived from `restaurant_categories` and assignments to active, published restaurants in the current destination scope. Empty categories are omitted. Featured categories appear in the top navigation; every non-empty active category appears in the desktop sidebar and mobile filter. Category URLs use `category=<slug>`. Legacy `foodType` links redirect to a managed category when possible.

`/attractions` uses one consistent result grid rather than promoting an arbitrary
first record. Search, managed attraction type, and live-destination district are
server-side URL filters and remain active across pagination. The page also
supports a guest-only "ทริปของฉัน" shortlist. It stores at most 20 attraction
slugs in versioned browser local storage and does not create a tourist or
research record. The next step sends the selected slugs to `/routes`, resolves
only attractions that are still active and published, preserves the selected
order, and can open up to ten stops in Google Maps. This is a planning handoff,
not a claim that the platform optimizes or generates an itinerary.

---

## 2. Route Design Principles

## 2.1 Keep Public and Admin Routes Separate

Public tourist routes should be separate from admin routes.

Recommended:

```text
Public/tourist routes: /
Admin routes: /admin/*
```

## 2.2 Use Short QR Routes

QR route should be short and stable.

Recommended:

```text
/c/[checkinCode]
```

Short URLs produce cleaner QR codes.

## 2.3 Do Not Encode User Type in Route

Do not create separate routes for LINE, guest, Thai, or foreign tourists.

Bad:

```text
/line/c/[code]
/guest/c/[code]
/foreign/c/[code]
```

Good:

```text
/c/[code]
```

The application should detect context after opening.

Public buttons that offer a production-like trial use `/checkin/try`. That route resolves only an active code labelled `Demo QR:`, validates it with the same rules as a physical scan, and then redirects through `/c/[code]`. It must not link directly to `/checkin/[code]`, because the canonical QR route establishes the check-in session used by funnel tracking.

## 2.4 Use Slugs for Public Attractions

Public attraction details should use slug.

Recommended:

```text
/attractions/[slug]
```

Do not use raw database IDs in public attraction URLs unless necessary.

The public detail route renders only published attraction data. It hides
unconfigured 360 media and optional sections, limits recommendations to curated
relations, distinguishes unavailable reviews from an empty review set, and
uses a privacy-safe public review DTO. Admin draft preview uses a separate
repository entry point and must not weaken the public publication boundary.

## 2.5 Use IDs for Admin Routes

Admin routes may use IDs.

Recommended:

```text
/admin/attractions/[attractionId]/edit
```

## 2.6 Public Hospitality Discovery

`/restaurants` and `/accommodations` use URL-driven server filtering and exact
database totals. Search, type, province, and page values must remain together
when filters change. Pagination operates over the full published launch-scope
dataset instead of a client-filtered first page.

The listing states are distinct:

- `available`: render the exact total and current page.
- `empty`: no published records match the active filters.
- `unavailable`: the query failed; do not present this as zero records.

Restaurant directory rows show managed category labels and province. Accommodation cards show type,
province, and the stored price range. Booking, availability, ratings, halal
claims, and amenities must not render unless their production data contracts
exist. Listing covers use managed media only; stale third-party stock URLs are
not public card media.

Restaurants use the Market Street Directory composition: a horizontal primary
category navigator, a desktop category rail, and compact rows grouped from the
current server-paginated result page. Group headings never claim full-dataset
category totals. Unknown published food types remain visible in the `อื่น ๆ`
group. The first accommodation with valid managed media may still be shown as
a featured result; accommodation records without media stay in the standard
grid and use a named missing-image state. Controlled food and accommodation
category labels are Thai-first while category slugs remain stable for server
filtering. Mobile filters use a
single disclosure control and preserve the same GET query contract as desktop.

The accommodation result area uses an orange/white/black editorial hierarchy:
one verified featured result when eligible, then a responsive compact-card
grid. The hero remains an independently managed directory surface; redesigning
the result grid must not replace its content or settings contract.

Admin category management lives at `/admin/restaurants/categories`. One restaurant may have multiple ordered categories. Draft records may be uncategorized, but publishing requires at least one active category. Categories referenced by restaurants are archived rather than hard-deleted.

## 2.7 Public Hospitality Details

`/restaurants/[slug]` and `/accommodations/[slug]` expose only explicit public
DTO fields. A missing record renders the route-specific missing state; a query
failure must reach the error boundary instead of becoming a false 404.

Related attractions are curated, published, active, and limited to provinces
that are currently live. Hero media uses the managed full image with responsive
sizes, while related cards prefer managed thumbnails. Failed media renders an
honest Thai fallback.

Contact actions are conditional. Phone links require a valid telephone value,
website links require HTTPS, and map links require valid coordinates. The
public pages do not invent booking, availability, amenities, or contact actions
that are not represented by production data.

## 2.8 Public Routes And 360 Experiences

`/routes` lists only published routes whose stops all resolve to active,
published attractions in a live destination province. Route cards show the
stored cover, computed day count, and real stop count. Database failures reach
the route error boundary instead of appearing as an empty list.

`/routes/[slug]` groups stops by stored day and display order. A Google Maps
directions action is available only when every stop has valid coordinates;
otherwise the page directs visitors to each attraction's own location details.
Route and stop media prefer managed thumbnails and always provide an honest
fallback instead of a generated or CSS-simulated scene.

`/360-vista` reads published panorama and external 360 references from active
Yala attractions. External links must use HTTPS, open in a new tab, and be
labelled as an external system. When the CMS has no published 360 media, the
page may offer the configured external provider with a clear privacy notice,
but it must not invent supported places or render a CSS mock panorama.

The 360 directory uses the same compact discovery intro and result summary as
the other public directories. Its cards retain the real media behavior and
must distinguish managed panorama media from an external provider before the
visitor opens it.

Admin users need precise record management.

---

## 3. Top-Level Route Groups

Recommended route groups:

```text
Public Website
Tourist Flow
Passport
Survey
Admin
Dashboard
Reports
Authentication
System/Error Pages
API Routes
```

If using Next.js App Router, route groups can be organized with parentheses.

Example:

```text
app/
  (public)/
  (tourist)/
  (admin)/
  api/
```

---

## 4. Public Website Routes

## 4.1 Home Page

```text
/
```

Purpose:

- introduce platform
- support SEO, credibility, attraction discovery, travel stories, suggested routes, 360 media, and general information
- highlight attractions through a premium discovery feed
- explain certificate/passport concept
- link to attractions
- link to passport for returning same-device or account-linked users
- preview aggregated dashboard value without exposing private data

MVP status:

Optional but recommended.

## 4.2 Attraction List

```text
/attractions
```

Purpose:

- list published attractions
- search/filter by province and type

## 4.3 Attraction Detail

```text
/attractions/[slug]
```

Purpose:

- show attraction information
- show images/360 media
- show certificate CTA if check-in code exists

## 4.4 Province Page

```text
/provinces/[provinceSlug]
```

Purpose:

- show province-level attraction listing
- optional tourism intro

MVP status:

Optional.

## 4.5 About Page

```text
/about
```

Purpose:

- explain project purpose
- explain data use
- build trust

MVP status:

Optional.

---

## 5. QR Check-in Routes

## 5.1 QR Entry

```text
/c/[checkinCode]
```

Purpose:

- resolve QR/check-in code
- load attraction/photo spot context
- record QR/landing funnel events
- show a location-specific QR landing page before any form
- show certificate preview and CTA such as "Create my certificate"
- start certificate flow only after the tourist chooses to continue

Example:

```text
/c/YLA001
```

Rules:

- The QR route must not open a long form immediately.
- The QR route must not require LINE, Google, email, phone number, or survey completion.
- The QR route may detect LINE browser, browser language, guest token, authenticated identity, attraction, photo spot, and campaign context.

## 5.2 QR Invalid Page

Can be handled inside same route.

States:

```text
invalid code
inactive code
expired code
attraction unavailable
```

Recommended:

```text
/c/[checkinCode]
```

renders friendly error states.

Do not create many separate error routes unless needed.

---

## 6. Tourist Flow Routes

Route names can vary, but flow must be clear.

Recommended:

```text
/visit/start
/visit/profile
/visit/photo
/visit/certificate
/visit/success
```

Alternative:

```text
/flow/[sessionId]/profile
/flow/[sessionId]/photo
/flow/[sessionId]/certificate
/flow/[sessionId]/success
```

MVP recommendation:

Use simple routes with session/context stored safely.

---

## 6.1 Visit Start

```text
/visit/start
```

Purpose:

- receive context from QR route
- prepare session
- redirect to profile if ready

This page may be skipped if QR route directly renders landing/start UI.

## 6.2 Tourist Profile Step

```text
/visit/profile
```

Purpose:

- collect minimal tourist profile
- record the visit time on the server
- record consent
- create or reuse tourist profile
- create visit record or prepare creation

## 6.3 Photo Upload Step

```text
/visit/photo
```

Purpose:

- upload tourist photo
- link photo to visit
- record photo_uploaded event

## 6.4 Certificate Step

```text
/visit/certificate
```

Purpose:

- preview certificate
- generate certificate
- download certificate
- record certificate_generated event
- trigger stamp assignment

## 6.5 Success Step

```text
/visit/success
```

Purpose:

- show certificate download
- show stamp earned
- show passport CTA
- show optional survey CTA
- show save passport options

---

## 7. Passport Routes

## 7.1 My Passport

```text
/passport
```

Purpose:

- show earned and available stamp targets without inventing progress
- show recent visits that reached certificate completion
- explain guest storage limitations without blocking use
- offer optional LINE linking and consent-based recovery
- keep passport ownership resolved from the current server-side tourist identity

## 7.2 Passport Stamp Detail

```text
/passport/stamps/[stampId]
```

Purpose:

- show stamp details

MVP status:

Optional.

## 7.3 Shared Passport

```text
/share/passport/[shareToken]
```

Purpose:

- future public share page

## 7.4 Public Leaderboard

```text
/leaderboard
```

Purpose:

- motivate voluntary tourism participation through XP
- show only tourists who explicitly choose public visibility
- support private, public alias, and explicit passport display-name modes
- show rolling 7-day, rolling 30-day, and all-time rankings truthfully
- never expose tourist UUIDs or identity-provider values to the browser

MVP status:

Not required.

---

## 8. Survey Routes

## 8.1 Survey by Visit

```text
/survey/[visitId]
```

Purpose:

- optional post-certificate survey
- travel behavior
- expense
- satisfaction

Security note:

Do not allow arbitrary users to edit another tourist's survey.

Use session/identity validation.

## 8.2 Survey Success

```text
/survey/[visitId]/success
```

Purpose:

- thank user
- return to passport/certificate

MVP can show success on same page.

---

## 9. Admin Routes

All admin routes must be protected.

Base:

```text
/admin
```

## 9.1 Admin Home

```text
/admin
```

Purpose:

- admin overview
- quick links
- recent activity
- summary cards

## 9.1.1 Content Hub

```text
/admin/content
```

Purpose:

- guide admins to the correct CMS module for public-facing content changes
- explain how attractions, media, stories, routes, photo spots, QR codes, and homepage sections connect
- provide quick links for common content tasks such as replacing popular destination images or editing attraction detail pages

## 9.2 Attractions

```text
/admin/attractions
/admin/attractions/new
/admin/attractions/[attractionId]
/admin/attractions/[attractionId]/edit
/admin/attractions/[attractionId]/images
/admin/attractions/[attractionId]/photo-spots
/admin/attractions/[attractionId]/checkin-codes
```

Purpose:

- attraction CRUD
- image management
- photo spot management
- check-in code management

The attraction visual editor is mobile-capable rather than desktop-only. Edit
actions remain visible without hover, drawers use the dynamic viewport height
and safe-area padding, form controls avoid mobile browser zoom, and save/cancel
actions remain reachable at the bottom of the current drawer. Media selection
uses an explicit `เลือกภาพนี้` button for every asset; the card itself is not a
nested interactive target. Closing a nested media picker restores the parent
drawer scroll lock. Legacy authenticated content media is proxied by the admin
preview endpoint so `next/image` does not fail on redirects.

## 9.3 Photo Spots

```text
/admin/photo-spots
/admin/photo-spots/new
/admin/photo-spots/[photoSpotId]/edit
```

Purpose:

- cross-attraction photo spot management

## 9.4 Check-in Codes

```text
/admin/checkin-codes
/admin/checkin-codes/new
/admin/checkin-codes/[checkinCodeId]/edit
```

Purpose:

- QR code management
- copy public URL
- view active/inactive status

## 9.5 Visits

```text
/admin/visits
/admin/visits/[visitId]
```

Purpose:

- view visit records
- filter by date/province/attraction/status

## 9.6 Tourists

```text
/admin/tourists
/admin/tourists/[touristId]
```

Purpose:

- view tourist profile summary
- view passport/visits if permission allows

MVP status:

Optional or restricted.

## 9.7 Surveys

```text
/admin/surveys
/admin/surveys/[surveyId]
```

Purpose:

- review paginated optional responses by respondent, visit, place, date, and answered section
- open a read-only grouped response detail for travel behavior, expense, satisfaction, and permission-gated comments
- keep aggregate analytics in `/admin/dashboard/*` and link to supporting records only for authorized staff
- filter satisfaction and comments

## 9.8 Media

```text
/admin/media
```

Purpose:

- future media library

MVP status:

Optional.

## 9.8.1 Story Workspaces

```text
/admin/stories
/admin/stories/submissions
```

Purpose:

- `/admin/stories` manages editorial articles written by the content team
- `/admin/stories/submissions` provides a separate moderation queue for traveler stories
- both routes use server-side search, status, province, topic, date, pagination, and export filters
- editorial readiness filtering uses the stored content quality score and labels unscored content honestly
- workflow changes happen inside the story editor; list rows do not provide a shortcut that bypasses review rules

## 9.9 Settings

```text
/admin/settings
```

Purpose:

- system settings
- master data
- profile settings

MVP status:

Optional.

## 9.10 Certificate Templates

```text
/admin/certificate-templates
/admin/certificate-templates/new
/admin/certificate-templates/[templateId]/edit
```

Purpose:

- search, filter, activate, default, and export templates
- create global or attraction-specific backgrounds
- edit bounded photo/text positions through the Certificate Template Studio
- preview the same renderer used by the tourist certificate flow
- block unsafe overlap and out-of-safe-zone layouts before save

---

## 10. Dashboard Routes

Dashboards can be under admin.

Recommended:

```text
/admin/dashboard
/admin/dashboard/executive
/admin/dashboard/tourists
/admin/dashboard/visits
/admin/dashboard/expenses
/admin/dashboard/satisfaction
/admin/dashboard/funnel
/admin/dashboard/sustainability
/admin/dashboard/official-comparison
```

MVP can use:

```text
/admin/dashboard
```

with sections.

---

## 11. Report and Export Routes

Recommended:

```text
/admin/reports
/admin/reports/exports
/admin/reports/exports/new
/admin/reports/exports/[exportId]
```

MVP can use export buttons on dashboard/admin pages instead of full export job pages.

API routes can generate CSV directly.

---

## 12. Official Data Import Routes

Future Phase 2:

```text
/admin/official-data
/admin/official-data/import
/admin/official-data/imports/[importLogId]
/admin/official-data/attraction-refs
/admin/official-data/stats
```

MVP:

Documentation only or placeholder.

---

## 13. Authentication Routes

## 13.1 Admin Login

```text
/admin/login
```

Protected admin routes redirect here with a URL-encoded internal destination, for example
`/admin/login?redirect=%2Fadmin%2Fsettings`. The login page accepts only paths beginning
with `/admin`; external URLs and protocol-relative values fall back to `/admin`.

## 13.2 Auth Callback

```text
/auth/callback
```

Required if using Supabase Auth OAuth/magic link.

## 13.3 Unauthorized

```text
/unauthorized
```

or admin-specific error state.

---

## 14. LINE LIFF Routes

LINE is optional.

Future routes:

```text
/line/callback
/line/link
/line/passport
```

MVP should not depend on these.

Recommended LINE linking route:

```text
/account/link-line
```

or:

```text
/passport/link-line
```

Keep LINE routes optional and not required for core flow.

---

## 15. API Route Structure

If using Next.js API routes or route handlers:

```text
/api/checkin/[code]
/api/tourists/profile
/api/visits
/api/photos/upload
/api/certificates/generate
/api/stamps/award
/api/surveys
/api/dashboard/executive
/api/dashboard/funnel
/api/exports/visits
/api/admin/attractions
/api/admin/photo-spots
/api/admin/checkin-codes
```

Exact structure can vary.

Rules:

- validate input server-side
- protect admin APIs
- do not expose service role key
- use service layer for database operations

---

## 16. Route Protection Rules

## 16.1 Public Routes

Public:

```text
/
 /attractions
 /attractions/[slug]
 /c/[checkinCode]
```

No login required.

## 16.2 Tourist Session Routes

Tourist routes:

```text
/visit/*
/passport
/survey/*
```

Use guest token or identity/session validation.

No admin login required.

## 16.3 Admin Routes

Protected:

```text
/admin/*
```

Require admin authentication and permissions.

## 16.4 API Routes

Protect based on purpose.

Examples:

```text
/api/checkin/[code] -> public read, safe response only
/api/admin/* -> admin only
/api/exports/* -> admin/export permission
```

---

## 17. Navigation Structure

## 17.1 Public Navigation

Recommended:

```text
Home
Attractions
Food and Stay
Routes and Stories
Passport
About
Language
```

## 17.2 Tourist Flow Navigation

Minimal.

Use:

```text
back button
truthful step progress
language switch
```

Avoid full navigation during flow.

## 17.3 Passport Navigation

```text
My Passport
My Certificates
Attractions
Save Passport
```

MVP can be simple.

## 17.4 Admin Navigation

Recommended sidebar:

```text
Content Hub
Dashboard
Attractions
Photo Spots
Check-in Codes
Visits
Tourists
Surveys
Reports
Official Data
Settings
```

MVP sidebar:

```text
Dashboard
Attractions
Photo Spots
Check-in Codes
Visits
Reports
```

---

## 18. Route State and Query Parameters

## 18.1 Admin List Filters

Use query parameters.

Example:

```text
/admin/visits?province=yala&start=2026-05-01&end=2026-05-31&status=certificate_generated
```

## 18.2 Dashboard Filters

Example:

```text
/admin/dashboard?start=2026-05-01&end=2026-05-31&province=yala
```

## 18.3 Public Attraction Filters

Example:

```text
/attractions?province=yala&type=nature&search=skywalk
```

Benefits:

- shareable
- reload-safe
- easier debugging

---

## 19. Context Passing in Tourist Flow

The QR route must pass context to tourist flow.

Required context:

```text
checkin_code
checkin_code_id
attraction_id
photo_spot_id
session_id
language
```

Possible storage:

```text
URL-safe short session token
server session
encrypted cookie
local storage for non-sensitive context
```

Do not put sensitive data in URL.

MVP can use local/session storage carefully.

---

## 20. Route Error Handling

## 20.1 Not Found

The framework `not-found.tsx` boundary renders a Thai-first recovery page with links to
`/attractions` and `/`. Admin routes use a separate admin-styled boundary that returns to
`/admin`.

## 20.2 Invalid QR

Handled by:

```text
/c/[checkinCode]
```

friendly error state.

## 20.3 Unauthorized Admin

Admin error boundaries distinguish authentication, permission, and general module failures
in Thai. They must not render raw exception messages or digests in the browser.

## 20.4 Expired Session

Tourist flow:

```text
Your session expired. Please scan the QR code again.
```

---

## 21. SEO Requirements

SEO applies mostly to public routes:

```text
/
 /attractions
 /attractions/[slug]
```

Every public page should have:

```text
title
description
exactly one h1
one canonical URL
```

Dynamic attraction, restaurant, accommodation, route, and story detail routes must derive
their canonical URL from the resolved public record. Public release QA checks canonical
metadata, horizontal overflow, and browser console errors at 360, 390, 768, 1280, and
1440 pixels.

QR and tourist flow pages do not need public SEO.

Admin pages should not be indexed.

Use:

```text
noindex
```

for admin and flow pages if needed.

---

## 22. Route File Organization Example

For Next.js App Router:

```text
app/
  (public)/
    page.tsx
    attractions/
      page.tsx
      [slug]/
        page.tsx

  (tourist)/
    c/
      [checkinCode]/
        page.tsx
    visit/
      profile/
        page.tsx
      photo/
        page.tsx
      certificate/
        page.tsx
      success/
        page.tsx
    passport/
      page.tsx
    survey/
      [visitId]/
        page.tsx

  (admin)/
    admin/
      layout.tsx
      page.tsx
      dashboard/
        page.tsx
      attractions/
        page.tsx
        new/
          page.tsx
        [attractionId]/
          page.tsx
          edit/
            page.tsx
      photo-spots/
        page.tsx
      checkin-codes/
        page.tsx
      visits/
        page.tsx
      reports/
        page.tsx

  api/
    checkin/
      [code]/
        route.ts
    visits/
      route.ts
    certificates/
      generate/
        route.ts
    exports/
      visits/
        route.ts
```

This is a recommendation, not a strict requirement.

---

## 23. Layout Organization

## 23.1 Public Layout

```text
PublicHeader
PublicFooter
LanguageSwitcher
```

## 23.2 Tourist Flow Layout

```text
TouristFlowShell
StepProgress
LanguageSwitcher
MobileSafeArea
```

## 23.3 Admin Layout

```text
AdminSidebar
AdminTopbar
AdminContent
AuthGuard
```

## 23.4 Dashboard Layout

Can be part of Admin Layout.

---

## 24. Proxy Route Protection Requirements

The root `proxy.ts` file can be used for:

```text
admin route protection
locale detection
session handling
redirects
```

Rules:

- do not do heavy database logic in proxy route protection.
- do not expose secrets.
- keep redirects predictable.

---

## 25. MVP Route Acceptance Checklist

```text
[ ] /attractions exists.
[ ] /attractions/[slug] exists.
[ ] /c/[checkinCode] exists.
[ ] Tourist profile/photo/certificate/success flow exists.
[ ] /passport exists or is planned.
[ ] /survey/[visitId] exists or is planned.
[ ] /admin exists and is protected.
[ ] /admin/attractions exists.
[ ] /admin/photo-spots exists or is managed under attractions.
[ ] /admin/checkin-codes exists.
[ ] /admin/visits exists.
[ ] /admin/dashboard exists.
[ ] Export route or API exists/planned.
[ ] Invalid QR state works.
[ ] Admin unauthorized state works.
[ ] Query parameters are used for filters.
```

---

## 26. Do Not Do

Do not:

```text
Use separate QR routes for LINE and guest.
Put sensitive data in URLs.
Expose admin pages without auth.
Use raw database IDs for public attraction URLs when slug is available.
Make tourist flow depend on admin layout.
Index admin pages publicly.
Hardcode route-to-attraction mapping.
Put all pages under one route with conditional rendering.
```

---

## 27. Future Route Enhancements

Possible future routes:

```text
/routes
/routes/[routeSlug]
/campaigns
/campaigns/[campaignSlug]
/rewards
/passport/share/[shareToken]
/admin/campaigns
/admin/rewards
/admin/official-data
/admin/audit-logs
```

Do not implement until core MVP is stable.

---

## 28. Final Route Rule

Routes should make the product structure obvious.

A developer should understand the system by reading the route tree.

A tourist should never feel lost after scanning a QR code.

---

## 29. Phase 18 Research Routes

| Route | Audience | Purpose |
|---|---|---|
| `/research/[studyCode]/invite` | Tourist | Optional research notice and consent before normal QR flow |
| `/visit/[visitId]/evaluation` | Eligible tourist participant | Versioned system evaluation with draft recovery |
| `/research/withdraw/current` | Current participant | Separate authenticated withdrawal path |
| `/research/operator/tasks` | Facilitated stakeholder | Fixed decision-support tasks with explicit start timer |
| `/research/operator/evaluation` | Facilitated stakeholder | Stakeholder system evaluation after tasks |
| `/admin/research` | `research.read` | Study list and readiness status |
| `/admin/research/[id]` | `research.read`; management controls require `research.manage` | Protocol, analytics, deployments, instruments, tasks, assessment queue and export |
| `/admin/research/[id]/operator/start` | `research.manage` | Clean participant-facing notice used during a facilitated session |
| `/admin/attractions/[id]/improvements` | Approved attraction/admin permission | Review feedback issue, create action, record completion and follow-up |

Public participant routes never accept internal research IDs or secret tokens in the URL. Ownership is carried in an HttpOnly same-site cookie; stakeholder routes do not create tourist profiles.

---

## 30. Public Trust Routes

| Route | Purpose | Data behavior |
|---|---|---|
| `/about` | Explain the verified scope and current Yala pilot capabilities | No invented team, authority, or scale claims |
| `/contact` | Submit a support, content-correction, QR, privacy, or collaboration message | Calls `POST /api/contact`; preserves values on failure |
| `/privacy` | Explain actual personal-data handling and user choices | Must match implemented fields, providers, and retention behavior |
| `/terms` | Explain the actual service contract and content rules | Must not promise unsupported services or legal/operator facts |
