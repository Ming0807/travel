import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomepageQuickActions } from "@/components/homepage/HomepageQuickActions";
import { HomepageHero } from "@/components/homepage/sections/HomepageHero";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Homepage discovery entry", () => {
  it("introduces the Yala launch scope with one clear heading", () => {
    render(<HomepageHero images={[]} />);

    expect(screen.getByRole("heading", { level: 1, name: "เที่ยวยะลาให้ลึกกว่าเดิม" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByText("ปัตตานี")).not.toBeInTheDocument();
    expect(screen.queryByText("นราธิวาส")).not.toBeInTheDocument();
  });

  it("gives the mobile hero image a positioned parent and container-aware sizes", () => {
    render(<HomepageHero images={["general/hero.webp"]} />);

    const mobileImage = screen.getAllByRole("img", { name: "บรรยากาศการท่องเที่ยวจังหวัดยะลา" })[0];
    const mobileFrame = mobileImage.parentElement;

    expect(mobileFrame).toHaveClass("absolute", "inset-0", "lg:hidden");
    expect(mobileFrame).not.toHaveClass("lg:static");
    expect(mobileImage).toHaveAttribute(
      "sizes",
      "(max-width: 639px) calc(100vw - 1.5rem), (max-width: 1023px) calc(100vw - 3rem), 0px",
    );
  });

  it("provides five real quick discovery routes", () => {
    render(<HomepageQuickActions />);

    expect(screen.getByRole("link", { name: /สถานที่/ })).toHaveAttribute("href", "/attractions");
    expect(screen.getByRole("link", { name: /ร้านอาหาร/ })).toHaveAttribute("href", "/restaurants");
    expect(screen.getByRole("link", { name: /ที่พัก/ })).toHaveAttribute("href", "/accommodations");
    expect(screen.getByRole("link", { name: /เส้นทาง/ })).toHaveAttribute("href", "/routes");
    expect(screen.getByRole("link", { name: /เรื่องราว/ })).toHaveAttribute("href", "/stories");
  });
});
