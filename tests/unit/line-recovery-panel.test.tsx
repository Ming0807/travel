import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LineRecoveryPanel } from "@/components/account/LineRecoveryPanel";

vi.mock("@/lib/services/line-liff.client", () => ({
  isLineLiffConfigured: () => true,
}));

describe("LineRecoveryPanel", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("requires explicit consent before starting LINE recovery", () => {
    render(<LineRecoveryPanel />);

    expect(
      screen.getByRole("checkbox", { name: /ยินยอมให้ระบบเชื่อมบัญชี LINE เพื่อค้นคืนพาสปอร์ตเดิม/ }),
    ).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "กู้คืนพาสปอร์ตด้วย LINE" }));

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText("กรุณายืนยันความยินยอมก่อนกู้คืนพาสปอร์ต")).toBeInTheDocument();
  });
});
