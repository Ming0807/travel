import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLeaderboard, getLeaderboardResult } from "@/lib/services/xp.service";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: vi.fn() }));

function queryResult(data: unknown[], error: { message: string } | null = null) {
  const query = {
    select: vi.fn(),
    in: vi.fn(),
    gte: vi.fn(),
    then: (resolve: (value: { data: unknown[]; error: { message: string } | null }) => unknown) => resolve({ data, error }),
  };
  query.select.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.gte.mockReturnValue(query);
  return query;
}

describe("public leaderboard privacy", () => {
  beforeEach(() => {
    const xpQuery = queryResult([
      {
        tourist_id: "10000000-0000-4000-8000-000000000099",
        xp_amount: 900,
        tourists: {
          display_name: "ชื่อส่วนตัวที่ห้ามหลุด",
          leaderboard_visibility: "private",
          leaderboard_alias: null,
        },
      },
      {
        tourist_id: "10000000-0000-4000-8000-000000000001",
        xp_amount: 500,
        tourists: {
          display_name: "ชื่อจริงบนใบประกาศ",
          leaderboard_visibility: "alias",
          leaderboard_alias: "สายหมอกยะลา",
        },
      },
    ]);
    const emptyCounts = queryResult([]);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue({
      from: vi.fn((table: string) => (table === "xp_events" ? xpQuery : emptyCounts)),
    } as never);
  });

  it("returns a public alias without exposing certificate name or tourist uuid", async () => {
    const entries = await getLeaderboard("all_time", 100);

    expect(entries[0]).toMatchObject({ publicName: "สายหมอกยะลา", totalXp: 500 });
    expect(entries[0]).not.toHaveProperty("touristId");
    expect(entries[0]).not.toHaveProperty("touristName");
    expect(JSON.stringify(entries)).not.toContain("ชื่อจริงบนใบประกาศ");
    expect(JSON.stringify(entries)).not.toContain("10000000-0000-4000-8000-000000000001");
    expect(JSON.stringify(entries)).not.toContain("ชื่อส่วนตัวที่ห้ามหลุด");
    expect(JSON.stringify(entries)).not.toContain("10000000-0000-4000-8000-000000000099");
  });

  it("fails closed while the privacy migration is not available", async () => {
    const missingColumn = queryResult([], { message: "Could not find the 'leaderboard_visibility' column in the schema cache" });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue({
      from: vi.fn(() => missingColumn),
    } as never);

    await expect(getLeaderboard("all_time", 100)).resolves.toEqual([]);
    await expect(getLeaderboardResult("all_time", 100)).resolves.toEqual({
      kind: "unavailable",
      reason: "privacy_migration",
    });
  });

  it("distinguishes backend failure from an honestly empty public ranking", async () => {
    const backendFailure = queryResult([], { message: "connection terminated" });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue({
      from: vi.fn(() => backendFailure),
    } as never);

    await expect(getLeaderboardResult("weekly", 100)).resolves.toEqual({
      kind: "unavailable",
      reason: "service",
    });
  });
});
