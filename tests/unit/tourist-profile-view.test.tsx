import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TouristProfileView } from "@/components/profile/TouristProfileView";

vi.mock("@/components/profile/LeaderboardPrivacyForm", () => ({
  LeaderboardPrivacyForm: () => <div data-testid="leaderboard-privacy">ตั้งค่าการแสดงชื่อ</div>,
}));

vi.mock("@/components/passport/AccountLinkingTeaser", () => ({
  AccountLinkingTeaser: ({ isGuest }: { isGuest: boolean }) => (
    <div data-testid="account-linking">{isGuest ? "เชื่อมบัญชี" : "เชื่อมบัญชีแล้ว"}</div>
  ),
}));

const baseProps = {
  profile: {
    displayName: "นักเดินทางยะลา",
    origin: "ยะลา",
    ageGroup: "25_34",
    preferredLanguage: "th",
    preferredLanguageSource: "user_selected",
    leaderboardVisibility: "private" as const,
    leaderboardAlias: null,
    isGuest: false,
    linkedProviders: ["google"],
    passportSummary: {
      totalStampsEarned: 1,
      provinceProgress: [{ provinceName: "ยะลา", earnedCount: 1, totalCount: 3 }],
    },
    certificateHistory: [
      {
        generatedAt: "2026-08-01T00:00:00.000Z",
        visitDate: "2026-08-01",
        attractionName: "สกายวอล์กอัยเยอร์เวง",
        provinceName: "ยะลา",
        attractionSlug: "aiyerweng-skywalk",
      },
    ],
  },
  xp: {
    currentXp: 250,
    currentLevel: 3,
    xpForCurrentLevel: 250,
    xpForNextLevel: 500,
    progress: 0,
  },
  badges: [],
  allBadges: [],
};

describe("TouristProfileView", () => {
  it("groups certificate, origin, public display, account, and privacy information", () => {
    render(<TouristProfileView {...baseProps} />);

    expect(screen.getByRole("heading", { name: "โปรไฟล์นักเดินทาง" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ข้อมูลสำหรับใบประกาศ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ภูมิลำเนาและภาษา" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "การแสดงชื่อสาธารณะ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "บัญชีที่เชื่อมต่อ" })).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByTestId("leaderboard-privacy")).toBeInTheDocument();
  });

  it("explains provider-managed passwords without pretending the platform stores one", () => {
    render(<TouristProfileView {...baseProps} />);

    expect(screen.getByText(/Google หรือ LINE เป็นผู้จัดการรหัสผ่าน/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ดูรหัสผ่าน/ })).not.toBeInTheDocument();
  });

  it("explains the guest account and keeps account linking optional", () => {
    render(
      <TouristProfileView
        {...baseProps}
        profile={{ ...baseProps.profile, isGuest: true, linkedProviders: [] }}
      />,
    );

    expect(screen.getByText(/บัญชีแบบผู้เยี่ยมชมไม่มีรหัสผ่าน/)).toBeInTheDocument();
    expect(screen.getByTestId("account-linking")).toHaveTextContent("เชื่อมบัญชี");
  });

  it("links completed travel records to the real attraction", () => {
    render(<TouristProfileView {...baseProps} />);

    expect(screen.getByRole("link", { name: /สกายวอล์กอัยเยอร์เวง/ })).toHaveAttribute(
      "href",
      "/attractions/aiyerweng-skywalk",
    );
    expect(screen.queryByText("Visas & Achievements")).not.toBeInTheDocument();
    expect(screen.queryByText("Travel Log & Certificates")).not.toBeInTheDocument();
  });
});
