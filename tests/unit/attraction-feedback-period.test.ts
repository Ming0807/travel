import { describe, expect, it } from "vitest";
import { previousEqualLengthPeriod } from "@/lib/dashboard/attraction-feedback-period";

describe("previousEqualLengthPeriod", () => {
  it("uses the selected chart period rather than today's default dates", () => {
    expect(previousEqualLengthPeriod("2026-08-01", "2026-08-31")).toEqual({
      comparisonStart: "2026-07-01",
      comparisonEnd: "2026-07-31",
    });
  });

  it("handles leap days and single-day windows", () => {
    expect(previousEqualLengthPeriod("2024-03-01", "2024-03-01")).toEqual({
      comparisonStart: "2024-02-29",
      comparisonEnd: "2024-02-29",
    });
  });

  it.each([["2026-02-30", "2026-03-01"], ["2026-04-02", "2026-04-01"], ["no-date", "2026-01-01"]])(
    "rejects an invalid window %s to %s",
    (start, end) => expect(previousEqualLengthPeriod(start, end)).toBeNull(),
  );
});
