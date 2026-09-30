import { asRecord } from "@/lib/utils/record";

export function isDemoCheckinLabel(label: unknown): boolean {
  return typeof label === "string" && /^demo qr:/i.test(label.trim());
}

export class CheckinRewardEligibilityError extends Error {
  readonly code = "DEMO_CHECKIN_REWARD_BLOCKED";

  constructor() {
    super("จุดเช็กอินทดลองไม่สามารถออกใบประกาศหรือสแตมป์จริงได้ กรุณาสแกน QR ณ สถานที่ที่เยี่ยมชม");
    this.name = "CheckinRewardEligibilityError";
  }
}

/** The joined code is read by the owner guard, never supplied by the browser. */
export function assertCheckinRewardEligible(ownedVisit: unknown): void {
  const codeJoin = asRecord(ownedVisit).checkin_codes;
  const code = asRecord(Array.isArray(codeJoin) ? codeJoin[0] : codeJoin);
  if (isDemoCheckinLabel(code.label)) throw new CheckinRewardEligibilityError();
}
