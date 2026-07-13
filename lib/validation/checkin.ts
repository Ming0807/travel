import { z } from "zod";

export const resolveCheckinCodeSchema = z.object({
  code: z.string().min(1, "Check-in code is required").max(100, "Code too long"),
});

export type ResolveCheckinCodeInput = z.infer<typeof resolveCheckinCodeSchema>;

export const AGE_GROUP_OPTIONS = [
  { value: "under_18", label: "ต่ำกว่า 18 ปี" },
  { value: "18_24", label: "18-24 ปี" },
  { value: "25_34", label: "25-34 ปี" },
  { value: "35_44", label: "35-44 ปี" },
  { value: "45_54", label: "45-54 ปี" },
  { value: "55_64", label: "55-64 ปี" },
  { value: "65_plus", label: "65 ปีขึ้นไป" },
  { value: "prefer_not_to_answer", label: "ไม่ประสงค์ระบุ" },
] as const;

export type AgeGroupValue = (typeof AGE_GROUP_OPTIONS)[number]["value"];

const legacyAgeGroupMap: Record<string, AgeGroupValue> = {
  "0-15": "under_18",
  "16-24": "18_24",
  "25-34": "25_34",
  "35-44": "35_44",
  "45-54": "45_54",
  "55-64": "55_64",
  "65+": "65_plus",
};

export function normalizeAgeGroup(value: string | null): AgeGroupValue | null {
  if (!value) return null;
  if (AGE_GROUP_OPTIONS.some((option) => option.value === value)) return value as AgeGroupValue;
  return legacyAgeGroupMap[value] ?? null;
}

const requiredPositiveId = z.coerce.number().int().positive();
const optionalPositiveId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().positive().nullable(),
);

export const minimalFormSchema = z.object({
  displayName: z.string().min(1, "กรุณากรอกชื่อของคุณ").max(100),
  originCountryId: requiredPositiveId,
  originProvinceId: optionalPositiveId,
  ageGroup: z.enum(AGE_GROUP_OPTIONS.map((option) => option.value) as [AgeGroupValue, ...AgeGroupValue[]]),
  hasConsented: z.boolean().refine((v) => v === true, { message: "กรุณายอมรับข้อตกลง" }),
});

export type MinimalFormInput = z.infer<typeof minimalFormSchema>;
