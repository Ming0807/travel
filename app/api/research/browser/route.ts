import { NextResponse } from "next/server";
import { researchBrowserProvisioningEnabled } from "@/lib/config/research-browser";
import { createResearchBrowserToken, readResearchBrowserToken, writeResearchBrowserToken } from "@/lib/auth/research-browser";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ ready: false }, { status: 403, headers });
  }
  try {
    if (!researchBrowserProvisioningEnabled()) return NextResponse.json({ ready: false }, { status: 404, headers });
    if (!await readResearchBrowserToken()) {
      if (request.headers.get("x-research-cookie-check") === "verify") return NextResponse.json({ ready: false }, { status: 409, headers });
      await writeResearchBrowserToken(createResearchBrowserToken());
    }
    return NextResponse.json({ ready: true }, { headers });
  } catch {
    return NextResponse.json({ ready: false }, { status: 503, headers });
  }
}
