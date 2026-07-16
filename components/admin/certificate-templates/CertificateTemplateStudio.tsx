"use client";

import { useId, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowCounterClockwise,
  Check,
  FloppyDisk,
  WarningCircle,
} from "@phosphor-icons/react";
import { updateCertificateTemplateLayout } from "@/app/actions/admin-certificate-templates";
import { CertificateArtwork } from "@/components/certificate/CertificateArtwork";
import {
  createDefaultCertificateLayout,
  getCertificateLayoutWarnings,
  type CertificateTemplateLayout,
} from "@/lib/certificate/certificate-template-layout";

type StudioTemplate = {
  templateId: number;
  templateName: string;
  backgroundUrl: string;
  attractionName: string | null;
  language: string;
  layout: CertificateTemplateLayout;
};

const warningMessages = {
  PHOTO_CONTENT_OVERLAP: "กรอบรูปทับพื้นที่ข้อความ",
  PHOTO_OUTSIDE_SAFE_ZONE: "กรอบรูปอยู่นอกขอบเขตปลอดภัย",
  CONTENT_OUTSIDE_SAFE_ZONE: "ข้อความอยู่นอกขอบเขตปลอดภัย",
} as const;

function RangeControl({
  label,
  value,
  min,
  max,
  suffix = "%",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const inputId = useId();
  return (
    <div className="grid min-h-11 grid-cols-[minmax(0,1fr)_4rem] items-center gap-x-3 gap-y-2 text-sm">
      <label htmlFor={inputId} className="font-medium text-slate-700">{label}</label>
      <output htmlFor={inputId} className="text-right font-semibold tabular-nums text-slate-900">
        {value}{suffix}
      </output>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="col-span-2 h-2 w-full cursor-pointer accent-[#0A6B62]"
      />
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">{label}</legend>
      <div className="grid auto-cols-fr grid-flow-col rounded-lg border border-slate-300 bg-slate-50 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`min-h-10 rounded-md px-2 text-xs font-semibold transition-colors ${
              value === option.value
                ? "bg-white text-[#075049] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function CertificateTemplateStudio({ template }: { template: StudioTemplate }) {
  const [layout, setLayout] = useState(template.layout);
  const [savedLayout, setSavedLayout] = useState(template.layout);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [activePanel, setActivePanel] = useState<"frame" | "photo" | "text" | "style">("frame");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const warnings = useMemo(() => getCertificateLayoutWarnings(layout), [layout]);
  const isDirty = useMemo(
    () => JSON.stringify(layout) !== JSON.stringify(savedLayout),
    [layout, savedLayout]
  );

  function update<K extends keyof CertificateTemplateLayout>(
    key: K,
    value: CertificateTemplateLayout[K]
  ) {
    setLayout((current) => ({ ...current, [key]: value }));
    setSaveState("idle");
  }

  function resetLayout() {
    setLayout(createDefaultCertificateLayout(layout.orientation, layout.theme));
    setSaveState("idle");
    setError(null);
  }

  function discardChanges() {
    setLayout(savedLayout);
    setSaveState("idle");
    setError(null);
  }

  function saveLayout() {
    startTransition(async () => {
      setError(null);
      try {
        await updateCertificateTemplateLayout(template.templateId, layout);
        setSavedLayout(layout);
        setSaveState("saved");
      } catch (saveError) {
        setSaveState("error");
        setError(
          saveError instanceof Error
            ? saveError.message
            : "ไม่สามารถบันทึกรูปแบบเทมเพลตได้"
        );
      }
    });
  }

  const renderSaveButton = (ariaLabel: string) => (
    <button
      type="button"
      onClick={saveLayout}
      disabled={isPending || !isDirty || warnings.length > 0}
      aria-label={ariaLabel}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0A6B62] px-5 text-sm font-semibold text-white hover:bg-[#075049] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saveState === "saved" ? <Check size={18} weight="bold" /> : <FloppyDisk size={18} />}
      {isPending ? "กำลังบันทึก..." : saveState === "saved" ? "บันทึกแล้ว" : "บันทึกรูปแบบ"}
    </button>
  );

  const renderDiscardButton = (ariaLabel: string) => (
    <button
      type="button"
      onClick={discardChanges}
      disabled={isPending || !isDirty}
      aria-label={ariaLabel}
      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      ยกเลิกการแก้ไข
    </button>
  );

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/admin/certificate-templates"
            className="mb-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            กลับไปหน้าเทมเพลต
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">ออกแบบ {template.templateName}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {template.attractionName || "ใช้ได้ทุกสถานที่"} · {template.language === "en" ? "ภาษาอังกฤษ" : "ภาษาไทย"}
          </p>
        </div>
        <div className="hidden gap-2 lg:flex">
          {renderDiscardButton("ยกเลิกการแก้ไขจากส่วนหัว")}
          {renderSaveButton("บันทึกรูปแบบจากส่วนหัว")}
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="min-w-0 xl:sticky xl:top-4">
          <div className="flex min-h-[360px] items-center justify-center bg-slate-200 p-4 sm:p-8">
            <div
              className={`relative w-full overflow-hidden bg-white shadow-md ${
                layout.orientation === "landscape"
                  ? "aspect-[1.414/1] max-w-[760px]"
                  : "aspect-[4/5] max-w-[480px]"
              }`}
            >
              <CertificateArtwork
                layout={layout}
                templateBackgroundUrl={template.backgroundUrl}
                previewUrl=""
                touristName="นักเดินทางชายแดนใต้"
                attractionName={template.attractionName || "สถานที่ท่องเที่ยวชายแดนใต้"}
                provinceName="ยะลา · ปัตตานี · นราธิวาส"
                visitDate="16 กรกฎาคม 2569"
                showSafeZone
              />
            </div>
          </div>
          <div className="mt-3 min-h-12">
            {warnings.length > 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <WarningCircle className="mt-0.5 shrink-0" size={18} weight="fill" />
                <div>
                  <p className="font-semibold">ยังบันทึกไม่ได้</p>
                  <ul className="mt-1 space-y-1">
                    {warnings.map((warning) => <li key={warning}>{warningMessages[warning]}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <Check size={18} weight="bold" /> องค์ประกอบอยู่ในขอบเขตปลอดภัย
              </p>
            )}
          </div>
        </section>

        <aside className="divide-y divide-slate-200 border-y border-slate-200 bg-white lg:border lg:p-5">
          <div role="tablist" aria-label="เครื่องมือออกแบบเทมเพลต" className="grid grid-cols-4 gap-1 border-b border-slate-200 p-1 lg:mb-5 lg:border lg:p-1">
            {([
              ["frame", "กรอบ"],
              ["photo", "รูป"],
              ["text", "ข้อความ"],
              ["style", "สี"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                id={`studio-tab-${value}`}
                aria-controls={`studio-panel-${value}`}
                aria-selected={activePanel === value}
                onClick={() => setActivePanel(value)}
                className={`min-h-10 rounded-md px-2 text-xs font-semibold ${
                  activePanel === value
                    ? "bg-[#E6F4EF] text-[#075049]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activePanel === "frame" ? <section id="studio-panel-frame" role="tabpanel" aria-labelledby="studio-tab-frame" className="space-y-4 px-1 py-5 lg:px-0 lg:pt-0">
            <h2 className="text-base font-bold text-slate-900">กรอบงาน</h2>
            <div className="flex min-h-11 items-center justify-between gap-3 border-b border-slate-200 pb-3 text-sm">
              <span className="font-medium text-slate-700">แนวภาพจากไฟล์พื้นหลัง</span>
              <strong className="text-slate-900">
                {layout.orientation === "landscape" ? "แนวนอน" : "แนวตั้ง"}
              </strong>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              หากต้องการอีกแนว ให้สร้างเทมเพลตใหม่ด้วยภาพพื้นหลังในสัดส่วนที่ต้องการ
            </p>
            <p className="border-l-2 border-amber-400 pl-3 text-xs leading-5 text-slate-600">
              ควรใช้ภาพพื้นหลังเปล่าที่ไม่มีชื่อหรือรูปนักท่องเที่ยวฝังอยู่ เพื่อไม่ให้เนื้อหาซ้อนกันตอนสร้างใบประกาศ
            </p>
            <RangeControl label="ขอบเขตปลอดภัย" value={layout.safeMargin} min={4} max={12} onChange={(value) => update("safeMargin", value)} />
          </section> : null}

          {activePanel === "photo" ? <section id="studio-panel-photo" role="tabpanel" aria-labelledby="studio-tab-photo" className="space-y-4 px-1 py-5 lg:px-0">
            <h2 className="text-base font-bold text-slate-900">รูปนักท่องเที่ยว</h2>
            <SegmentedControl
              label="รูปทรง"
              value={layout.photoShape}
              options={[{ value: "circle", label: "วงกลม" }, { value: "rounded", label: "มุมมน" }, { value: "square", label: "สี่เหลี่ยม" }]}
              onChange={(value) => update("photoShape", value)}
            />
            <RangeControl label="ตำแหน่งแนวนอน" value={layout.photoX} min={10} max={90} onChange={(value) => update("photoX", value)} />
            <RangeControl label="ตำแหน่งแนวตั้ง" value={layout.photoY} min={12} max={88} onChange={(value) => update("photoY", value)} />
            <RangeControl label="ขนาดรูป" value={layout.photoSize} min={16} max={44} onChange={(value) => update("photoSize", value)} />
          </section> : null}

          {activePanel === "text" ? <section id="studio-panel-text" role="tabpanel" aria-labelledby="studio-tab-text" className="space-y-4 px-1 py-5 lg:px-0">
            <h2 className="text-base font-bold text-slate-900">ข้อความ</h2>
            <SegmentedControl
              label="จัดแนว"
              value={layout.textAlign}
              options={[{ value: "left", label: "ซ้าย" }, { value: "center", label: "กลาง" }, { value: "right", label: "ขวา" }]}
              onChange={(value) => update("textAlign", value)}
            />
            <RangeControl label="ตำแหน่งแนวนอน" value={layout.contentX} min={15} max={85} onChange={(value) => update("contentX", value)} />
            <RangeControl label="ตำแหน่งแนวตั้ง" value={layout.contentY} min={18} max={82} onChange={(value) => update("contentY", value)} />
            <RangeControl label="ความกว้างข้อความ" value={layout.contentWidth} min={28} max={82} onChange={(value) => update("contentWidth", value)} />
            <RangeControl label="ขนาดหัวเรื่อง" value={layout.titleScale} min={80} max={130} onChange={(value) => update("titleScale", value)} />
          </section> : null}

          {activePanel === "style" ? <section id="studio-panel-style" role="tabpanel" aria-labelledby="studio-tab-style" className="space-y-4 px-1 py-5 lg:px-0">
            <h2 className="text-base font-bold text-slate-900">สีและความชัด</h2>
            <label className="flex min-h-11 items-center justify-between gap-3 text-sm font-medium text-slate-700">
              สีข้อความ
              <input type="color" value={layout.textColor} onChange={(event) => update("textColor", event.target.value)} className="h-10 w-14 cursor-pointer rounded border border-slate-300 bg-white p-1" />
            </label>
            <label className="flex min-h-11 items-center justify-between gap-3 text-sm font-medium text-slate-700">
              สีเน้น
              <input type="color" value={layout.accentColor} onChange={(event) => update("accentColor", event.target.value)} className="h-10 w-14 cursor-pointer rounded border border-slate-300 bg-white p-1" />
            </label>
            <RangeControl label="พื้นขาวช่วยอ่านข้อความ" value={layout.overlayOpacity} min={0} max={70} onChange={(value) => update("overlayOpacity", value)} />
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={layout.showProvince} onChange={(event) => update("showProvince", event.target.checked)} className="h-5 w-5 accent-[#0A6B62]" />
              แสดงจังหวัด
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={layout.showDate} onChange={(event) => update("showDate", event.target.checked)} className="h-5 w-5 accent-[#0A6B62]" />
              แสดงวันที่เดินทาง
            </label>
          </section> : null}

          <section className="flex flex-col gap-3 px-1 py-5 lg:px-0 lg:pb-0">
            <button type="button" onClick={resetLayout} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <ArrowCounterClockwise size={18} /> คืนค่าแนะนำ
            </button>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white p-3 [&>button]:w-full lg:hidden">
        {renderDiscardButton("ยกเลิกการแก้ไขบนมือถือ")}
        {renderSaveButton("บันทึกรูปแบบบนมือถือ")}
      </div>
    </div>
  );
}
