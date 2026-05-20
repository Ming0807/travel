# PRODUCT_REQUIREMENTS.md

## 1. Document Purpose

This document defines the product requirements for the **Southern Border Tourism Data & Intelligence Platform**.

It describes what the system must do, why each feature exists, and how the features support the project objective.

The system objective is:

> Build a high-quality tourism database and analytics platform for Yala, Pattani, and Narathiwat that supports sustainable tourism planning.

---

## 2. Product Objective

The product must collect, organize, and analyze tourist data in five core dimensions:

1. Tourist profile
2. Travel behavior
3. Attractions visited
4. Expenses
5. Satisfaction

The product must also provide an engagement mechanism that motivates tourists to participate without forcing them to complete long forms.

---

## 3. Product Principles

### 3.1 Data First

The core value of the system is data quality.

Every feature must support structured data collection, analysis, or planning.

### 3.2 Tourist-Friendly

Tourists should not feel that they are filling a long government form.

The tourist-facing flow must be short, mobile-first, and rewarding.

### 3.3 Progressive Data Collection

The system should ask only minimal required questions first.

Optional planning questions should be asked after the tourist receives value.

### 3.4 Privacy by Design

The system must avoid unnecessary personal data.

Data collection must be clear, purposeful, and limited.

### 3.5 Production-Oriented

The system must be designed as if it may be used by real tourists, staff, and administrators.

---

## 4. User Roles

### 4.1 Tourist

A tourist can:

- View attraction information
- Scan a QR code
- Create a digital certificate
- Upload a photo
- Receive a digital stamp
- Save a passport using guest, LINE, or email
- Answer optional survey questions

### 4.2 Returning Tourist

A returning tourist can:

- Use previously saved profile data
- Visit a new attraction
- Earn a new stamp
- Generate another certificate
- Continue a digital passport

### 4.3 Tourism Staff

Tourism staff can:

- Manage attractions
- Manage photo spots
- Manage media
- Review tourist visit records
- Export data
- View dashboards

### 4.4 Administrator

Administrators can:

- Manage users
- Manage roles and permissions
- Manage master data
- View audit logs
- Configure system settings
- Manage data exports

### 4.5 Researcher or Planner

Researchers and planners can:

- View dashboards
- Analyze tourism behavior
- Export aggregated data
- Use insights for planning and reporting

---

## 5. Functional Requirements

## FR-001: Public Attraction Listing

### Description

The system must provide a public page that lists tourism attractions.

### Requirements

- Show attraction name
- Show province
- Show district
- Show attraction type
- Show featured image
- Support filtering by province
- Support filtering by attraction type
- Support search by attraction name
- Support responsive mobile layout

### Data Used

- attractions
- provinces
- districts
- attraction_types
- attraction_images

### Priority

MVP

---

## FR-002: Public Attraction Detail Page

### Description

Each attraction must have a dynamic detail page.

### Requirements

- Show attraction name
- Show province and district
- Show attraction history
- Show description
- Show image gallery
- Show 360-degree media if available
- Show map location
- Show travel information
- Show photo spots
- Show call-to-action to create certificate
- Support Thai and English content structure

### Data Used

- attractions
- attraction_images
- attraction_360_media
- photo_spots
- provinces
- districts

### Priority

MVP

---

## FR-003: QR Check-in Code Resolution

### Description

Each QR code must resolve to a check-in route.

### Requirements

- Use one QR code per attraction or photo spot
- Do not create separate QR codes for LINE, guest, or foreign users
- Resolve check-in code to attraction
- Resolve check-in code to photo spot if applicable
- Track QR scan event
- Reject inactive or invalid check-in codes
- Support campaign tracking

### Suggested Route

```text
/c/[checkinCode]
```

### Data Used

- checkin_codes
- attractions
- photo_spots
- campaigns
- funnel_events

### Priority

MVP

---

## FR-004: Tourist Identity Detection

### Description

The system must identify whether the tourist is new or returning.

### Requirements

- Detect anonymous device identity
- Detect LINE identity if opened through LINE LIFF
- Support optional email identity
- Load existing tourist profile when available
- Create new tourist profile when no identity exists
- Support identity linking later
- Avoid duplicate tourist profiles when possible

### Data Used

- tourists
- tourist_identities

### Priority

MVP

---

## FR-005: Guest Mode

### Description

Tourists must be able to use the system without logging in.

### Requirements

- Create anonymous device token
- Store guest identity in a first-party browser/device mechanism such as signed cookie, first-party cookie, or local storage token
- Allow certificate creation without login
- Allow stamp creation for guest users
- Allow later linking to Google or LINE
- Clearly explain that guest passport may not be recoverable across devices
- Do not use IP address as the main tourist identity mechanism
- Use IP address only for security logs, abuse prevention, or aggregate system analytics

### Data Used

- tourists
- tourist_identities

### Priority

MVP

---

## FR-006: Optional LINE Identity

### Description

The system may support LINE for Thai users and returning visitors as an optional account-linking method.

### Requirements

- LINE must not be mandatory before certificate creation
- LINE should be offered after certificate reward or from passport screens as a save/passport option
- Support LINE LIFF flow if configured
- Link LINE user ID to tourist profile
- Allow returning LINE users to reuse profile data
- Use LINE as communication channel only when user consents
- Do not expose LINE user ID in public UI, dashboard, or default exports

### Data Used

- tourist_identities
- tourist_contacts
- consent_logs

### Priority

Phase 2

---

## FR-007: Optional Google / Future Email Identity

### Description

Google login can optionally support tourist profile, passport, and certificate history recovery across devices. Future email identity or magic link support may be added for users who prefer email.

### Requirements

- Google login must be optional for tourists
- Google can be used to save or recover profile, passport, and certificate history
- Google identity can be linked to an existing guest profile
- Future email magic link can be added for passport/certificate recovery
- Do not block certificate generation if Google or email is not provided
- Do not expose Google subject, email, provider_user_id, or internal IDs in public UI, dashboards, share URLs, or default exports

### Data Used

- tourist_identities
- tourist_contacts
- consent_logs

### Priority

Optional MVP / Phase 2

---

## FR-008: Minimal Tourist Form

### Description

The system must collect minimal data before certificate generation.

### Required Fields

- Display name / name to show on certificate
- Origin country or province
- Age group
- Consent confirmation
- Photo for certificate

### Requirements

- Use short fields
- Avoid long free-text questions
- Use dropdowns or chips where possible
- Show clear privacy notice
- Validate input before submission
- Store data in structured tables
- Allow nickname, alias, traveller name, or real name for display name
- Provide a fallback display name such as "นักเดินทาง" or "Southern Border Traveller"
- Do not require legal full name, national ID, passport number, phone number, email, LINE, Google login, full address, exact birthdate, income, or long survey before certificate

### Data Used

- tourists
- visits
- consent_logs

### Priority

MVP

---

## FR-009: Photo Upload

### Description

Tourists must be able to upload a photo for certificate generation.

### Requirements

- Support JPEG
- Support PNG
- Support WebP
- Validate file size
- Validate file type
- Show preview before submission
- Store uploaded photo in storage
- Store photo metadata in database
- Link photo to visit record
- Prepare for manual review workflow

### Data Used

- visit_photos
- visits
- storage bucket

### Priority

MVP

---

## FR-010: Digital Certificate Generation

### Description

The system must generate a digital certificate or travel memory card.

### Requirements

- Use tourist display name
- Use attraction name
- Use visit date
- Use uploaded photo
- Use selected or default template
- Generate image output
- Store certificate file
- Store certificate record
- Allow download
- Allow optional sharing after download is available
- Generate idempotently per visit unless explicit regeneration rules are defined
- Do not include email, phone, LINE ID, Google ID, national ID, internal tourist ID, internal visit ID, provider_user_id, guest token, or full address on the certificate

### Data Used

- certificates
- certificate_templates
- visit_photos
- visits
- attractions

### Priority

MVP

---

## FR-010A: Optional Certificate Sharing

### Description

After certificate download is available, the system may show an optional share bottom sheet or popup.

### Requirements

- Sharing must be optional and user-initiated
- Support Native Web Share API where available
- Provide fallback options such as Facebook Share, X Intent, Copy Link, and Save Image
- Treat Instagram primarily through downloaded image or the mobile share sheet
- Do not require Facebook, LINE, Google, email, or phone number to share or download
- Do not implement automatic social posting for MVP
- Do not put sensitive data on certificate share surfaces
- Future public certificate pages must use random public share tokens
- Public share URLs must not expose tourist_id, visit_id, provider_user_id, guest token, or private storage paths

### Data Used

- certificates
- share_events optional
- funnel_events optional

### Priority

Optional MVP / Phase 2

---

## FR-011: Digital Stamp

### Description

The system must assign a digital stamp when a tourist visits an attraction.

### Requirements

- Create stamp when eligible
- Link stamp to tourist
- Link stamp to attraction
- Link stamp to visit
- Prevent duplicate stamp for the same tourist and attraction unless business rules allow otherwise
- Allow multiple visits while keeping one earned stamp
- Show stamp in passport

### Data Used

- tourist_stamps
- stamp_definitions
- tourists
- visits
- attractions

### Priority

MVP

---

## FR-012: Digital Passport

### Description

Tourists should have a digital passport showing earned stamps.

### Requirements

- Show tourist display name
- Show earned stamps
- Show province progress
- Show attraction progress
- Show certificates if available
- Work for guest users on same device
- Support cross-device recovery when the tourist optionally links Google or LINE
- Encourage repeat visits
- Do not require Google or LINE for stamp earning
- Do not expose internal IDs or provider identifiers in the passport UI

### Data Used

- tourists
- tourist_stamps
- certificates
- attractions
- provinces

### Priority

Phase 2

---

## FR-013: Optional Travel Behavior Survey

### Description

After receiving the certificate, tourists should be asked optional travel behavior questions.

### Suggested Questions

- Travel companion
- Group size
- Transport mode
- Overnight status
- Number of nights
- Travel purpose
- Spending range
- Expense categories
- Safety, cleanliness, accessibility, information/signage, and value ratings
- Revisit intention
- Recommendation intention
- Optional comment

### Requirements

- Must be optional and shown after certificate reward
- Use quick selection UI
- Save structured data
- Link to visit record
- Allow skip
- Skipping survey must not remove certificate, stamp, visit, or passport progress

### Data Used

- visits
- travel_companions
- transport_modes
- travel_purposes

### Priority

MVP

---

## FR-014: Expense Collection

### Description

The system should collect approximate spending information.

### Requirements

- Use spending ranges for MVP
- Allow category-level expense if possible
- Do not require exact amount from tourists
- Link expenses to visit
- Support categories such as food, accommodation, transport, shopping, souvenir, activity, and other

### Data Used

- visit_expenses
- expense_categories
- visits

### Priority

MVP

---

## FR-015: Satisfaction Collection

### Description

The system must collect satisfaction data for tourism planning.

### Requirements

- Collect overall score
- Collect optional category scores
- Support 1 to 5 rating scale
- Ask revisit intention
- Ask recommendation intention
- Allow optional comment
- Link satisfaction to visit and attraction

### Data Used

- satisfaction_surveys
- survey_answers
- visits
- attractions

### Priority

MVP

---

## FR-016: Admin Authentication

### Description

Admin users must log in before accessing the back office.

### Requirements

- Support authenticated admin users
- Restrict admin pages
- Use role-based permissions
- Do not expose admin APIs to anonymous users
- Support logout
- Use a real authentication method such as Google/Gmail where configured
- Keep admin authentication separate from tourist guest mode and optional tourist account linking

### Data Used

- users
- roles
- permissions
- user_roles

### Priority

MVP

---

## FR-017: Attraction Management

### Description

Admin users must manage attraction records.

### Requirements

- Create attraction
- Edit attraction
- Archive or deactivate attraction
- Manage province and district
- Manage attraction type
- Manage description and history
- Manage coordinates
- Manage status
- Manage publish status
- Upload attraction images

### Data Used

- attractions
- attraction_images
- provinces
- districts
- attraction_types

### Priority

MVP

---

## FR-018: Photo Spot Management

### Description

Admin users must manage photo spots connected to attractions.

### Requirements

- Create photo spot
- Edit photo spot
- Assign photo spot to attraction
- Generate or assign check-in code
- Activate or deactivate photo spot
- Show QR code
- Track scan count

### Data Used

- photo_spots
- checkin_codes
- attractions
- funnel_events

### Priority

MVP

---

## FR-019: 360-Degree Media Management

### Description

Admin users must be able to attach 360-degree media to attractions.

### Requirements

- Add 360 media URL or file reference
- Assign media to attraction
- Set display order
- Activate or deactivate media
- Show on public attraction page

### Data Used

- attraction_360_media
- attractions

### Priority

Phase 2

---

## FR-020: Certificate Template Management

### Description

Admin users should manage certificate templates.

### Requirements

- Create template
- Edit template metadata
- Upload background image
- Configure layout using JSON
- Assign template to attraction or campaign
- Preview template
- Activate or deactivate template

### Data Used

- certificate_templates
- attractions
- campaigns

### Priority

Phase 2

---

## FR-021: Visit Record Management

### Description

Admin users must view and filter visit records.

### Requirements

- List visits
- Filter by province
- Filter by attraction
- Filter by date range
- Filter by tourist origin
- Filter by completion status
- View visit detail
- View related certificate
- View related survey answers
- Export filtered data

### Data Used

- visits
- tourists
- attractions
- certificates
- satisfaction_surveys
- visit_expenses

### Priority

MVP

---

## FR-022: Dashboard - Executive Overview

### Description

The system must provide a dashboard for high-level tourism monitoring.

### Metrics

- Tourist profiles
- Total visits
- Total certificates generated
- Total stamps earned
- Survey completion rate
- Average satisfaction
- Estimated spending
- Top attractions
- Province comparison

### Priority

MVP

---

## FR-023: Dashboard - Tourist Profile

### Description

The dashboard must analyze tourist profile data.

### Metrics

- Origin country
- Origin province
- Age group distribution
- Preferred language
- New vs returning tourists
- Guest vs Google-linked vs LINE-linked tourists

### Priority

MVP

---

## FR-024: Dashboard - Travel Behavior

### Description

The dashboard must analyze how tourists travel.

### Metrics

- Travel companion
- Group size
- Transport mode
- Overnight status
- Number of nights
- Travel purpose
- Visit frequency

### Priority

MVP

---

## FR-025: Dashboard - Expense Analysis

### Description

The dashboard must analyze approximate tourist spending.

### Metrics

- Spending range distribution
- Expense by category
- Estimated total spending
- Estimated average spending per visit
- Spending by province
- Spending by attraction

### Priority

MVP

---

## FR-026: Dashboard - Satisfaction Analysis

### Description

The dashboard must analyze tourist satisfaction.

### Metrics

- Overall satisfaction
- Safety score
- Cleanliness score
- Transport convenience score
- Information/signage score
- Service score
- Value for money score
- Revisit intention
- Recommendation intention
- Frequent problem themes

### Priority

MVP

---

## FR-027: Dashboard - Sustainable Tourism Indicators

### Description

The dashboard should support sustainable tourism planning.

### Metrics

- Attraction concentration
- Under-visited attractions
- High-satisfaction attractions
- Low-satisfaction attractions
- Community-based attraction visits
- Spending distribution
- Overnight stay ratio
- Revisit intention
- Recommendation intention
- Problem categories by attraction

### Priority

Phase 2

---

## FR-028: Funnel Analytics

### Description

The system should track user flow completion.

### Funnel Events

- qr_scanned
- landing_viewed
- certificate_started
- photo_uploaded
- minimal_form_completed
- certificate_generated
- survey_started
- survey_completed
- passport_saved

### Purpose

This helps answer:

> Where do tourists drop out of the data collection flow?

### Data Used

- funnel_events

### Priority

MVP

---

## FR-029: Data Export

### Description

Authorized users must export data for reports.

### Requirements

- Export tourist data in safe format
- Export visit records
- Export survey data
- Export dashboard summary
- Support CSV or Excel
- Respect permissions
- Log export action

### Data Used

- visits
- tourists
- survey_answers
- visit_expenses
- audit_logs

### Priority

MVP

---

## FR-030: Audit Logging

### Description

Important admin actions must be logged.

### Requirements

Log actions such as:

- Create attraction
- Edit attraction
- Deactivate attraction
- Export data
- Change user role
- Review photo
- Change system setting

### Data Used

- audit_logs

### Priority

MVP

---

## FR-031: Consent Management

### Description

The system must record consent when collecting tourist data.

### Requirements

- Show consent notice before data submission
- Store consent version
- Store consent timestamp
- Store purpose of data use
- Link consent to tourist or visit
- Allow future policy updates

### Data Used

- consent_logs
- privacy_notices

### Priority

MVP

---

## FR-032: Official Data Integration Design

### Description

The system should be designed to integrate official tourism statistics and attraction references in the future.

### Requirements

- Store official tourism statistics by province/month/year
- Store official attraction reference IDs if available
- Track import source
- Track import date
- Track import status
- Compare local collected data with official statistics in future dashboard

### Data Used

- official_tourism_stats
- official_attraction_refs
- data_import_logs

### Priority

Phase 2

---

## 6. Non-Functional Requirements

## NFR-001: Performance

The system must load quickly on mobile devices.

Requirements:

- Optimize images
- Use lazy loading
- Use pagination
- Avoid large initial bundle
- Use indexes for common queries
- Use dashboard summary tables when data grows

---

## NFR-002: Security

The system must protect data and administrative features.

Requirements:

- No secrets in frontend code
- Use environment variables
- Restrict admin routes
- Validate all input
- Validate file uploads
- Use role-based access control
- Use Supabase RLS where appropriate
- Log important actions

---

## NFR-003: Privacy

The system must minimize personal data.

Requirements:

- Do not collect national ID
- Do not collect full home address
- Do not require legal name
- Do not force email or LINE
- Do not force GPS
- Store consent records
- Use aggregated dashboard data where possible

---

## NFR-004: Usability

Tourist-facing pages must be easy to use.

Requirements:

- Mobile-first
- Short forms
- Clear call-to-action
- Friendly wording
- Thai and English support
- Large touch targets
- Clear progress indicator
- Skip option for optional survey

---

## NFR-005: Accessibility

The system should be accessible.

Requirements:

- Use semantic HTML
- Provide image alt text
- Ensure sufficient contrast
- Support keyboard navigation where possible
- Use clear labels
- Avoid relying only on color

---

## NFR-006: Maintainability

The codebase must be easy to maintain.

Requirements:

- Clear folder structure
- TypeScript types
- Reusable components
- Shared validation schemas
- Clear service boundaries
- Documentation updated with changes

---

## NFR-007: Scalability

The system should support future growth.

Requirements:

- Separate tourist from visits
- Separate visits from stamps
- Separate certificates from photos
- Use summary tables for analytics
- Use storage bucket for files
- Avoid single-table design
- Design for future backend service separation

---

## NFR-008: Reliability

The system should handle common failures.

Requirements:

- Show clear error messages
- Retry safe operations when appropriate
- Avoid data loss during photo upload
- Prevent duplicate submissions where possible
- Handle invalid QR codes
- Handle inactive attractions
- Handle missing template gracefully

---

## 7. MVP Feature Priority

### Must Have

- Public attraction list
- Attraction detail page
- QR check-in route
- Guest mode
- Minimal tourist form
- Photo upload
- Certificate generation
- Tourist profile storage
- Visit record storage
- Digital stamp storage
- Optional travel behavior survey
- Expense range collection
- Satisfaction score collection
- Admin attraction management
- Admin photo spot management
- Basic dashboard
- Data export
- Consent logging

### Should Have

- Digital passport
- Optional Google tourist account linking
- LINE LIFF identity
- Future email magic link identity
- Certificate template management
- 360 media management
- Funnel analytics dashboard
- Role permission matrix
- Audit log viewer

### Could Have

- Advanced dashboard filters
- Share card generation
- Multi-language Malay support
- Campaign module
- Official data comparison

### Will Not Have in MVP

- NFC
- Native mobile app
- Blockchain
- AI recommendation
- Forced GPS
- Full coupon system
- Automated AI image moderation

---

## 8. Acceptance Criteria Summary

The MVP is acceptable when:

1. A tourist can scan a QR code and open the correct attraction check-in page.
2. A tourist can continue without LINE, Google, email, or phone number.
3. A tourist can upload a photo.
4. A tourist can fill minimal required data using display name, origin, age group, consent, and photo.
5. A tourist can generate a certificate.
6. A visit record is stored correctly.
7. A digital stamp is assigned correctly.
8. A returning tourist on the same device can reuse saved profile data.
9. A tourist can answer optional survey questions.
10. Expense and satisfaction data are stored.
11. Admin can manage attractions and photo spots.
12. Dashboard shows useful metrics from stored data.
13. Admin can export data.
14. Consent is logged.
15. The system does not require unnecessary personal data.
16. Certificate download is not blocked by survey, social sharing, Google, LINE, email, or phone number.
