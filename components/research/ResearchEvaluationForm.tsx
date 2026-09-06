"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, FloppyDisk } from "@phosphor-icons/react";

import { saveResearchEvaluationAction } from "@/app/actions/research-actions";

type AnswerValue = number | string | boolean;
type SavedAnswer =
  | { itemCode: string; integerValue: number }
  | { itemCode: string; textValue: string }
  | { itemCode: string; booleanValue: boolean };

type EvaluationItem = {
  itemCode: string;
  constructKey: string;
  promptTh: string;
  promptEn: string | null;
  answerType: string;
  options: unknown;
  displayOrder: number;
  isRequired: boolean;
};

const SECTION_LABELS: Record<string, string> = {
  system_quality: "คุณภาพของระบบ",
  information_quality: "คุณภาพของข้อมูล",
  perceived_ease_of_use: "ความง่ายในการใช้งาน",
  perceived_usefulness: "ประโยชน์ที่ได้รับ",
  engagement: "ประสบการณ์และแรงจูงใจ",
  privacy_trust: "ความเชื่อมั่นและความเป็นส่วนตัว",
  user_satisfaction: "ความพึงพอใจ",
  behavioral_intention: "ความตั้งใจใช้งานต่อ",
  incentive: "ใบประกาศ ตราประทับ และอันดับ",
  comment: "ความคิดเห็นเพิ่มเติม",
};

const AGREEMENT_LABELS = [
  "ไม่เห็นด้วยอย่างยิ่ง",
  "ไม่เห็นด้วย",
  "ปานกลาง",
  "เห็นด้วย",
  "เห็นด้วยอย่างยิ่ง",
];
const RATING_LABELS = ["น้อยที่สุด", "น้อย", "ปานกลาง", "มาก", "มากที่สุด"];

function initialValues(savedAnswers: SavedAnswer[]) {
  return savedAnswers.reduce<Record<string, AnswerValue>>((values, answer) => {
    if ("integerValue" in answer) values[answer.itemCode] = answer.integerValue;
    else if ("textValue" in answer) values[answer.itemCode] = answer.textValue;
    else values[answer.itemCode] = answer.booleanValue;
    return values;
  }, {});
}

function answerPayload(values: Record<string, AnswerValue>): SavedAnswer[] {
  return Object.entries(values).reduce<SavedAnswer[]>((answers, [itemCode, value]) => {
    if (typeof value === "number") answers.push({ itemCode, integerValue: value });
    else if (typeof value === "boolean") answers.push({ itemCode, booleanValue: value });
    else {
      const textValue = value.trim();
      if (textValue) answers.push({ itemCode, textValue });
    }
    return answers;
  }, []);
}

function choiceOptions(options: unknown) {
  if (!Array.isArray(options)) return [];
  return options.flatMap((option) => {
    if (typeof option === "string" || typeof option === "number") {
      return [{ value: String(option), label: String(option) }];
    }
    if (!option || typeof option !== "object") return [];
    const record = option as Record<string, unknown>;
    const value = record.value ?? record.code;
    const label = record.label_th ?? record.label ?? record.name_th;
    return value === undefined || label === undefined ? [] : [{ value: String(value), label: String(label) }];
  });
}

function RatingInput({
  item,
  value,
  onChange,
}: {
  item: EvaluationItem;
  value: AnswerValue | undefined;
  onChange: (value: number) => void;
}) {
  const labels = item.answerType === "agreement_5" ? AGREEMENT_LABELS : RATING_LABELS;
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
      {labels.map((label, index) => {
        const score = index + 1;
        const selected = value === score;
        return (
          <label key={score} className="min-w-0 cursor-pointer text-center">
            <input
              type="radio"
              name={item.itemCode}
              value={score}
              aria-label={`${score} ${label}`}
              checked={selected}
              onChange={() => onChange(score)}
              className="peer sr-only"
            />
            <span className={`flex min-h-12 items-center justify-center border px-1 text-sm font-black transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal ${selected ? "border-teal bg-teal text-white" : "border-slate-300 bg-white text-slate-700 hover:border-teal"}`}>
              {score}
            </span>
            <span className="mt-1.5 block text-[11px] leading-4 text-slate-600">{label}</span>
          </label>
        );
      })}
    </div>
  );
}

function ItemInput({
  item,
  value,
  onChange,
}: {
  item: EvaluationItem;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}) {
  if (item.answerType === "agreement_5" || item.answerType === "rating_5") {
    return <RatingInput item={item} value={value} onChange={onChange} />;
  }
  if (item.answerType === "boolean") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {([[true, "ใช่"], [false, "ไม่ใช่"]] as const satisfies ReadonlyArray<readonly [boolean, string]>).map(([choice, label]) => (
          <label key={label} className={`flex min-h-12 cursor-pointer items-center justify-center border px-4 font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal ${value === choice ? "border-teal bg-teal text-white" : "border-slate-300 bg-white text-slate-700"}`}>
            <input type="radio" name={item.itemCode} className="sr-only" checked={value === choice} onChange={() => onChange(choice)} />
            {label}
          </label>
        ))}
      </div>
    );
  }
  if (item.answerType === "single_choice") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {choiceOptions(item.options).map((choice) => (
          <label key={choice.value} className={`flex min-h-12 cursor-pointer items-center border px-4 text-sm font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal ${value === choice.value ? "border-teal bg-teal text-white" : "border-slate-300 bg-white text-slate-700"}`}>
            <input type="radio" name={item.itemCode} className="sr-only" checked={value === choice.value} onChange={() => onChange(choice.value)} />
            {choice.label}
          </label>
        ))}
      </div>
    );
  }
  if (item.answerType === "integer") {
    return (
      <input
        type="number"
        inputMode="numeric"
        value={typeof value === "number" ? value : ""}
        onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
        className="min-h-12 w-full border border-slate-300 bg-white px-4 text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
      />
    );
  }
  const long = item.answerType === "long_text";
  return (
    <textarea
      rows={long ? 5 : 3}
      maxLength={2000}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-y border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
      placeholder={item.isRequired ? "กรุณาพิมพ์คำตอบ" : "ไม่บังคับ"}
    />
  );
}

export function ResearchEvaluationForm({
  visitId,
  instrumentKey,
  items,
  savedAnswers,
  completionHref,
  pauseHref,
  withdrawHref,
}: {
  visitId?: string;
  instrumentKey: string;
  items: EvaluationItem[];
  savedAnswers: SavedAnswer[];
  completionHref?: string;
  pauseHref?: string;
  withdrawHref?: string;
}) {
  const router = useRouter();
  const resolvedCompletionHref = completionHref ?? (visitId ? `/visit/${visitId}/evaluation?completed=1` : "/");
  const resolvedPauseHref = pauseHref ?? (visitId ? `/visit/${visitId}/certificate/success` : "/");
  const resolvedWithdrawHref = withdrawHref ?? (visitId ? `/research/withdraw/current?visitId=${encodeURIComponent(visitId)}` : "/research/withdraw/current");
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(() => initialValues(savedAnswers));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(savedAnswers.length > 0);

  const sections = useMemo(() => {
    const groups = new Map<string, EvaluationItem[]>();
    [...items].sort((a, b) => a.displayOrder - b.displayOrder).forEach((item) => {
      groups.set(item.constructKey, [...(groups.get(item.constructKey) ?? []), item]);
    });
    return [...groups.entries()].map(([key, sectionItems]) => ({ key, items: sectionItems }));
  }, [items]);
  const current = sections[step];

  if (!current) return null;

  const missingRequired = current.items.some((item) => {
    const value = values[item.itemCode];
    return item.isRequired && (value === undefined || value === "");
  });

  const save = (submit: boolean, onSuccess: () => void, validateCurrent = true) => {
    if (validateCurrent && missingRequired) {
      setError("กรุณาตอบคำถามที่จำเป็นในส่วนนี้ให้ครบ");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await saveResearchEvaluationAction({
        ...(visitId ? { visitId } : {}),
        instrumentKey,
        answers: answerPayload(values),
        submit,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
      onSuccess();
    });
  };

  const isLast = step === sections.length - 1;
  const answeredCount = Object.values(values).filter((value) => value !== "").length;
  const pause = () => {
    if (saved) {
      router.push(resolvedPauseHref);
      return;
    }
    save(false, () => router.push(resolvedPauseHref), false);
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 border-b border-slate-300 pb-4">
        <div>
          <p className="text-sm font-bold text-teal">ส่วนที่ {step + 1} จาก {sections.length}</p>
          <h2 className="mt-1 text-xl font-black text-ink">{SECTION_LABELS[current.key] ?? "แบบประเมินระบบ"}</h2>
        </div>
        <span className="text-xs font-semibold text-slate-600">ตอบแล้ว {answeredCount}/{items.length}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden bg-slate-200" aria-label={`ความคืบหน้า ${step + 1} จาก ${sections.length}`}>
        <div className="h-full bg-coral transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${((step + 1) / sections.length) * 100}%` }} />
      </div>

      <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
        {current.items.map((item, index) => (
          <fieldset key={item.itemCode} className="py-6">
            <legend className="w-full text-base font-bold leading-7 text-ink">
              {index + 1}. {item.promptTh}
              {!item.isRequired ? <span className="ml-2 text-xs font-medium text-slate-500">ไม่บังคับ</span> : null}
            </legend>
            <div className="mt-4">
              <ItemInput
                item={item}
                value={values[item.itemCode]}
                onChange={(value) => {
                  setValues((currentValues) => ({ ...currentValues, [item.itemCode]: value }));
                  setSaved(false);
                  setError(null);
                }}
              />
            </div>
          </fieldset>
        ))}
      </div>

      {error ? <p role="alert" className="mt-4 border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p> : null}
      <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600" aria-live="polite">
        {saved ? <CheckCircle aria-hidden="true" className="text-emerald-700" size={17} weight="fill" /> : <FloppyDisk aria-hidden="true" size={17} />}
        {saved ? "บันทึกคำตอบล่าสุดแล้ว" : "ระบบจะบันทึกเมื่อกดถัดไปหรือส่งแบบประเมิน"}
      </p>

      <div className="sticky bottom-[calc(84px+env(safe-area-inset-bottom))] mt-6 border border-slate-200 bg-white p-3 shadow-sm lg:static">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={step === 0 || isPending}
            onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
            className="flex min-h-12 items-center justify-center gap-2 border border-slate-300 bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft aria-hidden="true" /> ย้อนกลับ
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => save(isLast, () => {
              if (isLast) {
                router.replace(resolvedCompletionHref);
                router.refresh();
              } else {
                setStep((currentStep) => currentStep + 1);
              }
            })}
            className="flex min-h-12 items-center justify-center gap-2 bg-teal px-3 font-black text-white hover:bg-ink disabled:cursor-wait disabled:opacity-60"
          >
            {isPending ? "กำลังบันทึก..." : isLast ? "ส่งแบบประเมิน" : "บันทึกและถัดไป"}
            {!isPending ? <ArrowRight aria-hidden="true" /> : null}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm font-bold">
        <button type="button" disabled={isPending} onClick={pause} className="min-h-11 text-teal underline underline-offset-4 disabled:cursor-wait disabled:opacity-60">{isPending ? "กำลังบันทึก..." : "พักไว้ ตอบภายหลัง"}</button>
        <Link href={resolvedWithdrawHref} className="min-h-11 text-slate-600 underline underline-offset-4">ถอนตัวจากการวิจัย</Link>
      </div>
    </div>
  );
}
