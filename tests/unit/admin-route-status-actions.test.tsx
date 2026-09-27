import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RouteStatusActions } from "@/components/admin/routes/RouteStatusActions";

const mocks = vi.hoisted(() => ({
  publish: vi.fn(),
  activate: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>,
}));
vi.mock("@/app/actions/admin-route-actions", () => ({
  toggleRoutePublishAction: mocks.publish,
  toggleRouteActiveAction: mocks.activate,
}));
vi.mock("@/components/admin/content/CmsArchiveButton", () => ({ CmsArchiveButton: () => null }));

describe("route status actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the server error when publishing is refused", async () => {
    mocks.publish.mockResolvedValue({ success: false, error: "ต้องมีจุดแวะ 2 แห่ง" });
    render(<RouteStatusActions routeId={4} routeName="หน้าถ้ำ" isPublished={false} isActive />);
    fireEvent.click(screen.getByRole("button", { name: "เผยแพร่เส้นทาง" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("ต้องมีจุดแวะ 2 แห่ง"));
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("refreshes the list after an activation succeeds", async () => {
    mocks.activate.mockResolvedValue({ success: true });
    render(<RouteStatusActions routeId={4} routeName="หน้าถ้ำ" isPublished={false} isActive={false} />);
    fireEvent.click(screen.getByRole("button", { name: "เปิดใช้งานเส้นทาง" }));
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
  });

  it("shows a recoverable message if the request fails before reaching the server", async () => {
    mocks.publish.mockRejectedValue(new Error("network failure"));
    render(<RouteStatusActions routeId={4} routeName="หน้าถ้ำ" isPublished={false} isActive />);
    fireEvent.click(screen.getByRole("button", { name: "เผยแพร่เส้นทาง" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง"));
  });
});
