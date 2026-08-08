import { z } from "zod";

export const PREFERRED_LANGUAGES = ["th", "en", "ms"] as const;
export const PREFERRED_LANGUAGE_SOURCES = ["detected", "selected"] as const;

export const preferredLanguageSchema = z.enum(PREFERRED_LANGUAGES).nullable();
export const preferredLanguageSourceSchema = z.enum(PREFERRED_LANGUAGE_SOURCES).nullable();

export type PreferredLanguage = z.infer<typeof preferredLanguageSchema>;
export type PreferredLanguageSource = z.infer<typeof preferredLanguageSourceSchema>;

function normalizeLanguageTag(value: string) {
  return value.trim().toLowerCase().split("-")[0];
}

export function detectPreferredLanguage(acceptLanguage: string | null | undefined): PreferredLanguage {
  if (!acceptLanguage) return null;

  for (const entry of acceptLanguage.split(",")) {
    const [tag, ...parameters] = entry.split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    if (quality && Number(quality.trim().slice(2)) === 0) continue;

    const language = normalizeLanguageTag(tag);
    if (PREFERRED_LANGUAGES.includes(language as (typeof PREFERRED_LANGUAGES)[number])) {
      return language as PreferredLanguage;
    }
  }

  return null;
}
