#!/usr/bin/env node
import { loadEnvFile } from "node:process";
import pg from "pg";

if (!process.env.SUPABASE_DATABASE_URL) {
  try { loadEnvFile(".env.local"); } catch { /* Environment may be provided externally. */ }
}
const connectionString = process.env.SUPABASE_DATABASE_URL?.trim();
if (!connectionString) {
  console.error("SUPABASE_DATABASE_URL is unavailable. No SQL was applied.");
  process.exit(2);
}
let url;
try { url = new URL(connectionString); }
catch {
  console.error("Database connection configuration is invalid. No SQL was applied.");
  process.exit(2);
}
const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
const client = new pg.Client({
  connectionString, connectionTimeoutMillis: 10000, statement_timeout: 10000,
  application_name: "tourism-nfc-schema-readonly",
  ...(local || url.searchParams.has("sslmode") ? {} : { ssl: { rejectUnauthorized: true } }),
});
try {
  await client.connect();
  await client.query("BEGIN READ ONLY");
  const { rows } = await client.query(`
    SELECT 'table:' || name AS check_name, to_regclass('public.' || name) IS NOT NULL AS passed
      FROM unnest(ARRAY['nfc_tags','nfc_tag_events','checkin_entry_sessions']) AS name
    UNION ALL
    SELECT 'column:' || name, EXISTS (SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='checkin_entry_sessions' AND column_name=name)
      FROM unnest(ARRAY['research_study_id_snapshot','research_frozen_at_snapshot','evidence_scope_reason']) AS name
    UNION ALL
    SELECT 'rpc:' || signature, to_regprocedure('public.' || signature) IS NOT NULL
      FROM unnest(ARRAY['begin_checkin_entry(text,text,text,uuid)',
        'read_checkin_entry(uuid,text,text)', 'create_checkin_entry_visit(uuid,text,text,uuid)',
        'accept_entry_research_invitation(uuid,text,text,text,text,text,text)']) AS signature
    UNION ALL
    SELECT 'consent-service-role-only',
      COALESCE(has_function_privilege('service_role', to_regprocedure('public.accept_entry_research_invitation(uuid,text,text,text,text,text,text)'), 'EXECUTE'), false)
      AND NOT COALESCE(has_function_privilege('anon', to_regprocedure('public.accept_entry_research_invitation(uuid,text,text,text,text,text,text)'), 'EXECUTE'), true)
      AND NOT COALESCE(has_function_privilege('authenticated', to_regprocedure('public.accept_entry_research_invitation(uuid,text,text,text,text,text,text)'), 'EXECUTE'), true)
  `);
  await client.query("ROLLBACK");
  for (const row of rows) console.log(`${row.passed ? "PASS" : "MISSING"} ${row.check_name}`);
  if (rows.some((row) => !row.passed)) process.exitCode = 1;
  console.log("Read-only object/grant check only; no participant data read or SQL applied.");
} catch (error) {
  console.error(`Schema check unavailable (${error?.code ?? "UNKNOWN"}). No SQL was applied.`);
  process.exitCode = 2;
} finally {
  await client.end().catch(() => undefined);
}
