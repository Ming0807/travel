import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

describe("RevealOnScroll", () => {
  let OriginalObserver: typeof IntersectionObserver;

  beforeEach(() => {
    OriginalObserver = globalThis.IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = OriginalObserver;
  });

  function createMockObserver(options?: {
    onObserve?: (el: Element) => void;
    triggerCallback?: (callback: IntersectionObserverCallback) => void;
  }) {
    return class MockIntersectionObserver {
      readonly root: Element | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [0];
      private callback: IntersectionObserverCallback;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        if (options?.triggerCallback) {
          options.triggerCallback(callback);
        }
      }

      observe(el: Element) {
        if (options?.onObserve) options.onObserve(el);
      }

      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
  }

  it("renders children", () => {
    globalThis.IntersectionObserver = createMockObserver();
    render(
      <RevealOnScroll>
        <p>Hello World</p>
      </RevealOnScroll>
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    globalThis.IntersectionObserver = createMockObserver();
    const { container } = render(
      <RevealOnScroll className="custom-class">
        <p>Content</p>
      </RevealOnScroll>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("custom-class");
  });

  it("applies custom delay via style", () => {
    globalThis.IntersectionObserver = createMockObserver();
    const { container } = render(
      <RevealOnScroll delay={300}>
        <p>Content</p>
      </RevealOnScroll>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.transitionDelay).toBe("300ms");
  });

  it("starts with opacity-0 and translate-y-8 before intersection", () => {
    // Observer that never triggers intersection callback
    globalThis.IntersectionObserver = createMockObserver();
    const { container } = render(
      <RevealOnScroll>
        <p>Content</p>
      </RevealOnScroll>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("opacity-0");
    expect(div.className).toContain("translate-y-8");
  });

  it("transitions to visible when IntersectionObserver triggers", () => {
    let triggerCallback: IntersectionObserverCallback | null = null;
    let observedEl: Element | null = null;

    globalThis.IntersectionObserver = createMockObserver({
      onObserve: (el) => { observedEl = el; },
      triggerCallback: (cb) => { triggerCallback = cb; },
    });

    const { container } = render(
      <RevealOnScroll>
        <p>Content</p>
      </RevealOnScroll>
    );

    const div = container.firstChild as HTMLElement;

    // Simulate intersection
    act(() => {
      if (triggerCallback && observedEl) {
        triggerCallback(
          [{
            boundingClientRect: new DOMRect(),
            intersectionRatio: 1,
            intersectionRect: new DOMRect(),
            isIntersecting: true,
            rootBounds: null,
            target: observedEl,
            time: Date.now(),
          }],
          null as unknown as IntersectionObserver
        );
      }
    });

    expect(div.className).toContain("opacity-100");
    expect(div.className).toContain("translate-y-0");
  });

  it("cleans up observer on unmount", () => {
    const disconnect = vi.fn();
    class MockObserver {
      root = null;
      rootMargin = "";
      thresholds = [0];
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnect;
      takeRecords = () => [];
    }

    globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;

    const { unmount } = render(
      <RevealOnScroll>
        <p>Content</p>
      </RevealOnScroll>
    );

    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("unobserves after first intersection", () => {
    let triggerCallback: IntersectionObserverCallback | null = null;
    let observedEl: Element | null = null;
    const unobserve = vi.fn();

    class MockObserver {
      root = null;
      rootMargin = "";
      thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        triggerCallback = callback;
      }
      observe(el: Element) { observedEl = el; }
      unobserve = unobserve;
      disconnect = vi.fn();
      takeRecords = () => [];
    }

    globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;

    const { container } = render(
      <RevealOnScroll>
        <p>Content</p>
      </RevealOnScroll>
    );

    const div = container.firstChild as HTMLElement;

    act(() => {
      if (triggerCallback && observedEl) {
        triggerCallback(
          [{
            boundingClientRect: new DOMRect(),
            intersectionRatio: 1,
            intersectionRect: new DOMRect(),
            isIntersecting: true,
            rootBounds: null,
            target: observedEl,
            time: Date.now(),
          }],
          null as unknown as IntersectionObserver
        );
      }
    });

    expect(unobserve).toHaveBeenCalledWith(div);
  });
});
