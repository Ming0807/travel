import Link from "next/link";
import { ListMagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { DashboardViewModel } from "@/types/dashboard";

export function SurveyRecordsLink({ data }: { data: DashboardViewModel }) {
  if (!data.viewer.permissions.includes("survey.read")) return null;
  return (
    <Link
      href="/admin/surveys"
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-[#B94727] hover:text-[#B94727] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B94727]"
    >
      <ListMagnifyingGlass aria-hidden="true" size={18} />
      ดูคำตอบรายรายการ
    </Link>
  );
}
