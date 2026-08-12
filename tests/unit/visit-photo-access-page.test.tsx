import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireTouristVisitAccess: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({
  requireTouristVisitAccess: mocks.requireTouristVisitAccess,
  TouristAccessError: class TouristAccessError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
      this.name = "TouristAccessError";
    }
  },
}));

vi.mock("@/components/checkin/PhotoUploadClient", () => ({
  PhotoUploadClient: ({ visitId }: { visitId: string }) => <div>upload:{visitId}</div>,
}));

import VisitPhotoPage from "@/app/(tourist)/visit/[visitId]/photo/page";
import { TouristAccessError } from "@/lib/auth/guards";

const visitId = "c78c7b95-e988-455d-b4a7-848d8b26ffbc";

describe("visit photo access page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the upload flow for the visit owner", async () => {
    mocks.requireTouristVisitAccess.mockResolvedValue({
      visit: {
        visit_id: visitId,
        attractions: { name_th: "ป่าฮาลา-บาลา" },
      },
    });

    render(await VisitPhotoPage({ params: Promise.resolve({ visitId }) }));

    expect(screen.getByText(`upload:${visitId}`)).toBeInTheDocument();
    expect(screen.getByText("ป่าฮาลา-บาลา")).toBeInTheDocument();
  });

  it("shows a recovery state instead of a 404 when the browser identity is missing", async () => {
    mocks.requireTouristVisitAccess.mockRejectedValue(
      new TouristAccessError("TOURIST_IDENTITY_NOT_FOUND", "ไม่พบข้อมูลพาสปอร์ต"),
    );

    render(await VisitPhotoPage({ params: Promise.resolve({ visitId }) }));

    expect(screen.getByRole("heading", { name: "เปิดขั้นตอนนี้จากเบราว์เซอร์เดิม" })).toBeInTheDocument();
    expect(screen.getByText(/ข้อมูลการเข้าชมยังไม่ได้ถูกลบ/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "กลับไปสแกน QR อีกครั้ง" })).toHaveAttribute(
      "href",
      "/checkin/try",
    );
  });

  it("does not expose whether a visit belongs to another browser", async () => {
    mocks.requireTouristVisitAccess.mockRejectedValue(
      new TouristAccessError("VISIT_ACCESS_DENIED", "ไม่มีสิทธิ์"),
    );

    render(await VisitPhotoPage({ params: Promise.resolve({ visitId }) }));

    expect(screen.getByRole("heading", { name: "เปิดขั้นตอนนี้จากเบราว์เซอร์เดิม" })).toBeInTheDocument();
    expect(screen.queryByText(visitId)).not.toBeInTheDocument();
  });

  it("shows a retryable service state instead of a false 404 for unexpected failures", async () => {
    mocks.requireTouristVisitAccess.mockRejectedValue(new Error("SUPABASE_UNAVAILABLE"));

    render(await VisitPhotoPage({ params: Promise.resolve({ visitId }) }));

    expect(
      screen.getByRole("heading", { name: "โหลดขั้นตอนอัปโหลดรูปไม่สำเร็จ" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ลองโหลดหน้านี้อีกครั้ง" })).toHaveAttribute(
      "href",
      `/visit/${visitId}/photo`,
    );
  });
});
