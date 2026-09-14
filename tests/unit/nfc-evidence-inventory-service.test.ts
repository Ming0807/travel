// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ guard: vi.fn(), list: vi.fn(), audit: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.guard }));
vi.mock("@/lib/repositories/nfc-evidence-inventory.repository", () => ({ listNfcEvidenceInventory: mocks.list }));
vi.mock("@/lib/services/audit-log.service", () => ({ logAuditAction: mocks.audit }));
import { getAdminNfcEvidenceInventoryAction } from "@/app/actions/admin-nfc-inventory-actions";
const tagId = "40000000-0000-4000-8000-000000000001";
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("NFC_EVIDENCE_INVENTORY_ENABLED", "true");
  mocks.guard.mockResolvedValue({ actor: { adminId: tagId } });
  mocks.list.mockResolvedValue({ rows: [], nextAfterAssetId: null });
});
afterEach(() => vi.unstubAllEnvs());
it("checks permission and records bounded read metadata", async () => {
  expect(await getAdminNfcEvidenceInventoryAction({ tagId })).toEqual({ success: true, enabled: true, rows: [], nextAfterAssetId: null });
  expect(mocks.guard).toHaveBeenCalledWith("checkin_code.manage", { unauthenticated: "throw" });
  expect(mocks.guard.mock.invocationCallOrder[0]).toBeLessThan(mocks.list.mock.invocationCallOrder[0]);
  expect(mocks.audit).toHaveBeenCalledWith({ actor: { adminId: tagId }, action: "nfc_evidence.inventory_read", entityType: "nfc_tag", entityId: tagId,
    metadata: { count: 0, hasMore: false } });
});
it.each([undefined, "", "false"])("does not access held tables when disabled (%s)", async value => {
  vi.stubEnv("NFC_EVIDENCE_INVENTORY_ENABLED", value);
  expect(await getAdminNfcEvidenceInventoryAction({ tagId })).toEqual({ success: true, enabled: false });
  expect(mocks.guard).toHaveBeenCalled(); expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.audit).not.toHaveBeenCalled();
});
it("rejects a malformed flag without reading", async () => {
  vi.stubEnv("NFC_EVIDENCE_INVENTORY_ENABLED", "yes");
  expect(await getAdminNfcEvidenceInventoryAction({ tagId })).toMatchObject({ success: false }); expect(mocks.list).not.toHaveBeenCalled();
});
it("does not disclose errors or read rows on denial", async () => {
  mocks.guard.mockRejectedValue(new Error("private session detail"));
  const result = await getAdminNfcEvidenceInventoryAction({ tagId });
  expect(result).toMatchObject({ success: false }); expect(JSON.stringify(result)).not.toContain("private session detail");
  expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.audit).not.toHaveBeenCalled();
});
it.each([{ tagId: "bad" }, { tagId, path: "private/path" }])("validates before reading", async input => {
  expect(await getAdminNfcEvidenceInventoryAction(input)).toMatchObject({ success: false }); expect(mocks.list).not.toHaveBeenCalled();
});
it("sanitizes repository failure without recording a successful read", async () => {
  mocks.list.mockRejectedValue(new Error("private locator"));
  const result = await getAdminNfcEvidenceInventoryAction({ tagId });
  expect(result).toMatchObject({ success: false }); expect(JSON.stringify(result)).not.toContain("private locator");
  expect(mocks.audit).not.toHaveBeenCalled();
});
