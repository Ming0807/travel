import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StoryShareActions } from "@/components/stories/StoryShareActions";

describe("StoryShareActions", () => {
  it("uses the native share sheet when the browser supports it", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });

    render(
      <StoryShareActions
        title="เสน่ห์เมืองเก่า"
        url="https://example.com/stories/old-town"
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: "แชร์เรื่องนี้" })
    );

    expect(share).toHaveBeenCalledWith({
      title: "เสน่ห์เมืองเก่า",
      url: "https://example.com/stories/old-town",
    });
  });
});
