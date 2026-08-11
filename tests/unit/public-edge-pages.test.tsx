import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loginFormProps = vi.hoisted(() => vi.fn());

vi.mock("@/components/admin/LoginForm", () => ({
  LoginForm: (props: { redirectTo?: string }) => {
    loginFormProps(props);
    return <div data-testid="admin-login-form" />;
  },
}));

vi.mock("@/components/admin/AdminShell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/admin/AdminPageHeader", () => ({
  AdminPageHeader: ({ title, description }: { title: string; description: string }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  ),
}));

import AdminLoginPage, { metadata as adminLoginMetadata } from "@/app/(admin)/admin/login/page";
import AdminBoundary from "@/app/(admin)/error";
import AdminNotFound from "@/app/(admin)/not-found";
import AdminSectionError from "@/app/(admin)/admin/error";
import PublicError from "@/app/(public)/error";
import GlobalNotFound from "@/app/not-found";

describe("public and admin edge-route UX", () => {
  beforeEach(() => {
    loginFormProps.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("renders a Thai-first global not-found page with recovery actions", () => {
    render(<GlobalNotFound />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "ไม่พบหน้าที่คุณกำลังมองหา" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ดูสถานที่ท่องเที่ยว" })).toHaveAttribute("href", "/attractions");
    expect(screen.getByRole("link", { name: "กลับหน้าแรก" })).toHaveAttribute("href", "/");
    expect(screen.queryByText(/Phase 01|future tourism module|Page not found/i)).not.toBeInTheDocument();
  });

  it("keeps the requested protected destination on the admin login page", async () => {
    render(
      await AdminLoginPage({
        searchParams: Promise.resolve({ redirect: "/admin/settings" }),
      }),
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "เข้าสู่ระบบหลังบ้าน" })).toBeInTheDocument();
    expect(screen.getByTestId("admin-login-form")).toBeInTheDocument();
    expect(loginFormProps).toHaveBeenCalledWith(expect.objectContaining({ redirectTo: "/admin/settings" }));
    expect(screen.getAllByRole("link", { name: "กลับไปหน้าเว็บไซต์" })).toHaveLength(2);
    for (const link of screen.getAllByRole("link", { name: "กลับไปหน้าเว็บไซต์" })) {
      expect(link).toHaveAttribute("href", "/");
    }
    expect(adminLoginMetadata.description).toMatch(/จัดการเนื้อหา.*ข้อมูลการท่องเที่ยว/);
  });

  it("rejects an external admin redirect destination", async () => {
    render(
      await AdminLoginPage({
        searchParams: Promise.resolve({ redirect: "https://example.com/phishing" }),
      }),
    );

    expect(loginFormProps).toHaveBeenCalledWith(expect.objectContaining({ redirectTo: "/admin" }));
  });

  it("renders the admin not-found page in Thai with an admin recovery action", () => {
    render(<AdminNotFound />);

    expect(screen.getByRole("heading", { level: 1, name: "ไม่พบหน้าจัดการนี้" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "กลับหน้าภาพรวม" })).toHaveAttribute("href", "/admin");
    expect(screen.queryByText(/Page Not Found|Return to Overview|requested resource/i)).not.toBeInTheDocument();
  });

  it("gives public route errors a Thai retry path without exposing the raw error", () => {
    const reset = vi.fn();
    render(<PublicError error={new Error("SUPABASE_PRIVATE_DETAIL")} reset={reset} />);

    expect(screen.getByRole("heading", { level: 1, name: "เปิดหน้านี้ไม่สำเร็จ" })).toBeInTheDocument();
    expect(screen.queryByText("SUPABASE_PRIVATE_DETAIL")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ลองโหลดอีกครั้ง" }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("renders permission errors in Thai without exposing implementation details", () => {
    render(
      <AdminBoundary
        error={Object.assign(new Error("FORBIDDEN database detail"), { code: "FORBIDDEN" })}
        reset={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "ไม่มีสิทธิ์เข้าถึง" })).toBeInTheDocument();
    expect(screen.queryByText(/FORBIDDEN database detail|Access Denied|Something went wrong/)).not.toBeInTheDocument();
  });

  it("keeps section errors Thai-first and hides raw server messages", () => {
    const reset = vi.fn();
    render(<AdminSectionError error={new Error("private SQL detail")} reset={reset} />);

    expect(screen.getByRole("heading", { level: 2, name: "เปิดส่วนจัดการนี้ไม่สำเร็จ" })).toBeInTheDocument();
    expect(screen.queryByText(/private SQL detail|Admin Section Error/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ลองโหลดอีกครั้ง" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
