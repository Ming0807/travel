import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolveCurrentTouristId: vi.fn(),
  setTouristLeaderboardPreference: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/guards", () => ({
  resolveCurrentTouristId: mocks.resolveCurrentTouristId,
}));
vi.mock("@/lib/repositories/tourist.repository", () => ({
  setTouristLeaderboardPreference: mocks.setTouristLeaderboardPreference,
}));

import { updateLeaderboardPreferenceAction } from "@/app/actions/leaderboard-preference-actions";

function preferenceForm(entries: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) formData.set(key, value);
  return formData;
}

describe("updateLeaderboardPreferenceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveCurrentTouristId.mockResolvedValue("tourist-001");
    mocks.setTouristLeaderboardPreference.mockResolvedValue(undefined);
  });

  it("publishes the current passport display name after explicit confirmation", async () => {
    const result = await updateLeaderboardPreferenceAction(
      { status: "idle", message: "" },
      preferenceForm({ visibility: "display_name", confirmedPublic: "on" }),
    );

    expect(result.status).toBe("success");
    expect(mocks.setTouristLeaderboardPreference).toHaveBeenCalledWith({
      touristId: "tourist-001",
      visibility: "display_name",
      alias: null,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/leaderboard");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/profile");
  });

  it("does not publish a public profile without explicit confirmation", async () => {
    const result = await updateLeaderboardPreferenceAction(
      { status: "idle", message: "" },
      preferenceForm({ visibility: "display_name" }),
    );

    expect(result.status).toBe("error");
    expect(mocks.resolveCurrentTouristId).not.toHaveBeenCalled();
    expect(mocks.setTouristLeaderboardPreference).not.toHaveBeenCalled();
  });

  it("trims and saves a public alias after explicit confirmation", async () => {
    const result = await updateLeaderboardPreferenceAction(
      { status: "idle", message: "" },
      preferenceForm({
        visibility: "alias",
        alias: "  สายหมอกยะลา  ",
        confirmedPublic: "on",
      }),
    );

    expect(result.status).toBe("success");
    expect(mocks.setTouristLeaderboardPreference).toHaveBeenCalledWith({
      touristId: "tourist-001",
      visibility: "alias",
      alias: "สายหมอกยะลา",
    });
  });

  it("allows withdrawing to private without public confirmation", async () => {
    const result = await updateLeaderboardPreferenceAction(
      { status: "idle", message: "" },
      preferenceForm({ visibility: "private" }),
    );

    expect(result.status).toBe("success");
    expect(mocks.setTouristLeaderboardPreference).toHaveBeenCalledWith({
      touristId: "tourist-001",
      visibility: "private",
      alias: null,
    });
  });

  it("returns a safe retry message when persistence fails", async () => {
    mocks.setTouristLeaderboardPreference.mockRejectedValue(new Error("DATABASE_DETAIL"));

    const result = await updateLeaderboardPreferenceAction(
      { status: "idle", message: "" },
      preferenceForm({ visibility: "private" }),
    );

    expect(result).toEqual({
      status: "error",
      message: "ยังบันทึกการตั้งค่าไม่ได้ กรุณาลองใหม่",
    });
  });
});
