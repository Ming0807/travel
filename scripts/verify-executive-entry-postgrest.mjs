import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

// All resources are unique, disposable, and separate from existing databases.
const name = `tourism-entry-rest-qa-${randomUUID().slice(0, 8)}`;
const database = `${name}-db`;
const rest = `${name}-api`;
const created = [];
function docker(args, input) {
  const result = spawnSync("docker", args, { encoding: "utf8", input, timeout: 120000 });
  if (result.status !== 0) throw new Error(`Docker ${args[0]} failed: ${result.stderr || result.error}`);
  return result.stdout.trim();
}
async function ready(check) {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if (await check()) return; } catch { /* The new container may still be starting. */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error("Disposable integration service did not become ready");
}
try {
  docker(["network", "create", name]); created.push(["network", "rm", name]);
  docker(["run", "-d", "--name", database, "--network", name,
    "-e", "POSTGRES_HOST_AUTH_METHOD=trust", "-e", "POSTGRES_DB=entry_analytics_qa", "postgres:16"]);
  created.push(["rm", "-f", database]);
  await ready(() => docker(["exec", database, "pg_isready", "-U", "postgres"]).includes("accepting connections"));
  docker(["exec", "-i", database, "psql", "-U", "postgres", "-d", "entry_analytics_qa", "-v", "ON_ERROR_STOP=1"],
    readFileSync("tests/integration/fixtures/executive-entry.sql", "utf8"));
  docker(["run", "-d", "--name", rest, "--network", name, "-p", "127.0.0.1::3000",
    "-e", `PGRST_DB_URI=postgres://postgres@${database}:5432/entry_analytics_qa`,
    "-e", "PGRST_DB_ANON_ROLE=entry_qa_reader", "-e", "PGRST_DB_SCHEMAS=public",
    "-e", "PGRST_DB_MAX_ROWS=2", "public.ecr.aws/supabase/postgrest:v14.12"]);
  created.push(["rm", "-f", rest]);
  const port = docker(["port", rest, "3000/tcp"]).match(/^127\.0\.0\.1:(\d+)$/)?.[1];
  if (!port) throw new Error("Expected loopback-only QA binding");
  const url = `http://127.0.0.1:${port}`;
  await ready(async () => (await fetch(url)).ok);
  const test = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run",
    "tests/integration/executive-entry-postgrest.test.ts", "--maxWorkers=1"], {
    stdio: "inherit", env: { ...process.env, EXECUTIVE_ENTRY_QA_URL: url }, timeout: 300000,
  });
  if (test.status !== 0) throw new Error("Executive entry PostgREST integration failed");
} finally {
  for (const args of created.reverse()) docker(args);
}
