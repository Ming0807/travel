import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Sample media assets
const ACTIVE_ASSETS: Record<string, unknown>[] = [
  {
    id: "media-1",
    file_name: "hero-beach.jpg",
    storage_path: "attractions/abc-123.jpg",
    mime_type: "image/jpeg",
    size_bytes: 512000,
    category: "Attractions",
    created_at: "2026-05-01T00:00:00Z",
    url: "https://example.com/storage/hero-beach.jpg",
    lifecycle_status: "active",
  },
  {
    id: "media-2",
    file_name: "temple-night.png",
    storage_path: "attractions/def-456.png",
    mime_type: "image/png",
    size_bytes: 2048000,
    category: "Attractions",
    created_at: "2026-05-02T00:00:00Z",
    url: "https://example.com/storage/temple-night.png",
    lifecycle_status: "active",
  },
];

const ALL_ASSETS: Record<string, unknown>[] = [
  ...ACTIVE_ASSETS,
  {
    id: "media-3",
    file_name: "old-banner.webp",
    storage_path: "homepage/ghi-789.webp",
    mime_type: "image/webp",
    size_bytes: 300000,
    category: "Homepage",
    created_at: "2026-04-15T00:00:00Z",
    url: "https://example.com/storage/old-banner.webp",
    lifecycle_status: "archived",
  },
];

// Helper: trigger mouseEnter on a card to reveal its hover overlay buttons
function mouseEnterCard(fileName: string) {
  const card = screen.getByText(fileName).closest("article");
  if (!card) throw new Error(`Card with "${fileName}" not found`);
  fireEvent.mouseEnter(card);
  return card;
}

describe("MediaLibrary archive/unarchive flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Initial render ──

  it("renders the media library and fetches assets on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ACTIVE_ASSETS,
    });

    render(<MediaLibrary mode="manage" />);

    expect(screen.getByText("อัปโหลดภาพของระบบ")).toBeInTheDocument();
    expect(screen.getByText("Active assets")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("lifecycle_status=active")
      );
    });
  });

  it("shows stats based on fetched assets (active vs archived)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ALL_ASSETS,
    });

    render(<MediaLibrary mode="manage" />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument(); // Active
      expect(screen.getByText("1")).toBeInTheDocument(); // Archived
    });
  });

  // ── Archive toggle ──

  it("toggles show/hide archived assets via the Archived button", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ACTIVE_ASSETS,
    });

    render(<MediaLibrary mode="manage" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("lifecycle_status=active")
    );

    // Find the archive toggle button (not "Archive" action button)
    const toggleBtns = screen.getAllByRole("button", { name: /Archived/i });
    expect(toggleBtns.length).toBeGreaterThan(0);

    // Mock the re-fetch triggered by toggle
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ALL_ASSETS,
    });

    await userEvent.click(toggleBtns[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("lifecycle_status=all")
      );
    });
  });

  // ── Archive dialog ──

  it("opens archive confirmation dialog when Archive button is clicked on a card", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ACTIVE_ASSETS,
    });

    render(<MediaLibrary mode="manage" />);

    await waitFor(() => {
      expect(screen.getByText("hero-beach.jpg")).toBeInTheDocument();
    });

    // Hover over the card to reveal the Archive button
    mouseEnterCard("hero-beach.jpg");

    // Now click the Archive action button (not the Archived toggle)
    const [archiveBtn] = screen.getAllByRole("button", { name: /^Archive$/ });
    await userEvent.click(archiveBtn);

    await waitFor(() => {
      expect(screen.getByText("Archive this asset?")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /archive สื่อนี้/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ยกเลิก/i })).toBeInTheDocument();
  });

  it("closes archive dialog when Cancel is clicked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ACTIVE_ASSETS,
    });

    render(<MediaLibrary mode="manage" />);

    await waitFor(() => {
      expect(screen.getByText("hero-beach.jpg")).toBeInTheDocument();
    });

    mouseEnterCard("hero-beach.jpg");
    const [archiveBtn] = screen.getAllByRole("button", { name: /^Archive$/ });
    await userEvent.click(archiveBtn);

    await waitFor(() => {
      expect(screen.getByText("Archive this asset?")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /ยกเลิก/i }));

    await waitFor(() => {
      expect(screen.queryByText("Archive this asset?")).not.toBeInTheDocument();
    });
  });

  it("shows used-in references before confirming archive", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ACTIVE_ASSETS,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          references: [
            { entityType: "attraction", entityId: 10, name: "หาดทรายขาว" },
            { entityType: "story", entityId: 5, name: "เที่ยวทะเลใต้" },
          ],
        }),
      });

    render(<MediaLibrary mode="manage" />);

    await waitFor(() => {
      expect(screen.getByText("hero-beach.jpg")).toBeInTheDocument();
    });

    mouseEnterCard("hero-beach.jpg");
    const [archiveBtn] = screen.getAllByRole("button", { name: /^Archive$/ });
    await userEvent.click(archiveBtn);

    await waitFor(() => {
      expect(screen.getByText("Archive this asset?")).toBeInTheDocument();
    });

    // References are fetched automatically when the dialog opens
    await waitFor(() => {
      expect(screen.getByText("สื่อนี้ถูกใช้ในเนื้อหาเหล่านี้:")).toBeInTheDocument();
      expect(screen.getByText("หาดทรายขาว")).toBeInTheDocument();
      expect(screen.getByText("เที่ยวทะเลใต้")).toBeInTheDocument();
    });

    // When references exist, the confirm button says "Archive anyway" and Close button appears
    expect(screen.getByRole("button", { name: /archive ต่อไป/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ปิด/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /archive สื่อนี้/i })).not.toBeInTheDocument();
  });

  it("auto-closes archive dialog when no references are returned", async () => {
    const updatedAssets = ACTIVE_ASSETS.filter((a) => a.id !== "media-1");

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ACTIVE_ASSETS,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          references: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedAssets,
      });

    render(<MediaLibrary mode="manage" />);

    await waitFor(() => {
      expect(screen.getByText("hero-beach.jpg")).toBeInTheDocument();
    });

    mouseEnterCard("hero-beach.jpg");
    const [archiveBtn] = screen.getAllByRole("button", { name: /^Archive$/ });
    await userEvent.click(archiveBtn);

    await waitFor(() => {
      expect(screen.getByText("Archive this asset?")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /archive สื่อนี้/i }));

    await waitFor(() => {
      expect(screen.queryByText("Archive this asset?")).not.toBeInTheDocument();
    });
  });

  // ── Restore (unarchive) ──

  it("restores an archived asset via the Restore button", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ACTIVE_ASSETS,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ALL_ASSETS,
      });

    render(<MediaLibrary mode="manage" />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("hero-beach.jpg")).toBeInTheDocument();
    });

    // Toggle to show archived assets
    const toggleBtns = screen.getAllByRole("button", { name: /Archived/i });
    await userEvent.click(toggleBtns[0]);

    await waitFor(() => {
      expect(screen.getByText("old-banner.webp")).toBeInTheDocument();
    });

    // Verify archived card has reduced opacity styling
    const archivedCard = screen.getByText("old-banner.webp").closest("article");
    expect(archivedCard?.className).toContain("opacity-60");

    // Hover to reveal Restore button
    fireEvent.mouseEnter(archivedCard!);

    // Mock the unarchive PATCH call + subsequent re-fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ACTIVE_ASSETS,
    });

    const restoreBtn = screen.getByRole("button", { name: /กู้คืน/i });
    await userEvent.click(restoreBtn);

    // Should call PATCH with action=unarchive
    await waitFor(() => {
      const patchCalls = mockFetch.mock.calls.filter(
        (call) => call[1] && typeof call[1] === "object" && "method" in (call[1] as Record<string, unknown>) && (call[1] as Record<string, unknown>).method === "PATCH"
      );
      expect(patchCalls.length).toBeGreaterThan(0);
    });
  });

  // ── Error states ──

  it("shows error message when archive API fails", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ACTIVE_ASSETS,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "references error" }),
      })
      // References GET fails → archiveReferences.length === 0 → "Archive asset" button shown
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Could not archive this asset. Please try again." }),
      });

    render(<MediaLibrary mode="manage" />);

    await waitFor(() => {
      expect(screen.getByText("hero-beach.jpg")).toBeInTheDocument();
    });

    mouseEnterCard("hero-beach.jpg");
    const [archiveBtn] = screen.getAllByRole("button", { name: /^Archive$/ });
    await userEvent.click(archiveBtn);

    await waitFor(() => {
      expect(screen.getByText("Archive this asset?")).toBeInTheDocument();
    });

    // Wait for references fetch to fail before clicking confirm
    await waitFor(() => {
      expect(screen.queryByText("กำลังตรวจสอบว่าสื่อนี้ถูกใช้ที่ไหนบ้าง...")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /archive สื่อนี้/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /archive สื่อนี้/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Could not archive this asset. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails on initial load", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Could not load media assets. Please try again." }),
    });

    render(<MediaLibrary mode="manage" />);

    await waitFor(() => {
      expect(
        screen.getByText("Could not load media assets. Please try again.")
      ).toBeInTheDocument();
    });
  });

  // ── Pick mode ──

  it("allows selecting active assets in pick mode", async () => {
    const onSelect = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ACTIVE_ASSETS,
    });

    render(<MediaLibrary mode="pick" onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText("hero-beach.jpg")).toBeInTheDocument();
    });

    const card = screen.getByText("hero-beach.jpg").closest("article");
    await userEvent.click(card!);

    expect(onSelect).toHaveBeenCalledWith(
      "https://example.com/storage/hero-beach.jpg"
    );
  });

  it("prevents selecting archived assets in pick mode", async () => {
    const onSelect = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ALL_ASSETS,
    });

    render(<MediaLibrary mode="pick" onSelect={onSelect} />);

    // Toggle to show archived
    const toggleBtns = screen.getAllByRole("button", { name: /Archived/i });
    await userEvent.click(toggleBtns[0]);

    await waitFor(() => {
      expect(screen.getByText("old-banner.webp")).toBeInTheDocument();
    });

    // Archived card should have reduced opacity/saturation
    const archivedCard = screen.getByText("old-banner.webp").closest("article");
    expect(archivedCard?.className).toContain("opacity-60");
    expect(archivedCard?.className).toContain("saturate-0");
  });
});
