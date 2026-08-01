"use client";

import { useState } from "react";
import { ArrowCounterClockwise, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";
import {
  DEFAULT_PHOTO_ADJUSTMENT,
  type CertificateTemplatePreviewOption,
  type PhotoAdjustment,
} from "@/lib/certificate/certificate-customization";

type CertificateCustomizerProps = {
  templates: CertificateTemplatePreviewOption[];
  selectedTemplateId: number;
  adjustment: PhotoAdjustment;
  disabled?: boolean;
  onSelectTemplate: (templateId: number) => void;
  onAdjustmentChange: (adjustment: PhotoAdjustment) => void;
};

type AdjustmentKey = keyof PhotoAdjustment;

function RangeControl({
  id,
  label,
  value,
  min,
  max,
  step,
  suffix,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="flex items-center justify-between gap-4 text-sm font-bold text-ink">
        {label}
        <span className="tabular-nums text-ink-light">{value}{suffix}</span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="mt-2 h-11 w-full cursor-pointer accent-[#E77455] disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}

export function CertificateCustomizer({
  templates,
  selectedTemplateId,
  adjustment,
  disabled = false,
  onSelectTemplate,
  onAdjustmentChange,
}: CertificateCustomizerProps) {
  const [isOpen, setIsOpen] = useState(true);

  const update = (key: AdjustmentKey, value: number) => {
    onAdjustmentChange({ ...adjustment, [key]: value });
  };

  return (
    <section className="w-full rounded-lg border border-ink/10 bg-white" aria-labelledby="certificate-customizer-heading">
      {templates.length > 1 ? (
        <div className="border-b border-ink/10 p-4">
          <h2 id="certificate-customizer-heading" className="text-sm font-black text-ink">เลือกรูปแบบใบประกาศ</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="รูปแบบใบประกาศ">
            {templates.map((template) => {
              const selected = template.templateId === selectedTemplateId;
              return (
                <button
                  key={template.templateId}
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => onSelectTemplate(template.templateId)}
                  className={`min-h-11 shrink-0 rounded-md border px-4 py-2 text-left text-sm font-bold transition-colors disabled:opacity-50 ${
                    selected
                      ? "border-[#E77455] bg-[#FFF1EC] text-[#A64027]"
                      : "border-ink/10 bg-white text-ink hover:border-ink/30"
                  }`}
                >
                  <span className="block">{template.templateName}</span>
                  <span className="mt-0.5 block text-xs font-medium opacity-70">
                    {template.attractionId ? "เฉพาะสถานที่" : "ใช้ได้ทุกสถานที่"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <h2 id="certificate-customizer-heading" className="sr-only">ปรับแต่งใบประกาศ</h2>
      )}

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="certificate-photo-controls"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-black text-ink disabled:opacity-50"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={20} aria-hidden="true" />
          ปรับรูปภาพ
        </span>
        <span className="text-xs font-semibold text-ink-light">{isOpen ? "ซ่อนเครื่องมือ" : "ซูมและจัดตำแหน่ง"}</span>
      </button>

      {isOpen ? (
        <div id="certificate-photo-controls" className="space-y-4 border-t border-ink/10 px-4 pb-5 pt-4">
          <RangeControl
            id="certificate-photo-zoom"
            label="ซูมรูปภาพ"
            value={adjustment.zoom}
            min={1}
            max={2}
            step={0.05}
            suffix="×"
            disabled={disabled}
            onChange={(value) => update("zoom", value)}
          />
          <RangeControl
            id="certificate-photo-x"
            label="ตำแหน่งแนวนอน"
            value={adjustment.x}
            min={0}
            max={100}
            step={1}
            suffix="%"
            disabled={disabled}
            onChange={(value) => update("x", value)}
          />
          <RangeControl
            id="certificate-photo-y"
            label="ตำแหน่งแนวตั้ง"
            value={adjustment.y}
            min={0}
            max={100}
            step={1}
            suffix="%"
            disabled={disabled}
            onChange={(value) => update("y", value)}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAdjustmentChange(DEFAULT_PHOTO_ADJUSTMENT)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-bold text-ink hover:border-ink/30 disabled:opacity-50"
          >
            <ArrowCounterClockwise size={18} aria-hidden="true" />
            คืนค่าเดิม
          </button>
        </div>
      ) : null}
    </section>
  );
}
