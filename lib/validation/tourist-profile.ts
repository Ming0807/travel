import { z } from "zod";

export const minimalProfileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "โปรดระบุชื่อที่ต้องการให้แสดงบนใบประกาศ")
    .max(150, "ชื่อยาวเกินไป"),
  ageGroup: z.enum([
    "under_18",
    "18_24",
    "25_34",
    "35_44",
    "45_54",
    "55_64",
    "65_plus",
    "prefer_not_to_answer",
  ]),
  originCountryId: z.coerce.number().optional().nullable(),
  originProvinceId: z.coerce.number().optional().nullable(),
  hasConsented: z.boolean().refine((val) => val === true, {
    message: "คุณต้องยอมรับเงื่อนไขการใช้งานก่อนดำเนินการต่อ"
  }),
}).refine((data) => data.originCountryId || data.originProvinceId, {
  message: "โปรดระบุประเทศหรือจังหวัดที่ท่านเดินทางมา",
  path: ["originCountryId"],
});

export type MinimalProfileFormInput = z.infer<typeof minimalProfileFormSchema>;
