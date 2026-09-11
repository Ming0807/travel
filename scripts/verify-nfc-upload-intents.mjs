import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import pg from "pg";

const name = `tourism-nfc-intent-qa-${randomUUID().slice(0, 8)}`;
const migration = "supabase/migrations/20260910000000_prepare_nfc_evidence_upload_intents.sql";
const actor = randomUUID(); const other = randomUUID(); const tag = randomUUID();
const clients = [];
let started = false;
let checks = 0;
function docker(args) {
  const result = spawnSync("docker", args, { encoding: "utf8", timeout: 120000 });
  if (result.status !== 0) throw new Error(`Docker ${args[0]} failed: ${result.stderr || result.error}`);
  return result.stdout.trim();
}
const sql = "select * from public.prepare_nfc_evidence_upload($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)";
const input = () => [randomUUID(),tag,1,actor,"supabase","local-project","nfc-evidence","a".repeat(64),1000,640,480];
async function rejected(db, values, pattern) { await assert.rejects(db.query(sql,values), pattern); checks++; }
try {
  docker(["run","-d","--name",name,"-p","127.0.0.1::5432","-e","POSTGRES_HOST_AUTH_METHOD=trust",
    "-e","POSTGRES_DB=nfc_intent_qa","postgres:16"]); started = true;
  const port = docker(["port",name,"5432/tcp"]).match(/^127\.0\.0\.1:(\d+)$/)?.[1];
  if (!port) throw new Error("Expected disposable loopback database");
  const config = { host: "127.0.0.1", port: Number(port), user: "postgres", database: "nfc_intent_qa", connectionTimeoutMillis: 2000, statement_timeout: 10000 };
  let db;
  for (let attempt=0; attempt<60; attempt++) {
    const candidate = new pg.Client(config);
    try { await candidate.connect(); db=candidate; clients.push(db); break; }
    catch { await candidate.end(); await new Promise(resolve=>setTimeout(resolve,1000)); }
  }
  if (!db) throw new Error("Disposable PostgreSQL did not become ready");
  await db.query(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE TABLE public.admin_users(admin_id uuid PRIMARY KEY,is_active boolean NOT NULL DEFAULT true);
    CREATE TABLE public.nfc_tags(nfc_tag_id uuid PRIMARY KEY,version integer NOT NULL,status text NOT NULL,verified_at timestamptz);
    INSERT INTO public.admin_users VALUES ('${actor}',true),('${other}',true);
    INSERT INTO public.nfc_tags(nfc_tag_id,version,status) VALUES ('${tag}',1,'draft');`);
  await db.query(readFileSync("supabase/migrations/20260908000000_add_nfc_field_checks.sql","utf8"));
  await db.query(readFileSync("supabase/migrations/20260909000000_add_nfc_evidence_assets.sql","utf8"));
  await db.query(readFileSync("supabase/migrations/20260909001000_queue_nfc_orphan_cleanup.sql","utf8"));
  if (existsSync(migration)) await db.query(readFileSync(migration,"utf8"));
  const lifecycle="supabase/migrations/20260910001000_finalize_nfc_evidence_upload_intents.sql";
  if (existsSync(lifecycle)) await db.query(readFileSync(lifecycle,"utf8"));
  await db.query("SET ROLE service_role");
  const firstInput = input();
  const first = (await db.query(sql,firstInput)).rows[0];
  assert.match(first.asset_id,/^[0-9a-f-]{36}$/); checks++;
  assert.equal(first.object_key,`nfc-evidence/${first.asset_id}.webp`); checks++;
  const second = (await db.query(sql,firstInput)).rows[0];
  assert.deepEqual(second,first); checks++;
  for (const [index,value] of [[1,randomUUID()],[4,"cloudinary"],[5,"different-account"],[7,"b".repeat(64)],[8,999],[9,641]]) {
    const altered=[...firstInput]; altered[index]=value;
    await rejected(db,altered,/NFC_UPLOAD_REQUEST_CONFLICT/);
  }
  for (const [index,value] of [[0,null],[6,"../nfc-evidence"],[7,"bad"],[8,2097153],[9,0],[10,2561]]) {
    const invalid=input(); invalid[index]=value;
    await rejected(db,invalid,/NFC_UPLOAD_INPUT_INVALID/);
  }
  const cloud=input(); cloud[4]="cloudinary"; cloud[5]="test-cloud"; cloud[6]="tourism/nfc-evidence";
  const c=(await db.query(sql,cloud)).rows[0];
  assert.equal(c.object_key,`tourism/nfc-evidence/${c.asset_id}`); checks++;
  assert.equal(c.provider_account,"test-cloud"); checks++;
  const worker=new pg.Client(config); await worker.connect(); clients.push(worker);
  await worker.query("SET ROLE service_role");
  const concurrent=input();
  const race=await Promise.all([db.query(sql,concurrent),worker.query(sql,concurrent)]);
  assert.equal(race[0].rows[0].asset_id,race[1].rows[0].asset_id); checks++;
  await assert.rejects(db.query("UPDATE public.nfc_evidence_upload_intents SET state='abandoned'"),/permission denied/); checks++;
  await assert.rejects(db.query("DELETE FROM public.nfc_evidence_upload_intents"),/permission denied/); checks++;
  for (const role of ["anon","authenticated"]) {
    await db.query(`RESET ROLE; SET ROLE ${role}`);
    await rejected(db,input(),/permission denied/);
    await assert.rejects(db.query("SELECT * FROM public.nfc_evidence_upload_intents"),/permission denied/); checks++;
  }
  await db.query("RESET ROLE");
  await db.query("UPDATE public.admin_users SET is_active=false WHERE admin_id=$1",[actor]);
  await db.query("SET ROLE service_role"); await rejected(db,firstInput,/NFC_UPLOAD_ACTOR_UNAVAILABLE/);
  await db.query("RESET ROLE");
  await db.query("UPDATE public.admin_users SET is_active=true WHERE admin_id=$1",[actor]);
  await db.query("UPDATE public.nfc_tags SET version=2 WHERE nfc_tag_id=$1",[tag]);
  await db.query("SET ROLE service_role"); await rejected(db,firstInput,/NFC_VERSION_CONFLICT/);
  await db.query("RESET ROLE");
  await db.query("UPDATE public.nfc_tags SET version=1,status='revoked' WHERE nfc_tag_id=$1",[tag]);
  await db.query("SET ROLE service_role"); await rejected(db,firstInput,/NFC_UPLOAD_TAG_UNAVAILABLE/);
  await db.query("RESET ROLE");
  await db.query("UPDATE public.nfc_tags SET status='draft' WHERE nfc_tag_id=$1",[tag]);
  await db.query("SET ROLE service_role");
  for (let n=3;n<20;n++) await db.query(sql,input());
  await rejected(db,input(),/NFC_UPLOAD_PENDING_LIMIT/);
  assert.deepEqual((await db.query(sql,firstInput)).rows[0],first); checks++;
  const separate=input(); separate[3]=other; separate[0]=firstInput[0];
  assert.notEqual((await db.query(sql,separate)).rows[0].asset_id,first.asset_id); checks++;
  for (let n=1;n<19;n++) { const pending=input(); pending[3]=other; await db.query(sql,pending); }
  const lastA=input(); lastA[3]=other; const lastB=input(); lastB[3]=other;
  const admission=await Promise.allSettled([db.query(sql,lastA),worker.query(sql,lastB)]);
  assert.equal(admission.filter(result=>result.status==="fulfilled").length,1); checks++;
  const failure=admission.find(result=>result.status==="rejected");
  assert.match(String(failure?.reason),/NFC_UPLOAD_PENDING_LIMIT/); checks++;
  assert.equal((await db.query("SELECT count(*)::integer AS total FROM public.nfc_evidence_upload_intents WHERE actor_id=$1",[other])).rows[0].total,20); checks++;
  const finalize="SELECT public.finalize_nfc_evidence_upload($1,$2,$3,$4,$5,$6,$7,$8) AS asset_id";
  const finish=[first.asset_id,actor,"local-project",first.object_key,"a".repeat(64),1000,640,480];
  const finalized=await db.query(finalize,finish);
  assert.equal(finalized.rows[0].asset_id,first.asset_id); checks++;
  assert.equal((await db.query(finalize,finish)).rows[0].asset_id,first.asset_id); checks++;
  assert.equal((await db.query("SELECT state FROM public.nfc_evidence_upload_intents WHERE asset_id=$1",[first.asset_id])).rows[0].state,"available"); checks++;
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_evidence_assets WHERE asset_id=$1",[first.asset_id])).rows[0].total,1); checks++;
  await assert.rejects(db.query("SELECT public.abandon_stale_nfc_evidence_upload($1,$2)",[first.asset_id,actor]),/NFC_UPLOAD_NOT_ABANDONABLE/); checks++;
  for (const [index,value] of [[1,other],[2,"wrong-account"],[3,"wrong/path"],[4,"b".repeat(64)]]) {
    const changed=[...finish]; changed[index]=value;
    await assert.rejects(db.query(finalize,changed),/NFC_UPLOAD_FINALIZE_CONFLICT/); checks++;
  }
  const stale=(await db.query(sql,input())).rows[0];
  await assert.rejects(db.query("SELECT public.abandon_stale_nfc_evidence_upload($1,$2)",[stale.asset_id,actor]),/NFC_UPLOAD_NOT_STALE/); checks++;
  await db.query("RESET ROLE");
  // Fixture-only time travel; production callers cannot mutate intent metadata.
  await db.query("ALTER TABLE public.nfc_evidence_upload_intents DISABLE TRIGGER USER");
  await db.query("UPDATE public.nfc_evidence_upload_intents SET created_at=now()-interval '25 hours' WHERE asset_id=$1",[stale.asset_id]);
  await db.query("ALTER TABLE public.nfc_evidence_upload_intents ENABLE TRIGGER USER");
  await db.query("SET ROLE service_role");
  const staleFinish=[stale.asset_id,actor,"local-project",stale.object_key,"a".repeat(64),1000,640,480];
  const settlement=await Promise.allSettled([
    db.query("SELECT public.abandon_stale_nfc_evidence_upload($1,$2)",[stale.asset_id,actor]),worker.query(finalize,staleFinish),
  ]);
  assert.equal(settlement[0].status,"fulfilled"); checks++;
  assert.equal(settlement[1].status,"rejected"); checks++;
  assert.equal((await db.query("SELECT state FROM public.nfc_evidence_upload_intents WHERE asset_id=$1",[stale.asset_id])).rows[0].state,"abandoned"); checks++;
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_evidence_assets WHERE asset_id=$1",[stale.asset_id])).rows[0].total,0); checks++;
  await assert.rejects(db.query("SELECT public.register_nfc_evidence_asset($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
    [stale.asset_id,tag,1,actor,"supabase",stale.object_key,"a".repeat(64),1000,640,480]),/NFC_UPLOAD_FINALIZE_REQUIRED/); checks++;
  await db.query("RESET ROLE");
  await assert.rejects(db.query("UPDATE public.nfc_evidence_upload_intents SET state='available',storage_path=$2 WHERE asset_id=$1",[c.asset_id,"cloudinary:image:authenticated:v1:webp:"+c.object_key]),/check constraint/); checks++;
  await db.query(`CREATE FUNCTION public.qa_reject_asset() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW.asset_id='${c.asset_id}' THEN RAISE EXCEPTION 'QA_INSERT_FAILURE'; END IF; RETURN NEW; END; $$;
    CREATE TRIGGER qa_reject_asset BEFORE INSERT ON public.nfc_evidence_assets FOR EACH ROW EXECUTE FUNCTION public.qa_reject_asset();`);
  await db.query("SET ROLE service_role");
  const cloudFinish=[c.asset_id,actor,"test-cloud","cloudinary:image:authenticated:v123:webp:"+c.object_key,"a".repeat(64),1000,640,480];
  await assert.rejects(db.query(finalize,cloudFinish),/QA_INSERT_FAILURE/); checks++;
  assert.equal((await db.query("SELECT state FROM public.nfc_evidence_upload_intents WHERE asset_id=$1",[c.asset_id])).rows[0].state,"prepared"); checks++;
  await db.query("RESET ROLE; DROP TRIGGER qa_reject_asset ON public.nfc_evidence_assets");
  await db.query("SET ROLE service_role");
  const cloudRace=await Promise.all([db.query(finalize,cloudFinish),worker.query(finalize,cloudFinish)]);
  assert.equal(cloudRace[0].rows[0].asset_id,c.asset_id); checks++;
  assert.equal(cloudRace[1].rows[0].asset_id,c.asset_id); checks++;
  const guarded=(await db.query(sql,input())).rows[0];
  const guardedFinish=[guarded.asset_id,actor,"local-project",guarded.object_key,"a".repeat(64),1000,640,480];
  const workerPid=(await worker.query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
  // Observe the row-lock wait, then commit revocation/version changes before
  // allowing finalization to continue. A sleep alone cannot establish this race.
  for (const scenario of [
    { update:"UPDATE public.admin_users SET is_active=false WHERE admin_id=$1", restore:"UPDATE public.admin_users SET is_active=true WHERE admin_id=$1", id:actor, error:/NFC_UPLOAD_ACTOR_UNAVAILABLE/ },
    { update:"UPDATE public.nfc_tags SET version=2 WHERE nfc_tag_id=$1", restore:"UPDATE public.nfc_tags SET version=1 WHERE nfc_tag_id=$1", id:tag, error:/NFC_VERSION_CONFLICT/ },
    { update:"UPDATE public.nfc_tags SET status='revoked' WHERE nfc_tag_id=$1", restore:"UPDATE public.nfc_tags SET status='draft' WHERE nfc_tag_id=$1", id:tag, error:/NFC_UPLOAD_TAG_UNAVAILABLE/ },
  ]) {
    await db.query("RESET ROLE; BEGIN");
    let result;
    try {
      await db.query(scenario.update,[scenario.id]);
      result=worker.query(finalize,guardedFinish).then(value=>({value}),error=>({error}));
      let blocked=false;
      for (let attempt=0;attempt<100;attempt++) {
        blocked=(await db.query("SELECT pg_backend_pid()=ANY(pg_blocking_pids($1)) AS blocked",[workerPid])).rows[0].blocked;
        if (blocked) break;
        await new Promise(resolve=>setTimeout(resolve,20));
      }
      assert.equal(blocked,true,"finalization must wait for the actor/tag update"); checks++;
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      if (result) await result;
      throw error;
    }
    assert.match(String((await result).error),scenario.error); checks++;
    assert.equal((await db.query("SELECT state FROM public.nfc_evidence_upload_intents WHERE asset_id=$1",[guarded.asset_id])).rows[0].state,"prepared"); checks++;
    assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_evidence_assets WHERE asset_id=$1",[guarded.asset_id])).rows[0].total,0); checks++;
    await db.query(scenario.restore,[scenario.id]);
    await db.query("SET ROLE service_role");
  }
  assert.equal((await worker.query(finalize,guardedFinish)).rows[0].asset_id,guarded.asset_id); checks++;
  await db.query("RESET ROLE");
  // Fixture-only aging makes this registered, unattached asset cleanup-eligible.
  await db.query("ALTER TABLE public.nfc_evidence_assets DISABLE TRIGGER USER");
  await db.query("UPDATE public.nfc_evidence_assets SET created_at=now()-interval '8 days' WHERE asset_id=$1",[guarded.asset_id]);
  await db.query("ALTER TABLE public.nfc_evidence_assets ENABLE TRIGGER USER");
  await db.query("SET ROLE service_role; BEGIN");
  let cleanupRetry;
  try {
    const claimed=await db.query("SELECT * FROM public.claim_nfc_evidence_cleanup(25)");
    assert.ok(claimed.rows.some(row=>row.asset_id===guarded.asset_id)); checks++;
    cleanupRetry=worker.query(finalize,guardedFinish).then(value=>({value}),error=>({error}));
    let blocked=false;
    for (let attempt=0;attempt<100;attempt++) {
      blocked=(await db.query("SELECT pg_backend_pid()=ANY(pg_blocking_pids($1)) AS blocked",[workerPid])).rows[0].blocked;
      if (blocked) break;
      await new Promise(resolve=>setTimeout(resolve,20));
    }
    assert.equal(blocked,true,"available retry must wait for the cleanup asset lock"); checks++;
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    if (cleanupRetry) await cleanupRetry;
    throw error;
  }
  assert.match(String((await cleanupRetry).error),/NFC_UPLOAD_NOT_AVAILABLE/); checks++;
  assert.equal((await db.query("SELECT state FROM public.nfc_evidence_upload_intents WHERE asset_id=$1",[guarded.asset_id])).rows[0].state,"available"); checks++;
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_evidence_assets WHERE asset_id=$1",[guarded.asset_id])).rows[0].total,1); checks++;
  const reportSql="SELECT public.record_nfc_field_check_with_photos($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) AS request_id";
  const reportInput=assetId=>[randomUUID(),tag,1,actor,"Main gate","QA browser","other","not_tested","passed","","",[assetId]];
  const reportA=reportInput(first.asset_id),reportB=reportInput(first.asset_id);
  const reportRace=await Promise.allSettled([db.query(reportSql,reportA),worker.query(reportSql,reportB)]);
  assert.equal(reportRace.filter(result=>result.status==="fulfilled").length,1); checks++;
  assert.match(String(reportRace.find(result=>result.status==="rejected")?.reason),/NFC_EVIDENCE_NOT_AVAILABLE/); checks++;
  const winner=reportRace[0].status==="fulfilled"?reportA:reportB;
  assert.equal((await db.query(reportSql,winner)).rows[0].request_id,winner[0]); checks++;
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_field_check_photos WHERE asset_id=$1",[first.asset_id])).rows[0].total,1); checks++;
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_field_checks WHERE request_id=ANY($1::uuid[])",[[reportA[0],reportB[0]]])).rows[0].total,1); checks++;
  const invalidReport=reportInput(c.asset_id); invalidReport[4]="x";
  await assert.rejects(db.query(reportSql,invalidReport),/check constraint/); checks++;
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_field_check_photos WHERE asset_id=$1",[c.asset_id])).rows[0].total,0); checks++;
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_field_checks WHERE request_id=$1",[invalidReport[0]])).rows[0].total,0); checks++;
  // Attachment remains the exclusion authority even after normal retention age.
  await db.query("RESET ROLE; ALTER TABLE public.nfc_evidence_assets DISABLE TRIGGER USER");
  await db.query("UPDATE public.nfc_evidence_assets SET created_at=now()-interval '8 days' WHERE asset_id=$1",[first.asset_id]);
  await db.query("ALTER TABLE public.nfc_evidence_assets ENABLE TRIGGER USER; SET ROLE service_role");
  assert.ok(!(await db.query("SELECT * FROM public.claim_nfc_evidence_cleanup(25)")).rows.some(row=>row.asset_id===first.asset_id)); checks++;
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_evidence_cleanup WHERE asset_id=$1",[first.asset_id])).rows[0].total,0); checks++;
  for (const role of ["anon","authenticated"]) {
    await db.query(`RESET ROLE; SET ROLE ${role}`);
    await assert.rejects(db.query(finalize,cloudFinish),/permission denied/); checks++;
    await assert.rejects(db.query("SELECT public.abandon_stale_nfc_evidence_upload($1,$2)",[stale.asset_id,actor]),/permission denied/); checks++;
  }
  await db.query("RESET ROLE");
  await db.query(readFileSync("supabase/migrations/20260911000000_add_nfc_recovery_leases.sql","utf8"));
  await db.query(readFileSync("supabase/migrations/20260911001000_finalize_leased_nfc_recovery.sql","utf8"));
  await db.query(readFileSync("supabase/migrations/20260911002000_read_leased_nfc_recovery_intent.sql","utf8"));
  await db.query(readFileSync("supabase/migrations/20260911003000_abandon_leased_nfc_recovery.sql","utf8"));
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_evidence_recovery_jobs")).rows[0].total,
    (await db.query("SELECT count(*)::int AS total FROM public.nfc_evidence_upload_intents")).rows[0].total); checks++;
  await db.query("SET ROLE service_role");
  const queued=(await db.query(sql,input())).rows[0];
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1",[queued.asset_id])).rows[0].total,1); checks++;
  assert.equal((await db.query("SELECT * FROM public.claim_nfc_evidence_recovery(5)")).rowCount,0); checks++;
  await db.query("RESET ROLE");
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=now()-interval '1 second' WHERE asset_id=ANY($1::uuid[])",[[first.asset_id,c.asset_id]]);
  await db.query("SET ROLE service_role");
  const leases=await Promise.all([db.query("SELECT * FROM public.claim_nfc_evidence_recovery(1)"),worker.query("SELECT * FROM public.claim_nfc_evidence_recovery(1)")]);
  const leaseA=leases[0].rows[0],leaseB=leases[1].rows[0];
  assert.notEqual(leaseA.asset_id,leaseB.asset_id); checks++;
  assert.notEqual(leaseA.lease_token,leaseB.lease_token); checks++;
  assert.equal((await db.query("SELECT * FROM public.claim_nfc_evidence_recovery(5)")).rowCount,0); checks++;
  await assert.rejects(db.query("SELECT public.defer_nfc_evidence_recovery($1,$2,'provider_unavailable')",[leaseA.asset_id,leaseB.lease_token]),/NFC_RECOVERY_LEASE_LOST/); checks++;
  await db.query("SELECT public.defer_nfc_evidence_recovery($1,$2,'provider_unavailable')",[leaseA.asset_id,leaseA.lease_token]);
  const deferred=(await db.query("SELECT *,extract(epoch FROM next_attempt_at-clock_timestamp()) AS delay FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1",[leaseA.asset_id])).rows[0];
  assert.equal(deferred.lease_token,null); checks++;
  assert.ok(Number(deferred.delay)>20 && Number(deferred.delay)<=33); checks++;
  await db.query("RESET ROLE");
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET last_attempt_at=now()-interval '3 minutes',lease_expires_at=now()-interval '1 second' WHERE asset_id=$1",[leaseB.asset_id]);
  await db.query("SET ROLE service_role");
  const replacement=(await db.query("SELECT * FROM public.claim_nfc_evidence_recovery(1)")).rows[0];
  assert.equal(replacement.asset_id,leaseB.asset_id); checks++;
  assert.notEqual(replacement.lease_token,leaseB.lease_token); checks++;
  assert.equal(replacement.attempt_count,2); checks++;
  await assert.rejects(worker.query("SELECT public.renew_nfc_evidence_recovery($1,$2)",[leaseB.asset_id,leaseB.lease_token]),/NFC_RECOVERY_LEASE_LOST/); checks++;
  await assert.rejects(worker.query("SELECT public.defer_nfc_evidence_recovery($1,$2,'absent')",[leaseB.asset_id,leaseB.lease_token]),/NFC_RECOVERY_LEASE_LOST/); checks++;
  await db.query("SELECT public.renew_nfc_evidence_recovery($1,$2)",[replacement.asset_id,replacement.lease_token]); checks++;
  await db.query("SELECT public.defer_nfc_evidence_recovery($1,$2,'content_conflict')",[replacement.asset_id,replacement.lease_token]);
  assert.equal((await db.query("SELECT review_required FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1",[replacement.asset_id])).rows[0].review_required,true); checks++;
  await db.query("RESET ROLE");
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=now()-interval '1 second' WHERE asset_id=$1",[queued.asset_id]);
  await db.query("SET ROLE service_role");
  const expiring=(await db.query("SELECT * FROM public.claim_nfc_evidence_recovery(1)")).rows[0];
  await db.query("RESET ROLE");
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET lease_expires_at=clock_timestamp()+interval '2 seconds' WHERE asset_id=$1",[expiring.asset_id]);
  await db.query("BEGIN");
  let renewal;
  try {
    await db.query("SELECT 1 FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1 FOR UPDATE",[expiring.asset_id]);
    renewal=worker.query("SELECT public.renew_nfc_evidence_recovery($1,$2)",[expiring.asset_id,expiring.lease_token]).then(value=>({value}),error=>({error}));
    let blocked=false;
    for(let attempt=0;attempt<100;attempt++) {
      blocked=(await db.query("SELECT pg_backend_pid()=ANY(pg_blocking_pids($1)) AS blocked",[workerPid])).rows[0].blocked;
      if(blocked) break;
      await new Promise(resolve=>setTimeout(resolve,10));
    }
    assert.equal(blocked,true); checks++;
    await db.query("SELECT pg_sleep(greatest(0,extract(epoch FROM lease_expires_at-clock_timestamp()))+0.1) FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1",[expiring.asset_id]);
    await db.query("COMMIT");
  } catch(error) {await db.query("ROLLBACK");if(renewal) await renewal;throw error;}
  assert.match(String((await renewal).error),/NFC_RECOVERY_LEASE_LOST/); checks++;
  await db.query("SET ROLE service_role");
  await assert.rejects(db.query("UPDATE public.nfc_evidence_recovery_jobs SET completed_at=now()"),/permission denied/); checks++;
  // Isolate one prepared intent for the worker's atomic finalization contract.
  await db.query("RESET ROLE");
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=now()+interval '1 hour'");
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=now()-interval '1 second',lease_token=NULL,lease_expires_at=NULL,review_required=false WHERE asset_id=$1",[queued.asset_id]);
  await db.query("SET ROLE service_role");
  const finishing=(await db.query("SELECT * FROM public.claim_nfc_evidence_recovery(1)")).rows[0];
  const readLeaseSql="SELECT * FROM public.read_leased_nfc_recovery_intent($1,$2)";
  const readLeaseInput=[queued.asset_id,finishing.lease_token];
  const leasedIntent=(await db.query(readLeaseSql,readLeaseInput)).rows[0];
  assert.equal(leasedIntent.asset_id,queued.asset_id); checks++;
  assert.equal(leasedIntent.actor_id,actor); checks++;
  assert.equal(leasedIntent.object_key,queued.object_key); checks++;
  await assert.rejects(db.query(readLeaseSql,[queued.asset_id,randomUUID()]),/NFC_RECOVERY_LEASE_LOST/); checks++;
  await assert.rejects(db.query(readLeaseSql,[queued.asset_id,null]),/NFC_RECOVERY_LEASE_LOST/); checks++;
  await assert.rejects(db.query(readLeaseSql,[randomUUID(),finishing.lease_token]),/NFC_RECOVERY_LEASE_LOST/); checks++;
  await db.query("RESET ROLE");
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET lease_expires_at=clock_timestamp()+interval '2 seconds' WHERE asset_id=$1",[queued.asset_id]);
  await db.query("BEGIN");
  let delayedRead;
  try {
    await db.query("SELECT 1 FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1 FOR UPDATE",[queued.asset_id]);
    delayedRead=worker.query(readLeaseSql,readLeaseInput).then(value=>({value}),error=>({error}));
    let blocked=false;
    for(let attempt=0;attempt<100;attempt++) {
      blocked=(await db.query("SELECT pg_backend_pid()=ANY(pg_blocking_pids($1)) AS blocked",[workerPid])).rows[0].blocked;
      if(blocked) break;
      await new Promise(resolve=>setTimeout(resolve,10));
    }
    assert.equal(blocked,true); checks++;
    await db.query("SELECT pg_sleep(greatest(0,extract(epoch FROM lease_expires_at-clock_timestamp()))+0.1) FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1",[queued.asset_id]);
    await db.query("COMMIT");
  } catch(error) {await db.query("ROLLBACK");if(delayedRead) await delayedRead;throw error;}
  assert.match(String((await delayedRead).error),/NFC_RECOVERY_LEASE_LOST/); checks++;
  // Test fixture restores this lease for the independent finalization assertions.
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET lease_expires_at=clock_timestamp()+interval '2 minutes' WHERE asset_id=$1",[queued.asset_id]);
  await db.query("SET ROLE service_role");
  const leasedSql="SELECT public.finalize_leased_nfc_recovery($1,$2,$3,$4,$5,$6,$7,$8) AS asset_id";
  const leasedInput=[queued.asset_id,finishing.lease_token,"local-project",queued.object_key,"a".repeat(64),1000,640,480];
  await assert.rejects(db.query(leasedSql,[...leasedInput.slice(0,1),randomUUID(),...leasedInput.slice(2)]),/NFC_RECOVERY_LEASE_LOST/); checks++;
  const badContent=[...leasedInput];badContent[4]="b".repeat(64);
  await assert.rejects(db.query(leasedSql,badContent),/NFC_UPLOAD_FINALIZE_CONFLICT/); checks++;
  assert.equal((await db.query("SELECT completed_at FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1",[queued.asset_id])).rows[0].completed_at,null); checks++;
  assert.equal((await db.query("SELECT state FROM public.nfc_evidence_upload_intents WHERE asset_id=$1",[queued.asset_id])).rows[0].state,"prepared"); checks++;
  await db.query("RESET ROLE");
  await db.query(`CREATE FUNCTION public.qa_delay_recovery_insert() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW.asset_id='${queued.asset_id}' THEN
      PERFORM pg_sleep(greatest(0,extract(epoch FROM lease_expires_at-clock_timestamp()))+0.1)
        FROM public.nfc_evidence_recovery_jobs WHERE asset_id=NEW.asset_id;
    END IF; RETURN NEW; END; $$;
    CREATE TRIGGER qa_delay_recovery_insert BEFORE INSERT ON public.nfc_evidence_assets
      FOR EACH ROW EXECUTE FUNCTION public.qa_delay_recovery_insert();`);
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET lease_expires_at=clock_timestamp()+interval '3 seconds' WHERE asset_id=$1",[queued.asset_id]);
  await db.query("SET ROLE service_role");
  await assert.rejects(db.query(leasedSql,leasedInput),/NFC_RECOVERY_LEASE_LOST/); checks++;
  assert.equal((await db.query("SELECT state FROM public.nfc_evidence_upload_intents WHERE asset_id=$1",[queued.asset_id])).rows[0].state,"prepared"); checks++;
  assert.equal((await db.query("SELECT count(*)::int AS total FROM public.nfc_evidence_assets WHERE asset_id=$1",[queued.asset_id])).rows[0].total,0); checks++;
  assert.equal((await db.query("SELECT completed_at FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1",[queued.asset_id])).rows[0].completed_at,null); checks++;
  await db.query("RESET ROLE; DROP TRIGGER qa_delay_recovery_insert ON public.nfc_evidence_assets; SET ROLE service_role");
  const freshLease=(await db.query("SELECT * FROM public.claim_nfc_evidence_recovery(1)")).rows[0];
  assert.equal(freshLease.asset_id,queued.asset_id); checks++;
  leasedInput[1]=freshLease.lease_token;
  assert.equal((await db.query(leasedSql,leasedInput)).rows[0].asset_id,queued.asset_id); checks++;
  const finishedJob=(await db.query("SELECT * FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1",[queued.asset_id])).rows[0];
  assert.ok(finishedJob.completed_at); checks++;
  assert.equal(finishedJob.lease_token,null); checks++;
  assert.equal((await db.query("SELECT actor_id FROM public.nfc_evidence_assets WHERE asset_id=$1",[queued.asset_id])).rows[0].actor_id,actor); checks++;
  await assert.rejects(db.query(leasedSql,leasedInput),/NFC_RECOVERY_LEASE_LOST/); checks++;
  await assert.rejects(db.query(readLeaseSql,readLeaseInput),/NFC_RECOVERY_LEASE_LOST/); checks++;
  const retiring=(await db.query(sql,input())).rows[0];
  await db.query("RESET ROLE");
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=now()+interval '1 hour'");
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=now()-interval '1 second' WHERE asset_id=$1",[retiring.asset_id]);
  await db.query("SET ROLE service_role");
  const retiringLease=(await db.query("SELECT * FROM public.claim_nfc_evidence_recovery(1)")).rows[0];
  const retireSql="SELECT public.abandon_leased_nfc_recovery($1,$2) AS accepted";
  const retireInput=[retiring.asset_id,retiringLease.lease_token];
  await assert.rejects(db.query(retireSql,retireInput),/NFC_UPLOAD_NOT_STALE/); checks++;
  await db.query("RESET ROLE; ALTER TABLE public.nfc_evidence_upload_intents DISABLE TRIGGER USER");
  await db.query("UPDATE public.nfc_evidence_upload_intents SET created_at=now()-interval '25 hours' WHERE asset_id=$1",[retiring.asset_id]);
  await db.query("ALTER TABLE public.nfc_evidence_upload_intents ENABLE TRIGGER USER; SET ROLE service_role");
  await assert.rejects(db.query(retireSql,[retiring.asset_id,randomUUID()]),/NFC_RECOVERY_LEASE_LOST/); checks++;
  await db.query("RESET ROLE");
  await db.query(`CREATE FUNCTION public.qa_delay_recovery_abandon() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW.asset_id='${retiring.asset_id}' AND NEW.state='abandoned' THEN
      PERFORM pg_sleep(greatest(0,extract(epoch FROM lease_expires_at-clock_timestamp()))+0.1)
        FROM public.nfc_evidence_recovery_jobs WHERE asset_id=NEW.asset_id;
    END IF; RETURN NEW; END; $$;
    CREATE TRIGGER qa_delay_recovery_abandon BEFORE UPDATE ON public.nfc_evidence_upload_intents
      FOR EACH ROW EXECUTE FUNCTION public.qa_delay_recovery_abandon();`);
  await db.query("UPDATE public.nfc_evidence_recovery_jobs SET lease_expires_at=clock_timestamp()+interval '2 seconds' WHERE asset_id=$1",[retiring.asset_id]);
  await db.query("SET ROLE service_role");
  await assert.rejects(db.query(retireSql,retireInput),/NFC_RECOVERY_LEASE_LOST/); checks++;
  assert.equal((await db.query("SELECT state FROM public.nfc_evidence_upload_intents WHERE asset_id=$1",[retiring.asset_id])).rows[0].state,"prepared"); checks++;
  await db.query("RESET ROLE; DROP TRIGGER qa_delay_recovery_abandon ON public.nfc_evidence_upload_intents; SET ROLE service_role");
  const retireReplacement=(await db.query("SELECT * FROM public.claim_nfc_evidence_recovery(1)")).rows[0];
  assert.equal(retireReplacement.asset_id,retiring.asset_id); checks++;
  await assert.rejects(db.query(retireSql,retireInput),/NFC_RECOVERY_LEASE_LOST/); checks++;
  retireInput[1]=retireReplacement.lease_token;
  assert.equal((await db.query(retireSql,retireInput)).rows[0].accepted,true); checks++;
  assert.equal((await db.query("SELECT state FROM public.nfc_evidence_upload_intents WHERE asset_id=$1",[retiring.asset_id])).rows[0].state,"abandoned"); checks++;
  const retained=(await db.query("SELECT * FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1",[retiring.asset_id])).rows[0];
  assert.equal(retained.completed_at,null); checks++;
  assert.equal(retained.lease_token,retireReplacement.lease_token); checks++;
  assert.equal((await db.query(retireSql,retireInput)).rows[0].accepted,true); checks++;
  for (const role of ["anon","authenticated"]) {
    await db.query(`RESET ROLE; SET ROLE ${role}`);
    await assert.rejects(db.query(retireSql,retireInput),/permission denied/); checks++;
    await assert.rejects(db.query("SELECT * FROM public.claim_nfc_evidence_recovery(1)"),/permission denied/); checks++;
    await assert.rejects(db.query("SELECT * FROM public.nfc_evidence_recovery_jobs"),/permission denied/); checks++;
    await assert.rejects(db.query(leasedSql,leasedInput),/permission denied/); checks++;
    await assert.rejects(db.query(readLeaseSql,readLeaseInput),/permission denied/); checks++;
  }
  console.log(`NFC upload intent PostgreSQL QA passed: ${checks} assertions.`);
} finally {
  for (const db of clients) await db.end();
  if (started) docker(["rm","-f",name]);
}
