import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResearchEvidenceVersionFields } from "@/components/admin/research/ResearchEvidenceVersionFields";

const evidence = [
  { evidenceType: "expert_review" as const, versionNumber: 4 },
  { evidenceType: "cognitive_pretest" as const, versionNumber: 2 },
  { evidenceType: "expert_review" as const, versionNumber: 1 },
];
const labels = { expert_review: "ผู้เชี่ยวชาญ", cognitive_pretest: "Pretest", mobile_flow_qa: "Mobile QA" };

describe("research evidence version entry", () => {
  it("starts an empty evidence ledger at version one", () => {
    render(<ResearchEvidenceVersionFields labels={labels} evidence={[]} />);
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(1);
  });

  it("can suggest the first missing evidence type without locking the choice", () => {
    render(<ResearchEvidenceVersionFields labels={labels} evidence={evidence} initialType="cognitive_pretest" />);
    expect(screen.getByLabelText("ประเภทหลักฐาน")).toHaveValue("cognitive_pretest");
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(3);
    fireEvent.change(screen.getByLabelText("ประเภทหลักฐาน"), { target: { value: "mobile_flow_qa" } });
    expect(screen.getByLabelText("ประเภทหลักฐาน")).toHaveValue("mobile_flow_qa");
  });

  it("proposes the next version per type, independent of ledger order", () => {
    render(<ResearchEvidenceVersionFields labels={labels} evidence={evidence} />);
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(5);
    fireEvent.change(screen.getByLabelText("ประเภทหลักฐาน"), { target: { value: "cognitive_pretest" } });
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(3);
    fireEvent.change(screen.getByLabelText("ประเภทหลักฐาน"), { target: { value: "mobile_flow_qa" } });
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(1);
  });

  it("keeps manually entered versions when switching type and submits the selected pair", () => {
    const { container } = render(<form><ResearchEvidenceVersionFields labels={labels} evidence={evidence} /></form>);
    fireEvent.change(screen.getByLabelText("รุ่นหลักฐาน"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("ประเภทหลักฐาน"), { target: { value: "mobile_flow_qa" } });
    fireEvent.change(screen.getByLabelText("ประเภทหลักฐาน"), { target: { value: "expert_review" } });
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(8);
    const form = container.querySelector("form");
    if (!form) throw new Error("Missing test form");
    expect(Array.from(new FormData(form).entries())).toEqual([
      ["evidenceType", "expert_review"], ["versionNumber", "8"],
    ]);
  });

  it("keeps a cleared input empty and required instead of silently accepting a default", () => {
    render(<ResearchEvidenceVersionFields labels={labels} evidence={evidence} />);
    const input = screen.getByLabelText("รุ่นหลักฐาน");
    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue(null);
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
  });

  it("refreshes suggestions from new evidence without overwriting a manual value", () => {
    const { rerender } = render(<ResearchEvidenceVersionFields labels={labels} evidence={evidence} />);
    rerender(<ResearchEvidenceVersionFields labels={labels} evidence={[...evidence, { evidenceType: "expert_review", versionNumber: 6 }]} />);
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(7);
    fireEvent.change(screen.getByLabelText("รุ่นหลักฐาน"), { target: { value: "9" } });
    rerender(<ResearchEvidenceVersionFields labels={labels} evidence={[...evidence, { evidenceType: "expert_review", versionNumber: 7 }]} />);
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(9);
  });

  it("starts a fresh entry after the parent receives a changed ledger or study", () => {
    const { rerender } = render(<ResearchEvidenceVersionFields key="study-a:4:2:0" labels={labels} evidence={evidence} />);
    fireEvent.change(screen.getByLabelText("รุ่นหลักฐาน"), { target: { value: "8" } });
    rerender(<ResearchEvidenceVersionFields key="study-a:8:2:0" labels={labels} evidence={[...evidence, { evidenceType: "expert_review", versionNumber: 8 }]} />);
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(9);
    rerender(<ResearchEvidenceVersionFields key="study-b:0:0:0" labels={labels} evidence={[]} />);
    expect(screen.getByLabelText("รุ่นหลักฐาน")).toHaveValue(1);
  });
});
