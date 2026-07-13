# MODULE_02_QR_CHECKIN.md

## 1. Module Name

**QR Check-in Module**

---

## 2. Module Purpose

The QR Check-in Module connects physical tourism locations to the digital tourism database.

Tourists scan a QR code at an attraction or photo spot. The system resolves the QR code to a database record, loads the correct attraction context, and starts the tourist participation flow.

This module is the main entry point for collecting real visitor data.

---

## 3. Business Purpose

The module supports the main project objective:

> Collect structured tourist data for sustainable tourism planning in Yala, Pattani, and Narathiwat.

The QR code is not just a shortcut link. It is a data collection source.

It tells the system:

- Which attraction the tourist visited
- Which photo spot was used
- Which campaign produced the interaction
- When the interaction started
- How many tourists entered the flow
- Where tourists dropped out

---

## 4. Core Design Decision

Use **one QR code per photo spot or attraction**, not separate QR codes for different identity types.

Correct:

```text
/c/YLA001
```

The system then detects context and offers:

```text
Continue as Guest
Save with Google later
Save with LINE later
```

Incorrect:

```text
/line/YLA001
/guest/YLA001
/foreign/YLA001
```

Reason:

- One QR is simpler for tourists.
- One QR is easier to print and manage.
- One QR supports Thai and foreign tourists.
- One QR improves analytics quality.
- One QR avoids fragmented data.
- One QR prevents identity-specific routing from polluting dashboard interpretation.

The QR route must open a location-specific landing page before any form. The landing page should show attraction context, photo spot context, certificate preview, privacy/trust cue, and a clear CTA such as "Create my certificate".

The QR route must not require LINE, Google, email, phone number, or survey completion before certificate creation.

---

## 5. Primary Users

## 5.1 Tourist

Tourists scan QR codes and start the flow.

They should be able to continue without login.

## 5.2 Foreign Tourist

Foreign tourists may not use LINE.

They must be able to use the QR flow through normal browser guest mode.

## 5.3 Returning Tourist

Returning tourists should be recognized if they have:

- anonymous device token
- Google identity
- LINE identity
- future email identity

## 5.4 Tourism Staff

Tourism staff create and place QR codes at attractions.

## 5.5 Admin

Admin users manage check-in codes and monitor QR performance.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- QR/check-in route
- Check-in code lookup
- Active/inactive validation
- Attraction context loading
- Photo spot context loading
- Funnel event tracking
- Guest continuation option
- Location-specific landing page before form
- Certificate preview / travel memory CTA
- Browser language detection
- Friendly invalid code page
- Friendly inactive code page
- Link to certificate creation flow

## 6.2 In Scope for Phase 2

Phase 2 may include:

- LINE LIFF deep link behavior
- Email passport recovery
- Campaign-specific QR codes
- QR print/PDF generation in admin
- Scan analytics by QR code
- QR expiration rules
- Dynamic QR redirect management
- Abuse/rate limit protection

## 6.3 Out of Scope

This module does not directly handle:

- Certificate rendering
- Photo upload
- Survey questions
- Dashboard UI
- Admin attraction editing

It only starts and tracks the entry flow.

---

## 7. Related Modules

This module connects to:

```text
MODULE_01_PUBLIC_ATTRACTIONS.md
MODULE_03_TOURIST_PROFILE.md
MODULE_04_VISIT_RECORD.md
MODULE_05_PHOTO_UPLOAD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_08_SURVEY_EXPENSE_SATISFACTION.md
MODULE_10_DASHBOARD_ANALYTICS.md
MODULE_12_LINE_LIFF_OPTIONAL.md
```

---

## 8. Required Data Tables

This module reads from:

```text
checkin_codes
attractions
photo_spots
provinces
districts
```

This module writes to:

```text
funnel_events
```

Later flow writes to:

```text
tourists
tourist_identities
visits
visit_photos
certificates
tourist_stamps
```

---

## 9. Main Route

Recommended route:

```text
/c/[checkinCode]
```

Example:

```text
/c/YLA001
/c/PTN001
/c/NWT001
```

The route should be short because it will be encoded in QR codes.

---

## 10. Check-in Code Requirements

## 10.1 Code Format

Recommended format:

```text
YLA001
PTN001
NWT001
```

or:

```text
YLA-AIW-001
PTN-MOS-001
NWT-BCH-001
```

Rules:

- Must be unique.
- Must be URL-safe.
- Should be short enough for QR.
- Should not include private data.
- Should be stable after printing.

---

## 10.2 Check-in Code Data

Each check-in code should link to:

```text
attraction_id
photo_spot_id optional
campaign_id optional
is_active
starts_at optional
ends_at optional
```

---

## 10.3 Valid Code Rules

A code is valid when:

```text
code exists
is_active = true
current time is after starts_at if starts_at exists
current time is before ends_at if ends_at exists
linked attraction exists
linked attraction is active
linked attraction is published or allowed for check-in
linked photo spot is active if photo_spot_id exists
```

---

## 11. QR Entry Flow

## 11.1 Normal Flow

```text
Tourist scans QR
    |
Open /c/[checkinCode]
    |
System resolves check-in code
    |
System loads attraction and photo spot
    |
System records qr_scanned event
    |
System detects language and environment
    |
System displays check-in landing page
    |
Tourist clicks Start Certificate
    |
System records certificate_started event
    |
Tourist continues to profile/photo/certificate flow
```

The production flow is guest-first and reward-first:

```text
/c/[code]
    -> creates a short-lived non-personal funnel session
    -> /checkin/[code] benefit and trust landing
    -> /checkin/[code]/start minimal or returning profile
    -> /visit/[visitId]/photo
    -> certificate preview and reward
    -> optional survey and account linking
```

Do not show LINE or email buttons that do not perform real authentication. Account linking belongs after the reward unless a verified authentication flow is fully implemented.

For a returning guest, reuse the same tourist profile and create a new visit. The tourist may continue with existing data or edit the prefilled profile. Do not create a new tourist on every scan.

---

## 11.2 Invalid Code Flow

```text
Tourist scans invalid QR
    |
System cannot find check-in code
    |
Show friendly error
    |
Do not create visit
    |
Optional: record invalid_qr event if desired
```

User message:

```text
This QR code is not valid.
```

Thai:

```text
QR Code นี้ไม่ถูกต้องหรือไม่พบข้อมูล
```

---

## 11.3 Inactive Code Flow

```text
Tourist scans inactive QR
    |
System finds code but is_active = false
    |
Show inactive message
    |
Do not create visit
```

User message:

```text
This QR code is currently not available.
```

Thai:

```text
QR Code นี้ยังไม่เปิดใช้งานหรือถูกปิดใช้งานแล้ว
```

---

## 11.4 Expired Code Flow

If `ends_at` is used:

```text
Tourist scans expired QR
    |
System finds code but current time > ends_at
    |
Show expired message
    |
Do not create visit
```

---

## 12. Environment Detection

The module should detect:

```text
browser language
LINE browser or LIFF environment if possible
device type
existing guest token
```

## 12.1 Browser Language

Use browser language to choose initial UI language.

Suggested behavior:

```text
th -> Thai
otherwise -> English
```

Malay can be added later.

## 12.2 LINE Detection

If opened inside LINE, the system may show LINE save option more prominently.

But do not block normal browser users.

## 12.3 Guest Token Detection

If anonymous device token exists, prepare returning guest flow.

If no token exists, create one later in tourist identity flow.

---

## 13. Check-in Landing Page

## 13.1 Purpose

The landing page explains the benefit and starts the flow.

It should not immediately show a long form.

## 13.2 Required UI Elements

Show:

```text
attraction name
photo spot name if available
attraction image or hero
short benefit statement
estimated time
primary CTA
guest option
optional save options
privacy hint
```

Example English:

```text
Create your free digital travel certificate for Aiyerweng Skywalk.
It takes less than 1 minute.
```

Example Thai:

```text
สร้างใบประกาศดิจิทัลฟรีสำหรับอัยเยอร์เวง ใช้เวลาไม่ถึง 1 นาที
```

## 13.3 Primary CTA

Recommended:

```text
Create My Certificate
```

Thai:

```text
สร้างใบประกาศของฉัน
```

## 13.4 Secondary Options

Show small options:

```text
Continue as Guest
Save with Google later
Save with LINE later
```

Do not force login first.

---

## 14. Funnel Events

This module must record funnel events.

## 14.1 Required Events

At minimum:

```text
qr_scanned
landing_viewed
certificate_started
```

Later modules record:

```text
photo_uploaded
minimal_form_completed
certificate_generated
survey_started
survey_completed
passport_saved
```

## 14.2 Event Data

Each event should include where possible:

```text
session_id
tourist_id optional
visit_id optional
attraction_id
photo_spot_id optional
checkin_code_id
event_name
event_time
metadata_json optional
```

The canonical `/c/[code]` route creates a two-hour random session ID in an HttpOnly cookie. Funnel events store that ID inside metadata and deduplicate the same event type within one QR flow session. The session ID contains no personal data and is separate from the long-lived guest identity.

## 14.3 Early Event Rule

Before tourist profile exists:

```text
tourist_id = null
visit_id = null
session_id = generated session value
```

Do not require tourist_id for early funnel events.

---

## 15. Data Validation

## 15.1 Check-in Code Validation

Rules:

```text
code must not be empty
code must be URL-safe
code must exist in checkin_codes
code must be active
code must be within start/end time if configured
linked attraction must be active
linked photo spot must be active if present
```

## 15.2 No Visit Creation Yet

The QR landing page should not necessarily create a full visit immediately.

Recommended:

```text
Record funnel event first.
Create visit after minimal tourist/profile step starts or completes.
```

This avoids many incomplete visit records.

Alternative:

Create visit at start with `completion_status = started`.

If using this approach, dashboard must distinguish started vs completed visits.

Preferred MVP approach:

```text
Create visit after tourist minimal form is submitted.
Use funnel_events to track early drop-off.
```

---

## 16. Session Handling

## 16.1 Session ID

Create a non-personal session ID for funnel tracking.

Rules:

- Random value.
- Stored in browser session/local storage.
- Does not contain personal data.
- Used before tourist identity exists.

## 16.2 Guest Identity

Guest identity is not the same as session ID.

Session ID tracks a flow.

Guest identity tracks a returning device.

---

## 17. Integration with Tourist Profile Module

After CTA, the flow continues to tourist profile module.

Required context passed forward:

```text
checkin_code
attraction_id
photo_spot_id
session_id
language
```

This context is needed to create the visit later.

---

## 18. Integration with Visit Record Module

When the tourist completes minimal data, the system creates a visit.

Visit should include:

```text
tourist_id
attraction_id
photo_spot_id
checkin_code_id
visit_date
completion_status
```

The QR module provides attraction and photo spot context.

---

## 19. Integration with Public Attraction Module

Public attraction pages may link to the check-in flow.

Example:

```text
/attractions/aiyerweng-skywalk
```

CTA links to:

```text
/c/YLA001
```

if active check-in code exists.

---

## 20. Integration with Admin Module

Admin users must be able to:

- Create check-in code
- Assign code to attraction
- Assign code to photo spot
- Activate/deactivate code
- See public QR URL
- Print or copy QR link
- View basic scan count

QR image generation may be admin module or utility.

MVP can display the URL and let admin generate QR externally if needed.

---

## 21. Error Handling

## 21.1 Invalid Code

Do not create records except optional error event.

Show friendly message.

## 21.2 Inactive Code

Show unavailable message.

## 21.3 Attraction Not Found

Show unavailable message.

## 21.4 Photo Spot Inactive

If attraction is valid but photo spot inactive:

Option A:

```text
block the flow
```

Option B:

```text
continue attraction-level flow without photo spot
```

MVP recommended:

```text
block if checkin code explicitly points to inactive photo spot
```

## 21.5 Database Error

Show:

```text
We could not load this check-in page. Please try again.
```

Do not expose internal error.

---

## 22. Security Rules

## 22.1 Public Access

The QR route is public.

However:

- It should only expose public attraction context.
- It should not expose admin-only fields.
- It should not expose private tourist data.
- It should not expose storage private paths.

## 22.2 Rate Limiting

Future production should rate-limit excessive event creation.

MVP may skip rate limiting but should avoid easy abuse where possible.

## 22.3 Metadata Safety

Funnel event metadata must not store:

- email
- LINE user ID
- raw IP if not needed
- sensitive personal data
- uploaded photo data

---

## 23. Performance Requirements

## 23.1 Fast QR Load

The QR landing page must load quickly.

Reasons:

- Tourists may be on mobile data.
- Slow load reduces completion rate.
- QR flow is first impression.

Requirements:

- Fetch only required data.
- Use optimized hero image.
- Avoid heavy scripts.
- Lazy load non-critical sections.
- Show skeleton/loading state.

## 23.2 Query Indexes

Required indexes:

```text
checkin_codes(code)
checkin_codes(is_active)
checkin_codes(attraction_id)
checkin_codes(photo_spot_id)
funnel_events(event_name)
funnel_events(event_time)
funnel_events(attraction_id)
```

---

## 24. Accessibility Requirements

The check-in page must include:

- clear heading
- readable font
- large CTA button
- sufficient contrast
- accessible error messages
- no tiny links for important actions
- language switch if possible

---

## 25. UX Requirements

## 25.1 Keep First Screen Simple

Do not show:

- long survey
- login wall
- complex dashboard
- long privacy text
- too many buttons

Show:

- where the tourist is
- what they get
- how long it takes
- start button
- guest-friendly option

---

## 25.2 No Forced LINE

LINE should be optional.

Foreign tourists and non-LINE users must be able to continue.

---

## 25.3 Value Before Data

The check-in landing page should emphasize the reward:

```text
digital certificate
digital stamp
travel memory card
passport progress
```

Then ask for minimal data later.

---

## 26. Example User Stories

## 26.1 Tourist Scans Valid QR

As a tourist, I want to scan a QR code and open the correct attraction flow.

Acceptance:

```text
Given a valid active check-in code
When I open /c/[code]
Then I see the attraction and can start certificate creation
```

---

## 26.2 Foreign Tourist Without LINE

As a foreign tourist, I want to use the QR flow without LINE.

Acceptance:

```text
Given I scan a valid QR in normal browser
When the page loads
Then I can continue as guest
And I am not required to use LINE
```

---

## 26.3 Admin Deactivates QR

As an admin, I want to deactivate a QR code.

Acceptance:

```text
Given a QR code is inactive
When a tourist opens it
Then the system shows unavailable message
And does not create a visit
```

---

## 26.4 System Tracks QR Funnel

As a planner, I want to know how many people scanned QR codes.

Acceptance:

```text
Given users scan QR codes
When dashboard reads funnel events
Then qr_scanned counts are available by attraction
```

---

## 27. Edge Cases

## 27.1 QR Code Printed with Old URL

If code exists but inactive, show friendly message.

## 27.2 QR Code Typo

If code does not exist, show invalid message.

## 27.3 Attraction Deactivated

Block flow.

## 27.4 Photo Spot Deactivated

Block or fallback depending on business rule.

MVP: block.

## 27.5 User Opens QR Later at Hotel

Allow flow.

Do not require GPS.

The teacher stated tourists may complete later.

## 27.6 User Refreshes Page

Do not duplicate critical records.

Early events may duplicate, but visit/certificate creation must handle duplicates later.

## 27.7 User Opens Same QR Multiple Times

Allow page view.

Do not create multiple completed visits until user completes the flow again.

---

## 28. Dashboard Impact

This module provides data for:

```text
QR scan count
Landing page view count
Certificate start count
Attraction entry performance
Photo spot performance
Drop-off rate
```

Important dashboards:

```text
Funnel Analytics Dashboard
Attraction Performance Dashboard
Executive Dashboard
```

The optional post-certificate survey is stored against the completed visit. Authorized admins review aggregate trends in the travel behavior, expense, and satisfaction dashboard sections. Row-level responses are available at `/admin/surveys` and `/admin/surveys/[surveyId]` under separate permissions; optional comments require an additional permission.

The tourist-facing privacy notice must state that answers are linked to the current visit to prevent duplicates and are used for authorized operational review and aggregate planning. Do not describe these linked responses as anonymous.

`survey_started` uses the active check-in session for funnel-event deduplication and is not recorded again after a response already exists for that visit.

---

## 29. MVP Acceptance Checklist

```text
[ ] /c/[checkinCode] route exists.
[ ] Valid check-in code resolves attraction.
[ ] Valid check-in code resolves photo spot if present.
[ ] Invalid code shows friendly error.
[ ] Inactive code shows friendly unavailable page.
[ ] QR flow does not require LINE.
[ ] Guest continuation is visible.
[ ] Browser language is considered.
[ ] qr_scanned event is recorded.
[ ] landing_viewed event is recorded.
[ ] certificate_started event is recorded when CTA is clicked.
[ ] Context can be passed to tourist profile flow.
[ ] Page is mobile-first.
[ ] Page loads quickly.
```

---

## 30. Do Not Do

Do not:

```text
Create separate QR codes for LINE and non-LINE users.
Force LINE login before certificate creation.
Create a full visit record immediately for every QR scan unless intentionally designed.
Expose admin fields in public QR response.
Treat QR scan count as actual tourist visit count.
Require GPS verification.
Store personal data in funnel metadata.
Hardcode QR-to-attraction mapping in frontend.
```

---

## 31. Future Enhancements

Possible future improvements:

```text
LINE LIFF deep link
Email passport save
QR PDF export
Campaign-specific QR code
QR expiration by campaign
QR scan geolocation optional and consented
Abuse detection
A/B testing landing page
Dynamic CTA text by language
Dashboard QR conversion comparison
```

---

## 32. Definition of Done

This module is done when:

```text
[ ] QR route resolves active code correctly.
[ ] Attraction and photo spot context loads.
[ ] Invalid/inactive cases are handled.
[ ] Funnel events are recorded.
[ ] Guest users can continue.
[ ] No LINE requirement blocks users.
[ ] Context passes to next flow.
[ ] Mobile UX is clear.
[ ] Data model uses checkin_codes table.
[ ] Documentation and tests are updated.
```
