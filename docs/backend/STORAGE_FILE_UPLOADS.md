# STORAGE_FILE_UPLOADS.md

## 1. Document Purpose

This document defines storage and file upload standards for the **Southern Border Tourism Data & Intelligence Platform**.

The system handles several file types:

```text
tourist uploaded photos
generated certificate images
attraction images
360 media references
stamp graphics
future official data import files
export files
```

Files may contain personal or sensitive information, so storage must be designed carefully.

---

## 2. Storage Mission

The storage mission is:

```text
Store files safely, efficiently, and predictably without exposing private data or corrupting database relationships.
```

The storage system must support:

- mobile photo uploads
- certificate generation
- attraction media
- admin media management
- safe URLs
- future cleanup/retention
- privacy controls
- export file lifecycle

---

## 3. Recommended Storage Provider

For MVP:

```text
Cloudinary through the server-side storage adapter
```

Reasons:

- works with Vercel deployment without a separate file server
- low setup cost for development and demos
- supports image delivery and transformations for future optimization
- can be hidden behind a provider-neutral adapter

Supported/future options:

```text
Supabase Storage fallback
University-hosted storage future
S3-compatible storage
Cloudflare R2
Google Cloud Storage
AWS S3
```

Important:

```text
Do not call Cloudinary directly from UI components.
Do not store Cloudinary API secrets in client code.
Do not expose provider-specific storage references in public UI, dashboards, or default exports.
```

---

## 4. Core Storage Principles

## 4.1 Do Not Store Files in Database

Do not store:

```text
base64 image
binary file blob
large file content
```

inside normal database fields.

Database should store:

```text
storage_path
mime_type
file_size_bytes
metadata
created_at
```

## 4.2 Generate Storage Paths Server-Side

Do not trust client-provided storage paths.

Backend must generate all final storage paths.

## 4.3 Do Not Put Personal Data in File Paths

Do not include:

```text
tourist name
email
LINE ID
device token
phone number
passport-like identity
```

in storage paths.

## 4.4 Validate Every Upload

Validate:

```text
file exists
MIME type
file size
extension if used
authorization
related record ownership
```

## 4.5 Decide Public vs Private Intentionally

Not all files should be public.

Public by default is easy but risky.

Use private or signed URLs where personal data exists.

---

## 5. Recommended Buckets

Recommended logical buckets/folders:

```text
attraction-media
visit-photos
certificate-files
stamp-assets
official-imports
export-files
temp-uploads
```

MVP required:

```text
attraction-media
visit-photos
certificate-files
stamp-assets
```

Future:

```text
official-imports
export-files
temp-uploads
```

---

## 6. Bucket Access Strategy

When using Cloudinary, these are logical buckets/folders managed by the storage adapter.

When using Supabase Storage fallback, these may be real Supabase buckets.

## 6.1 attraction-media

Content:

```text
attraction cover images
gallery images
sample photo spot images
360 thumbnails
```

Recommended access:

```text
public read
admin write
```

Reason:

Attraction images are public content.

## 6.2 visit-photos

Content:

```text
tourist uploaded photos
```

Recommended access:

```text
private bucket
signed URL access
admin restricted access
```

Reason:

Uploaded tourist photos may identify people.

## 6.3 certificate-files

Content:

```text
generated certificate images
```

Recommended access:

```text
private or controlled public depending on sharing policy
```

MVP options:

Option A:

```text
private with signed URL
```

More privacy-safe.

Option B:

```text
public but unguessable paths
```

Simpler but less private.

Recommendation:

```text
Use private/signed URLs if possible.
```

## 6.4 stamp-assets

Content:

```text
stamp images/icons
```

Recommended access:

```text
public read
admin write
```

## 6.5 official-imports

Content:

```text
uploaded official CSV/Excel files
```

Recommended access:

```text
private
admin restricted
short or controlled retention
```

## 6.6 export-files

Content:

```text
generated CSV/Excel/PDF exports
```

Recommended access:

```text
private
signed URL
short expiration
```

## 6.7 temp-uploads

Content:

```text
temporary files
intermediate generated files
```

Recommended access:

```text
private
automatic cleanup
```

---

## 7. File Path Strategy

## 7.1 Tourist Uploaded Photos

Recommended:

```text
visit-photos/{year}/{month}/{visit_id}/{random_id}.{extension}
```

Example:

```text
visit-photos/2026/05/501/8f9d2a7c.webp
```

Rules:

- include visit_id for organization
- use random_id for filename
- do not use tourist name
- do not use original filename as final filename

## 7.2 Generated Certificates

Recommended:

```text
certificates/{year}/{month}/{visit_id}/{certificate_id-or-random_id}.png
```

Example:

```text
certificates/2026/05/501/cert_9001.png
```

## 7.3 Attraction Media

Recommended:

```text
attractions/{attraction_id}/images/{random_id}.{extension}
```

Example:

```text
attractions/25/images/cover_abc123.webp
```

## 7.4 Stamp Assets

Recommended:

```text
stamps/{attraction_id}/{stamp_definition_id}.{extension}
```

Example:

```text
stamps/25/101.webp
```

## 7.5 Export Files

Recommended:

```text
exports/{year}/{month}/{export_id}.{extension}
```

Example:

```text
exports/2026/05/export_7001.csv
```

---

## 8. Filename Rules

Generated filenames should use:

```text
random UUID
secure random string
database ID + random suffix
```

Allowed final extensions:

```text
.jpg
.jpeg
.png
.webp
.csv
.pdf future
.xlsx future
```

Do not rely on original filename.

Store original filename only as metadata if useful.

---

## 9. Tourist Photo Upload Requirements

## 9.1 Allowed MIME Types

```text
image/jpeg
image/png
image/webp
```

Do not allow SVG in MVP.

Reason:

SVG can contain scripts and is not needed for tourist uploads.

## 9.2 Maximum Size

Recommended:

```text
5 MB
```

Possible upper limit:

```text
10 MB
```

MVP:

```text
5 MB
```

## 9.3 Validation

Client-side:

```text
file exists
size limit
MIME type
preview
```

Server-side:

```text
file exists
MIME type
size limit
visit access
safe path generation
storage upload
metadata insert
```

Server-side validation is mandatory.

## 9.4 Metadata

Store in:

```text
visit_photos
```

Fields:

```text
visit_id
storage_path
thumbnail_path optional
original_filename optional
mime_type
file_size_bytes
width optional
height optional
approval_status
uploaded_at
```

---

## 10. Tourist Photo Privacy

Tourist photos can contain faces, location, and personal information.

Rules:

- use photo only for certificate unless user chooses sharing.
- do not publish photo publicly by default.
- do not use facial recognition.
- do not extract EXIF GPS without consent.
- show photo usage notice.
- apply retention policy.

Photo usage notice:

```text
Your photo will be used to create your digital certificate. It will not be shown publicly unless you choose to share it.
```

Thai:

```text
รูปภาพของคุณจะใช้เพื่อสร้างใบประกาศดิจิทัลเท่านั้น และจะไม่ถูกแสดงสาธารณะหากคุณไม่ได้เลือกแชร์
```

---

## 11. EXIF Metadata Strategy

Photos may contain EXIF metadata.

MVP:

```text
do not read EXIF metadata
do not use EXIF GPS
```

Production recommendation:

```text
strip EXIF before storing or before certificate rendering
```

Never use EXIF for hidden tracking.

---

## 12. Image Processing Strategy

> **Status: Partially Implemented, Splits by Upload Path**

### 12.1 Tourist Upload Path — Implemented (sharp)

| Step | Status | Detail |
|---|---|---|
| Resize (max 1920px) | ✅ Implemented | `app/actions/photo-actions.ts` line 81 (`sharp(…).resize(1920)`) |
| WebP conversion | ✅ Implemented | `photo-actions.ts` line 82 (`.webp({ quality: 80 })`) |
| Tourist story image upload | ✅ Hardened | `app/api/upload/route.ts` requires a signed-in tourist identity, rate-limits requests, validates JPG/PNG/WebP + max size, strips metadata via WebP conversion, and stores a 1200px public story image under `/site-media/...` |
| EXIF stripping | ✅ Implicit | sharp strips EXIF by default when converting to WebP |
| `sharp` in dependencies | ✅ Confirmed | `package.json`: `"sharp": "^0.34.5"` |
| Metadata stored | ✅ Implemented | `handlePhotoUploadMetadata()` in `lib/services/photo-upload.service.ts` |
| Signed URL for private view | ✅ Implemented | `photo-actions.ts` line 95 — 1-hour signed URL |

### 12.2 Admin Media Upload Path — Raw File Storage Only (No Processing)

| Step | Status | Detail |
|---|---|---|
| File validation (MIME, size) | ✅ Implemented | `app/api/admin/media/upload/route.ts` lines 40–56 |
| Path generation | ✅ Implemented | Route handler constructs `content-media/{type}/{year}/{month}/{id}/{uuid}.{ext}` |
| Upload to storage | ✅ Implemented | Raw `buffer` uploaded via `uploadPrivateFile` — no transform |
| sharp / WebP conversion | ❌ Not implemented | Admin upload stores original file format as-is. No resize, no format conversion. |
| Thumbnail generation | ❌ Not implemented | No thumbnail variant created for admin uploads |
| Width/height extraction | ❌ Not implemented | `content_media` metadata does not store dimensions |
| Responsive variants | ❌ Not implemented | See §12.3 below |

### 12.3 Planned: Admin Media Optimization (Migration Pending)

> **Status: Planned — not yet scheduled**

The following processing will be added to the admin upload path in a future migration:

```text
- resize large images (max ~2000px)
- convert to WebP (unify format for all admin media)
- generate thumbnail variant (150x150 or similar for admin lists / pickers)
- extract EXIF and strip GPS before storing
- store width/height in content_media metadata
```

No other variants (card, hero, gallery, og) are planned yet — see §39 Future Enhancements.

### 12.4 Production (Future)

Add:

```text
server-side image pipeline          future
background jobs                      future
CDN optimization                     future
malware scanning if available        future
moderation support                   future
```

---

## 13. Certificate File Requirements

## 13.1 Output Format

MVP:

```text
PNG
1080 x 1350 px
```

Optional future:

```text
PDF
JPEG
WebP
```

## 13.2 Storage Metadata

Store in:

```text
certificates
```

Fields:

```text
visit_id
template_id
photo_id
certificate_path
generated_at
download_count
language
metadata_json optional
```

## 13.3 Certificate Privacy

Certificate includes:

```text
display name
photo
attraction
visit date
```

This may be identifying.

Rules:

- do not publish by default.
- use signed URL or controlled sharing if possible.
- public share must be user-initiated.
- do not include email or LINE ID.

---

## 14. Attraction Media Upload Requirements

> **Status: Implemented (raw upload only); Optimization planned**

Admin-uploaded attraction images can be public.

Allowed MIME types:

```text
image/jpeg
image/png
image/webp
```

Size limit (enforced):

```text
10 MB
```

Admin image metadata:

```text
attraction_id
storage_path
alt_text_th
alt_text_en
caption_th
caption_en
display_order
is_cover
is_active
```

Rules (current implementation):

- ✅ validate file type and size — `app/api/admin/media/upload/route.ts` lines 40–56
- ✅ allow cover selection — `is_cover` field in `content_media` table
- ✅ provide alt text — required before publishing (readiness check in `MediaManager.tsx`)
- ✅ use generated thumbnails when available — attraction cards resolve `media_assets.thumbnail_storage_path` by matching the selected `content_media.storage_path`.
- ⚠️ fallback can still use the original image — `content_media` intentionally does not store thumbnail paths; rows without a `media_assets` thumbnail fall back to the original media path until every legacy asset has a generated thumbnail.

---

## 15. 360 Media Strategy

360 media may be:

```text
external embed URL
uploaded panoramic image
third-party virtual tour link
```

MVP:

```text
store media URL/reference only
```

Validation:

- URL must be safe
- media type controlled
- inactive media hidden publicly

Avoid embedding unsafe scripts.

---

## 16. Stamp Asset Requirements

Stamp images should be public assets.

Allowed types:

```text
image/png
image/webp
image/svg+xml optional only if trusted admin-created asset
```

MVP recommendation:

```text
png or webp
```

Rules:

- tourist upload must not allow SVG
- admin stamp assets may allow SVG only if sanitized/trusted
- stamp asset should be optimized

---

## 17. Official Import File Requirements

Future feature.

Allowed MVP future:

```text
csv
```

Potential future:

```text
xlsx
json
```

Rules:

- private bucket
- validate file type
- validate size
- parse server-side
- do not execute macros
- log import
- delete/expire uploaded import files if not needed

---

## 18. Export File Requirements

Exports may contain sensitive data.

Recommended:

- generate server-side
- private bucket if stored
- signed URL with expiration
- short retention
- audit log
- never public bucket by default

Export path:

```text
exports/{year}/{month}/{export_id}.csv
```

Retention:

```text
24 hours to 7 days
```

MVP can stream directly without storing file.

---

## 19. Signed URL Strategy

Use signed URLs for:

```text
visit photos
certificate files if private
export files
official import files
```

Signed URL expiration examples:

```text
certificate view: 1 hour to 24 hours
export download: 15 minutes to 24 hours
photo admin preview: short-lived
```

Do not store signed URLs permanently in database.

Store only storage path.

Cloudinary note:

```text
Cloudinary credentials are server-only.
Tourist photos and certificates should use authenticated or otherwise controlled delivery where available.
If a development environment uses public/upload delivery, treat it as a development limitation and do not expose those URLs through dashboards or default exports.
```

---

## 20. Public URL Strategy

Use public URLs for:

```text
attraction media
stamp assets
public static images
```

Only if the file is meant to be public.

Do not use public URLs for tourist uploaded photos by default.

---

## 21. Storage Metadata Database Rules

Database records should store:

```text
storage_path
bucket_name optional
mime_type
file_size_bytes
created_at
created_by optional
```

Do not store:

```text
service role key
signed URL as permanent value
raw file content
base64 content
```

---

## 22. File Upload Flow

Generic upload flow:

```text
User selects file
    |
Client validates basic type/size
    |
Client shows preview
    |
User confirms
    |
Server validates auth/session
    |
Server validates file type/size
    |
Server generates storage path
    |
Server uploads to storage
    |
Server creates database metadata record
    |
Server returns safe result
```

---

## 23. Failure Handling

## 23.1 Storage Upload Fails

Return:

```text
We could not upload the file. Please try again.
```

No database record should be created.

## 23.2 Database Insert Fails After Upload

Options:

```text
delete uploaded file immediately
mark orphan cleanup needed
retry metadata insert
```

MVP recommendation:

- attempt cleanup
- log error
- return friendly failure

## 23.3 Database Insert Succeeds but Later Processing Fails

Keep original upload record.

Allow retry next step.

Example:

```text
photo upload succeeds
certificate generation fails
photo remains available for retry
```

---

## 24. Orphan File Cleanup

Orphan files can happen when:

```text
upload succeeds but DB insert fails
temp file not attached
certificate generation interrupted
admin upload cancelled
```

Production should have cleanup job.

MVP can log and manually clean if needed.

Future cleanup policy:

```text
delete temp uploads older than 24 hours
delete orphan files older than 7 days
```

---

## 25. Access Control Checks

Before file operations, verify:

## 25.1 Tourist Photo Upload

Check:

```text
visit exists
visit belongs to current tourist/session
visit is in state that allows photo upload
```

## 25.2 Certificate Generation

Check:

```text
visit belongs to current tourist/session
photo belongs to visit
template is active
```

## 25.3 Admin Media Upload

Check:

```text
admin authenticated
permission media.upload or attraction.update
attraction exists
```

## 25.4 Export Download

Check:

```text
admin authenticated
export permission
export belongs to actor or user has elevated permission
signed URL not expired
```

---

## 26. RLS and Storage Policies

If using Supabase Storage with RLS:

## 26.1 attraction-media

Policy:

```text
public read active media
admin write
```

## 26.2 visit-photos

Policy:

```text
no public list
server-side upload preferred
signed read only
admin restricted read
```

## 26.3 certificate-files

Policy:

```text
server-side write
signed read or intentional public share
```

## 26.4 export-files

Policy:

```text
server-side write
signed read for authorized admin
short retention
```

MVP can use server-side service role for controlled uploads but must never expose service role to browser.

---

## 27. File Size Limits

Recommended limits:

```text
tourist photo: 5 MB
admin attraction image: 10 MB
stamp asset: 2 MB
certificate generated image: 5 MB
official CSV import: 10 MB
export file: generated server-side with row limits
```

Adjust as needed.

---

## 28. MIME Type and Extension Mapping

Allowed mapping:

```text
image/jpeg -> .jpg
image/png -> .png
image/webp -> .webp
text/csv -> .csv
application/pdf -> .pdf future
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet -> .xlsx future
```

Do not trust extension alone.

Use MIME type and server-side checks.

---

## 29. Upload Error Codes

Recommended:

```text
FILE_REQUIRED
FILE_INVALID_TYPE
FILE_TOO_LARGE
FILE_UPLOAD_FAILED
FILE_METADATA_SAVE_FAILED
FILE_ACCESS_DENIED
FILE_NOT_FOUND
SIGNED_URL_FAILED
STORAGE_BUCKET_NOT_CONFIGURED
```

Domain-specific:

```text
PHOTO_REQUIRED
PHOTO_INVALID_TYPE
PHOTO_TOO_LARGE
CERTIFICATE_UPLOAD_FAILED
ATTRACTION_IMAGE_UPLOAD_FAILED
EXPORT_FILE_GENERATION_FAILED
```

---

## 30. User-Facing Upload Messages

## 30.1 Tourist Photo

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

## 30.2 Admin Media

```text
Could not upload image. Please check the file type and size.
```

## 30.3 Export

```text
Could not generate export. Please try again.
```

---

## 31. Security Requirements

Do:

```text
validate MIME type
validate size
generate server-side path
use random filenames
restrict private buckets
use signed URLs
check permissions
scan/inspect file in production if possible
```

Do not:

```text
allow all file types
allow SVG tourist uploads
store base64 in database
trust file extension only
use personal data in path
make all buckets public
expose service role key
store signed URLs forever
```

---

## 32. Privacy Requirements

For tourist files:

- ask/notify purpose of photo use.
- do not publish by default.
- do not use for face recognition.
- do not extract location without consent.
- allow future deletion/anonymization workflow.
- apply retention policy.

For exports:

- short retention.
- permission-controlled download.
- no public links.

---

## 33. Performance Requirements

## 33.1 Upload Performance

- show upload progress/loading.
- reject large files before upload when possible.
- keep mobile UX responsive.
- compress/resize later if needed.

## 33.2 Public Image Performance

- use optimized sizes.
- lazy load gallery.
- do not load full-resolution image in cards.
- use thumbnails.

## 33.3 Certificate Performance

- ensure image/font loaded before export.
- show generation loading.
- avoid huge canvas sizes beyond need.

---

## 34. Retention Policy

Storage retention should follow:

```text
docs/database/DATA_RETENTION_POLICY.md
```

Recommended:

```text
visit photos: review/delete after 6-12 months unless needed
certificate files: keep while passport/certificate access is active
export files: 24 hours to 7 days
temp uploads: 24 hours
official import files: keep only if needed for traceability
```

---

## 35. Monitoring and Audit

Log important storage actions:

```text
tourist photo upload failed
certificate upload failed
admin media upload
export generated
official import uploaded
file delete/archive
```

Audit admin actions:

```text
image upload
image deactivate
export generated
official import uploaded
```

Do not log raw file content.

---

## 36. Testing Checklist

Test:

```text
valid JPEG upload
valid PNG upload
valid WebP upload
invalid PDF upload for photo
SVG rejected for tourist upload
file over size limit
upload without visit
upload for another tourist's visit
storage upload failure
DB insert failure after upload
certificate file upload
signed URL generation
attraction image public URL
private visit photo not publicly listable
export file expiration future
```

---

## 37. MVP Acceptance Checklist

```text
[ ] Storage buckets are defined.
[ ] Tourist photo upload validates MIME type.
[ ] Tourist photo upload validates size.
[ ] Tourist photo path is generated server-side.
[ ] Tourist photo path contains no personal data.
[ ] visit_photos metadata is saved.
[ ] Certificate files are stored separately.
[ ] certificates metadata is saved.
[ ] Attraction media upload is supported or planned.
[ ] Stamp assets are supported or planned.
[ ] Private/public bucket strategy is documented.
[ ] Upload errors are user-friendly.
[ ] Service role key is never exposed.
[ ] Base64 is not stored in database.
```

---

## 38. Do Not Do

Do not:

```text
Store base64 files in database.
Use tourist name in file path.
Use original filename as final filename.
Allow all file types.
Allow tourist SVG upload.
Expose private bucket paths publicly.
Store signed URLs permanently.
Make visit photos public by default.
Skip server-side file validation.
Ignore orphan files forever.
```

---

## 39. Future Enhancements

Possible future improvements:

```text
image compression
server-side resizing
thumbnail generation
EXIF stripping
malware scanning
moderation queue
CDN optimization
background cleanup job
signed URL manager
file retention automation
public share link controls
```

---

## 40. Final Storage Rule

Files are part of the data model.

A file without metadata, ownership, access control, and retention strategy is not production-ready.
