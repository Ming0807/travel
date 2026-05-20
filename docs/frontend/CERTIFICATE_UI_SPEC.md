# CERTIFICATE_UI_SPEC.md

## 1. Document Purpose

This document defines the UI specification for the **Digital Certificate / Travel Memory Card** feature of the **Southern Border Tourism Data & Intelligence Platform**.

The certificate is one of the most important tourist-facing outputs because it gives tourists a reason to participate in the data collection flow.

This document should guide designers, frontend developers, backend developers, and AI coding agents when implementing the certificate preview, generation, download, and success experience.

---

## 2. Certificate UI Mission

The certificate UI must make tourists feel that they receive something valuable.

The certificate should feel like:

```text
a premium travel memory
a digital souvenir
a personal proof of visit
a collectible part of a travel passport
```

It should not feel like:

```text
a plain database receipt
a boring form output
a government document
a low-quality student demo
```

The certificate must motivate users to complete the flow and optionally answer the survey.

---

## 3. Business Role of the Certificate

The certificate supports the project by:

- motivating tourists to submit minimal data
- motivating tourists to upload a photo
- completing the visit record
- triggering the digital stamp
- increasing chance of optional survey response
- creating social sharing potential
- improving repeat engagement through passport/stamp system

However, the certificate is not the final objective.

The final objective is:

```text
high-quality tourism data for sustainable tourism planning
```

Therefore, every generated certificate must be linked to:

```text
tourist
visit
attraction
photo
template
generated certificate record
```

---

## 4. User Journey Position

Recommended flow:

```text
QR scanned
    |
Landing page
    |
Minimal profile form
    |
Photo upload
    |
Certificate preview
    |
Generate / download certificate
    |
Stamp earned
    |
Optional survey
    |
Passport / save options
```

The certificate should appear before the optional survey.

Do not block the certificate behind survey completion.

---

## 5. Certificate Types

## 5.1 MVP Certificate

MVP certificate is a single image-based travel memory card.

Recommended output:

```text
PNG image
1080 x 1350 px
portrait 4:5 ratio
```

Reason:

- good for mobile
- good for social sharing
- good for download
- visually strong
- easier than PDF for MVP

## 5.2 Future Certificate Types

Possible later outputs:

```text
PDF certificate
landscape certificate
official-looking certificate
campaign-specific certificate
attraction-specific certificate
share card
passport page card
```

Do not implement all at MVP.

---

## 6. Required Certificate Content

The certificate must include:

```text
tourist display name
uploaded tourist photo
attraction name
visit date
project/campaign branding
certificate title
short certificate message
```

Recommended optional content:

```text
province name
digital stamp image
certificate ID
generated date
QR/share link
sustainable tourism message
```

Never include:

```text
email
LINE user ID
device token
provider_user_id
internal tourist ID
private storage path
national ID
full address
```

---

## 7. Visual Direction

The certificate should look:

```text
premium
warm
travel-inspired
clean
mobile-shareable
modern
trustworthy
```

Recommended design elements:

```text
soft gradient background
rounded photo frame
gold accent
teal/green sustainable tourism accent
subtle stamp graphic
clean Thai/English typography
small project branding
```

Avoid:

```text
too many logos
crowded text
harsh colors
low contrast
tiny text
plain white background only
overly official legal wording
```

---

## 8. Certificate Canvas Specification

## 8.1 Recommended Canvas

```text
width: 1080 px
height: 1350 px
aspect ratio: 4:5 portrait
format: PNG
```

## 8.2 Safe Area

Recommended safe margin:

```text
64 px
```

Do not place important text too close to edges.

## 8.3 Layout Zones

Recommended zones:

```text
top brand/header zone
main photo zone
certificate title zone
name/attraction/date zone
stamp/message zone
footer/branding zone
```

Example layout:

```text
0-120 px      Header / project brand
140-760 px    Uploaded photo
790-880 px    Certificate title
900-1040 px   Tourist name + attraction
1060-1160 px  Visit date + province
1180-1280 px  Stamp / message
1290-1340 px  Footer
```

Exact values can be adjusted by design.

---

## 9. Certificate Layout Structure

## 9.1 Header

Content:

```text
Southern Border Tourism Passport
```

Thai:

```text
พาสปอร์ตท่องเที่ยวชายแดนใต้
```

Optional:

```text
Yala · Pattani · Narathiwat
```

## 9.2 Main Photo

The uploaded photo should be the main visual focus.

Requirements:

- large enough to feel personal
- rounded corners
- object-fit cover
- not distorted
- optional subtle border/shadow
- preserve important content if possible

## 9.3 Certificate Title

English:

```text
Certificate of Visit
```

Thai:

```text
ใบประกาศการเยี่ยมชม
```

Alternative softer title:

```text
Travel Memory Certificate
```

Thai:

```text
ใบประกาศความทรงจำการเดินทาง
```

## 9.4 Tourist Name

Use:

```text
tourists.display_name
```

Rules:

- large and prominent
- center aligned
- line wrap if long
- max 150 characters at data level
- handle long names gracefully

## 9.5 Attraction Name

Use localized attraction name.

Example:

```text
Aiyerweng Skywalk
```

Thai:

```text
สกายวอล์คอัยเยอร์เวง
```

Rules:

- should be clearly visible
- line wrap if long
- do not truncate aggressively on certificate image

## 9.6 Visit Date

Use formatted date.

Thai example:

```text
18 พฤษภาคม 2569
```

English example:

```text
18 May 2026
```

Rules:

- format by selected language
- store date in database normally
- format only in UI/rendering

## 9.7 Province

Optional but recommended:

```text
Yala Province
```

Thai:

```text
จังหวัดยะลา
```

## 9.8 Footer

Footer can include:

```text
Southern Border Tourism Data & Intelligence Platform
```

or project/university branding if required.

Keep footer small and clean.

---

## 10. Certificate Text Examples

## 10.1 English Version

```text
Certificate of Visit

This certifies that
[Display Name]

visited
[Attraction Name]

on [Visit Date]

Southern Border Tourism Digital Passport
```

## 10.2 Thai Version

```text
ใบประกาศการเยี่ยมชม

ขอมอบใบประกาศนี้ให้แก่
[Display Name]

เพื่อแสดงว่าได้มาเยี่ยมชม
[Attraction Name]

เมื่อวันที่ [Visit Date]

พาสปอร์ตท่องเที่ยวชายแดนใต้
```

## 10.3 Shorter Social Version

English:

```text
I visited [Attraction Name]
on [Visit Date]
```

Thai:

```text
ฉันได้มาเยี่ยมชม [Attraction Name]
เมื่อวันที่ [Visit Date]
```

---

## 11. Certificate Preview UI

## 11.1 Purpose

The preview lets tourists verify their certificate before download.

## 11.2 Preview Page Content

The page should include:

```text
step progress
certificate preview
download/generate button
edit name/photo option
short privacy note
loading/error states
```

## 11.3 Preview Layout

Mobile-first:

```text
top: progress/title
middle: certificate preview card
bottom: sticky action buttons
```

Desktop:

```text
left: certificate preview
right: summary/actions
```

## 11.4 Preview Summary

Show text summary outside the image:

```text
Name
Attraction
Visit Date
Photo uploaded
```

This improves accessibility and user confidence.

---

## 12. Certificate Preview States

## 12.1 Loading Template

Message:

```text
Preparing your certificate...
```

Thai:

```text
กำลังเตรียมใบประกาศของคุณ...
```

## 12.2 Preview Ready

Show:

```text
certificate image preview
Generate / Download button
Edit details button
```

## 12.3 Missing Photo

Message:

```text
Please upload a photo before creating your certificate.
```

## 12.4 Missing Visit

Message:

```text
We could not find your visit record. Please start again.
```

## 12.5 Template Missing

Message:

```text
Certificate template is not available. Please try again later.
```

---

## 13. Certificate Generation UI

## 13.1 Generate Action

Button text:

```text
Create Certificate
```

Thai:

```text
สร้างใบประกาศ
```

After generated:

```text
Download Certificate
```

Thai:

```text
ดาวน์โหลดใบประกาศ
```

## 13.2 Loading State

Message:

```text
Creating your digital certificate...
```

Thai:

```text
กำลังสร้างใบประกาศดิจิทัลของคุณ...
```

Rules:

- disable button
- prevent double-click
- keep preview visible
- show progress or spinner
- do not clear data

## 13.3 Success State

Message:

```text
Your certificate is ready!
```

Thai:

```text
ใบประกาศของคุณพร้อมแล้ว!
```

Actions:

```text
Download Certificate
View My Stamp
Answer Quick Questions
View My Passport
```

## 13.4 Error State

Message:

```text
We could not create your certificate. Please try again.
```

Action:

```text
Try Again
```

---

## 14. Download UI

## 14.1 Required Actions

After generation, show:

```text
Download PNG
```

Optional:

```text
Share
Copy link
Open certificate
```

## 14.2 Mobile Download Fallback

Some mobile browsers may not download files cleanly.

Fallback instruction:

```text
If download does not start, long press the certificate image and save it to your device.
```

Thai:

```text
หากดาวน์โหลดไม่เริ่ม ให้กดค้างที่รูปใบประกาศแล้วเลือกบันทึกรูปภาพลงอุปกรณ์
```

## 14.3 Download Count

If implemented, increment:

```text
certificates.download_count
```

Do not make download count critical for user flow.

---

## 15. Share UI

## 15.1 MVP Status

Optional.

## 15.2 Web Share API

If supported, show:

```text
Share Certificate
```

Rules:

- user must initiate sharing
- do not auto-share
- do not publish certificate publicly by default

## 15.3 Fallback

Fallback:

```text
Download Certificate
Copy Link
```

if public share link exists.

---

## 16. Certificate Rendering Implementation

## 16.1 MVP Recommended Method

Use:

```text
React certificate component
html-to-image or similar
PNG export
upload generated file to storage
create certificate record
```

## 16.2 Component Rules

Certificate visual component should receive data as props.

Example:

```ts
type CertificateRenderData = {
  displayName: string;
  attractionName: string;
  provinceName?: string;
  visitDateLabel: string;
  photoUrl: string;
  language: "th" | "en";
};
```

Do not fetch database data inside pure visual component.

## 16.3 Font Loading

Ensure fonts are loaded before exporting image.

Recommended fonts:

```text
Prompt
Sarabun
Inter
```

## 16.4 Image Loading

Ensure uploaded photo is fully loaded before export.

Handle cross-origin and storage URL issues.

---

## 17. Certificate Storage UI Impact

Generated certificate should be stored in:

```text
certificate-files
```

The UI should not expose internal storage path.

Use public or signed URL strategy intentionally.

---

## 18. Idempotency and Duplicate Clicks

Users may click generate multiple times.

UI must:

- disable button while generating
- show loading
- reuse existing certificate if available
- avoid creating duplicate certificate records

Server must also protect against duplicate generation.

---

## 19. Certificate and Stamp Integration UI

After certificate success:

Show stamp result.

Possible states:

## 19.1 New Stamp Earned

```text
New stamp earned!
```

Thai:

```text
คุณได้รับตราประทับใหม่แล้ว!
```

## 19.2 Already Earned

```text
You already collected this stamp. Your new visit was still recorded.
```

Thai:

```text
คุณมีตราประทับนี้แล้ว แต่ระบบได้บันทึกการเยี่ยมชมครั้งใหม่ของคุณเรียบร้อย
```

## 19.3 Stamp Failed

```text
Your certificate is ready, but we could not add the stamp right now.
```

Certificate remains usable.

---

## 20. Optional Survey Prompt UI

After certificate/stamp:

Show optional prompt:

```text
Help improve tourism in this area by answering a few quick questions.
```

Thai:

```text
ช่วยพัฒนาการท่องเที่ยวในพื้นที่นี้ ด้วยการตอบคำถามสั้น ๆ
```

Buttons:

```text
Answer Quick Questions
Skip for Now
```

Do not block download.

---

## 21. Save Passport Prompt UI

After certificate/stamp:

Show:

```text
Save your passport so you can access your stamps later.
```

Options:

```text
Continue as Guest
Save with Google
Save with LINE
Email save future
```

Guest warning:

```text
Guest passport is saved on this device only.
```

---

## 22. Privacy UI

Before/near certificate generation, show short notice:

```text
Your photo and display name are used to create this certificate. It will not be shown publicly unless you choose to share it.
```

Thai:

```text
รูปภาพและชื่อที่แสดงจะใช้เพื่อสร้างใบประกาศนี้ และจะไม่ถูกแสดงสาธารณะหากคุณไม่ได้เลือกแชร์
```

---

## 23. Accessibility Requirements

Certificate UI must be accessible.

Requirements:

- preview has text summary
- buttons have clear labels
- generated image has alt text
- error states are text-based
- download/share buttons keyboard accessible
- progress/loading states readable
- color not the only signal

Image alt text:

```text
Generated digital travel certificate for [Attraction Name]
```

---

## 24. Responsive Requirements

## 24.1 Mobile

Certificate preview should fit screen width.

Rules:

- use responsive scaling
- avoid horizontal scroll
- sticky CTA if useful
- buttons large enough
- text summary visible

## 24.2 Desktop

Use split layout if helpful:

```text
left preview
right details/actions
```

---

## 25. Error Handling

## 25.1 Photo Not Found

```text
Please upload a photo before creating your certificate.
```

## 25.2 Visit Not Found

```text
We could not find your visit record. Please start again.
```

## 25.3 Generation Failed

```text
We could not create your certificate. Please try again.
```

## 25.4 Storage Failed

```text
Your certificate was created but could not be saved. Please try again.
```

## 25.5 Download Failed

```text
Download did not start. You can long press the image and save it manually.
```

---

## 26. Admin Template Preview

MVP may not include admin template editor.

Future admin template preview should show:

```text
sample certificate using demo data
template active status
language
attraction assignment
background image
layout config
```

Do not let template changes break old certificates.

---

## 27. Dashboard Impact

Certificate UI creates data for:

```text
certificate_generated count
certificate generation rate
QR to certificate conversion
survey prompt conversion
stamp assignment
engagement by attraction
```

Record funnel event:

```text
certificate_generated
```

---

## 28. Testing Checklist

Test:

```text
Thai certificate
English certificate
long tourist name
long attraction name
missing photo
large photo
portrait photo
landscape photo
slow image loading
double-click generate
download on mobile
download in LINE browser
stamp already earned
survey prompt after success
```

---

## 29. MVP Acceptance Checklist

```text
[ ] Certificate preview page exists.
[ ] Certificate visual design is polished.
[ ] Certificate includes uploaded photo.
[ ] Certificate includes display name.
[ ] Certificate includes attraction name.
[ ] Certificate includes visit date.
[ ] Certificate supports Thai text.
[ ] Certificate supports English text or fallback.
[ ] Generate button works.
[ ] Loading state appears during generation.
[ ] Duplicate clicks are prevented.
[ ] Certificate file is stored.
[ ] Certificate record is created.
[ ] Download works or fallback instruction exists.
[ ] Stamp earned state appears after generation.
[ ] Optional survey prompt appears after reward.
[ ] Privacy notice is shown.
[ ] No private identity data appears on certificate.
```

---

## 30. Do Not Do

Do not:

```text
Generate certificate without visit_id.
Generate certificate without uploaded photo unless explicitly allowed.
Put email or LINE ID on certificate.
Use internal IDs on certificate.
Use tourist name in storage path.
Force survey before certificate download.
Publish certificate publicly by default.
Create duplicate certificate records from double-click.
Use low-quality design.
Use tiny unreadable text.
```

---

## 31. Future Enhancements

Possible future features:

```text
multiple templates
attraction-specific designs
campaign templates
certificate verification code
public share page
PDF export
LINE share
email delivery
template editor
server-side rendering worker
certificate regeneration history
```

---

## 32. Final Certificate Rule

The certificate is the main reward in the tourist flow.

If the certificate does not feel valuable, tourists will not be motivated to complete the system.

Design it as a premium travel memory, not a form receipt.
