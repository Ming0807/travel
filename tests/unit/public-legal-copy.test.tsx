import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout/SiteFooter", () => ({
  SiteFooter: () => <footer data-testid="site-footer" />,
}));

import PrivacyPage from "@/app/(public)/privacy/page";
import TermsPage from "@/app/(public)/terms/page";

describe("public privacy notice", () => {
  it("describes the implemented Yala pilot data lifecycle", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";

    expect(screen.getByRole("heading", { level: 1, name: "นโยบายความเป็นส่วนตัวสำหรับระบบนำร่อง" })).toBeInTheDocument();
    expect(text).toContain("จังหวัดยะลา");
    expect(text).toContain("ชื่อที่แสดง");
    expect(text).toContain("รูปถ่าย");
    expect(text).toContain("แบบสำรวจท่องเที่ยว (ไม่บังคับ)");
    expect(text).toContain("เรื่องราวและรีวิว (ไม่บังคับ)");
    expect(text).toContain("แบบประเมินงานวิจัย");
    expect(text).toContain("Supabase");
    expect(text).toContain("Vercel");
    expect(text).toContain("Cloudinary");
  });

  it("states the actual identity, cookie, storage, leaderboard, and retention boundaries", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";

    expect(text).toContain("1 ปี");
    expect(text).toContain("2 ชั่วโมง");
    expect(text).toContain("30 วัน");
    expect(text).toContain("ค่าเริ่มต้นเป็นส่วนตัว");
    expect(text).toContain("ไม่มีนโยบายลบอัตโนมัติแบบระยะเวลาเดียว");
    expect(text).toContain("ไม่ได้ใช้ IP เป็นตัวตนนักท่องเที่ยว");
    expect(text).toContain("ไม่ใช้การจดจำใบหน้า");
    expect(screen.getByRole("link", { name: "ส่งคำขอเกี่ยวกับข้อมูล" })).toHaveAttribute("href", "/contact");
  });

  it("does not publish unsupported compliance, analytics, retention, or operator claims", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";

    expect(text).not.toContain("Google Analytics");
    expect(text).not.toContain("dpo@southernborder.tourism.go.th");
    expect(text).not.toContain("support@southernborder.tourism.go.th");
    expect(text).not.toContain("5 ปี");
    expect(text).not.toContain("ดำเนินการตามคำขอของคุณภายใน 30 วัน");
    expect(text).not.toContain("มาตรฐานสากลด้านความเป็นส่วนตัว");
    expect(text).not.toContain("ข้อมูลถูกเข้ารหัส");
  });
});

describe("public service terms", () => {
  it("sets accurate expectations for the pilot, rewards, and guest identity", () => {
    const { container } = render(<TermsPage />);
    const text = container.textContent ?? "";

    expect(screen.getByRole("heading", { level: 1, name: "เงื่อนไขการใช้บริการ" })).toBeInTheDocument();
    expect(text).toContain("ระบบนำร่องด้านข้อมูลท่องเที่ยวจังหวัดยะลา");
    expect(text).toContain("ไม่ใช่หลักฐานราชการ");
    expect(text).toContain("ไม่ใช่ระบบจอง");
    expect(text).toContain("บัญชี Google หรือ LINE เป็นทางเลือก");
    expect(text).toContain("คะแนน ตรา และเหรียญไม่มีมูลค่าเป็นเงินสด");
    expect(text).toContain("กระดานผู้นำมีค่าเริ่มต้นเป็นส่วนตัว");
  });

  it("explains content moderation without taking ownership of user content", () => {
    const { container } = render(<TermsPage />);
    const contentRights = container.querySelector("#content-rights");

    expect(contentRights).not.toBeNull();
    expect(contentRights).toHaveTextContent("คุณยังคงเป็นเจ้าของเนื้อหาที่ส่ง");
    expect(contentRights).toHaveTextContent("ตรวจสอบ แก้ไขสถานะ ปฏิเสธ ซ่อน หรือถอดเนื้อหา");
    expect(contentRights).toHaveTextContent("ให้สิทธิโครงการเท่าที่จำเป็น");
    expect(screen.getByRole("link", { name: "อ่านนโยบายความเป็นส่วนตัว" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "ติดต่อโครงการ" })).toHaveAttribute("href", "/contact");
  });

  it("does not claim an unverified operator, blanket ownership, or automatic acceptance", () => {
    const { container } = render(<TermsPage />);
    const text = container.textContent ?? "";

    expect(text).not.toContain("เป็นทรัพย์สินของผู้ให้บริการแพลตฟอร์ม");
    expect(text).not.toContain("เขตอำนาจศาลไทย");
    expect(text).not.toContain("การใช้บริการอย่างต่อเนื่อง");
    expect(text).not.toContain("เราไม่รับผิดชอบต่อความเสียหาย");
  });
});
