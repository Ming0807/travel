# PHASE_01_PROJECT_SETUP.md

## Objective

Create the application foundation for the Southern Border Tourism Data & Intelligence Platform.

Status: In progress / Phase 01 foundation.

This phase sets up the Next.js fullstack MVP structure only. It must not implement the full database schema, production QR check-in logic, certificate rendering, upload pipeline, dashboard calculations, LINE LIFF, or export workflows.

---

## Architecture Boundary

The MVP uses one Next.js App Router application.

Do not create a separate NestJS backend, Express backend, or split frontend/backend apps in this phase.

Internal backend boundary:

```text
UI Component
  -> Server Action / Route Handler
  -> Validation
  -> Auth / Permission / Ownership Guard
  -> Service Layer
  -> Repository Layer
  -> Supabase PostgreSQL / Supabase Storage
```

---

## Phase 01 Scope

Required foundation:

- Next.js App Router project structure
- TypeScript strict configuration
- Tailwind CSS configuration
- Basic public, tourist, admin, and API routes
- Shared component folders
- Supabase browser/server/service-role client boundaries
- Environment variable documentation and `.env.example`
- Basic homepage shell based on the approved premium smart tourism direction
- Placeholder pages for key future modules
- Basic lint, typecheck, test, and build scripts
- Supabase migration and seed folders

---

## Placeholder Routes

Phase 01 should expose route shells for:

```text
/
/attractions
/attractions/[slug]
/checkin/[code]
/c/[code]
/passport
/profile
/dashboard
/admin
/privacy
/api/health
```

The `/c/[code]` route is kept as the short QR-friendly route, while `/checkin/[code]` remains available as an explicit placeholder route.

---

## Product Rules To Preserve

- Guest mode must work first.
- QR landing appears before any long form.
- Google and LINE are optional tourist linking features.
- Admin authentication is separate from tourist identity.
- Certificate download must not be blocked by survey, sharing, LINE, Google, email, or phone.
- Do not use IP address as the main tourist identity mechanism.
- Dashboard data must be aggregated and privacy-safe.

---

## Acceptance Criteria

```text
[ ] Dependencies install.
[ ] Local dev server starts.
[ ] TypeScript configuration works.
[ ] Tailwind styles render.
[ ] App Router route shells exist.
[ ] Supabase browser-safe and server-only clients are separated.
[ ] Service role client is server-only.
[ ] Environment variables use placeholders only.
[ ] Homepage reflects premium smart tourism direction.
[ ] Basic tests are configured.
[ ] Build, lint, typecheck, and test results are reported.
```

---

## Next Phase

```text
Phase 02: Database Schema
```
