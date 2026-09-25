import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it, vi } from "vitest";
import { HomepageEditorial } from "@/components/homepage/HomepageEditorial";

vi.mock("@/components/checkin/PublicCheckinEntryLink", () => ({
  PublicCheckinEntryLink: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <Link href="/checkin/try" className={className}>{children}</Link>,
}));

describe("editorial homepage hero", () => {
  it("retains the community working-group message and working actions with a replaceable CMS image", () => {
    render(<HomepageEditorial
      hero={{
        title: "คณะทำงานขับเคลื่อนการท่องเที่ยวโดยชุมชน",
        subtitle: "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์",
        description: "เช็กอินสถานที่สำคัญ",
        images: ["homepage/custom-hero.webp"],
      }}
      media={{}}
      attractions={[]}
      restaurants={[]}
      routes={[]}
      stories={[]}
      stats={[]}
      routesUnavailable={false}
    />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("ตำบลหน้าถ้ำ");
    expect(screen.getByRole("link", { name: /สแกน QR เช็กอิน/ })).toHaveAttribute("href", "/checkin/try");
    expect(screen.getAllByRole("link", { name: /ดูสถานที่ทั้งหมด/ })[0]).toHaveAttribute("href", "/attractions");
    expect(screen.getByRole("link", { name: "คณะทำงาน" })).toHaveAttribute("href", "/documents/na-tham-tourism-living-blueprint.pdf");
    expect(screen.getAllByAltText("ตรามหาวิทยาลัยราชภัฏยะลา")).toHaveLength(2);
    expect(screen.getByAltText("ภาพประกอบบรรยากาศภูเขาและหมอกยามเช้า").getAttribute("src")).toContain("custom-hero.webp");
  });
});
