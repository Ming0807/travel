import { useId, type ReactNode } from "react";

export interface PublicStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

type PublicStateRole = "status" | "alert";

function PublicState({ title, description, action, role, busy = false }: PublicStateProps & { role: PublicStateRole; busy?: boolean }) {
  const titleId = useId();

  return (
    <section
      role={role}
      aria-labelledby={titleId}
      aria-busy={busy ? true : undefined}
      className="rounded-[var(--public-radius-panel)] border border-black/10 bg-white p-6"
    >
      <h2 id={titleId} className="text-lg font-semibold text-[var(--public-ink)]">
        {title}
      </h2>
      {description ? <p className="mt-2 text-base leading-7 text-black/65">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}

export function PublicEmptyState(props: PublicStateProps) {
  return <PublicState {...props} role="status" />;
}

export function PublicErrorState(props: PublicStateProps) {
  return <PublicState {...props} role="alert" />;
}

export function PublicLoadingState(props: PublicStateProps) {
  return <PublicState {...props} role="status" busy />;
}

export function PublicNoDataState(props: PublicStateProps) {
  return <PublicState {...props} role="status" />;
}
