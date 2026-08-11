import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PublicDirectoryIntro } from "../../components/public/directory/PublicDirectoryIntro";
import { PublicDirectoryToolbar } from "../../components/public/directory/PublicDirectoryToolbar";
import { PublicMissingImage } from "../../components/public/directory/PublicMissingImage";
import { PublicResultSummary } from "../../components/public/directory/PublicResultSummary";

describe("public directory primitives", () => {
  it("renders a compact Thai-first introduction with an accessible breadcrumb", () => {
    render(
      <PublicDirectoryIntro
        breadcrumbs={[
          { label: "หน้าแรก", href: "/" },
          { label: "สถานที่ท่องเที่ยว" },
        ]}
        title="สถานที่ท่องเที่ยวในจังหวัดยะลา"
        description="ค้นหาสถานที่ที่เหมาะกับการเดินทางของคุณ"
        scope="ขอบเขตข้อมูลปัจจุบัน: จังหวัดยะลา"
      />,
    );

    expect(screen.getByRole("navigation", { name: "เส้นทางนำทาง" })).toBeVisible();
    expect(screen.getByRole("link", { name: "หน้าแรก" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("heading", { level: 1, name: "สถานที่ท่องเที่ยวในจังหวัดยะลา" })).toBeVisible();
    expect(screen.getByText("ขอบเขตข้อมูลปัจจุบัน: จังหวัดยะลา")).toBeVisible();
  });

  it("announces the honest result count in Thai", () => {
    render(<PublicResultSummary count={11} noun="สถานที่" />);

    expect(screen.getByText("พบ 11 สถานที่")).toHaveAttribute("aria-live", "polite");
  });

  it("renders a named filter region and keeps actions outside the form body", () => {
    render(
      <PublicDirectoryToolbar
        label="ค้นหาและกรองสถานที่"
        actions={<button type="button">ล้างตัวกรอง</button>}
        mobileFilterTrigger={<button type="button">ตัวกรอง</button>}
      >
        <label htmlFor="query">ค้นหา</label>
        <input id="query" name="query" />
      </PublicDirectoryToolbar>,
    );

    const region = screen.getByRole("region", { name: "ค้นหาและกรองสถานที่" });
    expect(region).toHaveClass("rounded-[var(--public-radius-panel)]");
    expect(screen.getByLabelText("ค้นหา")).toHaveAttribute("name", "query");
    expect(screen.getByRole("button", { name: "ตัวกรอง" })).toHaveClass("min-h-11");
    expect(screen.getByRole("button", { name: "ล้างตัวกรอง" })).toBeVisible();
  });

  it("uses a truthful branded placeholder when media is unavailable", () => {
    render(<PublicMissingImage label="เขื่อนบางลาง" />);

    const fallback = screen.getByRole("img", { name: "ยังไม่มีภาพของเขื่อนบางลาง" });
    expect(fallback).toBeVisible();
    expect(fallback).toHaveClass("aspect-[4/3]");
    expect(screen.queryByRole("img", { name: "ภาพเขื่อนบางลาง" })).not.toBeInTheDocument();
  });
});
