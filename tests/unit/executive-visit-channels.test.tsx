import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExecutiveVisitChannels } from "@/components/dashboard/ExecutiveVisitChannels";
import { buildDashboardVisitChannels } from "@/lib/dashboard/visit-channels";

vi.mock("@/components/dashboard/BarChartCard", () => ({ BarChartCard: ({ title, interpretation }: { title: string; interpretation: string }) => <section><h2>{title}</h2><p>{interpretation}</p></section> }));

describe("executive Visit channels", () => {
  it.each(["disabled", "incomplete", "suppressed", "empty"] as const)("shows %s without false numeric bars", (status) => {
    render(<ExecutiveVisitChannels data={{ status, denominator: null, distribution: [] }} />);
    expect(screen.getByRole("heading", { name: "ช่องทางของรายการเช็กอิน" })).toBeInTheDocument();
    expect(screen.getByText(/ไม่ใช่ยอดดูเว็บไซต์/)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
  it("explains that NFC attribution does not prove a physical tap", () => {
    render(<ExecutiveVisitChannels data={buildDashboardVisitChannels(Array.from({ length: 10 }, (_, index) => ({ visit_id: String(index) })), true, false)} />);
    expect(screen.getByText(/ไม่ยืนยันการแตะแท็กจริง/)).toBeInTheDocument();
  });
});
