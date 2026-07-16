#!/usr/bin/env node

import { readdir } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import pg from "pg";
import { compareMigrationStates, migrationConnectionHint } from "./lib/migration-state.mjs";

if (!process.env.SUPABASE_DATABASE_URL) {
  try {
    loadEnvFile(".env.local");
  } catch {
    // CI and deployment environments normally provide variables directly.
  }
}

const connectionString = process.env.SUPABASE_DATABASE_URL?.trim();
const jsonOutput = process.argv.includes("--json");

if (!connectionString) {
  console.error("SUPABASE_DATABASE_URL is required. The connection value is never printed.");
  process.exit(2);
}

let databaseUrl;
try {
  databaseUrl = new URL(connectionString);
} catch {
  console.error("SUPABASE_DATABASE_URL is not a valid PostgreSQL URL.");
  process.exit(2);
}

const isLocal = ["localhost", "127.0.0.1", "::1"].includes(databaseUrl.hostname);
const client = new pg.Client({
  connectionString,
  connectionTimeoutMillis: 10_000,
  statement_timeout: 10_000,
  application_name: "tourism-migration-drift-check",
  ...(isLocal || databaseUrl.searchParams.has("sslmode")
    ? {}
    : { ssl: { rejectUnauthorized: true } }),
});

try {
  const localFiles = (await readdir(new URL("../supabase/migrations/", import.meta.url)))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  await client.connect();
  const remote = await client.query(
    "select version::text as version, name from supabase_migrations.schema_migrations order by version",
  );
  const result = compareMigrationStates(localFiles, remote.rows);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Local migrations:  ${localFiles.length}`);
    console.log(`Remote recorded:   ${remote.rows.length}`);
    console.log(`Applied matches:   ${result.applied.length}`);
    console.log(`Pending locally:   ${result.pending.length}`);
    console.log(`Remote-only:       ${result.remoteOnly.length}`);

    if (result.pending.length) {
      console.log("\nPending local migration history:");
      for (const item of result.pending) console.log(`  ${item.version}  ${item.name}`);
    }
    if (result.remoteOnly.length) {
      console.log("\nRemote versions without local files:");
      for (const item of result.remoteOnly) console.log(`  ${item.version}  ${item.name || "(no name)"}`);
    }
    if (result.nameMismatches.length) {
      console.log("\nVersion name mismatches:");
      for (const item of result.nameMismatches) {
        console.log(`  ${item.version}  local=${item.localName} remote=${item.remoteName || "(no name)"}`);
      }
    }
    if (result.invalidFiles.length) console.log(`\nInvalid migration filenames: ${result.invalidFiles.join(", ")}`);
    if (result.duplicateVersions.length) {
      console.log("\nDuplicate local migration versions:");
      for (const item of result.duplicateVersions) console.log(`  ${item.version}  ${item.files.join(", ")}`);
    }

    console.log(
      result.isSynchronized
        ? "\nMigration history is synchronized."
        : "\nMigration history drift detected. Verify schema objects before applying or repairing history.",
    );
  }

  if (!result.isSynchronized) process.exitCode = 1;
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN";
  console.error(`Could not read Supabase migration history (code: ${code}). No SQL was applied.`);
  console.error(migrationConnectionHint(code));
  process.exitCode = 2;
} finally {
  await client.end().catch(() => undefined);
}
