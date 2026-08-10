import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ImgHTMLAttributes, type ReactNode } from "react";

vi.mock("next/image", () => ({
  default: ({ priority, fill: _fill, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean }) =>
    createElement("img", { ...props, "data-priority": priority ? "true" : undefined }),
}));

import { PublicButton } from "../../components/public/PublicButton";
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
    expect(button.className).toContain("min-h-11");
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

  it("uses generated pagination links, marks the current page, and suppresses one-page results", () => {
    const createHref = (page: number) => `/attractions?page=${page}`;

    const { rerender } = render(<PublicPagination page={2} pageCount={3} createHref={createHref} />);

    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute("href", "/attractions?page=1");
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute("href", "/attractions?page=3");
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("href", "/attractions?page=2");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(<PublicPagination page={1} pageCount={1} createHref={createHref} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("disables impossible pagination directions without nested interactive controls", () => {
    render(<PublicPagination page={1} pageCount={2} createHref={(page) => `/page/${page}`} />);

    const previous = screen.getByText("Previous page");
    expect(previous.tagName).toBe("SPAN");
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute("href", "/page/2");
    expect(screen.getAllByRole("link").every((link) => link.querySelector("a,button") === null)).toBe(true);
  });

  it("maps frame variants to distinct widths while preserving semantic children", () => {
    const variants = ["listing", "detail", "reading", "legal"] as const;
    const classes = variants.map((variant) => {
      const { container, unmount } = render(
        <PublicPageFrame variant={variant}>
          <h1>Shared heading</h1>
        </PublicPageFrame>,
      );
      const frame = container.firstElementChild as HTMLElement;
      const className = frame.className;
      expect(frame.querySelector("h1")).toHaveTextContent("Shared heading");
      unmount();
      return className;
    });

    expect(new Set(classes).size).toBe(4);
    expect(classes[0]).toContain("max-w-7xl");
    expect(classes[1]).toContain("max-w-6xl");
    expect(classes[2]).toContain("max-w-[70ch]");
    expect(classes[3]).toContain("max-w-3xl");
  });
});
