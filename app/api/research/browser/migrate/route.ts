import { NextResponse } from "next/server";
import { z } from "zod";
import { researchBrowserProvisioningEnabled } from "@/lib/config/research-browser";
import { migrateResearchVisitCredential } from "@/lib/auth/research-browser";

export async function POST(request: Request) {
  const headers = { "cache-control": "no-store" };
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) {
    return NextResponse.json({ migrated: false }, { status: 403, headers });
  }
  const visit = z.uuid().safeParse(url.searchParams.get("visitId"));
  if (!visit.success || url.searchParams.size !== 1) {
    return NextResponse.json({ migrated: false }, { status: 400, headers });
  }
  try {
    if (!researchBrowserProvisioningEnabled()) {
      return NextResponse.json({ migrated: false }, { status: 404, headers });
    }
    return NextResponse.json({ migrated: await migrateResearchVisitCredential(visit.data) }, { headers });
  } catch {
    return NextResponse.json({ migrated: false }, { status: 503, headers });
  }
}
