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
    <main className="min-h-screen bg-[#FAF8F5] relative flex flex-col pb-24">
      {/* Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-ink/90 to-[#FAF8F5]">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2000&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAF8F5]/50 to-[#FAF8F5]"></div>
      </div>

      <div className="relative z-10 pt-[10vh] px-4 max-w-5xl mx-auto w-full flex flex-col md:flex-row gap-8">
        
        {/* Title Section */}
        <div className="w-full md:w-1/3 mb-6 flex flex-col gap-3">
          <span className="inline-flex w-fit items-center px-3 py-1 rounded-full bg-white/80 backdrop-blur text-coral font-bold text-xs tracking-wider uppercase shadow-sm">
            ขั้นตอนที่ 2/3
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-ink drop-shadow-sm">เพิ่มรูปภาพความทรงจำ</h1>
          <p className="text-ink/80 flex items-center gap-2 font-medium">
            <MapPin weight="fill" className="text-coral" size={20} />
            {attraction?.name_th || "สถานที่ท่องเที่ยว"}
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-2/3">
          <PhotoUploadForm visitId={visitId} />
        </div>

      </div>
    </main>
  );
}
