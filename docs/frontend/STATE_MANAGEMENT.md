# STATE_MANAGEMENT.md

## 1. Document Purpose

This document defines the frontend state management strategy for the **Southern Border Tourism Data & Intelligence Platform**.

The system includes several kinds of state:

- tourist QR flow state
- guest identity state
- form state
- upload state
- certificate generation state
- passport state
- admin filters
- dashboard filters
- authentication state
- server data state

This document explains where each type of state should live and how to avoid messy global state.

---

## 2. State Management Mission

The mission is:

```text
Keep state predictable, minimal, secure, and close to where it is used.
```

The project should not use a large global store for everything.

Use the simplest appropriate state approach for each case.

---

## 3. State Categories

The frontend has these state categories:

```text
1. Server data state
2. URL state
3. Local component state
4. Form state
5. Tourist flow state
6. Guest identity state
7. Authentication state
8. Upload/generation state
9. Dashboard filter state
10. Admin table state
11. Language state
```

Each category has different storage and lifecycle needs.

---

## 4. Recommended State Tools

For MVP:

```text
React useState/useReducer
URL query parameters
React Hook Form or controlled forms
Zod validation
localStorage for non-sensitive guest token
cookies/session for safer server context if implemented
server actions/API routes for mutations
Supabase Auth for admin auth
```

Optional if needed:

```text
TanStack Query
Zustand
Jotai
```

Do not add global state library unless the need is clear.

---

## 5. Server Data State

## 5.1 Definition

Server data is data from database/API.

Examples:

```text
attractions
check-in code result
tourist profile
visit record
certificate record
passport stamps
dashboard metrics
admin tables
```

## 5.2 Rule

Server data should come from server-side fetching, API routes, server actions, or a query library.

Do not duplicate large server data in global client state unnecessarily.

## 5.3 Recommended Pattern

```text
Page/server component fetches data
    |
Passes data to UI component
    |
Client component handles interaction only
```

For client-heavy data:

```text
Use TanStack Query if needed
```

But MVP can start with direct server actions/API calls.

---

## 6. URL State

## 6.1 Definition

URL state is state that should survive refresh and be shareable.

Examples:

```text
dashboard date range
province filter
attraction filter
admin list search
pagination page
public attraction search/filter
```

## 6.2 Recommended Usage

Use URL query parameters for:

```text
/admin/dashboard?start=2026-05-01&end=2026-05-31&province=yala
/admin/visits?status=certificate_generated&page=2
/attractions?province=yala&type=nature
```

## 6.3 Benefits

- reload-safe
- shareable
- easier debugging
- browser back/forward works

---

## 7. Local Component State

Use local state for small UI-only state.

Examples:

```text
modal open/close
dropdown open/close
selected tab
hover/expanded section
temporary preview visibility
loading button state
```

Do not store cross-page flow state only in component state if user may navigate.

---

## 8. Form State

## 8.1 Tourist Form State

Tourist forms should be simple and resilient.

Use:

```text
React Hook Form or controlled state
Zod validation
field-level errors
submit loading state
```

Forms:

```text
tourist profile form
photo upload form
survey form
```

## 8.2 Admin Form State

Admin forms may be larger.

Use:

```text
React Hook Form
Zod schema
default values from server
dirty state tracking
sectioned form state
```

Forms:

```text
attraction form
photo spot form
check-in code form
template form
settings form
```

## 8.3 Form Submission Rules

- disable submit while saving.
- prevent double submission.
- show validation errors.
- preserve values after errors.
- validate server-side too.
- show toast or inline success.

---

## 9. Tourist Flow State

## 9.1 Definition

Tourist flow state is temporary state across the QR/certificate journey.

Required context:

```text
checkin_code
checkin_code_id
attraction_id
photo_spot_id
session_id
tourist_id
visit_id
photo_id
certificate_id
language
```

## 9.2 Storage Options

Possible:

```text
server session
encrypted cookie
local/session storage
URL-safe flow token
database-backed flow session
```

## 9.3 MVP Recommendation

For MVP:

```text
Use a generated session_id.
Store non-sensitive flow context in sessionStorage or localStorage.
Persist important records in database as soon as created.
Use visit_id after profile step.
```

Do not store sensitive personal data in localStorage.

## 9.4 Flow State Lifecycle

```text
QR scanned
    -> create session_id
    -> store check-in context
Profile submitted
    -> create/reuse tourist
    -> create visit
    -> store tourist_id/visit_id if safe or use server context
Photo uploaded
    -> store photo_id
Certificate generated
    -> store certificate_id
Success
    -> clear temporary flow state after completion if safe
```

---

## 10. Guest Identity State

## 10.1 Definition

Guest identity state identifies returning guest users on same device.

Stored value:

```text
anonymous_device_token
```

## 10.2 Storage

MVP can use:

```text
localStorage
```

Future safer options:

```text
httpOnly cookie
server-managed anonymous session
```

## 10.3 Rules

Guest token must be:

```text
random
non-personal
not guessable
not based on name/email
not treated as admin auth
```

## 10.4 Local Storage Key

Recommended:

```text
sbt_guest_token
```

or:

```text
southern_tourism_guest_token
```

Do not store:

```text
email
LINE ID
service role key
uploaded photo
raw consent text
```

---

## 11. Authentication State

## 11.1 Admin Auth

Recommended:

```text
Supabase Auth
```

Admin auth state should come from Supabase session/server.

Admin route protection should be server-side where possible.

## 11.2 Tourist Auth

Tourists do not need full login.

Tourist identity modes:

```text
guest token
LINE optional
email optional future
```

Do not use admin auth for tourist guest flow.

---

## 12. Upload State

Photo upload has transient state:

```text
selected file
preview URL
upload progress
uploading boolean
upload error
uploaded photo ID
```

Rules:

- keep file object in component state.
- do not store file object in global store.
- do not store base64 in localStorage.
- revoke preview object URL when done if used.
- preserve visit context during upload.

---

## 13. Certificate Generation State

Certificate generation has transient state:

```text
rendering
generating
uploading generated file
generation error
certificate URL
certificate ID
download count optional
```

Rules:

- show clear loading state.
- prevent duplicate generation clicks.
- reuse existing certificate if already generated.
- store final certificate record in database.
- do not rely only on client state.

---

## 14. Passport State

Passport data is server data.

Examples:

```text
tourist profile
earned stamps
certificates
passport progress
```

Rules:

- fetch from server based on current tourist identity.
- cache lightly if needed.
- do not expose other tourists' passport data.
- guest passport depends on guest token.

MVP can fetch passport on page load.

---

## 15. Survey State

Survey state includes:

```text
current step
answers
submit loading
validation errors
skip state
```

MVP recommendation:

```text
store survey answers in component/form state
submit all at end
```

Alternative:

```text
save step by step
```

Phase 2 can implement partial save.

Rules:

- survey is optional.
- skip should not destroy certificate/passport state.
- validate before submit.
- link submitted data to visit_id.

---

## 16. Dashboard Filter State

Dashboard filters should be URL state.

Filters:

```text
start_date
end_date
province_id
attraction_id
origin_country_id
origin_province_id
age_group
transport_mode_id
travel_purpose_id
```

Use query parameters.

Dashboard components should receive parsed filters.

Example:

```text
/admin/dashboard?start=2026-05-01&end=2026-05-31&province=1
```

---

## 17. Admin Table State

Admin tables should use URL state for:

```text
search
filters
page
sort
page_size
```

Example:

```text
/admin/attractions?search=skywalk&province=1&page=2
```

Local state can be used while typing before debounced URL update.

---

## 18. Language State

## 18.1 Sources

Language can come from:

```text
manual selection
browser language
stored preference
URL prefix future
```

MVP supported:

```text
th
en
```

## 18.2 Storage

Use:

```text
localStorage or cookie
```

Key:

```text
sbt_language
```

## 18.3 Rules

- allow manual switch.
- default from browser if no preference.
- do not break route if translation missing.
- fallback gracefully.

---

## 19. State Persistence Rules

## 19.1 Persist

Persist:

```text
guest token
language preference
non-sensitive flow session ID
dashboard URL filters through query string
admin URL filters through query string
```

## 19.2 Do Not Persist in Browser Storage

Do not persist:

```text
service role key
admin secret
LINE channel secret
email
LINE user ID
uploaded photo base64
private certificate URL if avoidable
raw personal profile data long-term
```

## 19.3 Persist in Database

Persist:

```text
tourist profile
tourist identity
visit
photo metadata
certificate record
stamp
survey answers
funnel events
```

---

## 20. State Reset Rules

## 20.1 Tourist Flow Completion

After successful certificate/stamp:

- keep guest identity.
- keep passport access.
- clear temporary upload/form state.
- preserve visit/certificate IDs if needed for success page.
- allow user to go to survey.

## 20.2 New QR Scan

When user scans a new QR:

- keep guest identity.
- create new session_id.
- replace current check-in context.
- do not overwrite passport data.
- create new visit only after form/profile step.

## 20.3 Logout

Admin logout:

- clear admin session.
- redirect to login.
- do not clear tourist guest token unless intentional.

---

## 21. Race Condition Prevention

Critical actions:

```text
create visit
upload photo
generate certificate
award stamp
submit survey
export data
```

Rules:

- disable button during submit.
- use server-side checks.
- use unique constraints.
- use idempotency where useful.
- handle duplicate errors gracefully.

---

## 22. Error State Management

Error state should be scoped.

Examples:

```text
QR error belongs to QR page.
Upload error belongs to upload card.
Dashboard chart error belongs to chart card.
Admin form error belongs to form.
```

Do not use one global error state for everything.

---

## 23. Loading State Management

Use local loading state for:

```text
button submit
file upload
certificate generation
export generation
```

Use route/loading UI for:

```text
page data fetching
dashboard loading
admin table loading
```

Avoid blank pages.

---

## 24. Optimistic Updates

Use optimistic updates carefully.

Good candidates:

```text
admin toggle publish status maybe
local survey step progress
UI tab selection
```

Bad candidates:

```text
certificate generation
photo upload
stamp award
export creation
```

Critical operations should confirm success from server.

---

## 25. Local Storage Keys

Recommended keys:

```text
sbt_guest_token
sbt_language
sbt_flow_session
sbt_flow_context
```

Keep values minimal.

Do not store raw tourist profile long-term unless explicitly approved.

---

## 26. Flow Context Example

Possible MVP flow context:

```json
{
  "sessionId": "random-session-id",
  "checkinCode": "YLA001",
  "checkinCodeId": 12,
  "attractionId": 5,
  "photoSpotId": 8,
  "language": "th"
}
```

After profile:

```json
{
  "sessionId": "random-session-id",
  "visitId": 501,
  "touristId": 1001,
  "photoId": null,
  "certificateId": null
}
```

If storing IDs in browser, access control must still be enforced server-side.

---

## 27. State Security Notes

Browser state can be modified by user.

Never trust:

```text
tourist_id from localStorage
visit_id from localStorage
role from localStorage
is_admin from localStorage
```

Always verify server-side.

---

## 28. Data Fetching and Mutations

Recommended pattern:

```text
read data through service/query functions
mutate data through server actions/API routes
validate input
return typed result
update UI state based on result
```

Mutation result should include:

```text
success
data
error
fieldErrors optional
```

---

## 29. Typed Result Pattern

Recommended result type:

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

This keeps UI error handling consistent.

---

## 30. State Management by Feature

## 30.1 QR Check-in

State:

```text
check-in code result
loading
error
session_id
language
```

Storage:

```text
server result + flow context
```

## 30.2 Tourist Profile

State:

```text
form values
returning profile
consent checked
submit loading
field errors
```

Storage:

```text
form state + database after submit
```

## 30.3 Visit

State:

```text
visit_id
completion_status
```

Storage:

```text
database primary
temporary flow context secondary
```

## 30.4 Photo Upload

State:

```text
selected file
preview URL
uploading
photo_id
error
```

Storage:

```text
component state + database after upload
```

## 30.5 Certificate

State:

```text
preview data
generating
certificate_id
download URL
error
```

Storage:

```text
component state + database/storage after generation
```

## 30.6 Passport

State:

```text
stamps
tourist summary
guest warning
save options
```

Storage:

```text
server data fetched by identity
```

## 30.7 Survey

State:

```text
current step
answers
submit loading
skip
```

Storage:

```text
component/form state until submit
database after submit
```

## 30.8 Admin CMS

State:

```text
filters
pagination
form data
modal state
selection
saving
```

Storage:

```text
URL query + form state + server data
```

## 30.9 Dashboard

State:

```text
filters
date range
selected province
selected attraction
loading per section
```

Storage:

```text
URL query + server data
```

---

## 31. When to Use Global Store

A global store may be considered only if:

```text
many unrelated components need same client-side state
state is not server data
state changes frequently
context causes performance problems
```

Possible use:

```text
language preference
toast system
temporary flow context
```

Avoid global store for:

```text
all attractions
all visits
dashboard raw data
admin role trust
photo files
```

---

## 32. Recommended No-Global-Store MVP

For MVP, avoid Zustand/Redux unless necessary.

Use:

```text
React state
URL state
server data
localStorage utility hooks
small context for flow/language if needed
```

This keeps complexity lower.

---

## 33. Testing State Behavior

Test:

```text
refresh during tourist flow
back button during flow
double submit profile
double click generate certificate
upload failure retry
returning guest recognition
dashboard filter persistence
admin table pagination URL
language switch persistence
logout behavior
```

---

## 34. Anti-Patterns

Do not:

```text
Put all app state in one global store.
Store secrets in localStorage.
Trust role from localStorage.
Store uploaded images as base64 in localStorage.
Create visit on every QR scan without intent.
Lose form data on validation error.
Allow duplicate submit by not disabling buttons.
Keep stale QR code status forever.
Aggregate dashboard data entirely in client state.
```

---

## 35. State Review Checklist

Before accepting a feature:

```text
[ ] State has a clear owner.
[ ] Server data is not unnecessarily duplicated.
[ ] URL state is used for filters.
[ ] Form state is validated.
[ ] Loading state exists.
[ ] Error state exists.
[ ] Sensitive data is not stored in browser.
[ ] Critical mutations are server-validated.
[ ] Double submission is prevented.
[ ] Refresh/back behavior is acceptable.
```

---

## 36. Final State Rule

State should make the user journey reliable.

If a tourist refreshes, goes back, retries upload, or scans another QR, the system should behave predictably and not corrupt the database.
