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

  it("provides five real quick discovery routes", () => {
    render(<HomepageQuickActions />);

    expect(screen.getByRole("link", { name: /สถานที่/ })).toHaveAttribute("href", "/attractions");
    expect(screen.getByRole("link", { name: /ร้านอาหาร/ })).toHaveAttribute("href", "/restaurants");
    expect(screen.getByRole("link", { name: /ที่พัก/ })).toHaveAttribute("href", "/accommodations");
    expect(screen.getByRole("link", { name: /เส้นทาง/ })).toHaveAttribute("href", "/routes");
    expect(screen.getByRole("link", { name: /เรื่องราว/ })).toHaveAttribute("href", "/stories");
  });
});
