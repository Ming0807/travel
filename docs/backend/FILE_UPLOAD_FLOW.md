# FILE_UPLOAD_FLOW.md

## 1. Purpose

This document defines the current MVP upload flow for tourist photos and generated certificate files.

The storage provider for development and Vercel deployment is Cloudinary through a server-only storage adapter. Supabase Storage remains a fallback/legacy provider, and university-hosted storage is planned as a future adapter.

---

## 2. Tourist Photo Upload Flow

```text
PhotoUploadForm
    -> POST /api/upload/photo
    -> Zod/common visit id validation
    -> server-side MIME/size validation
    -> tourist visit ownership guard
    -> server-side image decode + WebP conversion
    -> uploadPrivateFile(logical bucket: visit-photos)
    -> visit_photos metadata insert
    -> visit status update + photo_uploaded funnel event
    -> short-lived preview URL
```

Rules:

- Guest flow must work.
- LINE/Google/email/phone must not be required.
- The client must not provide a storage path.
- The original filename must not be used as the final object key.
- User-provided filenames are not stored for tourist photos; metadata uses a generic privacy-safe filename.
- Tourist photo URLs/storage references must not appear in dashboards or default exports.
- Private photo preview routes must derive signed URLs from a photo row that belongs to the current tourist visit.

---

## 3. Certificate File Flow

```text
CertificatePreview
    -> generated PNG base64
    -> POST /api/certificate/generate
    -> visit ownership guard
    -> photo ownership check
    -> idempotency check by visit
    -> uploadPrivateFile(logical bucket: certificate-files)
    -> certificates metadata insert
    -> stamp assignment
    -> success page short-lived certificate URL
```

Certificate download must not be blocked by survey, sharing, LINE, Google, email, or phone number.

Certificate image URLs must go through `/api/media/image?bucket=certificate-files&path=...`.
That proxy must verify the certificate row and visit ownership before creating a signed URL.

---

## 4. Storage Provider Boundary

Runtime code should use:

```text
lib/storage/private-files.ts
```

The route handler should not know whether the provider is Cloudinary, Supabase Storage, or future university storage.

Expected adapter operations:

```text
uploadPrivateFile
createPrivateFileSignedUrl
deletePrivateFile
```

---

## 5. Failure Handling

If storage upload fails:

```text
return a safe upload error
do not create metadata record
do not expose provider error details to the client
```

If storage upload succeeds but database metadata fails:

```text
attempt provider cleanup
log sanitized error
return a safe failure response
```

Do not log:

```text
raw file content
base64 certificate image
Cloudinary API secret
Supabase service role key
signed URLs
guest token
provider_user_id
```

---

## 6. Admin Image Upload Flow

Admin content-media, Media Library, and certificate template uploads share the same server-side image processing helper:

```text
lib/services/admin-image-processing.service.ts
```

Common rules:

- Require the relevant admin permission before reading or storing the file.
- Accept only JPEG, PNG, or WebP input.
- Reject empty files, files over 10MB, invalid image bytes, SVG/GIF/PDF/HTML files spoofed as image MIME types, and images over 64 megapixels.
- Decode with Sharp before storage.
- Convert output to WebP, which strips metadata by default.
- Generate storage paths server-side with UUIDs.
- Do not trust original filenames for storage keys.
- Write audit entries for admin media/template uploads.

Current variants:

```text
/api/admin/media/upload
    -> content_media editor upload
    -> max 1920px WebP q80
    -> uploadPrivateFile(logical bucket: visit-photos)

/api/admin/media
    -> Media Library upload
    -> max 1920px WebP q80
    -> 400px WebP thumbnail q70
    -> public site-media bucket

/api/admin/templates/upload
    -> certificate template background
    -> max 2400px WebP q90
    -> uploadPrivateFile(logical bucket: southern-border-tourism)
    -> cleanup uploaded file if database insert fails
```
