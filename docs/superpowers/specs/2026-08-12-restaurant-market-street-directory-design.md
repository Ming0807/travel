# Restaurant Market Street Directory

Date: 2026-08-12
Status: Approved from visual concept B
Reference: `C:/Users/NOTEBOOK/.codex/generated_images/019e5dca-5489-70c2-b037-d3f44c5f094d/exec-e0eae0e9-6fbf-40b9-8897-e14bee6dea56.png`

## Goal

Redesign `/restaurants` as a compact Thai-first local-food directory that remains polished when most published restaurants do not yet have managed images.

## Composition

1. Keep the existing public header, breadcrumb, compact title, coral action color, and teal utility color.
2. Add a horizontal category navigator using only controlled `food_type` values supported by the CMS.
3. Keep server-side search, exact food-type filtering, province scope validation, and pagination.
4. On desktop, add a slim category rail and group the current result page into useful editorial bands:
   - Local food: Thai, Malay, and Thai-Chinese.
   - Restaurants and street food: Halal, Street Food, Dimsum, and International.
   - Cafes, bakeries, and desserts: Dessert/Cafe, Coffee, and Bakery.
   - Other published values remain visible in an `อื่น ๆ` band.
5. Render each result as a compact horizontal media row. The restaurant name and controlled metadata carry the hierarchy; media is supporting content.
6. Mobile removes the duplicate side rail, keeps category navigation horizontally scrollable, and stacks compact result rows without horizontal overflow.
7. Preserve the owner/contact CTA and existing detail routes.

## Data Truth

- Do not display ratings, review counts, opening status, meal suitability, amenities, district, or availability because the listing DTO does not currently provide verified values.
- Do not display category counts unless they come from a complete aggregate query. The first version omits counts.
- Missing media uses a compact branded placeholder with the restaurant name; it never requests a fake image.
- Group headings classify only the current server-paginated result set and never claim province-wide totals.
- Unknown `food_type` values remain visible and retain their original controlled label.

## Accessibility And Responsive Rules

- Search, select, category links, and actions have a minimum 44px touch target.
- Active category uses `aria-current="page"`.
- Category navigation can scroll horizontally at 320px without clipping the page.
- Every restaurant keeps a descriptive detail link and missing-image accessible label.
- Keyboard focus uses the existing teal outline.

## Verification

- Unit-test category grouping, active category navigation, compact image/missing-image rendering, and truthful metadata.
- Preserve existing server filter tests.
- Run changed-file ESLint, TypeScript, targeted Vitest, and Impeccable detection.
- Capture `/restaurants` at desktop and mobile viewports and inspect overflow, hierarchy, and touch targets.

## Out Of Scope

- Accommodation redesign.
- Restaurant shortlist or route generation.
- Database migrations or new restaurant fields.
- Restaurant detail-page redesign.
