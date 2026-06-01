# API_ENDPOINTS.md

## Admin Media Endpoints

These endpoints support official CMS media management. They require admin authentication and server-side permission checks.

| Method | Path | Status | Purpose | Permission | Notes |
|---|---|---|---|---|---|
| `GET` | `/api/admin/media/[id]` | Implemented | Load used-in references for a media asset by `media_assets.id`. | `media.read` | Kept for Media Library asset workflows. |
| `DELETE` | `/api/admin/media/[id]` | Implemented | Archive a media asset instead of hard deleting it. | `media.deactivate` | Returns used-in references so admins understand impact. |
| `PATCH` | `/api/admin/media/[id]` | Implemented | Restore an archived media asset with `{ "action": "unarchive" }`. | `media.activate` | Requires the `media.activate` seed/migration permission. |
| `GET` | `/api/admin/media/references?storagePath=...` | Implemented | Load used-in references by storage path for content-media editors. | `media.read` | Preferred for attraction/story/route media managers that work with `content_media` records. |

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
