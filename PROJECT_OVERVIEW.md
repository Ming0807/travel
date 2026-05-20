# PROJECT_OVERVIEW.md

## 1. Project Name

**Southern Border Tourism Data & Intelligence Platform**

This platform is designed for the southern border provinces of Thailand:

- Yala
- Pattani
- Narathiwat

The project focuses on building a high-quality tourism database and analytics system that can support sustainable tourism planning, local tourism development, and decision-making for academic, administrative, and community stakeholders.

---

## 2. Project Summary

The system is a production-oriented tourism data platform that collects tourist visit data through a low-friction digital experience.

Tourists can scan a QR code at an attraction or photo spot, view attraction information, upload a travel photo, create a digital certificate, receive a digital stamp, and optionally answer short tourism planning questions.

The collected data is stored in a structured database and used for dashboard analysis.

The system must support five core tourism data dimensions:

1. Tourist profile
2. Travel behavior
3. Attractions visited
4. Expenses
5. Satisfaction

These dimensions are essential for sustainable tourism planning and dashboard development.

---

## 3. Background

Tourism planning requires more than counting the number of visitors. Local administrators and researchers need structured data that explains tourist behavior, spending, satisfaction, and attraction performance.

For the southern border area, tourism development must consider:

- Local culture
- Community-based tourism
- Cross-border visitors
- Safety perception
- Transportation accessibility
- Spending distribution
- Tourist satisfaction
- Sustainable use of attractions
- Promotion of under-visited areas

The platform is designed to collect local-level tourism data that can complement official tourism statistics and attraction registries.

---

## 4. Main Problem

The main problem is not only database design.

The real-world challenge is:

> How can the system encourage tourists to provide useful data without forcing them to fill in long forms?

Tourists are usually unwilling to complete long surveys, especially while traveling.

Therefore, the system must use an engagement mechanism.

The proposed mechanism is:

```text
QR / PWA / Digital Certificate / Digital Stamp / Digital Passport
```

Tourists receive immediate value, such as a certificate or memory card, and the system gradually collects useful data through a short and friendly experience.

---

## 5. Project Purpose

The purpose of the project is to create a tourism database platform that can:

- Record tourist visits
- Collect structured tourist profile data
- Analyze travel behavior
- Track attraction visits
- Estimate tourist spending
- Measure satisfaction
- Support sustainable tourism indicators
- Provide dashboards for tourism planning
- Help provincial and local agencies make data-driven decisions

---

## 6. Project Goals

### 6.1 Data Collection Goal

Build a reliable data collection workflow that allows tourists to submit useful information through a simple mobile-first experience.

### 6.2 Database Goal

Design a normalized, scalable, and analysis-ready relational database for tourism data.

### 6.3 User Experience Goal

Make the tourist-facing flow short, friendly, and valuable.

The system should not feel like a long survey.

### 6.4 Dashboard Goal

Provide meaningful analytics that support tourism planning and decision-making.

### 6.5 Privacy Goal

Collect only necessary data and follow privacy-by-design principles.

### 6.6 Production Goal

Design the system as if it may be deployed for real users, not only demonstrated in a classroom.

---

## 7. Project Scope

### 7.1 In Scope

The project includes:

- Public attraction website
- Dynamic attraction detail pages
- QR check-in flow
- Guest mode
- Optional LINE identity
- Optional email identity
- Tourist profile creation
- Visit record creation
- Photo upload
- Digital certificate generation
- Digital stamp collection
- Optional survey
- Expense range collection
- Satisfaction collection
- Admin attraction management
- Admin photo spot management
- Admin certificate template management
- Dashboard analytics
- Data export
- Privacy and consent logging
- Basic official data integration design

### 7.2 Out of Scope for MVP

The MVP should not include:

- Native mobile application
- NFC check-in
- Blockchain or NFT
- Advanced AI recommendation
- Full coupon partner system
- Forced GPS verification
- Complex tourism forecasting
- Automated full-scale government API integration
- AI-based image moderation
- Payment system

These can be considered in later phases.

---

## 8. Target Users

### 8.1 Tourist

A tourist is a person who visits an attraction and interacts with the public-facing system.

Tourists may be:

- Thai tourists
- Local tourists
- Foreign tourists
- Cross-border tourists
- Group travelers
- Family travelers
- Students
- Community tourism visitors

Tourists should be able to use the system without creating an account first.

### 8.2 Returning Tourist

A returning tourist has used the system before.

The system should recognize returning tourists through one or more identity methods:

- Anonymous device token
- LINE identity
- Email magic link
- Optional Google identity in the future

Returning tourists should not be forced to enter the same profile data again.

### 8.3 Tourism Staff

Tourism staff manage attraction data and review submitted visit data.

They may work for local tourism offices, university project teams, or attraction administrators.

### 8.4 System Administrator

System administrators manage:

- Users
- Roles
- Permissions
- Master data
- Audit logs
- Privacy settings
- Data exports

### 8.5 Researcher or Planner

Researchers and planners use dashboards and reports to understand tourism trends and support development strategies.

---

## 9. Core System Concept

The system should be understood as three connected layers.

### 9.1 Engagement Layer

This layer motivates tourists to participate.

Features:

- QR code entry
- Mobile-first PWA
- Digital certificate
- Digital stamp
- Digital passport
- Optional LINE
- Optional email
- Guest mode

### 9.2 Tourism Database Layer

This layer stores structured tourism data.

Data groups:

- Tourist profile
- Tourist identity
- Visit records
- Attraction records
- Photo spots
- Expenses
- Satisfaction
- Survey answers
- Certificates
- Stamps

### 9.3 Tourism Intelligence Layer

This layer turns data into planning insights.

Outputs:

- Dashboard
- Reports
- Export files
- Sustainable tourism indicators
- Attraction performance analysis
- Tourist behavior analysis
- Spending and satisfaction analysis

---

## 10. Recommended User Flow

### 10.1 First-Time Tourist

```text
Scan QR code at attraction
    |
Open public check-in page
    |
View attraction information
    |
Choose "Create My Travel Certificate"
    |
Upload photo
    |
Fill minimal required form
    |
Generate certificate
    |
Earn digital stamp
    |
Optional: save passport with Google or LINE
    |
Optional: answer short survey
```

### 10.2 Returning Tourist

```text
Scan QR code at another attraction
    |
System detects existing identity
    |
Show saved profile summary
    |
Tourist confirms or edits profile
    |
Upload photo
    |
Generate new certificate
    |
Earn new stamp
    |
Optional: answer visit-specific survey
```

### 10.3 Admin User

```text
Login to admin dashboard
    |
Manage attractions and photo spots
    |
Manage certificate templates
    |
Review tourist visits
    |
Monitor dashboard
    |
Export reports
```

---

## 11. Main Data Flow

```text
QR Scan
    |
Check-in Code Resolution
    |
Attraction + Photo Spot Detection
    |
Tourist Identity Detection
    |
Tourist Profile Creation or Retrieval
    |
Visit Record Creation
    |
Photo Upload
    |
Certificate Generation
    |
Stamp Assignment
    |
Optional Survey
    |
Dashboard Aggregation
```

---

## 12. Key Product Differentiation

This project should be more advanced than a normal tourism website because it combines:

- Attraction content management
- Tourist engagement
- Certificate generation
- Digital passport
- Structured tourism database
- Survey collection
- Dashboard analytics
- Sustainable tourism planning
- Privacy-aware data design

The system is designed to collect useful data naturally through a positive tourist experience.

---

## 13. Data Collection Strategy

The system must use progressive data collection.

### 13.1 Minimal Required Data

Collected before certificate generation:

- Name on certificate
- Origin country or province
- Age group
- Visit date
- Consent confirmation

### 13.2 Optional Travel Data

Collected after certificate generation:

- Travel companion
- Group size
- Transport mode
- Overnight status
- Travel purpose

### 13.3 Optional Planning Data

Collected after the tourist receives value:

- Spending range
- Satisfaction score
- Revisit intention
- Recommendation intention
- Comment or improvement suggestion

This strategy improves completion rate and avoids overwhelming the tourist.

---

## 14. Identity Strategy

The system must support multiple identity methods.

### 14.1 Guest Identity

A guest identity uses an anonymous device token stored in the browser.

This supports fast participation without login.

### 14.2 LINE Identity

LINE is useful for Thai tourists and returning users.

LINE should be optional, not mandatory.

### 14.3 Email Identity

Email is useful for foreign tourists or users without LINE.

Email should be optional and can be used for passport recovery or certificate delivery.

### 14.4 Identity Merging

If a guest later connects Google or LINE, the system should link the new identity to the existing tourist profile instead of creating a duplicate profile.

---

## 15. Dashboard Purpose

The dashboard must help answer planning questions.

Examples:

- Which province receives the most tourist visits?
- Which attractions are most popular?
- Where do tourists come from?
- Which age groups visit most often?
- Which transport modes are common?
- How many tourists stay overnight?
- What is the average spending range?
- Which attractions have low satisfaction?
- Which places should be improved first?
- Which campaigns produce better participation?
- Which areas support sustainable tourism development?

Dashboards must be decision-oriented, not decorative.

---

## 16. Sustainable Tourism Planning Focus

The platform should help identify:

- Overcrowded attractions
- Under-promoted attractions
- High-satisfaction attractions
- Low-satisfaction attractions
- Attractions with community-based tourism value
- Spending opportunities for local communities
- Transport and accessibility issues
- Safety perception issues
- Cleanliness and service issues
- Cross-province route opportunities

---

## 17. Privacy and Ethics

The system must avoid unnecessary personal data collection.

Recommended privacy rules:

- Use display name instead of legal name.
- Use country/province instead of full address.
- Make Google, LINE, email, and phone number optional for tourists.
- Use an anonymous guest ID stored in the browser/device for guest continuity.
- Do not use IP address as the main tourist identity mechanism.
- Do not collect national ID numbers.
- Do not collect sensitive personal attributes.
- Do not require GPS.
- Store consent logs.
- Use aggregated data for dashboard reporting where possible.
- Allow data export only for authorized users.
- Do not expose provider user IDs, guest tokens, internal tourist IDs, internal visit IDs, or private storage paths in public UI, dashboards, share URLs, or default exports.

---

## 17.1 Latest Product Strategy Alignment

The latest product strategy is **reward-first data collection**.

The public website supports SEO, credibility, attraction discovery, travel stories, suggested routes, 360 media, and general information. It is not the primary data collection gate. The main data collection entry point is the QR check-in route:

```text
/c/[checkinCode]
```

The QR route should first open a location-specific landing page that shows:

- attraction context
- photo spot context when available
- certificate or travel memory preview
- short privacy/trust cue
- clear CTA such as "Create my certificate"

The QR route must not open a long survey first.

The preferred tourist flow is:

```text
Scan QR
    |
Location-specific landing page
    |
Create certificate CTA
    |
Minimal form + consent
    |
Photo upload
    |
Digital certificate / travel memory card
    |
Digital stamp
    |
Optional sharing
    |
Optional micro survey
    |
Optional Google or LINE account linking
```

Certificate download must not be blocked by survey completion, LINE LIFF, Google login, email, or phone number.

Guest mode is required for MVP. It works on the same browser/device using an anonymous guest ID. If the tourist later links Google or LINE, the existing Tourist Profile should be linked to the authenticated Tourist Identity instead of creating a duplicate profile.

Google login is optional for tourists and useful for profile, passport, and certificate history recovery across devices. Google/Gmail-style login is appropriate for admin authentication where configured. LINE LIFF is optional and should be offered after the reward or from passport screens, not as a required entry gate.

---

## 18. Production Considerations

The system should be designed with:

- Mobile-first frontend
- Fast loading pages
- Image optimization
- Secure file upload
- Database indexing
- Pagination
- Role-based access control
- Consent management
- Audit logging
- Dashboard summary tables
- Error handling
- Data validation
- Environment configuration
- Deployment readiness

---

## 19. Success Criteria

The project is successful if it can:

1. Collect tourist data through a real QR/PWA flow.
2. Store structured data across the five core dimensions.
3. Generate digital certificates.
4. Assign digital stamps.
5. Recognize returning tourists.
6. Avoid duplicate profile creation.
7. Allow admin users to manage attraction content.
8. Show useful dashboards.
9. Export data for academic or administrative reporting.
10. Protect tourist privacy.
11. Support future production deployment.

---

## 20. MVP Definition Summary

The MVP must prove the core system loop:

```text
Attraction Content
    |
QR Landing
    |
Minimal Tourist Data Collection
    |
Photo Upload
    |
Certificate Generation
    |
Stamp Award
    |
Optional Sharing
    |
Visit Record
    |
Optional Survey
    |
Dashboard
```

If this loop works, the project has a strong foundation.
