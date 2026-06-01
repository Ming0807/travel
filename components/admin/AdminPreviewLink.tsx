import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";

type AdminPreviewLinkProps = {
  href: string;
  label?: string;
  tooltip?: string;
  variant?: "button" | "icon";
};

export function AdminPreviewLink({
  href,
  label = "ดูตัวอย่าง",
  tooltip = "เปิดหน้านี้ในหน้า public",
  variant = "button",
}: AdminPreviewLinkProps) {
  if (variant === "icon") {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={tooltip}
        aria-label={tooltip}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0A6B62] focus:outline-none focus:ring-2 focus:ring-[#0A6B62]/50"
      >
        <ArrowSquareOut size={18} weight="bold" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={tooltip}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-[#0A6B62]/30 hover:bg-[#E6F4EF] hover:text-[#0A6B62] focus:outline-none focus:ring-2 focus:ring-[#0A6B62]/50"
    >
      <ArrowSquareOut size={16} weight="bold" />
      {label}
    </Link>
  );
}
