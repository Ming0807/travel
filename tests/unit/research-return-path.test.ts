import { describe, expect, it } from "vitest";

import { safeResearchReturnPath } from "@/lib/research/return-path";

const checkinCode = "YALA_01";
const startPath = "/checkin/YALA_01/start";
const flow = "22222222-2222-4222-8222-222222222222";

describe("safeResearchReturnPath", () => {
  it("preserves only the original check-in entry and a valid flow id", () => {
    expect(safeResearchReturnPath(startPath, checkinCode)).toBe(startPath);
    expect(safeResearchReturnPath(`${startPath}?flow=${flow}`, checkinCode)).toBe(`${startPath}?flow=${flow}`);
  });

  it.each([
    "https://example.com",
    "//example.com",
    "/admin",
    "/checkin/OTHER/start",
    `${startPath}?flow=not-a-uuid`,
    `${startPath}?flow=${flow}&flow=${flow}`,
    `${startPath}?flow=${flow}&next=/admin`,
    `${startPath}#other`,
    `${startPath}\\anything`,
    [startPath, "/admin"],
  ])("falls back to the same check-in route for an unsafe return target", (value) => {
    expect(safeResearchReturnPath(value, checkinCode)).toBe(startPath);
  });
});
