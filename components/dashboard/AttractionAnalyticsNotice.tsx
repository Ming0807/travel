import { ArrowClockwise, ArrowRight, Buildings, SlidersHorizontal, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export type AttractionAnalyticsNoticeCode =
  | "options_unavailable"
  | "no_attractions"
  | "invalid_filters"
  | "scope_mismatch"
  | "scope_limit"
  | "attraction_unavailable"
  | "analytics_unavailable";

const COPY = {
  options_unavailable: {
    title: "ยังโหลดรายการสถานที่ไม่ได้",
    description: "รายการสถานที่ไม่พร้อมใช้งานชั่วคราว จึงยังไม่แสดงผลวิเคราะห์ กรุณาลองโหลดอีกครั้ง",
    action: "ลองโหลดอีกครั้ง",
    failure: true,
  },
  no_attractions: {
    title: "ยังไม่มีสถานที่พร้อมวิเคราะห์",
    description: "ยังไม่มีสถานที่ที่เปิดใช้งานและเผยแพร่ในขอบเขตนี้ กรุณาให้ผู้ดูแลเนื้อหาตรวจสอบสถานะสถานที่ก่อนเริ่มวิเคราะห์",
    action: "ตรวจรายการอีกครั้ง",
    failure: false,
  },
  invalid_filters: {
    title: "ตัวกรองไม่ถูกต้อง",
    description: "กรุณาเลือกสถานที่และช่วงวันที่ไม่เกิน 2 ปี ระบบยังไม่ได้แสดงผลหรือเปลี่ยนไปวิเคราะห์ขอบเขตอื่น",
    action: "เริ่มเลือกตัวกรองใหม่",
    failure: true,
  },
  scope_mismatch: {
    title: "จุดเช็กอินหรือแคมเปญไม่ตรงกับสถานที่",
    description: "ตัวกรองนี้ไม่ได้อยู่ในสถานที่ที่เลือก หรือจุดเช็กอินไม่อยู่ในแคมเปญที่เลือก จึงยังไม่แสดงกราฟเพื่อไม่ให้ตีความว่าไม่มีผู้เข้าชม เลือกใหม่ในตัวกรองหรือล้างเฉพาะสองค่านี้",
    action: "ล้างตัวกรองเฉพาะจุด",
    failure: true,
  },
  scope_limit: {
    title: "จุดเช็กอินมากเกินขอบเขตการอ่านสด",
    description: "สถานที่นี้มีจุดเช็กอินมากกว่าที่หน้าวิเคราะห์อ่านได้ครบ ระบบจึงไม่แสดงกราฟหรือสรุปบางส่วนเป็นข้อมูลทั้งหมด กรุณาแจ้งผู้ดูแลระบบให้จัดเตรียมข้อมูลสรุปก่อนใช้ผลรายสถานที่",
    action: "กลับภาพรวม",
    failure: false,
  },
  attraction_unavailable: {
    title: "สถานที่ที่เลือกไม่พร้อมวิเคราะห์",
    description: "สถานที่นี้อาจถูกปิดใช้งาน เลิกเผยแพร่ หรือไม่อยู่ในขอบเขตปัจจุบัน กรุณาเลือกสถานที่ใหม่ โดยระบบไม่ได้สลับข้อมูลให้อัตโนมัติ",
    action: "เลือกสถานที่ใหม่",
    failure: false,
  },
  analytics_unavailable: {
    title: "ข้อมูลวิเคราะห์ไม่พร้อมใช้งานชั่วคราว",
    description: "ยังโหลดผลในขอบเขตที่เลือกไม่ได้ ไม่ใช่ผลวิเคราะห์ที่มีค่าเป็นศูนย์ กรุณาลองโหลดอีกครั้งโดยใช้ตัวกรองเดิม",
    action: "ลองโหลดอีกครั้ง",
    failure: true,
  },
} satisfies Record<AttractionAnalyticsNoticeCode, {
  title: string;
  description: string;
  action: string;
  failure: boolean;
}>;

export function AttractionAnalyticsNotice({ code, href }: { code: AttractionAnalyticsNoticeCode; href: string }) {
  const copy = COPY[code];
  const reset = code === "invalid_filters" || code === "attraction_unavailable" || code === "scope_mismatch" || code === "scope_limit";
  const Icon = code === "invalid_filters" || code === "scope_mismatch" ? SlidersHorizontal : copy.failure ? WarningCircle : Buildings;
  const ActionIcon = reset ? ArrowRight : ArrowClockwise;

  return (
    <section
      role={copy.failure ? "alert" : "status"}
      aria-labelledby="attraction-analytics-notice-heading"
      className="rounded-md border border-slate-200 bg-white p-5 sm:p-6"
      data-analytics-state={code}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${copy.failure ? "bg-amber-50 text-amber-800" : "bg-orange-50 text-[#9A3412]"}`}>
          <Icon size={24} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="attraction-analytics-notice-heading" className="text-lg font-black leading-7 text-slate-950">{copy.title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{copy.description}</p>
          <a href={href} className="mt-4 inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-[4px] bg-[#202020] px-4 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-[#B94727] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B94727]">
            <ActionIcon size={18} className="shrink-0" aria-hidden="true" />
            {copy.action}
          </a>
        </div>
      </div>
    </section>
  );
}
