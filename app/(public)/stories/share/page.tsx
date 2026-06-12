import { ArrowLeft, PenNib } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ShareStoryForm } from "@/components/stories/ShareStoryForm";
import { TouristAuthGate } from "@/components/auth/TouristAuthGate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แบ่งปันเรื่องราวของคุณ | ท่องเที่ยวชายแดนใต้",
};

export const dynamic = "force-dynamic";

export default async function ShareStoryPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session?.user;

  // Fetch provinces for the form
  const { data: provinces } = await supabase
    .from("provinces")
    .select("province_id, province_name_en, province_name_th")
    .order("province_id");

  const formattedProvinces = (provinces || []).map((p) => ({
    id: p.province_id,
    name: p.province_name_th || p.province_name_en, // Prefer Thai name
  }));

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-ink selection:text-white">
      <main className="mx-auto max-w-3xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <Link
          href="/stories"
          className="mb-16 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/50 transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} weight="bold" />
          <span>กลับไปหน้าเรื่องราวทั้งหมด</span>
        </Link>

        <header className="mb-16">
          <h1 className="text-4xl font-black leading-[1.05] text-ink md:text-6xl tracking-tight mb-6">
            แบ่งปันประสบการณ์ของคุณ
          </h1>
          <p className="text-xl text-ink/70 font-medium leading-relaxed max-w-2xl">
            ทุกการเดินทางมีความหมาย ส่งต่อแรงบันดาลใจให้ผู้อื่นผ่านเรื่องราวการเดินทาง การค้นพบ และช่วงเวลาประทับใจใน ยะลา ปัตตานี และนราธิวาส
          </p>
        </header>

        <div className="border-t border-ink/10 pt-16">
          {!isAuthenticated ? (
            <TouristAuthGate />
          ) : (
            <ShareStoryForm provinces={formattedProvinces} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
