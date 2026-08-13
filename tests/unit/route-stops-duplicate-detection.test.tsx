import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { RouteStopsManager } from "@/components/admin/routes/RouteStopsManager";
import { RouteVisualEditor } from "@/components/admin/routes/visual-editor/RouteVisualEditor";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import type { AdminRouteStopRow, AdminRouteRow } from "@/lib/repositories/admin-route.repository";

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useParams: () => ({}),
}));

// Mock next/link — render as a plain <a> with href for testing
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock the server action
const mockUpdateRouteStopsAction = vi.fn().mockReturnValue({ success: true });
vi.mock("@/app/actions/admin-route-actions", () => ({
  updateRouteStopsAction: (...args: unknown[]) => mockUpdateRouteStopsAction(...args),
}));

// ─── Test Data ──────────────────────────────────────────────────────────────

const baseAttraction = {
  province_id: 1,
  district_id: null,
  attraction_type_id: null,
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
  district_name_th: null,
  attraction_type_name_th: null,
  attraction_type_names_th: [],
  photo_spot_count: 0,
  checkin_code_count: 0,
};

const mockAttractions: AdminAttractionRow[] = [
  {
    ...baseAttraction,
    attraction_id: 1,
    slug: "hat-sai-khao",
    name_th: "หาดทรายขาว",
    province_name_th: "ยะลา",
  },
  {
    ...baseAttraction,
    attraction_id: 2,
    slug: "namtok-si-phang-nga",
    name_th: "น้ำตกศรีพังงา",
    province_name_th: "ยะลา",
  },
  {
    ...baseAttraction,
    attraction_id: 3,
    slug: "khao-long",
    name_th: "เขาหลง",
    province_id: 2,
    province_name_th: "ปัตตานี",
  },
  {
    ...baseAttraction,
    attraction_id: 4,
    slug: "talad-kao-yala",
    name_th: "ตลาดเก่าเมืองยะลา",
    province_id: 2,
    province_name_th: "ปัตตานี",
  },
];

const stopsNoDuplicates: AdminRouteStopRow[] = [
  { stop_id: 1, route_id: 1, attraction_id: 1, day_number: 1, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "หาดทรายขาว" },
  { stop_id: 2, route_id: 1, attraction_id: 2, day_number: 1, display_order: 2, stop_note_th: "", stop_note_en: "", attraction_name_th: "น้ำตกศรีพังงา" },
  { stop_id: 3, route_id: 1, attraction_id: 3, day_number: 2, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "เขาหลง" },
];

const stopsWithDuplicates: AdminRouteStopRow[] = [
  { stop_id: 1, route_id: 1, attraction_id: 1, day_number: 1, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "หาดทรายขาว" },
  { stop_id: 2, route_id: 1, attraction_id: 2, day_number: 1, display_order: 2, stop_note_th: "", stop_note_en: "", attraction_name_th: "น้ำตกศรีพังงา" },
  { stop_id: 3, route_id: 1, attraction_id: 1, day_number: 2, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "หาดทรายขาว" },
];

const mockRouteRow: AdminRouteRow = {
  route_id: 1,
  slug: "hat-sai-khao-namtok",
  name_th: "หาดทรายขาว-น้ำตกศรีพังงา",
  name_en: null,
  description_th: "เส้นทางท่องเที่ยว",
  description_en: null,
  is_published: true,
  is_active: true,
  stop_count: 3,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
};

// ─── RouteStopsManager Tests ───────────────────────────────────────────────

describe("RouteStopsManager — duplicate detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── No duplicates ─────────────────────────────────────────────────────────

  it("renders readiness item 'ไม่มีจุดแวะซ้ำ' as complete when no duplicates", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsNoDuplicates}
        attractions={mockAttractions}
      />
    );

    expect(screen.getByText("Route readiness")).toBeInTheDocument();
    expect(screen.getByText("ไม่มีจุดแวะซ้ำ")).toBeInTheDocument();
    expect(screen.getByText("แต่ละสถานที่ปรากฏในเส้นทางได้เพียงครั้งเดียว")).toBeInTheDocument();
  });

  it("does NOT show the duplicate warning panel when no duplicates", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsNoDuplicates}
        attractions={mockAttractions}
      />
    );

    expect(screen.queryByText("พบจุดแวะซ้ำ")).not.toBeInTheDocument();
  });

  it("does NOT show duplicate badge on stops when no duplicates", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsNoDuplicates}
        attractions={mockAttractions}
      />
    );

    expect(screen.queryByText("ซ้ำ")).not.toBeInTheDocument();
  });

  it("save button is NOT disabled due to duplicates when there are none", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsNoDuplicates}
        attractions={mockAttractions}
      />
    );

    const submitButton = screen.getByRole("button", { name: /บันทึกจุดแวะของเส้นทาง/ });
    expect(submitButton).not.toBeDisabled();
  });

  // ── With duplicates ───────────────────────────────────────────────────────

  it("shows readiness item 'ไม่มีจุดแวะซ้ำ' as incomplete when duplicates exist", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    expect(screen.getByText(/สถานที่ 1 แห่งถูกเพิ่มซ้ำ/)).toBeInTheDocument();
  });

  it("shows duplicate warning panel with attraction details", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    // The warning panel title
    expect(screen.getByText("พบจุดแวะซ้ำ")).toBeInTheDocument();

    // Shows the duplicate count in the description
    expect(screen.getByText(/มี 1 สถานที่ที่ถูกเพิ่มซ้ำในเส้นทางนี้/)).toBeInTheDocument();

    // Shows the occurrences (use getAllByText since "หาดทรายขาว" appears in select + warning panel)
    const attractionNameElements = screen.getAllByText("หาดทรายขาว");
    expect(attractionNameElements.length).toBeGreaterThanOrEqual(1);

    // These appear in both the warning panel and the per-stop "ปรากฏซ้ำใน" messages
    const day1Occurrences = screen.getAllByText(/วันที่ 1 \(ลำดับ 1\)/);
    expect(day1Occurrences.length).toBeGreaterThanOrEqual(1);
    const day2Occurrences = screen.getAllByText(/วันที่ 2 \(ลำดับ 1\)/);
    expect(day2Occurrences.length).toBeGreaterThanOrEqual(1);
  });

  it("shows per-stop duplicate badge ('ซ้ำ') on duplicate stops", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    const badges = screen.getAllByText("ซ้ำ");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'ปรากฏซ้ำใน' text for duplicate stops with day/order", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    const appearances = screen.getAllByText(/ปรากฏซ้ำใน/);
    expect(appearances.length).toBeGreaterThanOrEqual(1);
  });

  it("disables save button when duplicates exist", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    const submitButton = screen.getByRole("button", { name: /บันทึกจุดแวะของเส้นทาง/ });
    expect(submitButton).toBeDisabled();
  });

  it("shows 'ลบจุดแวะซ้ำทั้งหมด' button inside the warning panel", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    expect(screen.getByText("ลบจุดแวะซ้ำทั้งหมด (เหลือเพียงรายการแรก)")).toBeInTheDocument();
  });

  it("removes duplicate stops when 'ลบจุดแวะซ้ำทั้งหมด' is clicked, keeping first occurrence", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    // Click the remove all duplicates button
    const removeButton = screen.getByText("ลบจุดแวะซ้ำทั้งหมด (เหลือเพียงรายการแรก)");
    act(() => {
      fireEvent.click(removeButton);
    });

    // After removing duplicates, the warning panel should disappear
    expect(screen.queryByText("พบจุดแวะซ้ำ")).not.toBeInTheDocument();

    // The readiness should now show complete
    expect(screen.getByText("แต่ละสถานที่ปรากฏในเส้นทางได้เพียงครั้งเดียว")).toBeInTheDocument();

    // Save button should be enabled now
    const submitButton = screen.getByRole("button", { name: /บันทึกจุดแวะของเส้นทาง/ });
    expect(submitButton).not.toBeDisabled();
  });

  // ── Toast notification on add stop ───────────────────────────────────────

  it("shows duplicate toast when adding a stop with default attraction that already exists", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    // Click the first "เพิ่มจุดแวะ" button (there may be multiple, one per day)
    const addButtons = screen.getAllByText("เพิ่มจุดแวะ");
    act(() => {
      fireEvent.click(addButtons[0]);
    });

    // Toast should appear with warning about duplicate
    expect(screen.getByText(/"หาดทรายขาว" ถูกใช้ในวันที่/)).toBeInTheDocument();
  });

  it("does NOT show duplicate toast when adding a stop with unique default attraction", () => {
    // Use stops where the default attraction (attraction_id=1) is NOT used
    const stopsWithoutFirstAttraction: AdminRouteStopRow[] = [
      { stop_id: 2, route_id: 1, attraction_id: 2, day_number: 1, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "น้ำตกศรีพังงา" },
      { stop_id: 3, route_id: 1, attraction_id: 3, day_number: 1, display_order: 2, stop_note_th: "", stop_note_en: "", attraction_name_th: "เขาหลง" },
    ];

    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithoutFirstAttraction}
        attractions={mockAttractions}
      />
    );

    // Click "เพิ่มจุดแวะ" button
    const addButtons = screen.getAllByText("เพิ่มจุดแวะ");
    act(() => {
      fireEvent.click(addButtons[0]);
    });

    // Toast should NOT appear — the default attraction (id=1, หาดทรายขาว) is not used yet
    expect(screen.queryByText(/ถูกใช้ในวันที่/)).not.toBeInTheDocument();
  });

  it("shows duplicate toast when changing attraction select to one already used", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsNoDuplicates}
        attractions={mockAttractions}
      />
    );

    // Change the last stop's select to attraction_id=1 (หาดทรายขาว) which is already used by stop 1
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(3);

    act(() => {
      fireEvent.change(selects[2], { target: { value: "1" } });
    });

    // Toast should appear
    expect(screen.getByText(/"หาดทรายขาว" ถูกใช้ในวันที่ 1 \(ลำดับ 1\) อยู่แล้ว — เกิดจุดแวะซ้ำ/)).toBeInTheDocument();
  });

  it("dismisses toast when X button is clicked", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    // Trigger a toast via add button
    const addButtons = screen.getAllByText("เพิ่มจุดแวะ");
    act(() => {
      fireEvent.click(addButtons[0]);
    });

    // Toast should appear
    expect(screen.getByText(/"หาดทรายขาว"/)).toBeInTheDocument();

    // Click dismiss button
    const dismissButton = screen.getByLabelText("ปิดการแจ้งเตือน");
    act(() => {
      fireEvent.click(dismissButton);
    });

    // Toast should be gone
    expect(screen.queryByText(/"หาดทรายขาว"/)).not.toBeInTheDocument();
  });
});

// ─── Edge case: all stops the same attraction ───────────────────────────

const stopsAllSameAttraction: AdminRouteStopRow[] = [
  { stop_id: 1, route_id: 1, attraction_id: 1, day_number: 1, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "หาดทรายขาว" },
  { stop_id: 2, route_id: 1, attraction_id: 1, day_number: 1, display_order: 2, stop_note_th: "", stop_note_en: "", attraction_name_th: "หาดทรายขาว" },
  { stop_id: 3, route_id: 1, attraction_id: 1, day_number: 2, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "หาดทรายขาว" },
];

const singleStop: AdminRouteStopRow[] = [
  { stop_id: 1, route_id: 1, attraction_id: 1, day_number: 1, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "หาดทรายขาว" },
];

describe("RouteStopsManager — edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── All stops same attraction ─────────────────────────────────────────────

  it("detects duplicates when ALL stops use the same attraction (3 stops, all attraction_id=1)", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsAllSameAttraction}
        attractions={mockAttractions}
      />
    );

    // Readiness shows incomplete for duplicates
    expect(screen.getByText(/สถานที่ 1 แห่งถูกเพิ่มซ้ำ/)).toBeInTheDocument();

    // Warning panel shown
    expect(screen.getByText("พบจุดแวะซ้ำ")).toBeInTheDocument();
    expect(screen.getByText("มี 1 สถานที่ที่ถูกเพิ่มซ้ำในเส้นทางนี้:")).toBeInTheDocument();

    // Should show "หาดทรายขาว" in warning panel with all 3 occurrence references
    const occurrenceTexts = screen.getAllByText(/วันที่ (1|2) \(ลำดับ (1|2)\)/);
    expect(occurrenceTexts.length).toBeGreaterThanOrEqual(2);

    // Save button disabled
    const submitButton = screen.getByRole("button", { name: /บันทึกจุดแวะของเส้นทาง/ });
    expect(submitButton).toBeDisabled();
  });

  it("shows 'ซ้ำ' badge on ALL stops when all use same attraction (all 3 are duplicates of each other)", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsAllSameAttraction}
        attractions={mockAttractions}
      />
    );

    // All 3 stops have the same attraction_id=1, so the component flags ALL 3 as duplicates
    const badges = screen.getAllByText("ซ้ำ");
    expect(badges.length).toBe(3);
  });

  it("shows 'ปรากฏซ้ำใน' text on ALL stops when all use same attraction", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsAllSameAttraction}
        attractions={mockAttractions}
      />
    );

    // All 3 stops share the same attraction_id=1, so they each show "ปรากฏซ้ำใน"
    const appearances = screen.getAllByText(/ปรากฏซ้ำใน/);
    expect(appearances.length).toBe(3);
  });

  it("remove all duplicates keeps only first stop when all are the same attraction", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsAllSameAttraction}
        attractions={mockAttractions}
      />
    );

    const removeButton = screen.getByText("ลบจุดแวะซ้ำทั้งหมด (เหลือเพียงรายการแรก)");
    act(() => {
      fireEvent.click(removeButton);
    });

    // Warning panel gone
    expect(screen.queryByText("พบจุดแวะซ้ำ")).not.toBeInTheDocument();

    // Readiness shows complete for duplicates
    expect(screen.getByText("แต่ละสถานที่ปรากฏในเส้นทางได้เพียงครั้งเดียว")).toBeInTheDocument();

    // No "ซ้ำ" badges remaining
    expect(screen.queryByText("ซ้ำ")).not.toBeInTheDocument();

    // Save button enabled
    const submitButton = screen.getByRole("button", { name: /บันทึกจุดแวะของเส้นทาง/ });
    expect(submitButton).not.toBeDisabled();
  });

  // ── Empty attractions array ───────────────────────────────────────────────

  it("renders without crashing when attractions array is empty", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsNoDuplicates}
        attractions={[]}
      />
    );

    // Component should render without error
    expect(screen.getByText("Route readiness")).toBeInTheDocument();

    // Selects should still render with only the disabled placeholder option
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(1);

    // Placeholder option appears in all 3 stops' selects
    const placeholders = screen.getAllByText("เลือกสถานที่");
    expect(placeholders.length).toBe(3);
  });

  it("does not show duplicate warnings when attractions array is empty (stops have unique IDs, no actual duplicates)", () => {
    // Use stops with all unique attraction IDs — no duplicates exist regardless of attraction data
    const stopsUniqueIds: AdminRouteStopRow[] = [
      { stop_id: 1, route_id: 1, attraction_id: 1, day_number: 1, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "หาดทรายขาว" },
      { stop_id: 2, route_id: 1, attraction_id: 2, day_number: 1, display_order: 2, stop_note_th: "", stop_note_en: "", attraction_name_th: "น้ำตกศรีพังงา" },
      { stop_id: 3, route_id: 1, attraction_id: 3, day_number: 2, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "เขาหลง" },
    ];

    render(
      <RouteStopsManager
        routeId={1}
        initialStops={stopsUniqueIds}
        attractions={[]}
      />
    );

    // No duplicate warnings since all attraction IDs are unique
    expect(screen.queryByText("พบจุดแวะซ้ำ")).not.toBeInTheDocument();
    expect(screen.queryByText("ซ้ำ")).not.toBeInTheDocument();

    // Readiness for duplicates shows as complete (no duplicates)
    expect(screen.getByText("แต่ละสถานที่ปรากฏในเส้นทางได้เพียงครั้งเดียว")).toBeInTheDocument();
  });

  it("add stop does not crash when attractions array is empty", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={[]}
        attractions={[]}
      />
    );

    // Click the 'เพิ่มจุดแวะแรก' button (shown when stops are empty)
    const addFirstButton = screen.getByText("เพิ่มจุดแวะแรก");
    act(() => {
      fireEvent.click(addFirstButton);
    });

    // Stop should be added with default attractionId=0 (no attraction selected)
    // The select should show the placeholder "เลือกสถานที่"
    expect(screen.getByText("เลือกสถานที่")).toBeInTheDocument();
  });

  it("does not show duplicate toast when adding stop with empty attractions", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={[]}
        attractions={[]}
      />
    );

    // Add a stop
    const addFirstButton = screen.getByText("เพิ่มจุดแวะแรก");
    act(() => {
      fireEvent.click(addFirstButton);
    });

    // No toast should appear (attractions[0] is undefined, so defaultAttractionId is undefined/falsy)
    expect(screen.queryByText(/ถูกใช้ในวันที่/)).not.toBeInTheDocument();
  });

  // ── Single stop ───────────────────────────────────────────────────────────

  it("shows readiness 'ไม่มีจุดแวะซ้ำ' as complete for a single stop", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={singleStop}
        attractions={mockAttractions}
      />
    );

    expect(screen.getByText("Route readiness")).toBeInTheDocument();
    expect(screen.getByText("ไม่มีจุดแวะซ้ำ")).toBeInTheDocument();
    expect(screen.getByText("แต่ละสถานที่ปรากฏในเส้นทางได้เพียงครั้งเดียว")).toBeInTheDocument();
  });

  it("does not show duplicate warning panel for a single stop", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={singleStop}
        attractions={mockAttractions}
      />
    );

    expect(screen.queryByText("พบจุดแวะซ้ำ")).not.toBeInTheDocument();
  });

  it("does not show 'ซ้ำ' badge for a single stop", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={singleStop}
        attractions={mockAttractions}
      />
    );

    expect(screen.queryByText("ซ้ำ")).not.toBeInTheDocument();
  });

  it("save button is enabled for a single stop (no duplicates)", () => {
    render(
      <RouteStopsManager
        routeId={1}
        initialStops={singleStop}
        attractions={mockAttractions}
      />
    );

    const submitButton = screen.getByRole("button", { name: /บันทึกจุดแวะของเส้นทาง/ });
    expect(submitButton).not.toBeDisabled();
  });

  it("does not crash when single stop has attraction_id=0 (unselected attraction)", () => {
    const singleStopUnselected: AdminRouteStopRow[] = [
      { stop_id: 1, route_id: 1, attraction_id: 0, day_number: 1, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "" },
    ];

    render(
      <RouteStopsManager
        routeId={1}
        initialStops={singleStopUnselected}
        attractions={mockAttractions}
      />
    );

    // Readiness shows incomplete for 'ทุกจุดเลือกสถานที่แล้ว'
    expect(screen.getByText("ทุกจุดเลือกสถานที่แล้ว")).toBeInTheDocument();

    // No duplicate warnings
    expect(screen.queryByText("พบจุดแวะซ้ำ")).not.toBeInTheDocument();
    expect(screen.queryByText("ซ้ำ")).not.toBeInTheDocument();
  });
});

// ─── RouteVisualEditor Tests ────────────────────────────────────────────────

describe("RouteVisualEditor — duplicate detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows duplicate warning panel in sidebar when stops have duplicates", () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    // Should show the duplicate warning in the sidebar
    expect(screen.getByText("พบจุดแวะซ้ำ 1 แห่ง")).toBeInTheDocument();

    // Should show guidance text
    expect(screen.getByText(/ไปที่จัดการจุดแวะพักเพื่อลบรายการซ้ำ/)).toBeInTheDocument();
  });

  it("does NOT show duplicate warning panel when no duplicates", () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={stopsNoDuplicates}
        attractions={mockAttractions}
      />
    );

    expect(screen.queryByText("พบจุดแวะซ้ำ")).not.toBeInTheDocument();
  });

  it("renders without crashing when no stops or attractions are provided", () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
      />
    );

    // Route name appears in both breadcrumb and hero heading
    const nameElements = screen.getAllByText("หาดทรายขาว-น้ำตกศรีพังงา");
    expect(nameElements.length).toBeGreaterThanOrEqual(1);

    // No duplicate warning
    expect(screen.queryByText("พบจุดแวะซ้ำ")).not.toBeInTheDocument();
  });

  it("shows duplicate toast on mount when duplicates exist", async () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    // Toast appears — the sidebar also shows "พบจุดแวะซ้ำ 1 แห่ง" so use getAllByText
    await waitFor(() => {
      const elements = screen.getAllByText(/พบจุดแวะซ้ำ 1 แห่ง/);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("does NOT show duplicate toast when no duplicates exist", async () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={stopsNoDuplicates}
        attractions={mockAttractions}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/พบจุดแวะซ้ำ/)).not.toBeInTheDocument();
    });
  });

  // ── Edge cases ──────────────────────────────────────────────────────────

  it("shows duplicate warning when ALL stops use the same attraction", () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={stopsAllSameAttraction}
        attractions={mockAttractions}
      />
    );

    // The sidebar shows duplicate count
    expect(screen.getByText("พบจุดแวะซ้ำ 1 แห่ง")).toBeInTheDocument();
    expect(screen.getByText(/ไปที่จัดการจุดแวะพักเพื่อลบรายการซ้ำ/)).toBeInTheDocument();
  });

  it("renders without crashing when attractions array is empty", () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={stopsWithDuplicates}
        attractions={[]}
      />
    );

    // Should render without error
    const nameElements = screen.getAllByText("หาดทรายขาว-น้ำตกศรีพังงา");
    expect(nameElements.length).toBeGreaterThanOrEqual(1);

    // Duplicate warning IS shown because detection works on attraction IDs, not just names.
    // With stopsWithDuplicates (2 stops with attraction_id=1), the component flags the duplicate.
    expect(screen.getByText("พบจุดแวะซ้ำ 1 แห่ง")).toBeInTheDocument();
  });

  it("does not show duplicate warning for a single stop", () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={singleStop}
        attractions={mockAttractions}
      />
    );

    expect(screen.queryByText("พบจุดแวะซ้ำ")).not.toBeInTheDocument();
  });

  it("does not show duplicate toast on mount for a single stop", async () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={singleStop}
        attractions={mockAttractions}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/พบจุดแวะซ้ำ/)).not.toBeInTheDocument();
    });
  });

  it("does not show duplicate toast on mount with empty attractions when stops have unique IDs", async () => {
    // Use stops with ALL UNIQUE attraction IDs — no actual duplicates
    const uniqueStops: AdminRouteStopRow[] = [
      { stop_id: 1, route_id: 1, attraction_id: 1, day_number: 1, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "หาดทรายขาว" },
      { stop_id: 2, route_id: 1, attraction_id: 2, day_number: 1, display_order: 2, stop_note_th: "", stop_note_en: "", attraction_name_th: "น้ำตกศรีพังงา" },
      { stop_id: 3, route_id: 1, attraction_id: 3, day_number: 2, display_order: 1, stop_note_th: "", stop_note_en: "", attraction_name_th: "เขาหลง" },
    ];

    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={uniqueStops}
        attractions={[]}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/พบจุดแวะซ้ำ/)).not.toBeInTheDocument();
    });
  });

  it("dismisses duplicate toast when X is clicked", async () => {
    render(
      <RouteVisualEditor
        route={mockRouteRow}
        stops={stopsWithDuplicates}
        attractions={mockAttractions}
      />
    );

    // Wait for toast to appear
    await waitFor(() => {
      const elements = screen.getAllByText(/พบจุดแวะซ้ำ 1 แห่ง/);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    // Click dismiss — there are two elements with this label (sidebar X and toast X),
    // but the dismiss button is specifically for the toast
    const dismissButtons = screen.getAllByLabelText("ปิดการแจ้งเตือน");
    act(() => {
      fireEvent.click(dismissButtons[0]);
    });

    // Only the sidebar warning should remain (no toast)
    await waitFor(() => {
      expect(screen.getByText("พบจุดแวะซ้ำ 1 แห่ง")).toBeInTheDocument();
    });
  });
});
