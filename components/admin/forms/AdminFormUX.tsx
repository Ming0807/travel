import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react";

export type AdminFieldErrors = Record<string, string[] | undefined>;

type AdminFormSectionProps = {
  title: string;
  description?: string;
  icon?: ElementType;
  children: ReactNode;
  aside?: ReactNode;
};

type AdminFormErrorSummaryProps = {
  error?: string | null;
  fieldErrors?: AdminFieldErrors;
  fieldLabels?: Record<string, string>;
};

type AdminSaveBarProps = {
  cancelHref?: string;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel: string;
  pendingLabel?: string;
  disabled?: boolean;
  secondary?: ReactNode;
};

type ReadinessItem = {
  label: string;
  complete: boolean;
  help?: string;
};

export function readableFieldErrors(fieldErrors?: AdminFieldErrors, fieldLabels: Record<string, string> = {}) {
  if (!fieldErrors) return [];

  return Object.entries(fieldErrors).flatMap(([field, errors]) => {
    if (!errors?.length) return [];
    return errors.map((error) => `${fieldLabels[field] ?? field}: ${error}`);
  });
}

export function AdminFormSection({ title, description, icon: Icon, children, aside }: AdminFormSectionProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          {Icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#0A6B62] shadow-sm">
              <Icon size={20} weight="duotone" />
            </span>
          ) : null}
          <div>
            <h2 className="text-base font-black text-[#073F37]">{title}</h2>
            {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminFormErrorSummary({ error, fieldErrors, fieldLabels }: AdminFormErrorSummaryProps) {
  const fields = readableFieldErrors(fieldErrors, fieldLabels);

  if (!error && fields.length === 0) return null;

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <div className="flex gap-2 font-black">
        <WarningCircle className="mt-0.5 shrink-0" size={18} weight="fill" />
        <span>{error || "ตรวจข้อมูลที่กรอกอีกครั้ง"}</span>
      </div>
      {fields.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-7 text-xs font-bold leading-5">
          {fields.map((fieldError) => (
            <li key={fieldError}>{fieldError}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function AdminHelpPanel({
  title,
  children,
  tone = "info",
}: {
  title: string;
  children: ReactNode;
  tone?: "info" | "warning" | "success";
}) {
  const styles = {
    info: "border-slate-200 bg-white text-slate-700",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-[#0A6B62]/20 bg-[#E6F4EF] text-[#073F37]",
  }[tone];

  return (
    <aside className={`rounded-lg border p-4 text-sm leading-6 ${styles}`}>
      <div className="flex gap-2 font-black">
        <Info className="mt-0.5 shrink-0" size={18} weight="fill" />
        {title}
      </div>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </aside>
  );
}

export function AdminReadinessPanel({ title = "Publish readiness", items }: { title?: string; items: ReadinessItem[] }) {
  const completeCount = items.filter((item) => item.complete).length;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-[#073F37]">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
          {completeCount}/{items.length}
        </span>
      </div>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex gap-2 text-sm leading-5">
            {item.complete ? (
              <CheckCircle className="mt-0.5 shrink-0 text-[#0A6B62]" size={17} weight="fill" />
            ) : (
              <WarningCircle className="mt-0.5 shrink-0 text-amber-600" size={17} weight="fill" />
            )}
            <span>
              <span className={item.complete ? "font-bold text-slate-800" : "font-bold text-amber-900"}>{item.label}</span>
              {item.help ? <span className="mt-0.5 block text-xs text-slate-500">{item.help}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminSaveBar({
  cancelHref,
  onCancel,
  isPending = false,
  submitLabel,
  pendingLabel = "กำลังบันทึก...",
  disabled = false,
  secondary,
}: AdminSaveBarProps) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
      {secondary ? <div className="sm:mr-auto">{secondary}</div> : null}
      {cancelHref ? (
        <Link
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
          href={cancelHref}
        >
          ยกเลิก
        </Link>
      ) : (
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          ยกเลิก
        </button>
      )}
      <button
        disabled={isPending || disabled}
        className="min-h-11 rounded-lg bg-[#073F37] px-6 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0A6B62] disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}
