import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const queryState = vi.hoisted(() => ({
  selections: [] as Array<{ table: string; columns: string }>,
}));
const entryConfig = vi.hoisted(() => ({ sessionsEnabled: false }));
vi.mock("@/lib/config/checkin-entry", () => ({ getCheckinEntryConfig: () => entryConfig }));

function createQuery(table: string) {
  const query = {
    select: vi.fn((columns: string) => {
      queryState.selections.push({ table, columns });
      return query;
    }),
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
    lte: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    then: (
      resolve: (value: { data: Record<string, unknown>[]; error: null }) => unknown,
      reject?: (reason: unknown) => unknown
    ) => Promise.resolve({ data: [], error: null }).then(resolve, reject),
  };
  return query;
}

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: (table: string) => createQuery(table),
  }),
}));

import { getDashboardRepositoryPayload } from "@/lib/repositories/dashboard.repository";

describe("dashboard repository privacy", () => {
  beforeEach(() => {
    queryState.selections = [];
    entryConfig.sessionsEnabled = false;
  });

  it("selects identity providers for filtered tourist profiles without identifiers", async () => {
    await getDashboardRepositoryPayload(
      { dateFrom: "2026-08-01", dateTo: "2026-08-05" },
      "tourists"
    );

    const visitsSelection = queryState.selections.find((selection) => selection.table === "visits");
    expect(visitsSelection?.columns).toContain("tourist_identities (provider)");
    expect(visitsSelection?.columns).toContain("research_sessions");
    expect(visitsSelection?.columns).toContain("collection_mode");
    expect(visitsSelection?.columns).not.toContain("provider_user_id");
    expect(visitsSelection?.columns).not.toContain("participant_code");
    expect(visitsSelection?.columns).not.toContain("checkin_entry_sessions");
  });

  it("selects only collection scope and channel from entries when tracking is enabled", async () => {
    entryConfig.sessionsEnabled = true;
    await getDashboardRepositoryPayload({ dateFrom: "2026-08-01", dateTo: "2026-08-05" }, "executive");
    const selection = queryState.selections.find((row) => row.table === "visits")?.columns;
    expect(selection).toContain("checkin_entry_sessions(evidence_scope,entry_channel)");
    expect(selection).not.toContain("browser_hash");
  });
});
