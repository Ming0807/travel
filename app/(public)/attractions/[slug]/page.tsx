import { AttractionHeader } from "@/components/attractions/attraction-header";
import { AttractionGallery } from "@/components/attractions/attraction-gallery";
import { AttractionTabs } from "@/components/attractions/attraction-tabs";
import { AttractionInfoSidebar } from "@/components/attractions/attraction-info-sidebar";
import { AttractionCardsRow } from "@/components/attractions/attraction-cards-row";
import { AttractionTips } from "@/components/attractions/attraction-tips";
import { AttractionReviews } from "@/components/attractions/attraction-reviews";
import { AttractionCTA } from "@/components/attractions/attraction-cta";
import { getPublicAttractionDetail } from "@/lib/repositories/public-content.repository";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AttractionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublicAttractionDetail(slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="bg-white min-h-screen pb-12">
      {/* 
        We don't use PageShell here because the layout is edge-to-edge for the gallery 
        on mobile, and has specific max-width constraints matching the design.
      */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        
        <AttractionHeader 
          name={data.name}
          province={data.province}
          rating={data.rating}
          reviewsCount={data.reviewsCount}
          bestTimeToVisit={data.bestTimeToVisit}
        />

        <AttractionGallery 
          mainImage={data.mainImage}
          gallery={data.gallery}
        />

        {/* Main Content Area - Grid Layout */}
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          
          {/* Left Column (Main Content) */}
          <div className="min-w-0">
            <AttractionTabs />
            
            {/* Sections */}
            <div className="flex flex-col gap-12">
              {/* Overview */}
              <section id="overview" className="scroll-mt-24">
                <h2 className="mb-4 text-2xl font-bold text-ink">Overview</h2>
                <p className="text-base leading-relaxed text-muted">
                  {data.description}
                </p>
              </section>

              {/* Things to Do */}
              <AttractionCardsRow 
                id="things-to-do"
                title="Things to Do"
                items={data.thingsToDo}
                viewAllText="View all things to do"
              />

              {/* Where to Stay */}
              <AttractionCardsRow 
                id="where-to-stay"
                title="Where to Stay"
                items={data.whereToStay}
                viewAllText="View all hotels"
              />

              {/* Food & Drink */}
              <AttractionCardsRow 
                id="food"
                title="Food & Drink"
                items={data.foodAndDrink}
                viewAllText="View all restaurants"
              />

              {/* Tips */}
              <AttractionTips tips={data.travelTips} />

              {/* How to Get There & Map placeholder */}
              <section id="how-to-get-there" className="scroll-mt-24 pt-8">
                <h2 className="mb-4 text-2xl font-bold text-ink">How to Get There</h2>
                <p className="mb-6 text-sm leading-relaxed text-muted">
                  การเดินทางมายังอัยเยอร์เวง สามารถเดินทางด้วยรถยนต์ส่วนตัวจากตัวเมืองเบตง ใช้เวลาประมาณ 45 นาที หรือใช้บริการรถตู้โดยสารจากตัวเมืองยะลามายังเบตง
                </p>
                <div className="aspect-[21/9] w-full overflow-hidden rounded-3xl bg-[#F0EBE1] border border-ink/5 flex items-center justify-center relative">
                  {/* Decorative Map Line */}
                  <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none" className="absolute inset-0 text-coral/20">
                    <path d="M 100 150 Q 300 50 500 150 T 900 150" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10 10"/>
                  </svg>
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-coral text-white shadow-lg shadow-coral/30">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                </div>
              </section>

              {/* Reviews */}
              <AttractionReviews 
                rating={data.rating}
                reviewsCount={data.reviewsCount}
              />
              
              {/* Articles (Re-using Cards Row) */}
              <AttractionCardsRow 
                id="articles"
                title="Recommended Articles"
                items={data.thingsToDo.slice(0, 3)} // Mocking with things to do
                viewAllText="View all articles"
              />
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <AttractionInfoSidebar info={data.info} />
            </div>
          </aside>
        </div>

        {/* Call to Action */}
        <AttractionCTA name={data.name} />
      </div>
    </main>
  );
}
