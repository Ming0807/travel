// Run only against a disposable local PostgreSQL database named entry_session_qa.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import pg from "pg";

const connectionString = process.env.ENTRY_SESSION_TEST_DATABASE_URL;
if (!connectionString) throw new Error("ENTRY_SESSION_TEST_DATABASE_URL is required");
const url = new URL(connectionString);
if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || url.pathname !== "/entry_session_qa") {
  throw new Error("Only the disposable local entry_session_qa database is allowed");
}
const client = () => new pg.Client({ connectionString, connectionTimeoutMillis: 5000, statement_timeout: 10000 });
const db = client();
const actor = "10000000-0000-4000-8000-000000000001";
const tourist = "20000000-0000-4000-8000-000000000001";
const otherTourist = "20000000-0000-4000-8000-000000000002";
const tagId = "30000000-0000-4000-8000-000000000001";
const browserA = "a".repeat(64);
const browserB = "b".repeat(64);
let checks = 0;
async function rejects(queryable, sql, expected) {
  await assert.rejects(queryable.query(sql), expected);
  checks++;
}
try {
  await db.connect();
  await db.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    CREATE TABLE public.admin_users (admin_id uuid PRIMARY KEY);
    CREATE TABLE public.attractions (attraction_id bigint PRIMARY KEY, is_public boolean NOT NULL DEFAULT true);
    CREATE TABLE public.photo_spots (photo_spot_id bigint PRIMARY KEY, attraction_id bigint NOT NULL, is_active boolean NOT NULL DEFAULT true);
    CREATE TABLE public.tourists (tourist_id uuid PRIMARY KEY);
    CREATE TABLE public.checkin_codes (
      checkin_code_id bigint PRIMARY KEY, code varchar(100) NOT NULL UNIQUE,
      attraction_id bigint NOT NULL, photo_spot_id bigint, campaign_id bigint,
      is_active boolean NOT NULL DEFAULT true, starts_at timestamptz, ends_at timestamptz
    );
    CREATE TABLE public.visits (
      visit_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tourist_id uuid NOT NULL REFERENCES public.tourists,
      attraction_id bigint NOT NULL, photo_spot_id bigint, checkin_code_id bigint,
      entry_channel varchar(30) NOT NULL DEFAULT 'unknown', completion_status varchar(50) NOT NULL
    );
    CREATE TABLE public.xp_events (
      xp_event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tourist_id uuid, visit_id uuid, xp_amount integer, metadata jsonb,
      xp_source varchar(100) NOT NULL CHECK (xp_source IN (
        'qr_checkin', 'photo_upload', 'certificate_generated', 'survey_completed',
        'stamp_earned', 'review_submitted', 'restaurant_visit', 'badge_earned', 'admin_award'
      ))
    );
    CREATE FUNCTION public.is_public_attraction(p_attraction_id bigint) RETURNS boolean
      LANGUAGE sql STABLE AS $$ SELECT EXISTS (SELECT 1 FROM public.attractions WHERE attraction_id=p_attraction_id AND is_public) $$;
    INSERT INTO public.admin_users VALUES ('${actor}');
    INSERT INTO public.attractions VALUES (4, true), (5, true);
    INSERT INTO public.photo_spots VALUES (8, 4, true);
    INSERT INTO public.tourists VALUES ('${tourist}'), ('${otherTourist}');
    INSERT INTO public.checkin_codes VALUES (10, 'yala-001', 4, 8, 7, true, NULL, NULL);
  `);
  await db.query(await readFile(new URL("../supabase/migrations/20260904000000_add_nfc_tag_registry.sql", import.meta.url), "utf8"));
  await db.query(await readFile(new URL("../supabase/migrations/20260904001000_add_checkin_entry_sessions.sql", import.meta.url), "utf8"));
  await db.query(await readFile(new URL("../supabase/migrations/20260905001000_guard_nfc_activation_assignment.sql", import.meta.url), "utf8"));
  await db.query("INSERT INTO public.xp_events (xp_source) VALUES ('nfc_checkin')");
  checks += 1;
  await assert.rejects(
    db.query("INSERT INTO public.xp_events (xp_source) VALUES ('client_claimed_channel')"),
    /xp_events_xp_source_check/,
  );
  checks += 1;
  await db.query(`INSERT INTO public.nfc_tags (nfc_tag_id, checkin_code_id, label, created_by, updated_by, last_change_reason)
    VALUES ('${tagId}', 10, 'Entrance', '${actor}', '${actor}', 'QA provision')`);
  await db.query(`UPDATE public.nfc_tags SET verified_at=now(), verified_by='${actor}',
    verification_reference='QA read back', last_change_reason='QA verify' WHERE nfc_tag_id='${tagId}'`);
  await db.query("UPDATE public.checkin_codes SET is_active=false WHERE checkin_code_id=10");
  await rejects(db, `UPDATE public.nfc_tags SET status='active', last_change_reason='QA activate' WHERE nfc_tag_id='${tagId}'`, /NFC_ASSIGNMENT_UNAVAILABLE/);
  await db.query("UPDATE public.checkin_codes SET is_active=true, campaign_id=99 WHERE checkin_code_id=10");
  await rejects(db, `UPDATE public.nfc_tags SET status='active', last_change_reason='QA activate' WHERE nfc_tag_id='${tagId}'`, /NFC_ASSIGNMENT_CHANGED/);
  await db.query("UPDATE public.checkin_codes SET campaign_id=7 WHERE checkin_code_id=10");
  await db.query(`UPDATE public.nfc_tags SET status='active', last_change_reason='QA activate' WHERE nfc_tag_id='${tagId}'`);

  const first = (await db.query("SELECT * FROM public.begin_checkin_entry($1,$2,$3,$4)", [browserA, "yala-001", "qr", null])).rows[0];
  const resumed = (await db.query("SELECT * FROM public.begin_checkin_entry($1,$2,$3,$4)", [browserA, "yala-001", "qr", null])).rows[0];
  assert.equal(first.was_created, true);
  assert.equal(resumed.was_created, false);
  assert.equal(first.entry_session_id, resumed.entry_session_id);
  checks += 3;
  const differentBrowser = (await db.query("SELECT * FROM public.begin_checkin_entry($1,$2,$3,$4)", [browserB, "yala-001", "qr", null])).rows[0];
  assert.notEqual(differentBrowser.entry_session_id, first.entry_session_id);
  const nfc = (await db.query("SELECT * FROM public.begin_checkin_entry($1,$2,$3,$4)", [browserA, "yala-001", "nfc", tagId])).rows[0];
  assert.notEqual(nfc.entry_session_id, first.entry_session_id);
  checks += 2;
  await rejects(db, `SELECT * FROM public.begin_checkin_entry('${browserA}','yala-001','nfc',NULL)`, /CHECKIN_ENTRY_INVALID/);
  await rejects(db, `SELECT * FROM public.read_checkin_entry('${first.entry_session_id}','${browserB}','yala-001')`, /CHECKIN_ENTRY_INVALID/);
  await rejects(db, `SELECT * FROM public.read_checkin_entry('${first.entry_session_id}','${browserA}','other')`, /CHECKIN_ENTRY_INVALID/);

  const db2 = client();
  await db2.connect();
  const [visitOne, visitTwo] = await Promise.all([
    db.query("SELECT public.create_checkin_entry_visit($1,$2,$3,$4) AS id", [first.entry_session_id, browserA, "yala-001", tourist]),
    db2.query("SELECT public.create_checkin_entry_visit($1,$2,$3,$4) AS id", [first.entry_session_id, browserA, "yala-001", tourist]),
  ]);
  assert.equal(visitOne.rows[0].id, visitTwo.rows[0].id);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM public.visits WHERE visit_id=$1", [visitOne.rows[0].id])).rows[0].count, 1);
  checks += 2;
  await rejects(db, `SELECT public.create_checkin_entry_visit('${first.entry_session_id}','${browserA}','yala-001','${otherTourist}')`, /CHECKIN_ENTRY_OWNER_MISMATCH/);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM public.xp_events WHERE visit_id=$1", [visitOne.rows[0].id])).rows[0].count, 1);
  checks += 1;
  await db2.end();

  await rejects(db, `UPDATE public.checkin_entry_sessions SET entry_channel='nfc' WHERE entry_session_id='${first.entry_session_id}'`, /CHECKIN_ENTRY_IMMUTABLE/);
  await rejects(db, `DELETE FROM public.checkin_entry_sessions WHERE entry_session_id='${first.entry_session_id}'`, /CHECKIN_ENTRY_IMMUTABLE/);
  // The trigger blocks direct clock changes; move both timestamps while keeping
  // expires_at after created_at to model an honestly expired historical row.
  await db.query("ALTER TABLE public.checkin_entry_sessions DISABLE TRIGGER protect_checkin_entry_context");
  await db.query("UPDATE public.checkin_entry_sessions SET created_at=now()-interval '3 hours', expires_at=now()-interval '1 hour' WHERE entry_session_id=$1", [differentBrowser.entry_session_id]);
  await db.query("ALTER TABLE public.checkin_entry_sessions ENABLE TRIGGER protect_checkin_entry_context");
  await rejects(db, `SELECT * FROM public.read_checkin_entry('${differentBrowser.entry_session_id}','${browserB}','yala-001')`, /CHECKIN_ENTRY_INVALID/);

  await db.query(`UPDATE public.nfc_tags SET status='revoked', last_change_reason='QA revoke' WHERE nfc_tag_id='${tagId}'`);
  await rejects(db, `SELECT * FROM public.read_checkin_entry('${nfc.entry_session_id}','${browserA}','yala-001')`, /CHECKIN_ENTRY_TAG_UNAVAILABLE/);
  await rejects(db, `SELECT * FROM public.begin_checkin_entry('${browserA}','yala-001','nfc','${tagId}')`, /CHECKIN_ENTRY_TAG_UNAVAILABLE/);

  await db.query("SET ROLE service_role");
  await rejects(db, `INSERT INTO public.checkin_entry_sessions (browser_hash,checkin_code_id,code_snapshot,attraction_id_snapshot,entry_channel)
    VALUES ('${browserA}',10,'yala-001',4,'qr')`, /permission denied/);
  await rejects(db, `UPDATE public.checkin_entry_sessions SET visit_id=NULL`, /permission denied/);
  await rejects(db, `DELETE FROM public.checkin_entry_sessions`, /permission denied/);
  await db.query("RESET ROLE");
  for (const role of ["anon", "authenticated"]) {
    await db.query(`SET ROLE ${role}`);
    await rejects(db, `SELECT * FROM public.begin_checkin_entry('${browserA}','yala-001','qr',NULL)`, /permission denied/);
    await db.query("RESET ROLE");
  }
  await db.query(`
    CREATE TABLE public.research_studies (
      research_study_id uuid PRIMARY KEY, status text, frozen_at timestamptz,
      starts_at timestamptz, ends_at timestamptz, study_kind text
    );
    CREATE TABLE public.research_checkin_codes (
      study_id uuid REFERENCES public.research_studies, checkin_code_id bigint,
      default_collection_mode text, is_active boolean, starts_at timestamptz, ends_at timestamptz,
      PRIMARY KEY(study_id, checkin_code_id)
    );
    INSERT INTO public.research_studies VALUES ('${actor}', 'active', now(), NULL, NULL, 'pilot');
    INSERT INTO public.research_checkin_codes VALUES ('${actor}', 10, 'pilot_internal', true, NULL, NULL);
  `);
  await db.query(await readFile(new URL("../supabase/migrations/20260905000000_snapshot_entry_research_scope.sql", import.meta.url), "utf8"));
  assert.equal((await db.query("SELECT evidence_scope FROM public.checkin_entry_sessions WHERE entry_session_id=$1", [first.entry_session_id])).rows[0].evidence_scope, "unknown");
  checks++;
  let browserCounter = 100;
  async function newScopedEntry() {
    const hash = (++browserCounter).toString(16).padStart(64, "0");
    const { rows } = await db.query("SELECT * FROM public.begin_checkin_entry($1,'yala-001','qr',NULL)", [hash]);
    return (await db.query("SELECT * FROM public.checkin_entry_sessions WHERE entry_session_id=$1", [rows[0].entry_session_id])).rows[0];
  }
  const pilotEntry = await newScopedEntry();
  assert.equal(pilotEntry.evidence_scope, "pilot_internal");
  assert.equal(pilotEntry.research_study_id_snapshot, actor);
  checks += 2;
  await db.query("UPDATE public.research_checkin_codes SET default_collection_mode='simulated_usability'");
  assert.equal((await newScopedEntry()).evidence_scope, "simulated_usability"); checks++;
  await db.query("UPDATE public.research_checkin_codes SET default_collection_mode='field_observation'");
  assert.equal((await newScopedEntry()).evidence_scope, "unknown"); checks++;
  await db.query("UPDATE public.research_studies SET study_kind='final_collection'");
  assert.equal((await newScopedEntry()).evidence_scope, "field_observation"); checks++;
  await db.query("UPDATE public.research_studies SET status='paused'");
  assert.equal((await newScopedEntry()).evidence_scope_reason, "deployment_unavailable"); checks++;
  await db.query("UPDATE public.research_studies SET status='active', frozen_at=NULL");
  assert.equal((await newScopedEntry()).evidence_scope, "unknown"); checks++;
  await db.query("UPDATE public.research_studies SET frozen_at=now()");
  await db.query("UPDATE public.research_checkin_codes SET ends_at=now()-interval '1 minute'");
  assert.equal((await newScopedEntry()).evidence_scope, "unknown"); checks++;
  await db.query("UPDATE public.research_checkin_codes SET ends_at=NULL");
  await db.query(`INSERT INTO public.research_studies VALUES ('${tourist}', 'active', now(), NULL, NULL, 'pilot');
    INSERT INTO public.research_checkin_codes VALUES ('${tourist}',10,'pilot_internal',true,NULL,NULL)`);
  assert.equal((await newScopedEntry()).evidence_scope_reason, "ambiguous_deployment"); checks++;
  assert.equal((await db.query("SELECT evidence_scope FROM public.checkin_entry_sessions WHERE entry_session_id=$1", [pilotEntry.entry_session_id])).rows[0].evidence_scope, "pilot_internal"); checks++;
  await rejects(db, `UPDATE public.checkin_entry_sessions SET evidence_scope='field_observation' WHERE entry_session_id='${pilotEntry.entry_session_id}'`, /CHECKIN_ENTRY_IMMUTABLE/);
  // Minimal legacy-consent stub tests the new wrapper's SQL gate independently.
  // Real consent creation remains covered by research-core integration tests.
  await db.query(`ALTER TABLE public.research_studies ADD COLUMN study_code text;
    UPDATE public.research_studies SET study_code='entry-study', frozen_at=now() WHERE research_study_id='${actor}';
    DELETE FROM public.research_checkin_codes WHERE study_id='${tourist}';
    CREATE FUNCTION public.accept_research_invitation(text,text,text,text,text,text) RETURNS jsonb
    LANGUAGE sql AS 'SELECT jsonb_build_object(''success'',true,''legacy_called'',true)';`);
  await db.query(await readFile(new URL("../supabase/migrations/20260906000000_bind_entry_research_acceptance.sql", import.meta.url), "utf8"));
  const acceptedEntry = await newScopedEntry();
  async function acceptEntry(connection = db, id = acceptedEntry.entry_session_id) {
    return (await connection.query("SELECT public.accept_entry_research_invitation($1,'entry-study','yala-001',$2,$2,$2,'th') AS result", [id, browserA])).rows[0].result;
  }
  assert.equal((await acceptEntry()).legacy_called, true); checks++;
  assert.equal((await acceptEntry(db, first.entry_session_id)).success, false); checks++;
  await db.query("UPDATE public.research_checkin_codes SET default_collection_mode='simulated_usability'");
  assert.equal((await acceptEntry()).success, false); checks++;
  await db.query("UPDATE public.research_checkin_codes SET default_collection_mode='field_observation'");
  const writer = client();
  await writer.connect();
  try {
    await writer.query("BEGIN");
    await writer.query("UPDATE public.research_studies SET frozen_at=frozen_at+interval '1 second' WHERE study_code='entry-study'");
    // Acceptance waits on the row lock and must inspect the committed new freeze.
    const accepting = acceptEntry();
    await writer.query("COMMIT");
    assert.equal((await accepting).success, false); checks++;
  } finally {
    await writer.end();
  }
  for (const role of ["anon", "authenticated"]) {
    await db.query(`SET ROLE ${role}`);
    await rejects(db, `SELECT public.accept_entry_research_invitation('${acceptedEntry.entry_session_id}','entry-study','yala-001','${browserA}','${browserA}','${browserA}','th')`, /permission denied/);
    await db.query("RESET ROLE");
  }
  console.log(`Check-in entry sessions: ${checks} PostgreSQL assertions passed.`);
} finally {
  await db.end().catch(() => undefined);
}
