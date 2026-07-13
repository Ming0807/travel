# FILE_UPLOAD_FLOW.md

## 1. Purpose

This document defines the current MVP upload flow for tourist photos and generated certificate files.

The storage provider for development and Vercel deployment is Cloudinary through a server-only storage adapter. Supabase Storage remains a fallback/legacy provider, and university-hosted storage is planned as a future adapter.

---

## 2. Tourist Photo Upload Flow

```text
PhotoUploadClient
    -> validate source image (JPG/PNG/WebP/HEIC, max 50MB)
    -> client resize + WebP conversion (max 1920px, target <= 3.5MB)
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
- Client preprocessing must fail closed. If the browser cannot decode or compress the image, it must show a recoverable error and must not send the original large file.
- The 3.5MB client target leaves multipart overhead below Vercel's 4.5MB Function request limit. The server still validates the prepared file independently and reprocesses it with Sharp.
- HEIC/HEIF is accepted only as a client-side source on browsers that can decode it. The server receives and stores the converted WebP, not the original HEIC file.

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

---

## 7. Canonical Image Delivery Routes

Do not build public image URLs by string concatenation in UI components. Use the helpers in:

```text
lib/media/storage-paths.ts
```

Current delivery rules:

| Source | Helper / Route | Access rule |
|---|---|---|
| Public `site-media` bucket object | `siteMediaImageUrl()` -> `/site-media/{path}` | Public file path only. The route strips duplicate `/site-media/` prefixes, encodes path segments, rejects unsafe paths, and falls back to a PNG placeholder for missing or invalid upstream images. |
| Public CMS `content_media` record | `siteMediaImageUrl()` -> `/api/media/image?path=...` | The proxy requires an active `content_media` row and a published/active owner before signing the underlying private object. |
| Admin preview for CMS media | `adminMediaPreviewUrl()` -> `/api/admin/media/preview?bucket=visit-photos&path=...` | Requires admin auth and can preview draft/unpublished owner media. |
| Tourist visit photo | `/api/media/image?bucket=visit-photos&path=...` | Requires visit/photo ownership. |
| Generated certificate | `/api/media/image?bucket=certificate-files&path=...` | Requires certificate/visit ownership. |

Important boundaries:

- `content-media/...` files uploaded through `/api/admin/media/upload` are stored through the private storage adapter, currently under the logical `visit-photos` bucket.
- Public pages may show those files only after the `content_media` row is active and its owning attraction, restaurant, accommodation, route, or story is visible.
- Admin editors must use `adminMediaPreviewUrl()` so draft content can be previewed without accidentally making draft media public.
- Provider-qualified Cloudinary references are allowed for CMS content media only when they point to `content-media/...`; arbitrary Cloudinary references are not treated as public site media.
