import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AttractionImprovementWorkspace } from "@/components/admin/attractions/AttractionImprovementWorkspace";
import { DashboardPrintButton } from "@/components/dashboard/DashboardPrintButton";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { parseAttractionIssueDraft } from "@/lib/dashboard/attraction-improvement-draft";
import { getAdminAttractionById } from "@/lib/repositories/admin-attraction.repository";
import {
  FEEDBACK_RULES,
  getAttractionImprovementWorkspace,
  type FeedbackDimension,
  type IssueStatus,
} from "@/lib/services/attraction-feedback.service";
import { FEEDBACK_DIMENSIONS, ISSUE_STATUSES, feedbackScopeSchema } from "@/lib/validation/attraction-feedback";

export const dynamic = "force-dynamic";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaults() {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 89);
  const comparisonEnd = new Date(start);
  comparisonEnd.setUTCDate(comparisonEnd.getUTCDate() - 1);
  const comparisonStart = new Date(comparisonEnd);
  comparisonStart.setUTCDate(comparisonStart.getUTCDate() - 89);
  return {
    dateStart: isoDate(start),
    dateEnd: isoDate(end),
    comparisonStart: isoDate(comparisonStart),
    comparisonEnd: isoDate(comparisonEnd),
  };
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AttractionImprovementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const guard = await requirePermission("attraction_feedback.read");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const attractionId = Number(id);
  if (!Number.isInteger(attractionId) || attractionId <= 0) notFound();
  const attraction = await getAdminAttractionById(attractionId);
  if (!attraction) notFound();

  const dateDefaults = defaults();
  const rawDimension = one(query.dimension);
  const dimension: FeedbackDimension = FEEDBACK_DIMENSIONS.includes(rawDimension as FeedbackDimension)
    ? rawDimension as FeedbackDimension
    : "overall";
  const rawStatus = one(query.status);
  const issueStatus: IssueStatus | undefined = ISSUE_STATUSES.includes(rawStatus as IssueStatus)
    ? rawStatus as IssueStatus
    : undefined;
  const scopeResult = feedbackScopeSchema.safeParse({
    attractionId,
    dateStart: one(query.dateStart) ?? dateDefaults.dateStart,
    dateEnd: one(query.dateEnd) ?? dateDefaults.dateEnd,
    comparisonStart: one(query.comparisonStart) ?? dateDefaults.comparisonStart,
    comparisonEnd: one(query.comparisonEnd) ?? dateDefaults.comparisonEnd,
  });
  const scope = scopeResult.success ? scopeResult.data : { attractionId, ...dateDefaults };
  const draft = parseAttractionIssueDraft(query, scope, dimension);

  let workspace;
  let loadError = false;
  try {
    workspace = await getAttractionImprovementWorkspace({ scope, dimension, issueStatus });
  } catch {
    loadError = true;
  }

  return (
    <AdminShell>
      <div className="space-y-6" data-print-report="attraction-improvement">
        <AdminPageHeader
          eyebrow="การจัดการคุณภาพสถานที่"
          title={`แผนปรับปรุง: ${attraction.name_th}`}
          description="เปลี่ยน feedback ที่มีจำนวนตัวอย่างเพียงพอให้เป็นประเด็น ผู้รับผิดชอบ แผนงาน และผลติดตามที่ตรวจสอบย้อนหลังได้"
          actions={(
            <>
              <Link href={`/admin/attractions/${attractionId}/edit`} className="inline-flex min-h-11 items-center border border-[var(--admin-border)] bg-white px-4 text-sm font-bold text-[var(--admin-ink)] hover:bg-[var(--admin-surface-muted)]">
                กลับหน้าแก้ไขสถานที่
              </Link>
              <DashboardPrintButton reportLabel={`ทบทวนแผนปรับปรุง ${attraction.name_th}`} />
            </>
          )}
        />

        <form method="get" data-print-hide className="grid gap-3 border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 sm:grid-cols-2 xl:grid-cols-6">
          <label className="text-xs font-bold text-[var(--admin-muted)]">มิติข้อมูล<select name="dimension" defaultValue={dimension} className="mt-1 min-h-11 w-full border border-[var(--admin-border)] bg-white px-3 text-sm font-normal text-[var(--admin-ink)]">{FEEDBACK_DIMENSIONS.map((value) => <option key={value} value={value}>{({ overall: "ภาพรวม", facility: "สิ่งอำนวยความสะดวก", cleanliness: "ความสะอาด", safety: "ความปลอดภัย", accessibility: "การเข้าถึง", information: "ข้อมูลและป้าย", value: "ความคุ้มค่า" } as const)[value]}</option>)}</select></label>
          <label className="text-xs font-bold text-[var(--admin-muted)]">เริ่มช่วงปัจจุบัน<input type="date" name="dateStart" defaultValue={scope.dateStart} className="mt-1 min-h-11 w-full border border-[var(--admin-border)] px-3 text-sm font-normal" /></label>
          <label className="text-xs font-bold text-[var(--admin-muted)]">สิ้นสุดช่วงปัจจุบัน<input type="date" name="dateEnd" defaultValue={scope.dateEnd} className="mt-1 min-h-11 w-full border border-[var(--admin-border)] px-3 text-sm font-normal" /></label>
          <label className="text-xs font-bold text-[var(--admin-muted)]">เริ่มช่วงเปรียบเทียบ<input type="date" name="comparisonStart" defaultValue={scope.comparisonStart} className="mt-1 min-h-11 w-full border border-[var(--admin-border)] px-3 text-sm font-normal" /></label>
          <label className="text-xs font-bold text-[var(--admin-muted)]">สิ้นสุดช่วงเปรียบเทียบ<input type="date" name="comparisonEnd" defaultValue={scope.comparisonEnd} className="mt-1 min-h-11 w-full border border-[var(--admin-border)] px-3 text-sm font-normal" /></label>
          <div className="flex items-end"><button type="submit" className="min-h-11 w-full bg-[var(--admin-ink)] px-4 text-sm font-black text-white hover:bg-[var(--admin-accent-strong)]">วิเคราะห์ช่วงนี้</button></div>
        </form>

        <p className="text-xs leading-5 text-[var(--admin-muted)]">
          เกณฑ์รุ่น {FEEDBACK_RULES.ruleVersion}: คำตอบอย่างน้อย {FEEDBACK_RULES.minimumValidResponses} รายการ การเข้าชมอย่างน้อย {FEEDBACK_RULES.minimumVisits} ครั้ง และคะแนนต่ำซ้ำอย่างน้อย {FEEDBACK_RULES.minimumStructuredRecurrence} รายการ ผลเป็นหลักฐานเชิงพรรณนา ไม่ใช่ข้อสรุปเหตุและผล
        </p>

        {loadError || !workspace ? (
          <div className="border border-rose-300 bg-rose-50 p-5 text-sm font-semibold text-rose-900">ยังโหลดหลักฐานและแผนปรับปรุงไม่ได้ กรุณาตรวจสอบว่ารัน migration ของ Phase 18 แล้ว จากนั้นลองใหม่</div>
        ) : (
          <AttractionImprovementWorkspace
            attractionId={attractionId}
            workspace={workspace}
            scope={scope}
            dimension={dimension}
            result={one(query.result)}
            canReview={hasPermission(guard.actor, "attraction_feedback.issue_review")}
            canManage={hasPermission(guard.actor, "attraction_improvement.manage")}
            canVerify={hasPermission(guard.actor, "attraction_improvement.verify")}
            draft={draft}
          />
        )}
      </div>
    </AdminShell>
  );
}
