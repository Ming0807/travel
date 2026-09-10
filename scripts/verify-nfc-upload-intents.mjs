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
    CREATE TABLE public.nfc_tags(nfc_tag_id uuid PRIMARY KEY,version integer NOT NULL,status text NOT NULL);
    INSERT INTO public.admin_users VALUES ('${actor}',true),('${other}',true);
    INSERT INTO public.nfc_tags VALUES ('${tag}',1,'draft');`);
  if (existsSync(migration)) await db.query(readFileSync(migration,"utf8"));
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
  console.log(`NFC upload intent PostgreSQL QA passed: ${checks} assertions.`);
} finally {
  for (const db of clients) await db.end();
  if (started) docker(["rm","-f",name]);
}
