import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  initialLeaderboardPreferenceActionState,
  updateLeaderboardPreferenceAction,
} from "@/app/actions/leaderboard-preference-actions";
import { resolveCurrentTouristId } from "@/lib/auth/guards";
import { setTouristLeaderboardPreference } from "@/lib/repositories/tourist.repository";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({ resolveCurrentTouristId: vi.fn() }));
vi.mock("@/lib/repositories/tourist.repository", () => ({ setTouristLeaderboardPreference: vi.fn() }));

describe("updateLeaderboardPreferenceAction", () => {
  beforeEach(() => {
    vi.mocked(resolveCurrentTouristId).mockResolvedValue("10000000-0000-4000-8000-000000000001");
    vi.mocked(setTouristLeaderboardPreference).mockResolvedValue(undefined);
  });

  it("does not publish an alias before explicit confirmation", async () => {
    const formData = new FormData();
    formData.set("visibility", "alias");
    formData.set("alias", "สายหมอกยะลา");

    const result = await updateLeaderboardPreferenceAction(initialLeaderboardPreferenceActionState, formData);

    expect(result).toEqual({ status: "error", message: "กรุณายืนยันก่อนเข้าร่วมอันดับสาธารณะ" });
    expect(resolveCurrentTouristId).not.toHaveBeenCalled();
    expect(setTouristLeaderboardPreference).not.toHaveBeenCalled();
  });

  it("updates only the current tourist after confirmation", async () => {
    const formData = new FormData();
    formData.set("visibility", "alias");
    formData.set("alias", "  สายหมอกยะลา  ");
    formData.set("confirmedPublic", "on");

    const result = await updateLeaderboardPreferenceAction(initialLeaderboardPreferenceActionState, formData);

    expect(result.status).toBe("success");
    expect(setTouristLeaderboardPreference).toHaveBeenCalledWith({
      touristId: "10000000-0000-4000-8000-000000000001",
      visibility: "alias",
      alias: "สายหมอกยะลา",
    });
  });

  it("allows withdrawal to private without a public confirmation checkbox", async () => {
    const formData = new FormData();
    formData.set("visibility", "private");

    const result = await updateLeaderboardPreferenceAction(initialLeaderboardPreferenceActionState, formData);

    expect(result.status).toBe("success");
    expect(setTouristLeaderboardPreference).toHaveBeenCalledWith(expect.objectContaining({
      visibility: "private",
      alias: null,
    }));
  });
});
