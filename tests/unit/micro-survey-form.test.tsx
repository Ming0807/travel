import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MicroSurveyForm } from "@/components/survey/MicroSurveyForm";

vi.mock("@/app/actions/survey-actions", () => ({
  submitPostCertificateSurveyAction: vi.fn(),
}));

describe("current satisfaction dimensions", () => {
  it("renders facility as one compact optional accessible rating group", () => {
    render(
      <MicroSurveyForm
        visitId="550e8400-e29b-41d4-a716-446655440000"
        options={{
          travelCompanions: [],
          transportModes: [],
          travelPurposes: [],
          expenseCategories: [],
          spendingRanges: [],
        }}
      />,
    );

    const facility = screen.getByRole("group", { name: /facility/i });
    expect(within(facility).getAllByRole("radio")).toHaveLength(5);
    expect(facility.querySelector('input[name="facilityScore"]')).toBeInTheDocument();
    expect(screen.getByText("สิ่งอำนวยความสะดวก (Facility)")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/à¸|à¹/);
  });
});
