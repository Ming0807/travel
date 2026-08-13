# Attraction Rich Image Layout Design

## Goal

Make inline attraction images editable and predictable without replacing the existing Tiptap content model.

## Decisions

- Preserve intentional empty paragraphs as visible vertical spacing.
- Store image size as `data-image-size`: `full`, `large`, `medium`, or `small`.
- Store image alignment as `data-image-align`: `left`, `center`, or `right`.
- Treat existing images without layout attributes as `full` and `center`.
- Let admins change layout after selecting an existing image in the editor.
- Keep all image sizes responsive; images become full width on small screens.
- Allow only validated layout values through the public HTML sanitizer.
- Defer multi-image rows, drag resizing, and gallery blocks to the structured CMS refactor.

## UX

The image insertion dialog provides two segmented controls: display size and alignment. The editor toolbar shows the same controls when an existing image is selected. Controls use Thai labels, have at least 44px touch targets, and clearly identify that an image must be selected before changing its layout.

## Compatibility And Safety

No database migration is required because layout metadata is stored in the existing HTML fields. Existing HTML remains valid. Invalid or injected layout values are normalized before public rendering, and unsafe media URLs remain blocked by the existing managed-media sanitizer.

## Acceptance Criteria

1. Empty paragraphs between images remain visibly spaced in admin preview and public content.
2. New attraction images can be inserted at four sizes and three alignments.
3. Existing attraction images can be selected and updated using the toolbar.
4. Existing images without metadata display full width and centered.
5. Public rendering accepts only managed media and validated layout values.
6. Mobile rendering never overflows and uses full content width.
