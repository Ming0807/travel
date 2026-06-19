import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("MobileBottomNav", () => {
  it("keeps hook order stable when navigating from public pages to admin pages", () => {
    mockUsePathname.mockReturnValue("/");
    const { rerender } = render(<MobileBottomNav />);

    expect(screen.getByLabelText("Mobile navigation")).toBeInTheDocument();

    mockUsePathname.mockReturnValue("/admin/checkin-codes");
    expect(() => rerender(<MobileBottomNav />)).not.toThrow();
    expect(screen.queryByLabelText("Mobile navigation")).not.toBeInTheDocument();
  });
});
