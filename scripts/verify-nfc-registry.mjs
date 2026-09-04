// Run only against a fresh disposable local PostgreSQL database, never Supabase.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import pg from "pg";

const raw = process.env.NFC_TEST_DATABASE_URL;
if (!raw) throw new Error("NFC_TEST_DATABASE_URL is required (disposable local database only)");
const url = new URL(raw);
if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || url.pathname !== "/nfc_registry_qa") {
  throw new Error("Only the disposable local nfc_registry_qa database is allowed");
}
const db = new pg.Client({ connectionString: raw, connectionTimeoutMillis: 5000, statement_timeout: 10000 });
let checks = 0;
const actor = "10000000-0000-4000-8000-000000000001";
const tag = "20000000-0000-4000-8000-000000000001";
async function rejects(sql, expected) {
  await db.query("SAVEPOINT expected_failure");
  try {
    await assert.rejects(db.query(sql), expected);
    checks++;
  } finally {
    await db.query("ROLLBACK TO SAVEPOINT expected_failure");
    await db.query("RELEASE SAVEPOINT expected_failure");
  }
}
try {
  await db.connect();
  await db.query("BEGIN");
  await db.query(`
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    CREATE TABLE public.admin_users (admin_id uuid PRIMARY KEY);
    CREATE TABLE public.attractions (attraction_id bigint PRIMARY KEY);
    CREATE TABLE public.photo_spots (photo_spot_id bigint PRIMARY KEY);
    CREATE TABLE public.campaigns (campaign_id bigint PRIMARY KEY);
    CREATE TABLE public.checkin_codes (
      checkin_code_id bigint PRIMARY KEY, code text NOT NULL, attraction_id bigint NOT NULL,
      photo_spot_id bigint, campaign_id bigint
    );
    INSERT INTO public.admin_users VALUES ('${actor}');
    INSERT INTO public.attractions VALUES (4), (5);
    INSERT INTO public.checkin_codes VALUES (10, 'yala-001', 4, NULL, NULL);
  `);
  await db.query(await readFile(new URL("../supabase/migrations/20260904000000_add_nfc_tag_registry.sql", import.meta.url), "utf8"));
  await rejects(`INSERT INTO public.nfc_tags (checkin_code_id, label, created_by, updated_by, last_change_reason, status)
    VALUES (10, 'Unsafe', '${actor}', '${actor}', 'test', 'active')`, /NFC_DRAFT_REQUIRED/);
  await db.query(`INSERT INTO public.nfc_tags (nfc_tag_id, checkin_code_id, label, created_by, updated_by, last_change_reason)
    VALUES ('${tag}', 10, 'Yala entrance', '${actor}', '${actor}', 'Provision QA tag')`);
  const initial = (await db.query("SELECT * FROM public.nfc_tags")).rows[0];
  assert.equal(initial.code_snapshot, "yala-001");
  assert.equal(initial.attraction_id_snapshot, "4");
  assert.equal(initial.version, 1);
  assert.ok(initial.public_token);
  checks += 4;
  await rejects(`UPDATE public.nfc_tags SET status='active' WHERE nfc_tag_id='${tag}'`, /NFC_VERIFICATION_REQUIRED/);
  await rejects(`UPDATE public.nfc_tags SET checkin_code_id=11 WHERE nfc_tag_id='${tag}'`, /NFC_ASSIGNMENT_IMMUTABLE/);
  await rejects(`UPDATE public.nfc_tags SET attraction_id_snapshot=5 WHERE nfc_tag_id='${tag}'`, /NFC_ASSIGNMENT_IMMUTABLE/);
  await rejects(`UPDATE public.nfc_tags SET public_token=gen_random_uuid() WHERE nfc_tag_id='${tag}'`, /NFC_ASSIGNMENT_IMMUTABLE/);
  await db.query(`UPDATE public.nfc_tags SET verified_at=now(), verified_by='${actor}',
    verification_reference='QA read-back evidence', last_change_reason='Verified payload'
    WHERE nfc_tag_id='${tag}'`);
  await db.query(`UPDATE public.nfc_tags SET status='active', last_change_reason='Activate verified tag' WHERE nfc_tag_id='${tag}'`);
  await rejects(`UPDATE public.nfc_tags SET status='draft' WHERE nfc_tag_id='${tag}'`, /NFC_INVALID_TRANSITION/);
  await rejects(`UPDATE public.nfc_tags SET verified_at=NULL, verified_by=NULL, verification_reference=NULL WHERE nfc_tag_id='${tag}'`, /NFC_VERIFICATION_IMMUTABLE/);
  await rejects(`INSERT INTO public.nfc_tags (checkin_code_id, label, created_by, updated_by, last_change_reason, replaces_tag_id)
    VALUES (10, 'Replacement', '${actor}', '${actor}', 'Replace tag', '${tag}')`, /NFC_REPLACEMENT_REQUIRES_REVOCATION/);
  await db.query(`UPDATE public.nfc_tags SET status='inactive', last_change_reason='Inspection' WHERE nfc_tag_id='${tag}'`);
  await db.query(`UPDATE public.nfc_tags SET status='active', last_change_reason='Inspection passed' WHERE nfc_tag_id='${tag}'`);
  await db.query(`UPDATE public.nfc_tags SET status='revoked', last_change_reason='Damaged tag' WHERE nfc_tag_id='${tag}'`);
  await rejects(`UPDATE public.nfc_tags SET status='active' WHERE nfc_tag_id='${tag}'`, /NFC_REVOKED_IMMUTABLE/);
  await rejects(`DELETE FROM public.nfc_tags WHERE nfc_tag_id='${tag}'`, /NFC_HISTORY_IMMUTABLE/);
  const events = (await db.query("SELECT event_type, version FROM public.nfc_tag_events ORDER BY version")).rows;
  assert.deepEqual(events.map((row) => row.event_type), ["registered", "verified", "activated", "deactivated", "activated", "revoked"]);
  assert.deepEqual(events.map((row) => row.version), [1, 2, 3, 4, 5, 6]);
  checks += 2;
  await db.query(`INSERT INTO public.nfc_tags (checkin_code_id, label, created_by, updated_by, last_change_reason, replaces_tag_id)
    VALUES (10, 'Replacement', '${actor}', '${actor}', 'Replace revoked tag', '${tag}')`);
  const replacement = (await db.query("SELECT * FROM public.nfc_tags WHERE replaces_tag_id=$1", [tag])).rows[0];
  assert.notEqual(replacement.public_token, initial.public_token);
  assert.equal(replacement.status, "draft");
  checks += 2;
  await rejects(`INSERT INTO public.nfc_tags (checkin_code_id, label, created_by, updated_by, last_change_reason, replaces_tag_id)
    VALUES (10, 'Duplicate replacement', '${actor}', '${actor}', 'test', '${tag}')`, /duplicate key/);
  for (const role of ["anon", "authenticated"]) {
    await db.query(`SET LOCAL ROLE ${role}`);
    await rejects("SELECT * FROM public.nfc_tags", /permission denied/);
    await rejects("SELECT * FROM public.nfc_tag_events", /permission denied/);
    await db.query("RESET ROLE");
  }
  await db.query("SET LOCAL ROLE service_role");
  assert.equal((await db.query("SELECT * FROM public.nfc_tags")).rowCount, 2);
  checks++;
  // The server may update a draft, but only the trigger may append its audit.
  await db.query(`UPDATE public.nfc_tags SET label='Verified staff edit', last_change_reason='Correct asset label',
    updated_by='${actor}' WHERE nfc_tag_id='${replacement.nfc_tag_id}'`);
  const staffEvents = (await db.query("SELECT event_type FROM public.nfc_tag_events WHERE nfc_tag_id=$1 ORDER BY version", [replacement.nfc_tag_id])).rows;
  assert.deepEqual(staffEvents.map((row) => row.event_type), ["registered", "updated"]);
  checks++;
  await rejects(`INSERT INTO public.nfc_tag_events (nfc_tag_id, event_type, status, version, actor_id, reason)
    VALUES ('${tag}', 'updated', 'active', 99, '${actor}', 'forged')`, /permission denied/);
  await rejects("UPDATE public.nfc_tag_events SET reason='tampered'", /permission denied/);
  await rejects("DELETE FROM public.nfc_tags", /permission denied/);
  await db.query("RESET ROLE");
  await rejects("DELETE FROM public.nfc_tag_events", /NFC_HISTORY_IMMUTABLE/);
  console.log(`NFC registry: ${checks} PostgreSQL assertions passed. All fixtures rolled back.`);
} finally {
  await db.query("ROLLBACK").catch(() => undefined);
  await db.end();
}
