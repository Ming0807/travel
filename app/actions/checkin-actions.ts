"use server";

import { minimalProfileFormSchema } from "@/lib/validation/tourist-profile";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { setupGuestTouristProfile } from "@/lib/services/tourist.service";
import { initiateVisit } from "@/lib/services/visit.service";
import { getOrCreateGuestIdentity } from "@/lib/auth/guest";
import { redirect } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function submitMinimalProfile(prevState: any, formData: FormData) {
  const checkinCode = formData.get("checkinCode") as string;
  const rawData = Object.fromEntries(formData.entries());

  const parsedData = {
    ...rawData,
    hasConsented: rawData.hasConsented === "true" ? true : undefined,
  };

  const validationResult = minimalProfileFormSchema.safeParse(parsedData);

  if (!validationResult.success) {
    const errorMsg = validationResult.error.issues[0]?.message || "โปรดตรวจสอบข้อมูลให้ถูกต้อง";
    return { error: errorMsg };
  }

  const { data } = validationResult;
  let visitId: string;

  try {
    const checkinContext = await resolveAndValidateCheckinCode(checkinCode);
    
    if (checkinContext.status !== "valid" || !checkinContext.details) {
      return { error: "รหัสเช็กอินไม่ถูกต้อง หรือสถานที่ยังไม่เปิดให้เช็กอิน" };
    }

    const guestToken = await getOrCreateGuestIdentity();

    const touristId = await setupGuestTouristProfile({
      guestToken,
      displayName: data.displayName,
      ageGroup: data.ageGroup,
      originCountryId: data.originCountryId || null,
      originProvinceId: data.originProvinceId || null,
      hasConsented: data.hasConsented,
    });

    visitId = await initiateVisit({
      touristId,
      attractionId: checkinContext.details.attraction!.attraction_id,
      photoSpotId: checkinContext.details.photo_spot?.photo_spot_id,
      checkinCodeId: checkinContext.details.checkin_code_id,
    });
  } catch (error: unknown) {
    console.error("Failed to submit minimal profile:", error);
    return { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง" };
  }
  
  // Navigate away on success (must be outside try-catch to allow NEXT_REDIRECT to propagate)
  redirect(`/visit/${visitId}/photo`);
}
