import { beforeEach, describe, expect, it, vi } from "vitest";
import { findNfcTagByToken } from "@/lib/repositories/nfc-tag.repository";

const query = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => query }));
const token = "10000000-0000-4000-8000-000000000001";
const current = { checkin_code_id: 5, code: "yala-001", attraction_id: 4, photo_spot_id: null, campaign_id: 7 };
const row = {
  nfc_tag_id: token, status: "active", checkin_code_id: 5, code_snapshot: "yala-001",
  attraction_id_snapshot: 4, photo_spot_id_snapshot: null, campaign_id_snapshot: 7,
  checkin_codes: current,
};

describe("NFC registry repository boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    query.from.mockReturnValue(query);
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: row, error: null });
  });
  it.each([current, [current]])("reads a single exact-token assignment with supported Supabase relation shapes", async (join) => {
    query.maybeSingle.mockResolvedValue({ data: { ...row, checkin_codes: join, verified_by: "private-staff", verification_reference: "private-note" }, error: null });
    const value = await findNfcTagByToken(token);
    expect(query.from).toHaveBeenCalledWith("nfc_tags");
    expect(query.eq).toHaveBeenCalledWith("public_token", token);
    expect(value?.assignment).toEqual(value?.currentAssignment);
    expect(JSON.stringify(value)).not.toMatch(/private-staff|private-note|verified_by|verification_reference/);
    expect(query.select.mock.calls[0][0]).not.toMatch(/\*|verified_by|verification_reference|public_token/);
  });
  it("rejects malformed token before client access", async () => {
    await expect(findNfcTagByToken("invalid")).resolves.toBeNull();
    expect(query.from).not.toHaveBeenCalled();
  });
  it("distinguishes unknown token from database failure", async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(findNfcTagByToken(token)).resolves.toBeNull();
    query.maybeSingle.mockResolvedValue({ data: null, error: { message: "private database detail" } });
    await expect(findNfcTagByToken(token)).rejects.toThrow("NFC_REGISTRY_UNAVAILABLE");
  });
  it.each([
    { status: "unexpected" }, { checkin_code_id: 0 }, { attraction_id_snapshot: null },
    { checkin_codes: [current, current] }, { checkin_code_id: "9007199254740993" },
  ])("fails closed on corrupt registry data %j", async (change) => {
    query.maybeSingle.mockResolvedValue({ data: { ...row, ...change }, error: null });
    await expect(findNfcTagByToken(token)).rejects.toThrow("NFC_REGISTRY_INVALID");
  });
});
