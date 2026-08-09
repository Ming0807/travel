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

  const candidates: Array<{ language: Exclude<PreferredLanguage, null>; quality: number; order: number }> = [];

  for (const [order, entry] of acceptLanguage.split(",").entries()) {
    const [tag, ...parameters] = entry.split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    const weight = quality ? Number(quality.trim().slice(2)) : 1;
    if (!Number.isFinite(weight) || weight <= 0 || weight > 1) continue;

    const language = normalizeLanguageTag(tag);
    if (PREFERRED_LANGUAGES.includes(language as (typeof PREFERRED_LANGUAGES)[number])) {
      candidates.push({
        language: language as Exclude<PreferredLanguage, null>,
        quality: weight,
        order,
      });
    }
  }

  candidates.sort((left, right) => right.quality - left.quality || left.order - right.order);
  return candidates[0]?.language ?? null;
}
