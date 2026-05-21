# ADR-009: Storage Provider Strategy

## Status

Accepted

## Context

The platform stores tourist-uploaded photos, generated certificate images, public attraction media, stamp assets, future import files, and future export files.

For MVP development and Vercel deployment, the project needs a storage provider that is easy to configure without running a university-hosted file server. The long-term production direction may move storage to a university-managed server or object storage service.

Tourist photos and certificates are privacy-sensitive. The application must avoid exposing storage credentials, internal storage paths, guest tokens, provider identifiers, or private file references in public UI, dashboards, or default exports.

## Decision

Use a provider-neutral server-side storage adapter.

Current provider priority:

| Provider | Status | Purpose |
|---|---|---|
| Cloudinary | MVP default for development and Vercel deployment | Tourist photos and generated certificate images |
| Supabase Storage | Supported fallback / legacy provider | Existing local setup, Supabase bucket migrations, fallback environments |
| University server storage | Future | Self-hosted or university-managed storage after MVP |

Runtime file operations go through the server-only helper in `lib/storage/private-files.ts`.

The database stores storage references in existing metadata columns such as `visit_photos.storage_path` and `certificates.certificate_path`. New Cloudinary records use provider-qualified storage references instead of raw public URLs.

## Alternatives Considered

| Alternative | Reason Not Chosen |
|---|---|
| Hardcode Supabase Storage | Does not match the current Vercel/Cloudinary deployment direction |
| Hardcode Cloudinary in route handlers | Makes future university-server migration harder |
| Store files directly in PostgreSQL | Poor performance and not appropriate for photos/certificates |
| Public URLs only | Too risky for tourist photos and certificates |

## Consequences

Positive:

- Vercel deployment can use Cloudinary without adding a separate backend.
- Future university storage can be added behind the same adapter.
- Route handlers no longer need to know provider-specific upload logic.
- Supabase Storage remains available for local fallback and existing seeded paths.

Trade-offs:

- Cloudinary privacy semantics differ from Supabase private buckets and must be verified in staging.
- Download/preview URLs may be provider-generated and short-lived; they must not be stored permanently.
- Cloudinary credentials become production secrets and must remain server-only.
- Future university storage still needs its own adapter implementation.

## Related Documents

- `docs/architecture/STORAGE_ARCHITECTURE.md`
- `docs/backend/STORAGE_FILE_UPLOADS.md`
- `docs/security/IMAGE_UPLOAD_SECURITY.md`
- `ENVIRONMENT.md`
- `DEPLOYMENT.md`
