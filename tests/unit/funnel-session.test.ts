import { beforeEach, describe, expect, it, vi } from "vitest";

import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";

const query = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  eq: vi.fn(),
  contains: vi.fn(),
  limit: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: vi.fn(() => query),
  }),
}));

describe("funnel event session deduplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.select.mockReturnValue(query);
    query.insert.mockResolvedValue({ error: null });
    query.eq.mockReturnValue(query);
    query.contains.mockReturnValue(query);
    query.limit.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it("does not insert the same event twice for one QR flow session", async () => {
    query.maybeSingle.mockResolvedValue({ data: { event_id: "existing" }, error: null });

    await recordFunnelEvent({
      eventName: "landing_viewed",
      checkinCodeId: 10,
      attractionId: 20,
      sessionId: "session-1",
    });

    expect(query.contains).toHaveBeenCalledWith("metadata", { session_id: "session-1" });
    expect(query.insert).not.toHaveBeenCalled();
  });

  it("stores the session and attraction context for a new event", async () => {
    await recordFunnelEvent({
      eventName: "qr_scanned",
      checkinCodeId: 10,
      attractionId: 20,
      sessionId: "session-1",
    });

    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({
      event_type: "qr_scanned",
      checkin_code_id: 10,
      metadata: {
        attraction_id: 20,
        session_id: "session-1",
      },
    }));
  });
});
