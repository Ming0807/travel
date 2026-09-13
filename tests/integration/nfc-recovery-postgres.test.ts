// @vitest-environment node
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import sharp from "sharp";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type RpcResult = { data: unknown; error: { message: string } | null };
const state = vi.hoisted(() => ({
  origin: "", status: 200, corrupt: false, hits: 0, loseFinalizeResponse: false,
  beforeResponse: async () => {},
  rpc: async (_name: string, _args: Record<string, unknown>): Promise<RpcResult> => {
    throw new Error("Disposable database not initialized");
  },
}));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ rpc: state.rpc }) }));
vi.mock("@/lib/storage/nfc-prepared-storage", () => ({ getNfcUploadDestination: () => ({
  provider: "supabase", provider_account: "local-qa", storage_prefix: "nfc-evidence",
}) }));
vi.mock("@/lib/config/public-env", () => ({ getPublicEnv: () => ({ NEXT_PUBLIC_SUPABASE_URL: state.origin }) }));
vi.mock("@/lib/storage/private-files", () => ({ createPrivateFileSignedUrl: async () => `${state.origin}/evidence` }));
import { runAuthorizedNfcRecovery } from "@/lib/services/nfc-recovery-processor.service";
import { prepareNfcEvidenceUpload } from "@/lib/repositories/nfc-upload-intent.repository";
import { listNfcRecoveryReview, listNfcRecoveryReviewHistory } from "@/lib/repositories/nfc-recovery-review.repository";
import { enqueueNfcRecoveryRetry } from "@/lib/repositories/nfc-recovery-retry.repository";

// No external connection string is accepted. Only this suite's disposable container is used.
describe.runIf(process.env.NFC_RECOVERY_POSTGRES_QA === "1")("NFC processor with real PostgreSQL and HTTP", () => {
  interface Db {
    connect(): Promise<void>;
    end(): Promise<void>;
    query(sql: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  }
  const pg = createRequire(import.meta.url)("pg") as { Client: new (config: object) => Db };
  const container = `tourism-nfc-processor-qa-${randomUUID().slice(0, 8)}`;
  const clients: Db[] = [];
  const secret = "local-disposable-nfc-recovery-secret-123456";
  let started = false;
  let admin: Db;
  let worker: Db;
  let peer: Db;
  let control: Db;
  let bytes: Buffer;
  let actor: string;
  let tag: string;
  let operator: string;
  let snapshotAsset: unknown;
  const server = createServer(async (_request, response) => {
    state.hits++;
    try {
      await state.beforeResponse();
      response.writeHead(state.status, { "Content-Type": "image/webp" });
      response.end(state.corrupt ? Buffer.from("not the prepared image") : bytes);
    } catch {
      response.writeHead(500); response.end();
    }
  });
  function docker(args: string[]) {
    const result = spawnSync("docker", args, { encoding: "utf8", timeout: 120000 });
    if (result.status !== 0) throw new Error(`Disposable Docker ${args[0]} failed: ${result.stderr || result.error}`);
    return result.stdout.trim();
  }
  beforeAll(async () => {
    docker(["run", "-d", "--name", container, "-p", "127.0.0.1::5432", "-e",
      "POSTGRES_HOST_AUTH_METHOD=trust", "-e", "POSTGRES_DB=nfc_processor_qa", "postgres:16"]);
    started = true;
    const port = docker(["port", container, "5432/tcp"]).match(/^127\.0\.0\.1:(\d+)$/)?.[1];
    if (!port) throw new Error("Expected disposable loopback PostgreSQL");
    const config = { host: "127.0.0.1", port: Number(port), user: "postgres", database: "nfc_processor_qa",
      connectionTimeoutMillis: 2000, statement_timeout: 10000 };
    for (let attempt = 0; attempt < 60; attempt++) {
      const candidate = new pg.Client(config);
      try { await candidate.connect(); admin = candidate; clients.push(candidate); break; }
      catch { await candidate.end(); await new Promise(resolve => setTimeout(resolve, 500)); }
    }
    if (!admin) throw new Error("Disposable PostgreSQL did not start");
    await admin.query(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
      CREATE ROLE service_role NOLOGIN BYPASSRLS;
      CREATE TABLE public.admin_users(admin_id uuid PRIMARY KEY,is_active boolean NOT NULL DEFAULT true);
      CREATE TABLE public.nfc_tags(nfc_tag_id uuid PRIMARY KEY,version integer NOT NULL,status text NOT NULL,verified_at timestamptz);
      CREATE TABLE public.roles(role_id bigint PRIMARY KEY,role_name text NOT NULL UNIQUE,is_active boolean NOT NULL DEFAULT true);
      CREATE TABLE public.permissions(permission_id bigint PRIMARY KEY,permission_name text NOT NULL UNIQUE);
      CREATE TABLE public.admin_user_roles(admin_id uuid REFERENCES public.admin_users,role_id bigint REFERENCES public.roles,PRIMARY KEY(admin_id,role_id));
      CREATE TABLE public.role_permissions(role_id bigint REFERENCES public.roles,permission_id bigint REFERENCES public.permissions,PRIMARY KEY(role_id,permission_id));
      CREATE TABLE public.audit_logs(log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),admin_id uuid REFERENCES public.admin_users,
        action varchar(150),entity_type varchar(100),entity_id text,old_data jsonb,new_data jsonb,ip_address varchar(45),created_at timestamptz NOT NULL DEFAULT now());
      INSERT INTO public.roles VALUES(1,'super_admin',true),(2,'custom_operator',true),(3,'viewer',true);
      INSERT INTO public.permissions VALUES(1,'checkin_code.manage'),(2,'system.all');
      INSERT INTO public.role_permissions VALUES(2,1);`);
    for (const file of [
      "20260908000000_add_nfc_field_checks.sql", "20260909000000_add_nfc_evidence_assets.sql",
      "20260909001000_queue_nfc_orphan_cleanup.sql", "20260910000000_prepare_nfc_evidence_upload_intents.sql",
      "20260910001000_finalize_nfc_evidence_upload_intents.sql", "20260911000000_add_nfc_recovery_leases.sql",
      "20260911001000_finalize_leased_nfc_recovery.sql", "20260911002000_read_leased_nfc_recovery_intent.sql",
      "20260911003000_abandon_leased_nfc_recovery.sql",
      "20260911004000_add_nfc_recovery_review.sql",
    ]) {
      if (file === "20260911004000_add_nfc_recovery_review.sql") {
        const seedActor = randomUUID(); const seedTag = randomUUID();
        await admin.query("INSERT INTO public.admin_users VALUES($1,true)", [seedActor]);
        await admin.query("INSERT INTO public.nfc_tags(nfc_tag_id,version,status) VALUES($1,1,'draft')", [seedTag]);
        snapshotAsset = (await admin.query("SELECT asset_id FROM public.prepare_nfc_evidence_upload($1,$2,1,$3,'supabase','local-qa','nfc-evidence',$4,100,4,5)",
          [randomUUID(), seedTag, seedActor, "a".repeat(64)])).rows[0].asset_id;
      }
      await admin.query(readFileSync(`supabase/migrations/${file}`, "utf8"));
    }
    const retryMigration = "supabase/migrations/20260913000000_add_nfc_recovery_operator_retry.sql";
    await admin.query(readFileSync(retryMigration, "utf8"));
    worker = new pg.Client(config); await worker.connect(); clients.push(worker);
    await worker.query("SET ROLE service_role");
    peer = new pg.Client(config); await peer.connect(); clients.push(peer); await peer.query("SET ROLE service_role");
    control = new pg.Client(config); await control.connect(); clients.push(control);
    const tableFunctions = new Set(["prepare_nfc_evidence_upload", "claim_nfc_evidence_recovery", "read_leased_nfc_recovery_intent"]);
    const scalarFunctions = new Set(["renew_nfc_evidence_recovery", "defer_nfc_evidence_recovery",
      "finalize_leased_nfc_recovery", "abandon_leased_nfc_recovery", "list_nfc_evidence_recovery",
      "list_nfc_evidence_recovery_history", "request_nfc_evidence_recovery_retry"]);
    state.rpc = async (name, args) => {
      if (!tableFunctions.has(name) && !scalarFunctions.has(name)) throw new Error("Unexpected QA RPC");
      const entries = Object.entries(args);
      if (entries.some(([key]) => !/^p_[a-z][a-z0-9_]*$/.test(key))) throw new Error("Unexpected QA parameter");
      const call = `public.${name}(${entries.map(([key], index) => `${key} => $${index + 1}`).join(",")})`;
      // JSON output reproduces RPC timestamp/scalar serialization, without mocking SQL results.
      const sql = tableFunctions.has(name)
        ? `SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) AS data FROM ${call} AS r`
        : `SELECT to_jsonb(${call}) AS data`;
      try {
        const data = (await worker.query(sql, entries.map(([, value]) => value))).rows[0].data;
        if (name === "finalize_leased_nfc_recovery" && state.loseFinalizeResponse) {
          state.loseFinalizeResponse = false;
          return { data: null, error: { message: "QA connection lost after database commit" } };
        }
        return { data, error: null };
      }
      catch (error) { return { data: null, error: { message: error instanceof Error ? error.message : "QA database error" } }; }
    };
    bytes = await sharp({ create: { width: 4, height: 5, channels: 3, background: "white" } }).webp().toBuffer();
    await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing QA HTTP listener");
    state.origin = `http://127.0.0.1:${address.port}`;
  }, 120000);
  beforeEach(async () => {
    vi.stubEnv("CRON_SECRET", secret); vi.stubEnv("NFC_EVIDENCE_WORKER_ENABLED", "true");
    state.status = 200; state.corrupt = false; state.hits = 0; state.loseFinalizeResponse = false;
    state.beforeResponse = async () => {};
    // Isolate cases without deleting immutable evidence or modifying its lifecycle guards.
    await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=clock_timestamp()+interval '1 day'");
    actor = randomUUID(); tag = randomUUID(); operator = randomUUID();
    await admin.query("INSERT INTO public.admin_users VALUES($1,true)", [actor]);
    await admin.query("INSERT INTO public.admin_users VALUES($1,true)", [operator]);
    await admin.query("INSERT INTO public.admin_user_roles VALUES($1,1)", [operator]);
    await admin.query("INSERT INTO public.nfc_tags(nfc_tag_id,version,status) VALUES($1,1,'draft')", [tag]);
  });
  afterAll(async () => {
    vi.unstubAllEnvs(); server.closeAllConnections();
    if (server.listening) await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    try { await Promise.all(clients.map(client => client.end())); }
    finally { if (started) docker(["rm", "-f", container]); }
  }, 120000);
  async function prepare() {
    const intent = await prepareNfcEvidenceUpload({ request_id: randomUUID(), actor_id: actor, nfc_tag_id: tag,
      tag_version: 1, provider: "supabase", provider_account: "local-qa", storage_prefix: "nfc-evidence",
      sha256: createHash("sha256").update(bytes).digest("hex"), size_bytes: bytes.length, width: 4, height: 5 });
    await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=clock_timestamp() WHERE asset_id=$1", [intent.asset_id]);
    return intent;
  }
  const run = () => runAuthorizedNfcRecovery(`Bearer ${secret}`);
  async function snapshot(assetId: string) {
    return (await admin.query(`SELECT i.state,j.completed_at,j.lease_token,j.review_required,j.last_outcome,j.attempt_count,
      (SELECT count(*)::integer FROM public.nfc_evidence_assets a WHERE a.asset_id=i.asset_id) AS assets
      FROM public.nfc_evidence_upload_intents i JOIN public.nfc_evidence_recovery_jobs j USING(asset_id) WHERE i.asset_id=$1`, [assetId])).rows[0];
  }
  it("recovers stored bytes exactly once after the upload response was lost", async () => {
    const intent = await prepare();
    expect(await run()).toEqual({ status: "completed" });
    expect(await snapshot(intent.asset_id)).toMatchObject({ state: "available", assets: 1, lease_token: null, attempt_count: 1 });
    expect((await snapshot(intent.asset_id)).completed_at).not.toBeNull();
    expect(await run()).toEqual({ status: "idle" });
    expect(state.hits).toBe(1);
  });
  it.each([404, 503])("defers HTTP %s without registering or completing the asset", async status => {
    const intent = await prepare(); state.status = status;
    const outcome = status === 404 ? "absent" : "provider_unavailable";
    expect(await run()).toEqual({ status: "deferred", outcome });
    expect(await snapshot(intent.asset_id)).toMatchObject({ state: "prepared", assets: 0, completed_at: null,
      lease_token: null, review_required: false, last_outcome: outcome });
    expect(await run()).toEqual({ status: "idle" });
  });
  it("quarantines a content mismatch without trusting HTTP success", async () => {
    const intent = await prepare(); state.corrupt = true;
    expect(await run()).toEqual({ status: "review", outcome: "content_conflict" });
    expect(await snapshot(intent.asset_id)).toMatchObject({ assets: 0, completed_at: null, review_required: true, lease_token: null });
  });
  it("denies expired work then lets a replacement lease recover once", async () => {
    const intent = await prepare();
    state.beforeResponse = async () => {
      await admin.query(`UPDATE public.nfc_evidence_recovery_jobs SET last_attempt_at=clock_timestamp()-interval '2 seconds',
        lease_expires_at=clock_timestamp()-interval '1 second' WHERE asset_id=$1`, [intent.asset_id]);
    };
    expect(await run()).toEqual({ status: "lease_lost" });
    expect(await snapshot(intent.asset_id)).toMatchObject({ state: "prepared", assets: 0, completed_at: null });
    state.beforeResponse = async () => {};
    expect(await run()).toEqual({ status: "completed" });
    expect(await snapshot(intent.asset_id)).toMatchObject({ assets: 1, attempt_count: 2, lease_token: null });
  });
  it("rechecks tag authority after provider I/O and sends revoked tags to review", async () => {
    const intent = await prepare();
    state.beforeResponse = async () => { await admin.query("UPDATE public.nfc_tags SET status='revoked' WHERE nfc_tag_id=$1", [tag]); };
    expect(await run()).toEqual({ status: "review", outcome: "tag_changed" });
    expect(await snapshot(intent.asset_id)).toMatchObject({ state: "prepared", assets: 0, completed_at: null, review_required: true });
  });
  it("rejects unauthenticated calls before claiming durable work", async () => {
    const intent = await prepare();
    await expect(runAuthorizedNfcRecovery(null)).rejects.toThrow("NFC_RECOVERY_UNAUTHORIZED");
    expect(await snapshot(intent.asset_id)).toMatchObject({ attempt_count: 0, lease_token: null, assets: 0 });
    expect(state.hits).toBe(0);
  });
  it("keeps one committed asset when the database finalization response is lost", async () => {
    const intent = await prepare(); state.loseFinalizeResponse = true;
    await expect(run()).rejects.toThrow("NFC_RECOVERY_PROCESSING_FAILED");
    expect(await snapshot(intent.asset_id)).toMatchObject({ state: "available", assets: 1, lease_token: null, attempt_count: 1 });
    expect((await snapshot(intent.asset_id)).completed_at).not.toBeNull();
    expect(await run()).toEqual({ status: "idle" });
    expect(state.hits).toBe(1);
  });
  it("retains an expired tombstone and reviews a later arrival instead of registering it", async () => {
    const intent = await prepare();
    // Fixture-only time travel; re-enable guards before any worker action.
    await admin.query("ALTER TABLE public.nfc_evidence_upload_intents DISABLE TRIGGER USER");
    try {
      await admin.query("UPDATE public.nfc_evidence_upload_intents SET created_at=clock_timestamp()-interval '25 hours' WHERE asset_id=$1", [intent.asset_id]);
    } finally { await admin.query("ALTER TABLE public.nfc_evidence_upload_intents ENABLE TRIGGER USER"); }
    state.status = 404;
    expect(await run()).toEqual({ status: "deferred", outcome: "absent" });
    expect(await snapshot(intent.asset_id)).toMatchObject({ state: "abandoned", assets: 0, completed_at: null, lease_token: null });
    await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=clock_timestamp() WHERE asset_id=$1", [intent.asset_id]);
    state.status = 200;
    expect(await run()).toEqual({ status: "review", outcome: "content_conflict" });
    expect(await snapshot(intent.asset_id)).toMatchObject({ state: "abandoned", assets: 0, completed_at: null, review_required: true, attempt_count: 2 });
  });
  it("leaves queued work untouched while the worker gate is disabled", async () => {
    const intent = await prepare(); vi.stubEnv("NFC_EVIDENCE_WORKER_ENABLED", "false");
    expect(await run()).toEqual({ status: "disabled" });
    expect(await snapshot(intent.asset_id)).toMatchObject({ state: "prepared", attempt_count: 0, assets: 0, lease_token: null });
    expect(state.hits).toBe(0);
  });
  it("records actual transitions atomically and returns only scoped metadata", async () => {
    const intent = await prepare(); state.status = 503;
    await run();
    await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=clock_timestamp() WHERE asset_id=$1", [intent.asset_id]);
    state.status = 200; await run();
    const events = (await worker.query("SELECT event_type FROM public.nfc_evidence_recovery_events WHERE asset_id=$1 ORDER BY event_id", [intent.asset_id])).rows;
    expect(events.map(event => event.event_type)).toEqual(["queued", "claimed", "renewed", "deferred", "claimed", "renewed", "completed"]);
    const result = await state.rpc("list_nfc_evidence_recovery", { p_tag_id: tag, p_page: 1 });
    expect(result.error).toBeNull();
    expect(result.data).toMatchObject({ page: 1, rows: [{ asset_id: intent.asset_id, status: "completed", intent_state: "available", last_outcome: null }] });
    const outcomes = (await worker.query("SELECT event_type,outcome FROM public.nfc_evidence_recovery_events WHERE asset_id=$1 AND event_type IN ('deferred','completed') ORDER BY event_id", [intent.asset_id])).rows;
    expect(outcomes).toEqual([{ event_type: "deferred", outcome: "provider_unavailable" }, { event_type: "completed", outcome: null }]);
    expect(await listNfcRecoveryReview({ tagId: tag })).toMatchObject({ page: 1, pageSize: 20, hasMore: false,
      rows: [{ asset_id: intent.asset_id, status: "completed" }] });
    for (const field of ["lease_token", "actor_id", "storage_path", "provider_account", "sha256", "object_key"]) {
      expect(JSON.stringify(result.data)).not.toContain(`"${field}"`);
    }
    expect(await state.rpc("list_nfc_evidence_recovery_history", { p_tag_id: randomUUID(), p_asset_id: intent.asset_id })).toEqual({ data: { rows: [] }, error: null });
    await admin.query("BEGIN");
    try {
      await admin.query("INSERT INTO public.nfc_evidence_recovery_events(asset_id,event_type,attempt_count,next_attempt_at) VALUES($1,'snapshot',2,clock_timestamp())", [intent.asset_id]);
    } finally { await admin.query("ROLLBACK"); }
    expect((await worker.query("SELECT count(*)::integer AS count FROM public.nfc_evidence_recovery_events WHERE asset_id=$1", [intent.asset_id])).rows[0].count).toBe(7);
    const pending = await prepare();
    await admin.query("BEGIN");
    try {
      await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET completed_at=clock_timestamp() WHERE asset_id=$1", [pending.asset_id]);
      expect((await admin.query("SELECT count(*)::integer AS count FROM public.nfc_evidence_recovery_events WHERE asset_id=$1", [pending.asset_id])).rows[0].count).toBe(2);
    } finally { await admin.query("ROLLBACK"); }
    expect((await worker.query("SELECT count(*)::integer AS count FROM public.nfc_evidence_recovery_events WHERE asset_id=$1", [pending.asset_id])).rows[0].count).toBe(1);
  });
  it("bounds tag pages and history cursors without exposing another tag", async () => {
    const intent = await prepare();
    // Synthetic journal entries exercise pagination independently of provider timing.
    await admin.query(`INSERT INTO public.nfc_evidence_recovery_events(asset_id,event_type,attempt_count,next_attempt_at)
      SELECT $1,'snapshot',0,clock_timestamp() FROM generate_series(1,24)`, [intent.asset_id]);
    const first = await state.rpc("list_nfc_evidence_recovery_history", { p_tag_id: tag, p_asset_id: intent.asset_id });
    const rows = (first.data as { rows: { event_id: string }[] }).rows;
    expect(rows).toHaveLength(21);
    expect(rows.every(row => typeof row.event_id === "string")).toBe(true);
    const second = await state.rpc("list_nfc_evidence_recovery_history", { p_tag_id: tag, p_asset_id: intent.asset_id, p_before_id: rows[19].event_id });
    expect((second.data as { rows: unknown[] }).rows).toHaveLength(5);
    const validated = await listNfcRecoveryReviewHistory({ tagId: tag, assetId: intent.asset_id });
    expect(validated.rows).toHaveLength(20); expect(validated.nextBeforeId).toBe(rows[19].event_id);
    expect(await state.rpc("list_nfc_evidence_recovery", { p_tag_id: randomUUID(), p_page: 1 })).toEqual({ data: { rows: [], page: 1 }, error: null });
    expect((await state.rpc("list_nfc_evidence_recovery", { p_tag_id: tag, p_page: 10001 })).error?.message).toBe("NFC_RECOVERY_FILTER_INVALID");
  });
  it("pages tag jobs with a 21-row lookahead and no duplicate boundary", async () => {
    await prepare(); await run();
    for (let index = 0; index < 20; index++) await prepare();
    const first = await listNfcRecoveryReview({ tagId: tag });
    const second = await listNfcRecoveryReview({ tagId: tag, page: 2 });
    expect(first.rows).toHaveLength(20); expect(first.hasMore).toBe(true);
    expect(second.rows).toHaveLength(1); expect(second.hasMore).toBe(false);
    expect(new Set([...first.rows, ...second.rows].map(row => row.asset_id)).size).toBe(21);
  });
  it("denies browser roles and service-role journal mutation", async () => {
    const intent = await prepare();
    await expect(worker.query("DELETE FROM public.nfc_evidence_recovery_events WHERE asset_id=$1", [intent.asset_id])).rejects.toThrow(/permission denied/);
    await expect(worker.query("UPDATE public.nfc_evidence_recovery_events SET outcome='absent' WHERE asset_id=$1", [intent.asset_id])).rejects.toThrow(/permission denied/);
    await expect(worker.query("INSERT INTO public.nfc_evidence_recovery_events(asset_id,event_type,attempt_count,next_attempt_at) VALUES($1,'queued',0,now())", [intent.asset_id])).rejects.toThrow(/permission denied/);
    for (const role of ["anon", "authenticated"]) {
      await admin.query(`SET ROLE ${role}`);
      try {
        await expect(admin.query("SELECT public.list_nfc_evidence_recovery($1,1)", [tag])).rejects.toThrow(/permission denied/);
        await expect(admin.query("SELECT public.list_nfc_evidence_recovery_history($1,$2)", [tag, intent.asset_id])).rejects.toThrow(/permission denied/);
        await expect(admin.query("SELECT * FROM public.nfc_evidence_recovery_events")).rejects.toThrow(/permission denied/);
      } finally { await admin.query("RESET ROLE"); }
    }
  });
  it("backfills one truthful snapshot without inventing historical attempts", async () => {
    expect((await worker.query("SELECT event_type,attempt_count FROM public.nfc_evidence_recovery_events WHERE asset_id=$1", [snapshotAsset])).rows)
      .toEqual([{ event_type: "snapshot", attempt_count: 0 }]);
  });
  async function retryCandidate() {
    const intent = await prepare(); state.status = 503; await run();
    await admin.query(`UPDATE public.nfc_evidence_recovery_jobs SET last_attempt_at=clock_timestamp()-interval '2 minutes',
      next_attempt_at=clock_timestamp()+interval '1 hour' WHERE asset_id=$1`, [intent.asset_id]);
    return { p_request_id: randomUUID(), p_tag_id: tag, p_asset_id: intent.asset_id, p_operator_id: operator,
      p_attempt_count: 1, p_reason: "provider_restored" };
  }
  const retry = (args: Record<string, unknown>) => state.rpc("request_nfc_evidence_recovery_retry", args);
  it("atomically queues an operator retry once and preserves acknowledgement after worker progress", async () => {
    const args = await retryCandidate();
    const requestId = await enqueueNfcRecoveryRetry({ requestId: args.p_request_id, tagId: args.p_tag_id, assetId: args.p_asset_id,
      operatorId: args.p_operator_id, expectedAttemptCount: args.p_attempt_count, reason: args.p_reason });
    const first = { data: requestId, error: null };
    expect(first).toEqual({ data: args.p_request_id, error: null });
    expect(await snapshot(args.p_asset_id)).toMatchObject({ attempt_count: 1, assets: 0, lease_token: null, last_outcome: "provider_unavailable" });
    state.status = 200; expect(await run()).toEqual({ status: "completed" });
    expect(await retry(args)).toEqual(first);
    expect((await admin.query("SELECT count(*)::int AS count FROM public.audit_logs WHERE action='nfc_recovery.retry_requested' AND entity_id=$1", [args.p_asset_id])).rows[0].count).toBe(1);
    expect((await worker.query("SELECT count(*)::int AS count FROM public.nfc_evidence_recovery_events WHERE event_type='retry_requested' AND asset_id=$1", [args.p_asset_id])).rows[0].count).toBe(1);
    expect(await snapshot(args.p_asset_id)).toMatchObject({ assets: 1, attempt_count: 2 });
    expect((await listNfcRecoveryReviewHistory({ tagId: tag, assetId: args.p_asset_id })).rows.some(event => event.event_type === "retry_requested")).toBe(true);
  });
  it("rejects changed retry request bindings without a second audit", async () => {
    const args = await retryCandidate(); await retry(args);
    expect((await retry({ ...args, p_reason: "connectivity_restored" })).error?.message).toBe("NFC_RECOVERY_RETRY_REQUEST_CONFLICT");
  });
  it.each(["review", "completed", "leased", "due", "fresh", "stale_attempt"])("does not reset %s work", async mode => {
    const args = await retryCandidate();
    if (mode === "review") await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET review_required=true WHERE asset_id=$1", [args.p_asset_id]);
    if (mode === "completed") await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET completed_at=clock_timestamp() WHERE asset_id=$1", [args.p_asset_id]);
    if (mode === "due" || mode === "leased") await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=clock_timestamp() WHERE asset_id=$1", [args.p_asset_id]);
    if (mode === "leased") await state.rpc("claim_nfc_evidence_recovery", { p_limit: 1 });
    if (mode === "fresh") await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET last_attempt_at=clock_timestamp() WHERE asset_id=$1", [args.p_asset_id]);
    const result = await retry({ ...args, ...(mode === "stale_attempt" ? { p_attempt_count: 0 } : {}) });
    expect(result.error?.message).toBe(mode === "stale_attempt" ? "NFC_RECOVERY_RETRY_STALE" : "NFC_RECOVERY_RETRY_UNAVAILABLE");
    expect((await admin.query("SELECT count(*)::int AS count FROM public.audit_logs WHERE entity_id=$1", [args.p_asset_id])).rows[0].count).toBe(0);
  });
  it("requires active current grants, including on exact request replay", async () => {
    const args = await retryCandidate();
    await admin.query("DELETE FROM public.admin_user_roles WHERE admin_id=$1", [operator]);
    expect((await retry(args)).error?.message).toBe("NFC_RECOVERY_RETRY_FORBIDDEN");
    await admin.query("INSERT INTO public.admin_user_roles VALUES($1,2)", [operator]);
    expect((await retry(args)).error).toBeNull();
    await admin.query("DELETE FROM public.admin_user_roles WHERE admin_id=$1", [operator]);
    expect((await retry(args)).error?.message).toBe("NFC_RECOVERY_RETRY_FORBIDDEN");
  });
  it("rechecks original owner and live tag authority", async () => {
    const args = await retryCandidate();
    await admin.query("UPDATE public.admin_users SET is_active=false WHERE admin_id=$1", [actor]);
    expect((await retry(args)).error?.message).toBe("NFC_UPLOAD_ACTOR_UNAVAILABLE");
    await admin.query("UPDATE public.admin_users SET is_active=true WHERE admin_id=$1", [actor]);
    await admin.query("UPDATE public.nfc_tags SET version=2 WHERE nfc_tag_id=$1", [tag]);
    expect((await retry(args)).error?.message).toBe("NFC_VERSION_CONFLICT");
    expect((await retry({ ...args, p_tag_id: randomUUID() })).error?.message).toBe("NFC_RECOVERY_RETRY_SCOPE_INVALID");
  });
  it("rolls back queue, receipt and journal if mandatory audit fails", async () => {
    const args = await retryCandidate();
    await admin.query(`CREATE FUNCTION public.fail_retry_audit_qa() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'QA mandatory audit unavailable'; END $$;
      CREATE TRIGGER fail_retry_audit_qa BEFORE INSERT ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION public.fail_retry_audit_qa();`);
    try { expect((await retry(args)).error?.message).toBe("QA mandatory audit unavailable"); }
    finally { await admin.query("DROP TRIGGER fail_retry_audit_qa ON public.audit_logs; DROP FUNCTION public.fail_retry_audit_qa()"); }
    expect((await worker.query("SELECT count(*)::int AS count FROM public.nfc_evidence_recovery_retry_requests WHERE request_id=$1", [args.p_request_id])).rows[0].count).toBe(0);
    expect((await worker.query("SELECT count(*)::int AS count FROM public.nfc_evidence_recovery_events WHERE asset_id=$1 AND event_type='retry_requested'", [args.p_asset_id])).rows[0].count).toBe(0);
    expect(await run()).toEqual({ status: "idle" });
    expect((await retry(args)).error).toBeNull();
  });
  const retrySql = "SELECT public.request_nfc_evidence_recovery_retry($1,$2,$3,$4,$5,$6) AS request_id";
  const retryValues = (args: Awaited<ReturnType<typeof retryCandidate>>) => [args.p_request_id,args.p_tag_id,args.p_asset_id,args.p_operator_id,args.p_attempt_count,args.p_reason];
  it.each([true,false])("serializes simultaneous retries (same request: %s)", async same => {
    const args = await retryCandidate(); const other = { ...args, p_request_id: same ? args.p_request_id : randomUUID() };
    const results = await Promise.allSettled([worker.query(retrySql,retryValues(args)),peer.query(retrySql,retryValues(other))]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(same ? 2 : 1);
    expect((await admin.query("SELECT count(*)::int AS count FROM public.audit_logs WHERE entity_id=$1", [args.p_asset_id])).rows[0].count).toBe(1);
    expect((await worker.query("SELECT count(*)::int AS count FROM public.nfc_evidence_recovery_retry_requests WHERE asset_id=$1", [args.p_asset_id])).rows[0].count).toBe(1);
  });
  async function waitForLock(pid: unknown) {
    for (let attempt = 0; attempt < 80; attempt++) {
      if ((await admin.query("SELECT wait_event_type FROM pg_stat_activity WHERE pid=$1", [pid])).rows[0]?.wait_event_type === "Lock") return;
      await new Promise(resolve => setTimeout(resolve,25));
    }
    throw new Error("Expected concurrent PostgreSQL lock wait");
  }
  it("holds the qualifying permission until retry commit, then denies revoked replay", async () => {
    const args = await retryCandidate();
    const workerPid = (await worker.query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
    const controlPid = (await control.query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
    await admin.query("BEGIN");
    await admin.query("SELECT asset_id FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1 FOR UPDATE", [args.p_asset_id]);
    const pending = retry(args);
    let revoke: Promise<unknown> | undefined;
    try {
      await waitForLock(workerPid);
      revoke = control.query("DELETE FROM public.admin_user_roles WHERE admin_id=$1", [operator]);
      await waitForLock(controlPid);
    } finally { await admin.query("COMMIT"); }
    expect((await pending).error).toBeNull(); await revoke;
    expect((await retry(args)).error?.message).toBe("NFC_RECOVERY_RETRY_FORBIDDEN");
  });
  it("denies new retry RPC and receipt access to browser roles", async () => {
    const args = await retryCandidate();
    for (const role of ["anon","authenticated"]) {
      await admin.query(`SET ROLE ${role}`);
      try {
        await expect(admin.query(retrySql,retryValues(args))).rejects.toThrow(/permission denied/);
        await expect(admin.query("SELECT * FROM public.nfc_evidence_recovery_retry_requests")).rejects.toThrow(/permission denied/);
      } finally { await admin.query("RESET ROLE"); }
    }
    await expect(worker.query("DELETE FROM public.nfc_evidence_recovery_retry_requests")).rejects.toThrow(/permission denied/);
  });
  it("rejects invalid reason, inactive operator and cross-operator replay", async () => {
    const args = await retryCandidate();
    expect((await retry({ ...args, p_reason: "override_content" })).error?.message).toBe("NFC_RECOVERY_RETRY_INPUT_INVALID");
    await admin.query("UPDATE public.admin_users SET is_active=false WHERE admin_id=$1", [operator]);
    expect((await retry(args)).error?.message).toBe("NFC_RECOVERY_RETRY_FORBIDDEN");
    await admin.query("UPDATE public.admin_users SET is_active=true WHERE admin_id=$1", [operator]);
    await retry(args); await admin.query("INSERT INTO public.admin_user_roles VALUES($1,1)", [actor]);
    expect((await retry({ ...args, p_operator_id: actor })).error?.message).toBe("NFC_RECOVERY_RETRY_REQUEST_CONFLICT");
  });
  it("does not reschedule work that becomes due during an authority lock wait", async () => {
    const args = await retryCandidate();
    const pid = (await worker.query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
    await admin.query("UPDATE public.nfc_evidence_recovery_jobs SET next_attempt_at=clock_timestamp()+interval '3 seconds' WHERE asset_id=$1", [args.p_asset_id]);
    await admin.query("BEGIN"); await admin.query("SELECT nfc_tag_id FROM public.nfc_tags WHERE nfc_tag_id=$1 FOR UPDATE", [tag]);
    const pending = retry(args);
    try {
      await waitForLock(pid);
      await admin.query("SELECT pg_sleep(greatest(0,extract(epoch FROM next_attempt_at-clock_timestamp()))+0.1) FROM public.nfc_evidence_recovery_jobs WHERE asset_id=$1", [args.p_asset_id]);
    } finally { await admin.query("COMMIT"); }
    expect((await pending).error?.message).toBe("NFC_RECOVERY_RETRY_UNAVAILABLE");
  }, 15000);
  it("accepts explicit system.all but never an inactive role", async () => {
    const args = await retryCandidate();
    await admin.query("UPDATE public.admin_user_roles SET role_id=3 WHERE admin_id=$1", [operator]);
    expect((await retry(args)).error?.message).toBe("NFC_RECOVERY_RETRY_FORBIDDEN");
    await admin.query("INSERT INTO public.role_permissions VALUES(3,2)");
    try {
      expect((await retry(args)).error).toBeNull();
      await admin.query("UPDATE public.roles SET is_active=false WHERE role_id=3");
      expect((await retry(args)).error?.message).toBe("NFC_RECOVERY_RETRY_FORBIDDEN");
    } finally {
      await admin.query("UPDATE public.roles SET is_active=true WHERE role_id=3");
      await admin.query("DELETE FROM public.role_permissions WHERE role_id=3 AND permission_id=2");
    }
  });
});
