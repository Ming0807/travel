import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn(), range: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => mocks }));
import { insertNfcFieldCheck, listNfcFieldChecks } from "@/lib/repositories/nfc-field-check.repository";
const id = "11111111-1111-4111-8111-111111111111";
const input = { requestId: id, tagId: id, version: 2, locationNote: "Gate", deviceLabel: "Pixel Chrome", platform: "android" as const, nfcResult: "passed" as const, qrResult: "passed" as const, notes: "", evidenceReference: "" };
beforeEach(() => {
  vi.resetAllMocks();
  mocks.from.mockReturnValue(mocks); mocks.select.mockReturnValue(mocks);
  mocks.eq.mockReturnValue(mocks); mocks.order.mockReturnValue(mocks);
});
it("maps explicit validated fields and verifies the idempotency result", async () => {
  mocks.rpc.mockResolvedValue({ data: id, error: null });
  expect(await insertNfcFieldCheck(input, id)).toBe(id);
  expect(mocks.rpc).toHaveBeenCalledWith("record_nfc_field_check", {
    p_request_id: id, p_tag_id: id, p_version: 2, p_actor_id: id, p_location: "Gate",
    p_device: "Pixel Chrome", p_platform: "android", p_nfc_result: "passed", p_qr_result: "passed",
    p_notes: "", p_evidence_reference: "",
  });
  mocks.rpc.mockResolvedValue({ data: null, error: null });
  await expect(insertNfcFieldCheck(input, id)).rejects.toThrow("NFC_FIELD_RESPONSE_INVALID");
});
it("preserves actionable conflicts but contains database details", async () => {
  mocks.rpc.mockResolvedValue({ error: { message: "NFC_VERSION_CONFLICT" } });
  await expect(insertNfcFieldCheck(input, id)).rejects.toThrow("NFC_VERSION_CONFLICT");
  mocks.rpc.mockResolvedValue({ error: { message: "private SQL details" } });
  await expect(insertNfcFieldCheck(input, id)).rejects.toThrow("NFC_FIELD_SAVE_FAILED");
});
it("bounds history to the exact tag and stable ten-row pages", async () => {
  mocks.range.mockResolvedValue({ data: [], count: 21, error: null });
  expect(await listNfcFieldChecks(id, 2)).toEqual({ rows: [], total: 21, page: 2, pageSize: 10 });
  expect(mocks.eq).toHaveBeenCalledWith("nfc_tag_id", id);
  expect(mocks.range).toHaveBeenCalledWith(10, 19);
  expect(mocks.order).toHaveBeenCalledWith("request_id", { ascending: false });
  await expect(listNfcFieldChecks(id, 10001)).rejects.toThrow();
  expect(mocks.from).toHaveBeenCalledTimes(1);
});
it("sends ordered photo IDs to only the atomic photo RPC without fallback", async () => {
  mocks.rpc.mockResolvedValue({ data: id, error: null });
  expect(await insertNfcFieldCheck({ ...input, assetIds: [id] }, id)).toBe(id);
  expect(mocks.rpc).toHaveBeenCalledWith("record_nfc_field_check_with_photos", expect.objectContaining({ p_asset_ids: [id], p_actor_id: id }));
  mocks.rpc.mockResolvedValue({ error: { message: "NFC_EVIDENCE_NOT_AVAILABLE" } });
  await expect(insertNfcFieldCheck({ ...input, assetIds: [id] }, id)).rejects.toThrow("NFC_EVIDENCE_NOT_AVAILABLE");
  expect(mocks.rpc).toHaveBeenCalledTimes(2);
  expect(mocks.rpc.mock.calls.every(call => call[0] === "record_nfc_field_check_with_photos")).toBe(true);
});
it("rejects duplicate and oversized photo lists before making any write", async () => {
  await expect(insertNfcFieldCheck({ ...input, assetIds: [id, id] }, id)).rejects.toThrow();
  await expect(insertNfcFieldCheck({ ...input, assetIds: [id, id, id, id] }, id)).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("includes only bounded ordered photo identifiers in enabled history", async () => {
  const other = "22222222-2222-4222-8222-222222222222";
  mocks.range.mockResolvedValue({ data: [{ request_id: id, nfc_tag_id: id, tag_version: 2, tag_status: "active", actor_id: id,
    location_note: "Gate", device_label: "Android", platform: "android", nfc_result: "passed", qr_result: "passed",
    notes: "", evidence_reference: "", reported_at: "2026-09-09T00:00:00Z",
    photos: [{ asset_id: other, position: 2 }, { asset_id: id, position: 1 }],
  }], count: 1, error: null });
  const result = await listNfcFieldChecks(id, 1, true);
  expect(result.rows[0].photos?.map(photo => photo.asset_id)).toEqual([id, other]);
  expect(mocks.select.mock.calls[0][0]).toContain("photos:nfc_field_check_photos(asset_id,position)");
  expect(mocks.select.mock.calls[0][0]).not.toContain("storage_path");
});
