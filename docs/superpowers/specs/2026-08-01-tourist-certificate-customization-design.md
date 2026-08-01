# Tourist Certificate Customization Design

## Goal

Give tourists a simple, mobile-first way to choose an eligible certificate template and adjust how their uploaded photo is cropped before generating the final PNG. Keep the certificate composition controlled by administrators so every result remains readable and professional.

## Decisions

- Certificate backgrounds are full-bleed artwork. They must not contain a fixed circle, oval, photo placeholder, text, logo, or seal.
- The managed template layout remains the source of truth for frame position, frame size, text position, colors, orientation, and safe margins.
- The rendered photo frame is separate from the background. It uses a white inner keyline, a theme accent outer keyline, and a restrained shadow.
- Tourists may choose among active templates valid for the visit attraction and current language fallback.
- Tourist controls are limited to photo zoom and horizontal/vertical crop position, with reset. Tourists cannot move text, change safe margins, or drag certificate elements in this phase.
- Customization exists in client state before generation. The selected template ID is validated again by the generation API, and the final rendered PNG remains the stored artifact. No database migration is required.

## Data Flow

1. The preview page loads active attraction-specific and global templates once.
2. The service returns a deterministic selected template plus ordered eligible options.
3. The page maps private background paths to visit-scoped `/api/certificate/template-image` URLs without exposing storage paths.
4. `CertificatePreview` owns the selected option and `PhotoAdjustment` state.
5. `CertificateArtwork` renders the selected template layout and applies bounded zoom and object position only to the tourist photo.
6. `html-to-image` captures the customized artwork.
7. `/api/certificate/generate` revalidates visit ownership, photo ownership, and selected template eligibility before storing the PNG.

## UX

- Show the certificate preview first.
- If more than one option exists, show compact template choices with name, scope, and orientation.
- Provide a clear `ปรับรูปภาพ` control that opens an inline mobile-safe panel.
- Controls: zoom `1.0-2.0`, horizontal crop `0-100`, vertical crop `0-100`, and `คืนค่าเดิม`.
- Every control has a visible Thai label and current value. Range inputs remain at least 44px high.
- Template switching keeps the photo adjustment because it describes the source photo crop, while reset restores `zoom=1`, `x=50`, `y=50`.
- Generation stays disabled only while rendering/uploading. Survey and login remain outside the reward gate.

## Error And Security Rules

- Empty template collections retain the existing Thai unavailable state.
- A stale or out-of-scope template ID returns the existing safe 409 response.
- No private storage path, tourist ID, visit ID, or signed URL is persisted in customization state.
- Invalid customization values are clamped by the artwork helper even if a caller bypasses UI controls.

## Acceptance Criteria

- Background has no baked-in photo placeholder.
- Default layout produces a balanced certificate without user action.
- Tourist can choose a valid template, zoom, pan, reset, and generate the exact visible result.
- Frame remains attractive for circle, rounded, and square template shapes.
- Mobile width 375/390 has no horizontal overflow and all controls remain reachable.
- Existing API authorization and idempotency behavior remains unchanged.
