import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().trim().min(2, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร").max(100),
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง").max(320),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "กรุณากรอกรายละเอียดอย่างน้อย 10 ตัวอักษร").max(2000),
});

function errorResponse(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details === undefined ? {} : { details }) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientKey = forwardedFor || "unknown";
    const limit = rateLimit(`${clientKey}_contact`, 5, 60 * 60 * 1000);

    if (!limit.success) {
      return errorResponse("RATE_LIMITED", "ส่งข้อความบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่", 429);
    }

    const parsed = contactSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "ข้อมูลบางรายการไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่",
        400,
        parsed.error.flatten().fieldErrors,
      );
    }

    const { name, email, subject, message } = parsed.data;
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email: email.toLowerCase(),
      subject: subject || null,
      message,
      status: "unread",
      is_replied: false,
    });

    if (error) {
      console.error("Contact form insert failed:", error.code ?? "unknown");
      return errorResponse("SAVE_FAILED", "ยังส่งข้อความไม่ได้ กรุณาลองใหม่อีกครั้ง", 500);
    }

    return NextResponse.json(
      { success: true, message: "ส่งข้อความเรียบร้อยแล้ว" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Contact API failed:", error instanceof Error ? error.name : "unknown");
    return errorResponse("UNEXPECTED_ERROR", "ยังส่งข้อความไม่ได้ กรุณาลองใหม่อีกครั้ง", 500);
  }
}
