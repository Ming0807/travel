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

const expectedFunctions = [
  "is_live_destination_province",
  "is_public_attraction",
  "is_public_restaurant",
  "is_public_accommodation",
  "is_public_story",
  "is_public_photo_spot",
  "is_public_route",
];

try {
  await client.connect();

  const columns = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'provinces'
      AND column_name IN ('destination_status', 'destination_display_order')
  `);
  const foundColumns = new Set(columns.rows.map((row) => row.column_name));
  for (const column of ["destination_status", "destination_display_order"]) {
    if (!foundColumns.has(column)) {
      throw new Error(`Missing public.provinces.${column}`);
    }
  }

  const liveDestinations = await client.query(`
    SELECT province_name_en, province_name_th
    FROM public.provinces
    WHERE is_active = true
      AND destination_status = 'live'
  `);
  if (
    liveDestinations.rowCount !== 1
    || String(liveDestinations.rows[0]?.province_name_en).toLowerCase()
      !== "yala"
  ) {
    throw new Error("Yala must be the only active live destination.");
  }

  const originProvinceCount = await client.query(`
    SELECT count(*)::integer AS count
    FROM public.provinces
    WHERE is_active = true
  `);
  if (Number(originProvinceCount.rows[0]?.count ?? 0) <= 1) {
    throw new Error(
      "Origin province master appears truncated; active provinces must not be reduced to Yala.",
    );
  }

  const functions = await client.query(
    `
      SELECT p.proname
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
      `Missing destination scope functions: ${missingFunctions.join(", ")}`,
    );
  }

  const policies = await client.query(`
    SELECT tablename, policyname, qual
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'attractions',
        'restaurants',
        'accommodations',
        'travel_stories',
        'suggested_routes',
        'checkin_codes',
        'certificate_templates',
        'stamp_definitions'
      )
  `);
  const policyText = policies.rows
    .map((row) => `${row.tablename}:${row.policyname}:${row.qual}`)
    .join("\n");
  for (const helper of [
    "is_public_attraction",
    "is_public_restaurant",
    "is_public_accommodation",
    "is_public_story",
    "is_public_route",
  ]) {
    if (!policyText.includes(helper)) {
      throw new Error(`Public policies do not reference ${helper}`);
    }
  }

  const originPolicy = await client.query(`
    SELECT qual
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'provinces'
      AND policyname = 'Public can read active provinces'
  `);
  if (
    originPolicy.rowCount !== 1
    || String(originPolicy.rows[0]?.qual).includes("destination_status")
  ) {
    throw new Error(
      "The active origin-province policy must remain independent of destination scope.",
    );
  }

  process.stdout.write(
    "Yala destination launch scope, public policies, and origin geography verified.\n",
  );
} finally {
  await client.end();
}
