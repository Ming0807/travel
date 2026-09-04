"use client";

import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DownloadSimple, WarningCircle, X } from "@phosphor-icons/react/dist/ssr";

type ExportType = "summary" | "tourists" | "visits" | "surveys" | "expenses";

const DETAILS: Record<ExportType, { includes: string; excludes: string }> = {
  summary: { includes: "ตัวชี้วัดและอันดับสถานที่แบบรวม พร้อมขอบเขต ตัวหาร ข้อยกเว้น และรุ่นสูตรคำนวณ", excludes: "ข้อมูลรายบุคคล ข้อความอิสระ และรหัสภายใน" },
  tourists: { includes: "ช่วงอายุ ประเทศต้นทาง จังหวัดต้นทาง และภาษาที่ต้องการในรูปแบบสรุป", excludes: "ชื่อ อีเมล เบอร์โทร LINE ID โทเคน และรหัสภายใน" },
  visits: { includes: "วันที่ สถานที่ จังหวัด ช่วงอายุ ต้นทาง ขนาดกลุ่ม การค้างคืน พาหนะ และวัตถุประสงค์", excludes: "ข้อมูลระบุตัวบุคคล โทเคน และรหัสภายใน" },
  surveys: { includes: "วันที่ สถานที่ จังหวัด คะแนนรายด้าน และความตั้งใจกลับมาเที่ยวหรือแนะนำต่อ", excludes: "ข้อมูลระบุตัวบุคคล โทเคน รหัสภายใน และความคิดเห็นอิสระที่อาจมีข้อมูลส่วนบุคคล" },
  expenses: { includes: "การกระจายช่วงและหมวดค่าใช้จ่ายจากแบบสำรวจที่สมัครใจ", excludes: "ข้อมูลระบุตัวบุคคล รหัสภายใน และยอดค่าใช้จ่ายรายบุคคล" },
};

type ExportPrivacyDialogProps = {
  endpoint: string;
  exportType: ExportType;
  label: string;
  searchParams: string;
  onMenuClose?: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

export function ExportPrivacyDialog({ endpoint, exportType, label, searchParams, onMenuClose, returnFocusRef }: ExportPrivacyDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const url = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("type", exportType);
    params.set("format", format);
    return `${endpoint}?${params.toString()}`;
  }, [endpoint, exportType, format, searchParams]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      closeRef.current?.focus();
      return;
    }

    if (!wasOpenRef.current) return;
    wasOpenRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      (returnFocusRef?.current ?? triggerRef.current)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, returnFocusRef]);

  const close = useCallback(() => {
    setOpen(false);
    onMenuClose?.();
  }, [onMenuClose]);

  const handleDialogKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [close]);

  const download = useCallback(() => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "";
    anchor.click();
    close();
  }, [close, url]);

  const details = DETAILS[exportType];
  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"><DownloadSimple aria-hidden="true" size={16} />{label}</button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`export-${exportType}-title`} aria-describedby={`export-${exportType}-description`} onKeyDown={handleDialogKeyDown} className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-md border border-slate-200 bg-white p-5 shadow-[0_4px_8px_rgba(15,23,42,0.14)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                  <WarningCircle aria-hidden="true" size={20} weight="fill" />
                </span>
                <h3 id={`export-${exportType}-title`} className="text-lg font-bold text-slate-900">ตรวจสอบก่อนดาวน์โหลด {label}</h3>
              </div>
              <button ref={closeRef} type="button" onClick={close} className="flex h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" aria-label="ปิดหน้าต่าง">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <div id={`export-${exportType}-description`} className="mt-4 space-y-3 text-sm leading-6">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-900"><strong>ข้อมูลที่รวม:</strong> {details.includes}</div>
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-900"><strong>ข้อมูลที่ไม่ส่งออก:</strong> {details.excludes}</div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-700">โปรไฟล์ไม่ใช่จำนวนบุคคลจริง การสแกน QR แยกจากการเข้าชม ค่าใช้จ่ายไม่ใช่รายได้ และช่องว่างไม่ได้หมายถึงศูนย์</div>
            </div>
            <fieldset className="mt-4">
              <legend className="text-xs font-bold text-slate-700">รูปแบบไฟล์สำหรับใช้งานต่อ</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([
                  ["csv", "CSV (.csv)", "เหมาะกับการวิเคราะห์ข้อมูล"],
                  ["xlsx", "Excel (.xlsx)", "เหมาะกับการอ่านและจัดรูปแบบ"],
                ] as const).map(([value, title, description]) => (
                  <label key={value} className={`cursor-pointer rounded-[5px] border p-3 transition-colors focus-within:ring-2 focus-within:ring-[#B94727] focus-within:ring-offset-2 ${format === value ? "border-[#B94727] bg-[#FFF7F3] text-[#71301F]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}>
                    <input aria-label={title} className="sr-only" checked={format === value} name={`export-${exportType}-format`} onChange={() => setFormat(value)} type="radio" value={value} />
                    <span className="block text-sm font-bold">{title}</span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={close} className="min-h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700">ยกเลิก</button><button type="button" onClick={download} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#171717] px-4 text-sm font-bold text-white hover:bg-[#B94727]"><DownloadSimple aria-hidden="true" size={16} />ดาวน์โหลด</button></div>
          </div>
        </div>
      ) : null}
    </>
  );
}
