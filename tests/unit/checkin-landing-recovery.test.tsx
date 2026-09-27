import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckinLandingPage from "@/app/(tourist)/checkin/[code]/page";
import { resolveCheckinFlow } from "@/lib/services/checkin-entry.service";
import { trackCheckinFunnelEvent } from "@/lib/services/checkin.service";

vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ get: () => undefined })) }));
vi.mock("@/components/checkin/CheckinLanding", () => ({ CheckinLanding: () => <div>Landing</div> }));
vi.mock("@/lib/services/checkin-entry.service", () => ({ resolveCheckinFlow: vi.fn() }));
vi.mock("@/lib/services/checkin.service", () => ({ trackCheckinFunnelEvent: vi.fn() }));

describe("check-in landing recovery", () => {
  beforeEach(() => vi.resetAllMocks());

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
