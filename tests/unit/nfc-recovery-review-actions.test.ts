import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ list: vi.fn(), history: vi.fn() }));
vi.mock("@/lib/services/nfc-recovery-review.service", () => ({ getNfcRecoveryReview: mocks.list, getNfcRecoveryReviewHistory: mocks.history }));
import { getAdminNfcRecoveryAction, getAdminNfcRecoveryHistoryAction } from "@/app/actions/admin-nfc-recovery-actions";
beforeEach(() => vi.resetAllMocks());
it("preserves disabled responses without fabricating an empty result", async () => {
  mocks.list.mockResolvedValue({ enabled: false });
  expect(await getAdminNfcRecoveryAction({ tagId: "fixture" })).toEqual({ success: true, enabled: false });
});
it("does not expose service errors through either action", async () => {
  mocks.list.mockRejectedValue(new Error("private storage locator"));
  mocks.history.mockRejectedValue(new Error("private storage locator"));
  for (const result of [await getAdminNfcRecoveryAction({}), await getAdminNfcRecoveryHistoryAction({})]) {
    expect(result.success).toBe(false); expect(JSON.stringify(result)).not.toContain("private storage locator");
  }
});
