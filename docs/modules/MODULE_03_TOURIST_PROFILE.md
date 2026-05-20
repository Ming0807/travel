# MODULE_03_TOURIST_PROFILE.md

## 1. Module Name

**Tourist Profile Module**

---

## 2. Module Purpose

The Tourist Profile Module manages tourist profile data and identity recognition.

This module solves one of the most important UX and data quality problems in the project:

> A returning tourist should not be forced to enter the same profile information every time they visit a new attraction.

The module must support guest tourists, foreign tourists, Thai tourists, returning tourists, optional Google identity, optional LINE identity, future email identity, and identity linking.

---

## 3. Business Purpose

The project must collect high-quality tourist data for sustainable tourism planning.

However, tourists are unlikely to complete long forms repeatedly.

This module supports the project by:

- Collecting only minimal tourist profile data
- Reusing existing tourist data when possible
- Avoiding duplicate tourist profiles
- Supporting foreign tourists without LINE
- Supporting Thai tourists with optional LINE
- Supporting guest mode without login
- Supporting optional Google linking for cross-device passport and certificate history
- Linking multiple identities to one tourist profile
- Protecting privacy by collecting only necessary data

---

## 4. Core Design Decision

Tourist profile must be separated from tourist identity.

Correct:

```text
tourists
tourist_identities
tourist_contacts
consent_logs
```

Incorrect:

```text
tourists table contains line_user_id, email, device_id, every visit field, and survey answers
```

Reason:

One tourist can have many identities.

Example:

```text
tourist_id = 1001
identities:
  - anonymous_device
  - google
  - line
  - email future
```

This allows the system to link a guest user into a Google, LINE, or future email account later.

---

## 5. Primary Users

## 5.1 First-Time Tourist

A first-time tourist creates a minimal profile while generating a certificate.

The profile should be fast to complete.

## 5.2 Returning Guest Tourist

A returning guest tourist is recognized by anonymous device token.

The system should show saved profile data and allow reuse.

## 5.3 LINE User

A LINE user can save passport progress and return more easily.

LINE must be optional.

## 5.4 Email User

Email identity is a future option for passport/certificate recovery.

This is important for foreign tourists.

## 5.4.1 Google User

A Google-linked tourist can recover profile, passport, and certificate history across devices.

Google must be optional for tourists and must not block certificate generation.

## 5.5 Admin or Researcher

Admin and researchers may view tourist profile data in aggregated or permission-controlled views.

They should not see unnecessary personal identity data unless authorized.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- Guest tourist profile creation
- Anonymous device identity
- Minimal tourist form
- Returning guest recognition on same device
- Profile reuse confirmation
- Origin country/province fields
- Age group
- Preferred language
- Consent logging
- Privacy notice
- Identity table design
- Duplicate prevention by provider identity

## 6.2 In Scope for Phase 2

Phase 2 may include:

- LINE LIFF identity linking
- Email magic link identity
- Passport recovery by email
- Profile edit page
- Identity merge UI
- Consent preference management
- Tourist data anonymization tool
- Multi-language profile form

## 6.3 Out of Scope

This module does not directly handle:

- QR code resolution
- Photo upload
- Certificate rendering
- Survey question logic
- Dashboard calculations
- Admin attraction management

---

## 7. Related Modules

This module connects to:

```text
MODULE_02_QR_CHECKIN.md
MODULE_04_VISIT_RECORD.md
MODULE_05_PHOTO_UPLOAD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_07_DIGITAL_STAMP_PASSPORT.md
MODULE_08_SURVEY_EXPENSE_SATISFACTION.md
MODULE_12_LINE_LIFF_OPTIONAL.md
```

---

## 8. Required Data Tables

This module uses:

```text
tourists
tourist_identities
tourist_contacts
consent_logs
countries
provinces
```

It provides data to:

```text
visits
tourist_stamps
certificates
satisfaction_surveys
dashboard metrics
```

---

## 9. Main Responsibilities

The Tourist Profile Module must handle:

```text
anonymous guest identity
profile creation
profile update
profile reuse
identity lookup
identity linking
consent recording
privacy-safe data collection
duplicate prevention
```

---

## 10. Tourist Profile Data

## 10.1 Required MVP Fields

The minimal tourist profile should collect:

```text
display_name
origin_country_id or origin_province_id
age_group
preferred_language
```

The minimal flow also collects:

```text
consent confirmation
```

`visit_date` belongs to `visits` and should normally be derived from the check-in flow or asked only when needed for data correction. It should not make the pre-certificate form feel like a long registration form.

## 10.2 Field Definitions

### display_name

Purpose:

Used on certificate.

Rules:

- Required for certificate.
- Does not need to be legal name.
- Must not be too long.
- Should be editable before certificate generation.

Recommended max length:

```text
150 characters
```

### origin_country_id

Purpose:

Stores country of origin.

Rules:

- Required for foreign tourists.
- Should use country master data.
- Do not use free text.

### origin_province_id

Purpose:

Stores Thai province of origin for domestic tourists.

Rules:

- Required for Thai tourists if origin country is Thailand.
- Should use province master data.
- Do not collect full address.

### age_group

Purpose:

Supports demographic analysis without collecting exact date of birth.

Recommended values:

```text
under_18
18_24
25_34
35_44
45_54
55_64
65_plus
prefer_not_to_answer
```

### preferred_language

Purpose:

Supports Thai/English UX and future multilingual communication.

Recommended values:

```text
th
en
ms
```

MVP:

```text
th
en
```

---

## 11. Identity Data

## 11.1 Supported Identity Providers

Allowed providers:

```text
anonymous_device
google
line
email future
```

MVP required:

```text
anonymous_device
```

Optional MVP / Phase 2:

```text
google
line
```

Future:

```text
email
```

---

## 11.2 Anonymous Device Identity

Purpose:

Allow tourist to use the system without login.

Rules:

- Generate random token.
- Store in browser local storage or cookie.
- Use provider = `anonymous_device`.
- Create `provider_user_id` from token.
- Do not store personal data in token.
- Do not use IP address as the main tourist identity mechanism.
- Explain that guest passport may not work across devices.

Recommended flow:

```text
User opens QR
    |
No existing guest token
    |
Generate anonymous device token
    |
Create or link tourist identity when profile is submitted
```

---

## 11.3 LINE Identity

Purpose:

Improve returning user experience for Thai tourists.

Rules:

- Optional.
- Never required before certificate generation.
- Link LINE user ID to existing tourist when possible.
- Do not create a new tourist if the current guest profile already exists.
- Store only necessary LINE identity data.
- Communication requires consent.

---

## 11.3.1 Google Identity

Purpose:

Support cross-device recovery for tourist profile, passport, and certificate history.

Rules:

- Optional for tourists.
- Never required before certificate generation.
- Link Google identity to existing guest tourist when possible.
- Do not create a new tourist if the current guest profile already exists.
- Do not show Google subject or provider_user_id in public UI, dashboard, or default exports.
- Admin authentication may also use Google/Gmail-style login, but admin auth is separate from tourist identity linking.

---

## 11.4 Email Identity

Purpose:

Future passport/certificate recovery for tourists who prefer email.

Rules:

- Optional.
- Validate email format.
- Normalize to lowercase.
- Use email for passport recovery or certificate link only when user chooses it.
- Do not show email in dashboard.
- Do not require email before certificate generation.

---

## 11.5 Identity Linking

Identity linking is required for good UX.

Example:

```text
Step 1: Tourist starts as guest.
Step 2: Tourist receives certificate.
Step 3: Tourist chooses "Save passport with LINE".
Step 4: System links LINE identity to same tourist_id.
```

Rules:

- Link new identity to existing tourist profile.
- Do not create duplicate tourist profile.
- If identity already belongs to another tourist, require careful handling.
- MVP may avoid complex merge and only link if safe.

---

## 12. Consent Requirements

The module must record consent before saving tourist data.

## 12.1 Required Consent Data

Store:

```text
tourist_id
visit_id optional
consent_version
purpose
has_consented
consented_at
source
```

## 12.2 Consent Notice

The tourist form should show a short notice.

Example English:

```text
We will use your information to create your digital certificate and analyze tourism trends in aggregated form.
```

Example Thai:

```text
ระบบจะใช้ข้อมูลของคุณเพื่อสร้างใบประกาศดิจิทัล และวิเคราะห์ภาพรวมการท่องเที่ยวในรูปแบบสถิติ
```

## 12.3 Consent Rules

- Consent must be explicit.
- Consent checkbox must not be pre-checked.
- Tourist cannot submit required profile form without consent.
- Consent version must be stored.
- Consent purpose must be clear.

---

## 13. Tourist Form UX

## 13.1 Form Goal

The form should feel short and easy.

Target completion time:

```text
less than 1 minute
```

## 13.2 MVP Required Fields

Recommended order:

```text
Name on certificate
Origin country/province
Age group
Visit date
Consent
```

## 13.3 UI Components

Use:

- text input for display name
- country/province dropdown or searchable select
- age group chips/buttons
- date picker or default today
- consent checkbox

Avoid:

- long textarea before certificate
- full address field
- phone number required
- email required
- LINE required
- exact income
- exact birth date

---

## 14. Returning Tourist UX

## 14.1 Returning Guest

If existing anonymous device identity is found, show:

```text
Welcome back, [display_name].
Use your saved information?
```

Options:

```text
Use saved information
Edit information
Continue as new guest
```

## 14.2 Returning LINE or Email User

If identity is found, show:

```text
Welcome back.
We found your saved travel profile.
```

Then allow:

```text
Use saved information
Edit profile
```

## 14.3 Data Reuse Rules

Reused profile data:

```text
display_name
origin_country_id
origin_province_id
age_group
preferred_language
```

Visit-specific data must still be new:

```text
visit_date
attraction_id
photo_spot_id
travel behavior
expense
satisfaction
```

---

## 15. Duplicate Prevention

## 15.1 Identity Lookup Rule

Before creating a tourist profile, check:

```text
tourist_identities(provider, provider_user_id)
```

If found:

```text
reuse tourist_id
```

If not found:

```text
create tourist
create tourist_identity
```

## 15.2 Unique Constraint

Required:

```text
unique(provider, provider_user_id)
```

## 15.3 Do Not Create Tourist on QR Scan Alone

A QR scan should not automatically create a tourist profile.

Recommended:

```text
create tourist profile when minimal form is submitted
```

or when identity is confirmed.

---

## 16. Data Validation Rules

## 16.1 Display Name

Rules:

- Required.
- Trim whitespace.
- Minimum length: 1 or 2 characters.
- Maximum length: 150 characters.
- Do not allow only symbols.
- Use for certificate display only.

## 16.2 Origin

Rules:

- If origin country is Thailand, origin province should be selected.
- If origin country is not Thailand, origin province can be null.
- At least one origin field should exist.

## 16.3 Age Group

Rules:

- Must be one of allowed values.
- Do not accept arbitrary text.

## 16.4 Preferred Language

Rules:

- Must be one of supported language codes.
- Default from browser language if not selected.

## 16.5 Email

Rules if implemented:

- Optional.
- Must be valid email format.
- Normalize to lowercase.
- Do not store email as provider_user_id without normalization.

---

## 17. API or Service Responsibilities

Recommended service functions:

```text
getOrCreateGuestIdentity()
findTouristByIdentity(provider, providerUserId)
createTouristProfile(input)
updateTouristProfile(touristId, input)
linkIdentityToTourist(touristId, provider, providerUserId)
recordConsent(input)
getReturningTouristProfile(identity)
```

These can be implemented as server actions, API routes, or backend services.

---

## 18. Suggested Validation Schema

Conceptual TypeScript/Zod schema:

```ts
const touristProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(150),
  originCountryId: z.number().optional(),
  originProvinceId: z.number().optional(),
  ageGroup: z.enum([
    "under_18",
    "18_24",
    "25_34",
    "35_44",
    "45_54",
    "55_64",
    "65_plus",
    "prefer_not_to_answer"
  ]),
  preferredLanguage: z.enum(["th", "en"]).default("th"),
  hasConsented: z.literal(true)
});
```

Business validation:

```text
originCountryId or originProvinceId must exist.
```

---

## 19. Security and Privacy Rules

## 19.1 Do Not Collect

Do not collect in MVP:

```text
national ID
full legal name
full address
phone number required
date of birth
religion
ethnicity
health data
GPS history
```

## 19.2 Do Not Expose

Do not expose in dashboard:

```text
email
LINE user ID
device token
provider_user_id
raw contact value
```

## 19.3 Admin Access

Admin views should show only what is necessary.

Example:

- show display name
- show origin
- show age group
- hide or mask email unless permission allows

---

## 20. Dashboard Impact

Tourist profile data supports:

```text
origin country distribution
origin province distribution
age group distribution
preferred language distribution
new vs returning tourist
identity provider distribution
```

Important:

When analyzing visits, join tourists with visits.

Do not count all tourists if only visitors within a date range are needed.

---

## 21. Error Handling

## 21.1 Missing Required Field

Show friendly message.

Example:

```text
Please enter the name you want to show on your certificate.
```

## 21.2 Invalid Origin

Example:

```text
Please select where you are from.
```

## 21.3 Consent Not Accepted

Example:

```text
Please confirm consent so we can create your certificate and store your visit record.
```

## 21.4 Identity Conflict

Example:

```text
This account is already linked to another profile.
```

MVP can show a generic error and ask user to continue as guest.

---

## 22. Edge Cases

## 22.1 User Clears Browser Data

Anonymous device identity is lost.

System should treat user as new guest.

## 22.2 User Uses Another Device

Anonymous guest profile is not found.

User can use email or LINE in future to recover passport.

## 22.3 User Starts as Guest Then Adds LINE

Link LINE identity to existing tourist.

## 22.4 User Has Same Email with Different Case

Normalize email.

Example:

```text
Amin@Example.com -> amin@example.com
```

## 22.5 Tourist Wants to Edit Display Name

Allow edit before certificate generation.

Profile edit after certificate may not update old certificate unless regeneration is supported.

## 22.6 Tourist Does Not Want to Answer Age

Use:

```text
prefer_not_to_answer
```

---

## 23. Example User Stories

## 23.1 First-Time Guest Creates Profile

As a tourist, I want to create a certificate without logging in.

Acceptance:

```text
Given I open the certificate flow
When I enter minimal profile data and consent
Then the system creates a tourist profile and anonymous identity
```

---

## 23.2 Returning Guest Reuses Profile

As a returning tourist, I want to avoid entering the same data again.

Acceptance:

```text
Given I have a guest token from a previous visit
When I scan a new QR code
Then the system shows my saved profile and lets me reuse it
```

---

## 23.3 Foreign Tourist Without LINE

As a foreign tourist, I want to use the system without LINE.

Acceptance:

```text
Given I do not have LINE
When I open the profile form
Then I can continue as guest or optionally save by email
```

---

## 23.4 Tourist Links LINE Later

As a tourist, I want to save my passport with LINE after receiving a certificate.

Acceptance:

```text
Given I completed as guest
When I connect LINE
Then LINE identity is linked to my existing tourist profile
```

---

## 24. MVP Acceptance Checklist

```text
[ ] Minimal tourist form exists.
[ ] Guest user can continue without login.
[ ] Anonymous device token is generated.
[ ] Tourist profile is created after form submission.
[ ] Tourist identity is created after form submission.
[ ] Returning guest can be recognized on same device.
[ ] Profile data can be reused.
[ ] Consent is required and logged.
[ ] Origin country/province uses master data.
[ ] Age group uses controlled values.
[ ] No full address is required.
[ ] No email is required.
[ ] No LINE login is required.
[ ] Duplicate identity is prevented.
[ ] Tourist profile is separate from visits.
```

---

## 25. Do Not Do

Do not:

```text
Create a new tourist every time QR is scanned.
Force LINE login.
Force email.
Ask for full address.
Ask for national ID.
Ask for legal full name.
Store visit fields in tourists table.
Store survey answers in tourists table.
Expose provider_user_id in dashboard.
Use free-text province/country.
Skip consent logging.
```

---

## 26. Future Enhancements

Possible future additions:

```text
email magic link
LINE LIFF identity
profile edit page
passport recovery
identity merge tool
privacy request handling
tourist anonymization tool
multi-language profile form
consent preference center
```

---

## 27. Definition of Done

This module is done when:

```text
[ ] Tourist profile can be created.
[ ] Guest identity works.
[ ] Returning guest is recognized.
[ ] Profile reuse works.
[ ] Consent logging works.
[ ] Data validation works.
[ ] No unnecessary personal data is collected.
[ ] Tourist and visit data are separated.
[ ] Documentation and tests are updated.
