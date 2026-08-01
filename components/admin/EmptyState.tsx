import type { ReactNode } from "react";
import { Tray } from "@phosphor-icons/react/dist/ssr";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[6px] border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[4px] bg-[#202020] text-[#E77455]">
        <Tray aria-hidden="true" size={24} weight="fill" />
      </div>
      <h3 className="mt-4 text-lg font-black text-[#202020]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
