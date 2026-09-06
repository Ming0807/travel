import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  beginCheckinEntrySession,
  createVisitFromCheckinEntry,
  readCheckinEntrySession,
} from "@/lib/repositories/checkin-entry.repository";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ rpc }) }));
const sessionId = "10000000-0000-4000-8000-000000000001";
const visitId = "20000000-0000-4000-8000-000000000001";
const browserHash = "a".repeat(64);

describe("check-in entry repository", () => {
  beforeEach(() => vi.resetAllMocks());

  it("maps the exact begin RPC contract", async () => {
    rpc.mockResolvedValue({ data: [{ entry_session_id: sessionId, was_created: true }], error: null });
    await expect(beginCheckinEntrySession({ browserHash, code: "yala-001", channel: "nfc", tagId: sessionId }))
      .resolves.toEqual({ sessionId, wasCreated: true });
    expect(rpc).toHaveBeenCalledWith("begin_checkin_entry", {
      p_browser_hash: browserHash, p_code: "yala-001", p_channel: "nfc", p_tag_id: sessionId,
    });
  });

  it("returns only non-sensitive session context from the read RPC", async () => {
    rpc.mockResolvedValue({ data: [{
      entry_session_id: sessionId, browser_hash: browserHash, code_snapshot: "yala-001",
      checkin_code_id: 10, attraction_id_snapshot: 4, photo_spot_id_snapshot: null,
      campaign_id_snapshot: 7, entry_channel: "qr", nfc_tag_id: null,
      evidence_scope: "unknown", visit_id: null, created_at: "2026-09-04T10:00:00Z",
      expires_at: "2026-09-04T12:00:00Z",
    }], error: null });
    const result = await readCheckinEntrySession({ sessionId, browserHash, code: "yala-001" });
    expect(result).toEqual({
      sessionId, checkinCodeId: 10, code: "yala-001", attractionId: 4,
      photoSpotId: null, campaignId: 7, channel: "qr", tagId: null,
      evidenceScope: "unknown", visitId: null,
      researchStudyId: null, researchFrozenAt: null,
      createdAt: "2026-09-04T10:00:00Z", expiresAt: "2026-09-04T12:00:00Z",
    });
    expect(JSON.stringify(result)).not.toContain(browserHash);
  });

  it("maps idempotent Visit creation and rejects invalid RPC shapes", async () => {
    rpc.mockResolvedValueOnce({ data: visitId, error: null });
    await expect(createVisitFromCheckinEntry({ sessionId, browserHash, code: "yala-001", touristId: visitId }))
      .resolves.toBe(visitId);
    expect(rpc).toHaveBeenCalledWith("create_checkin_entry_visit", {
      p_session_id: sessionId, p_browser_hash: browserHash, p_code: "yala-001", p_tourist_id: visitId,
    });
    rpc.mockResolvedValueOnce({ data: "not-a-uuid", error: null });
    await expect(createVisitFromCheckinEntry({ sessionId, browserHash, code: "yala-001", touristId: visitId }))
      .rejects.toThrow("CHECKIN_ENTRY_VISIT_INVALID");
  });

  it("preserves immutable research provenance without exposing the browser hash", async () => {
    rpc.mockResolvedValue({ data: [{
      entry_session_id: sessionId, browser_hash: browserHash, code_snapshot: "yala-001",
      checkin_code_id: 10, attraction_id_snapshot: 4, photo_spot_id_snapshot: null,
      campaign_id_snapshot: null, entry_channel: "nfc", nfc_tag_id: sessionId,
      evidence_scope: "field_observation", visit_id: null,
      research_study_id_snapshot: visitId, research_frozen_at_snapshot: "2026-09-01T00:00:00Z",
      created_at: "2026-09-04T10:00:00Z", expires_at: "2026-09-04T12:00:00Z",
    }], error: null });
    const result = await readCheckinEntrySession({ sessionId, browserHash, code: "yala-001" });
    expect(result).toMatchObject({ researchStudyId: visitId, researchFrozenAt: "2026-09-01T00:00:00Z" });
    expect(result).not.toHaveProperty("browser_hash");
  });

  it.each(["field_observation", "pilot_internal", "simulated_usability"])("accepts server classified %s sessions", async (scope) => {
    rpc.mockResolvedValue({ data: [{
      entry_session_id: sessionId, code_snapshot: "yala-001", checkin_code_id: 10,
      attraction_id_snapshot: 4, photo_spot_id_snapshot: null, campaign_id_snapshot: 7,
      entry_channel: "qr", nfc_tag_id: null, evidence_scope: scope, visit_id: null,
      created_at: "2026-09-04T10:00:00Z", expires_at: "2026-09-04T12:00:00Z",
    }], error: null });
    await expect(readCheckinEntrySession({ sessionId, browserHash, code: "yala-001" }))
      .resolves.toMatchObject({ evidenceScope: scope });
  });

  it.each([
    [{ data: [], error: null }, "CHECKIN_ENTRY_BEGIN_INVALID"],
    [{ data: null, error: { message: "private" } }, "CHECKIN_ENTRY_BEGIN_FAILED"],
  ] as const)("fails closed for begin result %#", async (response, expected) => {
    rpc.mockResolvedValue(response);
    await expect(beginCheckinEntrySession({ browserHash, code: "yala-001", channel: "qr", tagId: null }))
      .rejects.toThrow(expected);
  });

  it("does not expose private database errors from read", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "private schema detail" } });
    await expect(readCheckinEntrySession({ sessionId, browserHash, code: "yala-001" }))
      .rejects.toThrow("CHECKIN_ENTRY_READ_FAILED");
  });
});
