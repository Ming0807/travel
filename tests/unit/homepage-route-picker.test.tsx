import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomepageRoutePicker } from "@/components/admin/content/HomepageRoutePicker";

// ── Hoisted mocks for server actions ──────────────────────────────────────

const { mockSearchRoutesAction, mockGetRoutesBySlugsAction } = vi.hoisted(() => ({
  mockSearchRoutesAction: vi.fn(),
  mockGetRoutesBySlugsAction: vi.fn(),
}));

vi.mock("@/app/actions/admin-content-actions", () => ({
  searchRoutesAction: mockSearchRoutesAction,
  getRoutesBySlugsAction: mockGetRoutesBySlugsAction,
}));

// ── Test data ──────────────────────────────────────────────────────────────

const ROUTE_A = { id: 1, name_th: "เส้นทาง ก", name_en: null, slug: "route-a", is_published: true, is_active: true };
const ROUTE_B = { id: 2, name_th: "เส้นทาง ข", name_en: null, slug: "route-b", is_published: true, is_active: true };
const ROUTE_C = { id: 3, name_th: "เส้นทาง ค", name_en: null, slug: "route-c", is_published: false, is_active: true };

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("HomepageRoutePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [] });
    mockSearchRoutesAction.mockResolvedValue({ success: true, data: [] });
  });

  // ── Renders selected slugs ───────────────────────────────────────────

  it("renders selected slugs from getRoutesBySlugsAction", async () => {
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [ROUTE_A, ROUTE_B] });

    render(<HomepageRoutePicker slugs={["route-a", "route-b"]} onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("เส้นทาง ก")).toBeInTheDocument();
      expect(screen.getByText("เส้นทาง ข")).toBeInTheDocument();
    });
  });

  it("shows empty state when no slugs are selected", async () => {
    render(<HomepageRoutePicker slugs={[]} onChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("ยังไม่มีเส้นทางแนะนำ")).toBeInTheDocument();
    });
  });

  // ── Search returns results and add calls onChange ─────────────────────

  it("search returns results and add calls onChange with slug order", async () => {
    const onChange = vi.fn();
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [ROUTE_A] });
    mockSearchRoutesAction.mockResolvedValue({ success: true, data: [ROUTE_B, ROUTE_C] });

    render(<HomepageRoutePicker slugs={["route-a"]} onChange={onChange} />);

    await waitFor(() => expect(screen.getByText("เส้นทาง ก")).toBeInTheDocument());

    const input = screen.getByRole("combobox");
    await userEvent.type(input, "เส้นทาง");

    await waitFor(() => {
      expect(screen.getByText("เส้นทาง ข")).toBeInTheDocument();
      expect(screen.getByText("เส้นทาง ค")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText("เพิ่ม เส้นทาง ข"));
    expect(onChange).toHaveBeenCalledWith(["route-a", "route-b"]);
  });

  // ── Clearing input while search is in flight ──────────────────────────

  it("clearing input while a search is in flight ignores stale result", async () => {
    const onChange = vi.fn();
    // Create a deferred search that won't resolve until we say so
    const searchDeferred = deferred<{ success: true; data: typeof ROUTE_B[] }>();
    mockSearchRoutesAction.mockReturnValue(searchDeferred.promise);
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [] });

    render(<HomepageRoutePicker slugs={[]} onChange={onChange} />);
    await waitFor(() => expect(screen.queryByText("กำลังโหลด")).not.toBeInTheDocument());

    const input = screen.getByRole("combobox");
    await userEvent.type(input, "เส้");

    // Search is in flight (spinner visible), clear input
    await userEvent.clear(input);

    // Input cleared, no dropdown
    expect(input).toHaveValue("");

    // Now resolve the stale search
    searchDeferred.resolve({ success: true, data: [ROUTE_B] });
    await vi.waitFor(() => expect(mockSearchRoutesAction).toHaveBeenCalled(), { timeout: 100 });

    // Stale data must NOT appear
    expect(screen.queryByText("เส้นทาง ข")).not.toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // ── Escape clears query/results and invalidates stale response ────────

  it("Escape clears query/results and invalidates stale response", async () => {
    const onChange = vi.fn();
    const searchDeferred = deferred<{ success: true; data: typeof ROUTE_B[] }>();
    mockSearchRoutesAction.mockReturnValue(searchDeferred.promise);
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [] });

    render(<HomepageRoutePicker slugs={[]} onChange={onChange} />);
    await waitFor(() => expect(screen.queryByText("กำลังโหลด")).not.toBeInTheDocument());

    const input = screen.getByRole("combobox");
    await userEvent.type(input, "เส้น");
    await userEvent.keyboard("{Escape}");

    expect(input).toHaveValue("");

    searchDeferred.resolve({ success: true, data: [ROUTE_B] });
    await vi.waitFor(() => expect(mockSearchRoutesAction).toHaveBeenCalled(), { timeout: 100 });

    expect(screen.queryByText("เส้นทาง ข")).not.toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // ── Remove and up/down reorder call onChange ──────────────────────────

  it("remove calls onChange with item removed", async () => {
    const onChange = vi.fn();
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [ROUTE_A, ROUTE_B] });

    render(<HomepageRoutePicker slugs={["route-a", "route-b"]} onChange={onChange} />);
    await waitFor(() => expect(screen.getByText("เส้นทาง ข")).toBeInTheDocument());

    await userEvent.click(screen.getByLabelText("นำ เส้นทาง ข ออกจากรายการ"));
    expect(onChange).toHaveBeenCalledWith(["route-a"]);
  });

  it("move up reorders items correctly", async () => {
    const onChange = vi.fn();
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [ROUTE_A, ROUTE_B] });

    render(<HomepageRoutePicker slugs={["route-a", "route-b"]} onChange={onChange} />);
    await waitFor(() => expect(screen.getByText("เส้นทาง ข")).toBeInTheDocument());

    await userEvent.click(screen.getByLabelText("เลื่อน เส้นทาง ข ขึ้น"));
    expect(onChange).toHaveBeenCalledWith(["route-b", "route-a"]);
  });

  it("move down reorders items correctly", async () => {
    const onChange = vi.fn();
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [ROUTE_A, ROUTE_B] });

    render(<HomepageRoutePicker slugs={["route-a", "route-b"]} onChange={onChange} />);
    await waitFor(() => expect(screen.getByText("เส้นทาง ข")).toBeInTheDocument());

    await userEvent.click(screen.getByLabelText("เลื่อน เส้นทาง ก ลง"));
    expect(onChange).toHaveBeenCalledWith(["route-b", "route-a"]);
  });

  // ── Search/load error states ──────────────────────────────────────────

  it("shows search error in Thai when searchRoutesAction fails", async () => {
    const onChange = vi.fn();
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [] });
    mockSearchRoutesAction.mockResolvedValue({ success: false, error: "ค้นหาเส้นทางไม่สำเร็จ" });

    render(<HomepageRoutePicker slugs={[]} onChange={onChange} />);
    await waitFor(() => expect(screen.queryByText("กำลังโหลด")).not.toBeInTheDocument());

    await userEvent.type(screen.getByRole("combobox"), "xxx");

    await waitFor(() => {
      expect(screen.getByText("ค้นหาเส้นทางไม่สำเร็จ")).toBeInTheDocument();
    });
  });

  it("shows load error in Thai when getRoutesBySlugsAction fails", async () => {
    const onChange = vi.fn();
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: false, error: "ไม่สามารถโหลดเส้นทางที่เลือกไว้ได้" });

    render(<HomepageRoutePicker slugs={["route-a"]} onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText("ไม่สามารถโหลดเส้นทางที่เลือกไว้ได้")).toBeInTheDocument();
    });
  });

  // ── Race condition: rapid typing ignores intermediate results ─────────

  it("rapid typing ignores stale intermediate results", async () => {
    const onChange = vi.fn();
    mockGetRoutesBySlugsAction.mockResolvedValue({ success: true, data: [] });

    const deferredA = deferred<{ success: true; data: typeof ROUTE_A[] }>();
    const deferredAB = deferred<{ success: true; data: typeof ROUTE_B[] }>();
    const deferredABC = deferred<{ success: true; data: typeof ROUTE_C[] }>();

    mockSearchRoutesAction
      .mockReturnValueOnce(deferredA.promise)
      .mockReturnValueOnce(deferredAB.promise)
      .mockReturnValueOnce(deferredABC.promise);

    render(<HomepageRoutePicker slugs={[]} onChange={onChange} />);
    await waitFor(() => expect(screen.queryByText("กำลังโหลด")).not.toBeInTheDocument());

    const input = screen.getByRole("combobox");
    await userEvent.type(input, "abc");

    // Resolve last search first (abc → ROUTE_C)
    deferredABC.resolve({ success: true, data: [ROUTE_C] });
    await waitFor(() => {
      expect(screen.getByText("เส้นทาง ค")).toBeInTheDocument();
    });

    // Now resolve stale search for "ab" — must NOT overwrite
    deferredAB.resolve({ success: true, data: [ROUTE_B] });
    // Small wait to flush any React updates
    await vi.waitFor(() => {}, { timeout: 50 });

    expect(screen.getByText("เส้นทาง ค")).toBeInTheDocument();
    expect(screen.queryByText("เส้นทาง ข")).not.toBeInTheDocument();

    // Resolve stale search for "a" — must NOT overwrite
    deferredA.resolve({ success: true, data: [ROUTE_A] });
    await vi.waitFor(() => {}, { timeout: 50 });

    expect(screen.getByText("เส้นทาง ค")).toBeInTheDocument();
    expect(screen.queryByText("เส้นทาง ก")).not.toBeInTheDocument();
  });
});
