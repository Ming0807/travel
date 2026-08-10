import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

type PublicFieldBaseProps = {
  label: string;
  name: string;
  id?: string;
  hint?: string;
  error?: string;
  className?: string;
};

const controlClasses =
  "min-h-11 w-full rounded-[var(--public-radius-control)] border border-black/20 bg-white px-3 text-base text-[var(--public-ink)] outline-none transition-colors placeholder:text-black/45 focus:border-[var(--public-teal)] focus:ring-2 focus:ring-[var(--public-teal)]/20";

function fieldDescriptionId(id: string, suffix: "hint" | "error") {
  return `${id}-${suffix}`;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-[var(--public-ink)]">
      {children}
    </label>
  );
}

function fieldMessageIds(id: string, hint?: string, error?: string) {
  return [hint ? fieldDescriptionId(id, "hint") : null, error ? fieldDescriptionId(id, "error") : null]
    .filter(Boolean)
    .join(" ") || undefined;
}

export interface PublicSearchFieldProps
  extends PublicFieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name" | "type" | "className"> {
  placeholder?: string;
}

export function PublicSearchField({ label, name, id: providedId, hint, error, className, ...inputProps }: PublicSearchFieldProps) {
  const generatedId = useId();
  const id = providedId ?? `public-search-${generatedId}`;
  const describedBy = fieldMessageIds(id, hint, error);

  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        {...inputProps}
        id={id}
        name={name}
        type="search"
        className={`${controlClasses} mt-2`}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      />
      {hint ? (
        <p id={fieldDescriptionId(id, "hint")} className="mt-1 text-sm text-black/65">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={fieldDescriptionId(id, "error")} className="mt-1 text-sm text-[#b42318]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface PublicSelectOption {
  value: string;
  label: string;
}

export interface PublicSelectProps
  extends PublicFieldBaseProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "name" | "className"> {
  options?: PublicSelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export function PublicSelect({
  label,
  name,
  id: providedId,
  hint,
  error,
  className,
  options,
  placeholder,
  children,
  ...selectProps
}: PublicSelectProps) {
  const generatedId = useId();
  const id = providedId ?? `public-select-${generatedId}`;
  const describedBy = fieldMessageIds(id, hint, error);

  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        {...selectProps}
        id={id}
        name={name}
        className={`${controlClasses} mt-2`}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      {hint ? (
        <p id={fieldDescriptionId(id, "hint")} className="mt-1 text-sm text-black/65">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={fieldDescriptionId(id, "error")} className="mt-1 text-sm text-[#b42318]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function PublicFields({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`grid gap-4 ${className ?? ""}`.trim()}>{children}</div>;
}
