import { z } from "zod";
import { uuidSchema } from "@/lib/validation/common";

function optionalStrictInteger(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return Number.NaN;
  return Number(value);
}

const optionalPositiveIntFromForm = z.preprocess(
  optionalStrictInteger,
  z.number().int().min(1).max(100).nullable()
);

const optionalNonNegativeIntFromForm = z.preprocess(
  optionalStrictInteger,
  z.number().int().min(0).max(60).nullable()
);

const optionalIdFromForm = z.preprocess(
  optionalStrictInteger,
  z.number().int().positive().nullable()
);

const optionalScoreFromForm = z.preprocess(
  optionalStrictInteger,
  z.number().int().min(1).max(5).nullable()
);

const intentionSchema = z.enum(["yes", "maybe", "no"]).nullable();

export const overnightStatusSchema = z
  .enum(["same_day", "overnight", "unknown"])
  .nullable();

export const surveyActionVisitSchema = z.object({
  visitId: uuidSchema
});

export const postCertificateSurveySchema = z
  .object({
    visitId: uuidSchema,
    travelCompanionId: optionalIdFromForm,
    groupSize: optionalPositiveIntFromForm,
    transportModeId: optionalIdFromForm,
    travelPurposeId: optionalIdFromForm,
    overnightStatus: z.preprocess(
      (value) => (value === "" || value === undefined ? null : value),
      overnightStatusSchema
    ),
    nightsCount: optionalNonNegativeIntFromForm,
    spendingRangeId: optionalIdFromForm,
    expenseCategoryId: optionalIdFromForm,
    overallSatisfaction: optionalScoreFromForm,
    safetyScore: optionalScoreFromForm,
    cleanlinessScore: optionalScoreFromForm,
    accessibilityScore: optionalScoreFromForm,
    informationScore: optionalScoreFromForm,
    valueScore: optionalScoreFromForm,
    facilityScore: optionalScoreFromForm,
    revisitIntention: z.preprocess(
      (value) => (value === "" || value === undefined ? null : value),
      intentionSchema
    ),
    recommendIntention: z.preprocess(
      (value) => (value === "" || value === undefined ? null : value),
      intentionSchema
    ),
    optionalComment: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().max(1000).nullable()
    )
  })
  .transform((data) => ({
    ...data,
    optionalComment: data.optionalComment === "" ? null : data.optionalComment,
    nightsCount: data.overnightStatus === "same_day" ? 0 : data.nightsCount
  }))
  .refine(
    (data) =>
      data.travelCompanionId !== null ||
      data.groupSize !== null ||
      data.transportModeId !== null ||
      data.travelPurposeId !== null ||
      data.overnightStatus !== null ||
      data.nightsCount !== null ||
      data.spendingRangeId !== null ||
      data.expenseCategoryId !== null ||
      data.overallSatisfaction !== null ||
      data.safetyScore !== null ||
      data.cleanlinessScore !== null ||
      data.accessibilityScore !== null ||
      data.informationScore !== null ||
      data.valueScore !== null ||
      data.facilityScore !== null ||
      data.revisitIntention !== null ||
      data.recommendIntention !== null ||
      data.optionalComment !== null,
    {
      message: "กรุณาตอบอย่างน้อยหนึ่งข้อ หรือเลือกข้ามแบบสอบถาม",
      path: ["visitId"]
    }
  );

export type PostCertificateSurveyInput = z.infer<typeof postCertificateSurveySchema>;
