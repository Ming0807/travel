import { z } from "zod";

export const leaderboardVisibilitySchema = z.enum(["private", "alias", "display_name"]);

export const leaderboardPreferenceSchema = z
  .object({
    visibility: leaderboardVisibilitySchema,
    alias: z
      .string()
      .trim()
      .max(40, "นามแฝงต้องไม่เกิน 40 ตัวอักษร")
      .refine((value) => !value || value.length >= 3, "นามแฝงต้องมีอย่างน้อย 3 ตัวอักษร")
      .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), "นามแฝงมีอักขระที่ไม่รองรับ")
      .refine((value) => !/https?:\/\//i.test(value), "นามแฝงต้องไม่เป็นลิงก์")
      .optional()
      .default(""),
    confirmedPublic: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.visibility !== "private" && !value.confirmedPublic) {
      context.addIssue({
        code: "custom",
        path: ["confirmedPublic"],
        message: "กรุณายืนยันก่อนเข้าร่วมอันดับสาธารณะ",
      });
    }
  });

export type LeaderboardVisibility = z.infer<typeof leaderboardVisibilitySchema>;
