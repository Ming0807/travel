import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/config/public-env";
import { parseServerEnv } from "@/lib/config/server-env-core";

const validPublicEnv = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-placeholder"
};

const validServerEnv = {
  APP_ENV: "local",
  APP_DEFAULT_LOCALE: "th",
  APP_SUPPORTED_LOCALES: "th,en",
  APP_TIMEZONE: "Asia/Bangkok",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-placeholder",
  SUPABASE_DATABASE_URL: "postgresql://postgres:password@db.example.supabase.co:5432/postgres",
  MAX_UPLOAD_IMAGE_SIZE_MB: "5",
  ALLOWED_TOURIST_IMAGE_MIME_TYPES: "image/jpeg,image/png,image/webp",
  CERTIFICATE_SIGNED_URL_TTL_SECONDS: "600",
  EXPORT_SIGNED_URL_TTL_SECONDS: "600",
  EXPORT_MAX_ROWS: "5000"
};

describe("environment validation", () => {
  it("parses public browser-safe environment variables", () => {
    expect(parsePublicEnv(validPublicEnv).NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("rejects invalid public URLs", () => {
    expect(() =>
      parsePublicEnv({
        ...validPublicEnv,
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url"
      })
    ).toThrow("Public environment configuration is invalid");
  });

  it("parses server-only environment variables without exposing public keys", () => {
    const parsed = parseServerEnv(validServerEnv);

    expect(parsed.SUPABASE_SERVICE_ROLE_KEY).toBe("service-role-placeholder");
    expect(Object.keys(parsed)).not.toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });

  it("rejects missing service role configuration", () => {
    const withoutServiceRole: Record<string, string | undefined> = { ...validServerEnv };
    delete withoutServiceRole.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => parseServerEnv(withoutServiceRole)).toThrow("Server environment configuration is invalid");
  });
});
