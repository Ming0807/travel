import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from }),
}));

import { getAdminResearchStudyDetail } from "@/lib/repositories/admin-research.repository";

function query(data: unknown) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
    then: vi.fn((resolve: (result: { data: unknown; error: null }) => unknown) => resolve({ data, error: null })),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  return chain;
}

const frozenRow = {
  research_freeze_snapshot_id: "freeze-1",
  study_id: "pilot-1",
  protocol_version: "protocol-2",
  consent_version: "consent-3",
  notice_version: "notice-4",
  instrument_manifest: [{ instrumentKey: "tourist_evaluation", versionNumber: 2, audience: "tourist", itemCodes: ["SQ1"] }],
  task_manifest: [{ taskCode: "segment_choice", versionNumber: 1, audience: "operator" }],
  scoring_version: "score-1",
  retention_version: "retention-1",
  withdrawal_version: "withdrawal-1",
  language_version: "language-1",
  inclusion_version: "inclusion-1",
  application_revision: "app-abc123",
  database_revision: "db-20260901",
  frozen_at: "2026-09-01T00:00:00.000Z",
};

function mockStudy(snapshot: unknown) {
  from.mockImplementation((table: string) => query(table === "research_studies"
    ? { research_study_id: "pilot-1", study_kind: "pilot", status: "paused" }
    : table === "research_freeze_snapshots" ? snapshot : []));
}

describe("admin research freeze snapshot mapping", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the immutable manifest and versions from the stored snapshot", async () => {
    mockStudy(frozenRow);

    const detail = await getAdminResearchStudyDetail("pilot-1");

    expect(detail?.freezeSnapshot).toMatchObject({
      protocolVersion: "protocol-2",
      consentVersion: "consent-3",
      noticeVersion: "notice-4",
      instrumentManifest: [{ instrumentKey: "tourist_evaluation", itemCodes: ["SQ1"] }],
      taskManifest: [{ taskCode: "segment_choice", versionNumber: 1 }],
    });
  });

  it("rejects a malformed stored manifest instead of displaying an empty approved list", async () => {
    mockStudy({ ...frozenRow, instrument_manifest: [{ instrumentKey: "tourist_evaluation", versionNumber: "2" }] });

    await expect(getAdminResearchStudyDetail("pilot-1")).rejects.toThrow("ADMIN_RESEARCH_FREEZE_MANIFEST_INVALID");
  });
});
