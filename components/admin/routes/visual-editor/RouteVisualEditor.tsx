"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, CalendarBlank, Image as ImageIcon, ArrowSquareOut, List, WarningCircle, XCircle } from "@phosphor-icons/react";
import { EditableBlock } from "@/components/admin/forms/EditableBlock";
import { Drawer } from "@/components/admin/Drawer";
import { HeaderForm, ContentForm, SettingsForm, CoverForm } from "./SectionForms";
import type { AdminRouteRow, AdminRouteStopRow } from "@/lib/repositories/admin-route.repository";

interface AttractionOption {
  attraction_id: number;
  name_th: string;
  is_active: boolean;
  is_published: boolean;
}

type EditorSection = "header" | "content" | "settings" | "cover" | null;

interface RouteVisualEditorProps {
  route: AdminRouteRow;
  coverMediaId?: number | null;
  coverMediaUrl?: string | null;
  stops?: AdminRouteStopRow[];
  attractions?: AttractionOption[];
}

function MissingImageState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
        <ImageIcon size={28} weight="duotone" />
      </div>
      <h3 className="text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export function RouteVisualEditor({
  route,
  coverMediaId: initialCoverMediaId,
  coverMediaUrl: initialCoverMediaUrl,
  stops: stopsProp,
  attractions,
}: RouteVisualEditorProps) {
  const [activeSection, setActiveSection] = useState<EditorSection>(null);

  const name = route.name_th || "ยังไม่มีชื่อ";
  const [coverMediaId, setCoverMediaId] = useState(initialCoverMediaId ?? null);
  const [coverMediaUrl, setCoverMediaUrl] = useState(initialCoverMediaUrl ?? null);
  const coverImage = coverMediaUrl;
  const publicHref = route.slug ? `/routes/${route.slug}` : null;
  const stopCount = route.stop_count;
  // Estimate days from stop count (3-4 stops per day is typical)
  const estimatedDays = stopCount > 0 ? Math.max(1, Math.ceil(stopCount / 3.5)) : 1;

  // Duplicate detection
  const stops = stopsProp ?? [];
  const duplicatedAttractions = new Map<number, { name: string; occurrences: { dayNumber: number; displayOrder: number }[] }>();
  if (stops.length > 0) {
    const attractionOccurrences = new Map<number, { dayNumber: number; displayOrder: number }[]>();
    stops.forEach((s) => {
      const occs = attractionOccurrences.get(s.attraction_id) ?? [];
      occs.push({ dayNumber: s.day_number, displayOrder: s.display_order });
      attractionOccurrences.set(s.attraction_id, occs);
    });
    attractionOccurrences.forEach((occs, attractionId) => {
      if (occs.length > 1) {
        const attraction = attractions?.find((a) => a.attraction_id === attractionId);
        duplicatedAttractions.set(attractionId, { name: attraction?.name_th ?? "สถานที่", occurrences: occs });
      }
    });
  }
  const hasDuplicateStops = duplicatedAttractions.size > 0;

  // ─── Toast state ────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast({ message: "", visible: false });
    }, 5000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message: "", visible: false });
  }, []);

  useEffect(() => {
    if (hasDuplicateStops) {
      const names = Array.from(duplicatedAttractions.values()).map((info) => info.name);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      showToast(`พบจุดแวะซ้ำ ${duplicatedAttractions.size} แห่ง (${names.join(", ")}) \u2014 ไปที่จัดการจุดแวะพักเพื่อแก้ไข`);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background pb-20 text-slate-800">
      {/* Duplicate toast notification */}
      {toast.visible ? (
        <div className="fixed left-1/2 top-4 z-50 w-full max-w-lg -translate-x-1/2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-lg backdrop-blur-md">
            <WarningCircle size={20} className="mt-0.5 shrink-0 text-amber-600" weight="fill" />
            <p className="flex-1 text-sm font-bold leading-relaxed text-amber-900">{toast.message}</p>
            <button
              type="button"
              onClick={dismissToast}
              className="shrink-0 rounded-lg p-1 text-amber-500 transition hover:bg-amber-100 hover:text-amber-700"
              aria-label="ปิดการแจ้งเตือน"
            >
              <XCircle size={18} weight="bold" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Editor Toolbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/routes"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Back to routes list"
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-800">Visual Editor: {name}</h1>
            <p className="text-xs font-bold text-slate-500">คุณกำลังแก้ไขหน้าตาแบบเดียวกับที่แสดงผลจริง</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {publicHref ? (
            <Link
              href={publicHref}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
              aria-label="Preview public route page"
            >
              <ArrowSquareOut size={15} weight="bold" />
              Preview
            </Link>
          ) : null}
          <div className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
            สถานะ: {route.is_published ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
          </div>
          <button
            onClick={() => setActiveSection("settings")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ตั้งค่า / สถานะ
          </button>
        </div>
      </div>

      {/* Editor Canvas (matches public layout) */}
      <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 lg:px-8 md:pt-20">
        {/* Breadcrumb */}
        <div className="pointer-events-none mb-6 flex gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <span>หน้าแรก</span> <span>/</span> <span>เส้นทางแนะนำ</span> <span>/</span> <span className="text-slate-800">{name}</span>
        </div>

        {/* Hero Section */}
        <EditableBlock
          id="hero"
          label="รูปภาพปกและข้อมูลหลัก"
          isActive={activeSection === "cover" || activeSection === "header"}
          onEdit={() => setActiveSection("header")}
        >
          <div className="relative mb-12 h-[40vh] min-h-[300px] w-full overflow-hidden rounded-2xl shadow-lg border border-slate-200 pointer-events-none">
            {coverImage ? (
              <>
                <Image
                  src={coverImage}
                  alt={name}
                  fill
                  className="object-cover opacity-70"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
              </>
            ) : (
              <MissingImageState
                title="Missing route cover image"
                description="No saved cover image URL is set for this route. Add approved media before treating this preview as publish-ready."
              />
            )}

            {/* Hero text overlay */}
            <div className={`absolute inset-0 flex items-end ${coverImage ? "text-white" : "text-slate-800"}`}>
              <div className="w-full px-6 pb-8 sm:px-10">
                <span className="mb-4 inline-block rounded-full bg-green-700 px-3 py-1 text-xs font-bold text-white">
                  เส้นทางแนะนำ
                </span>
                <h1 className={`text-3xl font-black md:text-5xl ${coverImage ? "text-white" : "text-slate-800"}`}>
                  {name}
                </h1>
                <div className={`mt-4 flex flex-wrap items-center gap-4 ${coverImage ? "text-white/90" : "text-slate-600"}`}>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <CalendarBlank size={18} />
                    <span>{estimatedDays} วัน</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin size={18} />
                    <span>{stopCount} สถานที่</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setActiveSection("cover"); }}
                    className={`ml-auto rounded-lg border px-3 py-1 text-xs font-bold pointer-events-auto ${
                      coverImage
                        ? "border-white/30 bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                        : "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                  >
                    {coverImage ? "Change cover" : "Add cover image"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </EditableBlock>

        {/* Content grid */}
        <div className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* LEFT: Overview + Stops */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview Section */}
            <EditableBlock
              id="content"
              label="ภาพรวมเส้นทาง"
              isActive={activeSection === "content"}
              onEdit={() => setActiveSection("content")}
            >
              <section className="pointer-events-none">
                <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
                  <h2 className="mb-4 text-xl font-bold text-slate-800">ภาพรวมเส้นทาง</h2>
                  <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-600 whitespace-pre-line">
                    {route.description_th || (
                      <p className="text-slate-400 italic">
                        ยังไม่มีรายละเอียดเส้นทาง คลิก &quot;แก้ไข&quot; เพื่อเพิ่มคำอธิบายเส้นทาง
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </EditableBlock>

            {/* Day-by-day Itinerary (read-only preview) */}
            {stopCount > 0 ? (
              <section className="pointer-events-none rounded-3xl bg-white p-6 shadow-sm md:p-10">
                <h2 className="mb-8 text-2xl font-black text-slate-800">แผนการเดินทาง</h2>
                <div className="space-y-8">
                  {Array.from({ length: estimatedDays }, (_, i) => i + 1).map((day) => (
                    <div key={day} className="relative">
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-lg font-black text-white shadow-sm">
                          {day}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">วันที่ {day}</h3>
                      </div>
                      <div className="ml-6 space-y-6 border-l-2 border-slate-200 py-4 pl-8">
                        {/* Placeholder stops */}
                        {route.stop_count > 0 && (
                          <div className="relative">
                            <div className="absolute -left-[41px] top-4 h-4 w-4 rounded-full border-4 border-white bg-green-600 shadow-sm" />
                            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                              <MapPin size={24} className="mx-auto text-green-600 mb-2" weight="fill" />
                              <p className="text-sm font-bold text-slate-600">
                                {stopCount} จุดแวะพักในบันทึก
                              </p>
                              <p className="mt-1 max-w-xs mx-auto text-xs leading-5 text-slate-500">
                                แผนการเดินทางและลำดับจุดแวะพักจะแสดงตามข้อมูลที่บันทึกใน
                              </p>
                              <Link
                                href={`/admin/routes/${route.route_id}/stops`}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 pointer-events-auto"
                              >
                                <List size={15} />
                                จัดการจุดแวะพัก
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="pointer-events-none rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <MapPin size={32} className="mx-auto text-green-600 mb-3" weight="fill" />
                <h3 className="text-lg font-bold text-slate-800 mb-2">ยังไม่มีจุดแวะพัก</h3>
                <p className="max-w-md mx-auto text-sm leading-6 text-slate-500">
                  เพิ่มจุดแวะพัก (stops) ในเส้นทางหลังจากบันทึกข้อมูลหลักแล้ว
                </p>
                <Link
                  href={`/admin/routes/${route.route_id}/stops`}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-green-700 shadow-sm transition hover:bg-slate-50 pointer-events-auto"
                >
                  <List size={16} />
                  จัดการจุดแวะพัก
                </Link>
              </section>
            )}
          </div>

          {/* RIGHT: Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              {/* Route Info Card */}
              <EditableBlock
                id="header"
                label="ข้อมูลเส้นทาง"
                isActive={activeSection === "header"}
                onEdit={() => setActiveSection("header")}
              >
                <div className="pointer-events-none rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-6 text-lg font-black text-slate-800">ข้อมูลเส้นทาง</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">ชื่อภาษาไทย</p>
                      <p className="mt-1 text-sm font-bold text-slate-800">{route.name_th || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">ชื่อภาษาอังกฤษ</p>
                      <p className="mt-1 text-sm font-bold text-slate-800">{route.name_en || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Slug</p>
                      <p className="mt-1 font-mono text-sm font-bold text-slate-800">{route.slug || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">จุดแวะพัก</p>
                      <p className="mt-1 text-sm font-bold text-slate-800">{stopCount} จุด</p>
                    </div>
                  </div>
                </div>
              </EditableBlock>

              {/* Related Stops Management */}
              <div className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <div className="absolute right-4 top-4 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                  Management
                </div>
                <MapPin size={28} className="mx-auto text-green-600 mb-2" weight="fill" />
                <h3 className="font-bold text-slate-800 mb-1">จัดการจุดแวะพัก</h3>
                <p className="text-xs leading-5 text-slate-500 mb-3">
                  เพิ่ม จัดลำดับ และแก้ไขจุดแวะพักตามวัน
                </p>
                {hasDuplicateStops ? (
                  <div className="mb-3 rounded-xl border border-amber-300 bg-amber-100 p-3 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                      <WarningCircle size={14} weight="fill" />
                      พบจุดแวะซ้ำ {duplicatedAttractions.size} แห่ง
                    </div>
                    <ul className="mt-1.5 space-y-1">
                      {Array.from(duplicatedAttractions.entries()).map(([attractionId, info]) => (
                        <li key={attractionId} className="text-[11px] leading-tight text-amber-800">
                          <span className="font-bold">{info.name}</span>
                          <span className="ml-1">
                            ({info.occurrences.map((o) => `วัน ${o.dayNumber} (ลำดับ ${o.displayOrder})`).join(', ')})
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs font-bold text-amber-800">
                      ไปที่จัดการจุดแวะพักเพื่อลบรายการซ้ำ
                    </p>
                  </div>
                ) : null}
                <Link
                  href={`/admin/routes/${route.route_id}/stops`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 pointer-events-auto"
                >
                  <List size={15} />
                  ไปที่จัดการจุดแวะพัก
                </Link>
              </div>

              {/* English description readiness */}
              {!route.name_en && !route.description_en ? (
                <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Optional</p>
                  <p className="text-sm font-bold text-slate-700 mb-1">Add English content</p>
                  <p className="max-w-xs mx-auto text-xs leading-5 text-slate-500">
                    Route will display only in Thai until English descriptions are added.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <Drawer
        isOpen={activeSection === "header"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขข้อมูลเส้นทาง (Route Info)"
      >
        <HeaderForm route={route} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "cover"}
        onClose={() => setActiveSection(null)}
        title="รูปภาพปก (Cover Image)"
      >
        <CoverForm
          route={route}
          onClose={() => setActiveSection(null)}
          coverMediaId={coverMediaId}
          coverMediaUrl={coverMediaUrl}
          onCoverChange={(id, url) => {
            setCoverMediaId(id);
            setCoverMediaUrl(url);
          }}
        />
      </Drawer>

      <Drawer
        isOpen={activeSection === "content"}
        onClose={() => setActiveSection(null)}
        title="รายละเอียดเส้นทาง (Content)"
        size="lg"
      >
        <ContentForm route={route} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "settings"}
        onClose={() => setActiveSection(null)}
        title="ตั้งค่าและการเผยแพร่"
      >
        <SettingsForm route={route} onClose={() => setActiveSection(null)} />
      </Drawer>
    </div>
  );
}
