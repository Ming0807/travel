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
  // Real consent creation is exercised later after adding its table dependencies.
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
  // Replacement invariants must also hold for direct service-role writes.
  await db.query(await readFile(new URL("../supabase/migrations/20260907000000_guard_nfc_replacement_code.sql", import.meta.url), "utf8"));
  const originalId = "30000000-0000-4000-8000-000000000010";
  await db.query("INSERT INTO public.checkin_codes (checkin_code_id,code,attraction_id) VALUES (11,'other-entry',5)");
  await db.query(`INSERT INTO public.nfc_tags (nfc_tag_id,checkin_code_id,label,created_by,updated_by,last_change_reason)
    VALUES ('${originalId}',10,'Replacement original','${actor}','${actor}','QA replacement original')`);
  const replacementSql = (code = 10) => `INSERT INTO public.nfc_tags
    (checkin_code_id,label,created_by,updated_by,last_change_reason,replaces_tag_id)
    VALUES (${code},'Successor','${actor}','${actor}','QA replacement','${originalId}') RETURNING nfc_tag_id,status`;
  await rejects(db, replacementSql(), /NFC_REPLACEMENT_REQUIRES_REVOCATION/);
  await db.query(`UPDATE public.nfc_tags SET status='revoked',last_change_reason='QA damaged tag' WHERE nfc_tag_id='${originalId}'`);
  await db.query("SET ROLE service_role");
  await rejects(db, replacementSql(11), /NFC_REPLACEMENT_CODE_MISMATCH/);
  await db.query("RESET ROLE");
  const competitor = client();
  await competitor.connect();
  try {
    const outcomes = await Promise.allSettled([db.query(replacementSql()), competitor.query(replacementSql())]);
    assert.equal(outcomes.filter((result) => result.status === "fulfilled").length, 1); checks++;
    const failed = outcomes.find((result) => result.status === "rejected");
    assert.equal(failed.reason.code, "23505"); checks++;
    const successors = (await db.query("SELECT status,verified_at FROM public.nfc_tags WHERE replaces_tag_id=$1", [originalId])).rows;
    assert.equal(successors.length, 1); checks++;
    assert.equal(successors[0].status, "draft"); checks++;
    assert.equal(successors[0].verified_at, null); checks++;
    assert.equal((await db.query(`SELECT count(*)::int AS count FROM public.nfc_tag_events e
      JOIN public.nfc_tags t USING (nfc_tag_id) WHERE t.replaces_tag_id=$1 AND e.event_type='registered'`, [originalId])).rows[0].count, 1); checks++;
    await rejects(db, `UPDATE public.nfc_tags SET status='active',last_change_reason='QA forbidden resurrection' WHERE nfc_tag_id='${originalId}'`, /NFC_REVOKED_IMMUTABLE/);
  } finally { await competitor.end(); }
  for (const role of ["anon", "authenticated", "service_role"]) {
    assert.equal((await db.query("SELECT has_function_privilege($1,'public.guard_nfc_replacement_code()','EXECUTE') AS allowed", [role])).rows[0].allowed, false); checks++;
  }
  // Exercise the real link RPC against a minimal session schema, not a link stub.
  await db.query(`CREATE TABLE public.research_sessions (
    research_session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), public_session_code uuid UNIQUE NOT NULL,
    access_token_hash text NOT NULL, participant_type text NOT NULL DEFAULT 'tourist', status text NOT NULL DEFAULT 'consented',
    withdrawn_at timestamptz, visit_id uuid REFERENCES public.visits, tourist_id uuid REFERENCES public.tourists,
    checkin_code_id bigint NOT NULL, started_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  await db.query(await readFile(new URL("../supabase/migrations/20260907001000_guard_research_visit_rebinding.sql", import.meta.url), "utf8"));
  const researchCode = "40000000-0000-4000-8000-000000000001";
  const linkVisits = (await db.query(`INSERT INTO public.visits (tourist_id,attraction_id,checkin_code_id,completion_status)
    VALUES ('${tourist}',4,10,'started'),('${tourist}',4,10,'started') RETURNING visit_id`)).rows;
  await db.query("INSERT INTO public.research_sessions (public_session_code,access_token_hash,checkin_code_id) VALUES ($1,$2,10)", [researchCode,browserA]);
  const link = async (connection, visitId, token = browserA, owner = tourist) => (await connection.query(
    "SELECT public.link_research_session_visit($1,$2,$3,$4) AS result", [researchCode,token,visitId,owner])).rows[0].result;
  assert.equal((await link(db,linkVisits[0].visit_id,browserB)).success,false); checks++;
  assert.equal((await link(db,linkVisits[0].visit_id,browserA,otherTourist)).success,false); checks++;
  const linker = client();
  await linker.connect();
  try {
    const results = await Promise.all([link(db,linkVisits[0].visit_id),link(linker,linkVisits[1].visit_id)]);
    assert.equal(results.filter((result) => result.success).length,1); checks++;
    assert.equal(results.find((result) => !result.success).error_code,'RESEARCH_VISIT_MISMATCH'); checks++;
  } finally { await linker.end(); }
  const snapshot = async () => (await db.query("SELECT * FROM public.research_sessions WHERE public_session_code=$1",[researchCode])).rows[0];
  const linked = await snapshot();
  assert.equal((await link(db,linked.visit_id)).success,true); checks++;
  assert.deepEqual(await snapshot(),linked); checks++;
  await db.query("UPDATE public.research_sessions SET status='completed' WHERE public_session_code=$1",[researchCode]);
  const completed = await snapshot();
  assert.equal((await link(db,completed.visit_id)).success,true); checks++;
  assert.deepEqual(await snapshot(),completed); checks++;
  await db.query("UPDATE public.research_sessions SET status='withdrawn',withdrawn_at=now() WHERE public_session_code=$1",[researchCode]);
  assert.equal((await link(db,completed.visit_id)).success,false); checks++;
  for (const role of ['anon','authenticated']) {
    await db.query(`SET ROLE ${role}`);
    await assert.rejects(link(db,completed.visit_id),/permission denied/); checks++;
    await db.query('RESET ROLE');
  }
  await db.query(`ALTER TABLE public.research_studies ADD COLUMN retention_until timestamptz;
    ALTER TABLE public.research_sessions ADD COLUMN study_id uuid REFERENCES public.research_studies(research_study_id),
      ADD COLUMN withdrawal_token_hash text, ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    UPDATE public.research_sessions SET study_id='${actor}',withdrawal_token_hash='${browserB}',status='completed',withdrawn_at=NULL;
    UPDATE public.research_studies SET retention_until=now()+interval '7 days' WHERE research_study_id='${actor}'`);
  await db.query(await readFile(new URL("../supabase/migrations/20260907002000_add_research_browser_grants.sql",import.meta.url),"utf8"));
  const grantBrowser = 'c'.repeat(64);
  const bind = async (connection=db, code=researchCode, access=browserA, withdrawal=browserB) => (await connection.query(
    'SELECT public.bind_research_browser_grant($1,$2,$3,$4) AS ok',[grantBrowser,code,access,withdrawal])).rows[0].ok;
  const resolveGrant = async (hash=grantBrowser, code=researchCode) => (await db.query(
    'SELECT * FROM public.resolve_research_browser_grant($1,$2)',[hash,code])).rows;
  assert.equal(await bind(db,researchCode,browserB),false); checks++;
  assert.equal(await bind(db,researchCode,browserA,browserA),false); checks++;
  const grantWriter=client(); await grantWriter.connect();
  try { assert.deepEqual(await Promise.all([bind(db),bind(grantWriter)]),[true,true]); checks++; }
  finally { await grantWriter.end(); }
  const grants=await db.query('SELECT * FROM public.research_browser_grants');
  assert.equal(grants.rowCount,1); checks++;
  assert.equal(grants.rows[0].expires_at.getTime(),(await db.query('SELECT retention_until FROM public.research_studies WHERE research_study_id=$1',[actor])).rows[0].retention_until.getTime()); checks++;
  assert.equal((await resolveGrant()).length,1); checks++;
  assert.equal((await resolveGrant('d'.repeat(64))).length,0); checks++;
  await db.query('UPDATE public.research_sessions SET access_token_hash=$1 WHERE public_session_code=$2',['e'.repeat(64),researchCode]);
  assert.equal((await resolveGrant())[0].access_token_hash,'e'.repeat(64)); checks++;
  const secondResearch='40000000-0000-4000-8000-000000000002';
  await db.query(`INSERT INTO public.research_sessions(public_session_code,access_token_hash,withdrawal_token_hash,checkin_code_id,study_id)
    VALUES($1,$2,$3,10,$4)`,[secondResearch,browserA,browserB,actor]);
  assert.equal(await bind(db,secondResearch),true); checks++;
  await db.query('SELECT public.revoke_research_browser_grant($1,$2)',[grantBrowser,researchCode]);
  assert.equal((await resolveGrant()).length,0); checks++;
  assert.equal((await resolveGrant(grantBrowser,secondResearch)).length,1); checks++;
  assert.equal(await bind(db,researchCode,'e'.repeat(64)),false); checks++;
  await db.query("UPDATE public.research_sessions SET status='withdrawn',withdrawn_at=now() WHERE public_session_code=$1",[secondResearch]);
  assert.equal((await resolveGrant(grantBrowser,secondResearch)).length,0); checks++;
  assert.equal(await bind(db,secondResearch),false); checks++;
  for (const role of ['anon','authenticated']) {
    await db.query(`SET ROLE ${role}`);
    await assert.rejects(bind(),/permission denied/); checks++;
    await assert.rejects(resolveGrant(),/permission denied/); checks++;
    await rejects(db,'SELECT * FROM public.research_browser_grants',/permission denied/);
    await db.query('RESET ROLE');
  }
  await db.query('SET ROLE service_role');
  await rejects(db,'SELECT * FROM public.research_browser_grants',/permission denied/);
  await db.query('RESET ROLE');
  await db.query("UPDATE public.research_sessions SET status='consented',withdrawn_at=NULL,created_at=now()-interval '31 days' WHERE public_session_code=$1",[secondResearch]);
  assert.equal(await bind(db,secondResearch),false); checks++;
  await db.query("UPDATE public.research_studies SET retention_until=now()-interval '1 second' WHERE research_study_id=$1",[actor]);
  assert.equal((await resolveGrant(grantBrowser,secondResearch)).length,0); checks++;
  await db.query("UPDATE public.research_browser_grants SET created_at=now()-interval '2 days',expires_at=now()-interval '1 day'");
  assert.equal((await resolveGrant()).length,0); checks++;
  assert.equal((await db.query('SELECT public.cleanup_expired_research_browser_grants(500) AS count')).rows[0].count,0); checks++;
  await db.query("UPDATE public.research_browser_grants SET created_at=now()-interval '31 days'");
  await rejects(db,'SELECT public.cleanup_expired_research_browser_grants(1001)',/RESEARCH_GRANT_CLEANUP_LIMIT_INVALID/);
  assert.equal((await db.query('SELECT public.cleanup_expired_research_browser_grants(1) AS count')).rows[0].count,1); checks++;
  assert.equal((await db.query('SELECT count(*)::int AS count FROM public.research_browser_grants')).rows[0].count,1); checks++;
  assert.equal((await db.query('SELECT public.cleanup_expired_research_browser_grants(500) AS count')).rows[0].count,1); checks++;
  // Exact entry binding: use the real wrapper/trigger around a consent-write stub.
  // The stub deliberately returns one session on retry to exercise collision rollback.
  await db.query(await readFile(new URL('../supabase/migrations/20260907003000_correlate_research_entry_sessions.sql', import.meta.url), 'utf8'));
  const entryResearchCode = '40000000-0000-4000-8000-000000000003';
  await db.query(`CREATE OR REPLACE FUNCTION public.accept_research_invitation(text,text,text,text,text,text)
    RETURNS jsonb LANGUAGE plpgsql AS $$ BEGIN
      INSERT INTO public.research_sessions(public_session_code,access_token_hash,withdrawal_token_hash,study_id,checkin_code_id)
        VALUES ('${entryResearchCode}',$4,$5,'${actor}',10)
        ON CONFLICT (public_session_code) DO UPDATE SET access_token_hash=$4,withdrawal_token_hash=$5;
      RETURN jsonb_build_object('success',true,'public_session_code','${entryResearchCode}');
    END; $$`);
  const boundEntry = await newScopedEntry();
  const otherEntry = await newScopedEntry();
  const acceptBound = async (connection, id = boundEntry.entry_session_id, token = browserA) =>
    (await connection.query("SELECT public.accept_entry_research_invitation($1,'entry-study','yala-001',$2,$3,$3,'th') AS result",[id,browserA,token])).rows[0].result;
  assert.equal((await acceptBound(db)).success,true); checks++;
  const boundSnapshot = async () => (await db.query('SELECT * FROM public.research_sessions WHERE public_session_code=$1',[entryResearchCode])).rows[0];
  assert.equal((await boundSnapshot()).entry_session_id,boundEntry.entry_session_id); checks++;
  const acceptingTab = client();
  await acceptingTab.connect();
  try {
    const results = await Promise.all([acceptBound(db),acceptBound(acceptingTab)]);
    assert.equal(results.every((result) => result.success),true); checks++;
  } finally { await acceptingTab.end(); }
  const beforeWrongEntry = await boundSnapshot();
  await assert.rejects(acceptBound(db,otherEntry.entry_session_id,browserB),/RESEARCH_ENTRY_IMMUTABLE/); checks++;
  assert.deepEqual(await boundSnapshot(),beforeWrongEntry); checks++;
  const bindVisit = async (visitId) => (await db.query('SELECT public.link_research_session_visit($1,$2,$3,$4) AS result',
    [entryResearchCode,browserA,visitId,tourist])).rows[0].result;
  await assert.rejects(bindVisit(linkVisits[0].visit_id),/RESEARCH_ENTRY_MISMATCH/); checks++;
  assert.equal((await boundSnapshot()).visit_id,null); checks++;
  const exactVisit = (await db.query('SELECT public.create_checkin_entry_visit($1,$2,$3,$4) AS id',
    [boundEntry.entry_session_id,boundEntry.browser_hash,'yala-001',tourist])).rows[0].id;
  assert.equal((await bindVisit(exactVisit)).success,true); checks++;
  const exactSnapshot = await boundSnapshot();
  assert.equal((await bindVisit(exactVisit)).success,true); checks++;
  assert.deepEqual(await boundSnapshot(),exactSnapshot); checks++;
  await rejects(db,`UPDATE public.research_sessions SET entry_session_id=NULL WHERE public_session_code='${entryResearchCode}'`,/RESEARCH_ENTRY_IMMUTABLE/);
  await rejects(db,`UPDATE public.research_sessions SET visit_id='${linkVisits[1].visit_id}' WHERE public_session_code='${entryResearchCode}'`,/RESEARCH_ENTRY_MISMATCH/);
  assert.equal((await db.query('SELECT entry_session_id FROM public.research_sessions WHERE public_session_code=$1',[researchCode])).rows[0].entry_session_id,null); checks++;
  for (const role of ['anon','authenticated','service_role']) {
    assert.equal((await db.query("SELECT has_function_privilege($1,'public.guard_research_entry_binding()','EXECUTE') AS allowed",[role])).rows[0].allowed,false); checks++;
  }
  await db.query(await readFile(new URL('../supabase/migrations/20260907004000_resolve_research_grant_context.sql',import.meta.url),'utf8'));
  await db.query("UPDATE public.research_studies SET retention_until=now()+interval '7 days' WHERE research_study_id=$1",[actor]);
  assert.equal(await bind(db,entryResearchCode,browserA,browserA),true); checks++;
  const resolveContext = async (kind='visit', id=exactVisit, browser=grantBrowser) =>
    (await db.query('SELECT * FROM public.resolve_research_browser_context($1,$2,$3)',[browser,kind,id])).rows;
  assert.equal((await resolveContext())[0].public_session_code,entryResearchCode); checks++;
  assert.equal((await resolveContext('entry',boundEntry.entry_session_id))[0].visit_id,exactVisit); checks++;
  assert.equal((await resolveContext('entry',otherEntry.entry_session_id)).length,0); checks++;
  assert.equal((await resolveContext('visit',exactVisit,browserB)).length,0); checks++;
  assert.equal((await resolveContext('invalid')).length,0); checks++;
  const ambiguousCode='40000000-0000-4000-8000-000000000004';
  await db.query(`INSERT INTO public.research_sessions(public_session_code,access_token_hash,withdrawal_token_hash,
    study_id,checkin_code_id,entry_session_id) VALUES($1,$2,$2,$3,10,$4)`,[ambiguousCode,browserA,actor,boundEntry.entry_session_id]);
  assert.equal(await bind(db,ambiguousCode,browserA,browserA),true); checks++;
  assert.equal((await resolveContext('entry',boundEntry.entry_session_id)).length,0); checks++;
  await db.query('SELECT public.revoke_research_browser_grant($1,$2)',[grantBrowser,ambiguousCode]);
  assert.equal((await resolveContext('entry',boundEntry.entry_session_id)).length,1); checks++;
  await db.query("UPDATE public.research_sessions SET status='withdrawn',withdrawn_at=now() WHERE public_session_code=$1",[entryResearchCode]);
  assert.equal((await resolveContext()).length,0); checks++;
  for (const role of ['anon','authenticated']) {
    await db.query(`SET ROLE ${role}`);
    await assert.rejects(resolveContext(),/permission denied/); checks++;
    await db.query('RESET ROLE');
  }
  await db.query(await readFile(new URL('../supabase/migrations/20260907005000_accept_research_browser_grant.sql',import.meta.url),'utf8'));
  const coreSql=await readFile(new URL('../supabase/migrations/20260808000000_add_research_core.sql',import.meta.url),'utf8');
  const section=(start,end)=>{
    const from=coreSql.indexOf(start),to=coreSql.indexOf(end,from+start.length);
    assert.ok(from>=0 && to>from,'Research migration section markers must remain valid');
    return coreSql.slice(from,to);
  };
  await db.query(`ALTER TABLE public.research_studies ADD COLUMN consent_version text DEFAULT 'qa-v1',
      ADD COLUMN notice_version text DEFAULT 'qa-v1';
    ALTER TABLE public.research_sessions ADD COLUMN operational_session_hash text,
      ADD COLUMN collection_mode text, ADD COLUMN inclusion_status text, ADD COLUMN consented_at timestamptz;
    ALTER TABLE public.research_sessions ALTER COLUMN public_session_code SET DEFAULT gen_random_uuid();
    CREATE UNIQUE INDEX qa_research_operational_session ON public.research_sessions(study_id,operational_session_hash)
      WHERE operational_session_hash IS NOT NULL AND status NOT IN ('withdrawn','excluded','expired');`);
  await db.query(section('CREATE TABLE public.research_consents (','CREATE TABLE public.research_responses ('));
  await db.query(section('CREATE OR REPLACE FUNCTION public.accept_research_invitation(',
    'CREATE OR REPLACE FUNCTION public.link_research_session_visit('));
  const atomicEntry=await newScopedEntry();
  const atomicAccept=async (connection=db, token=browserA, browser=grantBrowser, entryBrowser=atomicEntry.browser_hash, operationalHash=browserA) =>
    (await connection.query("SELECT public.accept_research_browser_invitation($1,$2,$3,'entry-study','yala-001',$4,$5,$5,'th') AS result",
      [browser,entryBrowser,atomicEntry.entry_session_id,operationalHash,token])).rows[0].result;
  assert.equal((await atomicAccept(db,browserA,grantBrowser,'bad')).success,false); checks++;
  assert.equal((await atomicAccept(db,browserA,grantBrowser,browserB)).success,false); checks++;
  // No consent survives a failed grant bind (retention gate).
  await db.query("UPDATE public.research_studies SET retention_until=now()-interval '1 second' WHERE research_study_id=$1",[actor]);
  await assert.rejects(atomicAccept(),/RESEARCH_GRANT_BIND_FAILED/); checks++;
  assert.equal((await db.query('SELECT 1 FROM public.research_sessions WHERE entry_session_id=$1',[atomicEntry.entry_session_id])).rowCount,0); checks++;
  assert.equal((await db.query('SELECT 1 FROM public.research_consents')).rowCount,0); checks++;
  await db.query("UPDATE public.research_studies SET retention_until=now()+interval '7 days' WHERE research_study_id=$1",[actor]);
  const atomicWriter=client(); await atomicWriter.connect();
  try {
    const results=await Promise.all([atomicAccept(db,browserA),atomicAccept(atomicWriter,browserB)]);
    assert.equal(results.every((result)=>result.success),true); checks++;
  } finally { await atomicWriter.end(); }
  const atomicSnapshot=async ()=>(await db.query('SELECT * FROM public.research_sessions WHERE entry_session_id=$1',[atomicEntry.entry_session_id])).rows[0];
  const stable=await atomicSnapshot();
  const consents=async ()=>(await db.query('SELECT purpose_key,consent_version,notice_version,has_consented,language FROM public.research_consents WHERE research_session_id=$1 ORDER BY purpose_key',[stable.research_session_id])).rows;
  const originalConsents=await consents();
  assert.deepEqual(originalConsents.map((row)=>row.purpose_key),['research_behavioral_correlation','research_evaluation']); checks++;
  assert.equal(originalConsents.every((row)=>row.has_consented && row.language==='th' && row.consent_version==='qa-v1' && row.notice_version==='qa-v1'),true); checks++;
  assert.equal((await resolveContext('entry',atomicEntry.entry_session_id)).length,1); checks++;
  assert.equal((await atomicAccept(db,'f'.repeat(64))).success,true); checks++;
  assert.equal((await atomicSnapshot()).access_token_hash,stable.access_token_hash); checks++;
  assert.equal((await atomicSnapshot()).withdrawal_token_hash,stable.withdrawal_token_hash); checks++;
  assert.deepEqual(await consents(),originalConsents); checks++;
  assert.equal((await atomicAccept(db,browserA,grantBrowser,atomicEntry.browser_hash,'invalid')).error_code,'RESEARCH_INVITATION_INVALID'); checks++;
  await assert.rejects(atomicAccept(db,browserA,grantBrowser,atomicEntry.browser_hash,browserB),/RESEARCH_GRANT_SESSION_MISMATCH/); checks++;
  assert.equal((await db.query('SELECT 1 FROM public.research_sessions WHERE entry_session_id=$1',[atomicEntry.entry_session_id])).rowCount,1); checks++;
  assert.deepEqual(await consents(),originalConsents); checks++;
  assert.equal((await atomicAccept(db,browserA,'d'.repeat(64))).error_code,'RESEARCH_GRANT_MIGRATION_REQUIRED'); checks++;
  await db.query("UPDATE public.research_studies SET frozen_at=frozen_at+interval '1 second' WHERE research_study_id=$1",[actor]);
  assert.equal((await atomicAccept()).error_code,'RESEARCH_STUDY_UNAVAILABLE'); checks++;
  assert.equal((await atomicSnapshot()).access_token_hash,stable.access_token_hash); checks++;
  for (const role of ['anon','authenticated']) {
    await db.query(`SET ROLE ${role}`);
    await assert.rejects(atomicAccept(),/permission denied/); checks++;
    await db.query('RESET ROLE');
  }
  console.log(`Check-in entry sessions: ${checks} PostgreSQL assertions passed.`);
} finally {
  await db.end().catch(() => undefined);
}
