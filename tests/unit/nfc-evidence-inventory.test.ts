// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: mocks.client }));
import { listNfcEvidenceInventory } from "@/lib/repositories/nfc-evidence-inventory.repository";
const id = (n: number) => `40000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const row = (n: number) => ({ asset_id: id(n), created_at: "2026-09-14T00:00:00Z", provider: "supabase", attached: false, has_intent: false, cleanup_state: "none" });
beforeEach(() => { vi.resetAllMocks(); mocks.client.mockReturnValue({ rpc: mocks.rpc }); mocks.rpc.mockResolvedValue({ data: { rows: [] }, error: null }); });
it("uses the displayed boundary, not the lookahead, as next cursor", async () => {
  mocks.rpc.mockResolvedValue({ data: { rows: Array.from({ length: 21 }, (_, n) => row(n + 1)) }, error: null });
  const result = await listNfcEvidenceInventory({ tagId: id(99) });
  expect(result.rows).toHaveLength(20); expect(result.nextAfterAssetId).toBe(id(20));
  expect(mocks.rpc).toHaveBeenCalledWith("list_nfc_evidence_inventory", { p_tag_id: id(99), p_after_asset_id: null });
});
it.each([{ tagId: "bad" }, { tagId: id(99), afterAssetId: "bad" }, { tagId: id(99), owner: id(1) }])("rejects invalid input before database access", async input => {
  await expect(listNfcEvidenceInventory(input)).rejects.toThrow(); expect(mocks.client).not.toHaveBeenCalled();
});
it.each([
  { rows: [row(1), row(1)] }, { rows: [row(2), row(1)] }, { rows: [{ ...row(1), storage_path: "private" }] },
  { rows: [{ ...row(1), attached: true, cleanup_state: "pending" }] }, { rows: [{ ...row(1), cleanup_state: "deleted" }] },
])("rejects malformed or private response rows", async ({ rows }) => {
  mocks.rpc.mockResolvedValue({ data: { rows }, error: null });
  await expect(listNfcEvidenceInventory({ tagId: id(99) })).rejects.toThrow("NFC_INVENTORY_RESPONSE_INVALID");
});
it("rejects a row at or behind the requested cursor", async () => {
  mocks.rpc.mockResolvedValue({ data: { rows: [row(1)] }, error: null });
  await expect(listNfcEvidenceInventory({ tagId: id(99), afterAssetId: id(1) })).rejects.toThrow("NFC_INVENTORY_RESPONSE_INVALID");
});
it("returns an empty page without inventing totals", async () => {
  expect(await listNfcEvidenceInventory({ tagId: id(99) })).toEqual({ rows: [], nextAfterAssetId: null });
});
it("does not expose database errors", async () => {
  mocks.rpc.mockResolvedValue({ data: null, error: { message: "private details" } });
  await expect(listNfcEvidenceInventory({ tagId: id(99) })).rejects.toThrow("NFC_INVENTORY_READ_FAILED");
});
