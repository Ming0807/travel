import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/config/checkin-entry", () => ({ getCheckinEntryConfig: () => ({ sessionsEnabled: true }) }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ from: mocks.from }) }));

import { listEvidenceRows, readCandidateMetrics } from "@/lib/repositories/attraction-feedback.repository";
import type { FeedbackScope } from "@/lib/services/attraction-feedback.service";

type Row = Record<string, unknown>;
const tables: Record<string, Row[]> = { visits: [], checkin_codes: [], reviews: [] };

function query(table: string) {
  const equals: Array<[string, unknown]> = [];
  const allowed: Array<[string, unknown[]]> = [];
  const lower: Array<[string, string]> = [];
  const upper: Array<[string, string]> = [];
  let offset = 0;
  let length = Number.MAX_SAFE_INTEGER;
  const result = {
    select: vi.fn(() => result),
    eq: vi.fn((key: string, value: unknown) => { equals.push([key, value]); return result; }),
    in: vi.fn((key: string, values: unknown[]) => { allowed.push([key, values]); return result; }),
    gte: vi.fn((key: string, value: string) => { lower.push([key, value]); return result; }),
    lte: vi.fn((key: string, value: string) => { upper.push([key, value]); return result; }),
    order: vi.fn(() => result),
    range: vi.fn((from: number, to: number) => { offset = from; length = to - from + 1; return result; }),
    limit: vi.fn((count: number) => { length = count; return result; }),
    then: (resolve: (value: { data: Row[]; count: number; error: null }) => unknown) => {
      const rows = (tables[table] ?? []).filter((row) =>
        equals.every(([key, value]) => row[key] === value)
        && allowed.every(([key, values]) => values.includes(row[key]))
        && lower.every(([key, value]) => String(row[key]) >= value)
        && upper.every(([key, value]) => String(row[key]) <= value),
      );
      return resolve({ data: rows.slice(offset, offset + length), count: rows.length, error: null });
    },
  };
  return result;
}

function visit(id: number, evidenceScope: string, channel: string, codeId: number, score: number): Row {
  return {
    visit_id: `visit-${id}`,
    attraction_id: 7,
    visit_date: "2026-01-12",
    entry_channel: channel,
    checkin_code_id: codeId,
    checkin_entry_sessions: [{ evidence_scope: evidenceScope }],
    research_sessions: [],
    satisfaction_surveys: [{ safety_score: score, comments: "Synthetic feedback" }],
  };
}

const scope: FeedbackScope = {
  attractionId: 7,
  dateStart: "2026-01-01",
  dateEnd: "2026-01-31",
  evidenceScope: "pilot_only",
  entryChannel: "nfc",
  campaignId: 3,
  checkinCodeId: 10,
};

describe("attraction feedback population queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockImplementation(query);
    tables.checkin_codes = [
      { attraction_id: 7, checkin_code_id: 10, campaign_id: 3 },
      { attraction_id: 7, checkin_code_id: 11, campaign_id: 4 },
    ];
    tables.reviews = [{ attraction_id: 7, rating: 1, comment: "Unlinked review", created_at: "2026-01-12T00:00:00Z" }];
    tables.visits = [
      ...Array.from({ length: 31 }, (_, index) => visit(index, "pilot_internal", "nfc", 10, 2)),
      visit(32, "field_observation", "qr", 11, 5),
      visit(33, "simulated_usability", "nfc", 10, 1),
    ];
  });

  it("uses the same evidence-scope semantics and code/channel intersection as attraction analytics", async () => {
    const candidate = await readCandidateMetrics(scope, "safety");
    expect(candidate).toMatchObject({
      validResponseCount: 31,
      visitCount: 31,
      currentScore: 2,
      structuredLowScoreRecurrence: 31,
      isTruncated: false,
    });
    expect(mocks.from).toHaveBeenCalledWith("checkin_codes");
    expect(mocks.from).toHaveBeenCalledWith("visits");
  });

  it("never adds unlinked reviews to a scoped evidence drill-down", async () => {
    const evidence = await listEvidenceRows(scope, "safety");
    expect(evidence).toHaveLength(31);
    expect(evidence.every((row) => row.sourceType === "satisfaction_survey")).toBe(true);
    expect(mocks.from).not.toHaveBeenCalledWith("reviews");
  });

  it("does not treat legacy visits without evidence as field observations", async () => {
    tables.visits.push({ ...visit(34, "unknown", "qr", 11, 1), checkin_entry_sessions: [], research_sessions: [] });
    const candidate = await readCandidateMetrics({ ...scope, evidenceScope: "field_claim", entryChannel: undefined, campaignId: undefined, checkinCodeId: undefined }, "safety");
    expect(candidate.visitCount).toBe(1);
    expect(candidate.currentScore).toBe(5);
  });

  it("reads every page instead of silently treating the first API page as complete", async () => {
    tables.visits = Array.from({ length: 1001 }, (_, index) => visit(index, "pilot_internal", "nfc", 10, 2));
    const candidate = await readCandidateMetrics(scope, "safety");
    expect(candidate.visitCount).toBe(1001);
    expect(candidate.isTruncated).toBe(false);
  });

  it("fails candidate qualification closed above the bounded read limit", async () => {
    tables.visits = Array.from({ length: 5001 }, (_, index) => visit(index, "pilot_internal", "nfc", 10, 2));
    const candidate = await readCandidateMetrics(scope, "safety");
    expect(candidate.isTruncated).toBe(true);
  });
});
