"use client";

import { useState } from "react";
import { AttractionHeader } from "@/components/attractions/attraction-header";
import { AttractionGallery } from "@/components/attractions/attraction-gallery";
import { AttractionTabs } from "@/components/attractions/attraction-tabs";
import { AttractionInfoSidebar } from "@/components/attractions/attraction-info-sidebar";
import { EditableBlock } from "@/components/admin/forms/EditableBlock";
import { Drawer } from "@/components/admin/Drawer";
import { HeaderForm, ContentForm, LocationForm, SettingsForm } from "./SectionForms";
import { MediaManager } from "@/components/admin/attractions/MediaManager";
import { RelatedContentForm } from "./RelatedContentForm";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import type { AdminMediaRow } from "@/lib/repositories/admin-media.repository";
import type { AdminSelectOption } from "@/components/admin/attractions/AttractionForm";
import { MapPinLine, ArrowLeft, PencilSimple, Image as ImageIcon, Eye, QrCode, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { AttractionCardsRow } from "@/components/attractions/attraction-cards-row";
import { AttractionReviews } from "@/components/attractions/attraction-reviews";
import type { PublicAttractionDetail } from "@/lib/repositories/public-content.repository";

type EditorSection = "header" | "content" | "location" | "settings" | "gallery" | "related_attractions" | "related_accommodations" | "related_restaurants" | "related_stories" | null;

type RelatedOption = {
  id: number;
  name: string;
  province?: string;
};

type AttractionRelatedContent = {
  attractions?: { related_attraction_id: number | string | null }[];
  accommodations?: { accommodation_id: number | string | null }[];
  restaurants?: { restaurant_id: number | string | null }[];
  stories?: { story_id: number | string | null }[];
};

type AdminContentLists = {
  attractions?: RelatedOption[];
  accommodations?: RelatedOption[];
  restaurants?: RelatedOption[];
  stories?: RelatedOption[];
};

interface AttractionVisualEditorProps {
  attraction: AdminAttractionRow;
  media: AdminMediaRow[];
  provinces: AdminSelectOption[];
  districts: (AdminSelectOption & { provinceId: number })[];
  attractionTypes: AdminSelectOption[];
  publicDetail?: PublicAttractionDetail | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviewStats?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publicReviews?: any[];
  allContent?: AdminContentLists;
  relatedContent?: AttractionRelatedContent;
}

function MissingImageState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
        <ImageIcon size={28} weight="duotone" />
      </div>
      <h3 className="text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function ReadinessState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Missing content</p>
      <h3 className="mt-2 text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {onAction && actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          <PencilSimple size={16} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

type PageMapItem = {
  id: string;
  label: string;
  publicSection: string;
  complete: boolean;
  help: string;
  actionLabel: string;
  targetSection?: Exclude<EditorSection, null>;
  href?: string;
};

function PageMap({
  items,
  activeSection,
  onOpenSection,
}: {
  items: PageMapItem[];
  activeSection: EditorSection;
  onOpenSection: (section: Exclude<EditorSection, null>) => void;
}) {
  const completeCount = items.filter((item) => item.complete).length;

  return (
    <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-coral">Public page map</p>
            <h2 className="mt-1 text-base font-black text-slate-900">Edit by the same sections visitors see</h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              Each card maps to a public attraction page section. Fix warnings before publishing or sharing QR links.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
            Ready {completeCount}/{items.length}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const card = (
              <div
                className={`h-full rounded-2xl border p-3 text-left transition ${
                  activeSection === item.targetSection
                    ? "border-teal bg-teal/5"
                    : item.complete
                      ? "border-emerald-100 bg-emerald-50/60 hover:bg-emerald-50"
                      : "border-amber-200 bg-amber-50 hover:bg-amber-100/70"
                }`}
              >
                <div className="flex items-start gap-2">
                  {item.complete ? (
                    <CheckCircle className="mt-0.5 shrink-0 text-emerald-700" size={18} weight="fill" />
                  ) : (
                    <WarningCircle className="mt-0.5 shrink-0 text-amber-700" size={18} weight="fill" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">{item.label}</p>
                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">{item.publicSection}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{item.help}</p>
                    <span className="mt-3 inline-flex text-xs font-black text-teal">{item.actionLabel}</span>
                  </div>
                </div>
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className="block focus:outline-none focus:ring-2 focus:ring-teal/30 rounded-2xl">
                  {card}
                </Link>
              );
            }

            if (item.targetSection) {
              return (
                <button key={item.id} type="button" onClick={() => onOpenSection(item.targetSection!)} className="text-left">
                  {card}
                </button>
              );
            }

            return <div key={item.id}>{card}</div>;
          })}
        </div>
      </div>
    </section>
  );
}

export function AttractionVisualEditor({
  attraction,
  media,
  provinces,
  districts,
  attractionTypes,
  publicDetail,
  reviewStats,
  publicReviews,
  allContent,
  relatedContent
}: AttractionVisualEditorProps) {
  const [activeSection, setActiveSection] = useState<EditorSection>(null);

  // Derive display data to match frontend components
  const provinceName = provinces.find((p) => p.id === attraction.province_id)?.label ?? "ไม่ระบุจังหวัด";
  const name = attraction.name_th || "ยังไม่มีชื่อ";
  const description = attraction.description_th || attraction.short_description_th || "คลิกเพื่อเพิ่มเนื้อหา";
  
  // Derive media
  const sortedMedia = [...media].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const images = sortedMedia
    .filter(m => m.media_type === "image" || m.media_type === "panorama" || m.media_type === "external_url")
    .map(m => {
      if (m.storage_path.startsWith("http")) return m.storage_path;
      return `/api/media/image?path=${encodeURIComponent(m.storage_path)}`;
    });
  const hasGalleryImages = images.length > 0;
  const relatedAttractionCount = relatedContent?.attractions?.length ?? 0;
  const relatedAccommodationCount = relatedContent?.accommodations?.length ?? 0;
  const relatedRestaurantCount = relatedContent?.restaurants?.length ?? 0;
  const relatedStoryCount = relatedContent?.stories?.length ?? 0;
  const publicThingsToDo = relatedAttractionCount > 0 ? publicDetail?.thingsToDo ?? [] : [];
  const publicWhereToStay = relatedAccommodationCount > 0 ? publicDetail?.whereToStay ?? [] : [];
  const publicFoodAndDrink = relatedRestaurantCount > 0 ? publicDetail?.foodAndDrink ?? [] : [];
  const publicArticles = relatedStoryCount > 0 ? publicDetail?.articles ?? [] : [];
  const photoSpotCount = attraction.photo_spot_count ?? 0;
  const checkinCodeCount = attraction.checkin_code_count ?? 0;
  const hasPublicText = Boolean(attraction.short_description_th || attraction.description_th);
  const hasLocationDetails = Boolean(attraction.address_text || attraction.how_to_get_there_th || (attraction.latitude !== null && attraction.longitude !== null));
  const hasRelatedContent = relatedAttractionCount + relatedAccommodationCount + relatedRestaurantCount + relatedStoryCount > 0;
  const pageMapItems: PageMapItem[] = [
    {
      id: "header",
      label: "Header",
      publicSection: "Title, slug, province",
      complete: Boolean(attraction.name_th && attraction.slug && attraction.province_id && attraction.is_active),
      help: attraction.name_th && attraction.slug ? "Visitor identity fields are in place." : "Add the Thai name, slug, and province.",
      actionLabel: "Edit header",
      targetSection: "header",
    },
    {
      id: "gallery",
      label: "Gallery",
      publicSection: "Cover and images",
      complete: hasGalleryImages,
      help: hasGalleryImages ? `${images.length} image(s) linked.` : "Add an official cover or gallery image.",
      actionLabel: "Manage media",
      targetSection: "gallery",
    },
    {
      id: "content",
      label: "Overview",
      publicSection: "Overview, history, tips",
      complete: hasPublicText,
      help: hasPublicText ? "Public description is available." : "Add short or full Thai description.",
      actionLabel: "Edit content",
      targetSection: "content",
    },
    {
      id: "location",
      label: "Location",
      publicSection: "How to get there",
      complete: hasLocationDetails,
      help: hasLocationDetails ? "Location details are present." : "Add address, travel guidance, or coordinates.",
      actionLabel: "Edit location",
      targetSection: "location",
    },
    {
      id: "qr",
      label: "QR flow",
      publicSection: "CTA and check-in",
      complete: photoSpotCount > 0 && checkinCodeCount > 0,
      help: `${photoSpotCount} photo spot(s), ${checkinCodeCount} check-in code(s).`,
      actionLabel: photoSpotCount > 0 ? "Manage QR codes" : "Create photo spot",
      href: photoSpotCount > 0 ? `/admin/checkin-codes?attractionId=${attraction.attraction_id}` : `/admin/photo-spots/new?attraction_id=${attraction.attraction_id}`,
    },
    {
      id: "related",
      label: "Related content",
      publicSection: "Food, stays, stories",
      complete: hasRelatedContent,
      help: hasRelatedContent ? "At least one related section has saved records." : "Optional: link real stays, restaurants, stories, or nearby attractions.",
      actionLabel: "Select related records",
      targetSection: "related_attractions",
    },
    {
      id: "publish",
      label: "Publish",
      publicSection: "Visibility",
      complete: Boolean(attraction.is_active && attraction.is_published),
      help: attraction.is_published ? "Record is visible when public rules pass." : "Keep as draft until content and media are ready.",
      actionLabel: "Edit status",
      targetSection: "settings",
    },
  ];

  return (
    <div className="relative min-h-screen bg-white pb-20">
      {/* Editor Toolbar */}
      <div className="sticky top-0 z-30 flex flex-col gap-4 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full items-center gap-4 lg:w-auto">
          <Link href="/admin/attractions" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-800">Visual Editor: {name}</h1>
            <p className="text-xs font-bold text-slate-500">คุณกำลังแก้ไขหน้าตาแบบเดียวกับที่แสดงผลจริง</p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          <Link
            href={`/attractions/${attraction.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Eye size={16} weight="bold" />
            Preview public page
          </Link>
          <Link
            href={`/admin/attractions/${attraction.attraction_id}/media`}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 md:inline-flex"
          >
            <ImageIcon size={16} weight="bold" />
            Media
          </Link>
          <Link
            href={`/admin/checkin-codes?attractionId=${attraction.attraction_id}`}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 xl:inline-flex"
          >
            <QrCode size={16} weight="bold" />
            QR
          </Link>
          <div className="rounded-lg bg-teal/10 px-3 py-1.5 text-xs font-bold text-teal">
            สถานะ: {attraction.is_published ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
          </div>
          <button
            type="button"
            onClick={() => setActiveSection("settings")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ตั้งค่า / สถานะ
          </button>
        </div>
      </div>

      <PageMap items={pageMapItems} activeSection={activeSection} onOpenSection={setActiveSection} />

      {/* Editor Canvas (matches public layout) */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        
        {/* Header Block */}
        <EditableBlock id="header" label="ข้อมูลหลัก" isActive={activeSection === "header"} onEdit={() => setActiveSection("header")}>
          <AttractionHeader 
            name={name}
            province={provinceName}
            rating={0}
            reviewsCount="0"
            bestTimeToVisit="ตลอดปี"
          />
        </EditableBlock>

        {/* Gallery Block */}
        <EditableBlock id="gallery" label="รูปภาพ (Gallery)" isActive={activeSection === "gallery"} onEdit={() => setActiveSection("gallery")}>
          <div className="mt-6 pointer-events-none">
            {hasGalleryImages ? (
              <AttractionGallery
                mainImage={images[0]}
                gallery={images.slice(0, 4)}
              />
            ) : (
              <MissingImageState
                title="Missing attraction image"
                description="No official media is linked to this attraction yet. Add a cover or gallery image before treating this preview as publish-ready."
              />
            )}
          </div>
        </EditableBlock>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* Main Content Area */}
          <div className="min-w-0 space-y-12">
            <AttractionTabs />
            
            {/* Overview / Content Block */}
            <EditableBlock id="content" label="เนื้อหา" isActive={activeSection === "content"} onEdit={() => setActiveSection("content")}>
              <div className="space-y-12">
                <section id="overview" className="scroll-mt-24 pointer-events-none">
                  <h2 className="mb-4 text-2xl font-bold text-slate-800">Overview</h2>
                  <p className="text-base leading-relaxed text-slate-600 whitespace-pre-wrap">
                    {description}
                  </p>
                </section>
                
                {attraction.history_th && (
                  <section id="history" className="scroll-mt-24 pointer-events-none">
                    <h2 className="mb-4 text-2xl font-bold text-slate-800">ประวัติศาสตร์ / เรื่องเล่า</h2>
                    <p className="text-base leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {attraction.history_th}
                    </p>
                  </section>
                )}
                
                {attraction.travel_tips_th && (
                  <section id="tips" className="scroll-mt-24 pointer-events-none mt-8">
                    <h2 className="mb-4 text-2xl font-bold text-slate-800">ข้อแนะนำการเดินทาง (Travel Tips)</h2>
                    <div className="rounded-2xl bg-amber-50 p-6 border border-amber-100">
                      <p className="text-base leading-relaxed text-amber-900 whitespace-pre-wrap">
                        {attraction.travel_tips_th}
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </EditableBlock>
            
            {/* Relational Content Block (Rendered visually but edits navigate away) */}
            <div className="space-y-12 mt-12 relative border-t border-slate-200 pt-12">
              <div className="absolute top-0 right-0 -mt-3 rounded-full bg-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500">
                ข้อมูลเชื่อมโยง (Relational Data)
              </div>

              {/* Things to Do */}
              {publicThingsToDo.length > 0 ? (
                <div className="relative group rounded-3xl border border-transparent hover:border-slate-300 p-2 -mx-2 transition-colors">
                  <div className="pointer-events-none">
                    <AttractionCardsRow 
                      id="things-to-do"
                      title="Things to Do"
                      items={publicThingsToDo}
                      viewAllText="View all things to do"
                    />
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                    <button onClick={() => setActiveSection("related_attractions")} className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                      <PencilSimple size={14} /> เลือกเนื้อหา
                    </button>
                  </div>
                </div>
              ) : (
                <ReadinessState
                  title="No related attractions selected"
                  description="This editor will not show automatic or sample destination cards. Select saved related attractions if this public section should appear."
                  actionLabel="Select related attractions"
                  onAction={() => setActiveSection("related_attractions")}
                />
              )}

              {/* Where to Stay */}
              {publicWhereToStay.length > 0 ? (
                <div className="relative group rounded-3xl border border-transparent hover:border-slate-300 p-2 -mx-2 transition-colors">
                  <div className="pointer-events-none">
                    <AttractionCardsRow 
                      id="where-to-stay"
                      title="Where to Stay"
                      items={publicWhereToStay}
                      viewAllText="View all hotels"
                    />
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                    <button onClick={() => setActiveSection("related_accommodations")} className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                      <PencilSimple size={14} /> เลือกเนื้อหา
                    </button>
                  </div>
                </div>
              ) : (
                <ReadinessState
                  title="No related accommodations selected"
                  description="Accommodation cards are hidden until saved accommodation relationships exist. This avoids showing sample lodging cards in the CMS preview."
                  actionLabel="Select accommodations"
                  onAction={() => setActiveSection("related_accommodations")}
                />
              )}

              {/* Food & Drink */}
              {publicFoodAndDrink.length > 0 ? (
                <div className="relative group rounded-3xl border border-transparent hover:border-slate-300 p-2 -mx-2 transition-colors">
                  <div className="pointer-events-none">
                    <AttractionCardsRow 
                      id="food"
                      title="Food & Drink"
                      items={publicFoodAndDrink}
                      viewAllText="View all restaurants"
                    />
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                    <button onClick={() => setActiveSection("related_restaurants")} className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                      <PencilSimple size={14} /> เลือกเนื้อหา
                    </button>
                  </div>
                </div>
              ) : (
                <ReadinessState
                  title="No related restaurants selected"
                  description="Restaurant cards are hidden until saved restaurant relationships exist. Add real related records instead of using preview filler."
                  actionLabel="Select restaurants"
                  onAction={() => setActiveSection("related_restaurants")}
                />
              )}

              {/* Reviews Summary */}
              <div className="relative group">
                <div className="pointer-events-none">
                  <AttractionReviews
                    rating={reviewStats?.averageRating || 0}
                    reviewsCount={reviewStats?.totalReviews?.toString() || "0"}
                    stats={reviewStats}
                    reviews={publicReviews}
                  />
                </div>
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href="/admin/reviews" className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                    <PencilSimple size={14} /> จัดการรีวิว
                  </Link>
                </div>
              </div>
              
              {/* Recommended Articles */}
              {publicArticles.length > 0 ? (
                <div className="relative group rounded-3xl border border-transparent hover:border-slate-300 p-2 -mx-2 transition-colors">
                  <div className="pointer-events-none">
                    <AttractionCardsRow 
                      id="articles"
                      title="Recommended Articles"
                      items={publicArticles}
                      viewAllText="View all articles"
                    />
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                    <button onClick={() => setActiveSection("related_stories")} className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                      <PencilSimple size={14} /> เลือกเนื้อหา
                    </button>
                  </div>
                </div>
              ) : (
                <ReadinessState
                  title="No related stories selected"
                  description="Article cards are hidden until saved story relationships exist. This preview will not invent editorial recommendations."
                  actionLabel="Select stories"
                  onAction={() => setActiveSection("related_stories")}
                />
              )}
            </div>
            
            {/* Location / Map Block */}
            <EditableBlock id="location" label="พิกัด & แผนที่" isActive={activeSection === "location"} onEdit={() => setActiveSection("location")}>
              <section id="how-to-get-there" className="scroll-mt-24 pt-8 pointer-events-none">
                <h2 className="mb-4 text-2xl font-bold text-slate-800">วิธีการเดินทาง (How to Get There)</h2>
                <p className="mb-6 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                  {attraction.how_to_get_there_th || attraction.address_text || "คลิกเพื่อเพิ่มที่อยู่และการเดินทาง"}
                </p>
                <div className="aspect-[21/9] w-full overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center relative text-center">
                  <div className="flex flex-col items-center px-6">
                    <MapPinLine size={48} className="text-coral/50" weight="duotone" />
                    <p className="mt-3 text-sm font-bold text-slate-800">
                      {attraction.latitude !== null && attraction.longitude !== null
                        ? `${attraction.latitude.toFixed(4)}, ${attraction.longitude.toFixed(4)}`
                        : "Missing coordinates"}
                    </p>
                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                      {attraction.latitude !== null && attraction.longitude !== null
                        ? "Saved coordinates are shown. A real map tile preview is not configured in this editor."
                        : "Add latitude and longitude before this location section is publish-ready."}
                    </p>
                  </div>
                </div>
              </section>
            </EditableBlock>
          </div>
          
          {/* Sidebar Area */}
          <aside className="hidden lg:block">
            <EditableBlock id="sidebar" label="ตั้งค่า / สถานะ" isActive={activeSection === "settings"} onEdit={() => setActiveSection("settings")}>
              <div className="pointer-events-none sticky top-24">
                <AttractionInfoSidebar 
                  info={{
                    region: attraction.sustainability_category || "ไม่ระบุ",
                    population: attraction.estimated_capacity_per_day ? `~${attraction.estimated_capacity_per_day} คน/วัน` : "ไม่ระบุ",
                    language: "Thai, English",
                    currency: "THB",
                    timeZone: attraction.opening_hours || "GMT+7",
                  }} 
                />
                
                {/* Contact Info Preview */}
                {attraction.contact_info && (
                  <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-sm text-slate-600 border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-2">ข้อมูลการติดต่อ</h3>
                    <p>{attraction.contact_info}</p>
                  </div>
                )}
              </div>
            </EditableBlock>
          </aside>
        </div>
      </div>

      {/* Drawers */}
      <Drawer
        isOpen={activeSection === "header"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขข้อมูลหลัก (Header)"
      >
        <HeaderForm attraction={attraction} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "content"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขเนื้อหา (Content)"
        size="lg"
      >
        <ContentForm attraction={attraction} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "location"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขพิกัดและการติดต่อ (Location)"
        size="lg"
      >
        <LocationForm attraction={attraction} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "settings"}
        onClose={() => setActiveSection(null)}
        title="ตั้งค่าหมวดหมู่และสถานะ"
      >
        <SettingsForm attraction={attraction} provinces={provinces} districts={districts} attractionTypes={attractionTypes} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "gallery"}
        onClose={() => setActiveSection(null)}
        title="จัดการรูปภาพ (Media Gallery)"
        size="xl"
      >
        <div className="pb-10">
          <MediaManager entityId={attraction.attraction_id} entityType="attraction" initialMedia={media} />
        </div>
      </Drawer>

      {/* Related Content Drawers */}
      <Drawer
        isOpen={activeSection === "related_attractions"}
        onClose={() => setActiveSection(null)}
        title="เลือกสถานที่ท่องเที่ยวใกล้เคียง"
      >
        <RelatedContentForm 
          attractionId={attraction.attraction_id}
          type="attractions"
          availableItems={allContent?.attractions?.filter((a) => a.id !== attraction.attraction_id) || []}
          initialSelectedIds={relatedContent?.attractions?.map((a) => Number(a.related_attraction_id)) || []}
          attractionProvince={provinceName}
          onClose={() => setActiveSection(null)}
          title="Things to Do"
        />
      </Drawer>

      <Drawer
        isOpen={activeSection === "related_accommodations"}
        onClose={() => setActiveSection(null)}
        title="เลือกที่พักใกล้เคียง"
      >
        <RelatedContentForm 
          attractionId={attraction.attraction_id}
          type="accommodations"
          availableItems={allContent?.accommodations || []}
          initialSelectedIds={relatedContent?.accommodations?.map((a) => Number(a.accommodation_id)) || []}
          attractionProvince={provinceName}
          onClose={() => setActiveSection(null)}
          title="Where to Stay"
        />
      </Drawer>

      <Drawer
        isOpen={activeSection === "related_restaurants"}
        onClose={() => setActiveSection(null)}
        title="เลือกร้านอาหารใกล้เคียง"
      >
        <RelatedContentForm 
          attractionId={attraction.attraction_id}
          type="restaurants"
          availableItems={allContent?.restaurants || []}
          initialSelectedIds={relatedContent?.restaurants?.map((a) => Number(a.restaurant_id)) || []}
          attractionProvince={provinceName}
          onClose={() => setActiveSection(null)}
          title="Food & Drink"
        />
      </Drawer>

      <Drawer
        isOpen={activeSection === "related_stories"}
        onClose={() => setActiveSection(null)}
        title="เลือกบทความที่เกี่ยวข้อง"
      >
        <RelatedContentForm 
          attractionId={attraction.attraction_id}
          type="stories"
          availableItems={allContent?.stories || []}
          initialSelectedIds={relatedContent?.stories?.map((a) => Number(a.story_id)) || []}
          attractionProvince={provinceName}
          onClose={() => setActiveSection(null)}
          title="Articles"
        />
      </Drawer>
    </div>
  );
}
