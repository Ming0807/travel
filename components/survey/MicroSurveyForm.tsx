"use client";

import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Spinner } from "@phosphor-icons/react";
import {
  submitPostCertificateSurveyAction,
  type SurveyFormState,
} from "@/app/actions/survey-actions";

type Option = {
  [key: string]: unknown;
  display_order?: number | null;
};

type SurveyOptions = {
  travelCompanions: Option[];
  transportModes: Option[];
  travelPurposes: Option[];
  expenseCategories: Option[];
  spendingRanges: Option[];
};

const STEP_TITLES = ["การเดินทาง", "การพักค้างและค่าใช้จ่าย", "ความพึงพอใจ"] as const;

function optionLabel(option: Option, thKey = "name_th", enKey = "name_en") {
  return String(option[thKey] || option[enKey] || "ตัวเลือก");
}

function optionValue(option: Option, key: string) {
  return String(option[key] || "");
}

function OptionGrid({
  name,
  options,
  valueKey,
  selectedValue,
  onChange,
  thKey,
  enKey,
}: {
  name: string;
  options: Option[];
  valueKey: string;
  selectedValue: string;
  onChange: (value: string) => void;
  thKey?: string;
  enKey?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const value = optionValue(option, valueKey);
        return (
          <label
            key={value}
            className="flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-3 text-center text-sm font-semibold text-ink transition-colors has-[:checked]:border-[#0A6B62] has-[:checked]:bg-[#0A6B62] has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0A6B62]"
          >
            <input
              className="sr-only"
              type="radio"
              name={name}
              value={value}
              checked={selectedValue === value}
              onChange={() => onChange(value)}
            />
            {optionLabel(option, thKey, enKey)}
          </label>
        );
      })}
    </div>
  );
}

function RatingGroup({
  name,
  label,
  selectedValue,
  onChange,
}: {
  name: string;
  label: string;
  selectedValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="border-b border-slate-200 py-4 last:border-b-0">
      <legend className="mb-3 text-sm font-bold text-ink">{label}</legend>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => {
          const value = String(score);
          return (
            <label
              key={score}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-black text-[#075049] transition-colors has-[:checked]:border-[#E77455] has-[:checked]:bg-[#E77455] has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0A6B62]"
            >
              <input
                className="sr-only"
                type="radio"
                name={name}
                value={value}
                aria-label={`${score} ${score === 1 ? "น้อย" : score === 5 ? "มาก" : ""}`.trim()}
                checked={selectedValue === value}
                onChange={() => onChange(value)}
              />
              {score}
            </label>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold text-slate-500">
        <span>1 น้อยที่สุด</span>
        <span>5 มากที่สุด</span>
      </div>
    </fieldset>
  );
}

export function MicroSurveyForm({
  visitId,
  options,
  error,
}: {
  visitId: string;
  options: SurveyOptions;
  error?: string;
}) {
  const [state, setState] = useState<SurveyFormState>({ message: error });
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const setValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await submitPostCertificateSurveyAction(state, formData);
      setState(result ?? {});
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <input type="hidden" name="visitId" value={visitId} />

      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-black text-[#0A6B62]">ส่วนที่ {step + 1} จาก 3</p>
          <p className="text-xs font-semibold text-slate-500">ทุกข้อไม่บังคับ</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2" aria-label={`ความคืบหน้า ${step + 1} จาก 3`}>
          {STEP_TITLES.map((title, index) => (
            <div key={title} className="min-w-0">
              <div className={`h-1.5 ${index <= step ? "bg-[#E77455]" : "bg-slate-200"}`} />
              <span className={`mt-1.5 block truncate text-[11px] font-semibold ${index === step ? "text-ink" : "text-slate-500"}`}>
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {state?.message ? (
        <div role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {state.message}
        </div>
      ) : null}

      <section hidden={step !== 0} aria-labelledby="survey-travel-heading">
        <h2 id="survey-travel-heading" className="text-xl font-black text-ink">การเดินทาง</h2>
        <p className="mt-1 text-sm leading-6 text-muted">เลือกตอบเท่าที่สะดวก เพื่อช่วยให้พื้นที่เข้าใจรูปแบบการเดินทาง</p>
        <div className="mt-5 space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-ink">เดินทางมากับใคร</legend>
            <OptionGrid name="travelCompanionId" options={options.travelCompanions} valueKey="travel_companion_id" selectedValue={values.travelCompanionId ?? ""} onChange={(value) => setValue("travelCompanionId", value)} />
          </fieldset>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-ink">จำนวนคนในกลุ่ม</span>
            <input name="groupSize" inputMode="numeric" min={1} max={100} type="number" value={values.groupSize ?? ""} onChange={(event) => setValue("groupSize", event.currentTarget.value)} className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-ink outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" placeholder="เช่น 2" />
          </label>
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-ink">เดินทางมาด้วยวิธีใด</legend>
            <OptionGrid name="transportModeId" options={options.transportModes} valueKey="transport_mode_id" selectedValue={values.transportModeId ?? ""} onChange={(value) => setValue("transportModeId", value)} />
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-ink">วัตถุประสงค์หลัก</legend>
            <OptionGrid name="travelPurposeId" options={options.travelPurposes} valueKey="travel_purpose_id" selectedValue={values.travelPurposeId ?? ""} onChange={(value) => setValue("travelPurposeId", value)} />
          </fieldset>
        </div>
      </section>

      <section hidden={step !== 1} aria-labelledby="survey-expense-heading">
        <h2 id="survey-expense-heading" className="text-xl font-black text-ink">การพักค้างและค่าใช้จ่าย</h2>
        <p className="mt-1 text-sm leading-6 text-muted">ใช้ช่วงค่าใช้จ่ายโดยประมาณ ไม่ต้องระบุรายได้หรือยอดเงินที่ละเอียด</p>
        <div className="mt-5 space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-ink">ทริปนี้พักค้างคืนหรือไม่</legend>
            <div className="grid grid-cols-3 gap-2">
              {[["same_day", "ไป-กลับ"], ["overnight", "ค้างคืน"], ["unknown", "ไม่ระบุ"]].map(([value, label]) => (
                <label key={value} className="flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-center text-sm font-semibold text-ink has-[:checked]:border-[#0A6B62] has-[:checked]:bg-[#0A6B62] has-[:checked]:text-white">
                  <input className="sr-only" type="radio" name="overnightStatus" value={value} checked={values.overnightStatus === value} onChange={() => setValue("overnightStatus", value)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-ink">จำนวนคืน (ถ้ามี)</span>
            <input name="nightsCount" inputMode="numeric" min={0} max={60} type="number" value={values.nightsCount ?? ""} onChange={(event) => setValue("nightsCount", event.currentTarget.value)} className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-ink outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" placeholder="เช่น 1" />
          </label>
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-ink">ค่าใช้จ่ายโดยประมาณ</legend>
            <OptionGrid name="spendingRangeId" options={options.spendingRanges} valueKey="spending_range_id" thKey="range_label_th" enKey="range_label_en" selectedValue={values.spendingRangeId ?? ""} onChange={(value) => setValue("spendingRangeId", value)} />
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-ink">ใช้จ่ายกับหมวดใดมากที่สุด</legend>
            <OptionGrid name="expenseCategoryId" options={options.expenseCategories} valueKey="expense_category_id" selectedValue={values.expenseCategoryId ?? ""} onChange={(value) => setValue("expenseCategoryId", value)} />
          </fieldset>
        </div>
      </section>

      <section hidden={step !== 2} aria-labelledby="survey-satisfaction-heading">
        <h2 id="survey-satisfaction-heading" className="text-xl font-black text-ink">ความพึงพอใจ</h2>
        <p className="mt-1 text-sm leading-6 text-muted">คะแนนที่ไม่ตอบจะเก็บเป็น “ไม่มีข้อมูล” ไม่ใช่ 0</p>
        <div className="mt-4">
          {[
            ["overallSatisfaction", "ความพึงพอใจโดยรวม"],
            ["safetyScore", "ความรู้สึกปลอดภัย"],
            ["cleanlinessScore", "ความสะอาด"],
            ["accessibilityScore", "การเข้าถึงและการเดินทาง"],
            ["informationScore", "ข้อมูลและป้ายบอกทาง"],
            ["valueScore", "ความคุ้มค่า"],
            ["facilityScore", "สิ่งอำนวยความสะดวก (Facility)"],
          ].map(([name, label]) => (
            <RatingGroup key={name} name={name} label={label} selectedValue={values[name] ?? ""} onChange={(value) => setValue(name, value)} />
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {[["revisitIntention", "อยากกลับมาอีกไหม"], ["recommendIntention", "จะแนะนำให้ผู้อื่นไหม"]].map(([name, label]) => (
            <fieldset key={name}>
              <legend className="mb-2 text-sm font-bold text-ink">{label}</legend>
              <div className="grid grid-cols-3 gap-2">
                {[["yes", "ใช่"], ["maybe", "ไม่แน่ใจ"], ["no", "ไม่"]].map(([value, text]) => (
                  <label key={value} className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-center text-xs font-bold text-ink has-[:checked]:border-[#0A6B62] has-[:checked]:bg-[#0A6B62] has-[:checked]:text-white">
                    <input className="sr-only" type="radio" name={name} value={value} checked={values[name] === value} onChange={() => setValue(name, value)} />
                    {text}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-bold text-ink">ความคิดเห็นเพิ่มเติม (ไม่บังคับ)</span>
          <textarea name="optionalComment" maxLength={1000} rows={4} value={values.optionalComment ?? ""} onChange={(event) => setValue("optionalComment", event.currentTarget.value)} className="w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" placeholder="ข้อเสนอแนะสั้น ๆ สำหรับการพัฒนาสถานที่" />
        </label>
      </section>

      <div className="sticky bottom-[calc(84px+env(safe-area-inset-bottom))] z-20 border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)] lg:static lg:shadow-none">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={step === 0 || isPending} onClick={() => setStep((current) => Math.max(0, current - 1))} className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40">
            <ArrowLeft aria-hidden="true" size={18} /> ย้อนกลับ
          </button>
          {step < 2 ? (
            <button type="button" disabled={isPending} onClick={() => setStep((current) => Math.min(2, current + 1))} className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#E77455] px-4 font-black text-white hover:bg-[#C8553A] disabled:opacity-60">
              ถัดไป <ArrowRight aria-hidden="true" size={18} />
            </button>
          ) : (
            <button type="submit" disabled={isPending} className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#E77455] px-4 font-black text-white hover:bg-[#C8553A] disabled:cursor-wait disabled:opacity-60">
              {isPending ? <><Spinner aria-hidden="true" className="animate-spin" size={18} /> กำลังบันทึก...</> : "ส่งคำตอบ"}
            </button>
          )}
        </div>
        <Link href={`/visit/${visitId}/certificate/success`} className="mt-3 flex min-h-11 items-center justify-center text-sm font-bold text-[#0A6B62] underline underline-offset-4">
          กลับไปหน้าใบประกาศ
        </Link>
      </div>
    </form>
  );
}
