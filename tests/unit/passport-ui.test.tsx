import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PassportSummary } from "@/components/passport/PassportSummary";
import { ProvinceProgress } from "@/components/passport/ProvinceProgress";
import { StampGrid } from "@/components/passport/StampGrid";
import type { PassportViewModel } from "@/lib/services/passport.service";

const passport: PassportViewModel = {
  displayName: "นักเดินทางทดสอบ",
  isGuest: true,
  totalStampsEarned: 0,
  totalStampTargets: 2,
  provinceProgress: [{ provinceName: "ยะลา", earnedCount: 0, totalCount: 2 }],
  stampsByProvince: [{ provinceName: "ยะลา", stamps: [] }],
  stampTargetsByProvince: [
    {
      provinceName: "ยะลา",
      targets: [
        {
          stampName: "ตราป่าฮาลา-บาลา",
          attractionName: "ป่าฮาลา-บาลา ฝั่งยะลา",
          attractionSlug: "hala-bala-yala",
          provinceName: "ยะลา",
          stampImagePath: null,
          isEarned: false,
          earnedAt: null,
        },
        {
          stampName: "ตราสกายวอล์ก",
          attractionName: "สกายวอล์กอัยเยอร์เวง",
          attractionSlug: "aiyerweng-skywalk",
          provinceName: "ยะลา",
          stampImagePath: null,
          isEarned: false,
          earnedAt: null,
        },
      ],
    },
  ],
  recentVisits: [],
};

describe("passport public UI", () => {
  it("shows truthful zero progress with accessible semantics", () => {
    render(
      <>
        <PassportSummary passport={passport} />
        <ProvinceProgress progress={passport.provinceProgress} />
      </>,
    );

    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars).toHaveLength(2);
    expect(progressBars[0]).toHaveAttribute("aria-valuenow", "0");
    expect(progressBars[0].firstElementChild).toHaveStyle({ width: "0%" });
    expect(screen.getByText("0% ของเป้าหมาย")).toBeInTheDocument();
    expect(screen.queryByText("My Passport")).not.toBeInTheDocument();
    expect(screen.queryByText("GUEST MODE")).not.toBeInTheDocument();
  });

  it("shows real missing stamp targets instead of an undifferentiated empty state", () => {
    render(<StampGrid passport={passport} />);

    expect(screen.getByText("ป่าฮาลา-บาลา ฝั่งยะลา")).toBeInTheDocument();
    expect(screen.getByText("สกายวอล์กอัยเยอร์เวง")).toBeInTheDocument();
    expect(screen.getAllByText("ยังไม่ได้รับ")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /ป่าฮาลา-บาลา ฝั่งยะลา/ })).toHaveAttribute(
      "href",
      "/attractions/hala-bala-yala",
    );
  });

  it("distinguishes no targets from a passport with unearned targets", () => {
    render(
      <StampGrid
        passport={{
          ...passport,
          totalStampTargets: 0,
          provinceProgress: [],
          stampTargetsByProvince: [],
        }}
      />,
    );

    expect(screen.getByText("ยังไม่มีจุดสะสมตราที่เปิดใช้งาน")).toBeInTheDocument();
  });

  it("keeps historical earned stamps visible even when there are no active targets", () => {
    render(<StampGrid passport={{ ...passport, totalStampTargets: 0, stampTargetsByProvince: [{ provinceName: "ยะลา", targets: [{ stampName: "ตราความทรงจำ", attractionName: "สถานที่เดิม", attractionSlug: null, provinceName: "ยะลา", earnedAt: "2026-09-01T00:00:00Z", stampImagePath: null, isEarned: true }] }] }} />);
    expect(screen.getByText("ตราความทรงจำ")).toBeVisible();
    expect(screen.getByText("ได้รับแล้ว")).toBeVisible();
    expect(screen.getByText("ยังไม่มีจุดสะสมตราที่เปิดใช้งาน")).toBeVisible();
    expect(screen.queryByRole("link", { name: /สถานที่เดิม/ })).not.toBeInTheDocument();
  });

  it("does not duplicate an earned stamp that is already in the active collection", () => {
    const target = { ...passport.stampTargetsByProvince[0].targets[0], isEarned: true, earnedAt: "2026-09-01T00:00:00Z" };
    render(<StampGrid passport={{ ...passport, stampTargetsByProvince: [{ provinceName: "ยะลา", targets: [target] }], stampsByProvince: [{ provinceName: "ยะลา", stamps: [{ ...target, earnedAt: "2026-09-01T00:00:00Z" }] }] }} />);
    expect(screen.getAllByText(target.stampName)).toHaveLength(1);
  });

  it("uses only active earned stamps for progress while preserving the lifetime total", () => {
    render(<PassportSummary passport={{ ...passport, totalStampsEarned: 3, provinceProgress: [{ provinceName: "ยะลา", earnedCount: 0, totalCount: 2 }] }} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("0% ของเป้าหมาย")).toBeVisible();
    expect(screen.getByText("เป้าหมายที่เปิดใช้งาน 0 / 2 ตรา")).toBeVisible();
  });
});
