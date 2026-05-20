# PWA_STRATEGY.md

## 1. Document Purpose

This document defines the Progressive Web App strategy for the **Southern Border Tourism Data & Intelligence Platform**.

The tourist-facing experience should feel fast, mobile-friendly, and app-like because tourists will mainly access the system by scanning QR codes at attractions or photo spots.

The PWA strategy must support:

- QR check-in
- guest usage
- tourist profile flow
- photo upload
- certificate generation
- digital stamp/passport
- optional survey
- future offline resilience
- future installable app experience

---

## 2. PWA Mission

The mission of the PWA layer is:

```text
Make the tourist flow feel like a lightweight mobile app without requiring app installation.
```

Tourists should be able to:

- scan QR code
- open the page quickly
- continue as guest
- upload photo
- generate certificate
- collect stamp
- view passport
- optionally save passport with Google or LINE

The experience must work well in normal mobile browsers.

---

## 3. Why PWA Is Important for This Project

The project has a physical-to-digital flow:

```text
Tourist at attraction
    |
Scans QR code
    |
Opens mobile web app
    |
Receives certificate/stamp
    |
Provides useful tourism data
```

A PWA is suitable because:

- no app store installation is required
- QR opens directly in browser
- works for Thai and foreign tourists
- works without forcing LINE
- can later support install-to-home-screen
- can later support offline fallback
- can create an app-like user experience with low cost

---

## 4. MVP PWA Scope

MVP should focus on mobile web quality first.

Required MVP:

```text
mobile-first responsive UI
fast QR landing page
guest identity persistence
basic web app manifest
app icons if available
theme color
friendly offline/error fallback
safe local/session storage usage
photo upload on mobile
certificate download on mobile
passport page
```

Optional MVP:

```text
install prompt
service worker caching
offline queue
push notifications
```

Do not overbuild PWA features before the core flow works.

---

## 5. Phase 2 PWA Scope

Phase 2 may include:

```text
installable app experience
service worker caching
offline fallback page
offline-safe passport cache
queued funnel events
background sync where supported
home screen icon
app shortcuts
certificate cache
passport cache
improved install prompt
```

---

## 6. Production PWA Scope

Production may include:

```text
robust service worker strategy
asset precaching
runtime caching
offline event queue
upload retry handling
passport recovery prompts
safe storage lifecycle
performance monitoring
web push only if legally/ethically approved
```

Push notifications should not be implemented without a strong consent and communication strategy.

---

## 7. PWA Pages

Pages that should feel app-like:

```text
/c/[checkinCode]
/visit/profile
/visit/photo
/visit/certificate
/visit/success
/passport
/survey/[visitId]
```

Public attraction pages can be normal responsive web pages.

Admin pages do not need PWA behavior.

---

## 8. Manifest Requirements

MVP should include a web app manifest.

Recommended fields:

```json
{
  "name": "Southern Border Tourism Passport",
  "short_name": "Tourism Passport",
  "description": "Digital tourism certificate and passport for Southern Border attractions.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#0F766E",
  "orientation": "portrait-primary",
  "icons": []
}
```

Final app name can be updated later.

---

## 9. Theme Color

Recommended theme color:

```text
#0F766E
```

Reason:

- teal/green supports sustainable tourism
- feels modern and trustworthy
- works well with mobile browser UI

---

## 10. App Icons

MVP can use placeholder icons.

Production should include:

```text
192x192 icon
512x512 icon
maskable icon
apple-touch-icon
favicon
```

Icon design direction:

```text
digital passport
stamp
southern border travel
teal/gold accent
```

---

## 11. Mobile Browser Support

Support current versions of:

```text
Chrome Android
Safari iOS
LINE in-app browser
Samsung Internet
Edge mobile
```

Important:

LINE in-app browser may behave differently from normal browser.

The core flow must still work in normal browser and LINE browser.

---

## 12. Guest Identity Storage

The PWA may store an anonymous guest token.

## 12.1 Storage Options

Possible storage:

```text
localStorage
cookie
secure httpOnly cookie through server flow
```

MVP may use localStorage for anonymous guest token if no sensitive data is stored in it.

## 12.2 Guest Token Rules

The token must be:

```text
random
non-personal
not guessable
not based on email/name/LINE ID
not used as a secret for privileged access
```

## 12.3 User Message

Guest passport warning:

```text
Your passport is saved on this device only. Save with Google or LINE to access it later.
```

Thai:

```text
พาสปอร์ตของคุณจะถูกเก็บไว้บนอุปกรณ์นี้เท่านั้น หากต้องการเปิดจากอุปกรณ์อื่น ให้บันทึกด้วย LINE หรืออีเมล
```

---

## 13. Session Storage for Tourist Flow

Tourist flow needs temporary context:

```text
checkin_code
attraction_id
photo_spot_id
session_id
visit_id
language
```

Rules:

- do not store sensitive personal data in plain local storage.
- avoid storing uploaded photo base64 in local storage.
- keep temporary flow context small.
- clear stale flow context when complete.

---

## 14. Offline Strategy

## 14.1 MVP Offline Strategy

MVP should show friendly offline state.

If user is offline:

```text
You appear to be offline. Please reconnect to continue.
```

Thai:

```text
ดูเหมือนว่าอุปกรณ์ของคุณไม่ได้เชื่อมต่ออินเทอร์เน็ต กรุณาเชื่อมต่อแล้วลองอีกครั้ง
```

MVP does not need full offline submission.

## 14.2 Why Full Offline Is Not MVP

The system requires:

- QR code validation
- file upload
- database write
- certificate generation
- storage access

These are difficult offline.

## 14.3 Phase 2 Offline Improvements

Can cache:

```text
public attraction page shell
passport summary
already earned stamps
static assets
offline fallback page
```

Can queue:

```text
funnel events
non-critical analytics events
```

Do not queue photo uploads in MVP.

---

## 15. Caching Strategy

## 15.1 Static Assets

Cache:

```text
CSS
JS
icons
fonts if allowed
static images
manifest
```

## 15.2 Public Attraction Data

Can be cached carefully.

Potential strategy:

```text
stale-while-revalidate
```

But do not show outdated check-in availability if code is inactive.

## 15.3 QR Check-in Data

Do not aggressively cache QR validation.

Reason:

Check-in code may be deactivated.

Fetch fresh status when QR is opened.

## 15.4 Tourist Private Data

Do not cache sensitive tourist data broadly in service worker.

Passport cache must be careful and optional.

---

## 16. Service Worker Strategy

MVP can skip advanced service worker if development time is limited.

If implemented, service worker should:

```text
cache static assets
serve offline fallback
avoid caching private API responses by default
avoid interfering with upload/certificate generation
```

Do not create complex service worker logic that breaks the core flow.

---

## 17. Install Prompt Strategy

Do not force install prompt.

Recommended:

Show install/save prompt only after user receives value:

```text
after certificate generated
after stamp earned
on passport page
```

Message:

```text
Add this passport to your home screen for easier access.
```

Thai:

```text
เพิ่มพาสปอร์ตนี้ไว้บนหน้าจอหลักเพื่อเปิดใช้งานได้ง่ายขึ้น
```

---

## 18. iOS Considerations

iOS PWA support has limitations.

Important:

- install prompt is not automatic like Android.
- user may need instructions to Add to Home Screen.
- storage behavior may differ.
- file download behavior may vary.

Provide fallback:

```text
Download certificate image
Save image manually
Share button if supported
```

---

## 19. Android Considerations

Android Chrome supports better PWA install prompts.

Use:

```text
beforeinstallprompt
```

only if needed.

Do not show prompt too early.

---

## 20. LINE Browser Considerations

LINE in-app browser may affect:

- file upload
- download behavior
- LIFF behavior
- external browser opening
- local storage persistence

Rules:

- core flow must not require LIFF.
- if download fails in LINE browser, provide alternative instructions.
- allow opening in external browser if needed.
- LINE save should be optional.

---

## 21. Photo Upload PWA Requirements

Mobile photo upload must support:

```text
camera capture if browser supports
gallery selection
preview
upload progress
file size validation
file type validation
retry
```

Do not store large photos in local storage.

---

## 22. Certificate Download PWA Requirements

Certificate download should support:

```text
download image
save image
share image if supported
copy link if share page exists
```

If download is not supported in a browser, show instruction:

```text
Long press the image and save it to your device.
```

Thai:

```text
กดค้างที่รูปภาพแล้วเลือกบันทึกรูปภาพลงอุปกรณ์
```

---

## 23. Web Share API

Use Web Share API if available.

Possible share content:

```text
certificate image
certificate link
passport link
attraction link
```

Rules:

- sharing must be user initiated.
- do not share private data without user action.
- provide fallback.

---

## 24. Performance Requirements

PWA tourist flow must be fast.

Targets:

```text
QR landing should load quickly on mobile data.
Main CTA should appear as soon as possible.
Images should be optimized.
Certificate generation should show loading state.
```

Practical requirements:

- lazy load heavy sections
- avoid loading dashboard/admin code in tourist flow
- optimize images
- avoid unnecessary libraries in QR route
- use route-level splitting

---

## 25. Network Failure Handling

Handle:

```text
QR validation fails
profile save fails
photo upload fails
certificate generation fails
survey save fails
```

Each should show:

- friendly message
- retry option
- no raw technical error
- preserve user input where possible

---

## 26. Data Loss Prevention

For tourist flow:

- preserve form fields during validation errors.
- disable submit while saving.
- prevent double submit.
- show upload/generation progress.
- allow retry certificate generation.
- do not clear flow context until success.

---

## 27. Security Requirements

PWA must not store:

```text
service role key
LINE channel secret
admin tokens
raw provider_user_id
sensitive personal data
uploaded photo base64
```

Only store minimal non-sensitive context in browser storage.

---

## 28. Privacy Requirements

PWA must explain:

- guest passport limitation
- photo usage
- data collection purpose
- optional Google/LINE save
- survey optionality

Do not silently track sensitive personal data.

---

## 29. Analytics and Funnel Events

PWA should record these events:

```text
qr_scanned
landing_viewed
certificate_started
minimal_form_completed
photo_uploaded
certificate_generated
survey_started
survey_completed
passport_saved
```

For offline future:

- non-critical funnel events can be queued.
- critical database actions should be confirmed online.

---

## 30. PWA Testing Checklist

Test on:

```text
Chrome Android
Safari iOS
LINE browser
desktop Chrome mobile emulator
low network speed
offline mode
```

Test flows:

```text
scan/open QR
guest profile form
photo upload
certificate download
passport view
survey submit
reload during flow
back button during flow
```

---

## 31. MVP Acceptance Checklist

```text
[ ] Tourist pages are mobile-first.
[ ] QR landing loads quickly.
[ ] Guest token works.
[ ] Tourist flow context survives page navigation.
[ ] Basic manifest exists.
[ ] Theme color is configured.
[ ] Mobile photo upload works.
[ ] Certificate download works or has fallback.
[ ] Offline state is friendly.
[ ] LINE is not required.
[ ] Google is not required for tourist certificate creation.
[ ] Guest passport warning exists.
[ ] No secrets are stored in browser.
[ ] No sensitive data is cached unsafely.
```

---

## 32. Do Not Do

Do not:

```text
Require app installation.
Require LINE.
Require tourist Google login.
Store uploaded photos in localStorage.
Cache private API responses broadly.
Break QR validation with stale cache.
Show install prompt before user gets value.
Use IP address as the main tourist identity mechanism.
Use PWA as excuse to skip responsive design.
Store secrets in browser.
```

---

## 33. Future Enhancements

Possible future improvements:

```text
install prompt after stamp earned
offline passport view
cached attraction pages
queued analytics events
app shortcuts
push notification with consent
passport recovery
certificate cache
background sync
```

---

## 34. Final PWA Rule

A good PWA here is not about complex offline technology first.

A good PWA is a fast, reliable, mobile-first tourist flow that feels easy immediately after scanning a QR code.
