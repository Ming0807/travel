# Vercel Visual Fixture Typecheck Fix

The deployment of `1bbbbf3` compiled application code but failed TypeScript with
TS2307 in the two visual-fixture Vite configs. Both import `vite` directly, but
the root package declared only Vitest. A transitive dependency is not a reliable
direct import under pnpm's isolated dependency layout; a local leftover link can
hide this on developer machines.

Fix: declare exact `vite: 8.0.14` in devDependencies, matching the existing lockfile
resolution. The lockfile gains only the root importer entry; no dependency upgrade,
TypeScript exclusion, ignore-build-errors setting or application runtime change.
Frozen-lockfile installation passed. Build verification is run with Node 22, the
version pinned by the project. The Vercel Node 24 settings warning is not the
TS2307 failure; align project settings to Node 22 separately for consistency.

The fix is verified locally; a successful remote Vercel deployment remains the
final deployment check after push. No SQL or production feature flag is involved.

Verification: frozen-lockfile install passed; Node 22 production build completed
with TypeScript passing and 66 generated static pages. This fixes the missing
direct dependency without removing visual fixtures from type checking.
