import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LineRecoveryPanel } from "@/components/account/LineRecoveryPanel";
import { recoverLinePassport } from "@/lib/services/line-liff.client";

vi.mock("@/lib/services/line-liff.client", () => ({
  isLineLiffConfigured: () => true,
  recoverLinePassport: vi.fn(),
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

  it("uses the shared LIFF client after explicit consent", async () => {
    vi.mocked(recoverLinePassport).mockResolvedValue({ status: "recovered" });
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });

    render(<LineRecoveryPanel />);
    fireEvent.click(screen.getByRole("checkbox", { name: /ยินยอมให้ระบบเชื่อมบัญชี LINE/ }));
    fireEvent.click(screen.getByRole("button", { name: "กู้คืนพาสปอร์ตด้วย LINE" }));

    expect(recoverLinePassport).toHaveBeenCalledWith({ hasConsented: true, language: "th" });
  });
});
