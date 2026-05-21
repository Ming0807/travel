# MODULE_12_LINE_LIFF_OPTIONAL.md

## 1. Module Name

**Optional LINE LIFF Integration Module**

---

## 2. Module Purpose

The Optional LINE LIFF Integration Module allows tourists to save their digital passport through LINE and supports future recovery once the returning-user flow is implemented and verified.

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
- certificate link delivery in a future communication feature
- campaign engagement only after separate consent
- future notification workflows only after separate communication consent

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

Can recover profile/passport through LINE identity only after the returning LINE recovery flow is implemented and verified.

## 5.5 Admin

Configures LINE integration and may view channel analytics in future.

---

## 6. Module Scope

## 6.1 In Scope for Phase 11 Optional Foundation

Phase 11 does not require full LINE LIFF production behavior.

It prepares the optional LINE linking foundation while preserving the guest-first tourist flow.

Phase 11 can include:

- optional "Save with LINE" button or hook after certificate/download/stamp or on the passport page
- identity table support for provider = line
- environment variable naming for `NEXT_PUBLIC_LIFF_ID`, `LINE_CHANNEL_ID`, and `LINE_CHANNEL_SECRET`
- server-side token verification contract before linking
- separate LINE linking consent/notice
- dashboard/export rules that hide LINE ID and `provider_user_id`
- no forced LINE login
- no forced Google login for tourist certificate creation
- architecture documentation
- environment variable plan

## 6.2 Future Production Work

After the Phase 11 foundation, optional LINE integration may include:

- LINE LIFF app setup
- LIFF login
- server-verified LINE user ID retrieval
- link LINE identity to tourist profile
- returning LINE user detection
- save passport through LINE
- optional certificate link message with separate communication consent
- LINE share button initiated by the tourist
- consent for communication
- LINE error handling

Do not describe these as production-complete until they are implemented and verified.

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

These future tables are not required for the Phase 11 linking foundation and must not be used to imply that LINE messaging is complete.

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

Rules:

- derive `provider_user_id` only after server-side token verification.
- do not trust a client-submitted LINE user ID by itself.
- do not expose `provider_user_id` in public UI, dashboard, certificate, share URL, or default export.

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
Server verifies LINE token and derives LINE user ID
    |
System links LINE identity to existing tourist_id
    |
Passport can support recovery after returning-user flow is implemented
```

Why this is good:

- no login wall
- tourist already received value
- higher willingness to connect LINE
- guest and foreign users are not blocked

---

## 10.2 LINE Login Before Flow

Not recommended for Phase 11.

Problem:

- increases friction
- blocks non-LINE users
- foreign tourists may abandon
- weakens QR universality

Use only as an optional shortcut for returning users after that flow is implemented and verified.

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

Not required for Phase 11.

---

## 11. LINE LIFF Technical Requirements

Phase 11 foundation documents:

```text
LINE Developers account
LINE Login channel
LIFF app
LIFF ID
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
```

Do not expose channel secret to frontend.
Do not use `NEXT_PUBLIC_LINE_LIFF_ID`.

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
verify LINE identity/token server-side
extract LINE user ID
link to tourist profile
store provider identity
```

The client must not send a raw LINE user ID as the trusted linking value.

---

## 13. Identity Linking Rules

## 13.1 Guest to LINE

If current tourist exists as guest and the LINE token is verified server-side:

```text
link LINE identity to same tourist_id
```

Do not create a new tourist or expose `provider_user_id`.

## 13.2 Returning LINE User

If LINE identity exists and returning LINE recovery is implemented:

```text
load existing tourist profile
load passport
```

Phase 11 foundation may prepare this contract, but should not claim returning LINE recovery is production-complete unless the full flow is implemented and verified.

## 13.3 LINE Identity Conflict

If LINE identity is already linked to another tourist:

- do not silently merge.
- show safe error.
- allow support/admin resolution later.

Phase 11 can avoid complex merge.

---

## 14. Consent Requirements

LINE can be used only for optional identity linking unless user separately consents to communication.

Separate consent purposes:

```text
identity_linking
certificate_delivery future
passport_recovery future
marketing_or_campaign_notifications future
```

Do not send promotional messages without consent.
Do not bundle LINE linking consent with certificate generation, survey, or communication consent.

---

## 15. User Experience Requirements

## 15.1 Button Placement

Show LINE option after the user receives value and certificate download is already available.

Suggested locations:

```text
certificate success page
passport page
stamp earned page
```

Do not place LINE linking before certificate generation, certificate download, stamp award, or optional survey access.

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

## 16.1 Phase 11 Status

Not part of Phase 11. LINE messaging, notification preferences, and message logs are future work.

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

- implement only after separate communication consent exists.
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

Server must verify LINE identity before linking.

Do not trust a client-submitted user ID. The browser may send a LINE ID token or access token, but the server must verify it with LINE and derive the LINE user ID server-side.

## 19.3 Provider User ID

Store LINE user ID as `provider_user_id` in `tourist_identities`.

Do not expose it in public UI, certificates, share URLs, dashboards, logs, or default exports.

## 19.4 Access Control

A LINE user should only access their own passport.

---

## 20. Privacy Requirements

LINE identity is personal data.

Rules:

- optional.
- explain why LINE is used.
- do not require for certificate.
- do not require for certificate download, stamp award, or optional survey.
- do not export LINE ID or `provider_user_id` by default.
- do not send messages without consent.
- allow future unlink or delete request without claiming it is complete in Phase 11.

---

## 21. Dashboard Impact

LINE integration can support metrics:

```text
guest users
LINE-linked users
Google-linked or future email-linked users
passport save rate
returning LINE tourists future
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

Only export `provider_user_id` with high permission, clear purpose, and documented approval.

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

This is a future benefit after returning LINE recovery is implemented.

Phase 11 foundation may store the linked identity, but must not claim cross-device recovery is production-complete unless verified.

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
Then the server verifies my LINE token
And my LINE identity is linked to my existing tourist profile
And provider_user_id is not exposed to the browser, dashboard, or default exports
```

## 25.2 Foreign Tourist Continues Without LINE

As a foreign tourist, I want to use the system without LINE.

Acceptance:

```text
Given I do not use LINE
When I scan QR
Then I can continue as guest or email
```

## 25.3 Future Returning LINE User Opens Passport

As a returning LINE user, I may want to see my saved passport in a future verified recovery flow.

Acceptance:

```text
Given my LINE identity is linked
When I open passport through LINE
Then the system loads my tourist profile and stamps if the returning-user flow is implemented and authorized
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

## 26. Phase 11 Acceptance Checklist

For Phase 11 optional foundation:

```text
[x] tourist_identities supports provider = line.
[x] Core flow does not require LINE before certificate, download, stamp, or survey.
[x] QR code design does not split LINE/non-LINE users.
[x] UI has optional LINE save CTA after reward and on passport/profile.
[x] Guest flow works without LINE.
[x] Foreign users are supported without LINE.
[x] Server-side token verification is documented before linking.
[x] Separate LINE linking consent is documented.
[x] LINE ID and provider_user_id are not exposed in dashboard/export.
[x] Documentation explains LINE as optional.
```

For future production completion:

```text
[ ] LIFF app is configured.
[ ] LIFF ID is set in environment.
[x] LINE identity is verified server-side when `/api/line/link` is called.
[x] LINE identity links to existing guest tourist when current guest identity exists.
[ ] Returning LINE user can load passport, if implemented.
[x] User can cancel and continue as guest.
[ ] Communication consent is separated.
[x] LINE ID is not exposed in dashboard/export.
```

---

## 27. Do Not Do

Do not:

```text
Force LINE login before certificate.
Force LINE before certificate download, stamp award, or optional survey.
Force Google login before certificate.
Create separate QR code for LINE users.
Block foreign tourists without LINE.
Store LINE user ID directly in tourists table.
Expose LINE user ID in dashboard.
Expose Google subject or provider_user_id in dashboard.
Send LINE messages without consent.
Claim LINE notifications, unlinking, or returning recovery are production-complete without implementation evidence.
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

For Phase 11 optional foundation, this module is done when:

```text
[x] LINE is documented as optional.
[x] Database can support LINE identity.
[x] Core flow works without LINE.
[x] QR strategy remains one universal QR.
[x] Guest and foreign tourist flows are protected.
[x] Environment docs use NEXT_PUBLIC_LIFF_ID, LINE_CHANNEL_ID, and LINE_CHANNEL_SECRET.
[x] Server-side token verification and separate LINE linking consent are documented.
```

For future production implementation, this module is done when:

```text
[ ] LIFF login works.
[x] LINE identity is verified server-side by the Phase 11 foundation route.
[x] LINE identity links to tourist profile for current guest passport.
[ ] Returning LINE passport works if included in that release.
[x] Consent rules are followed for LINE linking.
[x] Error handling is friendly.
[x] Documentation and tests are updated.
```
