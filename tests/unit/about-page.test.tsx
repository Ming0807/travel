import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/(public)/about/page";

vi.mock("@/lib/services/settings.service", () => {
  return {
    SettingsService: class {
      async getSetting(key, defaultValue) {
        if (key === "about_vision") {
          return { content: "Mocked Vision Content" };
        }
        if (key === "about_team") {
          return [
            { name: "John Doe", role: "Developer", imageUrl: "" },
            { name: "Jane Smith", role: "Designer", imageUrl: "" }
          ];
        }
        return defaultValue;
      }
    }
  };
});

vi.mock("@/components/layout/SiteFooter", () => ({
  SiteFooter: () => <div data-testid="site-footer">Footer</div>,
}));

describe("About Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the vision and team members from settings", async () => {
    const jsx = await AboutPage();
    render(jsx);

    expect(screen.getByText("Mocked Vision Content")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
    expect(screen.getByTestId("site-footer")).toBeInTheDocument();
  });
});
