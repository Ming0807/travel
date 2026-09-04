import { beforeEach, describe, expect, it, vi } from "vitest";
import { findNfcTagByToken, type NfcTagResolutionRecord } from "@/lib/repositories/nfc-tag.repository";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { resolveNfcCheckin } from "@/lib/services/nfc-checkin.service";
import type { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";

vi.mock("@/lib/repositories/nfc-tag.repository", () => ({ findNfcTagByToken: vi.fn() }));
vi.mock("@/lib/services/checkin.service", () => ({ resolveAndValidateCheckinCode: vi.fn() }));
const token = "10000000-0000-4000-8000-000000000001";
const code = "yala-001";
const assignment = { checkinCodeId: 5, code, attractionId: 4, photoSpotId: null, campaignId: 7 };
const record: NfcTagResolutionRecord = { tagId: token, status: "active", assignment, currentAssignment: { ...assignment } };
const details: CheckinCodeDetails = {
  checkin_code_id: 5, code, is_active: true, starts_at: null, ends_at: null, photo_spot: null,
  attraction: {
    attraction_id: 4, name_th: "สถานที่ทดสอบ", name_en: null, short_description_th: null,
    is_active: true, is_published: true, cover_image_url: null,
    province: { province_name_th: "ยะลา", is_active: true, destination_status: "live" },
  },
};

describe("NFC canonical resolution (read-only)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(findNfcTagByToken).mockResolvedValue(record);
    vi.mocked(resolveAndValidateCheckinCode).mockResolvedValue({ status: "valid", details });
  });

  it("uses the existing QR availability checks and returns only safe location context", async () => {
    await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: "valid", tagId: token, entryChannel: "nfc", details });
    expect(resolveAndValidateCheckinCode).toHaveBeenCalledWith(code);
  });
  it.each([[code, "bad-token"], ["../admin", token]])("rejects malformed input before database reads", async (inputCode, inputToken) => {
    await expect(resolveNfcCheckin(inputCode, inputToken)).resolves.toEqual({ status: "not_found" });
    expect(findNfcTagByToken).not.toHaveBeenCalled();
  });
  it.each(["draft", "inactive", "revoked"] as const)("never falls back to QR for %s tags", async (status) => {
    vi.mocked(findNfcTagByToken).mockResolvedValue({ ...record, status });
    await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: status === "revoked" ? "revoked" : "inactive" });
    expect(resolveAndValidateCheckinCode).not.toHaveBeenCalled();
  });
  it("denies a token paired with a different code", async () => {
    await expect(resolveNfcCheckin("other-code", token)).resolves.toEqual({ status: "not_found" });
    expect(resolveAndValidateCheckinCode).not.toHaveBeenCalled();
  });
  it.each([{ attractionId: 99 }, { campaignId: null }, { photoSpotId: 2 }, { code: "new-code" }])(
    "denies changed assignments %j", async (change) => {
      vi.mocked(findNfcTagByToken).mockResolvedValue({ ...record, currentAssignment: { ...assignment, ...change } });
      await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: "reassigned" });
      expect(resolveAndValidateCheckinCode).not.toHaveBeenCalled();
    },
  );
  it("handles deleted or unknown assignments without leaking registry details", async () => {
    vi.mocked(findNfcTagByToken).mockResolvedValue(null);
    await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: "not_found" });
    vi.mocked(findNfcTagByToken).mockResolvedValue({ ...record, currentAssignment: null });
    await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: "reassigned" });
  });
  it.each(["expired", "inactive", "unavailable", "not_found"] as const)("retains the canonical %s rejection", async (status) => {
    vi.mocked(resolveAndValidateCheckinCode).mockResolvedValue({ status, details });
    await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: "unavailable" });
  });
  it("fails closed on lookup errors, not a successful QR fallback", async () => {
    vi.mocked(findNfcTagByToken).mockRejectedValue(new Error("private database error"));
    await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: "unavailable" });
    expect(resolveAndValidateCheckinCode).not.toHaveBeenCalled();
  });
  it("rejects inconsistent context from the subsequent canonical lookup", async () => {
    vi.mocked(resolveAndValidateCheckinCode).mockResolvedValue({ status: "valid", details: { ...details, checkin_code_id: 99 } });
    await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: "reassigned" });
  });
  it("does not expose errors thrown by the canonical lookup", async () => {
    vi.mocked(resolveAndValidateCheckinCode).mockRejectedValue(new Error("private failure"));
    await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: "unavailable" });
  });
  it("re-reads registry state so revocation is not cached between calls", async () => {
    await expect(resolveNfcCheckin(code, token)).resolves.toMatchObject({ status: "valid" });
    vi.mocked(findNfcTagByToken).mockResolvedValue({ ...record, status: "revoked" });
    await expect(resolveNfcCheckin(code, token)).resolves.toEqual({ status: "revoked" });
    expect(findNfcTagByToken).toHaveBeenCalledTimes(2);
  });
});
