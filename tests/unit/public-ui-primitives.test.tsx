import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ImgHTMLAttributes, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ priority, fill: _fill, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean }) =>
    createElement("img", { ...props, "data-priority": priority ? "true" : undefined }),
}));

import { PublicButton } from "../../components/public/PublicButton";
import { PublicCtaBand } from "../../components/public/PublicCtaBand";
import { PublicFields, PublicSearchField, PublicSelect } from "../../components/public/PublicFields";
import { PublicMediaFrame } from "../../components/public/PublicMediaFrame";
import { PublicPageFrame } from "../../components/public/PublicPageFrame";
import { PublicPagination } from "../../components/public/PublicPagination";
import {
  PublicEmptyState,
  PublicErrorState,
  PublicLoadingState,
  PublicNoDataState,
} from "../../components/public/PublicStates";

function Action({ children }: { children: ReactNode }) {
  return <button type="button">{children}</button>;
}

describe("public UI primitives", () => {
  it("renders href buttons as one link and native buttons with their contract", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <div>
        <PublicButton href="/attractions">Explore attractions</PublicButton>
        <PublicButton type="submit" disabled onClick={onClick}>
          Save
        </PublicButton>
      </div>,
    );

    expect(screen.getByRole("link", { name: "Explore attractions" })).toHaveAttribute("href", "/attractions");
    expect(screen.getAllByRole("link")).toHaveLength(1);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps primary text and search placeholders contrast-safe", () => {
    render(
      <div>
        <PublicButton>Get started</PublicButton>
        <PublicSearchField label="Search places" name="query" placeholder="Try a place" />
      </div>,
    );

    const primaryButton = screen.getByRole("button", { name: "Get started" });
    const search = screen.getByRole("searchbox", { name: "Search places" });

    expect(primaryButton).toHaveClass("text-[var(--public-ink)]");
    expect(primaryButton).not.toHaveClass("text-white");
    expect(search).toHaveClass("placeholder:text-black/70");
    expect(search).not.toHaveClass("placeholder:text-black/45");
  });

  it("keeps an empty href in the anchor branch", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { container } = render(<PublicButton href="">Empty destination</PublicButton>);
    const anchor = container.querySelector("a");

    expect(anchor).toHaveTextContent("Empty destination");
    expect(anchor).toHaveAttribute("href", "");
    expect(screen.queryByRole("button", { name: "Empty destination" })).not.toBeInTheDocument();
    consoleError.mockRestore();
  });

  it("keeps search and select fields visibly labeled and native", () => {
    render(
      <PublicFields>
        <PublicSearchField label="Search places" name="query" defaultValue="waterfall" placeholder="Try a place" />
        <PublicSelect label="Province" name="province" defaultValue="yala">
          <option value="yala">Yala</option>
        </PublicSelect>
      </PublicFields>,
    );

    expect(screen.getByLabelText("Search places")).toHaveAttribute("name", "query");
    expect(screen.getByLabelText("Search places")).toHaveValue("waterfall");
    expect(screen.getByLabelText("Province")).toHaveAttribute("name", "province");
    expect(screen.getByLabelText("Province")).toHaveValue("yala");
    expect(screen.getByText("Search places")).toBeVisible();
    expect(screen.getByText("Province")).toBeVisible();
  });

  it("renders responsive media with the image contract or an honest fallback", () => {
    const { rerender } = render(
      <PublicMediaFrame
        src="/images/attraction.jpg"
        alt="A waterfall in Yala"
        aspect="landscape"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        fallbackLabel="Image unavailable"
      />,
    );

    const image = screen.getByRole("img", { name: "A waterfall in Yala" });
    expect(image).toHaveAttribute("alt", "A waterfall in Yala");
    expect(image).toHaveAttribute("sizes", "(max-width: 768px) 100vw, 50vw");
    expect(image).toHaveAttribute("data-priority", "true");

    rerender(
      <PublicMediaFrame
        src={null}
        alt="A waterfall in Yala"
        aspect="landscape"
        sizes="100vw"
        fallbackLabel="Image unavailable"
      />,
    );

    expect(screen.getByText("Image unavailable")).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("replaces media that fails at runtime with the honest fallback", () => {
    render(
      <PublicMediaFrame
        src="/images/missing.jpg"
        alt="Missing attraction"
        aspect="landscape"
        sizes="100vw"
        fallbackLabel="Image unavailable"
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Missing attraction" }));

    expect(screen.getByText("Image unavailable")).toBeVisible();
    expect(screen.queryByRole("img", { name: "Missing attraction" })).not.toBeInTheDocument();
  });

  it("collapses a CTA to text-only when its optional image fails", () => {
    render(
      <PublicCtaBand
        title="Plan another stop"
        description="Build the next part of the trip."
        linkText="View routes"
        linkUrl="/routes"
        image="cta/missing.jpg"
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Plan another stop" }));

    const section = screen.getByRole("heading", { name: "Plan another stop" }).closest("section");
    expect(section?.innerHTML).not.toContain("md:grid-cols");
    expect(screen.queryByRole("img", { name: "Plan another stop" })).not.toBeInTheDocument();
  });

  it("stops reserving CTA space when an optional image stalls", () => {
    vi.useFakeTimers();

    try {
      render(
        <PublicCtaBand
          title="Plan another stop"
          description="Build the next part of the trip."
          linkText="View routes"
          linkUrl="/routes"
          image="cta/stalled.jpg"
        />,
      );

      expect(screen.getByRole("heading", { name: "Plan another stop" }).closest("section")?.innerHTML).toContain("md:grid-cols");

      act(() => vi.advanceTimersByTime(5_000));

      expect(screen.getByRole("heading", { name: "Plan another stop" }).closest("section")?.innerHTML).not.toContain("md:grid-cols");
      expect(screen.queryByRole("img", { name: "Plan another stop" })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("exposes state semantics and renders a real optional action", () => {
    render(
      <div>
        <PublicEmptyState title="No attractions found" description="Try another search." action={<Action>Clear search</Action>} />
        <PublicErrorState title="Could not load places" description="Please try again." action={<Action>Retry</Action>} />
        <PublicLoadingState title="Loading places" description="Please wait." />
        <PublicNoDataState title="No data yet" description="There is no data for this period." />
      </div>,
    );

    expect(screen.getByRole("alert", { name: "Could not load places" })).toBeVisible();
    expect(screen.getByRole("status", { name: "Loading places" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status", { name: "No data yet" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear search" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  it("uses Thai-first labels, generated links, current-page semantics, and one-page suppression", () => {
    const createHref = (page: number) => `/attractions?page=${page}`;

    const { rerender } = render(<PublicPagination page={2} pageCount={3} createHref={createHref} />);

    expect(screen.getByRole("navigation", { name: "การแบ่งหน้า" })).toBeVisible();
    expect(screen.getByRole("link", { name: "หน้าก่อนหน้า" })).toHaveAttribute("href", "/attractions?page=1");
    expect(screen.getByRole("link", { name: "หน้าถัดไป" })).toHaveAttribute("href", "/attractions?page=3");
    expect(screen.getByRole("link", { name: "หน้า 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "หน้า 2" })).toHaveAttribute("href", "/attractions?page=2");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(<PublicPagination page={1} pageCount={1} createHref={createHref} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("disables impossible pagination directions without nested interactive controls", () => {
    render(<PublicPagination page={1} pageCount={2} createHref={(page) => `/page/${page}`} />);

    const previous = screen.getByText("หน้าก่อนหน้า");
    expect(previous.tagName).toBe("SPAN");
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: "หน้าถัดไป" })).toHaveAttribute("href", "/page/2");
    expect(screen.getAllByRole("link").every((link) => link.querySelector("a,button") === null)).toBe(true);
  });

  it("normalizes malformed page values and suppresses invalid page counts", () => {
    const createHref = (page: number) => `/attractions?page=${page}`;
    const { rerender } = render(<PublicPagination page={2.8} pageCount={3.9} createHref={createHref} />);

    expect(screen.getByRole("link", { name: "หน้า 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "หน้า 4" })).not.toBeInTheDocument();

    rerender(<PublicPagination page={99} pageCount={3} createHref={createHref} />);
    expect(screen.getByRole("link", { name: "หน้า 3" })).toHaveAttribute("aria-current", "page");

    rerender(<PublicPagination page={Number.NaN} pageCount={Number.POSITIVE_INFINITY} createHref={createHref} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    rerender(<PublicPagination page={Number.NEGATIVE_INFINITY} pageCount={1.9} createHref={createHref} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("bounds numeric page links for first, middle, and final pages", () => {
    const createHref = (page: number) => `/attractions?page=${page}`;
    const numericLinks = () => screen.getAllByRole("link").filter((link) => link.getAttribute("aria-label")?.startsWith("หน้า "));

    const { rerender } = render(<PublicPagination page={1} pageCount={1000} createHref={createHref} />);
    expect(numericLinks().map((link) => link.getAttribute("aria-label"))).toEqual(["หน้า 1", "หน้า 2", "หน้า 3", "หน้า 1000"]);
    expect(numericLinks().map((link) => link.getAttribute("href"))).toEqual([
      "/attractions?page=1",
      "/attractions?page=2",
      "/attractions?page=3",
      "/attractions?page=1000",
    ]);
    expect(screen.getAllByText("…")).toHaveLength(1);

    rerender(<PublicPagination page={500} pageCount={1000} createHref={createHref} />);
    expect(numericLinks().map((link) => link.getAttribute("aria-label"))).toEqual([
      "หน้า 1",
      "หน้า 498",
      "หน้า 499",
      "หน้า 500",
      "หน้า 501",
      "หน้า 502",
      "หน้า 1000",
    ]);
    expect(screen.getAllByText("…")).toHaveLength(2);
    expect(numericLinks()).toHaveLength(7);

    rerender(<PublicPagination page={1000} pageCount={1000} createHref={createHref} />);
    expect(numericLinks().map((link) => link.getAttribute("aria-label"))).toEqual(["หน้า 1", "หน้า 998", "หน้า 999", "หน้า 1000"]);
    expect(screen.getAllByText("…")).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "…" })).not.toBeInTheDocument();
  });

  it("maps frame variants to distinct widths while preserving semantic children", () => {
    const variants = ["listing", "detail", "reading", "legal"] as const;
    const widthClasses = variants.map((variant) => {
      const { container, unmount } = render(
        <PublicPageFrame variant={variant}>
          <h1>Shared heading</h1>
        </PublicPageFrame>,
      );
      const frame = container.firstElementChild as HTMLElement;
      expect(frame.querySelector("h1")).toHaveTextContent("Shared heading");
      unmount();
      return frame.className.split(" ").find((className) => className.startsWith("max-w-"));
    });

    expect(widthClasses).toEqual(["max-w-7xl", "max-w-6xl", "max-w-[70ch]", "max-w-3xl"]);
  });
});
