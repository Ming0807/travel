import { createRoot } from "react-dom/client";
import { CheckinLanding } from "@/components/checkin/CheckinLanding";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import type { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import "@/app/globals.css";
import "./fixture-fonts.css";

const details: CheckinCodeDetails = {
  checkin_code_id: 1, code: "fixture-only", is_active: true, starts_at: null, ends_at: null,
  photo_spot: null,
  attraction: {
    attraction_id: 1, name_th: "วัดคูหาภิมุข (วัดหน้าถ้ำ)", name_en: null,
    short_description_th: null, is_active: true, is_published: true, cover_image_url: null,
    province: { province_name_th: "ยะลา", is_active: true, destination_status: "live" },
  },
};

createRoot(document.getElementById("root")!).render(
  new URLSearchParams(window.location.search).get("state") === "success"
    ? <CheckinLanding details={details} entrySessionId="fixture-only" nfcOfficialHost="tourism.example" />
    : <CheckinUnavailable status="nfc_unavailable" />,
);
