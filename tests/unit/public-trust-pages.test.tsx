import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactPageClient } from "@/components/contact/ContactPageClient";

const fetchMock = vi.fn();

function fillContactForm() {
  fireEvent.change(screen.getByLabelText("ชื่อสำหรับติดต่อ"), { target: { value: "ผู้ทดสอบระบบ" } });
  fireEvent.change(screen.getByLabelText("อีเมลสำหรับตอบกลับ"), { target: { value: "tester@example.com" } });
  fireEvent.change(screen.getByLabelText(/หัวเรื่อง/), { target: { value: "แจ้งปัญหา QR" } });
  fireEvent.change(screen.getByLabelText("รายละเอียด"), { target: { value: "สแกน QR แล้วไม่สามารถเปิดหน้าสร้างใบประกาศได้" } });
}

describe("public contact trust flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("submits to the real contact endpoint and prevents duplicate sends while pending", async () => {
    let resolveRequest: (response: Response) => void = () => undefined;
    fetchMock.mockImplementationOnce(
      () => new Promise<Response>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<ContactPageClient />);
    fillContactForm();

    const submit = screen.getByRole("button", { name: "ส่งข้อความ" });
    fireEvent.click(submit);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(submit).toBeDisabled();
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/contact", expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }));

    await act(async () => resolveRequest(new Response(JSON.stringify({ success: true }), { status: 200 })));
    expect(await screen.findByRole("status")).toHaveTextContent("ส่งข้อความเรียบร้อยแล้ว");
  });

  it("preserves values after failure and lets the sender retry", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({
        success: false,
        error: { code: "SAVE_FAILED", message: "ยังส่งข้อความไม่ได้ กรุณาลองใหม่อีกครั้ง" },
      }), { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    render(<ContactPageClient />);
    fillContactForm();
    fireEvent.click(screen.getByRole("button", { name: "ส่งข้อความ" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("ยังส่งข้อความไม่ได้");
    expect(screen.getByLabelText("ชื่อสำหรับติดต่อ")).toHaveValue("ผู้ทดสอบระบบ");
    expect(screen.getByLabelText("รายละเอียด")).toHaveValue("สแกน QR แล้วไม่สามารถเปิดหน้าสร้างใบประกาศได้");

    fireEvent.click(screen.getByRole("button", { name: "ส่งข้อความ" }));
    expect(await screen.findByRole("status")).toHaveTextContent("ส่งข้อความเรียบร้อยแล้ว");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText("ชื่อสำหรับติดต่อ")).toHaveValue("");
  });

  it("does not show unsupported contact, response-time, social, FAQ, or newsletter claims", () => {
    const { container } = render(<ContactPageClient />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/contact@southerntourism\.com|073 313 928|ตอบกลับภายใน 24 ชั่วโมง/);
    expect(text).not.toMatch(/เวลาทำการ|คำถามที่พบบ่อย|ติดตามข่าวสาร|แลกรับของที่ระลึก/);
    expect(text).not.toMatch(/Facebook|Instagram|YouTube|Pinterest/);
    expect(screen.getByRole("link", { name: "นโยบายความเป็นส่วนตัว" })).toHaveAttribute("href", "/privacy");
  });
});
