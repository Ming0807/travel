// Disposable PostgreSQL replay only. Auth/storage stubs are NOT Supabase acceptance.
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import pg from "pg";
import { verifyNfcCleanupLeases } from "./qa/nfc-cleanup-leases.mjs";

const name = `tourism-schema-replay-${randomUUID().slice(0, 8)}`;
let started = false;
let db;
let current = "bootstrap";
let applied = 0;
function docker(args) {
  const result = spawnSync("docker", args, { encoding: "utf8", timeout: 120000 });
  if (result.status !== 0) throw new Error(`Docker ${args[0]} failed: ${result.stderr || result.error}`);
  return result.stdout.trim();
}
try {
  docker(["run", "-d", "--name", name, "-p", "127.0.0.1::5432", "-e",
    "POSTGRES_HOST_AUTH_METHOD=trust", "-e", "POSTGRES_DB=platform_replay_qa", "postgres:16"]);
  started = true;
  const port = docker(["port", name, "5432/tcp"]).match(/^127\.0\.0\.1:(\d+)$/)?.[1];
  if (!port) throw new Error("Expected isolated loopback database");
  let lastConnectionError;
  for (let attempt = 0; attempt < 120; attempt++) {
    const candidate = new pg.Client({ host: "127.0.0.1", port: Number(port), user: "postgres",
      database: "platform_replay_qa", connectionTimeoutMillis: 2000, statement_timeout: 30000 });
    try { await candidate.connect(); db = candidate; break; }
    catch (error) { lastConnectionError = error.code; await candidate.end(); await new Promise(resolve => setTimeout(resolve, 1000)); }
  }
  if (!db) {
    console.error(docker(["logs", "--tail", "25", name]));
    throw new Error(`Disposable PostgreSQL not ready (${lastConnectionError ?? "unknown"})`);
  }
  await db.query(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
      SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    CREATE SCHEMA storage;
    CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean);
    CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated,service_role;`);
  const directory = new URL("../supabase/migrations/", import.meta.url);
  const files = readdirSync(directory).filter(file => /^\d{14}_.+\.sql$/.test(file)).sort();
  for (const file of files) {
    current = file;
    // Existing launch migration explicitly requires this master-data prerequisite.
    if (file === "20260730110000_add_destination_launch_scope.sql") {
      await db.query("INSERT INTO public.provinces(province_name_th,province_name_en) VALUES($1,$2)", ["\u0e22\u0e30\u0e25\u0e32", "Yala"]);
      console.log("PREREQUISITE: inserted Yala reference row before destination launch migration.");
    }
    await db.query(readFileSync(new URL(file, directory), "utf8"));
    applied++;
  }
  console.log(`PASS ${applied} platform migrations replayed in filename order.`);
  current = "NFC retry against migrated platform tables";
  const actor = randomUUID(); const operator = randomUUID(); const denied = randomUUID();
  const tag = randomUUID(); const request = randomUUID();
  await db.query(`INSERT INTO public.admin_users(admin_id,email) VALUES
    ($1,'owner@local.invalid'),($2,'operator@local.invalid'),($3,'viewer@local.invalid')`, [actor, operator, denied]);
  const role = (await db.query("INSERT INTO public.roles(role_name) VALUES('replay_operator') RETURNING role_id")).rows[0].role_id;
  const permission = (await db.query(`INSERT INTO public.permissions(permission_name) VALUES('checkin_code.manage')
    ON CONFLICT(permission_name) DO UPDATE SET permission_name=EXCLUDED.permission_name RETURNING permission_id`)).rows[0].permission_id;
  await db.query("INSERT INTO public.admin_user_roles(admin_id,role_id) VALUES($1,$2)", [operator, role]);
  await db.query("INSERT INTO public.role_permissions(role_id,permission_id) VALUES($1,$2)", [role, permission]);
  const attraction = (await db.query(`INSERT INTO public.attractions(province_id,slug,name_th)
    SELECT province_id,'local-replay-attraction','Local QA attraction' FROM public.provinces WHERE province_name_en='Yala'
    RETURNING attraction_id`)).rows[0].attraction_id;
  const code = (await db.query("INSERT INTO public.checkin_codes(code,attraction_id) VALUES('local-replay-code',$1) RETURNING checkin_code_id", [attraction])).rows[0].checkin_code_id;
  await db.query(`INSERT INTO public.nfc_tags(nfc_tag_id,checkin_code_id,label,created_by,updated_by,last_change_reason)
    VALUES($1,$2,'Local QA tag',$3,$3,'Disposable verification')`, [tag, code, actor]);
  await db.query("SET ROLE service_role");
  const asset = (await db.query(`SELECT asset_id FROM public.prepare_nfc_evidence_upload($1,$2,1,$3,
    'supabase','local-qa','nfc-evidence',$4,100,4,5)`, [randomUUID(), tag, actor, "a".repeat(64)])).rows[0].asset_id;
  await db.query("RESET ROLE");
  // Simulate a previously deferred attempt; scheduling itself runs with service privileges.
  await db.query(`UPDATE public.nfc_evidence_recovery_jobs SET attempt_count=1,last_outcome='provider_unavailable',
    last_attempt_at=clock_timestamp()-interval '2 minutes',next_attempt_at=clock_timestamp()+interval '1 hour' WHERE asset_id=$1`, [asset]);
  await db.query("SET ROLE service_role");
  const retry = "SELECT public.request_nfc_evidence_recovery_retry($1,$2,$3,$4,1,'provider_restored') AS request_id";
  await assert.rejects(db.query(retry, [randomUUID(), tag, asset, denied]), /NFC_RECOVERY_RETRY_FORBIDDEN/);
  for (let replay = 0; replay < 2; replay++) {
    assert.equal((await db.query(retry, [request, tag, asset, operator])).rows[0].request_id, request);
  }
  await db.query("RESET ROLE");
  assert.equal((await db.query("SELECT count(*)::int AS n FROM public.nfc_evidence_recovery_retry_requests WHERE asset_id=$1", [asset])).rows[0].n, 1);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM public.audit_logs WHERE action='nfc_recovery.retry_requested' AND entity_id=$1", [asset])).rows[0].n, 1);
  await db.query("DELETE FROM public.admin_user_roles WHERE admin_id=$1", [operator]);
  await db.query("SET ROLE service_role");
  await assert.rejects(db.query(retry, [request, tag, asset, operator]), /NFC_RECOVERY_RETRY_FORBIDDEN/);
  for (const browserRole of ["anon", "authenticated"]) {
    await db.query(`RESET ROLE; SET ROLE ${browserRole}`);
    await assert.rejects(db.query(retry, [request, tag, asset, operator]), /permission denied/);
    await assert.rejects(db.query("SELECT * FROM public.nfc_evidence_recovery_retry_requests"), /permission denied/);
  }
  console.log("PASS platform NFC retry: current grant, denied actor, exact replay, one receipt/audit, revoked grant and browser-role denial.");
  current = "readonly NFC evidence inventory";
  await db.query("RESET ROLE; SET ROLE service_role");
  await db.query(`SELECT public.finalize_nfc_evidence_upload($1,$2,'local-qa',$3,$4,100,4,5)`,
    [asset, actor, `nfc-evidence/${asset}.webp`, "a".repeat(64)]);
  const legacyAssets = [];
  for (let index = 0; index < 23; index++) {
    const legacy = randomUUID();
    legacyAssets.push(legacy);
    await db.query(`SELECT public.register_nfc_evidence_asset($1,$2,1,$3,'supabase',$4,$5,100,4,5)`,
      [legacy, tag, actor, `nfc-evidence/${legacy}.webp`, "b".repeat(64)]);
  }
  await db.query(`SELECT public.record_nfc_field_check_with_photos($1,$2,1,$3,
    'Local QA location','QA device','other','not_tested','passed','','',$4::uuid[])`,
    [randomUUID(), tag, actor, [asset]]);
  await db.query("RESET ROLE");
  await db.query(`INSERT INTO public.nfc_evidence_cleanup(asset_id,deleted_at) VALUES($1,NULL),($2,now())`, legacyAssets.slice(0, 2));
  await db.query("SET ROLE service_role");
  const inventory = "SELECT public.list_nfc_evidence_inventory($1,$2) AS inventory";
  await db.query("BEGIN READ ONLY");
  const first = (await db.query(inventory, [tag, null])).rows[0].inventory.rows;
  assert.equal(first.length, 21);
  assert.deepEqual(Object.keys(first[0]).sort(), ["asset_id", "attached", "cleanup_state", "created_at", "has_intent", "provider"]);
  const second = (await db.query(inventory, [tag, first[19].asset_id])).rows[0].inventory.rows;
  const all = [...first.slice(0, 20), ...second];
  assert.equal(all.length, 24); assert.equal(new Set(all.map(row => row.asset_id)).size, 24);
  assert.equal(all.filter(row => row.has_intent).length, 1);
  assert.equal(all.filter(row => row.attached).length, 1);
  assert.equal(all.find(row => row.asset_id === asset).attached, true);
  assert.equal(all.find(row => row.asset_id === asset).cleanup_state, "none");
  assert.equal(all.find(row => row.asset_id === legacyAssets[0]).cleanup_state, "pending");
  assert.equal(all.find(row => row.asset_id === legacyAssets[1]).cleanup_state, "acknowledged");
  assert.equal(all.filter(row => row.cleanup_state === "none").length, 22);
  assert.deepEqual((await db.query(inventory, [randomUUID(), null])).rows[0].inventory.rows, []);
  await db.query("ROLLBACK");
  for (const browserRole of ["anon", "authenticated"]) {
    await db.query(`RESET ROLE; SET ROLE ${browserRole}`);
    await assert.rejects(db.query(inventory, [tag, null]), /permission denied/);
  }
  console.log("PASS readonly inventory: exact fields, 20+lookahead cursor, tag scope, attachment, pending/acknowledged cleanup, legacy/intent distinction and browser denial.");
  current = "held NFC cleanup lease foundation";
  await verifyNfcCleanupLeases(db, { tag, actor });
  console.log("Auth/storage are minimal DDL compatibility stubs; no live sessions or provider behavior proven.");
} catch (error) {
  console.error(`FAIL after ${applied} migrations at ${current}: ${error.message}`);
  process.exitCode = 1;
} finally {
  await db?.end().catch(() => undefined);
  if (started) docker(["rm", "-f", name]);
}
