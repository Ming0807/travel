import { render, screen } from "@testing-library/react";
import { isValidElement, Suspense, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PassportViewModel } from "@/lib/services/passport.service";

const mocks = vi.hoisted(() => ({ passport: vi.fn() }));
vi.mock("@/lib/services/passport.service", () => ({ getCurrentTouristPassport: mocks.passport }));
vi.mock("@/lib/auth/guards", () => ({ TouristAccessError: class extends Error { constructor(public code: string, message: string) { super(message); } } }));
vi.mock("@/components/account/LineRecoveryPanel", () => ({ LineRecoveryPanel: () => <p>เรียกคืนบัญชีเดิม</p> }));
vi.mock("@/components/passport/AccountLinkingTeaser", () => ({ AccountLinkingTeaser: ({ isGuest }: { isGuest: boolean }) => <p>{isGuest ? "เชื่อมบัญชีได้ภายหลัง" : "เชื่อมบัญชีแล้ว"}</p> }));
vi.mock("@/components/layout/SiteFooter", () => ({ SiteFooter: () => <footer /> }));
import PassportPage from "@/app/(tourist)/passport/page";
import { TouristAccessError } from "@/lib/auth/guards";

// Resolve the RSC data boundary explicitly; RTL is a client renderer.
function boundary() {
  const shell = PassportPage().props.children[0];
  return shell.props.children as ReactElement<{ children: ReactElement; fallback: ReactNode }>;
}
async function content() {
  const child = boundary().props.children;
  if (!isValidElement(child) || typeof child.type !== "function") throw new Error("Missing server content boundary");
  return await (child.type as () => Promise<ReactNode>)();
}
const passport: PassportViewModel = { displayName: "เจ้าของพาสปอร์ต", isGuest: true, totalStampsEarned: 0, totalStampTargets: 0, provinceProgress: [], stampsByProvince: [], stampTargetsByProvince: [], recentVisits: [] };

describe("passport server page", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.passport.mockResolvedValue(passport); });

  it("can show the heading and a data skeleton before resolving the owned passport", () => {
    expect(boundary().type).toBe(Suspense);
    const shell = PassportPage().props.children[0];
    render({ ...shell, props: { ...shell.props, children: boundary().props.fallback } });
    expect(screen.getByRole("heading", { level: 1, name: "พาสปอร์ตการเดินทางของฉัน" })).toBeVisible();
    expect(screen.getByRole("status", { name: "กำลังโหลดพาสปอร์ต" })).toBeVisible();
    expect(mocks.passport).not.toHaveBeenCalled();
  });

  it("keeps guest access and optional linking on the ready page", async () => {
    render(await content());
    expect(screen.getByRole("heading", { name: "เจ้าของพาสปอร์ต" })).toBeVisible();
    expect(screen.getByText("เชื่อมบัญชีได้ภายหลัง")).toBeVisible();
    expect(mocks.passport).toHaveBeenCalledTimes(1);
  });

  it("offers venue instructions and existing-account recovery when no identity exists", async () => {
    mocks.passport.mockRejectedValue(new TouristAccessError("TOURIST_IDENTITY_NOT_FOUND", "missing"));
    render(await content());
    expect(screen.getByText("เริ่มสะสมความทรงจำจากยะลา")).toBeVisible();
    expect(screen.getByRole("link", { name: "วิธีสะสมตราประทับ" })).toHaveAttribute("href", "/checkin/try");
    expect(screen.getByText("เรียกคืนบัญชีเดิม")).toBeVisible();
  });

  it("provides a retry without exposing server errors", async () => {
    mocks.passport.mockRejectedValue(new Error("private SQL detail"));
    render(await content());
    expect(screen.getByRole("link", { name: "ลองเปิดพาสปอร์ตอีกครั้ง" })).toHaveAttribute("href", "/passport");
    expect(screen.queryByText(/private SQL/)).not.toBeInTheDocument();
    expect(screen.queryByText("เรียกคืนบัญชีเดิม")).not.toBeInTheDocument();
  });
});
