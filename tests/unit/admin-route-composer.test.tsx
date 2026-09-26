import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RouteForm } from "@/components/admin/routes/RouteForm";
import { RouteStopsManager } from "@/components/admin/routes/RouteStopsManager";
import { RouteVisualEditor } from "@/components/admin/routes/visual-editor/RouteVisualEditor";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import type { AdminRouteRow, AdminRouteStopRow } from "@/lib/repositories/admin-route.repository";

const mocks = vi.hoisted(() => ({
  createRouteAction: vi.fn(),
  updateRouteAction: vi.fn(),
  updateRouteStopsAction: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string; [key: string]: unknown }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock("@/app/actions/admin-route-actions", () => ({
  createRouteAction: mocks.createRouteAction,
  updateRouteAction: mocks.updateRouteAction,
  updateRouteStopsAction: mocks.updateRouteStopsAction,
}));

const route: AdminRouteRow = {
  route_id: 12,
  slug: "betong-day-trip",
  name_th: "เส้นทางเบตง",
  name_en: "Betong Day Trip",
  description_th: "เส้นทางตัวอย่าง",
  description_en: "Sample route",
  is_published: false,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
  stop_count: 2,
};

const attraction = (id: number, name: string, coverImageUrl?: string): AdminAttractionRow & { coverImageUrl?: string } => ({
  attraction_id: id,
  province_id: 1,
  district_id: null,
  attraction_type_id: null,
  slug: `attraction-${id}`,
  name_th: name,
  name_en: null,
  short_description_th: null,
  short_description_en: null,
  description_th: null,
  description_en: null,
  history_th: null,
  history_en: null,
  latitude: null,
  longitude: null,
  address_text: null,
  opening_hours: null,
  contact_info: null,
  travel_tips_th: null,
  travel_tips_en: null,
  how_to_get_there_th: null,
  how_to_get_there_en: null,
  custom_sections_json: null,
  sustainability_category: null,
  estimated_capacity_per_day: null,
  is_published: true,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
  province_name_th: "ยะลา",
  district_name_th: null,
  attraction_type_name_th: null,
  attraction_type_names_th: [],
  photo_spot_count: 0,
  checkin_code_count: 0,
  coverImageUrl,
});

const attractions = [attraction(1, "หาดทรายขาว", "/media/beach.webp"), attraction(2, "น้ำตกศรีพังงา")];

const stops: AdminRouteStopRow[] = [
  { stop_id: 1, route_id: 12, attraction_id: 1, day_number: 1, display_order: 1, stop_note_th: "พักชมวิว", stop_note_en: "View break", attraction_name_th: "หาดทรายขาว" },
  { stop_id: 2, route_id: 12, attraction_id: 2, day_number: 1, display_order: 2, stop_note_th: "เตรียมรองเท้าสบาย", stop_note_en: "Wear comfortable shoes", attraction_name_th: "น้ำตกศรีพังงา" },
];

describe("admin route composer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createRouteAction.mockResolvedValue({ success: false });
    mocks.updateRouteAction.mockResolvedValue({ success: false });
    mocks.updateRouteStopsAction.mockResolvedValue({ success: false });
  });

  it("creates a draft without exposing a publish switch", () => {
    render(<RouteForm />);

    expect(screen.getByRole("button", { name: "สร้างฉบับร่าง" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /เผยแพร่|published/i })).not.toBeInTheDocument();
    expect(document.querySelector<HTMLInputElement>('input[name="isPublished"]')?.value).toBe("false");
  });

  it("keeps current status values unchanged in the metadata form", () => {
    render(<RouteForm initialData={{ ...route, is_published: true, is_active: false }} />);

    expect(document.querySelector<HTMLInputElement>('input[name="isPublished"]')?.value).toBe("true");
    expect(document.querySelector<HTMLInputElement>('input[name="isActive"]')?.value).toBe("false");
    expect(screen.queryByRole("checkbox", { name: /เผยแพร่|published|เปิดใช้งาน|active/i })).not.toBeInTheDocument();
  });

  it("does not mark a route cover ready from its slug alone", () => {
    render(<RouteForm initialData={route} coverMediaUrl={null} />);

    expect(screen.getByText("ยังไม่มีรูปภาพปกที่เชื่อมโยงกับเส้นทางนี้")).toBeInTheDocument();
  });

  it("offers searchable eligible attractions and removes a selected one from add options", () => {
    render(<RouteStopsManager routeId={12} initialStops={[stops[0]]} attractions={attractions} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "ค้นหาสถานที่ท่องเที่ยว" }), { target: { value: "น้ำตก" } });
    const addButton = screen.getByRole("button", { name: "เพิ่ม น้ำตกศรีพังงา วันที่ 1" });
    fireEvent.click(addButton);

    expect(screen.queryByRole("button", { name: "เพิ่ม น้ำตกศรีพังงา วันที่ 1" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "น้ำตกศรีพังงา" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "หาดทรายขาว" })).toHaveAttribute("src", "/media/beach.webp");
  });

  it("counts distinct eligible stops toward the server publication threshold", () => {
    render(
      <RouteStopsManager
        routeId={12}
        initialStops={[stops[0], { ...stops[0], stop_id: 3, display_order: 2 }]}
        attractions={attractions}
      />
    );

    expect(screen.getByText("มีจุดแวะที่เข้าเกณฑ์อย่างน้อย 2 แห่ง")).toHaveClass("text-amber-900");
    expect(screen.getByText(/พบ 1\/2 แห่ง/)).toBeInTheDocument();
  });

  it("reorders by controls without a display-order field and preserves day and notes", () => {
    render(<RouteStopsManager routeId={12} initialStops={stops} attractions={attractions} />);

    expect(screen.queryByLabelText(/ลำดับในวัน|display order/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "เลื่อนน้ำตกศรีพังงาขึ้น" }));

    const serialized = document.querySelector<HTMLInputElement>('input[name="stops"]')?.value;
    const submittedStops = JSON.parse(serialized ?? "[]") as Array<Record<string, unknown>>;
    expect(submittedStops.map((stop) => stop.attractionId)).toEqual([2, 1]);
    expect(submittedStops.every((stop) => stop.dayNumber === 1)).toBe(true);
    expect(submittedStops.find((stop) => stop.attractionId === 2)).toMatchObject({
      stopNoteTh: "เตรียมรองเท้าสบาย",
      stopNoteEn: "Wear comfortable shoes",
    });
  });

  it("shows the Basics, Stops, Cover, and Review workspaces together", () => {
    render(
      <RouteVisualEditor
        route={route}
        coverMediaUrl={null}
        stops={stops}
        attractions={attractions}
      />
    );

    const sections = [
      { label: "ข้อมูลหลัก", id: "basics" },
      { label: "จุดแวะ", id: "stops" },
      { label: "รูปปก", id: "cover" },
      { label: "ตรวจสอบ", id: "review" },
    ];
    for (const section of sections) {
      expect(screen.getByRole("link", { name: section.label })).toHaveAttribute("href", `#${section.id}`);
      expect(document.getElementById(section.id)).toBeInTheDocument();
    }
  });
});
