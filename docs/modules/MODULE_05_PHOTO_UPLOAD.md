# MODULE_05_PHOTO_UPLOAD.md

## 1. Module Name

**Photo Upload Module**

---

## 2. Module Purpose

The Photo Upload Module allows tourists to upload a travel photo that will be used to create a digital certificate or travel memory card.

This module is part of the tourist engagement mechanism.

It helps motivate tourists to participate and provide useful tourism data.

The uploaded photo must be handled carefully because it may contain personally identifiable visual information.

---

## 3. Business Purpose

The teacher's concept includes prepared photo spots at attractions.

Tourists can take a photo at the location, upload it to the system, and receive a digital certificate or infographic-style memory card.

This creates value for the tourist and helps the system collect structured tourism data.

The module supports:

- tourist participation
- certificate generation
- visit record completion
- digital memory creation
- higher survey completion potential
- tourism engagement analytics

---

## 4. Core Design Decision

Uploaded photos and generated certificates must be stored separately.

Correct:

```text
visit_photos = uploaded source photo
certificates = generated certificate output
```

Incorrect:

```text
store uploaded photo and certificate as one field in visits table
```

Reason:

- A photo is an input.
- A certificate is an output.
- A visit may have multiple photos in the future.
- A certificate may be regenerated using a different template.
- Photo moderation and certificate download tracking require separate records.

---

## 5. Primary Users

## 5.1 Tourist

A tourist uploads a photo to create a certificate.

## 5.2 Returning Tourist

A returning tourist uploads a new photo for a new visit.

## 5.3 Admin

An admin may review uploaded photos if moderation is enabled.

## 5.4 System

The system uses uploaded photos as input for certificate rendering.

---

## 6. Module Scope

## 6.1 In Scope for MVP

MVP includes:

- Photo upload UI
- Image preview
- File type validation
- File size validation
- Upload to storage
- Metadata storage
- Link photo to visit
- Basic upload error handling
- Mobile-friendly upload experience
- Optional approval status field

## 6.2 In Scope for Phase 2

Phase 2 may include:

- Image cropping
- Image rotation
- Image compression
- Thumbnail generation
- Manual moderation queue
- AI image moderation
- Multiple photos per visit
- Drag-and-drop upload for desktop
- Photo retake guide
- Private signed URL handling
- Storage lifecycle cleanup

## 6.3 Out of Scope

This module does not directly handle:

- QR code resolution
- Tourist profile creation
- Certificate rendering
- Survey submission
- Dashboard chart rendering

It provides photo data to the certificate module.

---

## 7. Related Modules

This module connects to:

```text
MODULE_02_QR_CHECKIN.md
MODULE_03_TOURIST_PROFILE.md
MODULE_04_VISIT_RECORD.md
MODULE_06_CERTIFICATE_GENERATION.md
MODULE_09_ADMIN_ATTRACTION_CMS.md
MODULE_10_DASHBOARD_ANALYTICS.md
```

---

## 8. Required Data Tables

This module writes to:

```text
visit_photos
```

This module reads from:

```text
visits
```

This module supports:

```text
certificates
funnel_events
audit_logs optional
```

---

## 9. Storage Requirements

Photos should be stored in object storage.

Recommended MVP storage:

```text
Supabase Storage
```

Do not store raw base64 image data in the database.

Database should store only metadata and storage path.

---

## 10. Storage Bucket Strategy

Recommended buckets:

```text
visit-photos
certificate-files
attraction-media
temp-uploads
```

For this module:

```text
visit-photos
```

---

## 11. Storage Path Strategy

Recommended path format:

```text
visit-photos/{year}/{month}/{visit_id}/{photo_id-or-random-id}.{extension}
```

Example:

```text
visit-photos/2026/05/501/8f9d2a7c.webp
```

Rules:

- Do not use original filename as final path.
- Do not include tourist display name in path.
- Do not include email, LINE ID, or device token in path.
- Use random or generated file names.

---

## 12. Allowed File Types

MVP allowed MIME types:

```text
image/jpeg
image/png
image/webp
```

Rules:

- Validate MIME type on server side.
- Do not trust file extension only.
- Reject unsupported files.

---

## 13. File Size Rules

Recommended MVP max file size:

```text
5 MB
```

Acceptable range:

```text
5 MB to 10 MB
```

Exact value should be configurable.

Rules:

- Reject files larger than limit.
- Show clear error message.
- Consider client-side compression later.

---

## 14. Image Metadata

Store metadata in `visit_photos`.

Required:

```text
visit_id
storage_path
mime_type
file_size_bytes
uploaded_at
approval_status
```

Recommended:

```text
thumbnail_path
original_filename
width
height
```

Do not store:

```text
base64 image
raw EXIF GPS data
email
LINE ID
tourist name in file path
```

---

## 15. EXIF and Metadata Privacy

Photos may contain EXIF metadata such as camera model or location.

MVP should avoid using EXIF data.

Production should consider stripping EXIF metadata before storing or generating certificate.

Rules:

- Do not extract GPS EXIF data unless explicitly required and consented.
- Do not use EXIF data for hidden tracking.
- Do not display EXIF data to admin unless needed.

---

## 16. Upload Flow

Recommended flow:

```text
Tourist reaches photo upload step
    |
System already has visit context
    |
Tourist selects image
    |
Client validates basic file type and size
    |
Client shows preview
    |
Tourist confirms upload
    |
Server validates file type and size
    |
File uploads to storage
    |
Database creates visit_photos record
    |
System records photo_uploaded funnel event
    |
Flow continues to certificate preview/generation
```

---

## 17. Visit Dependency

Photo must link to a valid visit.

Required:

```text
visit_id
```

Rules:

- visit must exist.
- visit must belong to current tourist/session where applicable.
- inactive or invalid visits should not accept uploads.
- if upload happens before visit creation, use temporary upload then attach later. This is more complex and not recommended for MVP.

MVP recommendation:

```text
Create visit before photo upload.
```

---

## 18. Upload UI Requirements

## 18.1 Tourist-Facing UI

Required elements:

```text
clear instruction
upload/select photo button
camera option on mobile if possible
image preview
change photo button
file size guidance
supported file type guidance
upload progress
error message area
continue button
```

Example text:

```text
Upload a photo from this trip to create your digital travel certificate.
```

Thai:

```text
อัปโหลดรูปจากทริปนี้เพื่อสร้างใบประกาศดิจิทัลของคุณ
```

## 18.2 Mobile Requirements

- Large upload button.
- Support mobile camera/gallery chooser.
- Preview should fit screen.
- Avoid complex cropping in MVP.
- Show loading state during upload.

---

## 19. Preview Requirements

Before upload or before certificate generation, show preview.

Preview should:

- display selected image
- preserve aspect ratio
- show crop area if certificate template uses fixed ratio
- allow replace image
- not upload multiple times unnecessarily

MVP can use simple image preview without cropping.

---

## 20. Validation Rules

## 20.1 Client-Side Validation

Client should check:

```text
file exists
file type
file size
```

Client validation improves UX but is not security.

## 20.2 Server-Side Validation

Server must check:

```text
file type
file size
visit ownership/context
storage path generation
```

Never rely only on client validation.

---

## 21. Approval Status

Field:

```text
approval_status
```

Allowed values:

```text
pending
approved
rejected
```

MVP options:

Option A:

```text
default = approved
```

Simpler for demo.

Option B:

```text
default = pending
```

Safer for production moderation.

Recommended MVP:

```text
approved for certificate generation, but schema supports pending/rejected.
```

If public gallery is added later, moderation becomes required.

---

## 22. Funnel Event

After upload success, record:

```text
photo_uploaded
```

Event data should include:

```text
session_id
tourist_id if available
visit_id
attraction_id
photo_spot_id
checkin_code_id
event_time
```

Do not include file path in public analytics metadata unless needed.

---

## 23. Error Handling

## 23.1 No File Selected

Message:

```text
Please choose a photo to continue.
```

## 23.2 Invalid File Type

Message:

```text
Please upload a JPEG, PNG, or WebP image.
```

## 23.3 File Too Large

Message:

```text
This photo is too large. Please upload a smaller image.
```

## 23.4 Upload Failed

Message:

```text
We could not upload your photo. Please try again.
```

## 23.5 Visit Not Found

Message:

```text
We could not find your visit record. Please start again.
```

## 23.6 Storage Error

Show friendly error.

Do not expose bucket credentials or storage internals.

---

## 24. Security Requirements

## 24.1 File Type Security

Rules:

- Validate MIME type.
- Validate file extension if used.
- Avoid accepting SVG in MVP because it can contain scripts.
- Do not execute uploaded files.
- Store files in object storage.

## 24.2 Path Security

Rules:

- Generate server-side file path.
- Do not accept user-provided storage path.
- Do not include personal data in path.
- Use randomized filename.

## 24.3 Access Control

Rules:

- Tourist should not browse all uploaded photos.
- Admin access should be permission-controlled.
- Generated certificate sharing should use public/signed URL strategy.
- Private photos should use signed URLs if bucket is private.

## 24.4 Malware and Abuse

MVP may not implement malware scanning.

Production should consider:

- upload rate limits
- file scanning
- moderation
- suspicious file blocking

---

## 25. Privacy Requirements

Uploaded photos can be personal data.

Rules:

- Explain photo use before upload.
- Use photo only for certificate unless user consents to public display.
- Do not use photo for facial recognition.
- Do not use photo for biometric analysis.
- Do not publish uploaded photo publicly by default.
- Keep uploaded photos and generated certificate files private unless the tourist explicitly chooses to share.
- Do not expose private storage paths in certificate sharing, dashboard, or default exports.
- Retention policy must apply.

Short notice example:

```text
Your photo will be used to create your digital certificate. It will not be shown publicly unless you choose to share it.
```

Thai:

```text
รูปภาพของคุณจะใช้เพื่อสร้างใบประกาศดิจิทัลเท่านั้น และจะไม่ถูกแสดงสาธารณะหากคุณไม่ได้เลือกแชร์
```

---

## 26. Retention Requirements

Photos should not be kept forever without purpose.

Recommended MVP policy:

```text
Keep uploaded photo while needed for certificate generation and tourist access.
Review/delete after 6-12 months unless passport/certificate access requires longer.
```

Production should implement automated cleanup later.

See:

```text
docs/database/DATA_RETENTION_POLICY.md
```

---

## 27. Performance Requirements

## 27.1 Upload Performance

Requirements:

- Show upload progress or loading state.
- Avoid blocking UI without feedback.
- Compress images later if needed.
- Use thumbnails where possible.

## 27.2 Page Performance

Do not load full-size uploaded photos unnecessarily.

Use thumbnail or optimized preview when possible.

---

## 28. Database Record Example

Example `visit_photos` record:

```text
photo_id: 9001
visit_id: 501
storage_path: visit-photos/2026/05/501/abc123.webp
thumbnail_path: visit-photos/2026/05/501/thumb_abc123.webp
original_filename: IMG_20260518.jpg
mime_type: image/jpeg
file_size_bytes: 1845221
width: 1920
height: 1080
approval_status: approved
uploaded_at: 2026-05-18T14:30:00+07:00
```

---

## 29. API or Service Responsibilities

Recommended functions:

```text
validatePhotoFile(file)
generatePhotoStoragePath(visitId, file)
uploadVisitPhoto(visitId, file)
createVisitPhotoRecord(input)
getVisitPhoto(photoId)
replaceVisitPhoto(visitId, newFile)
markPhotoApprovalStatus(photoId, status)
deleteOrArchivePhoto(photoId)
```

---

## 30. Suggested Validation Schema

Conceptual validation:

```ts
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const maxFileSizeBytes = 5 * 1024 * 1024;
```

Server-side checks:

```text
file exists
file.size <= maxFileSizeBytes
allowedMimeTypes.includes(file.type)
visit exists
current user/session can upload for visit
```

---

## 31. Admin Review

MVP may not need full review UI.

Future admin review should support:

```text
photo list
thumbnail preview
visit link
tourist display name
attraction
approval status
approve button
reject button
reason for rejection
```

If photo is rejected after certificate generation, business rule must define whether certificate is invalidated.

---

## 32. Dashboard Impact

Photo upload supports funnel analytics.

Metrics:

```text
photo_uploaded_count
photo_upload_completion_rate
photo_upload_dropoff_rate
photo count by attraction
photo count by photo spot
```

Important:

Photo count is not equal to visit count.

---

## 33. Export Rules

Normal data exports should not include raw photo files.

They may include:

```text
photo_uploaded = true/false
photo_approval_status
photo_uploaded_at
```

Do not include private storage paths in general exports unless authorized.

---

## 34. Edge Cases

## 34.1 User Selects Unsupported File

Reject before upload.

## 34.2 User Uploads Very Large Image

Reject or compress later.

MVP: reject with clear message.

## 34.3 User Leaves During Upload

No visit photo record should be created unless upload completed.

Temporary files should be cleaned later.

## 34.4 Upload Succeeds but Database Insert Fails

Need cleanup strategy.

MVP can log error.

Production should delete orphan file or retry record creation.

## 34.5 Database Insert Succeeds but Certificate Fails

Keep photo record.

Allow certificate retry.

## 34.6 User Wants to Replace Photo

Allow replacement before certificate generation.

After certificate generation, replacement may require certificate regeneration.

## 34.7 Multiple Photos

MVP should use one main photo.

Future can support multiple photos.

---

## 35. Example User Stories

## 35.1 Tourist Uploads Photo

As a tourist, I want to upload my travel photo so that I can create a certificate.

Acceptance:

```text
Given I am in the certificate flow
When I choose a valid image
Then I see a preview and can upload it
```

---

## 35.2 Invalid File Is Rejected

As a tourist, I want to know when my file is not supported.

Acceptance:

```text
Given I choose a PDF file
When I try to upload
Then the system rejects it and asks for JPEG, PNG, or WebP
```

---

## 35.3 Photo Links to Visit

As a planner, I want uploaded photos to be linked to visits.

Acceptance:

```text
Given a tourist uploads a photo during a visit
When upload completes
Then visit_photos contains the visit_id
```

---

## 35.4 Upload Event Is Tracked

As a UX analyst, I want to know whether tourists drop off at photo upload.

Acceptance:

```text
Given a photo upload succeeds
Then a photo_uploaded funnel event is recorded
```

---

## 36. MVP Acceptance Checklist

```text
[ ] Photo upload UI exists.
[ ] Tourist can select photo.
[ ] Preview is shown.
[ ] JPEG is accepted.
[ ] PNG is accepted.
[ ] WebP is accepted.
[ ] Unsupported files are rejected.
[ ] Oversized files are rejected.
[ ] File uploads to storage.
[ ] visit_photos record is created.
[ ] Photo links to visit_id.
[ ] photo_uploaded event is recorded.
[ ] User sees friendly upload errors.
[ ] Storage path does not include personal data.
[ ] Photo can be used by certificate module.
```

---

## 37. Do Not Do

Do not:

```text
Store base64 image in database.
Accept all file types.
Trust frontend validation only.
Use tourist name in file path.
Expose private storage paths publicly.
Require photo to be public.
Use photo for face recognition.
Store EXIF GPS data without consent.
Let users upload files without size limit.
Let photo upload create a new tourist.
```

---

## 38. Future Enhancements

Possible future features:

```text
client-side compression
server-side resize
thumbnail generation
manual moderation dashboard
AI moderation
crop tool
rotate tool
multiple photo support
signed URL access
automatic old photo cleanup
image CDN optimization
```

---

## 39. Definition of Done

This module is done when:

```text
[ ] Upload flow works on mobile.
[ ] File validation works client and server side.
[ ] File is stored safely.
[ ] Metadata is stored in visit_photos.
[ ] Photo is linked to visit.
[ ] Certificate module can use the photo.
[ ] Privacy notice is shown.
[ ] Error handling is friendly.
[ ] Documentation and tests are updated.
```
