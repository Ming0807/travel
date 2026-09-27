import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckinLandingPage from "@/app/(tourist)/checkin/[code]/page";
import { resolveCheckinFlow } from "@/lib/services/checkin-entry.service";
import { trackCheckinFunnelEvent } from "@/lib/services/checkin.service";

vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ get: () => undefined })) }));
vi.mock("@/components/checkin/CheckinLanding", () => ({ CheckinLanding: ({ nfcOfficialHost }: { nfcOfficialHost: string | null }) => <div>Landing {nfcOfficialHost}</div> }));
vi.mock("@/lib/services/checkin-entry.service", () => ({ resolveCheckinFlow: vi.fn() }));
vi.mock("@/lib/services/checkin.service", () => ({ trackCheckinFunnelEvent: vi.fn() }));

describe("check-in landing recovery", () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.unstubAllEnvs());

  const nfcContext = {
    mode: "session" as const, status: "valid" as const,
    details: { checkin_code_id: 1, code: "test-code", is_active: true, starts_at: null, ends_at: null, photo_spot: null, attraction: null },
    session: {
      sessionId: "test-session", checkinCodeId: 1, code: "test-code", attractionId: 1,
      photoSpotId: null, campaignId: null, channel: "nfc" as const, tagId: "test-tag",
      evidenceScope: "unknown" as const, researchStudyId: null, researchFrozenAt: null,
      visitId: null, createdAt: "2026-09-27T00:00:00Z", expiresAt: "2026-09-27T01:00:00Z",
    },
  };

  it("shows only the configured HTTPS host for a validated NFC session", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://tourism.example/");
    vi.mocked(resolveCheckinFlow).mockResolvedValue(nfcContext);
    render(await CheckinLandingPage({ params: Promise.resolve({ code: "test-code" }) }));
    expect(screen.getByText("Landing tourism.example")).toBeInTheDocument();
    expect(trackCheckinFunnelEvent).toHaveBeenCalledWith("landing_viewed", nfcContext.details, { sessionId: "test-session" });
  });

  it.each(["", "http://tourism.example", "https://staff:private@tourism.example"])("blocks NFC when its configured official origin is invalid", async (origin) => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", origin);
    vi.mocked(resolveCheckinFlow).mockResolvedValue(nfcContext);
    render(await CheckinLandingPage({ params: Promise.resolve({ code: "test-code" }) }));
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
    render(await CheckinLandingPage({ params: Promise.resolve({ code: "test-code" }) }));
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
