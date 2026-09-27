import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { ChartBar, Funnel, MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AttractionAnalyticsFilters } from "@/components/dashboard/AttractionAnalyticsFilters";
import { AttractionAnalyticsWorkspace } from "@/components/dashboard/AttractionAnalyticsWorkspace";
import { AttractionAnalyticsNotice, type AttractionAnalyticsNoticeCode } from "@/components/dashboard/AttractionAnalyticsNotice";
import { requirePermission } from "@/lib/auth/guards";
import { getAttractionAnalytics, getAttractionAnalyticsOptions } from "@/lib/services/attraction-analytics.service";
import { attractionAnalyticsFiltersSchema, type AttractionAnalyticsFilters as AnalyticsFilters } from "@/lib/validation/attraction-analytics";
import { isoToBangkokDateTimeInput } from "@/lib/utils/bangkok-datetime";

export const metadata: Metadata = { title: "วิเคราะห์รายสถานที่ | Dashboard" };
export const dynamic = "force-dynamic";

type Query = Record<string, string | string[] | undefined>;
const PAGE_PATH = "/admin/dashboard/attractions";
const FILTER_KEYS = ["attractionId", "dateFrom", "dateTo", "campaignId", "checkinCodeId", "evidenceScope", "entryChannel"] as const;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function defaultDates() {
  const dateTo = isoToBangkokDateTimeInput(new Date().toISOString()).slice(0, 10);
  const start = new Date(`${dateTo}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 89);
  return { dateFrom: start.toISOString().slice(0, 10), dateTo };
}

function retryHref(query: Query | AnalyticsFilters) {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const raw = query[key];
    const value = typeof raw === "number" ? String(raw) : one(raw);
    if (value) params.set(key, value);
  }
  return params.size ? `${PAGE_PATH}?${params.toString()}` : PAGE_PATH;
}

function rethrowNavigationAndAccess(error: unknown) {
  unstable_rethrow(error);
  if (error && typeof error === "object" && "code" in error
    && ["UNAUTHORIZED", "FORBIDDEN", "ADMIN_INACTIVE"].includes(String(error.code))) throw error;
}

export default async function AttractionAnalyticsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const guard = await requirePermission("dashboard.read");
  const query = await searchParams;
  let attractions: Awaited<ReturnType<typeof getAttractionAnalyticsOptions>> = [];
  let state: AttractionAnalyticsNoticeCode | null = null;
  try {
    attractions = await getAttractionAnalyticsOptions();
    if (attractions.length === 0) state = "no_attractions";
  } catch (error) {
    rethrowNavigationAndAccess(error);
    state = "options_unavailable";
  }
  const defaults = defaultDates();
  const parsed = attractionAnalyticsFiltersSchema.safeParse({
    attractionId: one(query.attractionId) ?? attractions[0]?.value,
    dateFrom: one(query.dateFrom) ?? defaults.dateFrom,
    dateTo: one(query.dateTo) ?? defaults.dateTo,
    campaignId: one(query.campaignId) || undefined,
    checkinCodeId: one(query.checkinCodeId) || undefined,
    evidenceScope: one(query.evidenceScope) ?? "field_claim",
    entryChannel: one(query.entryChannel) || undefined,
  });
  let data = null;
  if (!state && !parsed.success) state = "invalid_filters";
  if (!state && parsed.success && !attractions.some((attraction) => attraction.value === parsed.data.attractionId)) {
    state = "attraction_unavailable";
  }
  if (!state && parsed.success) {
    try {
      data = await getAttractionAnalytics(parsed.data);
      if (!data) state = "attraction_unavailable";
      else {
        const codes = data.referenceOptions.checkinCodes;
        const selectedCode = parsed.data.checkinCodeId
          ? codes.find((code) => code.checkinCodeId === parsed.data.checkinCodeId)
          : null;
        if ((parsed.data.checkinCodeId && !selectedCode)
          || (parsed.data.campaignId && !codes.some((code) => code.campaignId === parsed.data.campaignId))
          || (selectedCode && parsed.data.campaignId && selectedCode.campaignId !== parsed.data.campaignId)) {
          state = "scope_mismatch";
        }
      }
    } catch (error) {
      rethrowNavigationAndAccess(error);
      state = error instanceof Error && error.message === "ATTRACTION_ANALYTICS_CHECKIN_SCOPE_LIMIT"
        ? "scope_limit"
        : "analytics_unavailable";
    }
  }

  return (
    <AdminShell admin={guard.actor}>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Attraction Intelligence"
          title="วิเคราะห์ข้อมูลรายสถานที่"
          description="ตอบให้ชัดว่าสถานที่นี้มีผู้ใช้แบบใด Flow หลุดตรงไหน ผู้เยี่ยมชมรายงานอะไร และควรส่งต่อหลักฐานไปสู่แผนปรับปรุงใด"
        />

        {state !== "options_unavailable" && state !== "no_attractions" && state !== "attraction_unavailable" ? <section className="rounded-md border border-[var(--admin-border)] bg-white" aria-labelledby="analytics-scope-heading">
          <div className="grid gap-4 border-b border-[var(--admin-border)] p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div><h2 id="analytics-scope-heading" className="flex items-center gap-2 text-lg font-black"><MagnifyingGlass aria-hidden="true" className="text-[#B94727]" /> ขอบเขตหลักฐาน</h2><p className="mt-1 text-sm leading-6 text-slate-600">ค่าเริ่มต้นตัด Pilot และ Simulation ออกจากข้อสรุปภาคสนาม ตัวกรอง Campaign ใช้รหัสจาก Check-in code ที่บันทึกจริง</p></div>
            <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="inline-flex min-h-9 items-center gap-1 border border-emerald-200 bg-emerald-50 px-3 text-emerald-900"><ShieldCheck aria-hidden="true" /> Privacy threshold n=10</span><span className="inline-flex min-h-9 items-center gap-1 border border-orange-200 bg-orange-50 px-3 text-[#9A3412]"><Funnel aria-hidden="true" /> Visit-safe funnel</span><span className="inline-flex min-h-9 items-center gap-1 border border-slate-200 bg-slate-50 px-3"><ChartBar aria-hidden="true" /> Metric contract</span></div>
          </div>
          <AttractionAnalyticsFilters
            attractions={attractions}
            checkinCodes={data?.referenceOptions.checkinCodes ?? []}
            defaults={defaults}
            filters={parsed.success ? parsed.data : null}
          />
        </section> : null}

        {state ? <AttractionAnalyticsNotice code={state} href={state === "scope_limit"
          ? "/admin/dashboard"
          : state === "invalid_filters" || state === "attraction_unavailable"
          ? PAGE_PATH
          : state === "scope_mismatch" && parsed.success
            ? retryHref({ ...parsed.data, campaignId: undefined, checkinCodeId: undefined })
            : retryHref(state === "analytics_unavailable" && parsed.success ? parsed.data : query)} /> : data ? <AttractionAnalyticsWorkspace data={data} /> : null}
      </div>
    </AdminShell>
  );
}
