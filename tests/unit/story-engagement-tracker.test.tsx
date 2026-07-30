import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Link from "next/link";
import {
  StoryCardEngagement,
  StoryDetailEngagement,
} from "@/components/stories/StoryEngagementTracker";

let observerCallback: IntersectionObserverCallback;
const disconnect = vi.fn();
const observe = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }

  disconnect = disconnect;
  observe = observe;
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];
}

describe("Story engagement tracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    Object.defineProperty(window, "crypto", {
      configurable: true,
      value: { randomUUID: () => "01234567-89ab-cdef-0123-456789abcdef" },
    });
    Object.defineProperty(navigator, "doNotTrack", {
      configurable: true,
      value: "0",
    });
    vi.stubGlobal(
      "IntersectionObserver",
      MockIntersectionObserver as unknown as typeof IntersectionObserver,
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 202 })),
    );
  });

  it("records a hub impression only once when a card becomes visible", () => {
    render(
      <StoryCardEngagement
        storyId={42}
        locale="th"
        tracking={{ surface: "story_hub", position: 1 }}
      >
        <Link href="/stories/yala">เรื่องราวยะลา</Link>
      </StoryCardEngagement>,
    );

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(fetch).toHaveBeenCalledOnce();
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body))).toEqual(
      expect.objectContaining({
        event: "story_impression",
        storyId: 42,
        surface: "story_hub",
        position: 1,
      }),
    );
  });

  it("records related clicks with source and target Story IDs", () => {
    render(
      <StoryCardEngagement
        storyId={43}
        locale="th"
        tracking={{
          surface: "related_rail",
          position: 2,
          sourceStoryId: 42,
        }}
      >
        <Link href="/stories/related">อ่านต่อ</Link>
      </StoryCardEngagement>,
    );

    screen.getByRole("link", { name: "อ่านต่อ" }).click();

    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body))).toEqual(
      expect.objectContaining({
        event: "related_content_click",
        storyId: 42,
        relatedStoryId: 43,
        position: 2,
      }),
    );
  });

  it("honors the browser do-not-track signal", () => {
    Object.defineProperty(navigator, "doNotTrack", {
      configurable: true,
      value: "1",
    });

    render(<StoryDetailEngagement storyId={42} locale="th" />);

    expect(fetch).not.toHaveBeenCalled();
    expect(sessionStorage.length).toBe(0);
  });

  it("requires active reading time before recording completion", () => {
    vi.useFakeTimers();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    render(<StoryDetailEngagement storyId={42} locale="th" />);
    vi.mocked(fetch).mockClear();

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      vi.advanceTimersByTime(14_000);
    });
    expect(fetch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(fetch).toHaveBeenCalledOnce();
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body))).toEqual(
      expect.objectContaining({ event: "meaningful_read_complete" }),
    );
    vi.useRealTimers();
  });

  it("does not count time while the tab is hidden", () => {
    vi.useFakeTimers();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    render(<StoryDetailEngagement storyId={42} locale="th" />);
    vi.mocked(fetch).mockClear();

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      vi.advanceTimersByTime(5_000);
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(20_000);
    });
    expect(fetch).not.toHaveBeenCalled();

    act(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(11_000);
    });
    expect(fetch).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
