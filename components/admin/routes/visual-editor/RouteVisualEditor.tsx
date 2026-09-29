"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, Image as ImageIcon, MapPin } from "@phosphor-icons/react";
import { toggleRoutePublishAction } from "@/app/actions/admin-route-actions";
import { Drawer } from "@/components/admin/Drawer";
import { AdminFormSection, AdminHelpPanel, AdminReadinessPanel } from "@/components/admin/forms/AdminFormUX";
import { RouteForm } from "@/components/admin/routes/RouteForm";
import { RouteStopsManager, type RouteAttractionOption } from "@/components/admin/routes/RouteStopsManager";
import { RouteStopsMap } from "@/components/routes/RouteStopsMap";
import { CoverForm } from "./SectionForms";
import type { AdminRouteRow, AdminRouteStopRow } from "@/lib/repositories/admin-route.repository";
import { hasValidRouteCoordinate } from "@/lib/routes/public-route";

interface RouteVisualEditorProps {
  route: AdminRouteRow;
  coverMediaId?: number | null;
  coverMediaUrl?: string | null;
  stops?: AdminRouteStopRow[];
  attractions?: RouteAttractionOption[];
}

const sections = [
  { id: "basics", label: "ข้อมูลหลัก" },
  { id: "stops", label: "จุดแวะ" },
  { id: "cover", label: "รูปปก" },
  { id: "review", label: "ตรวจสอบ" },
] as const;

export function RouteVisualEditor({
  route,
  coverMediaId: initialCoverMediaId,
  coverMediaUrl: initialCoverMediaUrl,
  stops: stopsProp,
  attractions = [],
}: RouteVisualEditorProps) {
  const router = useRouter();
  const [isPublishing, startPublishTransition] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [coverMediaId, setCoverMediaId] = useState(initialCoverMediaId ?? null);
  const [coverMediaUrl, setCoverMediaUrl] = useState(initialCoverMediaUrl ?? null);
  const [isBasicsEditorOpen, setIsBasicsEditorOpen] = useState(false);
  const [isCoverEditorOpen, setIsCoverEditorOpen] = useState(false);
  const [workingStops, setWorkingStops] = useState(stopsProp ?? []);
  const [hasUnsavedStops, setHasUnsavedStops] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);

  const name = route.name_th || "ยังไม่มีชื่อ";
  const publicHref = route.slug ? `/routes/${route.slug}` : null;
  const savedStopsAvailable = stopsProp !== undefined;
  const routeStops = workingStops;
  const itineraryDays = useMemo(
    () => Array.from(new Set(routeStops.map((stop) => stop.day_number))).sort((a, b) => a - b),
    [routeStops]
  );
  const stopCount = routeStops.length;
  const attractionById = useMemo(
    () => new Map(attractions.map((attraction) => [attraction.attraction_id, attraction])),
    [attractions]
  );
  const duplicateMap = useMemo(() => {
    const occurrences = new Map<number, AdminRouteStopRow[]>();
    routeStops.forEach((stop) => occurrences.set(stop.attraction_id, [...(occurrences.get(stop.attraction_id) ?? []), stop]));
    return new Map(Array.from(occurrences.entries())
      .filter(([, items]) => items.length > 1)
      .map(([id, items]) => [id, {
        name: attractionById.get(id)?.name_th ?? items[0]?.attraction_name_th ?? "สถานที่",
        occurrences: items,
      }]));
  }, [attractionById, routeStops]);
  const missingCoordinates = useMemo(() => {
    const seen = new Set<number>();
    return routeStops.flatMap((stop) => {
      if (seen.has(stop.attraction_id)) return [];
      seen.add(stop.attraction_id);
      const attraction = attractionById.get(stop.attraction_id);
      if (attraction && hasValidRouteCoordinate({ latitude: attraction.latitude ?? null, longitude: attraction.longitude ?? null })) return [];
      return [{ id: stop.attraction_id, name: attraction?.name_th ?? stop.attraction_name_th ?? `สถานที่ #${stop.attraction_id}` }];
    });
  }, [attractionById, routeStops]);
  const distinctStopCount = new Set(routeStops.map((stop) => stop.attraction_id)).size;
  const previewStops = routeStops.map((stop) => {
    const attraction = attractionById.get(stop.attraction_id);
    return {
      attractionId: stop.attraction_id,
      dayNumber: stop.day_number,
      sequence: stop.display_order,
      attractionName: attraction?.name_th ?? stop.attraction_name_th ?? `สถานที่ #${stop.attraction_id}`,
      attractionSlug: attraction?.slug ?? "",
      attractionImage: null,
      attractionImageAlt: "",
      stopNote: stop.stop_note_th,
      latitude: attraction?.latitude ?? null,
      longitude: attraction?.longitude ?? null,
    };
  });

  const showDuplicateToast = duplicateMap.size > 0 && !toastDismissed;

  const readiness = [
    { label: "ชื่อเส้นทาง", complete: !!route.name_th.trim(), help: route.name_th.trim() ? route.name_th : "ยังไม่มีชื่อภาษาไทย" },
    { label: "Slug (URL)", complete: !!route.slug.trim(), help: route.slug ? `/routes/${route.slug}` : "ยังไม่ได้กำหนด URL" },
    { label: "รูปภาพปก", complete: !!coverMediaUrl, help: coverMediaUrl ? "มีรูปภาพปกที่บันทึกไว้" : "ยังไม่มีรูปภาพปกที่เชื่อมโยงกับเส้นทางนี้" },
    { label: "จุดแวะอย่างน้อย 2 แห่ง", complete: new Set(routeStops.map((stop) => stop.attraction_id)).size >= 2, help: `${stopCount} จุดแวะที่บันทึกไว้` },
  ];

  const handlePublish = () => {
    if (hasUnsavedStops) return;
    setPublishError(null);
    setPublishSuccess(false);
    startPublishTransition(async () => {
      try {
        const result = await toggleRoutePublishAction(route.route_id);
        if (!result.success) {
          setPublishError(result.error ?? "ยังเปลี่ยนสถานะเผยแพร่ไม่ได้ กรุณาลองอีกครั้ง");
          return;
        }
        setPublishSuccess(true);
        router.refresh();
      } catch {
        setPublishError("เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง");
      }
    });
  };

  const handleStopsChange = (normalized: Array<{
    attractionId: number;
    dayNumber: number;
    displayOrder: number;
    stopNoteTh: string;
    stopNoteEn: string;
  }>) => {
    setHasUnsavedStops(true);
    setWorkingStops(normalized.map((stop, index) => ({
      stop_id: -(index + 1),
      route_id: route.route_id,
      attraction_id: stop.attractionId,
      day_number: stop.dayNumber,
      display_order: stop.displayOrder,
      stop_note_th: stop.stopNoteTh,
      stop_note_en: stop.stopNoteEn,
      attraction_name_th: attractionById.get(stop.attractionId)?.name_th
        ?? routeStops.find((item) => item.attraction_id === stop.attractionId)?.attraction_name_th
        ?? null,
    })));
  };

  const handleStopsSaved = useCallback(() => setHasUnsavedStops(false), []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin/routes" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200" aria-label="กลับไปรายการเส้นทาง">
              <ArrowLeft size={19} weight="bold" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-500">ตัวแก้ไขเส้นทางแนะนำ</p>
              <h1 className="break-words text-base font-black text-slate-900 sm:text-lg">{name}</h1>
            </div>
          </div>
          <span className={`rounded-md px-3 py-2 text-xs font-black ${route.is_published ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
            {route.is_published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
          </span>
        </div>
        <nav aria-label="ส่วนต่าง ๆ ของตัวแก้ไขเส้นทาง" className="mx-auto mt-3 grid max-w-6xl grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="flex min-h-10 items-center justify-center rounded-md px-1 text-center text-xs font-bold text-slate-700 transition hover:bg-white hover:text-[#073F37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6B62] sm:text-sm">
              {section.label}
            </a>
          ))}
        </nav>
      </header>

      {showDuplicateToast && duplicateMap.size > 0 ? (
        <div role="status" className="mx-auto mt-4 flex max-w-6xl items-start justify-between gap-3 px-3 sm:px-6">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">
            พบจุดแวะซ้ำ {duplicateMap.size} แห่ง ({Array.from(duplicateMap.values()).map((item) => item.name).join(", ")}) — แก้ไขในส่วนจุดแวะ
          </p>
          <button type="button" onClick={() => setToastDismissed(true)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-white text-amber-800" aria-label="ปิดการแจ้งเตือน" title="ปิดการแจ้งเตือน">
            <span aria-hidden="true">×</span>
          </button>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl space-y-6 px-3 py-6 sm:px-6 sm:py-8">
        <section id="basics" aria-labelledby="basics-heading" className="scroll-mt-36 space-y-3">
          <div>
            <h2 id="basics-heading" className="text-lg font-black text-slate-900">ข้อมูลหลัก</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">ชื่อ เส้นทาง URL และคำอธิบายที่บันทึกในระบบ</p>
          </div>
          <AdminFormSection title="ข้อมูลหลักของเส้นทาง">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-bold text-slate-900">{route.name_th || "ยังไม่มีชื่อภาษาไทย"}</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-500">{route.slug ? `/routes/${route.slug}` : "ยังไม่มี URL"}</p>
              </div>
              <button type="button" onClick={() => setIsBasicsEditorOpen((open) => !open)} aria-expanded={isBasicsEditorOpen} className="min-h-11 shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                {isBasicsEditorOpen ? "ปิดข้อมูลหลัก" : "แก้ไขข้อมูลหลัก"}
              </button>
            </div>
          </AdminFormSection>
          {isBasicsEditorOpen ? <RouteForm initialData={route} coverMediaUrl={coverMediaUrl} /> : null}
        </section>

        <section id="stops" aria-labelledby="stops-heading" className="scroll-mt-36 space-y-3">
          <div>
            <h2 id="stops-heading" className="text-lg font-black text-slate-900">จุดแวะ</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">เลือกสถานที่ที่เปิดใช้งานและเผยแพร่ จัดวันและลำดับ พร้อมเก็บคำแนะนำสองภาษา; วันว่างจะถูกยุบให้ต่อเนื่อง</p>
          </div>
          {savedStopsAvailable ? (
            <RouteStopsManager routeId={route.route_id} initialStops={stopsProp ?? []} attractions={attractions} onStopsChange={handleStopsChange} onStopsSaved={handleStopsSaved} />
          ) : route.stop_count > 0 ? (
            <AdminHelpPanel title="โหลดรายละเอียดจุดแวะไม่สำเร็จ" tone="warning">
              <p>มีจุดแวะที่บันทึกไว้ {route.stop_count} จุด แต่ยังแสดงกำหนดการไม่ได้ ลองโหลดตัวแก้ไขอีกครั้ง</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/admin/routes/${route.route_id}/stops`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-amber-950 hover:bg-amber-100"><MapPin size={16} />จัดการจุดแวะพัก</Link>
              </div>
            </AdminHelpPanel>
          ) : (
            <RouteStopsManager routeId={route.route_id} initialStops={[]} attractions={attractions} onStopsChange={handleStopsChange} onStopsSaved={handleStopsSaved} />
          )}
        </section>

        <section id="cover" aria-labelledby="cover-heading" className="scroll-mt-36 space-y-3">
          <div>
            <h2 id="cover-heading" className="text-lg font-black text-slate-900">รูปปก</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">เลือกภาพจากคลังสื่อ; สถานะนี้อ้างอิงภาพที่บันทึกและเชื่อมกับเส้นทางจริง</p>
          </div>
          <AdminFormSection title="รูปภาพปกเส้นทาง">
            <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.65fr)] sm:items-center">
              <div className="aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {coverMediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverMediaUrl} alt={`ภาพปก ${name}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm font-bold text-slate-500">
                    <ImageIcon size={25} weight="duotone" />ยังไม่มีภาพปกที่บันทึกไว้
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">{coverMediaUrl ? "มีภาพปกเชื่อมโยงกับเส้นทางแล้ว" : "ยังไม่มีภาพปกเชื่อมโยงกับเส้นทาง"}</p>
                <button type="button" onClick={() => setIsCoverEditorOpen(true)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#073F37] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0A6B62] sm:w-auto">
                  <ImageIcon size={17} weight="bold" />{coverMediaUrl ? "เปลี่ยนภาพปก" : "เลือกรูปภาพปก"}
                </button>
              </div>
            </div>
          </AdminFormSection>
        </section>

        <section id="review" aria-labelledby="review-heading" className="scroll-mt-36 space-y-3">
          <div>
            <h2 id="review-heading" className="text-lg font-black text-slate-900">ตรวจสอบ</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">ตรวจชื่อ ภาพ จุดแวะ และความพร้อมของแผนที่ก่อนเผยแพร่เส้นทาง</p>
          </div>
          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)]">
            <AdminFormSection title="ตัวอย่างเส้นทาง">
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500">เส้นทางแนะนำ</p>
                    <h3 className="mt-1 break-words text-xl font-black text-slate-900">{name}</h3>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">{route.description_th || "ยังไม่มีคำอธิบายภาษาไทย"}</p>
                  </div>
                  <div className="shrink-0 rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{itineraryDays.length || 0} วัน · {stopCount} จุด</div>
                </div>
                {stopCount > 0 ? (
                  <div className="space-y-4 border-t border-slate-200 pt-4">
                    {itineraryDays.map((day) => (
                      <div key={day}>
                        <h4 className="text-sm font-black text-[#073F37]">วันที่ {day}</h4>
                        <ol className="mt-2 space-y-2">
                          {routeStops.filter((stop) => stop.day_number === day).sort((a, b) => a.display_order - b.display_order).map((stop) => (
                            <li key={stop.stop_id} className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3">
                              <p className="break-words text-sm font-bold text-slate-800"><span>{attractionById.get(stop.attraction_id)?.name_th ?? stop.attraction_name_th ?? `สถานที่ #${stop.attraction_id}`}</span></p>
                              {stop.stop_note_th ? <p className="mt-1 break-words text-sm leading-6 text-slate-600">{stop.stop_note_th}</p> : null}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                ) : <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">ยังไม่มีจุดแวะที่บันทึกไว้</p>}
                {stopCount > 0 ? <div className="border-t border-slate-200 pt-4"><RouteStopsMap stops={previewStops} /></div> : null}
                {publicHref && route.is_published && route.is_active ? (
                  <Link href={publicHref} target="_blank" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-[#0A6B62] hover:text-[#0A6B62]"><ArrowSquareOut size={16} />ดูหน้าเส้นทางสาธารณะ</Link>
                ) : <p className="text-xs leading-5 text-slate-500">หน้าเส้นทางสาธารณะจะแสดงเมื่อเส้นทางเปิดใช้งานและเผยแพร่แล้ว</p>}
              </div>
            </AdminFormSection>

            <div className="space-y-4">
              <AdminReadinessPanel title="ตรวจข้อมูลเส้นทาง" items={readiness} />
              {routeStops.length > 0 ? (
                <AdminHelpPanel title={`ความพร้อมแผนที่ · ${distinctStopCount - missingCoordinates.length}/${distinctStopCount} จุดมีพิกัด`} tone={missingCoordinates.length > 0 ? "warning" : "info"}>
                  {missingCoordinates.length > 0 ? (
                    <>
                      <p>แผนที่และปุ่มนำทางตลอดเส้นทางจะแสดงเมื่อทุกจุดมีพิกัดที่ตรวจสอบแล้ว พิกัดของตัวสถานที่อาจไม่ใช่ทางเข้าหรือจุดจอดรถ โดยเฉพาะถ้ำ</p>
                      <ul className="mt-3 space-y-2">
                        {missingCoordinates.map((attraction) => (
                          <li key={attraction.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200 pt-2">
                            <span className="min-w-0 break-words font-semibold">{attraction.name}</span>
                            <Link href={`/admin/attractions/${attraction.id}/edit#location`} className="inline-flex min-h-10 items-center gap-1 text-sm font-bold underline underline-offset-4">ตรวจพิกัด <ArrowSquareOut size={15} aria-hidden="true" /></Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : <p>มีพิกัดทุกจุดแล้ว ตรวจตำแหน่งทางเข้า จุดนัดพบ และข้อจำกัดการเข้าถึงกับผู้ดูแลพื้นที่ก่อนเผยแพร่</p>}
                </AdminHelpPanel>
              ) : null}
              {duplicateMap.size > 0 ? (
                <AdminHelpPanel title={`พบจุดแวะซ้ำ ${duplicateMap.size} แห่ง`} tone="warning">
                  <p>ไปที่จัดการจุดแวะพักเพื่อลบรายการซ้ำ</p>
                  <ul className="mt-2 list-disc pl-5">{Array.from(duplicateMap.values()).map((duplicate, index) => <li key={`${duplicate.name}-${index}`} className="break-words">{duplicate.name}</li>)}</ul>
                </AdminHelpPanel>
              ) : null}
              <AdminHelpPanel title="สถานะการเผยแพร่" tone="info">
                <p>สถานะปัจจุบัน: {route.is_published ? "เผยแพร่แล้ว" : "ฉบับร่าง"} · {route.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</p>
                <p className="mt-2">รายการตรวจนี้เป็นข้อมูลประกอบ เซิร์ฟเวอร์จะตรวจสถานที่และลำดับอีกครั้งก่อนเผยแพร่</p>
                {hasUnsavedStops ? <p role="status" className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">บันทึกจุดแวะที่แก้ไขก่อนเผยแพร่เส้นทาง</p> : null}
                {publishError ? <p role="alert" className="mt-3 rounded-md border border-rose-300 bg-rose-50 p-3 text-sm font-bold text-rose-800">{publishError}</p> : null}
                {publishSuccess ? <p role="status" className="mt-3 text-sm font-bold text-emerald-800">เปลี่ยนสถานะเผยแพร่แล้ว</p> : null}
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || hasUnsavedStops}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#073F37] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0A6B62] disabled:opacity-50"
                >
                  {isPublishing ? "กำลังบันทึก..." : route.is_published ? "ยกเลิกเผยแพร่" : "เผยแพร่เส้นทาง"}
                </button>
              </AdminHelpPanel>
            </div>
          </div>
        </section>
      </main>

      <Drawer isOpen={isCoverEditorOpen} onClose={() => setIsCoverEditorOpen(false)} title="รูปภาพปกเส้นทาง" bodyClassName="p-0">
        <CoverForm
          route={route}
          onClose={() => setIsCoverEditorOpen(false)}
          coverMediaId={coverMediaId}
          coverMediaUrl={coverMediaUrl}
          onCoverChange={(mediaId, mediaUrl) => {
            setCoverMediaId(mediaId);
            setCoverMediaUrl(mediaUrl);
          }}
        />
      </Drawer>
    </div>
  );
}
