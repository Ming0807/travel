# Admin Restaurant CMS

## Routes and ownership

- `/admin/restaurants/new` creates a restaurant with its Thai/English name and content, managed cover, categories, location, contact details, status, and nearby attraction relationships.
- `/admin/restaurants/[id]/edit` edits the saved record in the restaurant visual editor.
- `/admin/restaurants/[id]/media` remains the direct media-management route. The visual editor also opens the same restaurant media manager in a drawer.

Restaurant create/update continues to use the existing server actions, validation, managed-media identity checks, and atomic category/attraction relationship writes. This module adds no database fields or migration requirements.

## Content and media workflow

Thai and English descriptions use the rich-text editor. Both support managed inline images and the existing size/alignment controls. Inline content remains in the existing description fields and is rendered through the public content sanitizer.

The edit canvas previews up to six linked, active restaurant images ordered by cover then display order. The status count reflects active image records with usable preview URLs. When none are available, the editor shows an empty state and a direct action to add media. The gallery drawer uses the shared media manager with `entityType="restaurant"`; uploaded or edited media retains the existing media lifecycle and public restaurant detail gallery behavior. The separate Media page remains available.

Only saved active image assets are shown. Draft, archived, inactive, panorama, or unusable media is not presented as public gallery content. Preview is separate from publishing: existing restaurant publication and destination-scope rules remain authoritative.

## Acceptance checks

- New and edit forms retain the existing validation and save/error states.
- Thai and English description editors both expose media insertion and image layout controls.
- Restaurant edit shows an empty-gallery add action when no eligible media exists.
- Eligible linked images appear in stable order with their saved alt text, falling back to the restaurant name.
- Gallery actions open the restaurant media manager for the current restaurant without leaving the editor.
- The media manager remains responsive in its drawer and the standalone Media page remains reachable.
- No restaurant CMS change modifies shared Settings, navigation, accommodation, or database files.

Focused regression coverage: `tests/unit/admin-restaurant-visual-editor.test.tsx`.
