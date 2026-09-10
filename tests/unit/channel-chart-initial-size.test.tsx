import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { AttractionChannelPanel } from "@/components/dashboard/AttractionChannelPanel";
import { attractionFixture } from "@/tests/visual/dashboard/attraction-fixture";

it("provides a nonnegative initial chart size before the browser measures its container", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  try {
    renderToString(<AttractionChannelPanel data={attractionFixture(null).channels} />);
    const sizeWarnings = warn.mock.calls.filter(args => args.some(value => typeof value === "string" && value.includes("width(") && value.includes("height(")));
    expect(sizeWarnings).toEqual([]);
  } finally { warn.mockRestore(); }
});
