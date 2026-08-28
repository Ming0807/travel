# UI_UX_PRINCIPLES.md

## 1. Document Purpose

This document defines the UI/UX principles for the **Southern Border Tourism Data & Intelligence Platform**.

The system must feel professional, trustworthy, mobile-friendly, and easy to use.

The UX must support the main project challenge:

> How can we motivate tourists to give useful data without making the process feel difficult?

---

## 2. UX Mission

The UX mission is:

```text
Give tourists value first, then ask for useful data with minimal friction.
```

The tourist should feel:

- this is easy
- this is useful
- this is safe
- this is worth completing
- this gives me a nice travel memory

Admins and planners should feel:

- the system is professional
- data is organized
- dashboard numbers are clear
- actions are safe
- reports are credible

---

## 3. Core UX Strategy

## 3.1 Value Before Data

Do not start with a long form.

Recommended tourist flow:

```text
Scan QR
    |
See benefit
    |
Enter minimal data
    |
Upload photo
    |
Get certificate and stamp
    |
Optional survey
```

The reward motivates completion.

---

## 3.2 Minimal Required Fields

Only ask what is necessary before certificate generation.

Required before certificate:

```text
display name
origin country/province
age group
visit date
consent
photo
```

Ask deeper planning questions after reward:

```text
travel behavior
spending range
satisfaction
comment
```

---

## 3.3 No Forced Login

Tourists must be able to continue as guest.

Do not force:

```text
LINE
email
account registration
Google login
phone number
```

Google/LINE can be offered after value is delivered.

---

## 3.4 One Universal QR

Use one QR code per attraction/photo spot.

The system should adapt after opening.

Do not create separate QR codes for:

```text
Thai users
foreign users
LINE users
guest users
```

---

## 4. User Experience Priorities

Priority order for tourist side:

```text
1. Speed
2. Clarity
3. Trust
4. Reward value
5. Minimal typing
6. Mobile comfort
7. Data quality
```

Priority order for admin side:

```text
1. Data correctness
2. Clear workflow
3. Search/filter efficiency
4. Safe actions
5. Professional presentation
6. Auditability
```

Priority order for dashboard:

```text
1. Correct metrics
2. Clear interpretation
3. Useful filters
4. Fast loading
5. Exportability
6. Visual polish
```

---

## 5. Tourist UX Principles

## 5.0 Public Discovery Directories

Public listing pages should feel like one product while preserving the data
contract of each module. Use a compact Thai-first introduction, a restrained
filter toolbar, a truthful result summary, and consistent missing-image states.

Rules:

- Never promote a record as featured unless it is eligible and has configured media.
- A broken or missing image shows the record name and an honest placeholder.
- Empty data and unavailable data are different states with different recovery actions.
- Save-to-trip is a separate button from the detail link and announces its state.
- The guest shortlist stays on the current browser, is capped at 20 attractions,
  and is not presented as a saved account itinerary.
- Attraction shortlist planning resolves only currently published records and
  may hand the ordered stops to Google Maps; it must not claim route optimization.
- Restaurant choices use a separate browser shortlist. The planning handoff
  resolves only active, published restaurant records, preserves their order, and
  offers real detail and Google Maps links without claiming route optimization,
  reservations, account persistence, or newsletter subscription.
- Mobile directory pages keep enough bottom safe area for the global navigation
  and any shortlist action bar.
- `/360-vista` identifies external providers and explains the privacy boundary
  before opening a new tab.
- Restaurant and accommodation directories translate controlled type codes to
  Thai-first labels, keep unknown values visible as a truthful fallback, and
  expose every currently supported type in the server-side filter.
- Restaurant results use image-forward cards plus a sticky desktop planning rail
  and a compact mobile action bar. Missing images remain explicit. District,
  category counts, meal suitability, ratings, reviews, halal claims, opening
  state, and newsletter success are omitted until complete data contracts exist.
- Hospitality results separate image, title, and explicit detail actions so
  keyboard and touch users can predict what each target opens. Accommodation
  featured cards are allowed only when their managed image exists.
- The accommodation directory uses managed accommodation media first. If no
  listing image exists, its hero may use an admin-managed directory image or a
  homepage Yala ambience image only when it is explicitly labelled as ambience,
  never as a specific accommodation. Hero copy, image, and CTA remain editable
  in Admin Settings; listing records remain owned by the Accommodation CMS.
- Accommodation results use one editorial featured record only when a real
  managed image exists, followed by compact square-edged cards. Every card keeps
  province, controlled accommodation type, stored price range, and a visible
  detail action available on touch devices. The UI must not imply booking,
  availability, rating, or room inventory capabilities that the data does not
  support.

Leaderboard and profile pages must also distinguish availability states. A
privacy migration or service failure is not an empty leaderboard. A missing
guest passport explains browser/device identity boundaries and offers real
login, retry, and attraction-discovery actions without creating a new profile.
Visit photo routes follow the same distinction: a genuinely missing visit is a
404, an absent or mismatched browser identity shows privacy-safe recovery, and a
service failure shows a retry state. An unlinked Google/LINE session must not
hide a valid same-browser guest passport, but identity merging still requires
the explicit confirmation flow.

## 5.1 First Screen Must Be Clear

After scanning QR, the tourist should immediately understand:

```text
where they are
what they will receive
how long it takes
what to do next
```

Example:

```text
Create your free digital travel certificate for Aiyerweng Skywalk.
It takes less than 1 minute.
```

---

## 5.2 Use Strong CTA

Primary CTA should be clear.

Good:

```text
Create My Certificate
Get My Travel Stamp
Start
```

Thai:

```text
สร้างใบประกาศของฉัน
รับตราประทับ
เริ่มเลย
```

Avoid vague buttons:

```text
Submit
Next
Continue
```

Use "Next" only inside multi-step flow when context is obvious.

---

## 5.3 Reduce Typing

Prefer:

- chips
- buttons
- dropdowns
- searchable select
- star ratings
- camera/gallery picker

Avoid:

- long text fields
- typing province/country manually
- exact numbers where ranges work
- repeated profile forms

---

## 5.4 Use Progressive Disclosure

Do not show everything at once.

Break into small steps:

```text
Step 1: Basic info
Step 2: Photo
Step 3: Certificate
Step 4: Optional feedback
```

---

## 5.5 Show Progress

Use simple progress indicator:

```text
1 of 3
2 of 3
3 of 3
```

or:

```text
Almost done
```

Do not make it feel like a long survey.

---

## 5.6 Make Guest Mode Feel Safe

Guest should not feel like a second-class user.

Show:

```text
Continue as Guest
```

Then explain later:

```text
Save with Google or LINE if you want to access your passport on another device.
```

---

## 5.7 Support Foreign Tourists

Foreign tourists may not understand LINE or Thai-only UI.

Requirements:

- English language option
- country selection
- no LINE requirement
- clear guest option
- simple wording
- avoid government-heavy language

---

## 6. Data Collection UX

## 6.1 Ask Only Necessary Questions First

Before certificate:

```text
name on certificate
where are you from
age group
visit date
consent
photo
```

After certificate:

```text
how did you travel
who did you travel with
spending range
satisfaction
```

---

## 6.2 Explain Why Data Is Asked

Example:

```text
This helps improve tourism planning in the southern border area.
```

Thai:

```text
ข้อมูลนี้ช่วยพัฒนาการท่องเที่ยวชายแดนใต้ให้ดีขึ้น
```

Short explanation increases trust.

---

## 6.3 Use Approximate Values

For sensitive or difficult questions, use ranges.

Good:

```text
spending range
age group
province/country
```

Avoid:

```text
exact income
exact birth date
full address
```

---

## 6.4 Make Survey Optional

Survey should be optional.

Do not block:

```text
certificate download
stamp earning
passport view
```

because of survey.

---

## 7. Trust and Privacy UX

## 7.1 Show Short Privacy Notice

Use short and clear wording near consent.

Example:

```text
We use your information to create your certificate and analyze tourism trends in aggregated form.
```

Thai:

```text
ระบบใช้ข้อมูลของคุณเพื่อสร้างใบประกาศ และวิเคราะห์ภาพรวมการท่องเที่ยวในรูปแบบสถิติ
```

## 7.2 Avoid Scary Language

Do not make the form feel like official immigration or government registration.

Avoid:

```text
legal full name
national ID
full address
mandatory phone number
```

## 7.3 Photo Use Notice

Before photo upload:

```text
Your photo will be used to create your certificate and will not be shown publicly unless you choose to share it.
```

## 7.4 Consent Checkbox

Consent must be clear and not pre-checked.

---

## 8. Visual Design Direction

## 8.1 Desired Feeling

The product should feel:

```text
premium
warm
trustworthy
local tourism inspired
modern
clean
mobile-first
```

It should not feel like:

```text
old government form
plain CRUD system
student-only prototype
overly colorful toy app
```

---

## 8.2 Visual Style

Recommended style:

- soft gradients
- rounded cards
- clean white space
- elegant typography
- high-quality attraction imagery
- subtle shadows
- clear CTA buttons
- professional dashboard cards

---

## 8.3 Color Direction

Suggested concept:

```text
deep navy or charcoal for trust
teal/emerald for sustainable tourism
gold/warm accent for certificate and premium feeling
soft sand/background tones
```

Avoid:

- too many bright colors
- low contrast text
- random gradients
- red for normal actions

---

## 8.4 Typography

Recommended fonts:

```text
Prompt
Sarabun
Inter
```

Rules:

- Thai text must be readable.
- Use consistent font sizes.
- Avoid tiny labels on mobile.
- Use font weight to create hierarchy.

---

## 9. Mobile UX Rules

## 9.1 Touch Targets

Buttons should be large enough.

Recommended minimum:

```text
44px height
```

## 9.2 Sticky Actions

Use sticky bottom CTA when useful in tourist flow.

Examples:

```text
Start
Upload photo
Generate certificate
Download certificate
```

## 9.3 Avoid Crowding

Mobile screens should not show too many fields at once.

Use:

- spacing
- sections
- cards
- progress

## 9.4 Camera Upload

Photo upload should work naturally on mobile.

Button text:

```text
Choose Photo
Take or Upload Photo
```

Thai:

```text
เลือกหรือถ่ายรูป
```

---

## 10. Public Attraction UX

## 10.1 Attraction List

Attraction cards should show:

```text
image
name
province
type
short description
CTA
```

## 10.2 Attraction Detail

Detail page should answer:

```text
What is this place?
Why should I visit?
Where is it?
What can I do here?
How do I get certificate/stamp?
```

## 10.3 CTA Placement

Certificate/stamp CTA should appear near top and again near bottom if page is long.

---

## 11. QR Landing UX

## 11.1 QR Landing Must Be Fast

This is the first real interaction after physical scan.

Requirements:

- lightweight
- clear
- no heavy content first
- no login wall
- fast CTA

## 11.2 QR Landing Content

Show:

```text
attraction name
photo spot name
benefit
time estimate
primary CTA
guest option
privacy hint
```

## 11.3 Invalid QR

Show friendly message.

Do not show technical details.

---

## 12. Profile Form UX

## 12.1 Keep It Short

Fields:

```text
name on certificate
origin
age group
visit date
consent
```

## 12.2 Returning User

If returning profile exists:

```text
Welcome back, [name].
Use saved information?
```

Options:

```text
Use saved information
Edit
```

## 12.3 Origin Input

Use country/province selector.

Do not ask for full address.

---

## 13. Photo Upload UX

## 13.1 Instructions

Make it clear:

```text
Upload a photo from this trip to create your certificate.
```

## 13.2 Preview

Always show preview before generation.

## 13.3 Error UX

File errors should be clear:

```text
Please upload JPEG, PNG, or WebP.
This photo is too large.
```

---

## 14. Certificate UX

## 14.1 Certificate Should Feel Rewarding

The certificate is the key user incentive.

It should look:

- polished
- shareable
- personal
- travel-themed
- not like a plain form result

## 14.2 Success Screen

After generation, show:

```text
Your certificate is ready!
Download Certificate
View My Stamp
Answer Short Survey
```

## 14.3 Do Not Block Reward

Do not force survey before download.

---

## 15. Stamp and Passport UX

## 15.1 Stamp Earned Feedback

Use celebratory but not childish feedback.

Example:

```text
New stamp earned!
```

Thai:

```text
คุณได้รับตราประทับใหม่แล้ว!
```

## 15.2 Passport View

Passport should show:

```text
total stamps
stamp cards
province
earned date
next suggested action
```

## 15.3 Save Passport Prompt

After stamp:

```text
Save your passport so you can access it later.
```

Options:

```text
Save with LINE
Save with Google
Continue as Guest
```

---

## 16. Survey UX

## 16.1 Timing

Only after certificate/stamp.

## 16.2 Tone

Use friendly wording:

```text
Help improve tourism in this area.
```

Do not sound like mandatory research paperwork.

## 16.3 Length

Keep it short.

MVP target:

```text
3 to 8 questions
```

## 16.4 Controls

Use quick controls:

- chips
- star ratings
- yes/no buttons
- spending range buttons

---

## 17. Admin UX Principles

## 17.1 Professional Backoffice

Admin should feel like a real management system.

Use:

- sidebar
- tables
- filters
- forms
- clear actions
- status badges

## 17.2 Prevent Mistakes

Use confirmations for:

```text
deactivate
unpublish
delete if allowed
export data
role change
```

## 17.3 Use Status Badges

Examples:

```text
Published
Draft
Active
Inactive
Generated
Survey Completed
```

## 17.4 Do Not Hard Delete by Default

Use deactivate/unpublish.

Explain why if deletion is blocked.

---

## 18. Dashboard UX Principles

## 18.1 Decision-Oriented

Every chart must help planning.

Good chart question:

```text
Which attractions need improvement?
```

Bad chart purpose:

```text
It looks nice.
```

## 18.2 Use Clear Labels

Examples:

```text
Total Visits
Tourist Profiles
Estimated Spending
Average Satisfaction
Survey Completion Rate
```

## 18.3 Explain Limitations

For spending:

```text
Estimated from tourist-selected ranges.
```

For tourist count:

```text
Counts tourist profiles, not guaranteed unique real individuals.
```

## 18.4 Data Freshness

Show:

```text
Last updated
```

---

## 19. Error Message Principles

Good error messages:

- explain what happened
- tell what user can do
- avoid blame
- avoid technical jargon

Bad:

```text
SQLSTATE 23505 duplicate key violation
```

Good:

```text
This check-in code already exists. Please choose another code.
```

---

## 20. Loading State Principles

Use loading states for:

```text
QR loading
photo uploading
certificate generating
dashboard loading
export generating
form saving
```

Loading state should reassure user.

Example:

```text
Creating your certificate...
```

---

## 21. Empty State Principles

Empty states should guide action.

Examples:

```text
No attractions yet. Create your first attraction.
No visits in this date range. Try changing the filters.
No stamps yet. Scan a QR code at an attraction to collect one.
```

---

## 22. Accessibility Principles

Requirements:

- readable contrast
- visible focus states
- keyboard accessible buttons
- input labels
- semantic headings
- alt text
- error messages linked to fields
- do not rely only on color

---

## 23. Content Tone

## 23.1 Tourist Tone

Tone:

```text
friendly
clear
encouraging
trustworthy
simple
```

Avoid:

```text
bureaucratic
technical
too formal
too playful
```

## 23.2 Admin Tone

Tone:

```text
clear
professional
direct
precise
```

## 23.3 Dashboard Tone

Tone:

```text
analytical
neutral
evidence-based
```

---

## 24. Thai UX Wording Examples

## 24.1 CTA

```text
สร้างใบประกาศของฉัน
รับตราประทับ
ดูพาสปอร์ตของฉัน
ตอบคำถามสั้น ๆ
ข้ามไปก่อน
```

## 24.2 Error

```text
ไม่พบข้อมูล QR Code นี้
อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่
กรุณาเลือกจังหวัดหรือประเทศของคุณ
```

## 24.3 Privacy

```text
ข้อมูลนี้จะใช้เพื่อสร้างใบประกาศ และวิเคราะห์ภาพรวมการท่องเที่ยวในรูปแบบสถิติ
```

---

## 25. English UX Wording Examples

## 25.1 CTA

```text
Create My Certificate
Get My Stamp
View My Passport
Answer Quick Questions
Skip for Now
```

## 25.2 Error

```text
This QR code is not available.
We could not upload your photo. Please try again.
Please select where you are from.
```

## 25.3 Privacy

```text
We use your information to create your certificate and analyze tourism trends in aggregated form.
```

---

## 26. UX Metrics to Track

The system should track UX conversion through funnel events:

```text
qr_scanned
landing_viewed
certificate_started
photo_uploaded
minimal_form_completed
certificate_generated
survey_started
survey_completed
passport_saved
```

Use these metrics to improve UX.

---

## 27. UX Anti-Patterns

Do not:

```text
Ask long survey first.
Force LINE login.
Force Google login for tourists.
Require phone number.
Require full address.
Use separate QR for each user type.
Open QR directly to a long form.
Block certificate download until survey, sharing, or account linking is completed.
Use tiny mobile buttons.
Show raw technical errors.
Hide the certificate CTA.
Make guest mode hard to find.
Use too many colors.
Build dashboard charts without decisions.
```

---

## 28. Design Review Checklist

Before accepting frontend work, check:

```text
[ ] Mobile flow is easy.
[ ] Main CTA is clear.
[ ] Required fields are minimal.
[ ] Guest mode is available.
[ ] Google and LINE are optional account-linking choices, not entry gates.
[ ] LINE is optional.
[ ] Foreign users can continue.
[ ] Privacy notice is clear.
[ ] Photo upload has preview.
[ ] Certificate feels rewarding.
[ ] Certificate download is not blocked by survey, sharing, Google, LINE, email, or phone number.
[ ] Survey appears after reward.
[ ] Optional sharing appears only after certificate download is available.
[ ] Admin forms prevent mistakes.
[ ] Dashboard metrics are understandable.
[ ] Loading states exist.
[ ] Empty states exist.
[ ] Error messages are friendly.
[ ] Accessibility basics are met.
```

---

## 29. Final UX Rule

The best UX for this project is not the prettiest screen.

The best UX is the one that makes tourists willingly complete the flow and produces reliable planning data.

Design for completion, trust, and data quality.

---

## 30. Latest Homepage UX Direction

The public homepage should feel like a premium native-app-like tourism platform, not an old government portal or dense corporate website.

Required homepage concepts:

- Southern Border discovery hero
- search bar
- Yala, Pattani, and Narathiwat province chips
- Pinterest-style masonry discovery feed
- QR certificate card
- My Passport / stamp progress card
- How it works section
- Suggested routes section
- Privacy & Trust section
- Dashboard preview section
- Travel stories / SEO content section
- minimal premium footer
- mobile bottom navigation for tourist pages

Use the visual direction defined in `docs/frontend/HOMEPAGE_UI_STRATEGY.md` and `docs/frontend/AI_DESIGN_BRIEF.md`.
