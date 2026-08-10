import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";

type AttractionCTAProps = {
  name: string;
};

export function AttractionCTA({ name }: AttractionCTAProps) {
  return (
    <section className="mt-16 border border-slate-800 bg-[var(--public-ink)] px-5 py-9 text-white sm:px-8 sm:py-10 lg:mt-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-balance text-2xl font-bold sm:text-3xl">วางแผนเที่ยวต่อจาก {name}</h2>
          <p className="mt-3 max-w-[65ch] text-sm leading-7 text-slate-200 sm:text-base">
            ดูเส้นทางแนะนำเพื่อเชื่อมสถานที่ ร้านอาหาร และจุดแวะที่จัดการผ่านระบบจริง
          </p>
        </div>
        <PublicButton href="/routes" className="shrink-0 gap-2">
          ดูเส้นทางแนะนำ
          <ArrowRight aria-hidden="true" size={18} />
        </PublicButton>
      </div>
    </section>
  );
}
