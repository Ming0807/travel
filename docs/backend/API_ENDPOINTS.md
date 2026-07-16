# API_ENDPOINTS.md

## Admin Content Export Endpoints

Content exports require their module-specific export permission, accept `format=csv|xlsx`, enforce
`EXPORT_MAX_ROWS`, and reuse the same validated URL filters shown on the corresponding admin list.
Invalid filter values return `400`; oversized exports return `413` and require narrower filters.

| Path | Supported list filters |
|---|---|
| `/api/admin/export/attractions` | `search`, `provinceId`, `districtId`, `attractionTypeId`, `isPublished`, `isActive` |
| `/api/admin/export/stories` | `search`, `provinceId`, `status`, `isPublished` |
| `/api/admin/export/routes` | `search`, `isPublished`, `isActive` |
| `/api/admin/export/restaurants` | `search`, `provinceId`, `foodType`, `isPublished` |
| `/api/admin/export/accommodations` | `search`, `provinceId`, `accommodationType`, `isPublished` |
| `/api/admin/export/badges` | `search`, `category`, `isActive` |
| `/api/admin/export/tourists` | `search`, `countryId`, `provinceId`, `provider`, `sort`; exports pseudonymous references and summary fields only |
| `/api/admin/export/roles` | `search`, `status`, `sort`; requires both `role.read` and `export.roles` |
| `/api/admin/export/certificate-templates` | `search`, `status`, `language`, `scope`, `sort`; excludes private storage paths |
| `/api/certificate/template-image` | `visitId`, `templateId`; verifies tourist visit ownership and template attraction scope before proxying private image bytes |

## Tourist Identity Resolution (Server Actions)

These server actions and auth guards support the OAuth tourist identity resolution added in June 2026. They resolve tourist identity from Supabase Auth sessions (Google, email, LINE) with guest fallback.

| Function | Location | Status | Purpose | Notes |
|---|---|---|---|---|
| `resolveTouristId()` | `lib/auth/guards.ts:726` | Implemented | Resolves tourist from OAuth session then falls back to guest cookie. | Does NOT create new profiles — only resolves existing identities. |
| `resolveCurrentTouristId()` | `lib/auth/guards.ts:715` | Implemented | Backward-compatible alias for `resolveTouristId()`. | Delegates to `resolveTouristId`. |
| `submitTouristStoryAction()` | `app/actions/tourist-story-actions.ts` | Implemented | Submits tourist stories with XSS-safe plain text normalization, strict province validation, and identity-only resolve. | Identity resolution uses `resolveCurrentTouristId()`. |
| `submitReviewAction()` | `app/actions/submit-review-action.ts` | Implemented | Submits reviews using `resolveCurrentTouristId()` for OAuth + guest identity. | Previously only supported guest identity. |

### OAuth Provider Mapping

The `resolveTouristId()` function resolves identity from Supabase Auth metadata:

- `user.app_metadata.provider` → mapped to `tourist_identities.provider` (google, email, line)
- `user.id` (Supabase Auth UUID) → mapped to `tourist_identities.provider_user_id`
- Falls back to `anonymous_device` guest cookie if no auth session

### Security / Privacy Notes

- Never exposes `provider_user_id` in client responses
- Service role used only in server-only repository boundaries
- Guest flow remains fully functional
- No duplicate tourist profiles for same OAuth identity

## Admin Media Endpoints

These endpoints support official CMS media management. They require admin authentication and server-side permission checks.

| Method | Path | Status | Purpose | Permission | Notes |
|---|---|---|---|---|---|
| `GET` | `/api/admin/media/[id]` | Implemented | Load used-in references for a media asset by `media_assets.id`. | `media.read` | Kept for Media Library asset workflows. |
| `DELETE` | `/api/admin/media/[id]` | Implemented | Archive a media asset instead of hard deleting it. | `media.deactivate` | Returns used-in references so admins understand impact. |
| `PATCH` | `/api/admin/media/[id]` | Implemented | Restore an archived media asset with `{ "action": "unarchive" }`. | `media.activate` | Requires the `media.activate` seed/migration permission. |
| `GET` | `/api/admin/media/references?storagePath=...` | Implemented | Load used-in references by storage path for content-media editors. | `media.read` | Preferred for attraction/story/route media managers that work with `content_media` records. |

## Media Delivery Endpoints

These endpoints render image bytes or redirects. UI components should use helpers from `lib/media/storage-paths.ts` instead of building these URLs manually.

| Method | Path | Status | Purpose | Access model | Notes |
|---|---|---|---|---|---|
| `GET` | `/site-media/{path}` | Implemented | Serve public `site-media` bucket images through a safe local route. | Public | Rejects unsafe paths, encodes path segments, rejects SVG/unknown image content, and returns a PNG placeholder for missing files. |
| `GET` | `/api/media/image?path=...` | Implemented | Serve published CMS `content_media` images from controlled private storage. | Public only when the `content_media` row is active and the owner content is published/active. | Used by `siteMediaImageUrl()` for `content-media/...` and Cloudinary content-media references. |
| `GET` | `/api/media/image?bucket=visit-photos&path=...` | Implemented | Serve private tourist visit photos. | Tourist visit/photo ownership required. | Used by tourist photo and certificate flows, not public CMS cards. |
| `GET` | `/api/media/image?bucket=certificate-files&path=...` | Implemented | Serve generated certificate images. | Certificate/visit ownership required. | Keeps certificate files behind short-lived signed URLs. |
| `GET` | `/api/admin/media/preview?bucket=...&path=...` | Implemented | Preview CMS/admin media, including draft owner content. | Admin auth required. | Use `adminMediaPreviewUrl()` in admin editors. |

## Phase 11 LINE LIFF Endpoints

These endpoints support optional LINE account linking after the tourist has already received the certificate/stamp reward. They must not be used as entry gates for QR check-in, photo upload, certificate download, passport guest mode, or survey access.

| Method | Path | Status | Purpose | Authentication/Identity | Privacy Notes |
|---|---|---|---|---|---|
| `POST` | `/api/line/verify` | MVP foundation | Verify a LINE ID token server-side and return a safe confirmation payload. | Requires a LINE ID token from LIFF. Does not require admin auth. | Does not return LINE user ID, `provider_user_id`, guest token, or internal tourist IDs. |
| `POST` | `/api/line/link` | MVP foundation | Link the verified LINE identity to the current guest tourist profile for optional passport recovery. | Requires current anonymous guest identity cookie, explicit linking consent, and a verified LINE ID token. | Stores LINE user ID only as `tourist_identities.provider_user_id`; does not expose it in the response. |
| `POST` | `/api/tourist/link-identity` | Disabled | Legacy generic identity-linking route. | Not supported. | Returns `410` because provider-specific server verification is required. |

### LINE Request Rules

- The browser may send a LIFF ID token to `/api/line/link` or `/api/line/verify`.
- The browser must not send a raw LINE user ID as a trusted value.
- The server verifies the token with LINE before deriving the stable provider identity.
- `hasConsented` must be `true` before linking LINE.
- Missing or invalid LINE configuration must fail safely and preserve Guest use.

### LINE Response Rules

Responses must be safe for tourist-facing UI:

```json
{
  "success": true,
  "linked": true,
  "provider": "line",
  "status": "linked"
}
```

Do not include:

```text
provider_user_id
LINE user ID
guest token
tourist_id
identity_id
raw LINE profile payload
LINE token
```
