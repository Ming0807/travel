import { z } from "zod";

export const nfcFieldResultSchema = z.enum(["passed", "failed", "not_tested"]);
export const nfcFieldCheckSchema = z.object({
  requestId: z.uuid(), tagId: z.uuid(), version: z.number().int().positive(),
  locationNote: z.string().trim().min(3).max(300),
  deviceLabel: z.string().trim().min(2).max(120),
  platform: z.enum(["ios", "android", "other"]),
  nfcResult: nfcFieldResultSchema, qrResult: nfcFieldResultSchema,
  notes: z.string().trim().max(1000), evidenceReference: z.string().trim().max(300),
}).strict().superRefine((value, context) => {
  if (value.nfcResult === "not_tested" && value.qrResult === "not_tested") {
    context.addIssue({ code: "custom", path: ["nfcResult"], message: "กรุณาบันทึกผลทดสอบอย่างน้อยหนึ่งช่องทาง" });
  }
  if ((value.nfcResult === "failed" || value.qrResult === "failed") && value.notes.length < 3) {
    context.addIssue({ code: "custom", path: ["notes"], message: "กรุณาระบุปัญหาที่พบ" });
  }
});
export type NfcFieldCheckInput = z.infer<typeof nfcFieldCheckSchema>;
