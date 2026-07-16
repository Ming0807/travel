# Phase 12A: Authenticated Admin E2E QA

## Status

Implemented. The live smoke suite is environment-gated and must be run against an approved local, preview, or staging environment before release.

## Objective

Prove that a real authenticated administrator can load and navigate the production admin application without relying on intercepted or hand-written mock HTML.

## Scope

- Real admin login through `/admin/login`.
- Non-destructive reads of dashboard, CMS, QR, tourist, survey, certificate, media, role, and settings modules.
- HTTP failure, protected-route redirect, React runtime error, and horizontal overflow detection.
- Mobile menu open/close and critical list usability.
- Visible account-menu logout.
- Credentials supplied only through environment variables.

## Safety Rules

- Do not hardcode usernames or passwords.
- Use a dedicated staging admin where possible.
- Do not create, update, archive, publish, or delete records in this smoke suite.
- Do not run destructive CRUD automation against production.
- Keep workers at one and complete desktop/mobile/logout checks in one authenticated journey to respect login rate limits.

## Command

```powershell
$env:E2E_ADMIN_USERNAME="staging-admin"
$env:E2E_ADMIN_PASSWORD="..."
$env:PLAYWRIGHT_BASE_URL="https://preview.example.com"
npm run test:e2e:admin-live
```

Omit `PLAYWRIGHT_BASE_URL` to use the local application at `http://127.0.0.1:3000`.

## Acceptance Criteria

- Critical admin modules return successful document responses.
- Authentication is retained while navigating between modules.
- No page reports the production admin error boundary.
- No uncaught page or console errors occur.
- Desktop and mobile pages have no document-level horizontal overflow.
- Mobile navigation opens and closes accessibly.
- Logout returns the administrator to `/admin/login`.

## Latest Verification

- Local authenticated journey passed on Chromium.
- Ten critical desktop modules loaded from the real application.
- Tourist and certificate template pages passed at a 375 x 812 mobile viewport.
- Mobile navigation opened and closed through its accessible dialog controls.
- Logout completed through the account menu.
- No console errors, uncaught page errors, HTTP failures, admin error boundary, or document-level horizontal overflow were detected.

Preview/staging verification remains required before production sign-off.
