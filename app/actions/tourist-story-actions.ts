"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGuestIdentity } from "@/lib/auth/guest";
import {
  findTouristByIdentity,
  createTouristIdentity,
  createTouristProfile,
} from "@/lib/repositories/tourist.repository";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

// ─── Validation ────────────────────────────────────────────────────────────

function validateStoryInput(formData: FormData):
  | { valid: true; title: string; content: string; provinceId: number }
  | { valid: false; error: string; field?: string }
{
  const rawTitle = formData.get("title");
  const rawContent = formData.get("content");
  const rawProvinceId = formData.get("provinceId");

  // Type coercion — reject non-string values silently
  if (typeof rawTitle !== "string" || typeof rawContent !== "string" || typeof rawProvinceId !== "string") {
    return { valid: false, error: "กรุณากรอกข้อมูลให้ครบทุกช่อง", field: "form" };
  }

  const title = rawTitle.trim();
  const content = rawContent.trim();

  if (!title) {
    return { valid: false, error: "กรุณากรอกชื่อเรื่อง", field: "title" };
  }
  if (!content) {
    return { valid: false, error: "กรุณากรอกเนื้อหาเรื่องราว", field: "content" };
  }

  // Strict positive integer validation — reject "12abc", "0", "-5", float strings
  const provinceId = Number(rawProvinceId);
  if (!Number.isFinite(provinceId) || !Number.isInteger(provinceId) || provinceId < 1) {
    return { valid: false, error: "กรุณาเลือกจังหวัดที่ถูกต้อง", field: "provinceId" };
  }

  const MAX_TITLE = 200;
  const MAX_CONTENT = 10000;
  if (title.length > MAX_TITLE) {
    return { valid: false, error: `ชื่อเรื่องต้องไม่เกิน ${MAX_TITLE} ตัวอักษร`, field: "title" };
  }
  if (content.length > MAX_CONTENT) {
    return { valid: false, error: `เนื้อหาต้องไม่เกิน ${MAX_CONTENT} ตัวอักษร`, field: "content" };
  }

  return { valid: true, title, content, provinceId };
}

// ─── Identity resolution (consistent with auth/callback) ──────────────────

async function resolveOrCreateTourist(user: {
  id: string;
  app_metadata: { provider?: string };
  user_metadata?: { full_name?: string; name?: string };
}): Promise<string> {
  const provider = user.app_metadata.provider || "email";

  // 1. Check if this OAuth user is already linked to a tourist profile
  let touristId = await findTouristByIdentity(provider, user.id);
  if (touristId) return touristId;

  // 2. Not linked. Check if they have a guest token on this device
  const guestToken = await getGuestIdentity();
  if (guestToken) {
    const guestTouristId = await findTouristByIdentity("anonymous_device", guestToken);
    if (guestTouristId) {
      // Found a guest profile — link OAuth identity to it
      await createTouristIdentity(guestTouristId, provider, user.id);
      return guestTouristId;
    }
  }

  // 3. No guest profile — create a brand new tourist profile
  const displayName =
    user.user_metadata?.full_name || user.user_metadata?.name || "นักเดินทาง";
  touristId = await createTouristProfile({
    displayName,
    ageGroup: "prefer_not_to_answer",
  });

  // Create identity — handle race condition
  try {
    await createTouristIdentity(touristId, provider, user.id);
  } catch (identityError: unknown) {
    // If identity insert failed (e.g. duplicate key), the tourist was already
    // created by a race. Re-read identity to avoid orphaning the profile.
    const recoveredId = await findTouristByIdentity(provider, user.id);
    if (recoveredId) return recoveredId;
    // Re-throw if truly unrecoverable
    throw identityError;
  }

  return touristId;
}

// ─── Server Action ─────────────────────────────────────────────────────────

export async function submitTouristStoryAction(formData: FormData) {
  try {
    // 1. Validate input BEFORE any DB operations
    const validation = validateStoryInput(formData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const { title, content, provinceId } = validation;

    // 2. Authenticate
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนแบ่งปันเรื่องราว" };
    }

    // 3. Resolve or create tourist identity
    let touristId: string;
    try {
      touristId = await resolveOrCreateTourist(user);
    } catch (identityErr: unknown) {
      // Distinguish between recoverable and unrecoverable
      const message = identityErr instanceof Error ? identityErr.message : "";
      if (message.includes("race") || message.includes("duplicate")) {
        return { success: false, error: "ไม่สามารถยืนยันตัวตนนักเดินทางได้ กรุณาลองใหม่" };
      }
      return { success: false, error: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่" };
    }

    // 4. Compute excerpt from validated content
    const excerpt = content.slice(0, 150).replace(/\s+/g, " ").trim() + (content.length > 150 ? "..." : "");

    // 5. Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now().toString().slice(-4);

    // 6. Insert story (service role required for admin-controlled tables)
    const adminSupabase = createSupabaseServiceRoleClient();
    const { data: story, error: storyError } = await adminSupabase
      .from("travel_stories")
      .insert({
        slug,
        title,
        excerpt,
        content,
        category: "Story",
        province_id: provinceId,
        author_type: "tourist",
        tourist_id: touristId,
        status: "pending",
        is_published: false,
      })
      .select("slug")
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
