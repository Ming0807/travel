# Admin Accommodation CMS

The accommodation CMS creates, edits, publishes, archives, and manages media for accommodation records. It is a separate workflow from attraction content editing and uses the accommodation-owned actions and repository.

## Edit behavior

- Add and edit use a sectioned, responsive workspace for names/slug, Thai and English descriptions, location/contact information, and publication/media settings. Hidden sections remain part of the same form submission.
- A lightweight public-facing preview and content-readiness checklist reflect the unsaved draft. They summarize accommodation fields and are not a render of the public route; readiness is guidance only and does not change server publication rules.
- Thai and English descriptions use the shared rich-text editor with managed inline images and image layout controls. Both existing description fields remain the source of truth; the accommodation repository sanitizes their HTML before persistence.
- Cover media selection persists the chosen managed media record. The selected ID must resolve to an active image before the accommodation record is changed; a preview URL without a managed ID is rejected.
- Removing the cover clears the `is_cover` relation for that accommodation without deleting the media asset.
- Edit mode previews up to six active gallery images and links directly to the accommodation media manager for gallery and asset management. Multiple gallery assets remain managed there; creation offers a direct next step after the accommodation receives its database ID.
- Select controls retain an existing type or price-range value that is not among the suggested options, preventing an unrelated save from silently clearing legacy/imported values. Choosing another option remains explicit.
- Latitude and longitude are optional, but must be supplied together. Each coordinate is range-checked by the mutation schema.
- Server validation switches to the relevant editor section for field errors so hidden fields cannot block saving. Errors are summarized with field labels and inline on key fields.
- List and status actions retain the existing permission checks, audit logging, and reversible archive behavior.

## Current parity gaps

- Related attraction curation is currently managed from the attraction editor's accommodation relationship, not from the accommodation editor.
- The accommodation preview is a compact draft summary, not the attraction editor's full public-page visual preview. This is intentional in the current workflow and does not affect persisted fields.

## Focused acceptance checks

- Update with an empty cover selection clears the active cover relation.
- Update with a selected media ID links that exact asset and replaces the prior cover.
- Saving an existing record preserves an unlisted imported accommodation type and price range unless the admin chooses a replacement.
- Form submission includes formatted Thai and English description HTML from their rich-text editors.
- Edit gallery preview includes active images only and links to the accommodation media manager.
- Coordinate pairs pass; a one-sided coordinate fails with a field-level validation error.
- Invalid slug, province, name, or coordinate values fail server-side validation.
