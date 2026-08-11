import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckinLanding } from "@/components/checkin/CheckinLanding";
import { MinimalForm } from "@/components/checkin/MinimalForm";
import { PhotoUploadClient } from "@/components/checkin/PhotoUploadClient";
import { SurveySkipCard } from "@/components/survey/SurveySkipCard";
import CheckinLandingPage from "@/app/(tourist)/checkin/[code]/page";
import { shouldHidePublicChrome } from "@/lib/navigation/public-route-mode";
import type { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";

import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";

vi.mock("@/app/actions/checkin-actions", () => ({
  initiateCheckin: vi.fn(),
}));

vi.mock("@/app/actions/survey-actions", () => ({
  skipPostCertificateSurveyAction: vi.fn(),
}));

vi.mock("@/lib/services/checkin.service", () => ({
  resolveAndValidateCheckinCode: vi.fn(),
  trackCheckinFunnelEvent: vi.fn(),
}));

vi.mock("@/lib/media/client-photo-compression", () => ({
  formatPhotoBytes: (bytes: number) => `${bytes} bytes`,
  prepareVisitPhotoForUpload: vi.fn(),
  validateVisitPhotoSource: vi.fn(() => null),
}));

vi.mock("@/components/checkin/CameraCaptureDialog", () => ({
  CameraCaptureDialog: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const details: CheckinCodeDetails = {
  checkin_code_id: 7,
  code: "YALA-DEMO-01",
  is_active: true,
  starts_at: null,
  ends_at: null,
  attraction: {
    attraction_id: 11,
    name_th: "สกายวอล์กอัยเยอร์เวง",
    name_en: "Aiyerweng Skywalk",
    short_description_th: "ชมวิวทะเลหมอกยะลา",
    is_active: true,
    is_published: true,
    cover_image_url: null,
    province: {
      province_name_th: "ยะลา",
      is_active: true,
      destination_status: "live",
    },
  },
  photo_spot: null,
};

const countries = [
  { id: 1, labelTh: "ไทย", labelEn: "Thailand", iso2Code: "TH" },
  { id: 2, labelTh: "มาเลเซีย", labelEn: "Malaysia", iso2Code: "MY" },
];

const provinces = [{ id: 1, labelTh: "ยะลา", labelEn: "Yala" }];

describe("check-in funnel UX contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("communicates the real benefit and expected duration before asking for data", () => {
    render(<CheckinLanding details={details} />);

    expect(screen.getByRole("heading", { name: /รับใบประกาศและตราประทับดิจิทัล/ })).toBeInTheDocument();
    expect(screen.getByText(/ข้อมูลเริ่มต้นประมาณ 1 นาที/)).toBeInTheDocument();
    expect(screen.getByText(/ขั้นตอนทั้งหมดประมาณ 2–3 นาที/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /สร้างใบประกาศของฉัน/ })).toHaveAttribute(
      "href",
      "/checkin/YALA-DEMO-01/start",
    );
  });

  it("makes photo optional without blocking a certificate", () => {
    render(<PhotoUploadClient visitId="visit-1" />);

    expect(screen.getByRole("link", { name: /ข้ามขั้นตอนนี้/ })).toBeInTheDocument();
    expect(screen.getByText(/ใบประกาศไม่มีรูป/)).toBeInTheDocument();
  });

  it("makes the post-certificate survey optional", () => {
    render(<SurveySkipCard visitId="visit-1" />);

    expect(screen.getByRole("button", { name: /ข้ามแบบสอบถาม/ })).toBeInTheDocument();
    expect(screen.getByText(/ใบประกาศและตราประทับของคุณจะไม่ถูกยกเลิก/)).toBeInTheDocument();
  });

  it("explains data use and privacy in the check-in entry", () => {
    render(<CheckinLanding details={details} />);

    expect(screen.getByText(/ใช้ข้อมูลเท่าที่จำเป็น/)).toBeInTheDocument();
    expect(screen.getByText(/วิเคราะห์สถิติการท่องเที่ยวในภาพรวม/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "นโยบายความเป็นส่วนตัว" })).toHaveAttribute(
      "href",
      "/privacy",
    );

    render(<MinimalForm checkinCode="YALA-DEMO-01" countries={countries} provinces={provinces} />);
    expect(screen.getByText(/ยินยอมให้ใช้ข้อมูลเพื่อสร้างใบประกาศ/)).toBeInTheDocument();
    expect(screen.getByText(/วิเคราะห์ภาพรวมการท่องเที่ยว/)).toBeInTheDocument();
  });

  it("states that photo and survey steps remain optional before the tourist starts", () => {
    render(<CheckinLanding details={details} />);

    expect(screen.getByText(/รูปภาพไม่บังคับ/)).toBeInTheDocument();
    expect(screen.getByText(/แบบสำรวจไม่บังคับ/)).toBeInTheDocument();
  });

  it("keeps a returning tourist's prefilled profile editable", async () => {
    const user = userEvent.setup();
    render(
      <MinimalForm
        checkinCode="YALA-DEMO-01"
        countries={countries}
        provinces={provinces}
        initialProfile={{
          displayName: "นักเดินทางเดิม",
          originCountryId: 1,
          originProvinceId: 1,
          ageGroup: "25_34",
          hasCurrentConsent: true,
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "แก้ไขข้อมูล" }));

    expect(screen.getByLabelText("ชื่อที่แสดงบนใบประกาศ")).toHaveValue("นักเดินทางเดิม");
    expect(screen.getByRole("combobox", { name: "ประเทศที่เดินทางมา" })).toHaveValue("1");
    expect(screen.getByRole("radio", { name: /25–34|25-34/ })).toBeChecked();
  });

  it("does not expose visit time as a user-editable field", () => {
    render(<MinimalForm checkinCode="YALA-DEMO-01" countries={countries} provinces={provinces} />);

    expect(document.querySelector('input[type="date"]')).not.toBeInTheDocument();
    expect(document.querySelector('input[type="datetime-local"]')).not.toBeInTheDocument();
    expect(document.querySelector('input[type="time"]')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/วันที่|เวลาเข้าชม|เวลาที่เช็กอิน/)).not.toBeInTheDocument();
  });

  it("keeps the photo step skippable in the form action copy", () => {
    render(<MinimalForm checkinCode="YALA-DEMO-01" countries={countries} provinces={provinces} />);

    expect(screen.getByRole("button", { name: "บันทึกและไปขั้นตอนรูปภาพ" })).toBeInTheDocument();
    expect(screen.getByText(/เลือกข้ามรูปภาพได้/)).toBeInTheDocument();
  });

  it("shows four truthful progress labels, including the optional survey", () => {
    vi.mocked(resolveAndValidateCheckinCode).mockResolvedValue({ status: "valid", details });

    return CheckinLandingPage({ params: Promise.resolve({ code: details.code }) }).then((page) => {
      render(page);

      const progress = screen.getByRole("navigation", { name: "ขั้นตอนการรับใบประกาศ" });
      expect(within(progress).getByText("ข้อมูลสั้น ๆ")).toBeInTheDocument();
      expect(within(progress).getByText(/รูป\/ใบประกาศ/)).toBeInTheDocument();
      expect(within(progress).getByText("รับรางวัล")).toBeInTheDocument();
      expect(within(progress).getByText(/แบบสำรวจ.*ไม่บังคับ/)).toBeInTheDocument();
    });
  });

  it("uses a focused shell throughout the check-in and visit flow", () => {
    expect(shouldHidePublicChrome("/checkin/YALA-DEMO-01")).toBe(true);
    expect(shouldHidePublicChrome("/checkin/YALA-DEMO-01/start")).toBe(true);
    expect(shouldHidePublicChrome("/visit/visit-1/photo")).toBe(true);
    expect(shouldHidePublicChrome("/visit/visit-1/survey")).toBe(true);
    expect(shouldHidePublicChrome("/attractions")).toBe(false);
  });
});
