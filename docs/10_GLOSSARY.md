# 10_GLOSSARY.md

## 1. Purpose

This glossary defines key terms used throughout the project documentation. All team members and AI agents should use these terms consistently.

---

## 2. Core Domain Terms

### Tourist
A person who visits a tourism attraction and interacts with the platform. Includes Thai, foreign, local, and cross-border visitors. Tourists are not required to create accounts.

### Visit
A single recorded instance of a tourist participating in the check-in flow at an attraction. One tourist may have many visits. Each visit generates a visit record in the database.

### Attraction
A tourism destination managed in the system. Examples: Betong Sky Walk, Krue Se Mosque, Hala-Bala Wildlife Sanctuary. Each attraction belongs to a province and district.

### Photo Spot
A specific location within or near an attraction where a QR code is placed. A single attraction may have multiple photo spots. Each photo spot has its own check-in code.

### Check-in Code
A unique code assigned to a photo spot or attraction entry point. Encoded in a QR code that tourists scan. Maps to a URL: `/c/[checkinCode]`.

### QR Code
A physical scannable code displayed at attractions and photo spots. When scanned, it opens the platform's check-in page in the tourist's browser.

---

## 3. Engagement Terms

### Digital Certificate
A personalized image generated for the tourist after completing the check-in flow. Contains the tourist's name, photo, attraction name, and visit date. Acts as a digital souvenir and primary engagement incentive.

### Digital Stamp
A record proving a tourist visited a specific attraction. Earned automatically when a valid visit is completed. One stamp per attraction per tourist (visits can repeat, stamps are unique).

### Digital Passport
A personal collection page showing all stamps a tourist has earned. Displays progress by province and overall. Can be device-bound (guest) or persistent (linked identity).

### Stamp Definition
An admin-managed record that defines the stamp for a specific attraction, including the icon, name, description, and rarity level.

---

## 4. Identity Terms

### Guest Tourist
A tourist using the platform without logging in. Identified by an anonymous device token stored in the browser. Can create certificates and earn stamps.

### Returning Tourist
A tourist who has used the platform before. Recognized by device token, LINE, or email. Profile data is pre-filled from the previous visit.

### Anonymous Device Token
A unique identifier generated for guest tourists and stored in browser local storage. Used to recognize returning guests on the same device.

### Identity Linking
The process of connecting a guest identity to a persistent identity (LINE or email). Enables passport recovery across devices.

### Tourist Identity
A record in the `tourist_identities` table that links an identity provider (anonymous_device, line, email) to a tourist profile.

---

## 5. Data Terms

### Five Core Dimensions
The five categories of tourism data the platform collects: Tourist Profile, Travel Behavior, Attractions Visited, Expenses, and Satisfaction.

### Progressive Data Collection
The strategy of collecting minimal data first (before certificate) and optional data later (after certificate). Reduces tourist burden while maximizing participation.

### Minimal Form
The short form tourists fill before certificate generation: name, origin, age group, visit date, and consent. Designed to take less than 60 seconds.

### Optional Survey
Additional questions shown after certificate generation: travel companion, transport, spending, satisfaction, revisit intention, etc. Can be skipped.

### Consent Log
A record of the tourist's agreement to data collection, stored with version number, timestamp, and purpose.

---

## 6. Analytics Terms

### Funnel Event
A tracked event in the tourist journey: qr_scanned, landing_viewed, certificate_started, photo_uploaded, form_completed, certificate_generated, survey_completed, passport_saved.

### Funnel Conversion Rate
The percentage of tourists who complete a later funnel step compared to an earlier one. Example: certificate_generated / qr_scanned.

### Dashboard
An analytics interface showing tourism metrics, charts, and filters. Used by admins, planners, and researchers for decision-making.

### Summary Table
A pre-aggregated database table (e.g., `daily_attraction_stats`) that stores calculated metrics for fast dashboard queries.

### Sustainable Tourism Indicator
A metric that measures whether tourism develops in a balanced and sustainable way. Examples: visit concentration index, satisfaction score by attraction, community tourism spending ratio.

---

## 7. Technical Terms

### PWA (Progressive Web App)
A web application that works like a native app on mobile devices. No app store installation required. The platform uses PWA for tourist-facing features.

### Server Action
A Next.js feature for running server-side code from React components. Used for form submissions, data queries, and secure operations.

### RLS (Row Level Security)
Supabase/PostgreSQL feature that restricts data access at the database row level based on the authenticated user's identity.

### Supabase
The backend-as-a-service platform used for PostgreSQL database, authentication, and file storage.

---

## 8. Admin Terms

### Backoffice
The admin-facing web interface for managing attractions, viewing data, and accessing dashboards. Accessible at `/admin/*` routes.

### Campaign
An optional grouping mechanism for tracking tourism promotions. A campaign can be linked to check-in codes to measure promotional effectiveness.

### Master Data
Reference data managed by admins: provinces, districts, attraction types, expense categories, transport modes, etc.

### Audit Log
A record of admin actions including who did what, when, and what changed. Used for security and accountability.

---

## 9. Privacy Terms

### PDPA
Thailand's Personal Data Protection Act. The platform must comply with PDPA requirements for data collection, consent, and processing.

### Data Minimization
The principle of collecting only the minimum personal data necessary for the stated purpose.

### Privacy by Design
Building privacy protections into the system architecture from the start, rather than adding them later.

### Anonymization
The process of removing or obscuring personal identifiers from data so individuals cannot be identified. Used for dashboard aggregation and data exports.
