# Research Browser Preparation QA

Date: 2026-09-08. Local Chromium via Playwright CLI. No production mutation.

## Reproduce
Start `pnpm exec vite --config tests/visual/dashboard/nfc.vite.config.ts`, then:

```powershell
npx --yes @playwright/cli -s=research-qa open about:blank
npx --yes @playwright/cli -s=research-qa run-code --filename tests/visual/dashboard/research-browser-qa.js
npx --yes @playwright/cli -s=research-qa close
```

The fixture renders the actual `ResearchConsentSubmit` component. The script opens
two tabs in one fresh browser context and intercepts the preparation endpoint with
a delayed cookie-setting response. It asserts one issuance, four requests total
(prepare + verify per tab), and at most one request active at once. Both buttons
become enabled. No page JavaScript exceptions occurred.

Ready-state screenshots at 360/768/1440px passed horizontal overflow checks. The
360px failed-state screenshot was inspected: alert wraps, consent is disabled,
and the decline link remains actionable. A deliberate 409 produces the expected
network console error; it is not a JavaScript exception or unexpected regression.
Screenshots are local QA artifacts under `.tmp/research-browser-*.png`.

## Regression Checkpoint
The September 8 full Vitest run passed 348 files / 2,564 tests in 480.42s on
Node 22. This run preceded three additional component regression tests. A focused
rerun of preparation component, route and config tests then passed 3 files /
11 tests, including unsupported Web Locks, initial network failure and unmount
during cookie delivery. The unmount test asserts that lock release waits for
cookie read-back and neither request receives an abort signal.
These tests change no runtime code, migration or production flag.

## Limits
The endpoint and cookie are mocked; the test cookie is not the production
`__Host-` Secure cookie. This proves actual browser Web Lock coordination and
component states, not production HTTPS cookie delivery, database consent or
grant authorization. The endpoint itself has separate unit tests. iOS/Safari,
Android in-app browsers, complete-schema staging, real HTTPS cookie checks and
full accept/link/evaluate/withdraw flows remain required before flag activation.
