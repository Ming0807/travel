import { z } from "zod";
import { maskEnvIssues } from "./env-utils";

const serverEnvSchema = z.object({
  APP_ENV: z.enum(["local", "staging", "production", "test"]).default("local"),
  APP_DEFAULT_LOCALE: z.enum(["th", "en"]).default("th"),
  APP_SUPPORTED_LOCALES: z.string().default("th,en"),
  APP_TIMEZONE: z.string().default("Asia/Bangkok"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DATABASE_URL: z.string().min(1),
  MAX_UPLOAD_IMAGE_SIZE_MB: z.coerce.number().positive().default(5),
  ALLOWED_TOURIST_IMAGE_MIME_TYPES: z.string().default("image/jpeg,image/png,image/webp"),
  CERTIFICATE_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  EXPORT_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  EXPORT_MAX_ROWS: z.coerce.number().int().positive().default(5000),
  LINE_CHANNEL_ID: z.string().optional(),
  LINE_CHANNEL_SECRET: z.string().optional()
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    throw new Error(`Server environment configuration is invalid: ${maskEnvIssues(result.error)}`);
  }

  return result.data;
}
