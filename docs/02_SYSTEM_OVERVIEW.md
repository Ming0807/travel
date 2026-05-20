# 02_SYSTEM_OVERVIEW.md

## 1. Purpose

This document provides a formal overview of the **Southern Border Tourism Data & Intelligence Platform**.

It explains the system structure, main actors, major workflows, data lifecycle, module boundaries, and technical direction.

This file should be read before implementing any major feature.

---

## 2. System Summary

The system is a tourism data collection and analytics platform for Thailand's southern border provinces:

- Yala
- Pattani
- Narathiwat

The platform helps collect structured tourist data through a friendly mobile-first experience.

Tourists enter the system by scanning a QR code at an attraction or photo spot. They can upload a travel photo, create a digital certificate, receive a digital stamp, and optionally answer short survey questions.

The collected data is stored in a relational database and used to build dashboards for sustainable tourism planning.

---

## 3. Core Mission

The core mission is:

> Build a high-quality local tourism database that supports sustainable tourism planning and decision-making.

The system must collect and analyze five major dimensions:

1. Tourist profile
2. Travel behavior
3. Attractions visited
4. Expenses
5. Satisfaction

Every module must support one or more of these dimensions.

---

## 4. System Positioning

This project should not be described only as:

```text
A QR check-in system
A certificate generator
A tourism website
A photo upload app
A survey form
```

It should be described as:

```text
A tourism data and intelligence platform that uses QR, PWA, certificate, and digital stamp features as engagement mechanisms for structured data collection.
```

The certificate and digital stamp features are important, but they are not the main purpose.

They exist to encourage participation.

---

## 5. Main System Layers

The system consists of four major layers.

```text
Presentation Layer
    Public tourism website
    Tourist PWA flow
    Admin dashboard
    Analytics dashboard

Engagement Layer
    QR code
    Photo upload
    Digital certificate
    Digital stamp
    Digital passport
    Guest identity
    Optional LINE identity
    Optional email identity

Data Layer
    Tourist database
    Attraction database
    Visit records
    Expense records
    Satisfaction records
    Consent logs
    Analytics tables

Intelligence Layer
    Dashboard metrics
    Reports
    Export
    Sustainable tourism indicators
    Funnel analytics
```

---

## 6. Main Actors

## 6.1 Guest Tourist

A guest tourist uses the system without login.

Capabilities:

- Scan QR code
- View attraction information
- Upload photo
- Fill minimal data
- Generate certificate
- Receive digital stamp
- Answer optional survey
- Continue without LINE or email

Guest identity is stored using an anonymous device token.

---

## 6.2 Returning Tourist

A returning tourist has used the system before.

Recognition methods:

- Anonymous device token
- LINE identity
- Email identity
- Future optional Google identity

Capabilities:

- Reuse saved profile data
- Visit another attraction
- Earn new stamp
- Generate another certificate
- Continue passport progress

---

## 6.3 Foreign Tourist

A foreign tourist may not use LINE.

The system must support:

- English UI
- Guest mode
- Optional email saving
- Country-based origin data
- No forced Thai-only flow
- No required LINE login

---

## 6.4 Tourism Staff

Tourism staff manage operational tourism content.

Capabilities:

- Manage attractions
- Manage photo spots
- Manage QR/check-in codes
- Manage attraction images
- Manage 360 media
- View visits
- Review submitted data
- Export reports

---

## 6.5 Administrator

Administrators manage the system.

Capabilities:

- Manage users
- Manage roles
- Manage permissions
- Manage master data
- View audit logs
- Configure system settings
- Manage exports
- Review security and privacy settings

---

## 6.6 Researcher or Planner

Researchers and planners use data for analysis.

Capabilities:

- View dashboards
- Filter data
- Analyze tourism patterns
- Export aggregated reports
- Support planning decisions

---

## 7. High-Level System Workflow

## 7.1 Tourist Data Collection Workflow

```text
Tourist scans QR code
    |
System resolves check-in code
    |
System loads attraction and photo spot
    |
System detects identity context
    |
Tourist continues as guest, LINE, or email
    |
Tourist uploads photo
    |
Tourist fills minimal form
    |
System records consent
    |
System creates or updates tourist profile
    |
System creates visit record
    |
System generates certificate
    |
System assigns digital stamp
    |
Tourist optionally answers survey
    |
Dashboard data becomes available
```

---

## 7.2 Admin Content Management Workflow

```text
Admin logs in
    |
Admin creates or edits attraction
    |
Admin adds images, history, and location
    |
Admin creates photo spot
    |
System generates check-in code
    |
Admin prints or displays QR code
    |
Tourists scan QR code at the location
```

---

## 7.3 Dashboard Workflow

```text
Tourist data is collected
    |
Visit, expense, and satisfaction records are stored
    |
Dashboard queries aggregate data
    |
Admin or planner filters by date, province, or attraction
    |
System displays metrics and charts
    |
Planner uses insights for tourism planning
```

---

## 8. Core Data Lifecycle

## 8.1 Attraction Setup

Attraction data is created by admin users.

Data includes:

- Name
- Province
- District
- Type
- Description
- History
- Images
- Coordinates
- 360 media
- Photo spots
- QR/check-in codes

Attraction data becomes the master context for tourist visits.

---

## 8.2 Tourist Entry

A tourist enters through:

```text
/c/[checkinCode]
```

The system resolves the code to:

- Attraction
- Photo spot
- Campaign if available

The system also records funnel events such as:

- qr_scanned
- landing_viewed

---

## 8.3 Identity Handling

The system checks whether the tourist is known.

Possible identity states:

```text
new_guest
returning_guest
line_user
email_user
linked_identity_user
```

The system must avoid creating duplicate tourist profiles when possible.

---

## 8.4 Minimal Data Submission

The minimal tourist form collects only essential data:

- Display name
- Origin country or province
- Age group
- Visit date
- Consent confirmation

This creates or updates:

- tourist profile
- tourist identity
- consent log
- visit record

---

## 8.5 Photo Upload

The tourist uploads a photo.

The system stores:

- original photo path
- thumbnail path if generated
- file metadata
- upload timestamp
- approval status if moderation exists

The photo is linked to the visit.

---

## 8.6 Certificate Generation

The system generates a certificate using:

- tourist display name
- attraction name
- visit date
- uploaded photo
- certificate template

The system stores:

- certificate file path
- certificate metadata
- generated timestamp
- download or share metadata if available

---

## 8.7 Stamp Assignment

The system checks whether the tourist already has a stamp for that attraction.

Rules:

- Every visit should create a visit record.
- A tourist normally earns only one stamp per attraction.
- Repeat visits should not duplicate the same attraction stamp unless business rules change.

---

## 8.8 Optional Survey

After the tourist receives value, the system asks optional planning questions.

Data may include:

- Travel companion
- Group size
- Transport mode
- Overnight status
- Travel purpose
- Spending range
- Satisfaction score
- Revisit intention
- Recommendation intention
- Optional comment

This data supports dashboard analysis.

---

## 8.9 Dashboard Aggregation

Dashboard data is calculated from:

- tourists
- visits
- attractions
- visit_expenses
- satisfaction_surveys
- survey_answers
- tourist_stamps
- certificates
- funnel_events

For future scaling, summary tables or materialized views may be used.

---

## 9. Main Modules

## 9.1 Public Attraction Module

Purpose:

Show attraction information to tourists and the public.

Main features:

- Attraction listing
- Attraction detail
- Province filters
- Attraction category filters
- Image gallery
- 360 media section
- Map section
- Certificate entry point

Primary users:

- Tourists
- General public

---

## 9.2 QR Check-in Module

Purpose:

Connect physical tourism locations to the digital system.

Main features:

- Check-in code resolution
- QR route handling
- Photo spot detection
- Invalid code handling
- Funnel event tracking

Primary users:

- Tourists
- Admins who create QR codes

---

## 9.3 Tourist Profile Module

Purpose:

Store tourist profile data without unnecessary personal information.

Main features:

- Guest identity
- Optional LINE identity
- Optional email identity
- Profile reuse
- Identity linking
- Consent logging

Primary users:

- Tourists
- Admins
- Dashboard users

---

## 9.4 Visit Record Module

Purpose:

Record each tourism visit.

Main features:

- Visit creation
- Attraction linking
- Photo spot linking
- Visit date
- Travel behavior
- Completion status
- Visit history

Primary users:

- Tourists
- Admins
- Researchers

---

## 9.5 Photo Upload Module

Purpose:

Allow tourists to upload photos for certificates.

Main features:

- File validation
- Preview
- Storage upload
- Metadata storage
- Visit linkage
- Optional moderation

Primary users:

- Tourists
- Admins

---

## 9.6 Certificate Generation Module

Purpose:

Generate digital certificates or travel memory cards.

Main features:

- Template rendering
- Photo integration
- Name and attraction placement
- Download
- Storage
- Certificate records

Primary users:

- Tourists

---

## 9.7 Digital Stamp and Passport Module

Purpose:

Encourage repeat visits and track attraction participation.

Main features:

- Stamp assignment
- Stamp uniqueness rule
- Passport progress
- Province progress
- Badge foundation for future phases

Primary users:

- Tourists
- Dashboard users

---

## 9.8 Survey, Expense, and Satisfaction Module

Purpose:

Collect planning data after the tourist receives value.

Main features:

- Travel behavior questions
- Spending range
- Satisfaction rating
- Revisit intention
- Recommendation intention
- Optional comment

Primary users:

- Tourists
- Researchers
- Planners

---

## 9.9 Admin CMS Module

Purpose:

Manage system content and operational data.

Main features:

- Attraction management
- Photo spot management
- Media management
- QR/check-in code management
- Visit record view
- Tourist profile view
- Export
- Basic settings

Primary users:

- Tourism staff
- Admins

---

## 9.10 Dashboard Analytics Module

Purpose:

Convert collected data into planning insights.

Main dashboards:

- Executive overview
- Tourist profile
- Travel behavior
- Expense
- Satisfaction
- Attraction performance
- Funnel analytics
- Sustainable tourism indicators

Primary users:

- Admins
- Researchers
- Planners

---

## 10. Identity and Access Model

## 10.1 Tourist Identity

Tourists are not required to create accounts.

Supported identity modes:

```text
anonymous_device
line_optional
email_optional
google_future_optional
```

The same tourist may have multiple identities.

This requires a separate identity table.

```text
tourists
tourist_identities
```

---

## 10.2 Admin Identity

Admin users must authenticate.

Admin access should be protected by:

- Login
- Role
- Permission
- Route guards
- Server-side authorization
- Audit logs

---

## 11. Data Model Overview

The database should be divided into logical groups.

## 11.1 Geography

```text
countries
provinces
districts
```

## 11.2 Attraction Master Data

```text
attraction_types
attractions
attraction_images
attraction_360_media
photo_spots
checkin_codes
```

## 11.3 Tourist Data

```text
tourists
tourist_identities
tourist_contacts
consent_logs
```

## 11.4 Visit Data

```text
visits
visit_photos
visit_destinations
certificates
tourist_stamps
```

## 11.5 Survey and Planning Data

```text
travel_companions
transport_modes
travel_purposes
expense_categories
visit_expenses
satisfaction_surveys
survey_questions
survey_answers
```

## 11.6 Analytics Data

```text
funnel_events
daily_attraction_stats
monthly_province_stats
dashboard_cache
```

## 11.7 System Data

```text
users
roles
permissions
audit_logs
data_import_logs
official_tourism_stats
official_attraction_refs
```

---

## 12. Dashboard Overview

The dashboard must support decision-making.

## 12.1 Executive Dashboard

Shows:

- Total tourists
- Total visits
- Certificates generated
- Stamps earned
- Average satisfaction
- Survey completion rate
- Top provinces
- Top attractions

## 12.2 Tourist Profile Dashboard

Shows:

- Origin country
- Origin province
- Age group
- Preferred language
- New vs returning users
- Identity type

## 12.3 Travel Behavior Dashboard

Shows:

- Travel companion
- Group size
- Transport mode
- Overnight status
- Travel purpose
- Visit frequency

## 12.4 Expense Dashboard

Shows:

- Spending range
- Expense category
- Estimated total spending
- Estimated average spending
- Spending by province
- Spending by attraction

## 12.5 Satisfaction Dashboard

Shows:

- Overall satisfaction
- Safety
- Cleanliness
- Transportation
- Information/signage
- Service
- Value for money
- Revisit intention
- Recommendation intention

## 12.6 Funnel Analytics Dashboard

Shows:

- QR scanned
- Landing viewed
- Photo uploaded
- Minimal form completed
- Certificate generated
- Survey started
- Survey completed
- Passport saved

## 12.7 Sustainable Tourism Dashboard

Shows:

- Over-concentrated attractions
- Under-visited attractions
- High-satisfaction attractions
- Low-satisfaction attractions
- Community-based tourism indicators
- Spending distribution
- Overnight stay ratio
- Problem categories

---

## 13. Technical Architecture Overview

## 13.1 Recommended MVP Stack

```text
Next.js
TypeScript
Tailwind CSS
Supabase PostgreSQL
Supabase Storage
Supabase Auth for admin
Guest token for tourists
```

## 13.2 Future Production Stack

```text
Next.js PWA
NestJS API
Supabase PostgreSQL
Supabase Storage
Supabase Auth
Queue or background job for certificate rendering
Dashboard summary tables
Optional LINE LIFF
Optional email magic link
```

## 13.3 Deployment Direction

MVP deployment can use:

```text
Vercel
Supabase
```

Future production may add:

```text
Dedicated backend server
Queue worker
Object storage CDN
Monitoring
Backup policy
```

---

## 14. External Integration Overview

## 14.1 LINE LIFF

Purpose:

- Support Thai users
- Save passport
- Identify returning users
- Send certificate link in future

Status:

- Optional
- Phase 2 or later

## 14.2 Email Magic Link

Purpose:

- Support foreign tourists
- Save passport
- Certificate recovery

Status:

- Optional
- MVP or Phase 2 depending on time

## 14.3 Official Tourism Data

Purpose:

- Compare local collected data with official statistics
- Reference official attraction registries
- Support academic and planning reports

Status:

- Design in MVP
- Implement later

---

## 15. Privacy and Consent Overview

The system must minimize personal data.

Do not require:

- National ID
- Full legal name
- Full address
- Phone number
- Email
- LINE account
- GPS permission
- Sensitive attributes

Use:

- Display name
- Country or province
- Age group
- Optional identity
- Consent log
- Aggregated dashboard data

Consent must be stored before required form submission is accepted.

---

## 16. Security Overview

Security controls must include:

- Admin authentication
- Role-based access direction
- Protected admin routes
- Input validation
- File upload validation
- Secure storage paths
- Environment variables
- Audit logging
- Export restrictions
- Supabase RLS where direct client access exists

Never expose Supabase service role key in frontend code.

---

## 17. Performance Overview

Performance priorities:

- Mobile-first loading
- Image optimization
- Lazy loading
- Pagination for admin tables
- Indexed database queries
- Dashboard aggregation
- Minimal client-side bundle
- Clear loading states

Dashboard queries should be optimized as data grows.

---

## 18. Error Handling Overview

The system should handle:

- Invalid QR code
- Inactive QR code
- Missing attraction
- Failed photo upload
- Failed certificate generation
- Duplicate submission
- Missing consent
- Unauthorized admin access
- Empty dashboard data

User-facing errors should be friendly and non-technical.

---

## 19. MVP Boundary

MVP includes:

- Public attraction pages
- QR check-in
- Guest identity
- Minimal form
- Photo upload
- Certificate generation
- Stamp assignment
- Optional survey
- Expense and satisfaction collection
- Admin attraction management
- Basic dashboard
- Export
- Consent logging

MVP excludes:

- NFC
- Native app
- Blockchain
- AI recommendation
- Full LINE automation
- Forced GPS
- Full coupon system
- Advanced forecasting

---

## 20. System Quality Goals

The system should be:

- Useful for tourism planning
- Easy for tourists
- Strong in database design
- Safe with personal data
- Clear for administrators
- Useful for dashboard analysis
- Maintainable for developers
- Expandable after MVP
- Suitable for academic presentation
- Suitable for future production deployment

---

## 21. Final System Summary

The platform connects physical tourism places to a structured tourism database.

It uses QR codes and digital certificates to motivate tourist participation.

It stores tourist, visit, attraction, expense, and satisfaction data in a relational model.

It turns the data into dashboards and reports for sustainable tourism planning.

The system must always prioritize:

```text
Data quality
Tourist experience
Privacy
Dashboard usefulness
Production readiness
```
