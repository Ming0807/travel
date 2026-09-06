import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCheckinEntryConfig } from "@/lib/config/checkin-entry";
import {
  beginCheckinEntrySession,
  createVisitFromCheckinEntry,
  readCheckinEntrySession,
} from "@/lib/repositories/checkin-entry.repository";
import { resolveNfcCheckin } from "@/lib/services/nfc-checkin.service";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import {
  beginCanonicalCheckinEntry,
  completeCheckinEntryVisit,
  resolveCheckinFlow,
} from "@/lib/services/checkin-entry.service";
import type { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";

vi.mock("@/lib/config/checkin-entry", () => ({ getCheckinEntryConfig: vi.fn() }));
vi.mock("@/lib/repositories/checkin-entry.repository", () => ({
  beginCheckinEntrySession: vi.fn(),
  createVisitFromCheckinEntry: vi.fn(),
  readCheckinEntrySession: vi.fn(),
}));
vi.mock("@/lib/services/nfc-checkin.service", () => ({ resolveNfcCheckin: vi.fn() }));
vi.mock("@/lib/services/checkin.service", () => ({ resolveAndValidateCheckinCode: vi.fn() }));

const browserId = "10000000-0000-4000-8000-000000000001";
const sessionId = "20000000-0000-4000-8000-000000000001";
const token = "30000000-0000-4000-8000-000000000001";
const details: CheckinCodeDetails = {
  checkin_code_id: 10, code: "yala-001", is_active: true, starts_at: null, ends_at: null, photo_spot: null,
  attraction: { attraction_id: 4, name_th: "ยะลา", name_en: null, short_description_th: null,
    is_active: true, is_published: true, cover_image_url: null,
    province: { province_name_th: "ยะลา", is_active: true, destination_status: "live" } },
};
const session = {
  sessionId, checkinCodeId: 10, code: "yala-001", attractionId: 4, photoSpotId: null,
  campaignId: null, channel: "qr" as const, tagId: null, evidenceScope: "unknown" as const,
  researchStudyId: null, researchFrozenAt: null,
  visitId: null, createdAt: "2026-09-04T10:00:00Z", expiresAt: "2026-09-04T12:00:00Z",
};
const disabled = { sessionsEnabled: false, nfcEnabled: false, hashSecret: null };
const enabled = { sessionsEnabled: true, nfcEnabled: false, hashSecret: "x".repeat(32) };

describe("canonical check-in entry orchestration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getCheckinEntryConfig).mockReturnValue(enabled);
    vi.mocked(resolveAndValidateCheckinCode).mockResolvedValue({ status: "valid", details });
    vi.mocked(beginCheckinEntrySession).mockResolvedValue({ sessionId, wasCreated: true });
    vi.mocked(readCheckinEntrySession).mockResolvedValue(session);
    vi.mocked(createVisitFromCheckinEntry).mockResolvedValue("40000000-0000-4000-8000-000000000001");
  });

  it("preserves legacy QR behavior while the rollout flag is off", async () => {
    vi.mocked(getCheckinEntryConfig).mockReturnValue(disabled);
    await expect(beginCanonicalCheckinEntry({ code: "yala-001", nfcToken: null, browserId }))
      .resolves.toEqual({ mode: "legacy", status: "valid", details });
    expect(beginCheckinEntrySession).not.toHaveBeenCalled();
  });

  it("fails closed for NFC while its flag is off", async () => {
    await expect(beginCanonicalCheckinEntry({ code: "yala-001", nfcToken: token, browserId }))
      .resolves.toEqual({ mode: "blocked", status: "nfc_unavailable" });
    expect(resolveAndValidateCheckinCode).not.toHaveBeenCalled();
  });

  it("begins a server-validated QR session without trusting client source fields", async () => {
    await expect(beginCanonicalCheckinEntry({ code: "yala-001", nfcToken: null, browserId }))
      .resolves.toEqual({ mode: "session", status: "valid", details, sessionId, wasCreated: true, channel: "qr" });
    expect(beginCheckinEntrySession).toHaveBeenCalledWith({
      browserHash: expect.stringMatching(/^[a-f0-9]{64}$/), code: "yala-001", channel: "qr", tagId: null,
    });
  });

  it("begins NFC only from the registered resolver", async () => {
    vi.mocked(getCheckinEntryConfig).mockReturnValue({ ...enabled, nfcEnabled: true });
    vi.mocked(resolveNfcCheckin).mockResolvedValue({ status: "valid", tagId: token, entryChannel: "nfc", details });
    await expect(beginCanonicalCheckinEntry({ code: "yala-001", nfcToken: token, browserId }))
      .resolves.toMatchObject({ mode: "session", status: "valid", channel: "nfc", sessionId });
    expect(beginCheckinEntrySession).toHaveBeenCalledWith(expect.objectContaining({ channel: "nfc", tagId: token }));
  });

  it("does not downgrade registry or RPC errors to QR", async () => {
    vi.mocked(getCheckinEntryConfig).mockReturnValue({ ...enabled, nfcEnabled: true });
    vi.mocked(resolveNfcCheckin).mockResolvedValue({ status: "revoked" });
    await expect(beginCanonicalCheckinEntry({ code: "yala-001", nfcToken: token, browserId }))
      .resolves.toEqual({ mode: "blocked", status: "nfc_unavailable" });
    vi.mocked(resolveNfcCheckin).mockResolvedValue({ status: "valid", tagId: token, entryChannel: "nfc", details });
    vi.mocked(beginCheckinEntrySession).mockRejectedValue(new Error("private"));
    await expect(beginCanonicalCheckinEntry({ code: "yala-001", nfcToken: token, browserId }))
      .resolves.toEqual({ mode: "blocked", status: "unavailable" });
  });

  it("validates URL flow against browser, code, live context and snapshots", async () => {
    await expect(resolveCheckinFlow({ code: "yala-001", flowId: sessionId, browserId }))
      .resolves.toEqual({ mode: "session", status: "valid", session, details });
    expect(readCheckinEntrySession).toHaveBeenCalledWith({
      sessionId, browserHash: expect.stringMatching(/^[a-f0-9]{64}$/), code: "yala-001",
    });
  });

  it.each([
    { flowId: "invalid", browserId }, { flowId: sessionId, browserId: null },
  ])("rejects malformed or unbound flow %# before reads", async (input) => {
    await expect(resolveCheckinFlow({ code: "yala-001", ...input })).resolves.toEqual({ mode: "blocked", status: "unavailable" });
    expect(readCheckinEntrySession).not.toHaveBeenCalled();
  });

  it("allows direct legacy entry only when no flow was presented", async () => {
    await expect(resolveCheckinFlow({ code: "yala-001", flowId: null, browserId: null }))
      .resolves.toEqual({ mode: "legacy", status: "valid", details });
    vi.mocked(getCheckinEntryConfig).mockReturnValue(disabled);
    await expect(resolveCheckinFlow({ code: "yala-001", flowId: sessionId, browserId }))
      .resolves.toEqual({ mode: "blocked", status: "unavailable" });
  });

  it("fails closed when session snapshots disagree with live context", async () => {
    vi.mocked(readCheckinEntrySession).mockResolvedValue({ ...session, attractionId: 99 });
    await expect(resolveCheckinFlow({ code: "yala-001", flowId: sessionId, browserId }))
      .resolves.toEqual({ mode: "blocked", status: "unavailable" });
  });

  it("creates the visit only through the browser-bound transactional RPC", async () => {
    const touristId = "50000000-0000-4000-8000-000000000001";
    await expect(completeCheckinEntryVisit({ code: "yala-001", flowId: sessionId, browserId, touristId }))
      .resolves.toBe("40000000-0000-4000-8000-000000000001");
    expect(createVisitFromCheckinEntry).toHaveBeenCalledWith({
      sessionId,
      browserHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      code: "yala-001",
      touristId,
    });
  });

  it("rejects visit completion when flow ownership is missing", async () => {
    await expect(completeCheckinEntryVisit({
      code: "yala-001",
      flowId: sessionId,
      browserId: null,
      touristId: "50000000-0000-4000-8000-000000000001",
    })).rejects.toThrow("CHECKIN_ENTRY_CONTEXT_INVALID");
    expect(createVisitFromCheckinEntry).not.toHaveBeenCalled();
  });
});
