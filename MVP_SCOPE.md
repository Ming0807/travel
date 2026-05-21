# MVP_SCOPE.md

## 1. Document Purpose

This document defines the MVP scope for the **Southern Border Tourism Data & Intelligence Platform**.

The MVP must prove the core product loop:

```text
Attraction Content
    |
QR Landing
    |
Minimal Tourist Data Collection
    |
Photo Upload
    |
Digital Certificate
    |
Digital Stamp
    |
Optional Sharing
    |
Visit Record
    |
Optional Survey
    |
Dashboard
```

The MVP is not the final production system. It is the smallest serious version that proves the platform can collect useful tourism data and turn it into planning insights.

---

## 2. MVP Objective

The MVP must demonstrate that the system can:

1. Present dynamic tourism attraction information.
2. Let a tourist enter through a QR code.
3. Collect minimal tourist profile data.
4. Record attraction visits.
5. Upload a tourist photo.
6. Generate a digital certificate.
7. Assign a digital stamp.
8. Collect optional travel, expense, and satisfaction data.
9. Show dashboard metrics.
10. Export useful data for academic and planning purposes.

The MVP must stay focused on the original project goal:

> Build a tourism database for the southern border provinces that supports sustainable tourism planning.

---

## 3. MVP Success Definition

The MVP is successful when a complete demo can show this flow:

```text
Admin creates attraction
    |
Admin creates photo spot and QR code
    |
Tourist scans QR code
    |
Tourist sees location-specific QR landing page with attraction/photo spot context
    |
Tourist fills short minimal form
    |
Tourist uploads photo
    |
System creates tourist profile
    |
System creates visit record
    |
System generates certificate
    |
System assigns digital stamp
    |
Tourist optionally answers survey
    |
Dashboard displays collected data
    |
Admin exports report data
```

If this flow works reliably, the MVP is acceptable.

The QR landing page must show the reward before asking for data. It should include attraction context, certificate preview, a privacy/trust cue, and a clear CTA such as "Create my certificate". It must not open a long form or survey immediately.

---

## 4. MVP User Roles

The MVP should include these roles.

### 4.1 Guest Tourist

A guest tourist can:

- Open a QR link
- View attraction detail
- Upload photo
- Fill minimal form
- Generate certificate
- Receive stamp
- Answer optional survey
- Continue without login

### 4.2 Returning Guest Tourist

A returning guest tourist can:

- Use saved profile data on the same device
- Visit another attraction
- Generate another certificate
- Earn another stamp

### 4.3 Admin

An admin can:

- Log in
- Manage attractions
- Manage photo spots
- View visits
- View tourist records
- View dashboard
- Export data

### 4.4 Viewer or Researcher

A viewer or researcher can:

- View dashboard
- Export allowed data if permitted

For MVP, viewer role can be simplified if role-based access is not fully implemented yet.

---

## 5. MVP Core Data Dimensions

The MVP must collect data in all five core dimensions.

| Dimension | MVP Data |
|---|---|
| Tourist | display name, origin country/province, age group, preferred language |
| Travel Behavior | visit date, travel companion, group size, transport mode, overnight status |
| Attractions Visited | province, attraction, photo spot, QR/check-in code |
| Expenses | spending range, expense category if possible |
| Satisfaction | overall rating, revisit intention, recommendation intention, optional comment |

The MVP does not need deep analytics yet, but the database must be structured so future analytics are possible.

---

## 6. MVP Feature List

## MVP-001: Public Attraction List

### Description

The system must provide a public list of attractions.

### Required Capabilities

- Show published attractions
- Show attraction name
- Show province
- Show district
- Show attraction type
- Show image
- Filter by province
- Search by attraction name
- Open attraction detail page

### Acceptance Criteria

- User can open the attraction list page.
- User can see at least one attraction.
- User can filter attractions by province.
- User can open attraction detail page.

### Priority

Must Have

---

## MVP-002: Public Attraction Detail Page

### Description

The system must show a dynamic attraction detail page.

### Required Capabilities

- Attraction name
- Province
- District
- Description
- History
- Image gallery
- Map coordinates
- Photo spots
- Certificate call-to-action
- Optional 360 media placeholder

### Acceptance Criteria

- Attraction content is loaded from database.
- Page works on mobile.
- Certificate entry point is visible.
- If no 360 media exists, page does not break.

### Priority

Must Have

---

## MVP-003: QR Check-in Route

### Description

The system must support one QR route per photo spot or attraction.

### Route Pattern

```text
/c/[checkinCode]
```

### Required Capabilities

- Resolve check-in code
- Find attraction
- Find photo spot if available
- Track QR scan event
- Show invalid QR page when code is invalid
- Show inactive QR page when code is inactive

### Acceptance Criteria

- Valid check-in code opens correct attraction flow.
- Invalid check-in code shows friendly error.
- Inactive code cannot create visit.
- Funnel event is recorded.

### Priority

Must Have

---

## MVP-004: Guest Tourist Identity

### Description

The system must allow tourists to continue without login.

### Required Capabilities

- Create anonymous device ID
- Store it in browser
- Create or retrieve tourist profile
- Support returning guest on same device
- Do not require LINE, Google, email, or phone number
- Do not use IP address as the main tourist identity mechanism
- Allow future linking of the guest Tourist Profile to Google or LINE

### Acceptance Criteria

- First-time guest can create certificate.
- Returning guest on same device can reuse saved profile.
- System does not create duplicate profile for the same guest token.
- User can continue if no LINE account exists.
- User can continue if no Google account exists.
- Guest passport limitation is explained: same browser/device unless account is linked.

### Priority

Must Have

---

## MVP-005: Minimal Tourist Form

### Description

The system must collect minimal required data.

### Required Fields

- Display name / name to show on certificate
- Origin country or province
- Age group
- Consent confirmation
- Photo for certificate

### Required Capabilities

- Validate required fields
- Use dropdowns or selectable options
- Use short and friendly labels
- Store data in correct tables
- Avoid unnecessary personal data
- Allow nickname, alias, traveller name, or real name
- Do not ask for legal full name, national ID, passport number, phone, email, LINE, Google, full address, exact birthdate, income, or long survey before certificate

### Acceptance Criteria

- Form can be completed in less than one minute.
- User cannot submit invalid required data.
- Consent record is stored.
- Tourist profile is created or updated.

### Priority

Must Have

---

## MVP-006: Photo Upload

### Description

The tourist must upload a photo for certificate generation.

### Required Capabilities

- Accept JPEG
- Accept PNG
- Accept WebP
- Validate file size
- Show preview
- Upload to storage
- Store metadata
- Link photo to visit

### Acceptance Criteria

- Valid image can be uploaded.
- Invalid file type is rejected.
- Large file is rejected based on configured limit.
- Photo is linked to the correct visit.

### Priority

Must Have

---

## MVP-007: Visit Record Creation

### Description

The system must create a visit record for each check-in participation.

### Required Capabilities

- Link visit to tourist
- Link visit to attraction
- Link visit to photo spot if available
- Store visit date
- Store source check-in code
- Store campaign if available
- Store completion status

### Acceptance Criteria

- Visit record exists after successful certificate flow.
- Visit links to correct tourist and attraction.
- Returning tourist creates a new visit, not a new profile.
- Admin can view visit record.

### Priority

Must Have

---

## MVP-008: Digital Certificate Generation

### Description

The system must generate a digital certificate or memory card.

### Required Capabilities

- Use uploaded photo
- Use tourist display name
- Use attraction name
- Use visit date
- Use default certificate template
- Generate downloadable image
- Store certificate record

### Acceptance Criteria

- Certificate preview is shown.
- Certificate can be downloaded.
- Certificate record is linked to visit.
- Certificate generation does not break if optional data is missing.

### Priority

Must Have

---

## MVP-009: Digital Stamp Assignment

### Description

The system must assign a stamp when a tourist completes a valid visit.

### Required Capabilities

- Assign stamp to tourist
- Link stamp to attraction
- Link stamp to visit
- Avoid duplicate attraction stamp for same tourist
- Allow multiple visits to same attraction

### Acceptance Criteria

- New attraction visit earns a stamp.
- Second visit to same attraction creates a visit but does not duplicate stamp.
- Stamp appears in tourist passport or basic stamp view.

### Priority

Must Have

---

## MVP-010: Optional Travel Behavior Survey

### Description

The system must ask optional travel behavior questions after certificate generation.

### Required Capabilities

- Travel companion
- Group size
- Transport mode
- Overnight status
- Travel purpose
- Allow skip

### Acceptance Criteria

- User can submit survey.
- User can skip survey.
- Submitted data is linked to visit.
- Skipping survey does not remove certificate or visit.

### Priority

Must Have

---

## MVP-011: Expense Range Collection

### Description

The system must collect approximate spending data.

### Required Capabilities

- Spending range
- Optional category selection
- Link to visit
- Use structured values

### Example Spending Ranges

```text
0 - 500 THB
501 - 1,000 THB
1,001 - 2,000 THB
2,001 - 5,000 THB
More than 5,000 THB
Prefer not to answer
```

### Acceptance Criteria

- User can select spending range.
- User can choose not to answer.
- Data is available in dashboard.

### Priority

Must Have

---

## MVP-012: Satisfaction Collection

### Description

The system must collect satisfaction data.

### Required Capabilities

- Overall score from 1 to 5
- Revisit intention
- Recommendation intention
- Optional comment
- Allow skip if required by UX decision

### Acceptance Criteria

- Rating is stored correctly.
- Invalid score cannot be submitted.
- Satisfaction data links to visit and attraction.
- Dashboard can display average satisfaction.

### Priority

Must Have

---

## MVP-013: Admin Authentication

### Description

Admin users must log in to access back office.

### Required Capabilities

- Admin login
- Admin logout
- Protected admin routes
- Basic role field or permission mechanism

### Acceptance Criteria

- Anonymous users cannot access admin pages.
- Admin can access dashboard after login.
- Logout works.

### Priority

Must Have

---

## MVP-014: Admin Attraction Management

### Description

Admin users must manage attractions.

### Required Capabilities

- Create attraction
- Edit attraction
- Deactivate attraction
- Manage province
- Manage district
- Manage type
- Manage description/history
- Manage image
- Manage coordinates

### Acceptance Criteria

- Admin can create attraction.
- Admin can update attraction.
- Deactivated attraction does not appear publicly.
- Attraction data appears on public page.

### Priority

Must Have

---

## MVP-015: Admin Photo Spot and QR Management

### Description

Admin users must manage photo spots and check-in codes.

### Required Capabilities

- Create photo spot
- Assign to attraction
- Generate or input check-in code
- Activate/deactivate check-in code
- Display QR URL
- Track scan count or event count

### Acceptance Criteria

- Admin can create photo spot.
- QR route resolves to correct photo spot.
- Inactive QR cannot be used.
- Photo spot appears on attraction detail page.

### Priority

Must Have

---

## MVP-016: Admin Visit Records

### Description

Admin users must view visit records.

### Required Capabilities

- Visit list
- Search
- Filter by date range
- Filter by province
- Filter by attraction
- Filter by origin
- View visit detail
- View certificate link
- View survey data

### Acceptance Criteria

- Admin can view visits.
- Filters work.
- Visit detail shows linked tourist, attraction, certificate, and survey data.
- List uses pagination.

### Priority

Must Have

---

## MVP-017: Basic Dashboard

### Description

The MVP must include a dashboard with useful metrics.

### Required Metrics

- Tourist profiles
- Total visits
- Total certificates
- Total stamps
- Visits by province
- Visits by attraction
- Origin distribution
- Age group distribution
- Average satisfaction
- Spending range distribution
- Survey completion rate

### Acceptance Criteria

- Dashboard loads successfully.
- Metrics are calculated from database records.
- Filters by date and province are available if feasible.
- Charts support decision-making.

### Priority

Must Have

---

## MVP-018: Data Export

### Description

Admin must export data for reports.

### Required Capabilities

- Export visits
- Export survey data
- Export expense data
- Export satisfaction data
- Export as CSV at minimum
- Log export action if audit log exists

### Acceptance Criteria

- Admin can download CSV.
- Export respects filters if implemented.
- Export does not expose unnecessary sensitive data.

### Priority

Must Have

---

## MVP-019: Consent Logging

### Description

The system must record tourist consent.

### Required Capabilities

- Show short consent notice
- Store consent status
- Store consent version
- Store timestamp
- Link consent to tourist or visit

### Acceptance Criteria

- Tourist cannot submit required form without consent.
- Consent record exists after submission.
- Admin can verify consent exists.

### Priority

Must Have

---

## MVP-020: Funnel Event Tracking

### Description

The system must track basic flow events.

### Required Events

- qr_scanned
- landing_viewed
- certificate_started
- photo_uploaded
- minimal_form_completed
- certificate_generated
- survey_started
- survey_completed
- passport_saved

### Acceptance Criteria

- Events are recorded with timestamp.
- Events link to session or tourist when possible.
- Dashboard can show basic completion rate.

### Priority

Should Have for MVP

---

## 7. MVP Technical Boundaries

### 7.1 Recommended MVP Stack

```text
Next.js
TypeScript
Tailwind CSS
Supabase PostgreSQL
Cloudinary-first storage adapter for development/Vercel, with Supabase Storage fallback and future university-server storage
Supabase Auth for admin
Guest token for tourists
```

### 7.2 Backend Boundary

For MVP, the backend can be implemented with:

```text
Next.js API routes / server actions
```

The code should still be structured so it can move to NestJS later.

### 7.3 Database Boundary

The database must not be designed as a single table.

At minimum, separate:

```text
tourists
tourist_identities
attractions
photo_spots
checkin_codes
visits
visit_photos
certificates
tourist_stamps
survey_responses
visit_expenses
satisfaction_surveys
```

---

## 8. MVP Exclusions

The following features are not part of MVP.

## 8.1 NFC

Reason:

- Requires budget
- Requires physical tags
- QR is enough for MVP

## 8.2 Native Mobile App

Reason:

- PWA is enough
- Native app increases cost and complexity

## 8.3 Blockchain or NFT

Reason:

- Does not directly support the academic database objective
- Adds unnecessary complexity

## 8.4 Full LINE Automation

Reason:

- LINE should be optional
- Basic LINE LIFF can be added later

## 8.4.1 Mandatory Tourist Google Login

Reason:

- Google should be optional for tourists.
- Guest mode is required for low-friction QR participation.
- Google linking is useful for cross-device profile, passport, and certificate history recovery after the tourist receives value.

## 8.5 AI Recommendation

Reason:

- Requires enough data first
- Not required to prove core database value

## 8.6 Forced GPS Verification

Reason:

- Privacy friction
- User may reject permission
- QR is enough for location context

## 8.7 Coupon Partner System

Reason:

- Requires business partners
- Can be planned later

---

## 9. MVP Data Collection Rules

### 9.1 Required Before Certificate

Collect only:

- Display name
- Origin
- Age group
- Visit date
- Consent

### 9.2 Optional After Certificate

Ask:

- Travel companion
- Group size
- Transport mode
- Overnight status
- Spending range
- Satisfaction
- Revisit intention
- Recommendation intention

### 9.3 Never Require in MVP

Do not require:

- Full legal name
- National ID
- Full address
- Phone number
- Email
- LINE login
- Google login
- Exact income
- Sensitive personal data
- GPS permission

---

## 10. MVP Dashboard Scope

The MVP dashboard should focus on practical planning.

### Executive Cards

- Tourist profiles
- Total visits
- Total certificates
- Average satisfaction
- Survey completion rate
- Estimated spending group

### Charts

- Visits by province
- Visits by attraction
- Tourist origin distribution
- Age group distribution
- Spending range distribution
- Satisfaction score distribution
- Funnel completion

### Filters

At minimum:

- Date range
- Province
- Attraction

---

## 11. MVP Admin Scope

Admin should not be overbuilt in MVP.

### Must Include

- Login
- Attraction CRUD
- Photo spot CRUD
- Visit list
- Basic dashboard
- Export

### Can Delay

- Advanced role permission matrix
- Complex certificate template editor
- Media library system
- User invitation flow
- Audit log UI
- Advanced import tools

---

## 12. MVP Acceptance Checklist

The MVP is complete only when all items below are true.

```text
[ ] Public attraction list works
[ ] Attraction detail page works
[ ] QR check-in route resolves correctly
[ ] Invalid QR route is handled
[ ] Guest tourist can continue without login
[ ] Minimal tourist form works
[ ] Consent is logged
[ ] Photo upload works
[ ] Visit record is created
[ ] Certificate is generated
[ ] Certificate can be downloaded
[ ] Digital stamp is assigned
[ ] Returning guest can reuse profile on same device
[ ] Optional survey can be submitted
[ ] Expense range can be submitted
[ ] Satisfaction score can be submitted
[ ] Admin login works
[ ] Admin can create/edit/deactivate attraction
[ ] Admin can create/edit/deactivate photo spot
[ ] Admin can view visit records
[ ] Dashboard shows real metrics
[ ] Data export works
[ ] Mobile layout is usable
[ ] Basic privacy rules are followed
```

---

## 13. MVP Demo Script

Use this script for presentation.

### Step 1: Admin Setup

1. Admin logs in.
2. Admin creates attraction.
3. Admin creates photo spot.
4. Admin gets QR/check-in URL.

### Step 2: Tourist Flow

1. Tourist scans QR code.
2. Tourist views attraction information.
3. Tourist uploads photo.
4. Tourist enters minimal data.
5. Tourist confirms consent.
6. System creates certificate.
7. Tourist downloads certificate.
8. System assigns digital stamp.
9. Tourist answers optional survey.

### Step 3: Admin Analysis

1. Admin opens dashboard.
2. Admin sees new visit.
3. Admin sees satisfaction and expense data.
4. Admin exports CSV.
5. Admin explains how the data supports tourism planning.

---

## 14. MVP Risks

### Risk 1: Tourist form is too long

Mitigation:

- Keep required form short.
- Ask optional questions after certificate.

### Risk 2: Certificate generation is technically difficult

Mitigation:

- Start with simple HTML/CSS to PNG rendering.
- Use one default template first.

### Risk 3: Dashboard query is slow

Mitigation:

- Use indexes.
- Use simple aggregated queries first.
- Add summary tables later.

### Risk 4: Duplicate tourist profiles

Mitigation:

- Use guest device token.
- Add identity table.
- Link future Google/LINE identity to existing tourist.

### Risk 5: Privacy concerns

Mitigation:

- Avoid unnecessary personal data.
- Add consent log.
- Use display name instead of legal name.
- Keep tourist photos and certificate files private unless the tourist explicitly shares.
- Do not expose guest token, provider_user_id, internal tourist ID, internal visit ID, or private storage path in public UI, dashboard, or default export.

---

## 15. MVP Final Rule

Do not add features that do not help prove the main loop.

The MVP must stay focused on:

```text
Collect tourist data
Generate incentive
Store structured records
Analyze dashboard
Support planning
```
