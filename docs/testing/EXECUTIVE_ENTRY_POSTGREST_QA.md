# Executive Entry PostgREST QA

Run from the repository root using the project's Node 22 runtime:

```powershell
pnpm dlx node@22 scripts/verify-executive-entry-postgrest.mjs
```

The runner creates uniquely named disposable PostgreSQL 16 and PostgREST 14.12
containers on an isolated Docker network. Only PostgREST is published, on a random
loopback port. The database has no host port. Local trust authentication and the
read-only fixture role are for this disposable environment only. The runner never
reads `.env`, modifies production flags, or applies production migrations. Its
finally block removes the containers and network it created.

The test executes the actual `readExecutiveEntryCohort` repository through the
installed Supabase client and real HTTP/PostgREST queries. Only client credentials,
the `/rest/v1` gateway prefix and the tracking flag are replaced for this harness.
No query-builder or HTTP response mocks are used. Ordinary test runs skip this
opt-in suite; only the runner's completed result is integration evidence.

## Coverage

- Provider limit of two rows: eight entries require four real requests.
- Equal timestamps still produce stable, nonduplicated pagination.
- Abandoned entry sessions survive left-embedded Visit relationships.
- Nested certificate and survey arrays resolve through real foreign keys and
  unique indexes matching the foundation-hardening migration. PostgREST 14.12
  returns arrays for these standalone unique indexes, unlike UNIQUE constraints;
  the application relationship normalizer already supports both shapes.
- Bangkok end-of-day microseconds are included; next midnight is excluded.
- Attraction, province, district and primary attraction category filter correctly.
- Unsupported respondent filters produce no HTTP request.

## Limits

September 10 verification: eight integration tests passed with the index-based
fixture. An intermediate run failed because assertions expected objects; actual
PostgREST responses demonstrated arrays and assertions now match that contract.
Scoped ESLint and Node 22 TypeScript passed. No production build was repeated for
this test/documentation-only checkpoint. The disposable runner completed cleanup.

This is a minimal synthetic relationship schema, not the entire production schema.
It does not prove real admin authentication, RLS, deployed migration status,
large-data query plans, concurrent cross-page snapshot consistency or physical
QR/NFC hardware behavior. Those remain release gates. No real tourist data is used.
