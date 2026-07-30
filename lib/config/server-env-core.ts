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
  STORAGE_PROVIDER: z.enum(["supabase", "cloudinary", "university_server"]).default("supabase"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default("southern-border-tourism"),
  CLOUDINARY_DELIVERY_TYPE: z.enum(["authenticated", "upload"]).default("authenticated"),
  UNIVERSITY_STORAGE_BASE_URL: z.string().url().optional(),
  UNIVERSITY_STORAGE_UPLOAD_ENDPOINT: z.string().url().optional(),
  UNIVERSITY_STORAGE_ACCESS_TOKEN: z.string().optional(),
  LINE_CHANNEL_ID: z.string().optional(),
  LINE_CHANNEL_SECRET: z.string().optional(),
  HEALTH_CHECK_SECRET: z.string().min(16).optional(),
  CONTENT_ENGAGEMENT_HASH_SECRET: z.string().min(32).optional(),
  CRON_SECRET: z.string().min(32).optional()
}).superRefine((value, ctx) => {
  if (value.STORAGE_PROVIDER === "cloudinary") {
    for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const) {
      if (!value[key]?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} is required when STORAGE_PROVIDER=cloudinary`
        });
      }
    }
  }

  if (value.STORAGE_PROVIDER === "university_server") {
    for (const key of ["UNIVERSITY_STORAGE_BASE_URL", "UNIVERSITY_STORAGE_UPLOAD_ENDPOINT", "UNIVERSITY_STORAGE_ACCESS_TOKEN"] as const) {
      if (!value[key]?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} is required when STORAGE_PROVIDER=university_server`
        });
      }
    }
  }
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    throw new Error(`Server environment configuration is invalid: ${maskEnvIssues(result.error)}`);
  }

  return result.data;
}
