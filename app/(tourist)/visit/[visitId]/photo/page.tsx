import { notFound } from "next/navigation";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { getVisitById } from "@/lib/repositories/visit.repository";
import { PhotoUploadForm } from "@/components/visit/PhotoUploadForm";
import { uuidSchema } from "@/lib/validation/common";

export default async function PhotoUploadPage(props: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId: rawVisitId } = await props.params;

  const visitIdResult = uuidSchema.safeParse(rawVisitId);
  if (!visitIdResult.success) {
    notFound();
  }
  const visitId = visitIdResult.data;

  const visit = await getVisitById(visitId);
  if (!visit) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = visit as any;
  const attraction = v.attractions;

  return (
    <main className="min-h-screen bg-sand px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex flex-col gap-2">
          <span className="text-teal font-semibold text-sm tracking-wide uppercase">ขั้นตอนที่ 2/3</span>
          <h1 className="text-3xl font-bold text-ink">เพิ่มรูปภาพความทรงจำ</h1>
          <p className="text-ink-light flex items-center gap-1.5">
            <MapPin weight="fill" className="text-coral" />
            {attraction?.name_th || "สถานที่ท่องเที่ยว"}
          </p>
        </div>

        <PhotoUploadForm visitId={visitId} />
      </div>
    </main>
  );
}
