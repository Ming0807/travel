import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TouristListClient } from "@/components/admin/tourists/TouristListClient";

const tourist = {
  id: "11111111-1111-4111-8111-111111111111",
  reference: "T-11111111",
  displayName: "นักท่องเที่ยวทดสอบ",
  countryName: "ไทย",
  provinceName: "ปัตตานี",
  ageGroup: "25-34",
  joinedAt: "2026-07-01T00:00:00.000Z",
  identityProviders: ["anonymous_device", "line"],
  visitCount: 3,
  certificateCount: 2,
  stampCount: 1,
  surveyCount: 1,
};

describe("admin tourist list", () => {
  it("renders Thai summaries and a detail link for mobile", () => {
    render(<TouristListClient tourists={[tourist]} />);
    expect(screen.getAllByText("นักท่องเที่ยวทดสอบ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ผู้เยี่ยมชม").length).toBeGreaterThan(0);
    expect(screen.getAllByText("LINE").length).toBeGreaterThan(0);
    const mobileLink = screen
      .getAllByRole("link", { name: /นักท่องเที่ยวทดสอบ/ })
      .find((element) => element.tagName === "A");
    expect(mobileLink).toHaveAttribute(
      "href",
      `/admin/tourists/${tourist.id}`
    );
  });

  it("uses a real link for the desktop detail action", () => {
    render(<TouristListClient tourists={[tourist]} />);
    expect(screen.getByRole("link", { name: "ดูรายละเอียด นักท่องเที่ยวทดสอบ" })).toHaveAttribute(
      "href",
      `/admin/tourists/${tourist.id}`,
    );
  });
});
