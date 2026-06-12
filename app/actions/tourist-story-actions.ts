"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findTouristByIdentity, createTouristIdentity, createTouristProfile } from "@/lib/repositories/tourist.repository";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function submitTouristStoryAction(formData: FormData) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนแบ่งปันเรื่องราว" };
    }

    const provider = user.app_metadata.provider || "email";

    // Resolve or create tourist profile via repository (consistent with auth/callback)
    let touristId = await findTouristByIdentity(provider, user.id);

    if (!touristId) {
      // Auto-create a minimal tourist profile for authenticated users
      // Display name from metadata — never expose email prefix
      const displayName = user.user_metadata?.full_name
        || user.user_metadata?.name
        || "นักเดินทาง";

      touristId = await createTouristProfile({
        displayName,
        ageGroup: "prefer_not_to_answer",
      });

      if (!touristId) {
        return { success: false, error: "ไม่สามารถสร้างโปรไฟล์นักเดินทางได้ กรุณาลองใหม่" };
      }

      await createTouristIdentity(touristId, provider, user.id);
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = content.slice(0, 150) + (content.length > 150 ? "..." : "");
    const provinceId = formData.get("provinceId") as string;

    if (!title || !content || !provinceId) {
      return { success: false, error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" };
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-4);

    const adminSupabase = createSupabaseServiceRoleClient();
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
        tourist_id: touristId,
        status: "pending",
        is_published: false
      })
      .select()
      .single();

    if (storyError || !story) {
      return { success: false, error: "ไม่สามารถส่งเรื่องราวได้ กรุณาลองใหม่" };
    }

    revalidatePath("/stories");
    return { success: true, storyId: story.slug };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่" };
  }
}
