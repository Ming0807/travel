import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Image as ImageIcon, MapPin } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { homepageAttractions } from "@/components/homepage/homepage-data";

type AttractionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AttractionDetailPage({ params }: AttractionDetailPageProps) {
  const { slug } = await params;
  const attraction = homepageAttractions.find((item) => item.slug === slug) ?? homepageAttractions[0];

  return (
    <PageShell
      description="This Phase 01 placeholder shows the intended attraction detail structure. Phase 04 will replace static content with published Supabase attraction records, media, photo spots, and active check-in codes."
      eyebrow="Attraction detail shell"
      title={attraction.name}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
          <Image
            alt={attraction.imageAlt}
            className="h-80 w-full object-cover"
            height={640}
            priority
            src={attraction.imageUrl}
            unoptimized
            width={960}
          />
          <div className="p-6">
            <p className="flex items-center gap-2 text-sm font-black text-[#D36B4B]">
              <MapPin aria-hidden="true" size={17} />
              {attraction.province} · {attraction.category}
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">{attraction.description}</p>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-card">
            <ImageIcon aria-hidden="true" className="text-[#0F766E]" />
            <h2 className="mt-3 text-2xl font-black text-[#073F37]">Photo spot and certificate CTA</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Public attraction pages can introduce the reward, but real visit creation should normally start
              from a QR landing page at the location.
            </p>
            <Link
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0F766E] px-5 py-3 text-sm font-black text-white"
              href="/checkin/demo-code"
            >
              Preview check-in
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="rounded-[1.5rem] bg-[#073F37] p-6 text-white shadow-card">
            <h2 className="text-2xl font-black">Public-safe data only</h2>
            <p className="mt-2 text-sm leading-6 text-white/76">
              This route must never expose private storage paths, unpublished content, provider IDs, guest
              tokens, tourist IDs, or visit IDs.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
