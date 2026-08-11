import { cloneElement, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode } from "react";

export interface PublicDirectoryToolbarProps extends Omit<HTMLAttributes<HTMLElement>, "aria-label" | "children"> {
  label: string;
  children: ReactNode;
  actions?: ReactNode;
  mobileFilterTrigger?: ReactNode;
}

function withTouchTarget(trigger: ReactNode) {
  if (!isValidElement(trigger)) return trigger;

  const element = trigger as ReactElement<{ className?: string }>;
  return cloneElement(element, {
    className: [
      "min-h-11 rounded-[var(--public-radius-control)] border border-black/15 bg-white px-4 text-sm font-semibold text-[var(--public-ink)]",
      element.props.className,
    ]
      .filter(Boolean)
      .join(" "),
  });
}

export function PublicDirectoryToolbar({
  label,
  children,
  actions,
  mobileFilterTrigger,
  className,
  ...sectionProps
}: PublicDirectoryToolbarProps) {
  return (
    <section
      {...sectionProps}
      aria-label={label}
      className={`rounded-[var(--public-radius-panel)] border border-black/10 bg-white p-4 sm:p-5 ${className ?? ""}`.trim()}
    >
      {mobileFilterTrigger ? <div className="mb-4 sm:hidden">{withTouchTarget(mobileFilterTrigger)}</div> : null}
      <div className="min-w-0">{children}</div>
      {actions ? <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-black/10 pt-4">{actions}</div> : null}
    </section>
  );
}
