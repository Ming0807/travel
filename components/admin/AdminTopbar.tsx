import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

type AdminTopbarProps = {
  displayName?: string | null;
  email?: string | null;
};

export function AdminTopbar({ displayName, email }: AdminTopbarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link className="font-black text-[#073F37] lg:hidden" href="/admin">
          Tourism Admin
        </Link>
        <div className="hidden text-sm font-bold text-slate-500 lg:block">Admin backoffice</div>
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <ShieldCheck aria-hidden="true" className="text-[#0A6B62]" size={18} weight="fill" />
          <div className="min-w-0 text-right">
            <p className="truncate text-xs font-black text-[#073F37]">{displayName || "Protected admin"}</p>
            {email ? <p className="truncate text-[11px] text-slate-500">{email}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
