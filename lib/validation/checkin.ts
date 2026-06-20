import { z } from "zod";

export const resolveCheckinCodeSchema = z.object({
  code: z.string().min(1, "Check-in code is required").max(100, "Code too long"),
});

export type ResolveCheckinCodeInput = z.infer<typeof resolveCheckinCodeSchema>;

export const minimalFormSchema = z.object({
  displayName: z.string().min(1, "กรุณากรอกชื่อของคุณ").max(100),
  originCountry: z.string().min(1).max(100).default("Thailand"),
  originProvince: z.string().max(100).nullable().optional(),
  ageGroup: z.enum(["0-15", "16-24", "25-34", "35-44", "45-54", "55-64", "65+"]).nullable().optional(),
  hasConsented: z.boolean().refine((v) => v === true, { message: "กรุณายอมรับข้อตกลง" }),
});

export type MinimalFormInput = z.infer<typeof minimalFormSchema>;
