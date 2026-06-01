"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// ─── Field Error Helpers ────────────────────────────────────────

export type AdminFieldErrors = Record<string, string[] | undefined>;

export function getFieldError(fieldErrors: AdminFieldErrors | undefined, name: string): string | undefined {
  return fieldErrors?.[name]?.[0];
}

// ─── Shared Input Class ─────────────────────────────────────────

export const INPUT_CLASS =
  "mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15";

export const INPUT_READ_ONLY_CLASS =
  "mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-500";

export const SELECT_CLASS = INPUT_CLASS;

export const TEXTAREA_CLASS = `${INPUT_CLASS} resize-y min-h-[100px]`;

// ─── Error Display ──────────────────────────────────────────────

export function FormError({ error }: { error?: string | null }) {
  if (!error) return null;
  return <p className="mt-1 text-xs font-bold text-rose-600">{error}</p>;
}

export function FormHelp({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs leading-5 text-slate-500">{children}</p>;
}

// ─── FormLabel ──────────────────────────────────────────────────

export function FormLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="text-sm font-bold text-slate-700">
      {children}
      {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
    </span>
  );
}

// ─── FormInput ──────────────────────────────────────────────────

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  help?: string;
  required?: boolean;
}

export function FormInput({ label, error, help, required, className, ...props }: FormInputProps) {
  return (
    <label className={`block ${className ?? ""}`}>
      <FormLabel required={required}>{label}</FormLabel>
      <input className={INPUT_CLASS} required={required} {...props} />
      <FormError error={error} />
      {help ? <FormHelp>{help}</FormHelp> : null}
    </label>
  );
}

// ─── FormTextarea ───────────────────────────────────────────────

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | null;
  help?: string;
  required?: boolean;
}

export function FormTextarea({ label, error, help, required, className, ...props }: FormTextareaProps) {
  return (
    <label className={`block ${className ?? ""}`}>
      <FormLabel required={required}>{label}</FormLabel>
      <textarea className={TEXTAREA_CLASS} required={required} {...props} />
      <FormError error={error} />
      {help ? <FormHelp>{help}</FormHelp> : null}
    </label>
  );
}

// ─── FormSelect ─────────────────────────────────────────────────

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | null;
  help?: string;
  required?: boolean;
  placeholder?: string;
  options: { value: string | number; label: string }[];
}

export function FormSelect({ label, error, help, required, placeholder, options, className, ...props }: FormSelectProps) {
  return (
    <label className={`block ${className ?? ""}`}>
      <FormLabel required={required}>{label}</FormLabel>
      <select className={SELECT_CLASS} required={required} {...props}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FormError error={error} />
      {help ? <FormHelp>{help}</FormHelp> : null}
    </label>
  );
}

// ─── FormCheckbox ───────────────────────────────────────────────

interface FormCheckboxProps {
  label: string;
  name: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  accent?: "teal" | "coral";
  error?: string | null;
}

export function FormCheckbox({ label, name, defaultChecked, checked, onChange, accent = "teal", error }: FormCheckboxProps) {
  const accentStyles = {
    teal: "has-[:checked]:border-[#0A6B62] has-[:checked]:bg-[#E6F4EF] accent-[#0A6B62]",
    coral: "has-[:checked]:border-[#F3704C] has-[:checked]:bg-orange-50 accent-[#F3704C]",
  }[accent];

  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 ${accentStyles}`}
    >
      {label}
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        checked={checked !== undefined ? checked : undefined}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="h-4 w-4"
      />
      {error ? <p className="ml-auto text-xs font-bold text-rose-600">{error}</p> : null}
    </label>
  );
}
