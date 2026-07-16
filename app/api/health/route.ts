import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPublicEnv } from "@/lib/config/public-env";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SERVICE_NAME = "southern-border-tourism-platform";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

type DependencyStatus = "ok" | "unavailable";

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

function releaseId() {
  return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local";
}

function hasValidBearerToken(request: NextRequest) {
  const secret = process.env.HEALTH_CHECK_SECRET?.trim();
  const authorization = request.headers.get("authorization") ?? "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;

  const supplied = authorization.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function readinessBody(
  status: "ok" | "degraded",
  checks: Record<"environment" | "database" | "storage", DependencyStatus>,
  startedAt: number,
) {
  return {
    status,
    service: SERVICE_NAME,
    check: "readiness",
    release: releaseId(),
    checks,
    durationMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("mode") !== "ready") {
    return json({
      status: "ok",
      service: SERVICE_NAME,
      check: "liveness",
      release: releaseId(),
      timestamp: new Date().toISOString(),
    });
  }

  if (!hasValidBearerToken(request)) return json({ status: "unauthorized" }, 401);

  const startedAt = Date.now();
  const checks: Record<"environment" | "database" | "storage", DependencyStatus> = {
    environment: "unavailable",
    database: "unavailable",
    storage: "unavailable",
  };

  let storageProvider: string;
  try {
    getPublicEnv();
    const serverEnv = getServerEnv();
    storageProvider = serverEnv.STORAGE_PROVIDER;
    checks.environment = "ok";
    checks.storage = storageProvider === "university_server" ? "unavailable" : "ok";
  } catch {
    return json(readinessBody("degraded", checks, startedAt), 503);
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase.from("provinces").select("province_id").limit(1);
    if (!error) checks.database = "ok";
  } catch {
    checks.database = "unavailable";
  }

  const isReady = Object.values(checks).every((status) => status === "ok");
  return json(readinessBody(isReady ? "ok" : "degraded", checks, startedAt), isReady ? 200 : 503);
}

export async function HEAD(request: NextRequest) {
  const response = await GET(request);
  return new Response(null, { status: response.status, headers: response.headers });
}
