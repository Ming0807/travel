import { describe, expect, it } from "vitest";

import { buildDailyVisitTrend } from "@/lib/dashboard/visit-trend";

describe("buildDailyVisitTrend", () => {
  it("fills quiet days with real zero counts inside a complete selected range", () => {
    expect(buildDailyVisitTrend(
      ["2026-05-01", "2026-05-01", "2026-05-03"],
      "2026-05-01", "2026-05-04",
    )).toEqual([
      { label: "2026-05-01", value: 2 },
      { label: "2026-05-02", value: 0 },
      { label: "2026-05-03", value: 1 },
      { label: "2026-05-04", value: 0 },
    ]);
  });

  it("does not manufacture a chart when there are no visits", () => {
    expect(buildDailyVisitTrend([], "2026-05-01", "2026-05-04")).toEqual([]);
    expect(buildDailyVisitTrend(["2026-04-30"], "2026-05-01", "2026-05-04")).toEqual([]);
  });

  it("keeps calendar days correct across leap day and ignores out-of-range rows", () => {
    expect(buildDailyVisitTrend(
      ["2024-02-28", "2024-03-01", "2024-04-01"],
      "2024-02-28", "2024-03-01",
    )).toEqual([
      { label: "2024-02-28", value: 1 },
      { label: "2024-02-29", value: 0 },
      { label: "2024-03-01", value: 1 },
    ]);
  });
});
