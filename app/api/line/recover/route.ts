import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { ZodError } from "zod";

import { verifyLineIdToken } from "@/lib/line/verify";
import { lineLinkRequestSchema } from "@/lib/validation/line";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request." } },
      { status: 400 }
    );
  }

  try {
    const input = lineLinkRequestSchema.parse(payload);
    
    // 1. Verify token
    const verifiedIdentity = await verifyLineIdToken(input.idToken);

    // 2. Lookup existing tourist via LINE
    const supabase = createSupabaseServiceRoleClient();
    const { data: existingIdentity, error: searchError } = await supabase
      .from("tourist_identities")
      .select("tourist_id")
      .eq("provider", "line")
      .eq("provider_user_id", verifiedIdentity.providerUserId)
      .maybeSingle();

    if (searchError || !existingIdentity) {
      return NextResponse.json(
        { success: false, error: { code: "TOURIST_NOT_FOUND", message: "ไม่พบข้อมูลพาสปอร์ตที่ผูกกับบัญชี LINE นี้" } },
        { status: 404 }
      );
    }

    const touristId = existingIdentity.tourist_id;

    // 3. Create a new guest token for this device and link it to the tourist
    const newGuestToken = crypto.randomUUID();
    
    const { error: insertError } = await supabase
      .from("tourist_identities")
      .insert({
        tourist_id: touristId,
        provider: "anonymous_device",
        provider_user_id: newGuestToken,
      });

    if (insertError) {
      console.error("[LINE RECOVER] Failed to link new device:", insertError);
      return NextResponse.json(
        { success: false, error: { code: "RECOVERY_FAILED", message: "เกิดข้อผิดพลาดในการกู้คืนบัญชี" } },
        { status: 500 }
      );
    }

    // 4. Set the new guest cookie
    const cookieStore = await cookies();
    cookieStore.set("sbtp_guest_id", newGuestToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return NextResponse.json({
      success: true,
      recovered: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid LINE data." } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "LINE_VERIFY_FAILED", message: "ไม่สามารถยืนยันตัวตนกับ LINE ได้" } },
      { status: 500 }
    );
  }
}
