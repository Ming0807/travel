import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    phase: "01-project-setup",
    service: "southern-border-tourism-platform"
  });
}
