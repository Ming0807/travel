import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AttractionsLoading from "@/app/(public)/attractions/loading";
import AttractionLoading from "@/app/(public)/attractions/[slug]/loading";

describe("public attraction loading feedback", () => {
  it("announces the directory loading state without exposing placeholder cards as real content", () => {
    const { container } = render(<AttractionsLoading />);
    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดสถานที่ท่องเที่ยว");
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("uses a detail loading state rather than an unrelated results list", () => {
    render(<AttractionLoading />);
    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดรายละเอียดสถานที่");
    expect(screen.queryByText("กำลังโหลดสถานที่ท่องเที่ยว")).not.toBeInTheDocument();
  });
});
