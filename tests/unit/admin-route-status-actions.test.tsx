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

  it("makes editing the primary action and names secondary commands", () => {
    render(<RouteStatusActions routeId={4} routeName="หน้าถ้ำ" isPublished={false} isActive />);

    expect(screen.getByRole("link", { name: "แก้ไขเส้นทาง" })).toHaveAttribute("href", "/admin/routes/4/edit");
    expect(screen.getByRole("link", { name: "แก้ไขเส้นทาง" })).toHaveClass("min-h-11");
    fireEvent.click(screen.getByText("การดำเนินการอื่น"));
    expect(screen.getByText("การดำเนินการอื่น").closest("summary")).toHaveClass("min-h-11");
    expect(screen.getByRole("link", { name: "จัดการจุดแวะ" })).toHaveAttribute("href", "/admin/routes/4/stops");
    expect(screen.getByRole("link", { name: "จัดการจุดแวะ" })).toHaveClass("min-h-11");
    expect(screen.getByRole("link", { name: "จัดการรูปภาพ" })).toHaveAttribute("href", "/admin/routes/4/media");
    expect(screen.getByRole("button", { name: "เผยแพร่เส้นทาง" })).toHaveClass("min-h-11");
    expect(screen.getByRole("button", { name: "ปิดใช้งานเส้นทาง" })).toHaveClass("min-h-11");
    expect(screen.getByText("เก็บถาวร")).toBeInTheDocument();
    expect(screen.queryByText("ลบออกจากระบบ")).not.toBeInTheDocument();
  });

  it("shows the server error when publishing is refused", async () => {
    mocks.publish.mockResolvedValue({ success: false, error: "ต้องมีจุดแวะ 2 แห่ง" });
    render(<RouteStatusActions routeId={4} routeName="หน้าถ้ำ" isPublished={false} isActive />);
    fireEvent.click(screen.getByText("การดำเนินการอื่น"));
    fireEvent.click(screen.getByRole("button", { name: "เผยแพร่เส้นทาง" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("ต้องมีจุดแวะ 2 แห่ง"));
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("refreshes the list after an activation succeeds", async () => {
    mocks.activate.mockResolvedValue({ success: true });
    render(<RouteStatusActions routeId={4} routeName="หน้าถ้ำ" isPublished={false} isActive={false} />);
    fireEvent.click(screen.getByText("การดำเนินการอื่น"));
    fireEvent.click(screen.getByRole("button", { name: "เปิดใช้งานเส้นทาง" }));
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
  });

  it("shows a recoverable message if the request fails before reaching the server", async () => {
    mocks.publish.mockRejectedValue(new Error("network failure"));
    render(<RouteStatusActions routeId={4} routeName="หน้าถ้ำ" isPublished={false} isActive />);
    fireEvent.click(screen.getByText("การดำเนินการอื่น"));
    fireEvent.click(screen.getByRole("button", { name: "เผยแพร่เส้นทาง" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง"));
  });
});
