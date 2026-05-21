import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { linkCurrentTouristWithLine, LineLinkingError } from "@/lib/services/line-linking.service";
import { lineLinkRequestSchema } from "@/lib/validation/line";

export const dynamic = "force-dynamic";

function readStatusForError(code: string) {
  switch (code) {
    case "LINE_NOT_CONFIGURED":
      return 503;
    case "LINE_TOKEN_INVALID":
    case "LINE_VERIFY_FAILED":
    case "CONSENT_REQUIRED":
      return 400;
    case "TOURIST_IDENTITY_NOT_FOUND":
      return 404;
    case "IDENTITY_CONFLICT":
      return 409;
    default:
      return 500;
  }
}

function readSafeMessage(code: string) {
  switch (code) {
    case "LINE_NOT_CONFIGURED":
      return "LINE has not been configured for this environment. You can continue as Guest.";
    case "LINE_TOKEN_INVALID":
    case "LINE_VERIFY_FAILED":
      return "LINE verification failed.";
    case "TOURIST_IDENTITY_NOT_FOUND":
      return "No guest passport was found. You can continue as Guest.";
    case "IDENTITY_CONFLICT":
      return "This LINE account is already linked to another passport.";
    case "CONSENT_REQUIRED":
      return "Please consent before linking LINE.";
    default:
      return "Could not link LINE right now. You can continue as Guest.";
  }
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
    const input = lineLinkRequestSchema.parse(payload);
    const result = await linkCurrentTouristWithLine(input);

    return NextResponse.json({
      success: true,
      linked: true,
      provider: "line",
      status: result.status
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid LINE linking data. Please check and try again."
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
          code: "LINE_LINK_FAILED",
          message: "Could not link LINE right now. You can continue as Guest."
        }
      },
      { status: 500 }
    );
  }
}
