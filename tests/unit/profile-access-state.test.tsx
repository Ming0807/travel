import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileAccessState } from "../../components/profile/ProfileAccessState";

describe("ProfileAccessState", () => {
  it("explains browser-scoped guest identity and offers real recovery actions", () => {
    render(<ProfileAccessState kind="no_identity" />);

    expect(screen.getByRole("heading", { name: "ยังไม่พบพาสปอร์ตบนเบราว์เซอร์นี้" })).toBeVisible();
    expect(screen.getByText(/LINE, Chrome, Safari/)).toBeVisible();
    expect(screen.getByRole("link", { name: "เข้าสู่ระบบเพื่อค้นหาโปรไฟล์ที่เชื่อมไว้" })).toHaveAttribute("href", "/auth/login?next=%2Fprofile");
    expect(screen.getByRole("link", { name: "เริ่มเช็กอินสถานที่" })).toHaveAttribute("href", "/attractions");
  });

  it("preserves user confidence during a load failure", () => {
    render(<ProfileAccessState kind="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("ข้อมูลของคุณไม่ได้ถูกลบหรือเปลี่ยนแปลง");
    expect(screen.getByRole("link", { name: "ลองโหลดอีกครั้ง" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("link", { name: "ติดต่อทีมงาน" })).toHaveAttribute("href", "/contact");
  });
});
