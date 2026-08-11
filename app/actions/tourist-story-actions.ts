"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveCurrentTouristId, TouristAccessError } from "@/lib/auth/guards";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

// ─── Content Safety ────────────────────────────────────────────────────────

/**
 * Normalizes user-submitted content to safe plain text.
 *
 * Bounded decode loop (max 3 passes) handles double-encoded attacks
 * like &amp;lt;script&amp;gt; → &lt;script&gt; → <script> → stripped.
 *
 * Pipeline:
 * 1. Bounded entity decode (lowercase, uppercase, decimal, hex, double-encoded)
 * 2. Strip HTML comments
 * 3. Strip all HTML tags
 *
 * Result: pure plain text — no raw HTML can survive.
 * Tourist UGC is stored as plain text and never rendered via dangerouslySetInnerHTML.
 */
function normalizePlainText(input: string): string {
  // ---- entity decode --------------------------------------------------
  let result = input;

  for (let pass = 0; pass < 3; pass++) {
    const before = result;

    // Named angle-bracket entities (lowercase + uppercase)
    result = result
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&");

    // Decimal numeric character references
    result = result.replace(/&#(\d+);/g, (_match, digits: string) => {
      const codePoint = Number(digits);
      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : "";
    });

    // Hex numeric character references (case-insensitive)
    result = result.replace(/&#[xX]([\da-fA-F]+);/g, (_match, hex: string) => {
      const codePoint = Number.parseInt(hex, 16);
      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : "";
    });

    // Quote entities
    result = result.replace(/&quot;/g, '"').replace(/&#x27;/g, "'");

    // Stop if no more entities were decoded in this pass
    if (result === before) break;
  }

  // ---- strip markup ----------------------------------------------------
  // HTML comments
  result = result.replace(/<!--[\s\S]*?-->/g, "");
  // All HTML tags (self-closing + paired)
  result = result.replace(/<[^>]*>/g, "");

  return result;
}

// ─── Validation ────────────────────────────────────────────────────────────

const STRICT_INTEGER_RE = /^\d+$/;

function validateProvinceId(raw: string): number | null {
  // Reject empty, whitespace, hex (0x), exponent (1e2), float, negative, zero
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!STRICT_INTEGER_RE.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

function validateStoryInput(formData: FormData):
  | { valid: true; title: string; content: string; provinceId: number }
  | { valid: false; error: string; field?: string }
{
  const rawTitle = formData.get("title");
  const rawContent = formData.get("content");
  const rawProvinceId = formData.get("provinceId");
  const rightsConfirmed = formData.get("rightsConfirmed");

  if (typeof rawTitle !== "string" || typeof rawContent !== "string" || typeof rawProvinceId !== "string") {
    return { valid: false, error: "กรุณากรอกข้อมูลให้ครบทุกช่อง", field: "form" };
  }

  if (rightsConfirmed !== "true") {
    return {
      valid: false,
      error: "กรุณายืนยันว่าคุณมีสิทธิ์แบ่งปันเนื้อหานี้",
      field: "rightsConfirmed",
    };
  }

  const title = normalizePlainText(rawTitle).trim();
  const content = normalizePlainText(rawContent).trim();

  if (!title) {
    return { valid: false, error: "กรุณากรอกชื่อเรื่อง", field: "title" };
  }
  if (!content) {
    return { valid: false, error: "กรุณากรอกเนื้อหาเรื่องราว", field: "content" };
  }

  const provinceId = validateProvinceId(rawProvinceId);
  if (provinceId === null) {
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

// ─── Server Action ─────────────────────────────────────────────────────────

export async function submitTouristStoryAction(formData: FormData) {
  try {
    // 1. Validate input BEFORE any DB operations
    const validation = validateStoryInput(formData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        ...(validation.field === "rightsConfirmed"
          ? { code: "STORY_RIGHTS_REQUIRED" as const }
          : {}),
      };
    }
    const { title, content, provinceId } = validation;

    // 2. Authenticate
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนแบ่งปันเรื่องราว" };
    }

    // 3. Resolve tourist identity — does NOT create or link profiles.
    //    Profile creation/linking belongs in auth callback or explicit identity-linking flow.
    let touristId: string;
    try {
      touristId = await resolveCurrentTouristId();
    } catch (err) {
      if (err instanceof TouristAccessError && err.code === "TOURIST_IDENTITY_NOT_FOUND") {
        return { success: false, error: "ไม่พบพาสปอร์ตของคุณ กรุณาเข้าสู่ระบบใหม่หรือสร้างพาสปอร์ตก่อน" };
      }
      return { success: false, error: "ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่" };
    }

    // 4. Compute excerpt from validated plain text.
    const excerpt = content.slice(0, 150).replace(/\s+/g, " ").trim()
      + (content.length > 150 ? "..." : "");

    // 5. Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now().toString().slice(-4);

    // 6. Verify province exists before inserting story
    const adminSupabase = createSupabaseServiceRoleClient();
    const { data: provinceExists, error: provinceError } = await adminSupabase
      .from("provinces")
      .select("province_id")
      .eq("province_id", provinceId)
      .maybeSingle();
    if (provinceError) {
      return { success: false, error: "ไม่สามารถตรวจสอบข้อมูลจังหวัดได้ กรุณาลองใหม่" };
    }
    if (!provinceExists) {
      return { success: false, error: "ไม่พบจังหวัดที่ระบุ กรุณาลองใหม่" };
    }

    // 7. Prevent an accidental repeat while an identical submission is still active.
    const { data: existingStory, error: duplicateError } = await adminSupabase
      .from("travel_stories")
      .select("story_id,status")
      .eq("tourist_id", touristId)
      .eq("author_type", "tourist")
      .eq("province_id", provinceId)
      .eq("title", title)
      .eq("content", content)
      .in("status", ["submitted", "in_review", "changes_requested", "approved"])
      .limit(1)
      .maybeSingle();

    if (duplicateError) {
      return {
        success: false,
        code: "STORY_DUPLICATE_CHECK_FAILED",
        error: "ยังไม่สามารถตรวจสอบเรื่องราวที่รอตรวจได้ กรุณาลองใหม่",
      };
    }
    if (existingStory?.story_id) {
      return {
        success: false,
        code: "STORY_ALREADY_PENDING",
        error: "เรื่องราวนี้อยู่ระหว่างการตรวจสอบแล้ว",
      };
    }

    // 8. Insert directly into the current tourist editorial workflow.
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
        status: "submitted",
        is_published: false,
      })
      .select("slug")
      .single();

    if (storyError?.code === "23505") {
      return {
        success: false,
        code: "STORY_ALREADY_PENDING",
        error: "เรื่องราวนี้อยู่ระหว่างการตรวจสอบแล้ว",
      };
    }
    if (storyError || !story) {
      return { success: false, error: "ไม่สามารถส่งเรื่องราวได้ กรุณาลองใหม่" };
    }

    revalidatePath("/stories");
    return { success: true, storyId: story.slug, status: "submitted" as const };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่" };
  }
}
