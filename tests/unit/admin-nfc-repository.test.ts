import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ result: { data: [] as unknown[] | null, count: 0, error: null as unknown }, calls: [] as unknown[] }));
const query = vi.hoisted(() => {
  const q: Record<string, unknown> = {};
  for (const method of ["select", "eq", "ilike", "order", "range", "lt", "limit", "update", "maybeSingle", "insert", "single"]) {
    q[method] = (...args: unknown[]) => { mock.calls.push([method, ...args]); return q; };
  }
  q.then = (resolve: (value: unknown) => unknown) => Promise.resolve(mock.result).then(resolve);
  return q;
});
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ from: () => query }) }));
import { listAdminNfcTags, listAdminNfcEvents, updateAdminNfcTag, readAdminNfcReplacement, insertAdminNfcTag } from "@/lib/repositories/admin-nfc.repository";

describe("admin NFC bounded queries", () => {
  beforeEach(() => { mock.calls = []; mock.result = { data: [], count: 0, error: null }; });
  it("escapes wildcard searches and scopes a stable paginated result", async () => {
    await listAdminNfcTags({ page: 2, checkinCodeId: 10, status: "active", q: "A_50%" });
    expect(mock.calls).toContainEqual(["ilike", "label", "%A\\_50\\%%"]);
    expect(mock.calls).toContainEqual(["eq", "checkin_code_id", 10]);
    expect(mock.calls).toContainEqual(["range", 20, 39]);
    expect(mock.calls).toContainEqual(["order", "nfc_tag_id"]);
  });
  it("uses a strict version cursor for history and bounded lookahead", async () => {
    await listAdminNfcEvents("tag", 22);
    expect(mock.calls).toContainEqual(["lt", "version", 22]);
    expect(mock.calls).toContainEqual(["limit", 21]);
  });
  it("returns only the audit actor display name, not account identifiers", async () => {
    mock.result.data = [{ version: 2, event_type: "activated", status: "active", reason: "Installed", occurred_at: "2026-09-07T00:00:00Z", actor: { display_name: "Test staff", email: "private@example.test", admin_id: "private" } }];
    const result = await listAdminNfcEvents("tag");
    expect(result.rows[0]).toHaveProperty("actor_name", "Test staff");
    expect(JSON.stringify(result)).not.toContain("private");
    const selection = mock.calls.find((call) => Array.isArray(call) && call[0] === "select");
    expect(selection).toEqual(["select", "version,event_type,status,reason,occurred_at,actor:admin_users!actor_id(display_name)"]);
  });
  it.each([null, { display_name: null }, { display_name: "   " }])("keeps unavailable actor names explicit %#", async (actor) => {
    mock.result.data = [{ version: 1, event_type: "registered", status: "draft", reason: "Created", occurred_at: "2026-09-07T00:00:00Z", actor }];
    expect((await listAdminNfcEvents("tag")).rows[0]).toHaveProperty("actor_name", null);
  });
  it("rejects an update whose observed version no longer matches", async () => {
    mock.result.data = null;
    await expect(updateAdminNfcTag("tag", 3, { status: "active" })).rejects.toThrow("NFC_VERSION_CONFLICT");
    expect(mock.calls).toContainEqual(["eq", "version", 3]);
  });
  it("looks up only the unique replacement of the original tag", async () => {
    mock.result.data = null;
    expect(await readAdminNfcReplacement("tag")).toBeNull();
    expect(mock.calls).toContainEqual(["eq", "replaces_tag_id", "tag"]);
    expect(mock.calls).toContainEqual(["maybeSingle"]);
  });
  it("keeps a tag deep link scoped to its check-in code", async () => {
    await listAdminNfcTags({ page: 1, checkinCodeId: 10, tagId: "tag" });
    expect(mock.calls).toContainEqual(["eq", "nfc_tag_id", "tag"]);
    expect(mock.calls).toContainEqual(["eq", "checkin_code_id", 10]);
  });
  it.each([["23505", "NFC_CREATE_CONFLICT"], ["42501", "NFC_CREATE_FAILED"]])("maps create error %s without leaking details", async (code, expected) => {
    mock.result.error = { code, message: "private database detail" };
    await expect(insertAdminNfcTag({ checkinCodeId: 10, label: "Test", reason: "Replacement" }, "admin")).rejects.toThrow(expected);
  });
});
