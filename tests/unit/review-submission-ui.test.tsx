import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/submit-review-action", () => ({
  submitReviewAction: vi.fn(),
}));

import { ReviewSubmissionForm } from "@/components/reviews/ReviewSubmissionForm";

describe("ReviewSubmissionForm", () => {
  it("provides a clear accessible rating control and Thai-first moderation guidance", () => {
    render(<ReviewSubmissionForm attractionId={12} />);

    expect(screen.getByRole("group", { name: "คะแนนรีวิว" })).toBeInTheDocument();
    for (const score of [1, 2, 3, 4, 5]) {
      expect(screen.getByRole("button", { name: `ให้ ${score} ดาว` })).toBeInTheDocument();
    }
    expect(screen.getByText("รีวิวจะแสดงหลังผ่านการตรวจสอบจากผู้ดูแล")).toBeInTheDocument();
  });
});
