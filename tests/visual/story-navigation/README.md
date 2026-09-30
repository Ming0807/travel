# Story and public navigation review

Run `npx vite --config tests/visual/story-navigation/vite.config.ts` and visit
`http://127.0.0.1:4190`. Uses the actual SiteHeader, UserNavMenu, StoryVisualEditor,
and editorial settings form, with synthetic auth, story data, and save responses.
It does not contact Supabase or write production data. Rich text, media picking,
and recommendation editing are outside this fixture's scope.

Variants: `?guest`, `?avatar`, `?editor`, `?editor&tourist`,
`?editor&restricted`, `?editor&incomplete`.

Review widths: 320, 360, 390, 480, 700, 768, 1024, 1160, 1161, 1200, 1240, 1280, 1440, 1920.
Check no header overlap/overflow, bounded long names, account dropdown bounds,
mobile discovery navigation, ArrowDown/ArrowUp/Escape/outside pointer behavior,
and a ready publisher's direct publication. Tourist stories must start moderation
before approval; restricted editors must see an explicit team handoff.
