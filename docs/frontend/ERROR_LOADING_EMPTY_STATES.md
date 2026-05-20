# ERROR_LOADING_EMPTY_STATES.md

## 1. Document Purpose

This document defines the standards for error, loading, and empty states in the **Southern Border Tourism Data & Intelligence Platform**.

These states are not small details. They directly affect:

- tourist trust
- completion rate
- admin confidence
- perceived professionalism
- production readiness
- data quality

Every major page and async action must have proper loading, error, and empty states.

---

## 2. State Design Mission

The mission is:

```text
Never leave users confused.
```

Users should always know:

- what is happening
- what went wrong
- what they can do next
- whether their data was saved
- whether they can retry

---

## 3. State Types

The frontend must handle:

```text
loading state
empty state
error state
success state
partial success state
offline/network state
permission state
validation state
```

This document focuses on loading, empty, and error states.

---

## 4. Core Principles

## 4.1 Every Async Operation Needs Feedback

Async operations include:

```text
QR validation
profile submission
photo upload
certificate generation
stamp assignment
survey submission
dashboard loading
admin save
export generation
official data import
```

Do not leave the user staring at a frozen screen.

---

## 4.2 Error Messages Must Be Human

Do not show raw technical errors to normal users.

Bad:

```text
SQLSTATE 23505
TypeError: Cannot read properties of null
500 Internal Server Error
```

Good:

```text
This check-in code already exists.
We could not upload your photo. Please try again.
```

---

## 4.3 Empty States Should Guide Action

Empty state should not be just blank.

Good empty state includes:

```text
icon
title
short explanation
next action if useful
```

---

## 4.4 Loading States Should Match Context

Use different loading states for different tasks.

Examples:

```text
Loading attraction...
Uploading photo...
Creating your certificate...
Generating export...
```

Contextual loading feels more trustworthy than generic spinners.

---

## 5. Loading State Standards

## 5.1 Route-Level Loading

Use for full page load.

Examples:

```text
Loading attraction...
Loading check-in page...
Loading dashboard...
```

Recommended UI:

```text
skeleton screen
page-level loader
short loading text
```

## 5.2 Component-Level Loading

Use for sections.

Examples:

```text
KPI card loading
chart loading
table loading
image gallery loading
```

Recommended UI:

```text
skeleton card
placeholder rows
chart skeleton
```

## 5.3 Button Loading

Use for user-triggered actions.

Examples:

```text
Saving...
Uploading...
Generating...
Exporting...
```

Rules:

- disable button while loading.
- prevent double submit.
- keep button width stable if possible.
- show spinner if useful.

---

## 6. Tourist Flow Loading States

## 6.1 QR Check-in Loading

Trigger:

```text
opening /c/[checkinCode]
```

Message:

```text
Loading your check-in page...
```

Thai:

```text
กำลังโหลดหน้าลงทะเบียนของคุณ...
```

UI:

- attraction skeleton
- CTA disabled
- no blank screen

## 6.2 Profile Submit Loading

Message:

```text
Saving your travel profile...
```

Thai:

```text
กำลังบันทึกข้อมูลการเดินทางของคุณ...
```

Rules:

- disable submit.
- preserve form values.
- prevent double submit.

## 6.3 Photo Upload Loading

Message:

```text
Uploading your photo...
```

Thai:

```text
กำลังอัปโหลดรูปภาพของคุณ...
```

UI:

- progress bar if available
- preview remains visible
- retry on failure

## 6.4 Certificate Generation Loading

Message:

```text
Creating your digital certificate...
```

Thai:

```text
กำลังสร้างใบประกาศดิจิทัลของคุณ...
```

UI:

- certificate preview skeleton or current preview
- button disabled
- do not navigate away abruptly

## 6.5 Stamp Award Loading

Message:

```text
Adding your travel stamp...
```

Thai:

```text
กำลังเพิ่มตราประทับของคุณ...
```

If stamp award fails, certificate should still remain available.

## 6.6 Survey Submit Loading

Message:

```text
Saving your answers...
```

Thai:

```text
กำลังบันทึกคำตอบของคุณ...
```

---

## 7. Admin Loading States

## 7.1 Admin Table Loading

Use table skeleton:

```text
header visible
placeholder rows
filter bar disabled or usable depending on design
```

Message:

```text
Loading records...
```

## 7.2 Admin Save Loading

Button text:

```text
Saving...
```

Rules:

- disable save button.
- avoid losing form data.
- show toast on success.

## 7.3 Admin Delete/Deactivate Loading

Button text:

```text
Deactivating...
```

Use confirmation first.

## 7.4 Export Loading

Message:

```text
Generating export...
```

If export takes long, show:

```text
This may take a moment for large datasets.
```

Do not promise background completion unless actually implemented.

---

## 8. Dashboard Loading States

## 8.1 Dashboard Page Loading

Use:

```text
KPI skeletons
chart skeletons
table skeletons
```

Avoid:

```text
one spinner for entire dashboard forever
```

## 8.2 Section Loading

Each dashboard section can load independently.

If one chart fails, other sections should still show.

## 8.3 Filter Change Loading

When filters change:

- show subtle loading in affected cards.
- keep previous layout stable.
- avoid flashing full page.

---

## 9. Empty State Standards

## 9.1 Empty State Structure

Use:

```text
icon
title
description
optional action
```

Example:

```text
No attractions found.
Try changing your filters or search keyword.
```

## 9.2 Empty State Tone

Keep tone:

```text
clear
helpful
neutral
not blaming
```

---

## 10. Public Website Empty States

## 10.1 No Attractions

Message:

```text
No attractions found.
Try changing the province, attraction type, or search keyword.
```

Thai:

```text
ไม่พบสถานที่ท่องเที่ยว
ลองเปลี่ยนจังหวัด ประเภทสถานที่ หรือคำค้นหา
```

## 10.2 No Images

Message:

```text
Images for this attraction are coming soon.
```

Thai:

```text
รูปภาพของสถานที่นี้จะถูกเพิ่มในเร็ว ๆ นี้
```

## 10.3 No 360 Media

Usually hide section instead of showing empty state.

---

## 11. Tourist Flow Empty States

## 11.1 No Passport Stamps

Message:

```text
No stamps collected yet.
Scan a QR code at an attraction to collect your first stamp.
```

Thai:

```text
ยังไม่มีตราประทับ
สแกน QR Code ที่สถานที่ท่องเที่ยวเพื่อรับตราประทับแรกของคุณ
```

## 11.2 No Certificates

Message:

```text
No certificates yet.
Create a certificate at a participating attraction.
```

## 11.3 No Survey Questions

If survey is unavailable:

```text
Feedback questions are not available right now.
You can still view your certificate and passport.
```

---

## 12. Admin Empty States

## 12.1 No Attractions

Message:

```text
No attractions yet.
Create the first attraction to start building the tourism database.
```

Action:

```text
Create Attraction
```

## 12.2 No Visits

Message:

```text
No visits found for the selected filters.
Try changing the date range or filters.
```

## 12.3 No Check-in Codes

Message:

```text
No check-in codes yet.
Create a check-in code so tourists can scan QR codes at attractions.
```

Action:

```text
Create Check-in Code
```

## 12.4 No Survey Responses

Message:

```text
No survey responses yet.
Responses will appear after tourists complete the optional survey.
```

---

## 13. Dashboard Empty States

## 13.1 No Data for Filters

Message:

```text
No data available for the selected filters.
Try changing the date range, province, or attraction.
```

## 13.2 No Satisfaction Data

Message:

```text
No satisfaction responses yet.
Average satisfaction will appear after tourists answer the optional survey.
```

## 13.3 No Expense Data

Message:

```text
No expense data yet.
Spending analysis will appear after tourists submit expense information.
```

## 13.4 No Funnel Data

Message:

```text
No funnel events recorded yet.
Funnel analytics will appear after tourists scan QR codes and use the flow.
```

---

## 14. Error State Standards

## 14.1 Error State Structure

Use:

```text
title
short explanation
recommended action
retry button if useful
support/admin hint if needed
```

## 14.2 Error Severity

Classify errors:

```text
recoverable
blocking
permission
validation
network
unexpected
```

## 14.3 Error Tone

Use calm, helpful tone.

Do not blame the user.

---

## 15. QR Error States

## 15.1 Invalid QR Code

Message:

```text
This QR code is not valid.
Please check the QR code or ask staff for help.
```

Thai:

```text
QR Code นี้ไม่ถูกต้อง
กรุณาตรวจสอบ QR Code หรือสอบถามเจ้าหน้าที่
```

Action:

```text
Back to Attractions
```

## 15.2 Inactive QR Code

Message:

```text
This QR code is currently not available.
```

Thai:

```text
QR Code นี้ยังไม่เปิดใช้งานหรือถูกปิดใช้งานแล้ว
```

## 15.3 Expired QR Code

Message:

```text
This QR code has expired.
```

Thai:

```text
QR Code นี้หมดอายุแล้ว
```

## 15.4 Attraction Unavailable

Message:

```text
This attraction is currently not available for check-in.
```

Thai:

```text
สถานที่นี้ยังไม่เปิดให้ลงทะเบียนในขณะนี้
```

---

## 16. Tourist Flow Error States

## 16.1 Profile Save Failed

Message:

```text
We could not save your travel profile. Please try again.
```

Thai:

```text
ไม่สามารถบันทึกข้อมูลการเดินทางของคุณได้ กรุณาลองใหม่
```

Action:

```text
Try Again
```

## 16.2 Photo Upload Failed

Message:

```text
We could not upload your photo. Please try again.
```

Thai:

```text
ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่
```

## 16.3 Certificate Generation Failed

Message:

```text
We could not create your certificate. Please try again.
```

Thai:

```text
ไม่สามารถสร้างใบประกาศได้ กรุณาลองใหม่
```

## 16.4 Stamp Award Failed

Message:

```text
Your certificate was created, but we could not add the stamp right now.
```

Thai:

```text
สร้างใบประกาศสำเร็จแล้ว แต่ยังไม่สามารถเพิ่มตราประทับได้ในขณะนี้
```

Important:

Do not remove certificate if stamp fails.

## 16.5 Survey Save Failed

Message:

```text
We could not save your answers. Please try again.
```

Thai:

```text
ไม่สามารถบันทึกคำตอบของคุณได้ กรุณาลองใหม่
```

---

## 17. Admin Error States

## 17.1 Unauthorized

Message:

```text
You do not have permission to perform this action.
```

Thai:

```text
คุณไม่มีสิทธิ์ดำเนินการนี้
```

## 17.2 Duplicate Slug

Message:

```text
This slug is already used by another attraction.
```

## 17.3 Duplicate Check-in Code

Message:

```text
This check-in code already exists.
```

## 17.4 Delete Blocked

Message:

```text
This record has historical data and cannot be deleted. You can deactivate it instead.
```

## 17.5 Save Failed

Message:

```text
Could not save changes. Please review the form and try again.
```

---

## 18. Dashboard Error States

## 18.1 Dashboard Load Failed

Message:

```text
Could not load dashboard data. Please try again.
```

## 18.2 Chart Load Failed

Message:

```text
Could not load this chart.
```

Action:

```text
Retry
```

Other dashboard sections should still load if possible.

## 18.3 Export Failed

Message:

```text
Could not generate export. Please try again.
```

## 18.4 Export Too Large

Message:

```text
This export is too large. Please narrow the date range or filters.
```

---

## 19. Offline and Network States

## 19.1 Offline

Message:

```text
You appear to be offline. Please reconnect and try again.
```

Thai:

```text
ดูเหมือนว่าอุปกรณ์ของคุณไม่ได้เชื่อมต่ออินเทอร์เน็ต กรุณาเชื่อมต่อแล้วลองอีกครั้ง
```

## 19.2 Slow Network

Message:

```text
This is taking longer than usual. Please keep this page open.
```

Use carefully. Do not promise future background completion unless implemented.

## 19.3 Retry Pattern

For network errors, provide:

```text
Try Again
```

Do not automatically retry forever.

---

## 20. Success States

Success states should confirm action.

Examples:

```text
Your profile was saved.
Photo uploaded successfully.
Your certificate is ready.
New stamp earned.
Survey submitted. Thank you.
Attraction saved.
Export generated.
```

Use success to guide next action.

---

## 21. Partial Success States

Some operations may partially succeed.

## 21.1 Certificate Created, Stamp Failed

Show:

```text
Your certificate is ready.
We could not add the stamp right now. You can still download your certificate.
```

## 21.2 Import Partial Success

Show:

```text
Some rows were imported, but some rows failed validation.
```

## 21.3 Export Partial Data

Usually avoid partial exports unless clearly labeled.

---

## 22. Toast vs Inline Error

## 22.1 Use Toast For

```text
saved successfully
copied link
export started/generated
minor non-blocking messages
```

## 22.2 Use Inline Error For

```text
form validation
upload failure
certificate failure
dashboard section failure
permission denied
```

## 22.3 Use Page Error For

```text
invalid QR
not found
admin unauthorized
major page load failure
```

---

## 23. Technical Error Mapping

Map technical errors to user-friendly messages.

Examples:

```text
unique violation attractions.slug
-> This slug is already used by another attraction.

unique violation checkin_codes.code
-> This check-in code already exists.

foreign key violation
-> The selected related record is invalid or no longer available.

storage upload failure
-> We could not upload the file. Please try again.

network timeout
-> The connection took too long. Please try again.
```

---

## 24. Logging Rules

Frontend should not expose raw errors to users.

But developers/admin logs should capture enough detail.

Rules:

- log unexpected errors safely.
- do not log secrets.
- do not log raw personal data unnecessarily.
- include request context where safe.
- for production, use monitoring if available.

---

## 25. Accessibility Requirements

Loading, error, and empty states must be accessible.

Rules:

- error messages must be text.
- color cannot be only signal.
- loading status should be announced where appropriate.
- focus should move to important errors when needed.
- retry buttons must be keyboard accessible.
- icons need accessible labels or decorative alt handling.

---

## 26. UX Copy Guidelines

## 26.1 Tourist Copy

Use:

```text
simple
friendly
short
encouraging
```

Avoid:

```text
technical
legal-heavy
blaming
scary
```

## 26.2 Admin Copy

Use:

```text
precise
professional
actionable
```

## 26.3 Dashboard Copy

Use:

```text
analytical
clear
neutral
```

---

## 27. Component Requirements

Create reusable components:

```text
LoadingState
EmptyState
ErrorState
InlineFieldError
FormErrorSummary
PageError
SectionError
ButtonSpinner
SkeletonCard
SkeletonTable
SkeletonChart
```

Each should be styled consistently.

---

## 28. State Placement

## 28.1 Page-Level State

Use for:

```text
not found
invalid QR
unauthorized
page load failure
```

## 28.2 Section-Level State

Use for:

```text
dashboard chart failure
admin table failure
gallery empty
```

## 28.3 Field-Level State

Use for:

```text
form validation errors
```

## 28.4 Button-Level State

Use for:

```text
saving
uploading
generating
exporting
```

---

## 29. MVP Acceptance Checklist

```text
[ ] QR loading state exists.
[ ] Invalid QR error state exists.
[ ] Inactive QR error state exists.
[ ] Tourist profile save loading/error states exist.
[ ] Photo upload loading/error states exist.
[ ] Certificate generation loading/error states exist.
[ ] Stamp partial failure state exists.
[ ] Survey loading/error/skip states exist.
[ ] Passport empty state exists.
[ ] Public attraction empty state exists.
[ ] Admin table loading/empty/error states exist.
[ ] Dashboard loading/empty/error states exist.
[ ] Export loading/error states exist.
[ ] Errors are user-friendly.
[ ] Raw technical errors are not shown to tourists.
[ ] Retry actions exist where useful.
```

---

## 30. Do Not Do

Do not:

```text
Show blank page while loading.
Show spinner forever.
Show raw SQL or stack traces.
Use red border without text error.
Clear form data after validation error.
Let users double-submit while loading.
Hide empty state.
Treat no satisfaction data as zero.
Remove certificate if stamp fails.
Use only toast for critical form errors.
```

---

## 31. Final State Rule

Good error, loading, and empty states make the system feel reliable.

A production-ready platform must handle failure gracefully, not only the happy path.
