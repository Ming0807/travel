import Link from "next/link";
import { ArrowRight, Database, FunnelSimple, WarningCircle } from "@phosphor-icons/react/dist/ssr";

import type { DashboardPageKey } from "@/components/dashboard/DashboardPageHeader";
import type { DashboardFilters, DashboardViewModel } from "@/types/dashboard";

export type DashboardContentStateCode = "no_records" | "filtered_zero" | "incomplete_data";

type DashboardContentStateResult = {
  code: DashboardContentStateCode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

const PAGE_PATH: Record<DashboardPageKey, string> = {
  overview: "/admin/dashboard",
  tourists: "/admin/dashboard/tourists",
  visits: "/admin/dashboard/visits",
  expenses: "/admin/dashboard/expenses",
  satisfaction: "/admin/dashboard/satisfaction",
  funnel: "/admin/dashboard/funnel",
  sustainability: "/admin/dashboard/sustainability",
};

const INCOMPLETE_COPY: Record<DashboardPageKey, { description: string; actionLabel: string; actionHref: string }> = {
  overview: {
    description: "มีรายการเข้าชมหรือใบประกาศแล้ว แต่คำตอบแบบสำรวจที่ใช้ประกอบการตัดสินใจยังไม่ครบ ควรอ่านผลร่วมกับ Coverage ก่อนสรุป",
    actionLabel: "ตรวจข้อมูลแบบสำรวจ",
    actionHref: "/admin/surveys",
  },
  tourists: {
    description: "มีรายการเข้าชมแล้ว แต่ข้อมูลโปรไฟล์แบบรวมยังไม่ครบ จึงยังอธิบายกลุ่มนักท่องเที่ยวไม่ได้อย่างเหมาะสม",
    actionLabel: "ตรวจรายการเข้าชม",
    actionHref: "/admin/visits",
  },
  visits: {
    description: "มีรายการเข้าชมแล้ว แต่คำตอบเรื่องผู้ร่วมเดินทาง พาหนะ วัตถุประสงค์ หรือการค้างคืนยังไม่เพียงพอ",
    actionLabel: "ตรวจรายการเข้าชม",
    actionHref: "/admin/visits",
  },
  expenses: {
    description: "มีรายการเข้าชมแล้ว แต่ยังไม่มีคำตอบช่วงค่าใช้จ่ายที่ผู้ใช้สมัครใจให้ จึงไม่แสดงค่าเป็นศูนย์หรือรายได้โดยประมาณ",
    actionLabel: "ตรวจข้อมูลแบบสำรวจ",
    actionHref: "/admin/surveys",
  },
  satisfaction: {
    description: "มีรายการเข้าชมแล้ว แต่ยังไม่มีคะแนนประสบการณ์ที่ตอบโดยสมัครใจ จึงยังจัดลำดับประเด็นปรับปรุงไม่ได้",
    actionLabel: "ตรวจข้อมูลแบบสำรวจ",
    actionHref: "/admin/surveys",
  },
  funnel: {
    description: "มีรายการเข้าชมแล้ว แต่เหตุการณ์ก่อนและหลังเช็กอินยังเชื่อมเป็น Funnel ในขอบเขตนี้ไม่ได้ โปรดตรวจช่องทางและการบันทึก Event",
    actionLabel: "ตรวจช่องทางเช็กอิน",
    actionHref: "/admin/checkin-codes",
  },
  sustainability: {
    description: "มีรายการเข้าชมแล้ว แต่หลักฐานความพึงพอใจและข้อเสนอแนะยังไม่ครบ จึงยังไม่ควรจัดลำดับการพัฒนาเชิงพื้นที่",
    actionLabel: "ตรวจข้อมูลแบบสำรวจ",
    actionHref: "/admin/surveys",
  },
};

function metricValue(data: DashboardViewModel, key: string) {
  const value = data.kpis.find((metric) => metric.key === key)?.rawValue;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function hasRefinementFilter(filters: DashboardFilters) {
  return Boolean(
    (filters.evidenceScope && filters.evidenceScope !== "field_claim") ||
    filters.provinceId ||
    filters.districtId ||
    filters.attractionId ||
    filters.attractionTypeId ||
    filters.originCountryId ||
    filters.originProvinceId ||
    filters.ageGroup ||
    filters.transportModeId ||
    filters.travelPurposeId ||
    filters.satisfactionMin ||
    filters.satisfactionMax
  );
}

function clearRefinementsHref(data: DashboardViewModel, page: DashboardPageKey) {
  const params = new URLSearchParams({
    date_from: data.filters.dateFrom,
    date_to: data.filters.dateTo,
  });
  return `${PAGE_PATH[page]}?${params.toString()}`;
}

function hasIncompleteData(data: DashboardViewModel, page: DashboardPageKey) {
  switch (page) {
    case "overview":
      return Boolean(data.quality?.coverage && data.quality.coverage.denominatorCount > 0 && data.quality.coverage.answeredCount === 0);
    case "tourists":
      return metricValue(data, "tourist_profiles") === 0;
    case "visits":
      return data.travelBehavior.companionTypes.length === 0 &&
        data.travelBehavior.transportModes.length === 0 &&
        data.travelBehavior.travelPurposes.length === 0 &&
        data.travelBehavior.overnightStatus.length === 0;
    case "expenses":
      return data.expense.responseCount === 0;
    case "satisfaction":
      return data.satisfaction.responseCount === 0;
    case "funnel":
      return data.funnel.stages.length === 0 || data.funnel.stages.every((stage) => stage.count === 0);
    case "sustainability":
      return data.satisfaction.responseCount === 0;
  }
}

export function deriveDashboardContentState(
  data: DashboardViewModel,
  page: DashboardPageKey,
): DashboardContentStateResult | null {
  const visits = metricValue(data, "total_visits");
  const funnelEntries = data.funnel.stages[0]?.count ?? 0;
  const hasBaseRecords = page === "funnel" ? visits > 0 || funnelEntries > 0 : visits > 0;

  if (!hasBaseRecords) {
    if (hasRefinementFilter(data.filters)) {
      return {
        code: "filtered_zero",
        title: "ตัวกรองนี้ไม่พบข้อมูล",
        description: "ระบบทำงานได้ตามปกติ แต่ไม่มีรายการที่ตรงกับขอบเขตเพิ่มเติมที่เลือก ลองล้างตัวกรองแล้วค่อยปรับให้แคบลงทีละรายการ",
        actionLabel: "ล้างตัวกรองเพิ่มเติม",
        actionHref: clearRefinementsHref(data, page),
      };
    }

    return {
      code: "no_records",
      title: "ยังไม่มีรายการในช่วงเวลานี้",
      description: "ไม่พบรายการเข้าชมหรือเหตุการณ์ที่เกี่ยวข้องในช่วงวันที่เลือก ข้อมูลไม่ได้สูญหายและค่าที่ว่างไม่ถูกแทนด้วยศูนย์",
      actionLabel: "ตรวจช่องทางเช็กอิน",
      actionHref: "/admin/checkin-codes",
    };
  }

  if (hasIncompleteData(data, page)) {
    return {
      code: "incomplete_data",
      title: "ข้อมูลประกอบยังไม่ครบ",
      ...INCOMPLETE_COPY[page],
    };
  }

  return null;
}

const STYLE = {
  no_records: { className: "border-slate-300 bg-slate-50", iconClassName: "bg-slate-200 text-slate-700", icon: Database },
  filtered_zero: { className: "border-sky-200 bg-sky-50/60", iconClassName: "bg-sky-100 text-sky-800", icon: FunnelSimple },
  incomplete_data: { className: "border-amber-300 bg-amber-50/60", iconClassName: "bg-amber-100 text-amber-900", icon: WarningCircle },
} as const;

export function DashboardContentState({ data, page }: { data: DashboardViewModel; page: DashboardPageKey }) {
  const state = deriveDashboardContentState(data, page);
  if (!state) return null;

  const style = STYLE[state.code];
  const Icon = style.icon;

  return (
    <section aria-label={state.title} className={`flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center ${style.className}`} role="status">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.iconClassName}`}>
        <Icon aria-hidden="true" size={20} weight="fill" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-black text-slate-950">{state.title}</h2>
        <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-700">{state.description}</p>
      </div>
      <Link className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[4px] border border-current px-3 text-sm font-bold text-slate-800 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94717]" href={state.actionHref}>
        {state.actionLabel}<ArrowRight aria-hidden="true" size={16} />
      </Link>
    </section>
  );
}
