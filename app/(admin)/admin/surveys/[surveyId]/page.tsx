import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SurveyDetailView } from "@/components/admin/surveys/SurveyDetailView";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { getAdminSurveyDetail } from "@/lib/repositories/admin-survey.repository";
import { adminSurveyIdSchema } from "@/lib/validation/admin-survey";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "รายละเอียดคำตอบแบบสำรวจ | ระบบผู้ดูแล",
};

export default async function AdminSurveyDetailPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const guard = await requirePermission("survey.detail");
  const { surveyId: rawSurveyId } = await params;
  const parsedId = adminSurveyIdSchema.safeParse(rawSurveyId);
  if (!parsedId.success) notFound();

  const survey = await getAdminSurveyDetail(parsedId.data);
  if (!survey) notFound();

  return (
    <AdminShell>
      <SurveyDetailView
        survey={survey}
        canReadComments={hasPermission(guard.actor, "survey.comment_read")}
        canReadTourist={hasPermission(guard.actor, "tourist.detail")}
      />
    </AdminShell>
  );
}
