"use server";

import { revalidatePath } from "next/cache";
import { resolveCurrentTouristId } from "@/lib/auth/guards";
import { setTouristLeaderboardPreference } from "@/lib/repositories/tourist.repository";
import { leaderboardPreferenceSchema } from "@/lib/validation/leaderboard";

export type LeaderboardPreferenceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialLeaderboardPreferenceActionState: LeaderboardPreferenceActionState = {
  status: "idle",
  message: "",
};

export async function updateLeaderboardPreferenceAction(
  _previousState: LeaderboardPreferenceActionState,
  formData: FormData,
): Promise<LeaderboardPreferenceActionState> {
  const parsed = leaderboardPreferenceSchema.safeParse({
    visibility: formData.get("visibility"),
    alias: String(formData.get("alias") ?? ""),
    confirmedPublic: formData.get("confirmedPublic") === "on",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message || "กรุณาตรวจสอบข้อมูลอีกครั้ง" };
  }

  try {
    const touristId = await resolveCurrentTouristId();
    await setTouristLeaderboardPreference({
      touristId,
      visibility: parsed.data.visibility,
      alias: parsed.data.visibility === "alias" ? parsed.data.alias || null : null,
    });
    revalidatePath("/leaderboard");
    revalidatePath("/profile");
    return { status: "success", message: "บันทึกการแสดงผลบนกระดานผู้นำแล้ว" };
  } catch {
    return { status: "error", message: "ยังบันทึกการตั้งค่าไม่ได้ กรุณาลองใหม่" };
  }
}
