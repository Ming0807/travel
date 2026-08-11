import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeaderboardContent } from "@/components/badges/LeaderboardContent";

const entry = {
  rank: 1,
  publicName: "สายหมอกยะลา",
  totalXp: 500,
  badgeCount: 2,
  stampCount: 3,
  level: 2,
  isCurrentTourist: true,
};

describe("LeaderboardContent", () => {
  it("uses truthful rolling-period labels and a semantic selected control", () => {
    render(<LeaderboardContent allTime={[entry]} monthly={[]} weekly={[]} currentVisibility="alias" />);

    const allTimeButton = screen.getByRole("button", { name: "ทั้งหมด" });
    expect(allTimeButton).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "30 วันล่าสุด" }));
    expect(screen.getByRole("button", { name: "30 วันล่าสุด" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a safe Top 100 message instead of rank zero", () => {
    render(<LeaderboardContent allTime={[]} monthly={[]} weekly={[]} currentVisibility="alias" />);

    expect(screen.getByText("ยังไม่ติด Top 100")).toBeInTheDocument();
    expect(screen.queryByText("#0")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ค้นหาสถานที่เพื่อเริ่มสะสมคะแนน" })).toHaveAttribute(
      "href",
      "/attractions",
    );
  });

  it("explains private participation without leaking a name", () => {
    render(<LeaderboardContent allTime={[]} monthly={[]} weekly={[]} currentVisibility="private" />);

    expect(screen.getByText("คุณยังไม่ได้เข้าร่วมอันดับสาธารณะ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ตั้งค่าการแสดงผล" })).toHaveAttribute(
      "href",
      "/profile#leaderboard-privacy",
    );
  });
});
