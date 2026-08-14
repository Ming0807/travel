"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, ForkKnife, Clock, Phone, Compass, Image as ImageIcon } from "@phosphor-icons/react";
import { EditableBlock } from "@/components/admin/forms/EditableBlock";
import { Drawer } from "@/components/admin/Drawer";
import { HeaderForm, ContentForm, LocationForm, SettingsForm } from "./SectionForms";
import type { AdminRestaurantRow } from "@/lib/repositories/admin-restaurant.repository";
import type { AdminSelectOption } from "@/components/admin/restaurants/RestaurantForm";
import Image from "next/image";
import type { AdminRestaurantCategory } from "@/lib/repositories/admin-restaurant-category.repository";

type EditorSection = "header" | "content" | "location" | "settings" | "cover" | null;

interface RestaurantVisualEditorProps {
  restaurant: AdminRestaurantRow;
  provinces: AdminSelectOption[];
  categories: AdminRestaurantCategory[];
  coverMediaId?: number | null;
  coverMediaUrl?: string | null;
}

function MissingImageState({ title, description }: { title: string; description: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50 px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
        <ImageIcon size={28} weight="duotone" />
      </div>
      <h3 className="text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export function RestaurantVisualEditor({
  restaurant,
  provinces,
  categories,
  coverMediaId: initialCoverMediaId,
  coverMediaUrl: initialCoverMediaUrl,
}: RestaurantVisualEditorProps) {
  const [activeSection, setActiveSection] = useState<EditorSection>(null);
  const [coverMediaId, setCoverMediaId] = useState(initialCoverMediaId ?? null);
  const [coverMediaUrl, setCoverMediaUrl] = useState(initialCoverMediaUrl ?? null);

  const provinceName = provinces.find((p) => p.id === restaurant.province_id)?.label ?? "ไม่ระบุจังหวัด";
  const name = restaurant.name_th || "ยังไม่มีชื่อ";
  const coverImage = coverMediaUrl;

  return (
    <div className="relative min-h-screen bg-background pb-20">
      {/* Editor Toolbar */}
      <div className="sticky top-0 z-30 flex min-w-0 items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-md sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link aria-label="กลับไปหน้ารายการร้านอาหาร" href="/admin/restaurants" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--admin-radius-control)] bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black text-slate-800 sm:text-lg">แก้ไขร้านอาหาร: {name}</h1>
            <p className="hidden text-xs font-bold text-slate-500 sm:block">แก้ไขแต่ละส่วนจากตำแหน่งเดียวกับหน้าสาธารณะ</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden rounded-[var(--admin-radius-control)] bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 md:block">
            สถานะ: {restaurant.is_published ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
          </div>
          <button 
            type="button"
            aria-label="ตั้งค่า / สถานะ"
            onClick={() => setActiveSection("settings")}
            className="min-h-10 rounded-[var(--admin-radius-control)] border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] sm:px-4"
          >
            ตั้งค่า<span className="hidden sm:inline"> / สถานะ</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas (matches public layout) */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">

        {/* Breadcrumb (Non-editable) */}
        <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 pointer-events-none">
          <span>หน้าแรก</span> <span>/</span> <span>ร้านอาหาร</span> <span>/</span> <span className="text-slate-800">{name}</span>
        </div>

        {/* Hero Section */}
        <EditableBlock id="header" label="ข้อมูลหลักและรูปภาพ" isActive={activeSection === "header"} onEdit={() => setActiveSection("header")}>
          <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 mb-10 pointer-events-none">
            {coverImage ? (
              <>
                <Image src={coverImage} alt={name} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
              </>
            ) : (
              <MissingImageState
                title="Missing restaurant cover image"
                description="No saved cover image URL is set for this restaurant. Add approved restaurant media before treating this preview as publish-ready."
              />
            )}
            <div className={`absolute bottom-8 left-8 right-8 ${coverImage ? "text-white" : "text-slate-800"}`}>
              {restaurant.categories.length > 0 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {restaurant.categories.map((category) => (
                    <span key={category.categoryId} className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${coverImage ? "border-white/30 bg-black/25 text-white" : "border-amber-200 bg-white text-amber-700"}`}>
                      {category.nameTh}
                    </span>
                  ))}
                </div>
              ) : null}
              <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight">
                {name}
              </h1>
              <p className={`text-sm flex items-center gap-2 ${coverImage ? "text-white/80" : "text-slate-600"}`}>
                <MapPin size={14} weight="fill" />
                {provinceName}
              </p>
            </div>
          </div>
        </EditableBlock>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          {/* Left Column */}
          <div className="min-w-0 space-y-10">

            {/* Description */}
            <EditableBlock id="content" label="รายละเอียด" isActive={activeSection === "content"} onEdit={() => setActiveSection("content")}>
              <section className="pointer-events-none">
                <h2 className="text-2xl font-black text-slate-800 mb-4">เกี่ยวกับ</h2>
                <p className="text-base leading-relaxed text-slate-600 whitespace-pre-line">
                  {restaurant.description_th || "คลิกเพื่อเพิ่มรายละเอียดเกี่ยวกับร้านอาหาร"}
                </p>
              </section>
            </EditableBlock>

            {/* Nearby Attractions readiness */}
            <div className="relative rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center mt-12">
              <div className="absolute top-4 right-4 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                Missing content
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">สถานที่ท่องเที่ยวใกล้เคียง</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {restaurant.attraction_count > 0
                  ? `${restaurant.attraction_count} saved attraction relationship(s) exist. This preview does not generate automatic nearby cards or sample images.`
                  : "No saved attraction relationships are available for this restaurant preview. Link real attraction records before showing this public section."}
              </p>
            </div>

          </div>

          {/* Right Column - Info Sidebar */}
          <aside className="lg:block">
            <div className="sticky top-24 space-y-6">

              {/* Quick Info Card */}
              <EditableBlock id="location" label="ข้อมูลร้านอาหาร & พิกัด" isActive={activeSection === "location"} onEdit={() => setActiveSection("location")}>
                <div className="pointer-events-none">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
                    <h3 className="font-black text-slate-800 text-lg mb-6">ข้อมูลร้านอาหาร</h3>

                    <div className="space-y-5">
                      {restaurant.food_type && (
                        <div className="flex items-start gap-3">
                          <ForkKnife size={20} className="text-orange-500 mt-0.5 shrink-0" weight="light" />
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ประเภทอาหาร</p>
                            <p className="text-sm font-bold text-slate-800">{restaurant.food_type}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-orange-500 mt-0.5 shrink-0" weight="light" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ที่อยู่</p>
                          <p className="text-sm font-bold text-slate-800">{restaurant.address_text || "-"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock size={20} className="text-orange-500 mt-0.5 shrink-0" weight="light" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">เวลาทำการ</p>
                          <p className="text-sm font-bold text-slate-800">{restaurant.opening_hours || "-"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone size={20} className="text-orange-500 mt-0.5 shrink-0" weight="light" />
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ข้อมูลติดต่อ</p>
                          <p className="text-sm font-bold text-slate-800">{restaurant.contact_info || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map readiness */}
                  <div className="bg-slate-50 rounded-2xl p-6 text-center border-2 border-dashed border-slate-200 relative overflow-hidden h-48">
                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                      <Compass size={32} className="text-orange-500 mb-2" weight="fill" />
                      <p className="text-sm font-bold text-slate-800">
                        {restaurant.latitude !== null && restaurant.longitude !== null 
                          ? `${restaurant.latitude.toFixed(4)}, ${restaurant.longitude.toFixed(4)}`
                          : "Missing coordinates"
                        }
                      </p>
                      <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                        {restaurant.latitude !== null && restaurant.longitude !== null
                          ? "Saved coordinates are shown. A real map tile preview is not configured in this editor."
                          : "Add latitude and longitude before this location section is publish-ready."}
                      </p>
                    </div>
                  </div>
                </div>
              </EditableBlock>

              {/* Reviews readiness */}
              <div className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center mt-6">
                <div className="absolute top-4 right-4 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                  Planned content
                </div>
                <h3 className="font-bold text-slate-800 mb-2">รีวิวร้านอาหาร</h3>
                <Link href="/admin/reviews" className="inline-block mt-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 pointer-events-auto">
                  จัดการรีวิว
                </Link>
              </div>

            </div>
          </aside>
        </div>
      </div>

      {/* Drawers */}
      <Drawer
        isOpen={activeSection === "header"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขข้อมูลหลักและรูปภาพปก"
        size="lg"
        bodyClassName="p-0"
      >
        <HeaderForm
          restaurant={restaurant}
          onClose={() => setActiveSection(null)}
          coverMediaId={coverMediaId}
          coverMediaUrl={coverMediaUrl}
          onCoverChange={(mediaId, mediaUrl) => {
            setCoverMediaId(mediaId);
            setCoverMediaUrl(mediaUrl);
          }}
        />
      </Drawer>

      <Drawer
        isOpen={activeSection === "content"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขรายละเอียด (Content)"
        size="lg"
      >
        <ContentForm restaurant={restaurant} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "location"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขพิกัดและการติดต่อ (Location)"
        size="lg"
      >
        <LocationForm restaurant={restaurant} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "settings"}
        onClose={() => setActiveSection(null)}
        title="ตั้งค่าหมวดหมู่และสถานะ" bodyClassName="p-0"
      >
        <SettingsForm
          restaurant={restaurant}
          provinces={provinces}
          categories={categories}
          onClose={() => setActiveSection(null)}
        />
      </Drawer>

    </div>
  );
}
