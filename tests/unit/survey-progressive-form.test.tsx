import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MicroSurveyForm } from "@/components/survey/MicroSurveyForm";

const surveyAction = vi.fn();

vi.mock("@/app/actions/survey-actions", () => ({
  submitPostCertificateSurveyAction: (...args: unknown[]) => surveyAction(...args),
}));

const visitId = "550e8400-e29b-41d4-a716-446655440000";

function renderForm() {
  return render(
    <MicroSurveyForm
      visitId={visitId}
      options={{
        travelCompanions: [],
        transportModes: [],
        travelPurposes: [],
        expenseCategories: [],
        spendingRanges: [],
      }}
    />,
  );
}

describe("progressive post-certificate survey", () => {
  it("shows one short section at a time and keeps every question optional", () => {
    renderForm();

    expect(screen.getByRole("heading", { name: "การเดินทาง" })).toBeVisible();
    expect(screen.getByText(/ทุกข้อไม่บังคับ/)).toBeVisible();
    expect(screen.queryByRole("heading", { name: "ความพึงพอใจ" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));
    expect(screen.getByRole("heading", { name: "การพักค้างและค่าใช้จ่าย" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));
    expect(screen.getByRole("heading", { name: "ความพึงพอใจ" })).toBeVisible();
    expect(screen.getByRole("button", { name: "ส่งคำตอบ" })).toBeVisible();
  });

  it("keeps facility parity and gives low/high meaning to the rating scale", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));

    const facility = screen.getByRole("group", { name: /สิ่งอำนวยความสะดวก/ });
    expect(within(facility).getAllByRole("radio")).toHaveLength(5);
    expect(facility.querySelector('input[name="facilityScore"]')).toBeInTheDocument();
    expect(within(facility).getByText("1 น้อยที่สุด")).toBeVisible();
    expect(within(facility).getByText("5 มากที่สุด")).toBeVisible();
  });

  it("preserves answers and allows retry after a recoverable save error", async () => {
    let resolveSave: (value: unknown) => void = () => undefined;
    surveyAction.mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));

    const facility = screen.getByRole("group", { name: /facility/i });
    const score = within(facility).getByRole("radio", { name: /^4$/ });
    fireEvent.click(score);
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำตอบ" }));
    await waitFor(() => expect(surveyAction).toHaveBeenCalledTimes(1));

    await act(async () => resolveSave({ message: "ยังบันทึกไม่ได้ กรุณาลองใหม่" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("ยังบันทึกไม่ได้");
    expect(
      within(screen.getByRole("group", { name: /facility/i })).getByRole("radio", { name: /^4$/ }),
    ).toBeChecked();
    await waitFor(() => expect(screen.getByRole("button", { name: "ส่งคำตอบ" })).not.toBeDisabled());
  });
});
