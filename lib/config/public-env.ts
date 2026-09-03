import { z } from "zod";
import { maskEnvIssues } from "./env-utils";

const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_LIFF_ID: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (!value.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !value.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      context.addIssue({
        code: "custom",
        message: "A Supabase publishable key or legacy anon key is required",
        path: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
      });
    }
  });

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function getSupabasePublicKey(env: PublicEnv): string {
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Public Supabase API key is unavailable");
  return key;
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicEnvSchema.safeParse(source);

  if (!result.success) {
    throw new Error(`Public environment configuration is invalid: ${maskEnvIssues(result.error)}`);
  }

  return result.data;
}

export function getPublicEnv() {
  return parsePublicEnv({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
  });
}
