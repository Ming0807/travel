"use server";

import { revalidatePath } from "next/cache";
import { resolveCurrentTouristId } from "@/lib/auth/guards";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

type SubmitReviewInput = {
  attractionId?: number;
  restaurantId?: number;
  rating: number;
  title?: string;
  comment?: string;
};

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function submitReviewAction(input: SubmitReviewInput): Promise<ActionResult> {
  try {
    const hasAttraction = Number.isInteger(input.attractionId) && Number(input.attractionId) > 0;
    const hasRestaurant = Number.isInteger(input.restaurantId) && Number(input.restaurantId) > 0;

    if (hasAttraction === hasRestaurant) {
      return { success: false, error: "กรุณาเลือกสถานที่หรือร้านอาหารอย่างใดอย่างหนึ่ง" };
    }

    const rating = Number(input.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { success: false, error: "คะแนนรีวิวต้องอยู่ระหว่าง 1 ถึง 5" };
    }

    const title = input.title?.trim().slice(0, 255) || null;
    const comment = input.comment?.trim().slice(0, 5000) || null;

    // Resolve tourist identity (supports OAuth + guest)
    let touristId: string;
    try {
      touristId = await resolveCurrentTouristId();
    } catch {
      return { success: false, error: "กรุณาสร้างพาสปอร์ตก่อนส่งรีวิว" };
    }

    // Check for duplicate review
    const supabase = createSupabaseServiceRoleClient();
    let dupQuery = supabase
      .from("reviews")
      .select("review_id")
      .eq("tourist_id", touristId)
      .is("deleted_at", null);

    if (hasAttraction) {
      dupQuery = dupQuery.eq("attraction_id", input.attractionId);
    } else {
      dupQuery = dupQuery.eq("restaurant_id", input.restaurantId);
    }

    const { data: existing } = await dupQuery.maybeSingle();
    if (existing) {
      return { success: false, error: "คุณเคยรีวิวสถานที่นี้แล้ว" };
    }

    // Insert review
    const { error } = await supabase.from("reviews").insert({
      tourist_id: touristId,
      attraction_id: hasAttraction ? input.attractionId : null,
      restaurant_id: hasRestaurant ? input.restaurantId : null,
      rating,
      title,
      comment,
      is_approved: false,
      is_published: false,
    });

    if (error) {
      return { success: false, error: "ส่งรีวิวไม่สำเร็จ กรุณาลองอีกครั้ง" };
    }

    // Revalidate
    if (hasAttraction) {
      revalidatePath(`/attractions/[slug]`);
    }
    if (hasRestaurant) {
      revalidatePath(`/restaurants/[slug]`);
    }

    return { success: true };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง" };
  }
}
