import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => mocks }));
import { readNfcEvidenceAsset, registerNfcEvidenceAsset } from "@/lib/repositories/nfc-evidence.repository";
const id = "11111111-1111-4111-8111-111111111111";
const metadata = { asset_id: id, nfc_tag_id: id, tag_version: 2, actor_id: id, provider: "supabase" as const,
  storage_path: `nfc-evidence/${id}.webp`, sha256: "a".repeat(64), size_bytes: 100, width: 800, height: 600 };
beforeEach(() => {
  vi.resetAllMocks(); mocks.from.mockReturnValue(mocks); mocks.select.mockReturnValue(mocks); mocks.eq.mockReturnValue(mocks);
});
it("maps validated immutable metadata explicitly and checks the returned ID", async () => {
  mocks.rpc.mockResolvedValue({ data: id, error: null });
  expect(await registerNfcEvidenceAsset(metadata)).toBe(id);
  expect(mocks.rpc).toHaveBeenCalledWith("register_nfc_evidence_asset", {
    p_asset_id: id, p_tag_id: id, p_version: 2, p_actor_id: id, p_provider: "supabase",
    p_path: metadata.storage_path, p_sha256: metadata.sha256, p_size: 100, p_width: 800, p_height: 600,
  });
  mocks.rpc.mockResolvedValue({ data: null, error: null });
  await expect(registerNfcEvidenceAsset(metadata)).rejects.toThrow("NFC_EVIDENCE_RESPONSE_INVALID");
});
it("rejects invalid dimensions and strips no unexpected input silently", async () => {
  await expect(registerNfcEvidenceAsset({ ...metadata, width: 2561 })).rejects.toThrow();
  await expect(registerNfcEvidenceAsset({ ...metadata, size_bytes: 3 * 1024 * 1024 })).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("contains private database messages and preserves actionable conflicts", async () => {
  mocks.rpc.mockResolvedValue({ error: { message: "private DB info" } });
  await expect(registerNfcEvidenceAsset(metadata)).rejects.toThrow("NFC_EVIDENCE_REGISTER_FAILED");
  mocks.rpc.mockResolvedValue({ error: { message: "NFC_VERSION_CONFLICT" } });
  await expect(registerNfcEvidenceAsset(metadata)).rejects.toThrow("NFC_VERSION_CONFLICT");
  mocks.maybeSingle.mockResolvedValue({ error: { message: "private DB info" } });
  await expect(readNfcEvidenceAsset(id)).rejects.toThrow("NFC_EVIDENCE_READ_FAILED");
});
it.each([null, [], { request_id: id }, [{ request_id: id }]])("normalizes the bounded PostgREST relationship %j", async (relation) => {
  mocks.maybeSingle.mockResolvedValue({ data: { ...metadata, created_at: "2026-09-09T00:00:00+00:00", nfc_field_check_photos: relation }, error: null });
  const result = await readNfcEvidenceAsset(id);
  expect(result?.nfc_field_check_photos).toEqual(relation === null || (Array.isArray(relation) && relation.length === 0) ? [] : [{ request_id: id }]);
  expect(mocks.eq).toHaveBeenCalledWith("asset_id", id);
});
