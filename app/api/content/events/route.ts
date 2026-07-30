import { NextRequest, NextResponse } from "next/server";
import { isStoryEngagementOriginAllowed } from "@/lib/security/story-engagement";
import { recordStoryEngagementSignal } from "@/lib/services/story-engagement.service";
import { parseStoryEngagementPayload } from "@/lib/validation/story-engagement";

const MAX_BODY_BYTES = 2 * 1024;

function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    {
      status,
      headers: { "cache-control": "no-store" },
    },
  );
}

function getTransientSource(request: NextRequest): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

async function readBoundedBody(
  request: NextRequest,
  maximumBytes: number,
): Promise<string | null> {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maximumBytes) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

export async function POST(request: NextRequest) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return errorResponse(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "รองรับเฉพาะข้อมูล JSON",
    );
  }

  const origin = request.headers.get("origin");
  const appEnv =
    process.env.APP_ENV === "production" ||
    process.env.APP_ENV === "staging" ||
    process.env.APP_ENV === "test"
      ? process.env.APP_ENV
      : "local";

  if (
    !isStoryEngagementOriginAllowed(origin, {
      appEnv,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    })
  ) {
    return errorResponse(
      403,
      "INVALID_ORIGIN",
      "ไม่อนุญาตให้บันทึกข้อมูลจากเว็บไซต์นี้",
    );
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return errorResponse(
      413,
      "PAYLOAD_TOO_LARGE",
      "ข้อมูลมีขนาดใหญ่เกินกำหนด",
    );
  }

  const rawBody = await readBoundedBody(request, MAX_BODY_BYTES);
  if (rawBody === null) {
    return errorResponse(
      413,
      "PAYLOAD_TOO_LARGE",
      "ข้อมูลมีขนาดใหญ่เกินกำหนด",
    );
  }

  let input: unknown;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, "INVALID_JSON", "รูปแบบข้อมูลไม่ถูกต้อง");
  }

  let payload;
  try {
    payload = parseStoryEngagementPayload(input);
  } catch {
    return errorResponse(
      400,
      "VALIDATION_ERROR",
      "ข้อมูลการใช้งานไม่ถูกต้อง",
    );
  }

  try {
    await recordStoryEngagementSignal(payload, {
      transientSource: getTransientSource(request),
      origin: origin as string,
    });

    return NextResponse.json(
      { success: true },
      {
        status: 202,
        headers: { "cache-control": "no-store" },
      },
    );
  } catch {
    return errorResponse(
      503,
      "ENGAGEMENT_UNAVAILABLE",
      "ไม่สามารถบันทึกข้อมูลการใช้งานได้ในขณะนี้",
    );
  }
}
