"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitTouristStoryAction(formData: FormData) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
    const adminSupabase = createSupabaseServiceRoleClient();

    // Check authentication (use getUser to avoid warning)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Please log in to share your story." };
    }

    const provider = user.app_metadata.provider || "email";

    // Check tourist profile
    let { data: touristProfile } = await adminSupabase
      .from("tourist_identities")
      .select("tourist_id")
      .eq("provider", provider)
      .eq("provider_user_id", user.id)
      .maybeSingle();

    if (!touristProfile) {
      // Auto-create a basic tourist profile for the logged-in user
      const { data: newTourist, error: createError } = await adminSupabase
        .from("tourists")
        .insert({
          display_name: user.email?.split("@")[0] || "Tourist",
          age_group: null
        })
        .select("tourist_id")
        .single();

      if (createError || !newTourist) {
        console.error("Auto-create tourist error:", createError);
        return { success: false, error: "Failed to create tourist profile." };
      }

      await adminSupabase.from("tourist_identities").insert({
        tourist_id: newTourist.tourist_id,
        provider: provider,
        provider_user_id: user.id,
        is_primary: true
      });

      touristProfile = { tourist_id: newTourist.tourist_id };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = content.slice(0, 150) + (content.length > 150 ? "..." : "");
    const provinceId = formData.get("provinceId") as string;
    
    if (!title || !content || !provinceId) {
      return { success: false, error: "Please fill in all required fields." };
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-4);

    const { data: story, error: storyError } = await adminSupabase
      .from("travel_stories")
      .insert({
        slug,
        title,
        excerpt,
        content,
        category: "Story",
        province_id: parseInt(provinceId),
        author_type: "tourist",
        tourist_id: touristProfile.tourist_id,
        status: "pending",
        is_published: false
      })
      .select()
      .single();

    if (storyError || !story) {
      console.error("Submit story error:", storyError);
      return { success: false, error: "Failed to submit story. Please try again." };
    }

    revalidatePath("/stories");
    return { success: true, storyId: story.slug };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}
