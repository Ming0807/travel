import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const saveAction = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
const push = vi.fn();

vi.mock("@/app/actions/research-actions", () => ({
  saveResearchEvaluationAction: (...args: unknown[]) => saveAction(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh, push }),
}));

import { ResearchEvaluationForm } from "@/components/research/ResearchEvaluationForm";
import { ResearchInvitePrompt } from "@/components/research/ResearchInvitePrompt";

const items = [
  {
    itemCode: "SQ_01",
    constructKey: "system_quality",
    promptTh: "ระบบตอบสนองได้รวดเร็ว",
    promptEn: null,
    answerType: "agreement_5",
    options: null,
    displayOrder: 1,
    isRequired: true,
  },
  {
    itemCode: "COMMENT",
    constructKey: "comment",
    promptTh: "ข้อเสนอแนะเพิ่มเติม",
    promptEn: null,
    answerType: "long_text",
    options: null,
    displayOrder: 2,
    isRequired: false,
  },
];

describe("research tourist UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveAction.mockResolvedValue({ success: true, saved: true, status: "draft", answerCount: 1 });
  });

  it("explains that research is optional without displacing the certificate form", () => {
    render(
      <ResearchInvitePrompt
        invitation={{
          studyCode: "field-tour-2026",
          titleTh: "การประเมินระบบ",
          purposeTh: "ช่วยประเมินระบบจากการใช้งานจริง",
          instrument: { estimatedMinutes: 4 },
        }}
        checkinCode="YALA_01"
      />,
    );

    expect(screen.getByText("ร่วมประเมินระบบโดยสมัครใจ")).toBeInTheDocument();
    expect(screen.getByText("ไม่กระทบสิทธิใบประกาศ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "อ่านรายละเอียดก่อนตัดสินใจ" })).toHaveAttribute(
      "href",
      expect.stringContaining("/research/field-tour-2026/invite"),
    );
  });

  it("restores draft answers and saves a full snapshot before moving forward", async () => {
    render(
      <ResearchEvaluationForm
        visitId="22222222-2222-4222-8222-222222222222"
        instrumentKey="tourist_evaluation"
        items={items}
        savedAnswers={[{ itemCode: "SQ_01", integerValue: 4 }]}
      />,
    );

    expect(screen.getByRole("radio", { name: "4 เห็นด้วย" })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /บันทึกและถัดไป/ }));

    await waitFor(() => expect(saveAction).toHaveBeenCalledWith({
      instrumentKey: "tourist_evaluation",
      answers: [{ itemCode: "SQ_01", integerValue: 4 }],
      submit: false,
    }));
    expect(await screen.findByText("ความคิดเห็นเพิ่มเติม")).toBeInTheDocument();
  });

  it("keeps the participant on the current section when a required answer is missing", () => {
    render(
      <ResearchEvaluationForm
        visitId="22222222-2222-4222-8222-222222222222"
        instrumentKey="tourist_evaluation"
        items={items}
        savedAnswers={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /บันทึกและถัดไป/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("กรุณาตอบคำถามที่จำเป็น");
    expect(saveAction).not.toHaveBeenCalled();
  });

  it("saves the current draft before pausing even when the section is incomplete", async () => {
    render(
      <ResearchEvaluationForm
        visitId="22222222-2222-4222-8222-222222222222"
        instrumentKey="tourist_evaluation"
        items={items}
        savedAnswers={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "พักไว้ ตอบภายหลัง" }));

    await waitFor(() => expect(saveAction).toHaveBeenCalledWith({
      instrumentKey: "tourist_evaluation",
      answers: [],
      submit: false,
    }));
    expect(push).toHaveBeenCalledWith("/visit/22222222-2222-4222-8222-222222222222/certificate/success");
  });
});
