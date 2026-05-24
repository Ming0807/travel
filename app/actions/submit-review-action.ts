"use server";

import { revalidatePath } from "next/cache";
import { resolveCurrentTouristId } from "@/lib/auth/guards";
import { getGuestIdentity } from "@/lib/auth/guest";
import { findTouristByIdentity } from "@/lib/repositories/tourist.repository";
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
    // Validate at least one target
    if (!input.attractionId && !input.restaurantId) {
      return { success: false, error: "Please specify an attraction or restaurant." };
    }

    // Validate rating
    if (!input.rating || input.rating < 1 || input.rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5." };
    }

    // Resolve tourist identity
    const guestToken = await getGuestIdentity();
    if (!guestToken) {
      return { success: false, error: "Please create your passport first before submitting a review." };
    }

    const touristId = await findTouristByIdentity("anonymous_device", guestToken);
    if (!touristId) {
      return { success: false, error: "Tourist identity not found. Please create your passport first." };
    }

    // Check for duplicate review
    const supabase = createSupabaseServiceRoleClient();
    let dupQuery = supabase
      .from("reviews")
      .select("review_id")
      .eq("tourist_id", touristId)
      .is("deleted_at", null);

    if (input.attractionId) {
      dupQuery = dupQuery.eq("attraction_id", input.attractionId);
    } else if (input.restaurantId) {
      dupQuery = dupQuery.eq("restaurant_id", input.restaurantId);
    }

    const { data: existing } = await dupQuery.maybeSingle();
    if (existing) {
      return { success: false, error: "You have already reviewed this place." };
    }

    // Insert review
    const { error } = await supabase.from("reviews").insert({
      tourist_id: touristId,
      attraction_id: input.attractionId ?? null,
      restaurant_id: input.restaurantId ?? null,
      rating: input.rating,
      title: input.title?.trim() ?? null,
      comment: input.comment?.trim() ?? null,
      is_approved: false,
      is_published: false,
    });

    if (error) {
      return { success: false, error: "Failed to submit review. Please try again." };
    }

    // Revalidate
    if (input.attractionId) {
      revalidatePath(`/attractions/[slug]`);
    }
    if (input.restaurantId) {
      revalidatePath(`/restaurants/[slug]`);
    }

    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
