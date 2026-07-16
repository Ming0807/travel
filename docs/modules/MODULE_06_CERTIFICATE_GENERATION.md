# MODULE_06_CERTIFICATE_GENERATION.md

## 1. Module Name

**Certificate Generation Module**

---

## 2. Module Purpose

The Certificate Generation Module creates a digital certificate or travel memory card for tourists after they submit minimal data and upload a photo.

This certificate is the main incentive that motivates tourists to participate in the data collection flow.

The certificate should look attractive enough that tourists want to download or share it.

---

## 3. Business Purpose

The project needs tourists to voluntarily provide useful data.

A long survey alone will not work.

The certificate provides immediate value to the tourist while the system collects structured data for sustainable tourism planning.

The certificate supports:

- tourist engagement
- visit completion
- digital memory creation
- data collection motivation
- stamp/passport continuation
- optional survey completion
- social sharing potential

---

## 4. Core Design Decision

The certificate is an incentive, not the main objective of the project.

The main objective remains:

```text
high-quality tourism database and dashboard analytics
```

The certificate must always link back to structured data:

```text
tourist
visit
attraction
photo
template
generated file
```

A certificate without database relationships is not acceptable.

---

## 5. Primary Users

## 5.1 Tourist

Tourists generate, preview, download, and optionally share their certificate.

## 5.2 Returning Tourist

Returning tourists generate new certificates for new visits.

## 5.3 Admin

Admins may manage certificate templates in later phases.

## 5.4 Researcher or Planner

Researchers use certificate counts as engagement metrics.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- Default certificate template
- Certificate preview
- Certificate rendering from tourist and visit data
- Uploaded photo placement
- Tourist display name
- Attraction name
- Visit date
- Generated certificate file
- Certificate database record
- Download button
- Certificate-generated funnel event
- Link to stamp assignment
- Link to optional survey prompt

## 6.2 In Scope for Phase 2

Phase 2 may include:

- Multiple templates
- Attraction-specific templates
- Campaign-specific templates
- Admin template editor
- Share card generation
- QR code on certificate
- Multilingual certificate text
- Server-side rendering worker
- Regeneration history
- Certificate public share page
- Watermark or verification code

## 6.3 Out of Scope

This module does not directly handle:

- Tourist profile creation
- Photo upload validation
- QR code resolution
- Survey question logic
- Dashboard UI
- LINE messaging

It uses data produced by those modules.

---

## 7. Related Modules

This module connects to:

```text
MODULE_03_TOURIST_PROFILE.md
MODULE_04_VISIT_RECORD.md
MODULE_05_PHOTO_UPLOAD.md
MODULE_07_DIGITAL_STAMP_PASSPORT.md
MODULE_08_SURVEY_EXPENSE_SATISFACTION.md
MODULE_10_DASHBOARD_ANALYTICS.md
MODULE_12_LINE_LIFF_OPTIONAL.md
```

---

## 8. Required Data Tables

This module uses:

```text
certificates
certificate_templates
visits
tourists
attractions
visit_photos
funnel_events
```

It triggers or connects to:

```text
tourist_stamps
```

---

## 9. Certificate Data Requirements

A generated certificate must include:

```text
tourist display name
attraction name
visit date
uploaded photo
project/campaign branding
generated date optional
```

Recommended optional fields:

```text
province name
digital stamp graphic
certificate ID
QR/share link
short message
```

Do not include:

```text
email
LINE user ID
Google ID
provider_user_id
device token
guest token
internal tourist ID
internal visit ID
national ID
phone number
full address
private storage path
```

---

## 10. Certificate Template

## 10.1 MVP Template

MVP should use one default template.

Template should be visually polished and mobile-share friendly.

Recommended aspect ratios:

```text
4:5 portrait
1080 x 1350 px
```

or:

```text
A4 landscape/portrait for printable version
```

For social sharing, 4:5 portrait is recommended.

## 10.2 Template Data

Table:

```text
certificate_templates
```

Fields:

```text
template_id
template_name
attraction_id optional
background_path
layout_config_json
language
is_default
is_active
```

## 10.3 Layout Config

The template may store layout configuration in JSON.

Example concept:

```json
{
  "canvas": {
    "width": 1080,
    "height": 1350
  },
  "photo": {
    "x": 90,
    "y": 220,
    "width": 900,
    "height": 640,
    "borderRadius": 32
  },
  "displayName": {
    "x": 540,
    "y": 940,
    "fontSize": 54,
    "align": "center"
  },
  "attractionName": {
    "x": 540,
    "y": 1030,
    "fontSize": 36,
    "align": "center"
  },
  "visitDate": {
    "x": 540,
    "y": 1100,
    "fontSize": 28,
    "align": "center"
  }
}
```

MVP can hardcode layout in React/CSS and store only one template record.

---

## 11. Rendering Strategy

## 11.1 MVP Rendering Options

Recommended MVP options:

### Option A: Frontend HTML/CSS to Image

Use React component and export to PNG.

Possible libraries:

```text
html-to-image
dom-to-image
```

Pros:

- Fast to develop
- Easy preview
- Works well for MVP
- Design can use CSS/Tailwind

Cons:

- Browser-dependent
- Font rendering can vary
- Large images may be memory-heavy

### Option B: Server-Side Rendering with Playwright

Pros:

- More consistent output
- Better production control

Cons:

- More complex
- Requires server/worker setup

### Option C: Sharp/Canvas Rendering

Pros:

- High performance
- Good for production

Cons:

- More code complexity
- Harder template design

## 11.2 Recommendation

For MVP:

```text
React certificate component + HTML/CSS to PNG
```

For production:

```text
Server-side rendering with Playwright or Sharp
```

---

## 12. Certificate Flow

Recommended flow:

```text
Tourist completes minimal form
    |
Visit is created
    |
Tourist uploads photo
    |
System loads certificate template
    |
System renders certificate preview
    |
Tourist confirms or downloads
    |
System generates image file
    |
System stores certificate file
    |
System creates certificates record
    |
System updates visit completion_status
    |
System records certificate_generated event
    |
System assigns digital stamp
    |
System prompts optional survey
```

---

## 13. Certificate Record

Table:

```text
certificates
```

Required fields:

```text
visit_id
template_id
photo_id
certificate_path
generated_at
download_count
```

Optional:

```text
share_url
verification_code
language
metadata_json
```

---

## 14. Storage Requirements

Generated certificates should be stored separately from uploaded photos.

Recommended bucket:

```text
certificate-files
```

Recommended path:

```text
certificates/{year}/{month}/{visit_id}/{certificate_id}.png
```

Rules:

- Do not use tourist name in file path.
- Do not expose private paths directly.
- Use public or signed URL strategy intentionally.
- Store generated file path in database.

---

## 15. Certificate Preview

## 15.1 Preview Purpose

The preview lets tourist see the certificate before downloading.

Preview should show:

```text
uploaded photo
display name
attraction name
visit date
branding
```

## 15.2 Preview Requirements

- Must be mobile-friendly.
- Must fit screen.
- Must have loading state.
- Must allow returning to edit name/photo before final generation if feasible.
- Must not require optional survey first.

---

## 16. Download Requirements

After generation, tourist should be able to:

```text
download certificate image
save to device
share if browser supports Web Share API
```

MVP minimum:

```text
Download PNG
```

Optional:

```text
Share button
```

---

## 17. Share Requirements

Phase 2 may include share card and public share page.

Potential features:

```text
share image
copy link
Web Share API
Facebook share
X Intent
save image
public certificate page
```

Privacy rule:

Public sharing must be user-initiated.

Do not publish certificate by default.

Instagram should be handled through downloaded image or the mobile share sheet. Do not implement automatic social posting as MVP.

Future public certificate pages must use random public share tokens and must not expose tourist_id, visit_id, provider_user_id, guest token, or private storage paths.

---

## 18. Language Requirements

MVP should support:

```text
Thai
English
```

Certificate text should follow selected language if available.

Fallback rule:

```text
Use preferred language.
If content missing, fallback to Thai or English.
```

---

## 19. Certificate Text

Example English:

```text
Certificate of Visit
This certifies that [Name] visited [Attraction]
on [Visit Date]
Southern Border Tourism Digital Passport
```

Example Thai:

```text
ใบประกาศการเยี่ยมชม
ขอมอบใบประกาศนี้ให้แก่ [Name]
เพื่อแสดงว่าได้มาเยี่ยมชม [Attraction]
เมื่อวันที่ [Visit Date]
```

Use wording that feels like a travel memory, not an official legal certificate.

---

## 20. Date Formatting

Use locale-friendly date.

Thai:

```text
18 พฤษภาคม 2569
```

English:

```text
18 May 2026
```

Store dates in database as standard date/timestamp.

Format only in UI/rendering.

---

## 21. Font Requirements

Certificate rendering should use readable fonts.

Recommended:

```text
Prompt
Sarabun
Inter
```

Rules:

- Ensure fonts are loaded before export.
- Do not use unlicensed fonts.
- Do not expose font files unless license allows it.
- Use fallback fonts.

---

## 22. Image Quality Requirements

Output should be good enough for sharing.

Recommended MVP output:

```text
PNG
1080 x 1350 px
```

Alternative:

```text
JPEG high quality
```

Rules:

- Avoid blurry text.
- Use sufficient contrast.
- Ensure photo is not distorted.
- Use object-fit/crop carefully.

---

## 23. Certificate Generation Idempotency

Users may click generate/download multiple times.

Rules:

- Avoid creating many duplicate certificate records for the same visit unintentionally.
- If certificate already exists for visit and same template/photo, reuse it if appropriate.
- If regeneration is allowed, create versioning or replace intentionally.

MVP recommendation:

```text
one active certificate per visit
```

or:

```text
create certificate only once, then reuse
```

---

## 24. Visit Status Update

When certificate is generated:

Update visit:

```text
completion_status = certificate_generated
```

If survey later completes:

```text
completion_status = survey_completed
```

---

## 25. Funnel Event

When certificate generation succeeds, record:

```text
certificate_generated
```

Event data:

```text
session_id
tourist_id
visit_id
attraction_id
photo_spot_id
checkin_code_id
event_time
```

---

## 26. Stamp Integration

After certificate generation, the system should assign digital stamp.

The stamp module should:

```text
check if tourist already has stamp for attraction
if not, create tourist_stamps record
if yes, do not duplicate stamp
```

Certificate generation can trigger this action, but stamp logic should live in the Digital Stamp Module.

---

## 27. Optional Survey Prompt

After certificate is generated, show optional survey prompt.

Example:

```text
Help improve tourism in this area by answering a few quick questions.
```

Thai:

```text
ช่วยพัฒนาการท่องเที่ยวในพื้นที่นี้ ด้วยการตอบคำถามสั้น ๆ
```

Do not block certificate download behind survey.

---

## 28. Error Handling

## 28.1 Missing Visit

Message:

```text
We could not find your visit record. Please start again.
```

## 28.2 Missing Photo

Message:

```text
Please upload a photo before creating your certificate.
```

## 28.3 Missing Template

Message:

```text
Certificate template is not available. Please try again later.
```

## 28.4 Render Failed

Message:

```text
We could not create your certificate. Please try again.
```

## 28.5 Storage Failed

Message:

```text
Your certificate was created but could not be saved. Please try again.
```

Do not expose internal errors to tourist.

---

## 29. Security Requirements

Rules:

- Certificate generation must use validated visit data.
- Tourist must not generate certificate for another tourist's visit.
- Do not expose private storage credentials.
- Do not include private identity fields on certificate.
- Validate template ID.
- Validate photo belongs to visit.
- Protect admin template management.

---

## 30. Privacy Requirements

Certificates may contain:

```text
display name
tourist photo
attraction
visit date
```

These can be identifying.

Rules:

- User must intentionally generate/download/share.
- Do not publish certificate publicly by default.
- Do not include email, phone, LINE ID, Google ID, provider_user_id, guest token, internal tourist ID, internal visit ID, national ID, or full address.
- Apply retention policy.
- Allow future deletion/anonymization.

---

## 31. Retention Requirements

Certificate files should have retention policy.

Recommended:

```text
Keep while tourist needs access.
Review after 1 year.
Delete/archive after 2 years inactive unless passport remains active.
```

Database record may be retained for aggregate count after file deletion.

See:

```text
docs/database/DATA_RETENTION_POLICY.md
```

---

## 32. Dashboard Impact

Certificate data supports:

```text
certificate_count
certificate_generation_rate
certificate_count_by_attraction
certificate_count_by_province
QR-to-certificate conversion
survey prompt conversion
```

Important:

Certificate count is an engagement metric.

It is not the same as total tourist count.

---

## 33. Export Rules

Exports may include:

```text
certificate_generated true/false
certificate_generated_at
certificate_count
```

Do not include direct certificate file URL in general exports unless authorized.

---

## 34. API or Service Responsibilities

Recommended service functions:

```text
getCertificateTemplate(attractionId, language)
buildCertificateData(visitId)
renderCertificatePreview(data)
generateCertificateImage(data)
uploadCertificateFile(visitId, image)
createCertificateRecord(input)
getCertificateByVisit(visitId)
incrementCertificateDownloadCount(certificateId)
```

---

## 35. Suggested Data Object

Conceptual certificate data:

```ts
type CertificateRenderData = {
  visitId: number;
  touristDisplayName: string;
  attractionName: string;
  provinceName: string;
  visitDate: string;
  photoUrl: string;
  templateId: number;
  language: "th" | "en";
};
```

---

## 36. Admin Template Management

MVP can use seed template only.

Future admin template management should allow:

```text
create template
edit template name
upload background
configure layout
assign to attraction
preview template
activate/deactivate
set default
```

Template changes should not break old certificates.

---

## 37. Edge Cases

## 37.1 User Changes Name After Preview

Allow before final generation.

After generation, either:

- regenerate certificate
- keep old certificate unchanged

MVP can regenerate before final save.

## 37.2 User Changes Photo

If before generation, update preview.

If after generation, require regeneration.

## 37.3 Duplicate Generate Click

Prevent duplicate records.

Use loading state and server-side idempotency.

## 37.4 Template Missing

Fallback to default template.

## 37.5 Uploaded Photo Rejected Later

If moderation rejects photo after certificate was created, define business rule.

MVP may not implement post-generation moderation.

## 37.6 Long Tourist Name

Handle with:

- smaller font
- line wrapping
- max length
- preview warning

## 37.7 Long Attraction Name

Handle with line wrapping or smaller font.

---

## 38. Example User Stories

## 38.1 Tourist Generates Certificate

As a tourist, I want to generate a digital certificate from my uploaded photo.

Acceptance:

```text
Given I have completed minimal form and uploaded a photo
When I generate certificate
Then I see a certificate with my name, photo, attraction, and visit date
```

---

## 38.2 Tourist Downloads Certificate

As a tourist, I want to download my certificate.

Acceptance:

```text
Given my certificate is generated
When I click download
Then the image file downloads to my device
```

---

## 38.3 Certificate Is Linked to Visit

As a planner, I want certificate generation to be linked to visit data.

Acceptance:

```text
Given a certificate is generated
Then certificates table has visit_id, template_id, photo_id, and generated_at
```

---

## 38.4 Certificate Triggers Stamp

As a tourist, I want to receive a stamp after completing the certificate flow.

Acceptance:

```text
Given certificate generation succeeds
When the attraction stamp has not been earned
Then the system creates a tourist_stamps record
```

---

## 39. MVP Acceptance Checklist

```text
[ ] Default template exists.
[ ] Certificate preview works.
[ ] Certificate includes display name.
[ ] Certificate includes attraction name.
[ ] Certificate includes visit date.
[ ] Certificate includes uploaded photo.
[ ] Certificate can be generated as image.
[ ] Certificate file is stored.
[ ] certificates record is created.
[ ] Certificate can be downloaded.
[ ] Visit status updates to certificate_generated.
[ ] certificate_generated funnel event is recorded.
[ ] Stamp assignment is triggered or available.
[ ] Survey prompt appears after certificate.
[ ] No email/LINE/Google/device token/provider ID/internal ID appears on certificate.
[ ] Duplicate generation is controlled.
```

---

## 40. Do Not Do

Do not:

```text
Treat certificate as the main database objective.
Generate certificate without visit_id.
Generate certificate without validating photo belongs to visit.
Put email or LINE ID on certificate.
Put Google ID, provider_user_id, guest token, internal tourist ID, internal visit ID, phone, national ID, or full address on certificate.
Publish certificate publicly by default.
Store certificate only in frontend state.
Create many duplicate certificate records from double click.
Block certificate download behind optional survey.
Block certificate download behind optional sharing, LINE, Google, email, or phone number.
Use unlicensed fonts.
Use tourist name in storage path.
```

---

## 41. Future Enhancements

Possible future features:

```text
multiple certificate templates
attraction-specific templates
campaign templates
share card
public certificate page
certificate verification code
QR code on certificate
server-side rendering worker
PDF output
template editor
LINE send certificate
email certificate delivery
certificate regeneration history
```

---

## 42. Definition of Done

This module is done when:

```text
[ ] Certificate renders correctly.
[ ] Certificate uses real database data.
[ ] Certificate includes uploaded photo.
[ ] Certificate file is saved.
[ ] Certificate record is stored.
[ ] Tourist can download certificate.
[ ] Visit status updates.
[ ] Funnel event is recorded.
[ ] Stamp flow can continue.
[ ] Privacy rules are followed.
[ ] Error handling is friendly.
[ ] Documentation and tests are updated.
```

---

## 43. Current Production Status (2026-07-16)

Implemented:

```text
[x] Attraction-specific and global template resolution
[x] Thai/English preference with Thai fallback
[x] Server validation of requested template against visit attraction
[x] Private same-origin template image proxy
[x] Landscape and portrait preview rendering
[x] Atomic default-template switch through service-role-only RPC
[x] One default per language and scope enforced by partial unique indexes
[x] Admin attraction picker for scoped templates
[x] Template mutation audit logs and orphan background cleanup
[x] Certificate Template Studio with shared live renderer
[x] Guided photo/text positioning, shape, colors, visibility, and safe-zone checks
[x] Draft save/cancel behavior with server-side overlap validation
```

Future advanced studio work remains separate: custom font upload, freeform photo masks, campaign
variants, reusable design presets, and tourist-selectable variants.
