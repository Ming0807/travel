import { z } from "zod";

export const lineLinkLanguageSchema = z.enum(["th", "en"]).default("th");

export const lineIdTokenSchema = z
  .string()
  .trim()
  .min(20, "LINE ID token is required.")
  .max(8192, "LINE ID token is too long.");

export const lineLinkRequestSchema = z.object({
  idToken: lineIdTokenSchema,
  hasConsented: z.literal(true),
  language: lineLinkLanguageSchema
});

export const lineVerifyRequestSchema = z.object({
  idToken: lineIdTokenSchema
});

export type LineLinkRequest = z.infer<typeof lineLinkRequestSchema>;
export type LineVerifyRequest = z.infer<typeof lineVerifyRequestSchema>;
