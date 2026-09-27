import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AttractionAnalyticsPage from "@/app/(admin)/admin/dashboard/attractions/page";
import type { AttractionAnalyticsFilters } from "@/lib/validation/attraction-analytics";
import { attractionFixture } from "../visual/dashboard/attraction-fixture";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  getOptions: vi.fn(),
  getAnalytics: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.requirePermission }));
vi.mock("@/lib/services/attraction-analytics.service", () => ({
  getAttractionAnalyticsOptions: mocks.getOptions,
  getAttractionAnalytics: mocks.getAnalytics,
}));
vi.mock("@/components/admin/AdminShell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/components/dashboard/AttractionAnalyticsWorkspace", () => ({
  AttractionAnalyticsWorkspace: () => <section aria-label="ผลวิเคราะห์สถานที่" />,
}));
vi.mock("@/components/dashboard/AttractionAnalyticsFilters", () => ({
  AttractionAnalyticsFilters: ({ filters, defaults }: {
    filters: AttractionAnalyticsFilters | null;
    defaults: { dateFrom: string; dateTo: string };
  }) => (
    <form aria-label="ตัวกรองสถานที่">
      <input aria-label="จากวันที่" value={filters?.dateFrom ?? defaults.dateFrom} readOnly />
      <input aria-label="ถึงวันที่" value={filters?.dateTo ?? defaults.dateTo} readOnly />
    </form>
  ),
}));

describe("attraction analytics page states", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor: {} });
    mocks.getOptions.mockResolvedValue([{ value: 4, label: "วัดหน้าถ้ำ" }, { value: 5, label: "ถ้ำพระนอน" }]);
    mocks.getAnalytics.mockResolvedValue(attractionFixture(null));
  });

  afterEach(() => vi.useRealTimers());

  it("does not start the option loader when the page permission is denied", async () => {
    const denied = new Error("FORBIDDEN");
    mocks.requirePermission.mockRejectedValue(denied);
    await expect(AttractionAnalyticsPage({ searchParams: Promise.resolve({}) })).rejects.toBe(denied);
    expect(mocks.getOptions).not.toHaveBeenCalled();
    expect(mocks.getAnalytics).not.toHaveBeenCalled();
  });

  it.each(["options", "analytics"])("does not convert a later %s authorization failure into unavailable data", async (loader) => {
    const denied = Object.assign(new Error("FORBIDDEN"), { code: "FORBIDDEN" });
    (loader === "options" ? mocks.getOptions : mocks.getAnalytics).mockRejectedValue(denied);
    await expect(AttractionAnalyticsPage({ searchParams: Promise.resolve({}) })).rejects.toBe(denied);
  });

  it.each(["options", "analytics"])("preserves a later %s sign-in redirect instead of displaying a database failure", async (loader) => {
    (loader === "options" ? mocks.getOptions : mocks.getAnalytics).mockImplementation(async () => redirect("/admin/login"));
    await expect(AttractionAnalyticsPage({ searchParams: Promise.resolve({}) })).rejects.toMatchObject({
      digest: expect.stringContaining("NEXT_REDIRECT"),
    });
  });

  it("makes an option-query failure recoverable without leaking provider details or showing zero metrics", async () => {
    mocks.getOptions.mockRejectedValue(new Error("postgres private-provider-detail"));
    render(await AttractionAnalyticsPage({ searchParams: Promise.resolve({ attractionId: "4", entryChannel: "nfc" }) }));
    expect(screen.getByRole("alert", { name: "ยังโหลดรายการสถานที่ไม่ได้" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ลองโหลดอีกครั้ง" })).toHaveAttribute(
      "href", "/admin/dashboard/attractions?attractionId=4&entryChannel=nfc",
    );
    expect(screen.queryByText(/private-provider-detail/)).not.toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "ผลวิเคราะห์สถานที่" })).not.toBeInTheDocument();
    expect(mocks.getAnalytics).not.toHaveBeenCalled();
  });

  it("distinguishes an empty attraction catalog from invalid filters", async () => {
    mocks.getOptions.mockResolvedValue([]);
    render(await AttractionAnalyticsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("status", { name: "ยังไม่มีสถานที่พร้อมวิเคราะห์" })).toBeInTheDocument();
    expect(screen.queryByText("ตัวกรองไม่ถูกต้อง")).not.toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(mocks.getAnalytics).not.toHaveBeenCalled();
  });

  it("keeps a valid attraction with zero visits in its analytics workspace", async () => {
    mocks.getAnalytics.mockResolvedValue(attractionFixture("empty"));
    render(await AttractionAnalyticsPage({ searchParams: Promise.resolve({ attractionId: "4" }) }));
    expect(screen.getByRole("region", { name: "ผลวิเคราะห์สถานที่" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not silently switch an unavailable explicit attraction to the first option", async () => {
    render(await AttractionAnalyticsPage({ searchParams: Promise.resolve({ attractionId: "99" }) }));
    expect(screen.getByRole("status", { name: "สถานที่ที่เลือกไม่พร้อมวิเคราะห์" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เลือกสถานที่ใหม่" })).toHaveAttribute(
      "href", "/admin/dashboard/attractions",
    );
    expect(screen.queryByRole("region", { name: "ผลวิเคราะห์สถานที่" })).not.toBeInTheDocument();
    expect(mocks.getAnalytics).not.toHaveBeenCalled();
  });

  it("handles an attraction deactivated between options and analytics reads", async () => {
    mocks.getAnalytics.mockResolvedValue(null);
    render(await AttractionAnalyticsPage({ searchParams: Promise.resolve({ attractionId: "4" }) }));
    expect(screen.getByRole("status", { name: "สถานที่ที่เลือกไม่พร้อมวิเคราะห์" })).toBeInTheDocument();
    expect(screen.queryByText("ยังไม่มีสถานที่พร้อมวิเคราะห์")).not.toBeInTheDocument();
  });

  it("retries analytics with the same applied scope, without forwarding unrelated query strings", async () => {
    mocks.getAnalytics.mockRejectedValue(new Error("private-database-error"));
    render(await AttractionAnalyticsPage({ searchParams: Promise.resolve({
      attractionId: "4", dateFrom: "2026-08-01", dateTo: "2026-08-31", campaignId: "7",
      checkinCodeId: "10", evidenceScope: "pilot_only", entryChannel: "nfc", secret: "private",
    }) }));
    expect(screen.getByRole("alert", { name: "ข้อมูลวิเคราะห์ไม่พร้อมใช้งานชั่วคราว" })).toBeInTheDocument();
    const retry = new URL(screen.getByRole("link", { name: "ลองโหลดอีกครั้ง" }).getAttribute("href")!, "http://localhost");
    expect(Object.fromEntries(retry.searchParams)).toEqual({
      attractionId: "4", dateFrom: "2026-08-01", dateTo: "2026-08-31", campaignId: "7",
      checkinCodeId: "10", evidenceScope: "pilot_only", entryChannel: "nfc",
    });
    expect(screen.queryByText(/private-database-error/)).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "ผลวิเคราะห์สถานที่" })).not.toBeInTheDocument();
  });

  it("explains invalid filters without querying an alternative dataset", async () => {
    render(await AttractionAnalyticsPage({ searchParams: Promise.resolve({ attractionId: "4", dateFrom: "invalid" }) }));
    expect(screen.getByRole("alert", { name: "ตัวกรองไม่ถูกต้อง" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เริ่มเลือกตัวกรองใหม่" })).toHaveAttribute("href", "/admin/dashboard/attractions");
    expect(mocks.getAnalytics).not.toHaveBeenCalled();
  });

  it("includes resolved default dates in the analytics retry rather than recomputing the scope later", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-26T18:30:00Z"));
    mocks.getAnalytics.mockRejectedValue(new Error("QUERY_FAILED"));
    render(await AttractionAnalyticsPage({ searchParams: Promise.resolve({}) }));
    const retry = new URL(screen.getByRole("link", { name: "ลองโหลดอีกครั้ง" }).getAttribute("href")!, "http://localhost");
    expect(Object.fromEntries(retry.searchParams)).toEqual({
      attractionId: "4", dateFrom: "2026-06-30", dateTo: "2026-09-27", evidenceScope: "field_claim",
    });
  });

  it("uses a 90-day Bangkok calendar range during the UTC/Thai day boundary", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-26T18:30:00Z"));
    render(await AttractionAnalyticsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("textbox", { name: "ถึงวันที่" })).toHaveValue("2026-09-27");
    expect(screen.getByRole("textbox", { name: "จากวันที่" })).toHaveValue("2026-06-30");
    expect(mocks.getAnalytics).toHaveBeenCalledWith(expect.objectContaining({
      attractionId: 4, dateFrom: "2026-06-30", dateTo: "2026-09-27", evidenceScope: "field_claim",
    }));
    expect(screen.getByRole("region", { name: "ผลวิเคราะห์สถานที่" })).toBeInTheDocument();
  });
});
