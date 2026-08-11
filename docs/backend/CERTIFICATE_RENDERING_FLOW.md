# CERTIFICATE_RENDERING_FLOW.md

## 1. Document Purpose

This document defines the certificate rendering flow for the **Southern Border Tourism Data & Intelligence Platform**.

The certificate is the main tourist incentive. It must be visually valuable, technically reliable, privacy-safe, and correctly linked to the database.

This document focuses on backend responsibilities and the complete rendering workflow, including frontend-generated image strategy, storage, idempotency, stamp assignment, and failure handling.

---

## 2. Certificate Rendering Mission

The certificate rendering mission is:

```text
Generate a high-quality digital travel memory while preserving data integrity and privacy.
```

A generated certificate must:

- use verified visit data
- use verified tourist profile data
- use verified uploaded photo
- link to one visit
- link to one attraction
- store a certificate record
- support download
- trigger stamp assignment
- avoid duplicate records
- avoid exposing private identity data

---

## 3. Why Certificate Rendering Matters

The certificate is not only a visual feature.

It is the reward that motivates the tourist to:

```text
scan QR
provide minimal profile data
upload a photo
complete the visit flow
possibly answer optional survey
return to collect more stamps
```

If certificate generation fails or feels low-quality, the entire data collection strategy becomes weaker.

---

## 4. Related Documents

Certificate rendering must align with:

```text
docs/modules/MODULE_06_CERTIFICATE_GENERATION.md
docs/frontend/CERTIFICATE_UI_SPEC.md
docs/frontend/TOURIST_FLOW_UI_SPEC.md
docs/backend/STORAGE_FILE_UPLOADS.md
docs/backend/SERVICE_LAYER.md
docs/backend/VALIDATION_ERROR_HANDLING.md
docs/database/DATA_DICTIONARY.md
docs/database/DATA_RETENTION_POLICY.md
```

---

## 5. Certificate Flow Position

Recommended tourist flow:

```text
QR scan
    |
Landing page
    |
Minimal profile
    |
Photo upload
    |
Certificate preview
    |
Certificate generation
    |
Certificate stored
    |
Visit status updated
    |
Stamp awarded
    |
Success page
    |
Optional survey
```

Certificate generation happens after photo upload and before optional survey.

The survey must not block certificate download.

---

## 6. Rendering Strategy Options

## 6.1 MVP Recommended Strategy

MVP recommended:

```text
Frontend renders certificate component
Frontend converts certificate component to PNG
Frontend sends generated PNG to backend
Backend validates visit/session
Backend stores PNG in storage
Backend creates certificate record
Backend awards stamp
```

Suggested frontend tool:

```text
html-to-image
```

or equivalent.

Reason:

- faster MVP implementation
- easier visual iteration
- no server-side browser setup
- works well with React certificate component
- works with the server-side storage adapter, currently Cloudinary-first for Vercel with Supabase fallback and future university storage support

## 6.2 Production Server-Side Strategy

Future production strategy:

```text
Backend renders certificate using headless browser or rendering worker
Backend stores final image/PDF
Frontend receives download URL
```

Possible tools:

```text
Playwright
Puppeteer
server-side canvas
React PDF for PDF version
```

Benefits:

- more consistent rendering
- less dependency on user browser
- easier regeneration
- stronger control over fonts/assets

Costs:

- more infrastructure
- more CPU/memory
- background job may be needed

## 6.3 Hybrid Strategy

Possible future:

```text
frontend preview
backend final render
```

This gives good UX and reliable production output.

---

## 7. MVP Rendering Decision

For MVP:

```text
Use frontend-rendered PNG with backend-controlled validation, storage, and database record creation.
```

Important:

Even if the image is rendered on frontend, the backend must still control:

```text
who can generate
which visit is valid
which photo belongs to visit
where file is stored
whether certificate already exists
how certificate record is created
when stamp is awarded
```

---

## 8. Required Source Data

Certificate rendering requires:

```text
tourist display name
visit_id
visit_date
attraction name
province name
uploaded photo URL
certificate template
language
```

Source tables:

```text
tourists
visits
attractions
provinces
visit_photos
certificate_templates
certificates
```

Optional source:

```text
stamp_definitions
tourist_stamps
```

---

## 9. Certificate Preview Data Service

Recommended service method:

```ts
getCertificatePreviewData(input: CertificatePreviewInput): Promise<ServiceResult<CertificatePreviewData>>;
```

Input:

```ts
type CertificatePreviewInput = {
  visitId: number;
  sessionId?: string;
  guestToken?: string;
  language?: "th" | "en";
};
```

Output:

```ts
type CertificatePreviewData = {
  visitId: number;
  touristDisplayName: string;
  attractionName: string;
  provinceName?: string;
  visitDateLabel: string;
  photoUrl: string;
  templateId: number;
  language: "th" | "en";
  existingCertificate?: {
    certificateId: number;
    certificateUrl: string;
    generatedAt: string;
  };
};
```

Rules:

- verify visit exists
- verify current tourist/session can access visit
- verify photo exists
- verify template exists
- return signed photo URL if photo bucket is private
- do not return private identity fields

---

## 10. Certificate Render Data Rules

## 10.1 Display Name

Use:

```text
tourists.display_name
```

Rules:

- required
- max 150 characters
- may be nickname or chosen name
- not necessarily legal name

## 10.2 Visit Date

Use:

```text
visits.visit_date
```

Format by language in UI/rendering layer.

Thai example:

```text
18 พฤษภาคม 2569
```

English example:

```text
18 May 2026
```

## 10.3 Attraction Name

Use localized name if available.

Fallback:

```text
name_en -> name_th
name_th -> name_en
```

depending on selected language.

## 10.4 Photo URL

Use photo linked to visit.

Rules:

- photo must belong to visit
- photo must be accessible for rendering
- signed URL should be short-lived if bucket is private

## 10.5 Template

Use default active template if attraction-specific template not available.

---

## 11. Certificate Template Selection

Recommended service:

```ts
selectCertificateTemplate(input: TemplateSelectionInput): Promise<ServiceResult<CertificateTemplate>>;
```

Selection priority:

```text
1. active attraction-specific template for selected language
2. active province-specific template for selected language
3. active global default template for selected language
4. active global default template fallback language
```

MVP can use:

```text
one default active template
```

---

## 12. Certificate Generation API

Recommended route:

```text
POST /api/certificates/generate
```

For MVP frontend-rendered PNG:

```text
Content-Type: multipart/form-data
```

Fields:

```text
visitId
templateId
language
sessionId optional
certificateImage file/blob
```

Backend must validate:

```text
visit exists
current tourist/session can access visit
photo exists for visit
template exists and is active
certificate image file exists
file type allowed
file size allowed
certificate not already generated or regenerate policy allows it
```

---

## 13. Generated Certificate File Requirements

MVP output:

```text
PNG
1080 x 1350 px recommended
max size 5 MB recommended
```

Allowed MIME types for generated certificate:

```text
image/png
image/jpeg optional
image/webp optional
```

Recommended:

```text
image/png
```

Do not accept arbitrary file types.

---

## 14. Certificate Storage Path

Recommended path:

```text
certificates/{year}/{month}/{visit_id}/{random_or_certificate_id}.png
```

Example:

```text
certificates/2026/05/501/cert_9001.png
```

Rules:

- generated server-side
- no tourist name
- no email
- no LINE ID
- no original client filename
- no private token in path

---

## 15. Certificate Database Record

Table:

```text
certificates
```

Required fields:

```text
certificate_id
visit_id
template_id
photo_id
certificate_path
generated_at
download_count
status
```

Recommended fields:

```text
language
file_size_bytes
mime_type
metadata_json
created_at
updated_at
```

Status values:

```text
generated
revoked
failed
```

MVP can use:

```text
generated
```

---

## 16. Certificate Generation Service

Recommended method:

```ts
generateCertificate(input: GenerateCertificateInput): Promise<ServiceResult<GenerateCertificateResult>>;
```

Input:

```ts
type GenerateCertificateInput = {
  visitId: number;
  templateId?: number;
  language: "th" | "en";
  sessionId?: string;
  guestToken?: string;
  certificateFile: FileLike;
};
```

Output:

```ts
type GenerateCertificateResult = {
  certificateId: number;
  certificateUrl: string;
  visitId: number;
  stampResult: {
    status: "earned" | "already_earned" | "no_stamp_available" | "failed";
    stampId?: number;
    message?: string;
  };
};
```

---

## 17. Recommended Generation Workflow

```text
Receive generate request
    |
Authenticate tourist/session context
    |
Validate visit access
    |
Load visit, tourist, attraction, photo
    |
Check existing certificate for visit
    |
If existing certificate exists:
    return existing certificate
    optionally call stamp award if missing
    stop
    |
Validate uploaded generated certificate file
    |
Generate storage path
    |
Upload certificate file through storage adapter
    |
Create certificate database record
    |
Update visit completion_status = certificate_generated
    |
Record funnel event certificate_generated
    |
Call StampService.awardStampForVisit(visitId)
    |
Return certificate URL and stamp result
```

---

## 18. Idempotency Rules

Users may double-click or retry.

MVP rule:

```text
one active certificate per visit
```

Database recommendation:

```text
unique active certificate per visit
```

or application-level check:

```text
find certificate where visit_id = input.visitId and status = generated
```

If exists:

```text
return existing certificate instead of creating duplicate
```

Do not create duplicate certificates from repeated clicks.

---

## 19. Regeneration Policy

MVP:

```text
No normal regeneration.
Return existing certificate.
```

Future options:

```text
allow regeneration if admin/research setting permits
store regeneration history
replace existing file
create new version
```

If regeneration is allowed, track:

```text
version_number
previous_certificate_id
regenerated_at
regenerated_reason
```

Do not implement complexity before needed.

---

## 20. Stamp Award Integration

After certificate record is created or confirmed, call:

```ts
StampService.awardStampForVisit(visitId)
```

Possible results:

```text
earned
already_earned
no_stamp_available
failed
```

Rules:

- duplicate stamp is not fatal
- no stamp definition is not fatal
- stamp failure is partial success
- certificate must remain available

---

## 21. Partial Success Handling

## 21.1 Certificate Generated, Stamp Failed

Return success:

```json
{
  "success": true,
  "data": {
    "certificateId": 9001,
    "stampResult": {
      "status": "failed",
      "message": "Your certificate is ready, but we could not add the stamp right now."
    }
  }
}
```

Do not delete certificate.

## 21.2 Certificate File Uploaded, DB Insert Failed

Attempt cleanup:

```text
delete uploaded file
log error
return friendly failure
```

If cleanup fails:

```text
log orphan file for cleanup
```

## 21.3 DB Insert Succeeds, Status Update Fails

Certificate exists.

Try to update visit status again.

Log failure if retry fails.

Do not delete certificate automatically.

---

## 22. Certificate URL Strategy

Recommended:

```text
store certificate_path in database
generate signed URL when needed
```

Do not store signed URL permanently.

If using public bucket:

- path must be unguessable
- sharing policy must be clear
- still do not expose internal path unnecessarily

Privacy-safe recommendation:

```text
private bucket + signed URL
```

---

## 23. Download Flow

Frontend requests certificate URL or uses returned URL.

Optional route:

```text
GET /api/certificates/[certificateId]/download
```

Backend:

```text
verify access
generate signed URL or stream file
increment download_count if needed
return redirect/file
```

MVP can return certificate URL from generation response.

---

## 24. Certificate Download Count

Optional MVP.

If implemented:

```ts
incrementCertificateDownloadCount(certificateId)
```

Rules:

- do not block download if count update fails
- do not count repeated failed attempts as critical metric
- do not expose user identity unnecessarily

---

## 25. Certificate Sharing

Current production behavior:

```text
owned certificate -> private download endpoint -> generated image File
```

The tourist can download the generated PNG immediately. On browsers that support
`navigator.share` and `navigator.canShare({ files })`, the success page shares the
generated image file itself. Other browsers show Thai instructions to download the
image and share it from the device gallery.

The system must never share or copy the private success-page URL as a fallback.
The success page and certificate file remain protected by tourist visit ownership.

Future optional channels:

```text
privacy-safe public share token
LINE share
email delivery
```

Public share should use:

```text
share token
explicit user action
privacy-safe public view
revocation option future
```

Do not publish certificates automatically.

Current download route:

```text
GET /api/certificate/download?visitId={owned_visit_uuid}
```

The route verifies tourist ownership, streams the real image with
`Content-Disposition: attachment`, uses `private, no-store`, and reports storage
failure explicitly instead of returning a placeholder image.

---

## 26. Privacy Rules

Certificate must not include:

```text
email
LINE ID
provider_user_id
device token
internal tourist_id
full address
national ID
phone number
```

Certificate may include:

```text
display name
photo
attraction name
province
visit date
project branding
```

User must be informed that photo and display name are used to create certificate.

---

## 27. Security Rules

Backend must:

- verify visit access
- validate generated file
- generate storage path server-side
- avoid personal data in path
- never expose service role key
- return safe URL only
- prevent duplicate records
- avoid arbitrary file uploads

---

## 28. Font and Asset Considerations

Frontend-rendered certificate needs fonts and images loaded before image export.

Frontend should ensure:

```text
font loaded
photo loaded
template assets loaded
no broken images
```

Backend should not trust that the generated image is visually correct.

Backend validates only file safety and workflow correctness.

Future server-side rendering can improve consistency.

---

## 29. Multi-Language Certificate

MVP supports:

```text
Thai
English
```

Certificate data should include:

```text
language
localized attraction name
localized date label
localized title/message
```

Fallback rules:

```text
if selected language content missing, use available language
```

---

## 30. Error Handling

## 30.1 Missing Visit

```text
code: VISIT_NOT_FOUND
message: We could not find your visit record. Please start again.
```

## 30.2 Access Denied

```text
code: FORBIDDEN
message: You do not have access to this certificate.
```

## 30.3 Missing Photo

```text
code: PHOTO_REQUIRED
message: Please upload a photo before creating your certificate.
```

## 30.4 Missing Template

```text
code: CERTIFICATE_TEMPLATE_NOT_FOUND
message: Certificate template is not available. Please try again later.
```

## 30.5 Invalid Generated File

```text
code: CERTIFICATE_FILE_INVALID
message: We could not read the generated certificate file. Please try again.
```

## 30.6 Upload Failed

```text
code: CERTIFICATE_UPLOAD_FAILED
message: We could not save your certificate. Please try again.
```

## 30.7 Unexpected Failure

```text
code: CERTIFICATE_GENERATION_FAILED
message: We could not create your certificate. Please try again.
```

---

## 31. Logging Requirements

Log:

```text
certificate generation started
certificate generation failed
certificate file upload failed
certificate metadata save failed
stamp award failed after certificate
duplicate certificate request
```

Do not log:

```text
raw image file content
service role key
LINE token
private signed URL
unnecessary personal data
```

---

## 32. Performance Requirements

MVP:

- keep image size reasonable
- avoid huge certificate files
- show loading state
- prevent duplicate requests
- avoid blocking dashboard/admin services

Production:

- move heavy rendering to worker if server-side
- use queue for bulk regeneration
- use storage CDN/optimization where appropriate
- monitor generation time

---

## 33. Background Job Integration

Future certificate-related background jobs:

```text
certificate cleanup
orphan file cleanup
server-side regeneration
thumbnail generation
PDF generation
expired share link cleanup
```

See:

```text
docs/backend/BACKGROUND_JOBS.md
```

---

## 34. Testing Checklist

Test:

```text
valid certificate generation
missing visit
missing photo
invalid generated file type
large generated file
duplicate generate click
existing certificate returned
stamp earned after certificate
stamp already earned
stamp failure partial success
storage upload failure
database insert failure
download URL generation
Thai certificate
English certificate
long display name
long attraction name
mobile-generated PNG
LINE browser download fallback
```

---

## 35. MVP Acceptance Checklist

```text
[ ] Certificate preview data service exists.
[ ] Certificate generation endpoint/action exists.
[ ] Visit access is verified.
[ ] Photo belongs to visit.
[ ] Template is selected.
[ ] Generated certificate file is validated.
[ ] Storage path is generated server-side.
[ ] Certificate file is stored.
[ ] Certificate database record is created.
[ ] Duplicate generation is prevented.
[ ] Visit status updates to certificate_generated.
[ ] certificate_generated funnel event is recorded.
[ ] Stamp award is triggered.
[ ] Stamp already earned is handled gracefully.
[ ] Certificate URL is returned safely.
[ ] User-friendly errors exist.
```

---

## 36. Do Not Do

Do not:

```text
Generate certificate without visit_id.
Generate certificate without verified photo.
Trust client-provided storage path.
Use tourist name in file path.
Store certificate image as base64 in database.
Create duplicate certificate records from double-click.
Delete certificate when stamp award fails.
Put email or LINE ID on certificate.
Publish certificate publicly without user action.
Expose service role key to frontend.
```

---

## 37. Future Enhancements

Possible future enhancements:

```text
server-side certificate rendering
PDF certificate generation
multiple templates
attraction-specific templates
certificate verification code
public share page
LINE share
email delivery
certificate regeneration history
certificate revocation
template editor
background rendering job
```

---

## 38. Final Certificate Rendering Rule

The certificate is the reward that makes the data collection strategy work.

The rendering flow must be reliable, attractive, privacy-safe, and correctly connected to visit, photo, stamp, and survey workflows.

---

## 39. Production Template Resolution (Implemented 2026-07-16)

The preview and generation API now use the same server-side resolver:

```text
active template in requested language
  -> attraction-specific template
  -> global template
  -> Thai-language fallback
```

The client submits the resolved `templateId`, but `/api/certificate/generate` validates it again
against the owned visit and its attraction before storage or database writes. Template backgrounds
are delivered through `/api/certificate/template-image`, which checks visit ownership and template
scope before proxying private image bytes. The generated `certificates.template_id` therefore
matches the template shown in preview.

Template orientation is stored in `layout_config_json.orientation` as `landscape` or `portrait`.
Legacy rows default to landscape because the original admin upload workflow requested horizontal
backgrounds.

The admin Studio and tourist preview both render through `CertificateArtwork`. Layout JSON is
normalized before rendering and strictly validated before save. The server rejects positions that
overlap or leave the configured safe zone, even if a client bypasses the Studio controls.

## 40. Tourist Template Selection and Photo Crop (Implemented 2026-08-01)

The preview loads the complete eligible selection through the same server-side template service:

```text
active templates
  -> visit attraction or global scope only
  -> requested language, with Thai fallback for English requests
  -> deterministic attraction/default ordering
```

Only a same-origin `template-image` URL and normalized layout data cross the server/client boundary;
private storage paths are never sent to the browser. Selecting another template updates the live
preview and the submitted `templateId`. The generation API resolves that ID again against the owned
visit before it stores a file or writes a certificate record.

Photo customization is intentionally bounded to zoom `1-2` and crop position `0-100` on each axis.
The normalized adjustment is applied to the browser-rendered artifact. The database does not need a
new customization column because the generated PNG is the immutable output for that generation.

Background files are decorative full-bleed artwork only. Photo shape, border, accent outline, text,
date, and stamp are rendered by `CertificateArtwork`, allowing one layout contract to work with many
background styles without a baked-in placeholder becoming misaligned.
