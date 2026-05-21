import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { LineLinkingError, verifyLineTokenForClient } from "@/lib/services/line-linking.service";
import { lineVerifyRequestSchema } from "@/lib/validation/line";

export const dynamic = "force-dynamic";

function readStatusForError(code: string) {
  if (code === "LINE_NOT_CONFIGURED") return 503;
  if (code === "LINE_TOKEN_INVALID" || code === "LINE_VERIFY_FAILED") return 400;
  return 500;
}

function readSafeMessage(code: string) {
  if (code === "LINE_NOT_CONFIGURED") {
    return "LINE has not been configured for this environment.";
  }

  if (code === "LINE_TOKEN_INVALID" || code === "LINE_VERIFY_FAILED") {
    return "LINE verification failed.";
  }

  return "Could not verify LINE right now.";
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request. Please try again."
        }
      },
      { status: 400 }
    );
  }

  try {
    const input = lineVerifyRequestSchema.parse(payload);
    const result = await verifyLineTokenForClient(input);

    return NextResponse.json({
      success: true,
      provider: result.provider,
      displayName: result.displayName
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid LINE verification data."
          }
        },
        { status: 400 }
      );
    }

    if (error instanceof LineLinkingError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: readSafeMessage(error.code)
          }
        },
        { status: readStatusForError(error.code) }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LINE_VERIFY_FAILED",
          message: "Could not verify LINE right now."
        }
      },
      { status: 500 }
    );
  }
}
