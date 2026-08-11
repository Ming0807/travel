import { render, screen } from "@testing-library/react";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET as openCanonicalQr } from "@/app/(tourist)/c/[code]/route";
import CheckinLandingPage from "@/app/(tourist)/checkin/[code]/page";
import type { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import {
  resolveAndValidateCheckinCode,
  trackCheckinFunnelEvent,
} from "@/lib/services/checkin.service";

vi.mock("node:crypto", () => ({
  default: { randomUUID: vi.fn(() => "session-from-canonical-qr") },
}));

vi.mock("@/lib/services/checkin.service", () => ({
  resolveAndValidateCheckinCode: vi.fn(),
  trackCheckinFunnelEvent: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

const details: CheckinCodeDetails = {
  checkin_code_id: 7,
  code: "YALA-QR-01",
  is_active: true,
  starts_at: null,
  ends_at: null,
  attraction: {
    attraction_id: 11,
    name_th: "จุดท่องเที่ยวยะลา",
    name_en: null,
    short_description_th: null,
    is_active: true,
    is_published: true,
    cover_image_url: "/site-media/yala.webp",
    province: {
      province_name_th: "ยะลา",
      is_active: true,
      destination_status: "live",
    },
  },
  photo_spot: null,
};

describe("check-in funnel event boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveAndValidateCheckinCode).mockResolvedValue({
      status: "valid",
      details,
    });
    vi.mocked(trackCheckinFunnelEvent).mockResolvedValue(undefined);
  });

  it("records qr_scanned only at the canonical QR entry using the new session id", async () => {
    const response = await openCanonicalQr(
      new NextRequest("https://travel.example/c/YALA-QR-01"),
      { params: Promise.resolve({ code: "YALA-QR-01" }) },
    );

    expect(trackCheckinFunnelEvent).toHaveBeenCalledWith("qr_scanned", details, {
      sessionId: "session-from-canonical-qr",
    });
    expect(response.headers.get("location")).toBe(
      "https://travel.example/checkin/YALA-QR-01",
    );
    expect(response.headers.get("set-cookie")).toContain(
      "sbtp_checkin_session=session-from-canonical-qr",
    );
  });

  it("records only landing_viewed when the landing page renders", async () => {
    render(
      await CheckinLandingPage({
        params: Promise.resolve({ code: "YALA-QR-01" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "จุดท่องเที่ยวยะลา" })).toBeInTheDocument();
    expect(trackCheckinFunnelEvent).toHaveBeenCalledTimes(1);
    expect(trackCheckinFunnelEvent).toHaveBeenCalledWith("landing_viewed", details);
  });
});
