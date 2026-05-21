import { z } from "zod";

export const resolveCheckinCodeSchema = z.object({
  code: z.string().min(1, "Check-in code is required").max(100, "Code too long"),
});

export type ResolveCheckinCodeInput = z.infer<typeof resolveCheckinCodeSchema>;
