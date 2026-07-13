import { describe, expect, it } from "vitest";
import {
  bangkokDateTimeInputToIso,
  isoToBangkokDateTimeInput,
} from "@/lib/utils/bangkok-datetime";

describe("Bangkok datetime conversion", () => {
  it("stores datetime-local values as the matching Bangkok instant", () => {
    expect(bangkokDateTimeInputToIso("2026-06-20T10:30")).toBe("2026-06-20T03:30:00.000Z");
  });

  it("preserves ISO values that already include a timezone", () => {
    expect(bangkokDateTimeInputToIso("2026-06-20T03:30:00.000Z")).toBe(
      "2026-06-20T03:30:00.000Z"
    );
  });

  it("formats UTC values for a Bangkok datetime-local input", () => {
    expect(isoToBangkokDateTimeInput("2026-06-20T03:30:00.000Z")).toBe("2026-06-20T10:30");
  });
});
