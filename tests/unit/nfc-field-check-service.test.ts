import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ permission: vi.fn(), insert: vi.fn(), list: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.permission }));
vi.mock("@/lib/repositories/nfc-field-check.repository", () => ({ insertNfcFieldCheck: mocks.insert, listNfcFieldChecks: mocks.list }));
import { recordNfcFieldCheck, getNfcFieldChecks } from "@/lib/services/nfc-field-check.service";
const id = "11111111-1111-4111-8111-111111111111";
const input = { requestId: id, tagId: id, version: 2, locationNote: "Gate", deviceLabel: "Pixel Chrome", platform: "android", nfcResult: "passed", qrResult: "passed", notes: "", evidenceReference: "" };
beforeEach(() => { vi.resetAllMocks(); mocks.permission.mockResolvedValue({ adminId: id }); });
it("takes inspector identity from the authenticated guard only", async () => {
  await recordNfcFieldCheck(input);
  expect(mocks.permission).toHaveBeenCalledWith("checkin_code.manage");
  expect(mocks.insert).toHaveBeenCalledWith(input, id);
  await expect(recordNfcFieldCheck({ ...input, actorId: id })).rejects.toThrow();
  expect(mocks.insert).toHaveBeenCalledTimes(1);
});
it("denies writes and reads before repository access", async () => {
  mocks.permission.mockRejectedValue(new Error("denied"));
  await expect(recordNfcFieldCheck(input)).rejects.toThrow("denied");
  await expect(getNfcFieldChecks({ tagId: id })).rejects.toThrow("denied");
  expect(mocks.insert).not.toHaveBeenCalled(); expect(mocks.list).not.toHaveBeenCalled();
});
it("requires read permission and bounded pagination", async () => {
  await getNfcFieldChecks({ tagId: id });
  expect(mocks.permission).toHaveBeenCalledWith("checkin_code.read");
  expect(mocks.list).toHaveBeenCalledWith(id, 1);
  await expect(getNfcFieldChecks({ tagId: id, page: 0 })).rejects.toThrow();
  expect(mocks.list).toHaveBeenCalledTimes(1);
});
