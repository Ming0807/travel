import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckinLandingPage from "@/app/(tourist)/checkin/[code]/page";
import StartCheckinPage from "@/app/(tourist)/checkin/[code]/start/page";
import { resolveCheckinFlow } from "@/lib/services/checkin-entry.service";
import { trackCheckinFunnelEvent } from "@/lib/services/checkin.service";
import { getGuestIdentity } from "@/lib/auth/guest";
import { listCheckinCountries, listCheckinProvinces } from "@/lib/repositories/geography.repository";
import { getOptionalResearchInvitationForCheckin } from "@/lib/services/research.service";

const browserId = "10000000-0000-4000-8000-000000000001";
const sessionId = "20000000-0000-4000-8000-000000000001";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: browserId }) })),
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("@/components/checkin/CheckinLanding", () => ({ CheckinLanding: ({ nfcOfficialHost }: { nfcOfficialHost: string | null }) => <div>Landing {nfcOfficialHost}</div> }));
vi.mock("@/components/checkin/MinimalForm", () => ({ MinimalForm: () => <div data-testid="minimal-form">Form</div> }));
vi.mock("@/lib/services/checkin-entry.service", () => ({ resolveCheckinFlow: vi.fn() }));
vi.mock("@/lib/services/checkin.service", () => ({ trackCheckinFunnelEvent: vi.fn() }));
vi.mock("@/lib/auth/guest", () => ({ getGuestIdentity: vi.fn() }));
vi.mock("@/lib/repositories/geography.repository", () => ({ listCheckinCountries: vi.fn(), listCheckinProvinces: vi.fn() }));
vi.mock("@/lib/services/research.service", () => ({ getOptionalResearchInvitationForCheckin: vi.fn() }));

describe("check-in landing recovery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getGuestIdentity).mockResolvedValue(null);
    vi.mocked(listCheckinCountries).mockResolvedValue([]);
    vi.mocked(listCheckinProvinces).mockResolvedValue([]);
    vi.mocked(getOptionalResearchInvitationForCheckin).mockResolvedValue(null);
  });
  afterEach(() => vi.unstubAllEnvs());

  it.each([CheckinLandingPage, StartCheckinPage])("rejects duplicate flow values before legacy fallback or profile loading", async (Page) => {
    render(await Page({
      params: Promise.resolve({ code: "test-code" }),
      searchParams: Promise.resolve({ flow: ["first-session", "second-session"] }),
    }));
    expect(screen.getByRole("heading", { name: "สถานที่ยังไม่เปิดให้เช็กอิน" })).toBeInTheDocument();
    expect(resolveCheckinFlow).not.toHaveBeenCalled();
    expect(trackCheckinFunnelEvent).not.toHaveBeenCalled();
  });

  it("preserves NFC rejection on the data-entry page", async () => {
    vi.mocked(resolveCheckinFlow).mockResolvedValue({ mode: "blocked", status: "nfc_unavailable" });
    render(await StartCheckinPage({ params: Promise.resolve({ code: "test-code" }) }));
    expect(screen.getByText("NFC CHECK-IN")).toBeInTheDocument();
    expect(trackCheckinFunnelEvent).not.toHaveBeenCalled();
  });

  const nfcContext = {
    mode: "session" as const, status: "valid" as const,
    details: {
      checkin_code_id: 1, code: "test-code", is_active: true, starts_at: null, ends_at: null, photo_spot: null,
      attraction: {
        attraction_id: 1, name_th: "วัดคูหาภิมุข (วัดหน้าถ้ำ)", name_en: null, short_description_th: null,
        is_active: true, is_published: true, cover_image_url: null,
        province: { province_name_th: "ยะลา", is_active: true, destination_status: "live" as const },
      },
    },
    session: {
      sessionId, checkinCodeId: 1, code: "test-code", attractionId: 1,
      photoSpotId: null, campaignId: null, channel: "nfc" as const, tagId: "30000000-0000-4000-8000-000000000001",
      evidenceScope: "unknown" as const, researchStudyId: null, researchFrozenAt: null,
      visitId: null, createdAt: "2026-09-27T00:00:00Z", expiresAt: "2026-09-27T01:00:00Z",
    },
  };

  it("shows only the configured HTTPS host for a validated NFC session", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://tourism.example/");
    vi.mocked(resolveCheckinFlow).mockResolvedValue(nfcContext);
    render(await CheckinLandingPage({
      params: Promise.resolve({ code: "test-code" }),
      searchParams: Promise.resolve({ flow: sessionId }),
    }));
    expect(screen.getByText("Landing tourism.example")).toBeInTheDocument();
    expect(resolveCheckinFlow).toHaveBeenCalledWith({ code: "test-code", flowId: sessionId, browserId });
    expect(trackCheckinFunnelEvent).toHaveBeenCalledWith("landing_viewed", nfcContext.details, { sessionId });
  });

  it("shows the NFC host and attraction before the data-entry form on a direct start link", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://tourism.example/");
    vi.mocked(resolveCheckinFlow).mockResolvedValue(nfcContext);
    render(await StartCheckinPage({
      params: Promise.resolve({ code: "test-code" }),
      searchParams: Promise.resolve({ flow: sessionId }),
    }));
    const verification = screen.getByRole("region", { name: "ตรวจสอบจุดเช็กอิน NFC" });
    expect(verification).toHaveTextContent("tourism.example");
    expect(verification).toHaveTextContent("วัดคูหาภิมุข (วัดหน้าถ้ำ)");
    expect(screen.getByTestId("minimal-form")).toBeInTheDocument();
    expect(resolveCheckinFlow).toHaveBeenCalledWith({ code: "test-code", flowId: sessionId, browserId });
  });

  it("does not render the data-entry form when the official NFC origin is invalid", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://tourism.example/");
    vi.mocked(resolveCheckinFlow).mockResolvedValue(nfcContext);
    render(await StartCheckinPage({
      params: Promise.resolve({ code: "test-code" }),
      searchParams: Promise.resolve({ flow: sessionId }),
    }));
    expect(screen.getByText("NFC CHECK-IN")).toBeInTheDocument();
    expect(screen.queryByTestId("minimal-form")).not.toBeInTheDocument();
    expect(trackCheckinFunnelEvent).not.toHaveBeenCalled();
  });

  it.each(["", "http://tourism.example", "https://staff:private@tourism.example"])("blocks NFC when its configured official origin is invalid", async (origin) => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", origin);
    vi.mocked(resolveCheckinFlow).mockResolvedValue(nfcContext);
    render(await CheckinLandingPage({
      params: Promise.resolve({ code: "test-code" }),
      searchParams: Promise.resolve({ flow: sessionId }),
    }));
    expect(screen.getByText("NFC CHECK-IN")).toBeInTheDocument();
    expect(screen.queryByText(/Landing/)).not.toBeInTheDocument();
    expect(trackCheckinFunnelEvent).not.toHaveBeenCalled();
  });

  it("shows NFC recovery from canonical rejection without resolving another entry", async () => {
    render(await CheckinLandingPage({
      params: Promise.resolve({ code: "test-code" }),
      searchParams: Promise.resolve({ entryError: "nfc_unavailable" }),
    }));
    expect(screen.getByRole("heading", { name: "ยังเช็กอินผ่าน NFC ไม่สำเร็จ" })).toBeInTheDocument();
    expect(resolveCheckinFlow).not.toHaveBeenCalled();
    expect(trackCheckinFunnelEvent).not.toHaveBeenCalled();
  });

  it("preserves a rejected NFC session status without recording a landing", async () => {
    vi.mocked(resolveCheckinFlow).mockResolvedValue({ mode: "blocked", status: "nfc_unavailable" });
    render(await CheckinLandingPage({
      params: Promise.resolve({ code: "test-code" }),
      searchParams: Promise.resolve({ flow: sessionId }),
    }));
    expect(screen.getByText("NFC CHECK-IN")).toBeInTheDocument();
    expect(trackCheckinFunnelEvent).not.toHaveBeenCalled();
  });

  it("does not reflect unknown error text into the page", async () => {
    render(await CheckinLandingPage({
      params: Promise.resolve({ code: "test-code" }),
      searchParams: Promise.resolve({ entryError: "private-provider-error" }),
    }));
    expect(screen.queryByText(/private-provider-error/)).not.toBeInTheDocument();
    expect(resolveCheckinFlow).not.toHaveBeenCalled();
  });
});
