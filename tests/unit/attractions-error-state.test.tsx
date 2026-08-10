import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AttractionsError from "@/app/(public)/attractions/error";

describe("AttractionsError", () => {
  it("shows a Thai retry state without exposing the internal exception", () => {
    const reset = vi.fn();

    render(<AttractionsError error={new Error("database unavailable")} reset={reset} />);

    expect(screen.getByRole("alert")).toHaveTextContent("โหลดสถานที่ท่องเที่ยวไม่สำเร็จ");
    expect(screen.queryByText("database unavailable")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ลองโหลดอีกครั้ง" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
