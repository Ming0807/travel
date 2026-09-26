import { sanitizeAdminRichHtml } from "@/lib/content/admin-rich-html";
import type { PublicAttractionImage } from "@/lib/attractions/public-detail";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";

export function HospitalityRichContent({ content }: { content: string }) {
  if (!/<[a-z][\s\S]*>/i.test(content)) {
    return <p className="mt-5 max-w-[70ch] whitespace-pre-line text-base leading-8 text-[#394447]">{content}</p>;
  }

  const safeHtml = sanitizeAdminRichHtml(content);
  return <div className="rich-content-media prose prose-lg mt-5 max-w-[70ch] prose-headings:font-bold prose-headings:text-[#263036] prose-p:leading-8 prose-p:text-[#394447] prose-img:rounded-md" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}

export function HospitalityGallery({ images }: { images: PublicAttractionImage[] }) {
  if (images.length < 2) return null;

  return (
    <section aria-labelledby="hospitality-gallery-heading">
      <div className="hospitality-section-heading">
        <h2 id="hospitality-gallery-heading" className="hospitality-section-title text-2xl font-bold">ภาพเพิ่มเติม</h2>
        <p className="mt-1 text-sm text-[#5f6668]">ภาพจากข้อมูลที่ผู้ดูแลเผยแพร่</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {images.slice(1).map((image, index) => (
          <div key={`${image.url}-${index}`} className="hospitality-gallery-item">
            <PublicMediaFrame
              src={image.url}
              alt={image.alt || `ภาพเพิ่มเติม ${index + 1}`}
              aspect="landscape"
              sizes="(max-width: 640px) 100vw, 50vw"
              fallbackLabel="ไม่สามารถแสดงภาพนี้ได้"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
