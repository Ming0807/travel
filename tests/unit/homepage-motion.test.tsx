import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomepageMotion } from "@/components/homepage/HomepageMotion";
import { HomepageLoading } from "@/components/homepage/HomepageLoading";

describe("Home motion accessibility", () => {
  const originalAnimate = Object.getOwnPropertyDescriptor(Element.prototype, "animate");
  afterEach(() => {
    vi.unstubAllGlobals(); vi.restoreAllMocks();
    if (originalAnimate) Object.defineProperty(Element.prototype, "animate", originalAnimate);
    else Reflect.deleteProperty(Element.prototype, "animate");
  });
  it("keeps server content visible and does not animate when reduced motion is enabled", () => {
    const animate = vi.fn();
    vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    vi.stubGlobal("IntersectionObserver", undefined);
    Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate });
    render(<main><HomepageMotion /><div className="ed-hero-copy"><h1>ค้นพบยะลา</h1></div></main>);
    expect(screen.getByRole("heading", { name: "ค้นพบยะลา" })).toBeVisible();
    expect(animate).not.toHaveBeenCalled();
  });
  it("cancels active animation when the user changes motion preference", () => {
    let change!: () => void;
    const preference = { matches: false, addEventListener: vi.fn((_event, callback) => { change = callback; }), removeEventListener: vi.fn() };
    const cancel = vi.fn();
    vi.stubGlobal("matchMedia", () => preference);
    vi.stubGlobal("IntersectionObserver", undefined);
    Object.defineProperty(Element.prototype, "animate", { configurable: true, value: vi.fn(() => ({ finished: new Promise(() => {}), cancel })) });
    const view = render(<main><HomepageMotion /><div className="ed-hero-copy"><h1>ค้นพบยะลา</h1></div></main>);
    act(() => { preference.matches = true; change(); });
    expect(cancel).toHaveBeenCalled();
    view.unmount();
    expect(preference.removeEventListener).toHaveBeenCalledWith("change", change);
  });
  it("announces useful pending content without fake progress values", () => {
    render(<HomepageLoading hero />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "กำลังเตรียมข้อมูลท่องเที่ยว");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
