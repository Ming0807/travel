import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  maintain: vi.fn(),
}));

vi.mock("@/lib/repositories/story-engagement.repository", () => ({
  runStoryEngagementMaintenance: () => mocks.maintain(),
}));

import { GET } from "@/app/api/cron/story-engagement-maintenance/route";

function request(authorization?: string) {
  return new NextRequest(
    "http://localhost:3000/api/cron/story-engagement-maintenance",
    {
      headers: authorization ? { authorization } : undefined,
    },
  );
}

describe("GET /api/cron/story-engagement-maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "0123456789abcdef0123456789abcdef";
    mocks.maintain.mockResolvedValue({
      aggregatedRows: 12,
      deletedEvents: 3,
      deletedDedup: 4,
      deletedRateBuckets: 5,
    });
  });

  it("fails closed without the production cron bearer secret", async () => {
    expect((await GET(request())).status).toBe(401);
    expect((await GET(request("Bearer wrong"))).status).toBe(401);
    expect(mocks.maintain).not.toHaveBeenCalled();
  });

  it("aggregates before purging and returns safe maintenance counts", async () => {
    const response = await GET(
      request(`Bearer ${process.env.CRON_SECRET}`),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      maintenance: {
        aggregatedRows: 12,
        deletedEvents: 3,
        deletedDedup: 4,
        deletedRateBuckets: 5,
      },
    });
    expect(mocks.maintain).toHaveBeenCalledOnce();
  });

  it("does not expose database errors", async () => {
    mocks.maintain.mockRejectedValueOnce(new Error("database details"));

    const response = await GET(
      request(`Bearer ${process.env.CRON_SECRET}`),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe("MAINTENANCE_FAILED");
    expect(JSON.stringify(body)).not.toContain("database details");
  });
});
