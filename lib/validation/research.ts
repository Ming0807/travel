import { z } from "zod";

import { uuidSchema } from "@/lib/validation/common";

export function redactResearchFreeText(value: string) {
  return value
    .replace(/https?:\/\/\S+|www\.\S+/gi, "[ข้อมูลติดต่อถูกปกปิด]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[ข้อมูลติดต่อถูกปกปิด]")
    .replace(/(?:\+?66|0)[\s.-]?\d(?:[\s.-]?\d){7,9}/g, "[ข้อมูลติดต่อถูกปกปิด]")
    .trim();
}

export const researchLanguageSchema = z.enum(["th", "en", "ms"]);

export const researchStudyCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "รหัสการวิจัยไม่ถูกต้อง");

export const researchCheckinCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/, "รหัสจุดเช็กอินไม่ถูกต้อง");

export const researchInvitationSchema = z.object({
  studyCode: researchStudyCodeSchema,
  checkinCode: researchCheckinCodeSchema,
  language: researchLanguageSchema.nullable().optional(),
});

export const researchAcceptanceSchema = researchInvitationSchema.extend({
  hasConsented: z.literal(true),
});

export const researchOperatorAcceptanceSchema = z.object({
  studyId: uuidSchema,
  studyCode: researchStudyCodeSchema,
  idempotencyKey: uuidSchema,
  participantType: z.enum(["operator", "attraction_manager"]),
  collectionMode: z.enum(["field_observation", "simulated_usability", "pilot_internal"]),
  language: researchLanguageSchema.default("th"),
  hasConsented: z.literal(true),
});

export const researchOperatorAttemptSchema = z.object({
  taskCode: z.string().trim().min(1).max(50).regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
  status: z.enum(["in_progress", "completed", "skipped", "abandoned"]),
  confidence: z.number().int().min(1).max(5).nullable().optional(),
  rationale: z.string().trim().max(4000).optional(),
}).superRefine((value, context) => {
  if (value.status === "completed" && !value.rationale) {
    context.addIssue({ code: "custom", message: "กรุณาระบุเหตุผลประกอบการตัดสินใจ", path: ["rationale"] });
  }
  if (value.status === "completed" && value.confidence == null) {
    context.addIssue({ code: "custom", message: "กรุณาระบุระดับความมั่นใจ", path: ["confidence"] });
  }
});

export const researchVisitLinkSchema = z.object({
  visitId: uuidSchema,
});

export const researchWithdrawalSchema = z.object({
  reason: z.string().trim().max(500).optional(),
  source: z.string().trim().min(1).max(100).optional(),
});

const researchItemCodeSchema = z
  .string()
  .regex(/^[A-Z][A-Z0-9_]{1,29}$/);

export const researchAnswerSchema = z.union([
  z.object({ itemCode: researchItemCodeSchema, integerValue: z.number().int() }).strict(),
  z.object({ itemCode: researchItemCodeSchema, textValue: z.string().max(2000) }).strict(),
  z.object({ itemCode: researchItemCodeSchema, booleanValue: z.boolean() }).strict(),
]);

export const researchResponseInputSchema = z
  .object({
    instrumentKey: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
    answers: z.array(researchAnswerSchema).max(100),
    submit: z.boolean(),
  })
  .superRefine((value, context) => {
    const seen = new Set<string>();
    value.answers.forEach((answer, index) => {
      if (seen.has(answer.itemCode)) {
        context.addIssue({
          code: "custom",
          message: "รหัสคำถามซ้ำกัน",
          path: ["answers", index, "itemCode"],
        });
      }
      seen.add(answer.itemCode);
    });
  });

export type ResearchLanguage = z.infer<typeof researchLanguageSchema>;
export type ResearchInvitationInput = z.infer<typeof researchInvitationSchema>;
export type ResearchAcceptanceInput = z.infer<typeof researchAcceptanceSchema>;
export type ResearchOperatorAcceptanceInput = z.infer<typeof researchOperatorAcceptanceSchema>;
export type ResearchOperatorAttemptInput = z.infer<typeof researchOperatorAttemptSchema>;
export type ResearchVisitLinkInput = z.infer<typeof researchVisitLinkSchema>;
export type ResearchWithdrawalInput = z.infer<typeof researchWithdrawalSchema>;
export type ResearchAnswerInput = z.infer<typeof researchAnswerSchema>;
export type ResearchResponseInput = z.infer<typeof researchResponseInputSchema>;
