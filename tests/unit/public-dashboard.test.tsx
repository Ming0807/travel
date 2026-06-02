import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PublicDashboardPage from "@/app/(public)/dashboard/page";
import * as dashboardService from "@/lib/services/dashboard.service";

// Mock the PageShell component to just render its children
vi.mock("@/components/layout/page-shell", () => ({
  PageShell: ({ children, title }: { children: any; title: string }) => (
    <div data-testid="page-shell" data-title={title}>
      {children}
    </div>
  ),
}));

vi.mock("@/lib/services/dashboard.service", () => ({
  getPublicDashboardAnalytics: vi.fn(),
}));

describe("Public Dashboard Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the dashboard with KPI values", async () => {
    vi.mocked(dashboardService.getPublicDashboardAnalytics).mockResolvedValue({
      kpis: [
        { key: "tourist_profiles", label: "Tourist Profiles", value: "12,345" },
        { key: "total_visits", label: "Total Visits", value: "45,678" },
        { key: "certificates_generated", label: "Certificates", value: "9,876" },
        { key: "average_satisfaction", label: "Satisfaction", value: "4.8" },
      ],
      executive: {
        visitTrend: [],
        visitsByProvince: [
          { province: "Yala", visits: 100 },
          { province: "Pattani", visits: 50 },
          { province: "Narathiwat", visits: 25 },
        ],
      },
    } as any);

    const jsx = await PublicDashboardPage();
    render(jsx);

    expect(screen.getByTestId("page-shell")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByText("45,678")).toBeInTheDocument();
    expect(screen.getByText("9,876")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });
});
