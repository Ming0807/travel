import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createVisit: vi.fn(),
  recordFunnelEvent: vi.fn(),
}));

vi.mock("@/lib/repositories/visit.repository", () => ({
  createVisit: mocks.createVisit,
}));

vi.mock("@/lib/repositories/funnel.repository", () => ({
  recordFunnelEvent: mocks.recordFunnelEvent,
}));

import { initiateVisit } from "@/lib/services/visit.service";

describe("visit event semantics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createVisit.mockResolvedValue("visit-1");
    mocks.recordFunnelEvent.mockResolvedValue(undefined);
  });

  it("records minimal_form_completed exactly once for the created visit", async () => {
    await initiateVisit({
      touristId: "tourist-1",
      attractionId: 12,
      checkinCodeId: 34,
    });

    expect(mocks.recordFunnelEvent).toHaveBeenCalledTimes(1);
    expect(mocks.recordFunnelEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventName: "minimal_form_completed",
      visitId: "visit-1",
    }));
  });
});
