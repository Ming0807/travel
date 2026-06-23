# IMAGE_UPLOAD_SECURITY.md

## 1. Document Purpose

This document defines image upload security requirements for the **Southern Border Tourism Data & Intelligence Platform**.

The platform allows image handling for:

```text
tourist uploaded photos
generated certificate images
attraction media
stamp assets
360 media thumbnails/references
admin media uploads
```

Image uploads are high-risk because files can contain personal data, malicious content, large payloads, metadata, or unexpected formats.

This document focuses on secure handling of images from upload to storage, preview, certificate generation, admin review, and deletion.

---

## 2. Image Upload Security Mission

The mission is:

```text
Allow tourists and admins to upload useful images safely without exposing personal data, breaking the system, or creating security risks.
```

The system must protect:

```text
tourist privacy
storage buckets
certificate flow
admin dashboard
public website
database integrity
server performance
browser safety
```

---

## 3. Image Types in the System

## 3.1 Tourist Visit Photos

Used for:

```text
certificate generation
tourist memory card
digital travel souvenir
```

Privacy level:

```text
high
```

Reason:

```text
may contain face, people, location, EXIF metadata, and personal context
```

## 3.2 Generated Certificate Images

Used for:

```text
download/share by tourist
passport/certificate history
```

Privacy level:

```text
high
```

Reason:

```text
contains tourist display name and photo
```

## 3.3 Attraction Images

Used for:

```text
public attraction pages
admin CMS
public tourism content
```

Privacy level:

```text
public after approval/publishing
```

## 3.4 Stamp Assets

Used for:

```text
digital passport stamps
achievement visuals
```

Privacy level:

```text
public asset
```

## 3.5 360 Media Thumbnails / References

Used for:

```text
public attraction media
virtual tour entry points
```

Privacy level:

```text
public if published
```

---

## 4. Related Documents

This document aligns with:

```text
docs/backend/STORAGE_FILE_UPLOADS.md
docs/security/SECURITY_REQUIREMENTS.md
docs/security/PDPA_PRIVACY_DESIGN.md
docs/security/DATA_ANONYMIZATION.md
docs/backend/CERTIFICATE_RENDERING_FLOW.md
docs/modules/MODULE_05_PHOTO_UPLOAD.md
docs/modules/MODULE_06_CERTIFICATE_GENERATION.md
```

---

## 5. Core Security Principles

## 5.1 Validate on Server

Client-side validation is helpful but not trusted.

Every upload must be validated server-side.

## 5.2 Restrict File Types

Allow only required image formats.

For tourist uploads:

```text
image/jpeg
image/png
image/webp
```

Do not allow SVG for tourist uploads.

## 5.3 Limit File Size

Recommended tourist photo max:

```text
5 MB
```

Admin attraction image max:

```text
10 MB
```

Stamp asset max:

```text
2 MB
```

## 5.4 Generate File Paths Server-Side

Do not trust client file names or storage paths.

## 5.5 Keep Private Images Private

Tourist photos and certificates should not be public by default.

For MVP development and Vercel deployment, Cloudinary is used through the server-side storage adapter. Cloudinary credentials must remain server-only, and tourist photo/certificate delivery should use authenticated or otherwise controlled URLs where available.

## 5.6 Do Not Store Base64 in Database

Store files in object storage.

Store only metadata in database.

---

## 6. Allowed Image Types

## 6.1 Tourist Photo Uploads

Allowed:

```text
image/jpeg
image/png
image/webp
```

Disallowed:

```text
image/svg+xml
image/gif
application/pdf
text/html
application/javascript
application/octet-stream
```

Reason:

- JPEG/PNG/WebP are sufficient for photos.
- SVG can contain scripts and is not needed for tourist photo uploads.
- GIF can be large and animated.
- PDF/HTML/JS are not images for this workflow.

---

## 6.2 Admin Attraction Images

Allowed:

```text
image/jpeg
image/png
image/webp
```

Optional future:

```text
image/svg+xml only for trusted admin-created icons/assets after review
```

Recommendation:

```text
Do not allow SVG in MVP.
```

---

## 6.3 Stamp Assets

Allowed MVP:

```text
image/png
image/webp
```

Optional future:

```text
image/svg+xml
```

Only if:

```text
trusted source
sanitized
admin-only
not user-uploaded by tourists
```

---

## 7. File Size Limits

Recommended limits:

| File Type | Max Size |
|---|---:|
| Tourist photo | 5 MB |
| Generated certificate image | 5 MB |
| Admin attraction image | 10 MB |
| Stamp asset | 2 MB |
| 360 thumbnail | 10 MB |
| Temporary upload | 10 MB |

Backend must reject files above limit.

Error code:

```text
FILE_TOO_LARGE
PHOTO_TOO_LARGE
```

---

## 8. Image Dimension Limits

File size alone is not enough.

A small compressed file can decompress into huge memory usage.

Recommended dimension limits:

```text
tourist photo max width: 6000 px
tourist photo max height: 6000 px
certificate output: 1080 x 1350 px recommended
attraction image max width: 8000 px
attraction image max height: 8000 px
```

MVP may skip dimension validation if image processing is not implemented, but production should add it.

---

## 9. MIME Type Validation

Validate using:

```text
server-received MIME type
file signature/magic bytes where possible
extension mapping
```

Do not trust extension alone.

Bad:

```text
accept file because filename ends with .jpg
```

Better:

```text
check MIME type and magic bytes
```

---

## 10. File Extension Rules

Allowed extensions:

```text
.jpg
.jpeg
.png
.webp
```

Rules:

- normalize extension based on detected MIME type.
- do not use original extension blindly.
- generate final filename server-side.

Example mapping:

```text
image/jpeg -> .jpg
image/png -> .png
image/webp -> .webp
```

---

## 11. File Name Rules

Never use original filename as final storage filename.

Do not include:

```text
tourist name
email
LINE ID
guest token
phone number
original filename
full timestamp with personal context
```

Use:

```text
uuid
secure random string
database id + random suffix
```

Example:

```text
visit-photos/2026/05/501/8f9d2a7c4b2f.webp
```

---

## 12. Storage Path Rules

## 12.1 Tourist Photos

Recommended:

```text
visit-photos/{year}/{month}/{visit_id}/{random_id}.{extension}
```

## 12.2 Certificates

Recommended:

```text
certificates/{year}/{month}/{visit_id}/{certificate_id_or_random_id}.png
```

## 12.3 Attraction Images

Recommended:

```text
attractions/{attraction_id}/images/{random_id}.{extension}
```

## 12.4 Stamp Assets

Recommended:

```text
stamps/{attraction_id}/{stamp_definition_id}.{extension}
```

---

## 13. Bucket Security

Cloudinary note:

```text
Cloudinary folders/tags act as logical buckets for MVP deployment.
Supabase bucket policies protect only Supabase Storage fallback environments.
When using Cloudinary, the privacy boundary is server-side upload/signing, authenticated or controlled delivery, and application ownership checks.
```

## 13.1 visit-photos

Recommended:

```text
private bucket
signed URL read
server-side upload
no public listing
```

## 13.2 certificate-files

Recommended:

```text
private bucket
signed URL or controlled share link
server-side upload
```

## 13.3 attraction-media

Recommended:

```text
public read
admin write
```

## 13.4 stamp-assets

Recommended:

```text
public read
admin write
```

## 13.5 temp-uploads

Recommended:

```text
private
automatic cleanup
```

---

## 14. EXIF Metadata Security

Photos may contain EXIF metadata, including:

```text
camera model
timestamp
GPS location
device information
orientation
software
```

MVP:

```text
do not read or use EXIF
```

Production recommendation:

```text
strip EXIF metadata before storage or before public/certificate output
```

Rules:

- do not use EXIF GPS for hidden tracking.
- do not show EXIF to admins by default.
- do not export EXIF.
- do not store EXIF metadata unless required and consented.

---

## 15. Image Processing Security

Future image processing may include:

```text
resize
compress
convert to WebP
generate thumbnails
strip EXIF
rotate based on orientation
moderation
```

Rules:

- use trusted image libraries.
- handle malformed image files safely.
- set processing timeouts.
- limit dimensions.
- avoid processing untrusted SVG.
- catch decoding errors.

---

## 16. Malware and Content Scanning

MVP may not include malware scanning.

Production options:

```text
cloud provider scanning
third-party scanning API
ClamAV worker
manual moderation queue
```

At minimum:

```text
restrict MIME types
restrict size
reject SVG tourist uploads
do not execute uploaded content
serve images with correct content type
```

---

## 17. Content Moderation

Tourist photos may contain inappropriate content.

MVP:

```text
not required unless public gallery exists
```

Reason:

```text
photo is used for personal certificate, not public display
```

Production if public sharing/gallery is added:

```text
moderation queue
report abuse
admin review
automated moderation optional
```

---

## 18. Tourist Upload Flow Security

Recommended flow:

```text
Tourist selects photo
    |
Client checks size/type for UX
    |
Client shows preview
    |
Server validates visit ownership/session
    |
Server validates file type/size
    |
Server generates storage path
    |
Server uploads file
    |
Server creates visit_photos metadata
    |
Server updates visit status
    |
Server returns safe preview URL
```

Server validation is mandatory.

---

## 19. Ownership Verification

Before tourist photo upload, backend must verify:

```text
visit exists
visit belongs to current tourist/session
visit is allowed to receive photo
photo_spot/attraction context is valid
```

Do not trust:

```text
visit_id from client without verification
tourist_id from localStorage
photo_spot_id from hidden input
```

---

## 20. Admin Image Upload Security

Before admin upload, backend must verify:

```text
admin authenticated
admin active
permission media.upload or attraction.update
related attraction exists
file type allowed
file size allowed
decoded image format allowed
pixel count within limit
server-generated storage path
WebP conversion before storage
```

Admin upload should still validate strictly.

Admins can make mistakes or accounts can be compromised.

Current admin image upload implementation:

```text
shared helper: lib/services/admin-image-processing.service.ts
allowed input: JPEG, PNG, WebP
disallowed decoded formats: SVG, GIF, PDF, HTML, JavaScript
max size: 10 MB
max decoded pixels: 64 megapixels
content media output: WebP, max 1920px, quality 80
media library thumbnail: WebP, max 400px, quality 70
certificate template output: WebP, max 2400px, quality 90
```

Sharp conversion strips metadata by default because the pipeline does not call `withMetadata()`.

---

## 21. Generated Certificate Upload Security

If frontend renders certificate image and uploads it:

Validate:

```text
visit ownership
certificate already exists/idempotency
file type image/png preferred
file size
template id active
photo belongs to visit
```

Do not trust:

```text
client generated path
client claims that image is valid certificate
client template id without verification
```

Backend stores final file and database record.

---

## 22. Preview URL Security

For private images:

```text
generate signed URL
short expiration
```

Do not store signed URL permanently in database.

Store:

```text
storage_path
```

only.

---

## 23. Public Image Response Headers

For public images, ensure storage/provider serves safe content headers.

Important headers:

```text
Content-Type: image/jpeg/png/webp
Content-Disposition: inline
```

Avoid serving user uploads as:

```text
text/html
application/javascript
```

---

## 24. SVG Risk

SVG can contain:

```text
script
external references
embedded HTML
malicious payloads
```

Tourist uploads must not allow SVG.

Admin SVG may be considered only for trusted assets and after sanitization.

MVP:

```text
No SVG uploads.
```

---

## 25. Denial-of-Service Risks

Image uploads can cause resource abuse through:

```text
large files
many repeated uploads
huge dimensions
malformed images
many certificate generation requests
storage spam
```

Mitigations:

```text
file size limits
dimension limits future
rate limiting future
auth/session checks
idempotency checks
storage quotas future
cleanup jobs
```

---

## 26. Rate Limiting

Production should rate limit:

```text
photo upload per session
certificate generation per visit
admin upload per user
funnel event creation
```

MVP minimum:

```text
disable duplicate submit
idempotency checks
file size limits
unique certificate per visit
```

---

## 27. Duplicate Upload Handling

Tourist may upload photo multiple times.

MVP policy options:

Option A:

```text
allow replace before certificate generation
```

Option B:

```text
store multiple but mark latest active
```

Recommended MVP:

```text
allow replace before certificate generation; keep only active photo metadata
```

Need cleanup old unused files.

---

## 28. Orphan File Cleanup

Orphan files may occur when:

```text
storage upload succeeds but DB insert fails
user cancels before submit
certificate generation fails after upload
admin upload cancelled
```

Production should run cleanup job.

See:

```text
docs/backend/BACKGROUND_JOBS.md
```

MVP:

```text
log and manually clean if needed
```

---

## 29. Error Handling

Recommended errors:

```text
PHOTO_REQUIRED
PHOTO_INVALID_TYPE
PHOTO_TOO_LARGE
PHOTO_DIMENSIONS_TOO_LARGE
PHOTO_UPLOAD_FAILED
PHOTO_METADATA_SAVE_FAILED
PHOTO_ACCESS_DENIED
CERTIFICATE_FILE_INVALID
ATTRACTION_IMAGE_UPLOAD_FAILED
STORAGE_BUCKET_NOT_CONFIGURED
```

User-friendly messages:

```text
Please choose a photo to continue.
Please upload a JPEG, PNG, or WebP image.
This photo is too large. Please upload a smaller image.
We could not upload your photo. Please try again.
```

Thai:

```text
กรุณาเลือกรูปภาพเพื่อไปต่อ
กรุณาอัปโหลดไฟล์ JPEG, PNG หรือ WebP
รูปภาพนี้มีขนาดใหญ่เกินไป กรุณาอัปโหลดรูปที่เล็กลง
ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่
```

---

## 30. Logging Rules

Log:

```text
upload failure
invalid file type attempt
file too large
storage error
metadata save failure
certificate upload failure
cleanup failure
```

Do not log:

```text
raw file content
base64 image
signed URL
service role key
guest token
LINE token
provider_user_id
```

---

## 31. Audit Rules

Audit admin media actions:

```text
media.upload
media.update
media.deactivate
media.delete
```

Audit cleanup/deletion actions:

```text
storage.file_delete
storage.cleanup
certificate.delete_file
tourist.photo_delete
```

Normal tourist photo upload does not need audit log unless policy requires; operational database record is enough.

---

## 32. Privacy Notice for Photo Upload

Show before upload:

English:

```text
Your photo will be used to create your digital certificate. It will not be shown publicly unless you choose to share it.
```

Thai:

```text
รูปภาพของคุณจะใช้เพื่อสร้างใบประกาศดิจิทัล และจะไม่ถูกแสดงสาธารณะหากคุณไม่ได้เลือกแชร์
```

---

## 33. Image Deletion and Anonymization

For privacy deletion/anonymization:

```text
delete tourist photo file
delete or revoke certificate file
set storage_path null or mark deleted
audit deletion
preserve aggregate analytics where allowed
```

See:

```text
docs/security/DATA_ANONYMIZATION.md
```

---

## 34. Browser Compatibility

Tourist upload must work on:

```text
mobile Chrome
mobile Safari
LINE in-app browser if used
desktop browsers
```

Potential issues:

```text
HEIC images from iPhone
camera permission
large file uploads
slow mobile network
LINE browser download/upload behavior
```

MVP allowed formats may not include HEIC. If many iPhone users fail, add client-side conversion or clearer message.

---

## 35. HEIC/HEIF Strategy

iPhone may produce HEIC/HEIF images.

MVP options:

```text
show friendly unsupported message
ask user to choose JPEG/PNG/WebP
```

Future:

```text
client-side or server-side HEIC conversion
```

Do not silently accept unknown file types.

---

## 36. Accessibility and UX Security

Upload UI should:

```text
show accepted formats
show max size
show upload progress
show clear error messages
allow re-upload
avoid trapping user
```

Poor UX can cause repeated uploads and support issues.

---

## 37. Testing Checklist

Test:

```text
valid JPEG upload
valid PNG upload
valid WebP upload
PDF rejected
SVG rejected
HTML file renamed .jpg rejected
large file rejected
missing file rejected
wrong visit ownership rejected
duplicate upload behavior
storage failure handling
DB insert failure after upload
signed URL generation
private bucket not publicly accessible
certificate generated PNG upload
admin attraction image upload
photo deletion/anonymization
```

---

## 38. MVP Acceptance Checklist

```text
[ ] Tourist upload accepts only JPEG/PNG/WebP.
[ ] Tourist upload rejects SVG.
[ ] Tourist upload has max size limit.
[ ] Server validates file type.
[ ] Server validates file size.
[ ] Server verifies visit ownership.
[ ] Storage path is server-generated.
[ ] Storage path contains no personal data.
[ ] Tourist photos are private or controlled.
[ ] Certificate files are private or controlled.
[ ] Photo metadata is stored in database.
[ ] Upload errors are user-friendly.
[ ] Signed URLs are not stored permanently.
[ ] Service role key is not exposed.
```

---

## 39. Do Not Do

Do not:

```text
Allow all file types.
Allow tourist SVG upload.
Trust file extension only.
Trust frontend validation only.
Use original filename as storage filename.
Put tourist name/email/LINE ID in file path.
Store image base64 in database.
Make tourist photos public by default.
Store signed URLs permanently.
Expose service role key.
Log raw image data.
Ignore orphan files forever.
```

---

## 40. Future Enhancements

Possible future improvements:

```text
EXIF stripping
image resizing
WebP conversion
thumbnail generation
HEIC conversion
malware scanning
content moderation
upload rate limiting
storage quota monitoring
admin media review queue
public share moderation
```

---

## 41. Final Image Upload Security Rule

Image uploads are not just UI features.

They are privacy-sensitive file operations and must be validated, access-controlled, stored safely, and cleaned up responsibly.
