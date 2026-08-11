import { ArrowSquareOut, Compass } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { PublicEmptyState } from "@/components/public/PublicStates";

export type PublicVirtualTourItem = {
  attractionSlug: string;
  attractionName: string;
  province: string;
  mediaType: "panorama" | "video360" | "external_url";
  provider: "platform" | "external";
  href: string;
  previewImageUrl: string | null;
  previewImageAlt: string;
};

export function PublicVistaGrid({
  items,
  externalProviderUrl,
}: {
  items: PublicVirtualTourItem[];
  externalProviderUrl: string | null;
}) {
  if (items.length === 0) {
    return externalProviderUrl ? (
      <section className="border-y border-black/10 py-8 sm:border sm:bg-white sm:p-8" aria-labelledby="external-vista-heading">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-coral-strong)]">
            <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
            ระบบภายนอก
          </p>
          <h2 id="external-vista-heading" className="mt-3 text-2xl font-bold text-balance">
            เปิดประสบการณ์ 360° ผ่านผู้ให้บริการภายนอก
          </h2>
          <p className="mt-3 max-w-[65ch] text-sm leading-7 text-black/65 sm:text-base">
            ขณะนี้ยังไม่มีรายการ 360° ที่เผยแพร่ใน CMS ของแพลตฟอร์ม ลิงก์ด้านล่างจะเปิดเว็บไซต์ภายนอกในแท็บใหม่ และระบบนี้จะไม่ส่งข้อมูลส่วนบุคคลของคุณไปพร้อมกับลิงก์
          </p>
          <PublicButton
            href={externalProviderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5"
          >
            เปิดบริการ 360° ภายนอก
          </PublicButton>
        </div>
      </section>
    ) : (
      <PublicEmptyState
        title="กำลังเตรียมประสบการณ์ 360°"
        description="เมื่อทีมงานเผยแพร่สื่อพาโนรามาหรือทัวร์เสมือนจริง รายการจะปรากฏที่หน้านี้"
      />
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <article key={`${item.attractionSlug}-${item.mediaType}`} className="border border-black/10 bg-white p-4">
          <PublicMediaFrame
            src={item.previewImageUrl}
            alt={item.previewImageAlt}
            aspect="wide"
            sizes="(max-width: 767px) calc(100vw - 4rem), (max-width: 1279px) 45vw, 360px"
            priority={index === 0}
            fallbackLabel="ยังไม่มีภาพตัวอย่าง 360°"
          />
          <div className="pt-5">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span className="text-[var(--public-coral-strong)]">{item.province}</span>
              <span aria-hidden="true" className="text-black/25">/</span>
              <span className="text-black/65">{item.provider === "external" ? "ระบบภายนอก" : "สื่อของแพลตฟอร์ม"}</span>
            </div>
            <h2 className="mt-2 text-xl font-bold leading-7">{item.attractionName}</h2>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--public-teal)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
              aria-label={`เปิดมุมมอง 360° ของ${item.attractionName}`}
            >
              <Compass size={19} weight="fill" aria-hidden="true" />
              เปิดมุมมอง 360°
              <ArrowSquareOut size={17} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
