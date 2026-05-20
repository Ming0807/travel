# TOURIST_FLOW_UI_SPEC.md

## 1. Document Purpose

This document defines the Tourist Flow UI specification for the **Southern Border Tourism Data & Intelligence Platform**.

The tourist flow is the most important user journey because it collects the core data needed for the project.

This document should guide frontend developers, UX designers, backend developers, and AI coding agents when implementing the QR-to-certificate-to-survey experience.

---

## 2. Tourist Flow Mission

The tourist flow mission is:

```text
Help tourists receive a valuable digital travel memory while collecting reliable tourism planning data with minimal friction.
```

The flow must be:

- mobile-first
- fast
- simple
- guest-friendly
- foreign-tourist-friendly
- privacy-aware
- visually rewarding
- connected to database quality

---

## 3. Core Flow

Recommended MVP flow:

```text
Scan QR code
    |
QR landing page
    |
Minimal tourist profile form
    |
Photo upload
    |
Certificate preview and generation
    |
Stamp earned
    |
Optional survey
    |
Passport/save options
```

---

## 4. UX Strategy

## 4.1 Value First

The user should understand the reward before being asked for data.

Reward:

```text
digital certificate
travel memory card
digital stamp
passport progress
```

## 4.2 Minimal Required Data

Before certificate:

```text
display name
origin country/province
age group
visit date
consent
photo
```

After certificate:

```text
travel behavior
expense
satisfaction
optional comment
```

## 4.3 No Forced Login

Tourist can continue as:

```text
guest
LINE optional
email optional future
```

Do not require LINE, email, or account registration.

---

## 5. Tourist Flow Routes

Recommended routes:

```text
/c/[checkinCode]
/visit/profile
/visit/photo
/visit/certificate
/visit/success
/passport
/survey/[visitId]
```

Exact implementation can vary, but the journey should remain clear.

---

## 6. Shared Tourist Layout

## 6.1 Layout Structure

Mobile-first layout:

```text
top area: logo/language/back
progress indicator
main content card
supporting note
sticky bottom action
```

## 6.2 Width

Recommended:

```text
max-width: 480px for mobile flow container
centered on desktop
```

## 6.3 Safe Area

Support mobile safe areas for sticky CTA.

## 6.4 Visual Style

Use:

```text
soft background
white cards
rounded corners
clear CTA
teal primary
gold reward accent
friendly icons
```

---

## 7. Step Progress

Show progress but avoid making the flow feel long.

Possible steps:

```text
1. Info
2. Photo
3. Certificate
```

Success and survey are after reward.

Alternative labels:

```text
Start
Info
Photo
Certificate
```

Rules:

- show current step clearly
- do not show optional survey as required step
- keep progress simple

---

## 8. Language Switcher

Tourist flow must support:

```text
Thai
English
```

Language switch should be visible but not distracting.

Default:

```text
browser language
```

Fallback:

```text
Thai or English
```

---

## 9. QR Landing Page

Route:

```text
/c/[checkinCode]
```

## 9.1 Purpose

Explain the benefit and start the flow.

## 9.2 Required Content

```text
attraction name
photo spot name if available
hero image or attraction image
benefit statement
estimated time
primary CTA
guest-friendly message
privacy hint
```

## 9.3 Example Copy

English:

```text
Create your free digital travel certificate for [Attraction].
It takes less than 1 minute.
```

Thai:

```text
สร้างใบประกาศดิจิทัลฟรีสำหรับ [Attraction]
ใช้เวลาไม่ถึง 1 นาที
```

## 9.4 Primary CTA

English:

```text
Create My Certificate
```

Thai:

```text
สร้างใบประกาศของฉัน
```

## 9.5 Secondary Text

```text
No app installation required. You can continue as guest.
```

Thai:

```text
ไม่ต้องติดตั้งแอป และสามารถใช้งานแบบผู้เยี่ยมชมได้
```

## 9.6 QR Error States

Invalid QR:

```text
This QR code is not valid.
```

Inactive QR:

```text
This QR code is currently not available.
```

Expired QR:

```text
This QR code has expired.
```

All should provide path back to attraction list if useful.

---

## 10. Minimal Tourist Profile Step

Route:

```text
/visit/profile
```

## 10.1 Purpose

Collect only necessary data to create certificate and visit record.

## 10.2 Required Fields

```text
name on certificate
origin country/province
age group
visit date
consent
```

## 10.3 Display Name Field

Label:

```text
Name on certificate
```

Thai:

```text
ชื่อที่จะแสดงบนใบประกาศ
```

Helper:

```text
This does not need to be your legal name.
```

Thai:

```text
ไม่จำเป็นต้องเป็นชื่อตามบัตรประชาชน
```

## 10.4 Origin Field

Domestic user:

```text
Province you are from
```

Foreign user:

```text
Country you are from
```

UI:

- country/province selector
- searchable if list is long
- no full address

## 10.5 Age Group Field

Use chips/buttons.

Options:

```text
Under 18
18-24
25-34
35-44
45-54
55-64
65+
Prefer not to answer
```

## 10.6 Visit Date Field

Default:

```text
today
```

Allow past date because tourist may complete later.

## 10.7 Consent Box

Short text:

```text
We use your information to create your certificate and analyze tourism trends in aggregated form.
```

Thai:

```text
ระบบใช้ข้อมูลของคุณเพื่อสร้างใบประกาศ และวิเคราะห์ภาพรวมการท่องเที่ยวในรูปแบบสถิติ
```

Checkbox must not be pre-checked.

## 10.8 Returning Tourist State

If returning profile found:

```text
Welcome back, [Name].
Use your saved information?
```

Buttons:

```text
Use Saved Information
Edit
```

## 10.9 Submit CTA

```text
Continue to Photo
```

Thai:

```text
ไปอัปโหลดรูปภาพ
```

---

## 11. Photo Upload Step

Route:

```text
/visit/photo
```

## 11.1 Purpose

Upload photo used for certificate.

## 11.2 Required Content

```text
short instruction
photo upload button
supported file note
image preview
change photo button
continue/generate button
privacy note
```

## 11.3 Copy

English:

```text
Upload a photo from this trip to create your digital certificate.
```

Thai:

```text
อัปโหลดรูปจากทริปนี้เพื่อสร้างใบประกาศดิจิทัลของคุณ
```

## 11.4 Upload Button

```text
Choose or Take Photo
```

Thai:

```text
เลือกหรือถ่ายรูป
```

## 11.5 File Rules Display

```text
JPEG, PNG, or WebP. Maximum 5 MB.
```

Thai:

```text
รองรับ JPEG, PNG หรือ WebP ขนาดไม่เกิน 5 MB
```

## 11.6 Preview

Show selected image.

Actions:

```text
Change Photo
Continue
```

## 11.7 Loading

```text
Uploading your photo...
```

## 11.8 Error Examples

```text
Please upload a JPEG, PNG, or WebP image.
This photo is too large.
We could not upload your photo. Please try again.
```

---

## 12. Certificate Step

Route:

```text
/visit/certificate
```

Detailed spec:

```text
docs/frontend/CERTIFICATE_UI_SPEC.md
```

## 12.1 Required Content

```text
certificate preview
summary details
generate button
download button after success
edit photo/name option if feasible
```

## 12.2 CTA Before Generation

```text
Create Certificate
```

Thai:

```text
สร้างใบประกาศ
```

## 12.3 CTA After Generation

```text
Download Certificate
```

Thai:

```text
ดาวน์โหลดใบประกาศ
```

## 12.4 Loading

```text
Creating your digital certificate...
```

## 12.5 Success

```text
Your certificate is ready!
```

Thai:

```text
ใบประกาศของคุณพร้อมแล้ว!
```

---

## 13. Success and Stamp Step

Route:

```text
/visit/success
```

## 13.1 Purpose

Confirm reward, show stamp, and offer next actions.

## 13.2 Required Content

```text
certificate ready message
download certificate button
stamp earned state
passport CTA
optional survey CTA
save passport prompt
```

## 13.3 New Stamp Earned

English:

```text
New stamp earned!
```

Thai:

```text
คุณได้รับตราประทับใหม่แล้ว!
```

## 13.4 Already Earned Stamp

English:

```text
You already collected this stamp. Your new visit was still recorded.
```

Thai:

```text
คุณมีตราประทับนี้แล้ว แต่ระบบได้บันทึกการเยี่ยมชมครั้งใหม่ของคุณเรียบร้อย
```

## 13.5 Main Actions

```text
Download Certificate
View My Passport
Answer Quick Questions
Skip for Now
```

---

## 14. Save Passport Prompt

## 14.1 Purpose

Encourage identity linking after value is delivered.

## 14.2 Guest Message

```text
Your passport is saved on this device only.
Save it with Google or LINE so you can access it later. Email recovery is a future option.
```

Thai:

```text
พาสปอร์ตของคุณจะถูกเก็บไว้บนอุปกรณ์นี้เท่านั้น
บันทึกด้วย LINE หรืออีเมลเพื่อเปิดดูภายหลังได้
```

## 14.3 Options

```text
Continue as Guest
Save with Google
Save with LINE
Email save future
```

LINE must be optional.

---

## 15. Optional Survey Step

Route:

```text
/survey/[visitId]
```

## 15.1 Purpose

Collect travel behavior, expense, and satisfaction data after reward.

## 15.2 Intro Copy

English:

```text
Help improve tourism in this area by answering a few quick questions.
```

Thai:

```text
ช่วยพัฒนาการท่องเที่ยวในพื้นที่นี้ ด้วยการตอบคำถามสั้น ๆ
```

## 15.3 Required UX Rules

- survey is optional
- skip is visible
- use quick controls
- keep short
- do not ask sensitive data
- do not block certificate

## 15.4 Suggested Steps

```text
Travel
Spending
Satisfaction
```

## 15.5 Survey Controls

Use:

```text
chips
buttons
star rating
short number input
optional textarea
```

---

## 16. Passport Page

Route:

```text
/passport
```

## 16.1 Purpose

Show earned stamps and encourage repeat visits.

## 16.2 Required Content

```text
tourist display name
total stamps
stamp grid
earned dates
attraction/province
guest warning if guest
save options
CTA to attractions
```

## 16.3 Empty State

```text
No stamps collected yet.
Scan a QR code at an attraction to collect your first stamp.
```

Thai:

```text
ยังไม่มีตราประทับ
สแกน QR Code ที่สถานที่ท่องเที่ยวเพื่อรับตราประทับแรกของคุณ
```

---

## 17. Tourist Flow State Requirements

The UI must preserve flow context:

```text
checkin_code
attraction_id
photo_spot_id
session_id
visit_id
photo_id
certificate_id
language
```

Rules:

- do not lose context on refresh where possible
- show friendly expired session message
- do not trust browser IDs without server validation
- clear temporary context after completion when safe

---

## 18. Tourist Flow Loading States

Required:

```text
Loading check-in page...
Saving your travel profile...
Uploading your photo...
Creating your digital certificate...
Adding your travel stamp...
Saving your answers...
```

Thai equivalents should be provided.

---

## 19. Tourist Flow Error States

Required:

```text
invalid QR
inactive QR
profile save failed
photo upload failed
certificate generation failed
stamp partial failure
survey save failed
expired session
offline
```

Errors must be friendly and actionable.

---

## 20. Mobile Requirements

Tourist flow must work well on:

```text
360px width
390px width
430px width
```

Rules:

- large buttons
- readable text
- one primary action per screen
- sticky CTA where useful
- avoid horizontal scrolling
- image preview fits screen
- certificate preview scales properly

---

## 21. Accessibility Requirements

Tourist flow must support:

- semantic headings
- labeled inputs
- keyboard accessible controls
- accessible file upload
- clear error text
- sufficient contrast
- large touch targets
- screen-reader friendly buttons
- color not only signal

---

## 22. Privacy Requirements

The UI must explain:

```text
why data is collected
how photo is used
guest passport limitation
Google/LINE optionality
survey optionality
```

Do not show:

```text
email
LINE ID
device token
internal IDs
```

---

## 23. Data Quality Requirements

The tourist UI must support database quality by:

- using controlled choices
- preventing duplicate submit
- validating inputs
- collecting visit date
- linking flow to check-in code
- recording funnel events
- not creating tourist on QR scan alone
- allowing returning profile reuse

---

## 24. Funnel Events

Tourist flow should record:

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

These events help improve UX and prove where users drop off.

---

## 25. Tourist Flow Components

Recommended components:

```text
TouristFlowLayout
StepProgress
QrLandingCard
BenefitList
TouristProfileMiniForm
ReturningProfileCard
OriginSelector
AgeGroupSelector
ConsentBox
PhotoUploadCard
PhotoPreview
CertificatePreview
CertificateDownloadPanel
StampEarnedCard
SavePassportPrompt
SurveyCtaCard
SurveyStepCard
PassportStampGrid
```

---

## 26. UX Copy Summary

## 26.1 Primary CTAs

English:

```text
Create My Certificate
Continue to Photo
Choose or Take Photo
Create Certificate
Download Certificate
View My Passport
Answer Quick Questions
Skip for Now
```

Thai:

```text
สร้างใบประกาศของฉัน
ไปอัปโหลดรูปภาพ
เลือกหรือถ่ายรูป
สร้างใบประกาศ
ดาวน์โหลดใบประกาศ
ดูพาสปอร์ตของฉัน
ตอบคำถามสั้น ๆ
ข้ามไปก่อน
```

---

## 27. Testing Checklist

Test:

```text
valid QR
invalid QR
inactive QR
Thai language
English language
guest first-time user
returning guest
foreign tourist without LINE
profile validation
photo upload success
large photo rejection
unsupported file rejection
certificate generation
certificate download mobile
stamp new/already earned
survey skip
survey submit
passport empty
passport with stamps
refresh during flow
back button during flow
offline/network error
```

---

## 28. MVP Acceptance Checklist

```text
[ ] QR landing page works.
[ ] QR error states work.
[ ] Guest flow works.
[ ] No LINE requirement exists.
[ ] Minimal profile form works.
[ ] Consent is required.
[ ] Returning guest reuse is supported or planned.
[ ] Photo upload works on mobile.
[ ] Certificate preview works.
[ ] Certificate generation works.
[ ] Certificate download works or fallback exists.
[ ] Stamp earned state works.
[ ] Optional survey appears after reward.
[ ] Survey can be skipped.
[ ] Passport page exists or success page shows stamp/passport summary.
[ ] Thai/English structure exists.
[ ] Loading states exist.
[ ] Error states exist.
[ ] Funnel events are recorded.
```

---

## 29. Do Not Do

Do not:

```text
Force LINE login.
Force email.
Ask long survey before certificate.
Require full address.
Require national ID.
Create separate QR for LINE/non-LINE users.
Hide guest option.
Make certificate look like plain receipt.
Block certificate download behind survey.
Lose user data after validation error.
Show raw technical errors.
Use tiny mobile buttons.
```

---

## 30. Final Tourist Flow Rule

The tourist flow succeeds when tourists willingly complete it.

The best flow is short, rewarding, trustworthy, and produces structured data that planners can actually use.
