import { sanitizeAdminRichHtml } from "@/lib/content/admin-rich-html";
import type { PublicAttractionImage } from "@/lib/attractions/public-detail";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";

export function HospitalityRichContent({ content }: { content: string }) {
  if (!/<[a-z][\s\S]*>/i.test(content)) {
    return <p className="mt-4 max-w-[70ch] whitespace-pre-line text-base leading-8 text-black/70">{content}</p>;
  }

  const safeHtml = sanitizeAdminRichHtml(content);
  return <div className="rich-content-media prose prose-lg mt-4 max-w-[70ch] prose-headings:font-bold prose-p:leading-8 prose-p:text-black/70 prose-img:rounded-lg" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}

export function HospitalityGallery({ images }: { images: PublicAttractionImage[] }) {
  if (images.length < 2) return null;

  return (
    <section aria-labelledby="hospitality-gallery-heading">
      <h2 id="hospitality-gallery-heading" className="text-2xl font-bold">ภาพเพิ่มเติม</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {images.slice(1).map((image, index) => (
          <PublicMediaFrame
            key={`${image.url}-${index}`}
            src={image.url}
            alt={image.alt || `ภาพเพิ่มเติม ${index + 1}`}
            aspect="landscape"
            sizes="(max-width: 640px) 100vw, 50vw"
            fallbackLabel="ไม่สามารถแสดงภาพนี้ได้"
          />
        ))}
      </div>
    </section>
  );
}
