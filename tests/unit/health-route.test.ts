import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getPublicEnv: vi.fn(),
  getServerEnv: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: mocks.createClient,
}));

vi.mock("@/lib/config/server-env", () => ({
  getServerEnv: mocks.getServerEnv,
}));

vi.mock("@/lib/config/public-env", () => ({
  getPublicEnv: mocks.getPublicEnv,
}));

import { GET } from "@/app/api/health/route";

const healthGet = GET as unknown as (request: NextRequest) => Promise<Response>;

function request(mode?: string, token?: string) {
  const query = mode ? `?mode=${mode}` : "";
  return new NextRequest(`http://localhost:3000/api/health${query}`, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
}

describe("health route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.HEALTH_CHECK_SECRET = "health-secret-value";
    mocks.getPublicEnv.mockReturnValue({
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });
    mocks.getServerEnv.mockReturnValue({
      APP_ENV: "test",
      STORAGE_PROVIDER: "supabase",
      HEALTH_CHECK_SECRET: "health-secret-value",
    });
    mocks.createClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [{ province_id: 1 }], error: null }),
        })),
      })),
    });
  });

  it("returns a lightweight public liveness response without touching dependencies", async () => {
    const response = await healthGet(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toMatchObject({
      status: "ok",
      service: "southern-border-tourism-platform",
      check: "liveness",
    });
    expect(body).not.toHaveProperty("phase");
    expect(body).not.toHaveProperty("checks");
    expect(mocks.getServerEnv).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("rejects readiness checks without the configured bearer secret", async () => {
    const response = await healthGet(request("ready"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ status: "unauthorized" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("rejects readiness checks with the wrong bearer secret", async () => {
    const response = await healthGet(request("ready", "wrong-secret"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ status: "unauthorized" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("reports environment, database, and storage readiness without sensitive details", async () => {
    const response = await healthGet(request("ready", "health-secret-value"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      check: "readiness",
      checks: {
        environment: "ok",
        database: "ok",
        storage: "ok",
      },
    });
    expect(JSON.stringify(body)).not.toContain("health-secret-value");
    expect(JSON.stringify(body)).not.toContain("province_id");
  });

  it("returns a generic 503 response when the database is unavailable", async () => {
    mocks.createClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "password=secret database.internal" },
          }),
        })),
      })),
    });

    const response = await healthGet(request("ready", "health-secret-value"));
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(503);
    expect(serialized).toContain('"database":"unavailable"');
    expect(serialized).not.toContain("password=secret");
    expect(serialized).not.toContain("database.internal");
  });
});
