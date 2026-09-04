# Dashboard Component QA

Run `pnpm exec vite --config tests/visual/dashboard/vite.config.ts` and open
`http://127.0.0.1:4175`. This isolated, loopback-only Vite fixture imports the real
dashboard components and application CSS. It is not a Next.js route and is not
included in production routing. It has no database or authentication adapter.

The dataset is synthetic. `?state=empty` and `?state=low` exercise display states.
Navigation is stubbed for this component harness; downloading is intentionally
unavailable. Never count these screenshots as authenticated integration evidence.

Check 360, 390, 768, 1024 and 1440 px: collapsed/open filters, retained FormData,
saved-view controls, keyboard focus, export dialog scrolling, chart labels,
nonblank rendered SVGs and no horizontal page overflow. Live role-based testing
still requires the separate `admin-live-smoke.spec.ts` credentials and data.
