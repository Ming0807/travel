import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  Phone,
  ForkKnife,
  NavigationArrow,
  Compass
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicRestaurantDetail } from "@/lib/repositories/public-content.repository";
import {
  getReviewStatsByRestaurant,
  listPublicReviewsByRestaurant,
} from "@/lib/repositories/admin-review.repository";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewSubmissionForm } from "@/components/reviews/ReviewSubmissionForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getPublicRestaurantDetail(slug);

  if (!restaurant) {
    notFound();
  }

  // Fetch real reviews
  const client = await createSupabaseServerClient();
  const { data: restaurantRow } = await client
    .from("restaurants")
    .select("restaurant_id")
    .eq("slug", slug)
    .maybeSingle();

  const restaurantId = restaurantRow?.restaurant_id ? Number(restaurantRow.restaurant_id) : undefined;
  let reviewStats = null;
  let publicReviews: {
    reviewId: number;
    touristName: string;
    rating: number;
    title: string | null;
    comment: string | null;
    createdAt: string;
  }[] = [];

  if (restaurantId) {
    reviewStats = await getReviewStatsByRestaurant(restaurantId);
    publicReviews = await listPublicReviewsByRestaurant(restaurantId);
  }

  return (
    <main className="bg-[#FAF8F5] min-h-screen pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">

        {/* Breadcrumb */}
        <div className="flex gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-coral transition-colors">Home</Link>
          <span>›</span>
          <Link href="/restaurants" className="hover:text-coral transition-colors">Restaurants</Link>
          <span>›</span>
          <span className="text-ink">{restaurant.name}</span>
        </div>

        {/* Hero Section */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden shadow-lg border border-ink/5 mb-10">
          <Image
            src={restaurant.imageUrl || "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop"}
            alt={restaurant.name}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            {restaurant.foodType && (
              <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md text-white px-3 py-1 text-[10px] font-bold mb-3 uppercase tracking-wider border border-white/20">
                {restaurant.foodType}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight">
              {restaurant.name}
            </h1>
            <p className="text-white/80 text-sm flex items-center gap-2">
              <MapPin size={14} weight="fill" />
              {restaurant.province}
            </p>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          {/* Left Column */}
          <div className="min-w-0 space-y-10">

            {/* Description */}
            {restaurant.description && (
              <section>
                <h2 className="text-2xl font-black text-ink mb-4">About</h2>
                <p className="text-base leading-relaxed text-muted whitespace-pre-line">
                  {restaurant.description}
                </p>
              </section>
            )}

            {/* Nearby Attractions */}
            {restaurant.nearbyAttractions.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-ink mb-6">Nearby Attractions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {restaurant.nearbyAttractions.map((attraction) => (
                    <Link
                      key={attraction.slug}
                      href={`/attractions/${attraction.slug}`}
                      className="group flex items-center gap-4 bg-white p-3 rounded-[1.5rem] border border-ink/5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-cream">
                        <Image
                          src={attraction.imageUrl || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=80"}
                          alt={attraction.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-ink mb-1 group-hover:text-[#E18868] transition-colors leading-tight">
                          {attraction.name}
                        </h3>
                        {attraction.distanceText && (
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                            <NavigationArrow size={10} weight="fill" className="inline mr-1 text-[#E18868]" />
                            {attraction.distanceText}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column - Info Sidebar */}
          <aside className="lg:block">
            <div className="sticky top-24 space-y-6">

              {/* Quick Info Card */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-ink/5">
                <h3 className="font-black text-ink text-lg mb-6">Restaurant Info</h3>

                <div className="space-y-5">
                  {restaurant.foodType && (
                    <div className="flex items-start gap-3">
                      <ForkKnife size={20} className="text-[#E18868] mt-0.5 shrink-0" weight="light" />
                      <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Cuisine</p>
                        <p className="text-sm font-bold text-ink">{restaurant.foodType}</p>
                      </div>
                    </div>
                  )}

                  {restaurant.addressText && (
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-[#E18868] mt-0.5 shrink-0" weight="light" />
                      <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Address</p>
                        <p className="text-sm font-bold text-ink">{restaurant.addressText}</p>
                      </div>
                    </div>
                  )}

                  {restaurant.openingHours && (
                    <div className="flex items-start gap-3">
                      <Clock size={20} className="text-[#E18868] mt-0.5 shrink-0" weight="light" />
                      <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Opening Hours</p>
                        <p className="text-sm font-bold text-ink">{restaurant.openingHours}</p>
                      </div>
                    </div>
                  )}

                  {restaurant.contactInfo && (
                    <div className="flex items-start gap-3">
                      <Phone size={20} className="text-[#E18868] mt-0.5 shrink-0" weight="light" />
                      <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Contact</p>
                        <p className="text-sm font-bold text-ink">{restaurant.contactInfo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Placeholder */}
              {restaurant.latitude && restaurant.longitude && (
                <div className="bg-[#F2EFE8] rounded-[2rem] p-6 text-center border border-ink/5 relative overflow-hidden h-48">
                  <div className="absolute inset-0 opacity-30 flex items-center justify-center pointer-events-none">
                    <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400" alt="Map" fill className="object-cover grayscale" unoptimized />
                  </div>
                  <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    <Compass size={32} className="text-[#E18868] mb-2" weight="fill" />
                    <p className="text-sm font-bold text-ink">
                      {restaurant.latitude.toFixed(4)}, {restaurant.longitude.toFixed(4)}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 bg-white text-ink px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-cream transition-colors"
                    >
                      <NavigationArrow size={14} weight="fill" /> Get Directions
                    </a>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-[#E18868] to-[#D07757] rounded-[2rem] p-6 text-white">
                <h3 className="font-black text-lg mb-2">Visiting Southern Border?</h3>
                <p className="text-sm text-white/90 mb-4">
                  Start your journey and earn digital stamps & certificates at attractions nearby.
                </p>
                <Link
                  href="/passport"
                  className="inline-flex items-center gap-2 bg-white text-ink px-5 py-2.5 rounded-full text-xs font-bold shadow-sm hover:bg-cream transition-colors"
                >
                  Start Your Passport
                </Link>
              </div>

            </div>
          </aside>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 max-w-3xl">
          <ReviewList
            stats={reviewStats ?? { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }}
            reviews={publicReviews}
          />
          <div className="mt-8">
            <ReviewSubmissionForm restaurantId={restaurantId ?? undefined} />
          </div>
        </div>

      </div>
      <SiteFooter />
    </main>
  );
}
