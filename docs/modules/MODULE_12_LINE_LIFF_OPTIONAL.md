# MODULE_12_LINE_LIFF_OPTIONAL.md

## 1. Module Name

**Optional LINE LIFF Integration Module**

---

## 2. Module Purpose

The Optional LINE LIFF Integration Module allows tourists to save and recover their digital passport through LINE.

This module is optional and must never block the core tourist flow.

The system must work for:

- Thai tourists with LINE
- Thai tourists without LINE
- foreign tourists without LINE
- guest users
- users with optional Google login
- email users in future

LINE is a convenience and engagement channel, not a requirement.

---

## 3. Business Purpose

Many Thai users are familiar with LINE.

LINE can improve:

- returning tourist recognition
- passport recovery
- certificate link delivery
- campaign engagement
- future notification workflows

However, foreign tourists or users without LINE must still be able to use the system.

Therefore, LINE must be optional.

---

## 4. Core Design Decision

The QR code should not be separated into LINE and non-LINE QR codes.

Correct:

```text
One QR code -> /c/[checkinCode] -> system detects context
```

Then the system may offer:

```text
Continue as Guest
Save with Google
Save with LINE
```

Incorrect:

```text
Separate QR for LINE
Separate QR for browser
Separate QR for foreigners
```

Reason:

- one QR is easier to place at attractions
- better UX
- better analytics
- less confusion
- supports all users
- keeps LINE and Google optional for tourists

---

## 5. Primary Users

## 5.1 Thai Tourist with LINE

Can save passport through LINE.

## 5.2 Tourist Without LINE

Can continue as guest.

## 5.3 Foreign Tourist

Can continue as guest or email later.

## 5.4 Returning LINE User

Can recover profile/passport through LINE identity.

## 5.5 Admin

Configures LINE integration and may view channel analytics in future.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP does not require full LINE LIFF.

However, the system design must prepare for it.

MVP can include:

- optional "Save with LINE" button placeholder
- identity table support for provider = line
- no forced LINE login
- no forced Google login for tourist certificate creation
- architecture documentation
- environment variable plan

## 6.2 In Scope for Phase 2

Phase 2 includes:

- LINE LIFF app setup
- LIFF login
- LINE user ID retrieval
- link LINE identity to tourist profile
- returning LINE user detection
- save passport through LINE
- optional certificate link message
- LINE share button
- consent for communication
- LINE error handling

## 6.3 Out of Scope

This module does not handle:

- main QR resolution
- certificate rendering
- dashboard calculations
- survey logic
- email magic link
- Google tourist linking implementation
- push notifications without consent

---

## 7. Related Modules

This module connects to:

```text
MODULE_02_QR_CHECKIN.md
MODULE_03_TOURIST_PROFILE.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_07_DIGITAL_STAMP_PASSPORT.md
MODULE_11_REPORT_EXPORT.md
```

---

## 8. Required Data Tables

This module uses:

```text
tourists
tourist_identities
tourist_contacts
consent_logs
tourist_stamps
certificates
```

Provider value:

```text
line
```

Optional future tables:

```text
line_message_logs
notification_preferences
communication_consents
```

---

## 9. LINE Identity Model

LINE identity should be stored in:

```text
tourist_identities
```

Recommended fields:

```text
identity_id
tourist_id
provider = line
provider_user_id = LINE user ID
is_primary
last_seen_at
created_at
```

Do not store LINE data directly in `tourists` table.

---

## 10. LINE Flow Options

## 10.1 Save with LINE After Certificate

Recommended.

Flow:

```text
Tourist uses system as guest
    |
Tourist generates certificate
    |
Tourist earns stamp
    |
System offers "Save passport with LINE"
    |
Tourist opens LIFF authorization
    |
System gets LINE user ID
    |
System links LINE identity to existing tourist_id
    |
Passport becomes recoverable via LINE
```

Why this is good:

- no login wall
- tourist already received value
- higher willingness to connect LINE
- guest and foreign users are not blocked

---

## 10.2 LINE Login Before Flow

Not recommended for MVP.

Problem:

- increases friction
- blocks non-LINE users
- foreign tourists may abandon
- weakens QR universality

Use only as optional shortcut for returning users.

The same principle applies to Google: tourist Google login may be useful for cross-device passport recovery, but it must not be required before certificate generation or download.

---

## 10.3 LINE Rich Menu Future

Future LINE Rich Menu can include:

```text
My Passport
My Certificates
Nearby Attractions
Current Campaign
Help
```

Not required for MVP.

---

## 11. LINE LIFF Technical Requirements

Phase 2 requires:

```text
LINE Developers account
LINE Login channel
LIFF app
LIFF ID
Callback URL
Allowed endpoint URL
Environment variables
Frontend LIFF SDK
Server-side identity linking endpoint
```

Environment variables:

```text
NEXT_PUBLIC_LIFF_ID
LINE_CHANNEL_ID
LINE_CHANNEL_SECRET
LINE_CALLBACK_URL
```

Do not expose channel secret to frontend.

---

## 12. LIFF Initialization

Frontend should:

```text
load LIFF SDK
initialize with LIFF ID
check login status
login if user chooses LINE
get profile or ID token
send identity token to server
```

Server should:

```text
verify LINE identity/token if applicable
extract LINE user ID
link to tourist profile
store provider identity
```

MVP placeholder does not need this.

---

## 13. Identity Linking Rules

## 13.1 Guest to LINE

If current tourist exists as guest:

```text
link LINE identity to same tourist_id
```

Do not create new tourist.

## 13.2 Returning LINE User

If LINE identity exists:

```text
load existing tourist profile
load passport
```

## 13.3 LINE Identity Conflict

If LINE identity is already linked to another tourist:

- do not silently merge.
- show safe error.
- allow support/admin resolution later.

MVP can avoid complex merge.

---

## 14. Consent Requirements

LINE can be used only for identity unless user consents to communication.

Separate consent purposes:

```text
identity_linking
certificate_delivery
passport_recovery
marketing_or_campaign_notifications
```

Do not send promotional messages without consent.

---

## 15. User Experience Requirements

## 15.1 Button Placement

Show LINE option after the user receives value.

Suggested locations:

```text
certificate success page
passport page
stamp earned page
```

Button text:

```text
Save Passport with LINE
```

Thai:

```text
บันทึกพาสปอร์ตด้วย LINE
```

## 15.2 Alternative Options

Always show alternatives:

```text
Continue as Guest
Save with Google
```

Do not make LINE the only path.

## 15.3 Guest Warning

If user remains guest:

```text
Your passport is saved on this device only. Save with Google or LINE to access it later.
```

Thai:

```text
พาสปอร์ตของคุณจะถูกเก็บไว้บนอุปกรณ์นี้เท่านั้น หากต้องการเปิดดูภายหลังจากอุปกรณ์อื่น ให้บันทึกด้วย LINE หรืออีเมล
```

---

## 16. LINE Messaging

## 16.1 MVP Status

Not required.

## 16.2 Future Message Types

Possible messages:

```text
certificate link
passport link
new stamp earned
campaign announcement
nearby attraction suggestion
survey reminder
```

## 16.3 Messaging Rules

- send only with consent.
- allow opt-out.
- log messages.
- avoid spam.
- avoid sensitive data in message text.

Future table:

```text
line_message_logs
```

---

## 17. LINE Share

Sharing is different from messaging.

Tourist may choose to share certificate or passport.

Possible future features:

```text
LINE share button
Web Share API
copy link
```

Rules:

- sharing must be user-initiated.
- do not auto-post.
- do not expose private data.

---

## 18. Error Handling

## 18.1 LIFF Not Available

Message:

```text
LINE connection is not available right now. You can continue as guest.
```

## 18.2 User Cancels LINE Login

Message:

```text
No problem. You can continue as guest.
```

## 18.3 LINE Identity Already Linked

Message:

```text
This LINE account is already linked to another passport.
```

## 18.4 Token Verification Failed

Message:

```text
We could not verify your LINE account. Please try again or continue as guest.
```

## 18.5 Network Error

Message:

```text
Could not connect to LINE. Please try again later.
```

---

## 19. Security Requirements

## 19.1 Secret Handling

Never expose:

```text
LINE_CHANNEL_SECRET
server access tokens
service role keys
```

to frontend.

## 19.2 Token Verification

Server should verify LINE identity before linking.

Do not trust only client-submitted user ID.

## 19.3 Provider User ID

Store LINE user ID as provider_user_id in `tourist_identities`.

Do not expose it in dashboard or exports.

## 19.4 Access Control

A LINE user should only access their own passport.

---

## 20. Privacy Requirements

LINE identity is personal data.

Rules:

- optional.
- explain why LINE is used.
- do not require for certificate.
- do not export LINE ID by default.
- do not send messages without consent.
- allow future unlink or delete request.

---

## 21. Dashboard Impact

LINE integration can support metrics:

```text
guest users
LINE-linked users
Google-linked or future email-linked users
passport save rate
returning LINE tourists
certificate-to-LINE-save conversion
```

Source:

```text
tourist_identities
funnel_events
```

Important:

Identity provider distribution helps evaluate whether LINE is useful.

---

## 22. Export Rules

Default exports should not include LINE user IDs.

Allowed safe field:

```text
identity_provider = line
```

Restricted field:

```text
provider_user_id
```

Only export provider_user_id with high permission and clear purpose.

---

## 23. Performance Requirements

LINE SDK should not slow down the base QR flow.

Rules:

- load LIFF only when needed if possible.
- do not block guest flow while LINE initializes.
- show loading state during LINE linking.
- fallback gracefully.

---

## 24. Edge Cases

## 24.1 Tourist Has No LINE

Continue as guest or email.

## 24.2 Foreign Tourist

Show English and guest/email options.

Do not push LINE as primary.

## 24.3 User Opens in Normal Browser

LINE save button can redirect or open LIFF if supported.

If not, continue guest.

## 24.4 User Opens in LINE Browser

LINE option can be more prominent.

Still allow guest.

## 24.5 Guest Clears Browser Before Linking

Passport may be lost.

Warn user earlier.

## 24.6 Same LINE Used on Multiple Devices

This is a benefit.

LINE identity should recover passport.

## 24.7 Existing Guest and Existing LINE Profile Conflict

Do not auto-merge two different tourist profiles.

Show message and handle later.

---

## 25. Example User Stories

## 25.1 Guest Saves Passport with LINE

As a guest tourist, I want to save my passport with LINE after earning a stamp.

Acceptance:

```text
Given I completed certificate flow as guest
When I choose Save Passport with LINE
Then my LINE identity is linked to my existing tourist profile
```

## 25.2 Foreign Tourist Continues Without LINE

As a foreign tourist, I want to use the system without LINE.

Acceptance:

```text
Given I do not use LINE
When I scan QR
Then I can continue as guest or email
```

## 25.3 Returning LINE User Opens Passport

As a returning LINE user, I want to see my saved passport.

Acceptance:

```text
Given my LINE identity is linked
When I open passport through LINE
Then the system loads my tourist profile and stamps
```

## 25.4 User Cancels LINE Login

As a tourist, I want to cancel LINE login and still continue.

Acceptance:

```text
Given I start LINE linking
When I cancel
Then the system lets me continue as guest
```

---

## 26. MVP Acceptance Checklist

For MVP preparation:

```text
[ ] tourist_identities supports provider = line.
[ ] Core flow does not require LINE.
[ ] QR code design does not split LINE/non-LINE users.
[ ] UI has optional LINE save placeholder or future hook.
[ ] Guest flow works without LINE.
[ ] Foreign users are supported without LINE.
[ ] Documentation explains LINE as optional.
```

For Phase 2 implementation:

```text
[ ] LIFF app is configured.
[ ] LIFF ID is set in environment.
[ ] LINE identity is verified server-side.
[ ] LINE identity links to existing tourist.
[ ] Returning LINE user can load passport.
[ ] User can cancel and continue as guest.
[ ] Communication consent is separated.
[ ] LINE ID is not exposed in dashboard/export.
```

---

## 27. Do Not Do

Do not:

```text
Force LINE login before certificate.
Force Google login before certificate.
Create separate QR code for LINE users.
Block foreign tourists without LINE.
Store LINE user ID directly in tourists table.
Expose LINE user ID in dashboard.
Expose Google subject or provider_user_id in dashboard.
Send LINE messages without consent.
Auto-merge conflicting profiles.
Load LINE SDK in a way that breaks guest flow.
Treat LINE as the only identity strategy.
```

---

## 28. Future Enhancements

Possible future features:

```text
LINE Rich Menu
certificate delivery through LINE
passport link through LINE
campaign messages with consent
LINE share card
LINE-based returning user analytics
LINE notification preferences
unlink LINE account
admin LINE message log
```

---

## 29. Definition of Done

For MVP planning, this module is done when:

```text
[ ] LINE is documented as optional.
[ ] Database can support LINE identity.
[ ] Core flow works without LINE.
[ ] QR strategy remains one universal QR.
[ ] Guest and foreign tourist flows are protected.
```

For Phase 2 implementation, this module is done when:

```text
[ ] LIFF login works.
[ ] LINE identity is verified.
[ ] LINE identity links to tourist profile.
[ ] Returning LINE passport works.
[ ] Consent rules are followed.
[ ] Error handling is friendly.
[ ] Documentation and tests are updated.
```
