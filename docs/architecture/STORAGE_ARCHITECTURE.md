# STORAGE_ARCHITECTURE.md

## 1. Purpose

This document describes the file storage architecture for the Southern Border Tourism Data & Intelligence Platform.

Storage must support:

- tourist photo uploads
- generated certificate images
- public attraction media
- stamp assets
- future official import files
- future export files

The current MVP direction is Cloudinary-first for development and Vercel deployment, while keeping the code provider-neutral so storage can move to a university-managed server later.

---

## 2. Provider Strategy

| Provider | Status | Use |
|---|---|---|
| Cloudinary | MVP default | Local development, Vercel preview, Vercel production |
| Supabase Storage | Supported fallback / legacy | Existing bucket migrations and environments that already use Supabase Storage |
| University server storage | Future | Long-term university-hosted deployment |

The application must not call provider SDKs directly from UI components. File operations should go through the server-only storage adapter:

```text
Route Handler / Server Action
    -> validation
    -> ownership or permission guard
    -> storage adapter
    -> metadata repository
```

Current implementation:

```text
lib/storage/private-files.ts
```

---

## 3. Logical Buckets

The application uses logical buckets even when the provider does not expose bucket primitives.

| Logical bucket | Purpose | Privacy |
|---|---|---|
| `visit-photos` | Tourist-uploaded photos | Private or controlled |
| `certificate-files` | Generated certificates/travel memory cards | Private or controlled |
| `export-files` | Future stored exports | Private |
| `attraction-media` | Published attraction images | Public after approval |
| `stamp-assets` | Stamp artwork | Public after approval |
| `official-imports` | Future official import files | Private |
| `temp-uploads` | Future temporary files | Private |

Cloudinary should map these logical buckets to folders/tags under `CLOUDINARY_UPLOAD_FOLDER`.

Supabase Storage uses actual buckets with the same names where applicable.

---

## 4. Storage References

Database records store storage references, not raw public URLs.

Examples:

```text
visit_photos.storage_path
certificates.certificate_path
```

Provider-neutral rules:

- Store enough information to retrieve the object later.
- Do not store signed URLs permanently.
- Do not store original filenames as final object keys.
- Do not include display name, email, phone, LINE ID, Google subject, provider ID, guest token, or full address in paths.
- Do not expose storage references in public UI, dashboards, or default exports.

Cloudinary records may use provider-qualified references such as:

```text
cloudinary:image:authenticated:v123:png:southern-border-tourism/certificates/2026/05/{visit_id}/{random_id}
```

Supabase legacy records may use plain object paths such as:

```text
certificates/2026/05/{visit_id}/{random_id}.png
```

---

## 5. Tourist Photo Upload Flow

```text
Tourist selects photo
    |
Client sends file to Next.js route handler
    |
Server validates MIME type and size
    |
Server verifies visit ownership
    |
Server generates object key
    |
Storage adapter uploads to Cloudinary or fallback provider
    |
Server stores metadata in visit_photos
    |
Server returns short-lived preview URL
```

Allowed tourist image MIME types:

```text
image/jpeg
image/png
image/webp
```

Tourist SVG/PDF/HTML/JavaScript uploads are not allowed.

---

## 6. Certificate Storage Flow

```text
Certificate preview rendered
    |
Generated PNG sent to Next.js route handler
    |
Server verifies visit ownership and photo ownership
    |
Server checks idempotency by visit
    |
Storage adapter stores certificate image
    |
Server stores certificates record
    |
Server awards stamp
    |
Success page requests short-lived display/download URL
```

Certificate download must not be blocked by survey, LINE, Google, email, or phone number.

---

## 7. Access Strategy

| File type | MVP access strategy |
|---|---|
| Tourist photos | Short-lived provider URL or controlled server access |
| Certificates | Short-lived provider URL or controlled server access |
| Attraction media | Public only after admin approval/publishing |
| Stamp assets | Public after admin approval |
| Exports | Stream directly in MVP; future stored exports must be private |

Cloudinary authenticated delivery should be used when available for tourist photos and certificates. If an environment uses less restrictive Cloudinary delivery during development, it must still avoid exposing URLs in dashboards/default exports and must not be treated as final production privacy proof.

---

## 8. Future University Storage Adapter

Future university-hosted storage should implement the same logical operations:

```text
uploadPrivateFile(bucket, path, data, contentType)
createPrivateFileSignedUrl(bucket, path, ttlSeconds)
deletePrivateFile(bucket, path)
```

If the university server does not support native signed URLs, the application can provide a controlled download route that:

- verifies tourist ownership or admin permission
- streams the file from university storage
- sets safe content headers
- avoids exposing backend storage paths
- records download/audit metadata where needed

---

## 9. Release Checklist

Before release:

```text
[ ] STORAGE_PROVIDER is set intentionally.
[ ] Cloudinary or fallback provider credentials are server-only.
[ ] Tourist photo upload works.
[ ] Certificate generation works.
[ ] Certificate preview/download works.
[ ] Private file URLs are short-lived or controlled.
[ ] Storage references are not exposed in public UI.
[ ] Dashboard and default exports exclude private storage references.
[ ] Orphan cleanup strategy is documented.
```

---

## 10. Final Rule

Storage is part of the privacy boundary.

The system may change providers, but file validation, ownership checks, private access, and metadata integrity must remain server-controlled.
