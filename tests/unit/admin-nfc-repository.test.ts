import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ result: { data: [] as unknown[] | null, count: 0, error: null as unknown }, calls: [] as unknown[] }));
const query = vi.hoisted(() => {
  const q: Record<string, unknown> = {};
  for (const method of ["select", "eq", "ilike", "order", "range", "lt", "limit", "update", "maybeSingle"]) {
    q[method] = (...args: unknown[]) => { mock.calls.push([method, ...args]); return q; };
  }
  q.then = (resolve: (value: unknown) => unknown) => Promise.resolve(mock.result).then(resolve);
  return q;
});
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ from: () => query }) }));
import { listAdminNfcTags, listAdminNfcEvents, updateAdminNfcTag } from "@/lib/repositories/admin-nfc.repository";

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
  it("rejects an update whose observed version no longer matches", async () => {
    mock.result.data = null;
    await expect(updateAdminNfcTag("tag", 3, { status: "active" })).rejects.toThrow("NFC_VERSION_CONFLICT");
    expect(mock.calls).toContainEqual(["eq", "version", 3]);
  });
});
