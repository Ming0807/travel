import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { processCertificateGeneration } from "@/lib/services/certificate.service";
import { assignStampForVisit } from "@/lib/services/stamp.service";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";
import { getVisitById } from "@/lib/repositories/visit.repository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitId, photoId, base64Image } = body;

    if (!visitId || !base64Image) {
      return NextResponse.json(
        { error: "Missing required fields: visitId, base64Image" },
        { status: 400 }
      );
    }

    // 1. Verify visit exists
    const visit = await getVisitById(visitId);
    if (!visit) {
      return NextResponse.json(
        { error: "Visit not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = visit as any;

    // 2. Decode and upload certificate image to storage
    const supabase = createSupabaseServiceRoleClient();
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `certificates/${visitId}/certificate-${Date.now()}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error("Certificate storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to store certificate image" },
        { status: 500 }
      );
    }

    // 3. Create certificate record
    const certificateId = await processCertificateGeneration({
      visitId,
      templateId: 1, // Default template
      photoId: photoId || undefined,
      certificatePath: fileName,
    });

    // 4. Award stamp
    const stampResult = await assignStampForVisit(visitId);

    // 5. Track funnel event
    await recordFunnelEvent({
      eventName: "certificate_generated",
      checkinCodeId: v.checkin_code_id || undefined,
      attractionId: v.attraction_id,
      touristId: v.tourist_id,
      visitId,
    });

    // 6. Get certificate public URL
    const { data: publicUrlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(fileName);

    // Build stamp response safely
    const stampResponse = stampResult.success
      ? { status: stampResult.status, ...("stampId" in stampResult ? { stampId: stampResult.stampId } : {}) }
      : { status: "failed" as const };

    return NextResponse.json({
      success: true,
      certificateId,
      stamp: stampResponse,
      certificateUrl: publicUrlData?.publicUrl || fileName,
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
