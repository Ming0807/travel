import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function POST() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNSUPPORTED_IDENTITY_LINK_ROUTE",
        message: "Account linking must use provider-specific server verification. You can continue as Guest."
      }
    },
    { status: 410 }
  );
}
