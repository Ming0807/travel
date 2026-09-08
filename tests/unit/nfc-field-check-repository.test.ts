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
