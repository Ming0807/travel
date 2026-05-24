import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { XPProgressBar } from "@/components/badges/XPProgressBar";
import type { XPLevelInfo } from "@/types/tourism";

describe("XPProgressBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultXp: XPLevelInfo = {
    currentXp: 450,
    currentLevel: 4,
    xpForCurrentLevel: 250,
    xpForNextLevel: 500,
    progress: 0.8,
  };

  it("renders with initial width 0%", () => {
    const { container } = render(<XPProgressBar xp={defaultXp} />);
    const bar = container.querySelector(".h-full.rounded-full");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveStyle({ width: "0%" });
  });

  it("animates to target width after timer fires", () => {
    const { container } = render(<XPProgressBar xp={defaultXp} />);

    // Advance timers past 200ms delay in act() to flush state updates
    act(() => {
      vi.advanceTimersByTime(250);
    });

    const bar = container.querySelector(".h-full.rounded-full") as HTMLElement;
    expect(bar).toHaveStyle({ width: "80%" });
  });

  it("displays correct level number", () => {
    render(<XPProgressBar xp={defaultXp} />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("displays formatted XP value", () => {
    render(<XPProgressBar xp={{ ...defaultXp, currentXp: 1500 }} />);
    expect(screen.getByText("1,500")).toBeInTheDocument();
  });

  it("displays progress percentage", () => {
    render(<XPProgressBar xp={defaultXp} />);
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("shows 'max level' message when at max", () => {
    const maxXp: XPLevelInfo = {
      currentXp: 9999,
      currentLevel: 10,
      xpForCurrentLevel: 9000,
      xpForNextLevel: 9999,
      progress: 1,
    };
    render(<XPProgressBar xp={maxXp} />);
    expect(screen.getByText(/ถึงเลเวลสูงสุดแล้ว/)).toBeInTheDocument();
  });

  it("shows remaining XP text when not at max", () => {
    render(<XPProgressBar xp={defaultXp} />);
    expect(screen.getByText(/อีก.*ถึงเลเวลถัดไป/)).toBeInTheDocument();
  });

  it("renders in compact mode with reduced padding", () => {
    const { container } = render(<XPProgressBar xp={defaultXp} compact />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.className).toContain("p-4");
  });

  it("handles 100% progress correctly", () => {
    const fullXp: XPLevelInfo = { ...defaultXp, progress: 1 };
    const { container } = render(<XPProgressBar xp={fullXp} />);

    act(() => {
      vi.advanceTimersByTime(250);
    });

    const bar = container.querySelector(".h-full.rounded-full") as HTMLElement;
    expect(bar).toHaveStyle({ width: "100%" });
  });

  it("re-animates when progress value changes", () => {
    const { container, rerender } = render(<XPProgressBar xp={defaultXp} />);

    // Let first animation complete
    act(() => {
      vi.advanceTimersByTime(250);
    });

    const bar = container.querySelector(".h-full.rounded-full") as HTMLElement;
    expect(bar).toHaveStyle({ width: "80%" });

    // Re-render with new progress — wrap in act() to flush effect state update
    const updatedXp: XPLevelInfo = { ...defaultXp, progress: 0.5 };
    act(() => {
      rerender(<XPProgressBar xp={updatedXp} />);
    });

    // Should reset to 0% immediately after act flushes state
    expect(bar).toHaveStyle({ width: "0%" });

    // Then animate to 50%
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(bar).toHaveStyle({ width: "50%" });
  });
});
