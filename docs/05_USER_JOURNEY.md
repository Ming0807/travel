# 05_USER_JOURNEY.md

## 1. Purpose

This document describes the complete user journeys for all major user types in the system.

---

## 2. First-Time Tourist Journey

### 2.1 Happy Path

```text
1. Tourist arrives at attraction
2. Tourist sees QR code sign at photo spot
3. Tourist scans QR with phone camera
4. Phone opens /c/[checkinCode] in browser
5. System resolves check-in code → attraction + photo spot
6. Landing page shows:
   - Attraction name and photo
   - "Create Your Travel Certificate" button
7. Tourist taps "Create Certificate"
8. Tourist uploads travel photo
   - Camera or gallery selection
   - Photo preview shown
9. Tourist fills minimal form:
   - Name on certificate
   - Origin (country/province)
   - Age group
   - Visit date (pre-filled)
   - Consent checkbox
10. Tourist submits form
11. System creates:
    - Tourist profile (guest)
    - Visit record
    - Photo record
12. Certificate preview is generated
13. Tourist downloads certificate
14. Digital stamp is earned
15. Tourist sees "Want to help improve tourism?" prompt
16. Tourist optionally fills survey:
    - Travel companion
    - Transport mode
    - Spending range
    - Satisfaction rating
    - Revisit intention
17. Tourist sees passport with first stamp
18. Tourist sees "Save your passport" option
19. Journey complete
```

### 2.2 Error Paths

| Scenario | System Response |
|---|---|
| Invalid QR code | Show "This QR code is not valid" with home link |
| Inactive check-in code | Show "This spot is temporarily unavailable" |
| Invalid file type | Show "Please upload a JPEG, PNG, or WebP image" |
| File too large | Show "Image must be smaller than 5MB" |
| Form validation error | Highlight field with clear error message |
| Network error on submit | Show retry button, preserve entered data |

---

## 3. Returning Tourist Journey (Same Device)

```text
1. Tourist scans QR at a different attraction
2. System opens /c/[checkinCode]
3. System detects existing guest token in browser
4. System retrieves existing tourist profile
5. Landing page shows:
   - "Welcome back, [name]!"
   - Attraction info
   - "Create Certificate" button
6. Tourist taps "Create Certificate"
7. Tourist uploads new photo
8. Minimal form is PRE-FILLED:
   - Name (from profile)
   - Origin (from profile)
   - Age group (from profile)
   - Visit date (today)
   - Consent (re-confirm)
9. Tourist confirms or edits, then submits
10. New visit record created (no duplicate profile)
11. New certificate generated
12. New stamp earned (if first visit to this attraction)
13. Passport updated with new stamp
14. Optional survey shown
```

---

## 4. Returning Tourist Journey (Different Device / Linked)

```text
1. Tourist scans QR on new device
2. System does not find guest token
3. Landing page shows identity options:
   - "Continue as Guest"
   - "Sign in with LINE"
   - "Sign in with Email"
4. Tourist chooses LINE or email
5. System finds linked tourist profile
6. Profile data is restored
7. Passport with existing stamps is shown
8. Tourist continues with certificate creation
9. New visit and stamp are added to existing profile
```

---

## 5. Foreign Tourist Journey

```text
1. Tourist scans QR
2. System detects browser language = English
3. Landing page displays in English
4. Tourist sees attraction info in English
5. "Create Your Travel Certificate" button
6. Tourist uploads photo
7. Minimal form in English:
   - Name on certificate
   - Country (dropdown with international countries)
   - Age group
   - Visit date
   - Consent
8. Certificate generated
9. Stamp earned
10. Optional survey in English
11. "Save passport" via email option (no LINE)
```

---

## 6. Admin Journey: Attraction Setup

```text
1. Admin logs in to /admin
2. Admin navigates to Attraction Management
3. Admin creates new attraction:
   - Name (TH/EN)
   - Province + District
   - Attraction type
   - Description + History
   - Upload images
   - Set coordinates
   - Set status = Published
4. Admin creates Photo Spot:
   - Name
   - Assign to attraction
   - Description
5. System generates check-in code
6. Admin views QR code URL
7. Admin prints/displays QR at physical location
8. System is ready for tourist scans
```

---

## 7. Admin Journey: Daily Operations

```text
1. Admin logs in
2. Admin checks Dashboard:
   - Today's visits
   - New certificates
   - Survey completion rate
3. Admin reviews Visit Records:
   - Filter by date range
   - Filter by province
   - View individual visit details
4. Admin checks Satisfaction:
   - Low-rated attractions flagged
   - Recent comments reviewed
5. Admin exports monthly report (CSV)
6. Admin logs out
```

---

## 8. Researcher Journey: Dashboard Analysis

```text
1. Researcher logs in with viewer role
2. Researcher opens Executive Dashboard:
   - Total tourists, visits, certificates
   - Province comparison chart
3. Researcher drills into Tourist Profile Dashboard:
   - Origin distribution
   - Age group chart
   - New vs returning ratio
4. Researcher opens Satisfaction Dashboard:
   - Average scores by attraction
   - Revisit intention rate
5. Researcher exports filtered dataset
6. Researcher uses data for academic report
```

---

## 9. Journey Metrics

Each journey generates funnel events for analytics:

| Event | Journey Point |
|---|---|
| `qr_scanned` | QR code scanned |
| `landing_viewed` | Check-in page loaded |
| `certificate_started` | "Create Certificate" tapped |
| `photo_uploaded` | Photo successfully uploaded |
| `form_completed` | Minimal form submitted |
| `certificate_generated` | Certificate created |
| `stamp_earned` | Stamp assigned |
| `survey_started` | Survey section opened |
| `survey_completed` | Survey submitted |
| `passport_saved` | Identity linked |

---

## 10. Journey Design Principles

1. **Value before effort:** Tourist receives certificate before optional survey
2. **Progressive disclosure:** Show only what's needed at each step
3. **Pre-fill when possible:** Use saved data for returning tourists
4. **Clear error recovery:** Never lose tourist's data on error
5. **Mobile-first:** All journeys designed for phone-sized screens
6. **Language-aware:** Detect and respond to browser language
7. **No dead ends:** Every error screen has a path forward
