import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MicroSurveyForm } from "@/components/survey/MicroSurveyForm";
import { SurveySkipCard } from "@/components/survey/SurveySkipCard";
import { ResearchEvaluationForm } from "@/components/research/ResearchEvaluationForm";
import { postCertificateSurveySchema } from "@/lib/validation/survey";

const surveyAction = vi.fn();
const researchAction = vi.fn();
const router = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
};

vi.mock("@/app/actions/survey-actions", () => ({
  submitPostCertificateSurveyAction: (...args: unknown[]) => surveyAction(...args),
  skipPostCertificateSurveyAction: (...args: unknown[]) => surveyAction(...args),
}));

vi.mock("@/app/actions/research-actions", () => ({
  saveResearchEvaluationAction: (...args: unknown[]) => researchAction(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

const visitId = "550e8400-e29b-41d4-a716-446655440000";

const surveyOptions = {
  travelCompanions: [],
  transportModes: [],
  travelPurposes: [],
  expenseCategories: [],
  spendingRanges: [],
};

const researchItem = {
  itemCode: "SQ_01",
  constructKey: "system_quality",
  promptTh: "ระบบใช้งานง่าย",
  promptEn: null,
  answerType: "agreement_5",
  options: null,
  displayOrder: 1,
  isRequired: true,
};

function renderTourismSurvey() {
  return render(
    <MicroSurveyForm visitId={visitId} options={surveyOptions} />,
  );
}

describe("Task 18 survey and research boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    researchAction.mockResolvedValue({ success: true, saved: true, status: "draft", answerCount: 1 });
  });

  it("keeps facility score parity from the visible rating to the tourism payload", () => {
    renderTourismSurvey();
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));

    const facility = screen.getByRole("group", { name: /facility/i });
    fireEvent.click(within(facility).getByRole("radio", { name: "4" }));

    const form = document.querySelector("form");
    expect(form).not.toBeNull();
    expect(new FormData(form as HTMLFormElement).get("facilityScore")).toBe("4");
  });

  it("shows explicit low and high anchors for tourism ratings", () => {
    renderTourismSurvey();
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));

    const facility = screen.getByRole("group", { name: /facility/i });
    expect(within(facility).getByText(/1\s*(?:น้อยที่สุด|ต่ำที่สุด|lowest)/i)).toBeInTheDocument();
    expect(within(facility).getByText(/5\s*(?:มากที่สุด|สูงที่สุด|highest)/i)).toBeInTheDocument();
  });

  it("keeps research item controls out of the tourism survey dataset", () => {
    renderTourismSurvey();

    const form = document.querySelector("form");
    expect(form?.querySelector('[name="SQ_01"]')).toBeNull();
    expect(form?.querySelector('[name="instrumentKey"]')).toBeNull();
    expect(form?.textContent).not.toMatch(/ระบบคุณภาพ|research evaluation|system quality/i);
  });

  it("preserves unanswered tourism dimensions as null instead of zero", () => {
    const result = postCertificateSurveySchema.parse({
      visitId,
      optionalComment: "ยังไม่มีคะแนนด้านสิ่งอำนวยความสะดวก",
      overallSatisfaction: "",
      safetyScore: "",
      cleanlinessScore: "",
      accessibilityScore: "",
      informationScore: "",
      valueScore: "",
      facilityScore: "",
    });

    expect({
      overallSatisfaction: result.overallSatisfaction,
      safetyScore: result.safetyScore,
      cleanlinessScore: result.cleanlinessScore,
      accessibilityScore: result.accessibilityScore,
      informationScore: result.informationScore,
      valueScore: result.valueScore,
      facilityScore: result.facilityScore,
    }).toEqual({
      overallSatisfaction: null,
      safetyScore: null,
      cleanlinessScore: null,
      accessibilityScore: null,
      informationScore: null,
      valueScore: null,
      facilityScore: null,
    });
  });

  it("keeps survey exit independent from submitting a partial survey", () => {
    const { container } = render(<SurveySkipCard visitId={visitId} />);
    const form = container.querySelector("form");

    expect(form).not.toBeNull();
    expect(new FormData(form as HTMLFormElement).get("visitId")).toBe(visitId);
    expect(screen.getByRole("button", { name: /ข้ามแบบสอบถาม|ข้ามแบบสำรวจ|skip/i })).toBeInTheDocument();
  });

  it("sends research answers without tourism fields", async () => {
    render(
      <ResearchEvaluationForm
        visitId={visitId}
        instrumentKey="tourist_evaluation"
        items={[researchItem]}
        savedAnswers={[]}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /^4\b/ }));
    fireEvent.click(screen.getByRole("button", { name: /ส่งแบบประเมิน|submit/i }));

    await waitFor(() => expect(researchAction).toHaveBeenCalledTimes(1));
    const payload = researchAction.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toEqual(expect.objectContaining({
      instrumentKey: "tourist_evaluation",
      submit: true,
    }));
    // Visit selects server-verified credentials, not tourism survey answers.
    expect(payload.visitId).toBe(visitId);
    expect(payload).not.toHaveProperty("facilityScore");
    expect(payload).not.toHaveProperty("overallSatisfaction");
    expect(payload.answers).toEqual([{ itemCode: "SQ_01", integerValue: 4 }]);
  });

  it("does not let the browser supply research duration", async () => {
    render(
      <ResearchEvaluationForm
        visitId={visitId}
        instrumentKey="tourist_evaluation"
        items={[researchItem]}
        savedAnswers={[]}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /^4\b/ }));
    fireEvent.click(screen.getByRole("button", { name: /ส่งแบบประเมิน|submit/i }));

    await waitFor(() => expect(researchAction).toHaveBeenCalledTimes(1));
    const payload = researchAction.mock.calls[0]?.[0] as Record<string, unknown>;
    // The save RPC derives duration from server-owned started_at/submitted_at.
    expect(payload).not.toHaveProperty("durationSeconds");
  });

  it("prevents duplicate research saves and lets the participant retry after failure", async () => {
    let resolveSave: (value: unknown) => void = () => undefined;
    researchAction.mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );

    render(
      <ResearchEvaluationForm
        visitId={visitId}
        instrumentKey="tourist_evaluation"
        items={[{ ...researchItem, isRequired: false }]}
        savedAnswers={[]}
      />,
    );

    const button = screen.getByRole("button", { name: /ส่งแบบประเมิน|submit/i });
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    fireEvent.click(button);
    expect(researchAction).toHaveBeenCalledTimes(1);

    await act(async () => resolveSave({ success: false, error: "บันทึกไม่สำเร็จ" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("บันทึกไม่สำเร็จ");
    await waitFor(() => expect(button).not.toBeDisabled());

    researchAction.mockResolvedValueOnce({ success: true, saved: true, status: "draft", answerCount: 0 });
    fireEvent.click(button);
    await waitFor(() => expect(researchAction).toHaveBeenCalledTimes(2));
  });

  it("prevents duplicate tourism submissions while the save action is pending", async () => {
    let resolveSave: (value: unknown) => void = () => undefined;
    surveyAction.mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveSave = resolve;
      }),
    );

    renderTourismSurvey();
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));
    fireEvent.click(screen.getByRole("button", { name: /ถัดไป/ }));
    const form = document.querySelector("form");
    const submit = screen.getByRole("button", { name: /ส่งคำตอบ|บันทึก|submit/i });

    fireEvent.submit(form as HTMLFormElement);
    await waitFor(() => expect(surveyAction).toHaveBeenCalledTimes(1));
    expect(submit).toBeDisabled();

    fireEvent.submit(form as HTMLFormElement);
    expect(surveyAction).toHaveBeenCalledTimes(1);

    await act(async () => resolveSave({ success: true }));
  });
});
