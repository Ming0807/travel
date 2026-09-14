import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";

// Called only by the disposable platform replay, never against a configured URL.
export async function verifyNfcCleanupLeases(db, { tag, actor }) {
  await db.query("RESET ROLE");
  async function fixture({ bound = true, recent = false } = {}) {
    const id = randomUUID();
    const path = `nfc-evidence/${id}.webp`;
    if (bound) await db.query(`INSERT INTO public.nfc_evidence_upload_intents
      (asset_id,request_id,actor_id,nfc_tag_id,tag_version,provider,provider_account,storage_prefix,
       object_key,sha256,size_bytes,width,height,state,created_at,finalized_at,storage_path)
      VALUES($1,$2,$3,$4,1,'supabase','local-qa','nfc-evidence',$5,$6,100,4,5,'available',
       now()-interval '8 days',now()-interval '8 days',$5)`, [id, randomUUID(), actor, tag, path, "c".repeat(64)]);
    await db.query(`INSERT INTO public.nfc_evidence_assets
      (asset_id,nfc_tag_id,tag_version,actor_id,provider,storage_path,sha256,size_bytes,width,height,created_at)
      VALUES($1,$2,1,$3,'supabase',$4,$5,100,4,5,now()-$6::interval)`,
    [id, tag, actor, path, "c".repeat(64), recent ? "1 hour" : "8 days"]);
    return id;
  }
  const eligible = [await fixture(), await fixture(), await fixture()];
  const legacy = await fixture({ bound: false });
  const recent = await fixture({ recent: true });
  const attached = await fixture();
  const report = (await db.query("SELECT request_id FROM public.nfc_field_checks WHERE nfc_tag_id=$1 LIMIT 1", [tag])).rows[0].request_id;
  await db.query("INSERT INTO public.nfc_field_check_photos(request_id,asset_id,position) VALUES($1,$2,2)", [report, attached]);
  await db.query("SET ROLE service_role");
  const claim = "SELECT * FROM public.claim_nfc_cleanup_jobs($1)";
  const read = "SELECT public.read_leased_nfc_cleanup_binding($1,$2) AS binding";
  const defer = "SELECT public.defer_nfc_cleanup_job($1,$2,$3)";
  for (const limit of [null, 0, 6]) await assert.rejects(db.query(claim, [limit]), /NFC_CLEANUP_LIMIT_INVALID/);
  const first = (await db.query(claim, [1])).rows;
  assert.equal(first.length, 1);
  assert.ok(eligible.includes(first[0].asset_id));
  const second = (await db.query(claim, [1])).rows[0];
  assert.notEqual(second.asset_id, first[0].asset_id);
  const binding = (await db.query(read, [first[0].asset_id, first[0].lease_token])).rows[0].binding;
  assert.equal(binding.provider_account, "local-qa");
  assert.equal(binding.object_key, `nfc-evidence/${first[0].asset_id}.webp`);
  assert.equal(binding.sha256, "c".repeat(64));
  await assert.rejects(db.query(read, [first[0].asset_id, randomUUID()]), /NFC_CLEANUP_LEASE_LOST/);
  await db.query(defer, [first[0].asset_id, first[0].lease_token, "provider_unavailable"]);
  const third = (await db.query(claim, [1])).rows[0];
  assert.ok(third && third.asset_id !== first[0].asset_id && third.asset_id !== second.asset_id);
  await assert.rejects(db.query(defer, [first[0].asset_id, first[0].lease_token, "absent"]), /NFC_CLEANUP_LEASE_LOST/);
  await db.query("RESET ROLE");
  assert.equal((await db.query("SELECT count(*)::int AS n FROM public.nfc_evidence_cleanup WHERE asset_id=ANY($1::uuid[])", [[legacy, recent, attached]])).rows[0].n, 0);
  await db.query(`UPDATE public.nfc_evidence_cleanup_jobs SET last_attempt_at=now()-interval '3 minutes',
    lease_expires_at=now()-interval '1 minute' WHERE asset_id=$1`, [second.asset_id]);
  await db.query("SET ROLE service_role");
  const reclaimed = (await db.query(claim, [1])).rows[0];
  assert.equal(reclaimed.asset_id, second.asset_id); assert.notEqual(reclaimed.lease_token, second.lease_token);
  await assert.rejects(db.query(read, [second.asset_id, second.lease_token]), /NFC_CLEANUP_LEASE_LOST/);
  await db.query("SELECT public.renew_nfc_cleanup_job($1,$2)", [reclaimed.asset_id, reclaimed.lease_token]);
  await assert.rejects(db.query(defer, [reclaimed.asset_id, reclaimed.lease_token, "deleted"]), /NFC_CLEANUP_OUTCOME_INVALID/);
  await db.query(defer, [reclaimed.asset_id, reclaimed.lease_token, "content_conflict"]);
  assert.equal((await db.query("SELECT review_required FROM public.nfc_evidence_cleanup_jobs WHERE asset_id=$1", [reclaimed.asset_id])).rows[0].review_required, true);
  // A real competing connection holds the row past the lease expiry.
  const connection = db.connectionParameters;
  const blocker = new pg.Client({ host: connection.host, port: connection.port, user: connection.user,
    database: connection.database, statement_timeout: 10000 });
  await blocker.connect();
  try {
    await db.query("RESET ROLE");
    await db.query(`UPDATE public.nfc_evidence_cleanup_jobs SET lease_expires_at=clock_timestamp()+interval '1 second'
      WHERE asset_id=$1`, [third.asset_id]);
    await blocker.query("BEGIN");
    await blocker.query("SELECT 1 FROM public.nfc_evidence_cleanup_jobs WHERE asset_id=$1 FOR UPDATE", [third.asset_id]);
    await db.query("SET ROLE service_role");
    const rejected = assert.rejects(db.query(read, [third.asset_id, third.lease_token]), /NFC_CLEANUP_LEASE_LOST/);
    // Verify the request is actually waiting, rather than relying on a timer alone.
    let waiting = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      waiting = (await blocker.query("SELECT wait_event_type='Lock' AS waiting FROM pg_stat_activity WHERE pid=$1", [db.processID])).rows[0]?.waiting;
      if (waiting) break;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.equal(waiting, true);
    await blocker.query("SELECT pg_sleep(1.1)");
    await blocker.query("COMMIT");
    await rejected;
  } finally { await blocker.query("ROLLBACK").catch(() => undefined); await blocker.end(); }
  await assert.rejects(db.query("SELECT public.claim_nfc_evidence_cleanup(1)"), /permission denied/);
  await assert.rejects(db.query("SELECT public.complete_nfc_evidence_cleanup($1)", [reclaimed.asset_id]), /permission denied/);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM public.nfc_evidence_cleanup WHERE asset_id=ANY($1::uuid[]) AND deleted_at IS NOT NULL", [eligible])).rows[0].n, 0);
  for (const role of ["anon", "authenticated"]) {
    await db.query(`RESET ROLE; SET ROLE ${role}`);
    await assert.rejects(db.query(claim, [1]), /permission denied/);
    await assert.rejects(db.query(read, [third.asset_id, third.lease_token]), /permission denied/);
    await assert.rejects(db.query("SELECT * FROM public.nfc_evidence_cleanup_jobs"), /permission denied/);
  }
  console.log("PASS held cleanup jobs: bound admission, report/legacy/recent exclusion, distinct leases, binding read, stale fencing including lock-wait expiry, backoff fairness, review and browser/legacy-RPC denial. No provider calls.");
}
