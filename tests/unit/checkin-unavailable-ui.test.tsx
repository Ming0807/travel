import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";

describe("CheckinUnavailable", () => {
  it("guides NFC visitors back to the physical tag without creating a QR bypass", () => {
    const { container } = render(<CheckinUnavailable status="nfc_unavailable" />);
    expect(screen.getByRole("heading", { name: "ยังเช็กอินผ่าน NFC ไม่สำเร็จ" })).toBeInTheDocument();
    expect(screen.getByText("NFC CHECK-IN")).toBeInTheDocument();
    expect(screen.getByText(/สแกน QR จากป้ายประจำจุดเช็กอิน/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "แจ้งปัญหา NFC" })).toHaveAttribute("href", "/contact");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="/c/"], a[href^="/checkin/"]')).toBeNull();
  });
  it("offers a clear recovery path for an unknown QR code", () => {
    const { container } = render(<CheckinUnavailable status="not_found" />);

    expect(screen.getByRole("heading", { level: 1, name: "ไม่พบ QR Code นี้" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ตรวจสอบ QR อีกครั้ง" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "กลับหน้าหลัก" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "แจ้งปัญหา QR" })).toHaveAttribute("href", "/contact");
    expect(container.querySelector(".rounded-3xl")).not.toBeInTheDocument();
    expect(container.querySelector("[class*='blur-[']")).not.toBeInTheDocument();
  });

  it("does not show a misleading retry action when a QR code is inactive", () => {
    render(<CheckinUnavailable status="inactive" />);

    expect(screen.getByRole("heading", { level: 1, name: "QR Code ยังไม่เปิดใช้งาน" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ตรวจสอบ QR อีกครั้ง" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "แจ้งปัญหา QR" })).toBeInTheDocument();
  });
});
