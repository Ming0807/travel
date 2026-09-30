import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchInput } from "@/components/admin/SearchInput";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => "/admin/stories/submissions",
  useSearchParams: () => new URLSearchParams("status=needs_action&page=3"),
}));

describe("story library search", () => {
  beforeEach(() => { vi.useFakeTimers(); mocks.push.mockClear(); });
  afterEach(() => { vi.useRealTimers(); });

  it("clears a pending search without restoring the old typed term", () => {
    render(<SearchInput placeholder="ค้นหาเรื่องราว" />);
    fireEvent.change(screen.getByPlaceholderText("ค้นหาเรื่องราว"), { target: { value: "ยะลา" } });
    fireEvent.click(screen.getByRole("button", { name: /Clear search|ล้างคำค้นหา/ }));
    act(() => vi.runAllTimers());
    expect(mocks.push).toHaveBeenCalledTimes(1);
    const url = new URL(mocks.push.mock.calls[0][0], "https://example.test");
    expect(url.searchParams.get("search")).toBeNull();
    expect(url.searchParams.get("status")).toBe("needs_action");
    expect(url.searchParams.get("page")).toBe("1");
  });

  it("searches immediately on Enter while preserving the moderation filter", () => {
    render(<SearchInput placeholder="ค้นหาเรื่องราว" />);
    const input = screen.getByPlaceholderText("ค้นหาเรื่องราว");
    fireEvent.change(input, { target: { value: "  ชุมชนยะลา  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mocks.push).toHaveBeenCalledTimes(1);
    act(() => vi.runAllTimers());
    expect(mocks.push).toHaveBeenCalledTimes(1);
    const url = new URL(mocks.push.mock.calls[0][0], "https://example.test");
    expect(url.searchParams.get("search")).toBe("ชุมชนยะลา");
    expect(url.searchParams.get("status")).toBe("needs_action");
  });

  it("does not search mid-composition and cancels pending searches on unmount", () => {
    const view = render(<SearchInput placeholder="ค้นหาเรื่องราว" />);
    const input = screen.getByPlaceholderText("ค้นหาเรื่องราว");
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "ยะ" } });
    act(() => vi.runAllTimers());
    expect(mocks.push).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input, { data: "ยะลา", target: { value: "ยะลา" } });
    view.unmount();
    act(() => vi.runAllTimers());
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
