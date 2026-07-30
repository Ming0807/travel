import pg from "pg";

const { Client } = pg;
const connectionString = process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  throw new Error("SUPABASE_DATABASE_URL is required.");
}

const hostname = new URL(connectionString).hostname;
const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
const client = new Client({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const expectedTables = [
  "story_engagement_events",
  "story_engagement_daily",
  "story_engagement_dedup",
  "story_engagement_rate_buckets",
];
const expectedFunctions = [
  "record_story_engagement_event",
  "consume_story_engagement_rate_limit",
  "aggregate_story_engagement_events",
  "purge_story_engagement_data",
];
const forbiddenColumns = [
  "tourist_id",
  "visit_id",
  "provider_user_id",
  "guest_token",
  "ip_address",
  "referrer",
  "page_url",
  "metadata",
];

try {
  await client.connect();

  const tables = await client.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
    `,
    [expectedTables],
  );
  const foundTables = new Set(tables.rows.map((row) => row.table_name));
  const missingTables = expectedTables.filter(
    (table) => !foundTables.has(table),
  );
  if (missingTables.length > 0) {
    throw new Error(
      `Missing Story engagement tables: ${missingTables.join(", ")}`,
    );
  }

  const columns = await client.query(
    `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
        AND column_name = ANY($2::text[])
    `,
    [expectedTables, forbiddenColumns],
  );
  if (columns.rowCount > 0) {
    throw new Error(
      `Forbidden Story engagement columns: ${columns.rows
        .map((row) => `${row.table_name}.${row.column_name}`)
        .join(", ")}`,
    );
  }

  const functions = await client.query(
    `
      SELECT
        p.proname,
        has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
        has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
        has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_execute
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = ANY($1::text[])
    `,
    [expectedFunctions],
  );
  const foundFunctions = new Set(functions.rows.map((row) => row.proname));
  const missingFunctions = expectedFunctions.filter(
    (name) => !foundFunctions.has(name),
  );
  if (missingFunctions.length > 0) {
    throw new Error(
      `Missing Story engagement functions: ${missingFunctions.join(", ")}`,
    );
  }

  for (const fn of functions.rows) {
    if (
      fn.anon_execute ||
      fn.authenticated_execute ||
      !fn.service_role_execute
    ) {
      throw new Error(`Unsafe execute privileges for public.${fn.proname}`);
    }
  }

  process.stdout.write(
    "Story engagement schema and RPC privileges verified.\n",
  );
} finally {
  await client.end();
}
