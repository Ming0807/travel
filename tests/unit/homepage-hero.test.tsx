import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomepageQuickActions } from "@/components/homepage/HomepageQuickActions";
import { HomepageHero } from "@/components/homepage/sections/HomepageHero";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Homepage discovery entry", () => {
  it("introduces the Yala launch scope with one clear heading, real QR CTA, and no fake carousel", () => {
    render(<HomepageHero images={[]} />);

    expect(screen.getByRole("heading", {
      level: 1,
      name: "คณะทำงานขับเคลื่อนการท่องเที่ยวโดยชุมชน ตำบลหน้าถ้ำ",
    })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByText("ปัตตานี")).not.toBeInTheDocument();
    expect(screen.queryByText("นราธิวาส")).not.toBeInTheDocument();

    // Visual contract: Primary action must be PublicCheckinEntryLink ("สแกน QR เช็กอิน")
    expect(screen.getByRole("link", { name: /สแกน QR เช็กอิน/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ดูสถานที่ทั้งหมด/ })).toHaveAttribute("href", "/attractions");
    expect(screen.getByRole("link", { name: /เปิดเอกสารคณะทำงาน/ })).toHaveAttribute(
      "href",
      "/documents/na-tham-tourism-living-blueprint.pdf",
    );
    expect(screen.getByRole("link", { name: /เปิดเอกสารคณะทำงาน/ })).toHaveAttribute("target", "_blank");
    const universityLogo = screen.getByRole("img", { name: "ตรามหาวิทยาลัยราชภัฏยะลา" });
    expect(decodeURIComponent(universityLogo.getAttribute("src") ?? "")).toContain(
      "/partners/yala-rajabhat-university.png",
    );
    expect(screen.getByText("ร่วมขับเคลื่อนโดย")).toBeInTheDocument();
    expect(screen.getByText("มหาวิทยาลัยราชภัฏยะลา")).toBeInTheDocument();

    // Visual contract: No fake carousel indicators
    expect(screen.queryByLabelText(/carousel/i)).not.toBeInTheDocument();
  });

  it("uses one full-bleed responsive priority image across mobile and desktop", () => {
    render(<HomepageHero images={["general/hero.webp"]} />);

    const heroImage = screen.getByRole("img", { name: "บรรยากาศการท่องเที่ยวจังหวัดยะลา" });
    const imageFrame = heroImage.parentElement;
    const hero = heroImage.closest("section");

    expect(screen.getAllByRole("img", { name: "บรรยากาศการท่องเที่ยวจังหวัดยะลา" })).toHaveLength(1);
    expect(hero).toHaveAttribute("data-hero-layout", "full-bleed");
    expect(imageFrame).toHaveClass("absolute", "inset-0");
    expect(imageFrame).not.toHaveClass("lg:left-[46%]");
    expect(heroImage).toHaveAttribute("sizes", "100vw");
    expect(screen.getByTestId("homepage-hero-veil")).toBeInTheDocument();
  });

  it("replaces the retired hidden-wonders CMS title with the approved working-group title", () => {
    render(<HomepageHero title="ค้นพบความมหัศจรรย์ที่ซ่อนเร้น" images={[]} />);

    expect(screen.getByRole("heading", {
      level: 1,
      name: "คณะทำงานขับเคลื่อนการท่องเที่ยวโดยชุมชน ตำบลหน้าถ้ำ",
    })).toBeInTheDocument();
    expect(screen.queryByText(/ค้นพบความมหัศจรรย์ที่ซ่อนเร้น/)).not.toBeInTheDocument();
  });

  it("provides four value items and five real quick discovery routes", () => {
    render(<HomepageQuickActions />);

    // Four-value action band items
    expect(screen.getByText("สแกน QR เช็กอิน")).toBeInTheDocument();
    expect(screen.getByText("Digital Passport")).toBeInTheDocument();
    expect(screen.getByText("ใบประกาศดิจิทัล")).toBeInTheDocument();
    expect(screen.getByText("แบบสำรวจเพื่อการพัฒนา")).toBeInTheDocument();
    expect(screen.getByText("รับใบประกาศนียบัตร").closest("a")).toHaveAttribute("href", "/checkin/try");
    expect(screen.getByText("ประเมินความพึงพอใจ").closest("a")).toHaveAttribute("href", "/checkin/try");

    // Five preserved discovery destination routes
    expect(screen.getByRole("link", { name: "สถานที่" })).toHaveAttribute("href", "/attractions");
    expect(screen.getByRole("link", { name: "ร้านอาหาร" })).toHaveAttribute("href", "/restaurants");
    expect(screen.getByRole("link", { name: "ที่พัก" })).toHaveAttribute("href", "/accommodations");
    expect(screen.getByRole("link", { name: "เส้นทาง" })).toHaveAttribute("href", "/routes");
    expect(screen.getByRole("link", { name: "เรื่องราว" })).toHaveAttribute("href", "/stories");
  });
});
