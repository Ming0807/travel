import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const baseUrl = request.nextUrl.origin;
  
  // Create an absolute URL for the redirect
  const checkinUrl = new URL(`/checkin/${code}`, baseUrl);
  
  return NextResponse.redirect(checkinUrl);
}
