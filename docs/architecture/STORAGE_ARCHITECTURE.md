# STORAGE_ARCHITECTURE.md

## 1. Purpose

This document describes the file storage architecture using Supabase Storage.

---

## 2. Storage Buckets

| Bucket | Purpose | Access | Max File Size |
|---|---|---|---|
| `photos` | Tourist-uploaded travel photos | Private (signed URLs) | 5 MB |
| `thumbnails` | Auto-generated photo thumbnails | Public (CDN) | 500 KB |
| `certificates` | Generated certificate images | Private (signed URLs) | 2 MB |
| `templates` | Certificate template backgrounds | Private (admin only) | 5 MB |
| `attractions` | Attraction gallery images | Public (CDN) | 5 MB |
| `stamps` | Stamp icon artwork | Public (CDN) | 500 KB |

---

## 3. File Naming Convention

```text
photos/{tourist_id}/{visit_id}/original.{ext}
thumbnails/{tourist_id}/{visit_id}/thumb.webp
certificates/{tourist_id}/{visit_id}/{certificate_id}.png
templates/{template_id}/background.png
attractions/{attraction_id}/{image_id}.{ext}
stamps/{stamp_definition_id}/icon.png
```

---

## 4. Upload Flow

### 4.1 Tourist Photo Upload

```text
1. Client validates file (type, size) before upload
2. Client sends file to server action
3. Server re-validates file (type, size, dimensions)
4. Server generates unique path
5. Server uploads to Supabase Storage (photos bucket)
6. Server optionally generates thumbnail
7. Server stores metadata in visit_photos table
8. Server returns { photoId, previewUrl }
```

### 4.2 Certificate Storage

```text
1. Server renders certificate image
2. Server uploads to Supabase Storage (certificates bucket)
3. Server stores path in certificates table
4. Client requests download via signed URL
```

---

## 5. Access Control

### 5.1 Bucket Policies

| Bucket | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| photos | Signed URL only | Server action only | None | Admin only |
| thumbnails | Public | Server only | None | Server only |
| certificates | Signed URL only | Server action only | None | Admin only |
| templates | Admin only | Admin only | Admin only | Admin only |
| attractions | Public | Admin only | Admin only | Admin only |
| stamps | Public | Admin only | Admin only | Admin only |

### 5.2 Signed URLs

- Tourist photos and certificates use **time-limited signed URLs** (1 hour expiry)
- Generated on-demand when tourist requests download
- Never expose raw storage paths to client

---

## 6. File Validation Rules

| Check | Rule |
|---|---|
| File type | Only `image/jpeg`, `image/png`, `image/webp` |
| File size | Max 5MB for photos, 500KB for thumbnails |
| File name | Sanitized, no special characters |
| Content type | Verify MIME type matches file header |
| Dimensions | Warn if below 800x600 (optional) |

---

## 7. Image Optimization

| Operation | When | Output |
|---|---|---|
| Thumbnail generation | After photo upload | 400x300 WebP |
| Certificate rendering | During generation | 1200x800 PNG |
| Attraction image resize | On admin upload | Max 1920px wide, WebP |
| Lazy loading | Client-side | `loading="lazy"` attribute |
