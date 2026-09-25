# Admin Accommodation CMS

The accommodation CMS creates, edits, publishes, archives, and manages media for accommodation records. It is a separate workflow from attraction content editing and uses the accommodation-owned actions and repository.

## Edit behavior

- Add and edit use a sectioned workspace for core details, Thai/English descriptions, location/contact information, and publication/media settings. The shared save action still submits the complete record.
- A lightweight public-facing preview and content-readiness checklist reflect the unsaved draft. They summarize accommodation fields and are not a render of the public route; readiness is guidance only and does not change server publication rules.
- Cover media selection persists the chosen managed media record. The selected ID must resolve to an active image before the accommodation record is changed; a preview URL without a managed ID is rejected.
- Removing the cover clears the `is_cover` relation for that accommodation without deleting the media asset.
- Edit mode links directly to the accommodation media manager for gallery and asset management.
- Latitude and longitude are optional, but must be supplied together. Each coordinate is range-checked by the mutation schema.
- Descriptions are plain text in Thai and English. Add and edit share a sectioned, responsive form; server validation switches to the section containing the first field error so hidden fields cannot block saving.
- List and status actions retain the existing permission checks, audit logging, and reversible archive behavior.

## Current parity gaps

- Related attraction curation is currently managed from the attraction editor's accommodation relationship, not from the accommodation editor.
- Accommodation descriptions do not have the attraction editor's rich-content authoring and preview workflow.
- Accommodation metadata and publication readiness rules are simpler than the attraction editor's sectioned workflow.

These are product-level CMS gaps; address them with a dedicated accommodation content design before changing the shared relation editor or public detail contract.

## Focused acceptance checks

- Update with an empty cover selection clears the active cover relation.
- Update with a selected media ID links that exact asset and replaces the prior cover.
- Coordinate pairs pass; a one-sided coordinate fails with a field-level validation error.
- Invalid slug, province, name, or coordinate values fail server-side validation.
