import { beforeEach, describe, expect, it, vi } from "vitest";
const repository = vi.hoisted(() => ({ readAdminNfcTag: vi.fn(), updateAdminNfcTag: vi.fn(), insertAdminNfcTag: vi.fn(), listAdminNfcTags: vi.fn(), listAdminNfcEvents: vi.fn() }));
const guard = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/guards", () => ({ requirePermission: guard }));
vi.mock("@/lib/repositories/admin-nfc.repository", () => repository);
import { changeNfcTag, createNfcTag, getNfcHistory, listNfcManagement } from "@/lib/services/admin-nfc.service";
const id = "11111111-1111-4111-8111-111111111111";
const tag = { nfc_tag_id: id, public_token: id, code_snapshot: "yala-001", status: "draft", verified_at: null, version: 2 };

describe("NFC management", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    guard.mockResolvedValue({ adminId: id });
    repository.readAdminNfcTag.mockResolvedValue(tag);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://tourism.example");
  });

  it("checks permission before a write or database read", async () => {
    guard.mockRejectedValue(new Error("FORBIDDEN"));
    await expect(createNfcTag({})).rejects.toThrow("FORBIDDEN");
    expect(repository.insertAdminNfcTag).not.toHaveBeenCalled();
    expect(guard).toHaveBeenCalledWith("checkin_code.manage");
  });

  it("defaults to a bounded first page", async () => {
    await listNfcManagement({});
    expect(guard).toHaveBeenCalledWith("checkin_code.read");
    expect(repository.listAdminNfcTags).toHaveBeenCalledWith({ page: 1 });
  });

  it("denies edits before looking up a tag when manage permission is missing", async () => {
    guard.mockRejectedValue(new Error("FORBIDDEN"));
    await expect(changeNfcTag({ operation: "status", tagId: id, version: 2, status: "active", reason: "Activate tag" })).rejects.toThrow("FORBIDDEN");
    expect(repository.readAdminNfcTag).not.toHaveBeenCalled();
    expect(repository.updateAdminNfcTag).not.toHaveBeenCalled();
  });

  it("requires read permission before returning history", async () => {
    guard.mockRejectedValue(new Error("FORBIDDEN"));
    await expect(getNfcHistory({ tagId: id })).rejects.toThrow("FORBIDDEN");
    expect(repository.listAdminNfcEvents).not.toHaveBeenCalled();
    expect(guard).toHaveBeenCalledWith("checkin_code.read");
  });

  it.each([{ tagId: "invalid" }, { tagId: id, beforeVersion: -1 }, { tagId: id, beforeVersion: 1.5 }])("rejects malformed history cursors %#", async (input) => {
    await expect(getNfcHistory(input)).rejects.toThrow();
    expect(repository.listAdminNfcEvents).not.toHaveBeenCalled();
  });

  it("returns history using only the validated tag and cursor", async () => {
    repository.listAdminNfcEvents.mockResolvedValue({ rows: [], nextVersion: null });
    await getNfcHistory({ tagId: id, beforeVersion: 5, adminId: "forged" });
    expect(repository.listAdminNfcEvents).toHaveBeenCalledWith(id, 5);
  });

  it("does not trust client-supplied actor or status when provisioning", async () => {
    await createNfcTag({ checkinCodeId: 10, label: "Entrance", reason: "Install tag", adminId: "forged", status: "active" });
    expect(repository.insertAdminNfcTag).toHaveBeenCalledWith({ checkinCodeId: 10, label: "Entrance", reason: "Install tag" }, id);
  });

  it("rejects stale edits", async () => {
    await expect(changeNfcTag({ operation: "status", tagId: id, version: 1, status: "revoked", reason: "Replace tag" })).rejects.toThrow("NFC_VERSION_CONFLICT");
    expect(repository.updateAdminNfcTag).not.toHaveBeenCalled();
  });

  it("requires separate verification before activation", async () => {
    await expect(changeNfcTag({ operation: "status", tagId: id, version: 2, status: "active", reason: "Install tag" })).rejects.toThrow("NFC_VERIFICATION_REQUIRED");
  });

  it("requires the exact configured-domain URL read from the tag", async () => {
    const input = { operation: "verify", tagId: id, version: 2, reason: "Read back", verificationReference: "Inspection 01" };
    await expect(changeNfcTag({ ...input, readBackUrl: `https://other.example/c/yala-001?nfc=${id}` })).rejects.toThrow("NFC_READBACK_MISMATCH");
    await changeNfcTag({ ...input, readBackUrl: `https://tourism.example/c/yala-001?nfc=${id}` });
    expect(repository.updateAdminNfcTag).toHaveBeenCalledWith(id, 2, expect.objectContaining({ verified_by: id, updated_by: id, verification_reference: "Inspection 01" }));
  });

  it("never resurrects revoked tags", async () => {
    repository.readAdminNfcTag.mockResolvedValue({ ...tag, status: "revoked" });
    await expect(changeNfcTag({ operation: "status", tagId: id, version: 2, status: "active", reason: "Activate tag" })).rejects.toThrow("NFC_REVOKED_IMMUTABLE");
  });
});
