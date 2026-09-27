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

Use `?page=executive` to render the actual ExecutiveOverview with the same three
states. Its typed synthetic fixture also supports focused composition tests.
Count `.recharts-surface` for plotted charts; icon SVGs are not charts. Check
compact KPIs, full-label mobile lists, the score ring, evidence disclosures,
pending-attraction rows, and translated drill-down hrefs.

Use `?page=attraction` for the actual single-attraction workspace. On widths
below 640 px, audience, experience, and expense distributions begin collapsed
and do not render chart content until opened. At wider viewports they render
open. Use `?page=executive&state=no-records` for the base empty state and
`?page=executive&state=empty` for filtered-to-zero recovery copy.

Use `?page=attraction-filter` and `?page=attraction-filter&state=active` to
inspect the compact and expanded single-attraction filter. The active fixture
selects NFC, a real fixture campaign option, and a controlled check-in point.

Use `?page=attraction-notice&state=analytics_unavailable` for the recoverable
notice. Other supported states are `options_unavailable`, `no_attractions`,
`invalid_filters` and `attraction_unavailable`. `?page=attraction&state=large`
uses deliberately large synthetic KPI counts for overflow checks, not a coherent
analytical dataset or research result.

The fixture supplies Tahoma/Arial font-variable fallbacks because it does not run
the Next.js root layout or its generated Kanit/Noto font classes. Screenshots
test responsive composition, not exact production font fidelity.

For the 2026-09-27 matrix, run Vite on port 4183 and use the Playwright CLI
`run-code --filename tests/visual/dashboard/attraction-workspace-qa.js`. It checks
five widths, five notice states, four workspace states, keyboard table scrolling,
dependent filters and browser history using the real components. The standalone
`attraction-filter.html` harness uses synthetic codes and has no database adapter.
