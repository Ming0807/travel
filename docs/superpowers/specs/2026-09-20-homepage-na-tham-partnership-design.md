# Na Tham Homepage Partnership Design

## Goal

Update the public homepage to identify the Ban Na Tham community-tourism working group, provide the attached living-blueprint document, visibly credit Yala Rajabhat University, and route the existing external 360 experience to the new official destination.

## Approved Design

- Replace the legacy hero message with `คณะทำงานขับเคลื่อนการท่องเที่ยวโดยชุมชน ตำบลหน้าถ้ำ` while preserving the CMS for future titles that are not the retired copy.
- Add a third hero action named `คณะทำงาน`. It opens the bundled PDF in a new tab with `noopener noreferrer`.
- Place a restrained institutional credit below the hero actions: official Yala Rajabhat University logo, `ร่วมขับเคลื่อนโดย`, and the university name. It is a trust mark, not a second site brand.
- Store the PDF and logo under stable ASCII public paths.
- Change the centralized external 360 URL to `https://yala360.yru.ac.th/Natham/` so every fallback entry uses the same destination.
- Keep the existing responsive hero composition, QR action, attraction action, CMS image, and public data logic unchanged.

## Accessibility And Safety

- The PDF action has an explicit accessible name and visible document icon.
- External/new-tab links use `target="_blank"` and `rel="noopener noreferrer"`.
- The logo includes descriptive Thai alt text and uses explicit responsive dimensions.
- Mobile actions remain at least 48px high and wrap without horizontal overflow.

## Verification

- Unit tests assert the new heading, PDF link, university logo, retained primary actions, and new 360 constant.
- TypeScript, ESLint for touched code, focused Vitest tests, and the production build must pass.

