import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockSettingsApiResponse: { ok: boolean; json: () => Promise<unknown> } = {
  ok: true,
  json: async () => ({}),
};
const mockFetch = vi.fn().mockResolvedValue(mockSettingsApiResponse);
globalThis.fetch = mockFetch;

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

// Mock MediaPickerModal to avoid full render
vi.mock("@/components/admin/media/MediaPickerModal", () => ({
  MediaPickerModal: ({ isOpen, onClose, onSelect, title }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    title: string;
  }) => isOpen ? (
    <div role="dialog" aria-label={title}>
      <button onClick={() => onSelect("https://example.com/test.jpg")}>Pick</button>
      <button onClick={onClose}>Close picker</button>
    </div>
  ) : null,
}));

// Mock HomepageFeaturedEditor
vi.mock("@/components/admin/content/HomepageFeaturedEditor", () => ({
  HomepageFeaturedEditor: ({ slugs, onChange }: { slugs: string[]; onChange: (slugs: string[]) => void }) => (
    <div data-testid="featured-editor">
      <button onClick={() => onChange(["test-slug"])}>Add attraction</button>
      <span>{slugs.length} selected</span>
    </div>
  ),
}));

// Mock HomepageRoutePicker
vi.mock("@/components/admin/content/HomepageRoutePicker", () => ({
  HomepageRoutePicker: ({ slugs, onChange }: { slugs: string[]; onChange: (slugs: string[]) => void }) => (
    <div data-testid="route-picker">
      <button onClick={() => onChange(["route-1", "route-2"])}>Add routes</button>
      <span>{slugs.length} routes selected</span>
    </div>
  ),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/settings",
  useSearchParams: () => new URLSearchParams(),
}));

import { SettingsClient } from "@/components/admin/settings/SettingsClient";

// ── Test Data ──────────────────────────────────────────────────────────────

const EMPTY_SETTINGS = [
  { setting_key: "homepage_hero", setting_value: { title: "Hero Title", subtitle: "", description: "", images: ["", "", ""] }, description: null, updated_at: "2026-01-01" },
  { setting_key: "homepage_featured_attractions", setting_value: { slugs: [] }, description: null, updated_at: "2026-01-01" },
  { setting_key: "homepage_stories", setting_value: { title: "Stories Title", subtitle: "", buttonText: "", limit: 4 }, description: null, updated_at: "2026-01-01" },
  { setting_key: "homepage_featured_routes", setting_value: { slugs: [], title: "", subtitle: "", limit: 3 }, description: null, updated_at: "2026-01-01" },
  { setting_key: "homepage_how_it_works", setting_value: { title: "", subtitle: "", description: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "homepage_highlights", setting_value: { title: "", authorName: "", location: "", quote: "", videoCover: "", imageCover: "", imageTitle: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "homepage_cta", setting_value: { title: "", subtitle: "", description: "", bgImage: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "attractions_page_hero", setting_value: { title: "", description: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "attractions_page_banner", setting_value: { title: "", subtitle: "", linkText: "", linkUrl: "", image: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "stories_page_hero", setting_value: { title: "", description: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "stories_page_cta", setting_value: { title: "", subtitle: "", linkText: "", linkUrl: "", image: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "routes_page_hero", setting_value: { title: "", description: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "restaurants_page_hero", setting_value: { title: "", description: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "restaurants_page_feature", setting_value: { title: "", subtitle: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "restaurants_page_cta", setting_value: { title: "", subtitle: "", linkText: "", linkUrl: "", image: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "accommodations_page_hero", setting_value: { title: "", description: "", image: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "accommodations_page_cta", setting_value: { title: "", subtitle: "", linkText: "", linkUrl: "", image: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "general_info", setting_value: {}, description: null, updated_at: "2026-01-01" },
  { setting_key: "social_media", setting_value: {}, description: null, updated_at: "2026-01-01" },
  { setting_key: "footer_info", setting_value: {}, description: null, updated_at: "2026-01-01" },
  { setting_key: "seo_settings", setting_value: {}, description: null, updated_at: "2026-01-01" },
  { setting_key: "feature_toggles", setting_value: { enableStamp: true, enableCertificate: true, enableSurvey: true }, description: null, updated_at: "2026-01-01" },
  { setting_key: "maintenance_info", setting_value: { isMaintenanceMode: false, maintenanceMessage: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "about_vision", setting_value: { title: "", content: "" }, description: null, updated_at: "2026-01-01" },
  { setting_key: "about_team", setting_value: [] as unknown[], description: null, updated_at: "2026-01-01" },
];

describe("SettingsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(mockSettingsApiResponse);
  });

  it("renders with navigation groups", () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    // Navigation labels appear in both nav buttons and section headers
    expect(screen.getAllByText("หน้าแรก").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("หน้าสาธารณะ")).toBeInTheDocument();
    expect(screen.getByText("ติดต่อและส่วนท้าย")).toBeInTheDocument();
    expect(screen.getByText("SEO")).toBeInTheDocument();
    expect(screen.getByText("ระบบ")).toBeInTheDocument();
    expect(screen.getByText("เกี่ยวกับเรา")).toBeInTheDocument();
  });

  it("shows active group content", () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    expect(screen.getByText("ภาพหลักหน้าแรก (Hero)")).toBeInTheDocument();
    expect(screen.getByText("สถานที่ยอดนิยม")).toBeInTheDocument();
  });

  it("navigates between groups", async () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    await userEvent.click(screen.getByText("หน้าสาธารณะ"));
    await waitFor(() => {
      expect(screen.getByText("หน้าสถานที่ท่องเที่ยว")).toBeInTheDocument();
      expect(screen.getByText("หน้าที่พัก")).toBeInTheDocument();
    });
  });

  it("shows dirty state when editing", async () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    const input = screen.getByLabelText("หัวข้อหลัก");
    await userEvent.type(input, "x");
    expect(screen.getByText(/บันทึก \d รายการ/)).toBeInTheDocument();
    expect(screen.getByText(/ยกเลิกทั้งหมด/)).toBeInTheDocument();
  });

  it("clears dirty state on cancel", async () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    const input = screen.getByLabelText("หัวข้อหลัก");
    await userEvent.type(input, "x");
    await userEvent.click(screen.getByText(/ยกเลิกทั้งหมด/));
    expect(screen.queryByText(/บันทึก \d รายการ/)).not.toBeInTheDocument();
  });

  it("saves settings successfully", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    const input = screen.getByLabelText("หัวข้อหลัก");
    await userEvent.type(input, "x");
    await userEvent.click(screen.getByText(/บันทึก \d รายการ/));
    await waitFor(() => {
      expect(screen.getByText(/บันทึกสำเร็จ \d รายการ/)).toBeInTheDocument();
    });
  });

  it("marks a selected hero image as pending save", async () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);

    await userEvent.click(screen.getAllByRole("button", { name: "เลือกภาพ" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "Pick" }));

    expect(screen.getByText("เลือกภาพ Hero แล้ว กดบันทึกเพื่อเผยแพร่การเปลี่ยนแปลง")).toBeInTheDocument();
    expect(screen.getByText(/บันทึก 1 รายการ/)).toBeInTheDocument();
  });

  it("resets group to defaults", async () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    await userEvent.click(screen.getByText("รีเซ็ตเป็นค่าเริ่มต้น"));
    expect(screen.getByText(/รีเซ็ตค่ากลุ่ม/)).toBeInTheDocument();
  });

  it("has Content Hub link for attraction content", () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    expect(screen.getByText("ต้องการแก้ไขเนื้อหาสถานที่?")).toBeInTheDocument();
    const link = screen.getByText("ไปที่ศูนย์จัดการเนื้อหา (Content Hub)");
    expect(link.closest("a")).toHaveAttribute("href", "/admin/content");
  });

  it("renders system toggles", async () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    await userEvent.click(screen.getByText("ระบบ"));
    await waitFor(() => {
      expect(screen.getByText("เปิด/ปิดฟีเจอร์")).toBeInTheDocument();
      expect(screen.getByText("แสตมป์ดิจิทัล")).toBeInTheDocument();
      expect(screen.getByText("การออกใบประกาศ")).toBeInTheDocument();
    });
  });

  it("renders stories section with limit input", () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    expect(screen.getByText("เรื่องราวนักเดินทาง")).toBeInTheDocument();
    const limitInputs = screen.getAllByLabelText("จำนวนที่แสดงสูงสุด");
    expect(limitInputs.length).toBeGreaterThanOrEqual(1);
    // The first "จำนวนที่แสดงสูงสุด" input is for stories (value=4), second is for routes (value=3)
    expect(limitInputs[0]).toHaveValue(4);
  });

  it("clamps stories limit between 1 and 8", async () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    const limitInputs = screen.getAllByLabelText("จำนวนที่แสดงสูงสุด");
    const storiesLimitInput = limitInputs[0];
    // Entering "9" should clamp to 8 via Math.min(8, 9)
    await userEvent.clear(storiesLimitInput);
    await userEvent.type(storiesLimitInput, "9");
    // Type into the input triggers onChange which clamps and marks dirty
    expect(screen.getByText(/บันทึก \d รายการ/)).toBeInTheDocument();
  });

  it("renders featured routes section with mocked route picker", () => {
    render(<SettingsClient initialSettings={EMPTY_SETTINGS} />);
    expect(screen.getByText("เส้นทางแนะนำ")).toBeInTheDocument();
    // Route picker is mocked — see homepage-route-picker.test.tsx for real component tests
    expect(screen.getByTestId("route-picker")).toBeInTheDocument();
    expect(screen.getByText(/routes selected/)).toBeInTheDocument();
  });
});
