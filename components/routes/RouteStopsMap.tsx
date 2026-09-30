"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, MapTrifold } from "@phosphor-icons/react";
import type { LatLngBounds, Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import {
  buildRouteConnectorSegments,
  buildRouteDirectionsFromCurrentUrl,
  hasValidRouteCoordinate,
  orderPublicRouteStops,
  type PublicRouteStop,
} from "@/lib/routes/public-route";
import styles from "./RouteStopsMap.module.css";

type MapStatus = "idle" | "loading" | "ready" | "error";
type MapPresentation = "compact" | "explore";

function mapBoundsPadding(isExplorer: boolean) {
  if (!isExplorer) return { padding: [48, 48] as [number, number] };
  const sidePadding = window.innerWidth < 640 ? 36 : 48;
  return { paddingTopLeft: [sidePadding, 88] as [number, number], paddingBottomRight: [sidePadding, 60] as [number, number] };
}

export function RouteStopsMap({
  stops,
  presentation = "compact",
  directionsUrl,
}: {
  stops: PublicRouteStop[];
  presentation?: MapPresentation;
  directionsUrl?: string | null;
}) {
  const isExplorer = presentation === "explore";
  const [open, setOpen] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(() => isExplorer && typeof IntersectionObserver === "undefined");
  const [status, setStatus] = useState<MapStatus>("idle");
  const [tileWarning, setTileWarning] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusRequest, setFocusRequest] = useState<{ index: number } | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const boundsRef = useRef<LatLngBounds | null>(null);
  const markersRef = useRef<Array<{ marker: Marker; indexes: number[] }>>([]);
  const orderedStops = useMemo(() => orderPublicRouteStops(stops), [stops]);
  const mappedStops = useMemo(() => orderedStops
    .map((stop, index) => ({ stop, index }))
    .filter(({ stop }) => hasValidRouteCoordinate(stop)), [orderedStops]);
  const selectedStop = orderedStops[activeIndex] ?? orderedStops[0];
  const selectedNavigationUrl = selectedStop ? buildRouteDirectionsFromCurrentUrl([selectedStop]) : null;
  const showMap = isExplorer || open;
  const selectStop = useCallback((index: number) => {
    setActiveIndex(index);
    setFocusRequest({ index });
  }, []);

  useEffect(() => {
    if (!isExplorer || mappedStops.length === 0 || !nodeRef.current) return;
    const node = nodeRef.current;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [isExplorer, mappedStops.length]);

  useEffect(() => {
    if (!showMap || !shouldLoad || mappedStops.length === 0) return;

    let disposed = false;
    void import("leaflet").then((leaflet) => {
      if (disposed || !nodeRef.current) return;

      const map = leaflet.map(nodeRef.current, {
        scrollWheelZoom: false,
        zoomControl: false,
      });
      mapRef.current = map;
      leaflet.control.zoom({ position: "bottomright", zoomInTitle: "ซูมเข้า", zoomOutTitle: "ซูมออก" }).addTo(map);

      let tileErrors = 0;
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).on("tileerror", () => {
        tileErrors += 1;
        if (tileErrors >= 3 && !disposed) setTileWarning(true);
      }).addTo(map);

      const bounds = leaflet.latLngBounds([]);
      boundsRef.current = bounds;
      const groups = new Map<string, typeof mappedStops>();
      mappedStops.forEach((item) => {
        const key = `${item.stop.latitude},${item.stop.longitude}`;
        groups.set(key, [...(groups.get(key) ?? []), item]);
      });

      // Straight dotted links communicate editorial order, never a road or walking route.
      for (const segment of buildRouteConnectorSegments(orderedStops)) {
        leaflet.polyline(segment, {
          className: styles.routeConnector,
          color: "#a64831",
          weight: 4,
          opacity: 0.86,
          dashArray: "6 10",
          lineCap: "round",
          interactive: false,
        }).addTo(map);
      }

      const markers: Array<{ marker: Marker; indexes: number[] }> = [];
      groups.forEach((items) => {
        const stop = items[0].stop;
        const point = leaflet.latLng(stop.latitude!, stop.longitude!);
        bounds.extend(point);
        const indexes = items.map((item) => item.index);
        const numbers = indexes.map((index) => index + 1).join(",");
        const width = Math.max(38, numbers.length * 8 + 18);
        const popup = document.createElement("div");
        items.forEach((item) => {
          const jump = document.createElement("a");
          jump.href = `#route-stop-${item.index + 1}`;
          jump.textContent = `${item.index + 1}. ${item.stop.attractionName}`;
          jump.className = styles.popupLink;
          popup.appendChild(jump);
          if (item.stop.attractionSlug) {
            const link = document.createElement("a");
            link.href = `/attractions/${encodeURIComponent(item.stop.attractionSlug)}`;
            link.textContent = "ดูข้อมูลสถานที่";
            link.className = styles.popupLink;
            popup.appendChild(link);
          }
        });
        const marker = leaflet.marker(point, {
          icon: leaflet.divIcon({
            className: `${styles.marker} ${indexes.includes(0) && isExplorer ? styles.markerActive : ""}`.trim(),
            html: `<span>${numbers}</span>`,
            iconSize: [width, 38],
            iconAnchor: [width / 2, 19],
          }),
          title: items.map((item) => `${item.index + 1}. ${item.stop.attractionName}`).join("; "),
        }).addTo(map).bindPopup(popup);
        marker.on("click", () => selectStop(indexes[0]));
        markers.push({ marker, indexes });
      });
      markersRef.current = markers;

      if (groups.size === 1) map.setView(bounds.getCenter(), 16);
      else map.fitBounds(bounds, { ...mapBoundsPadding(isExplorer), maxZoom: 17, animate: false });
      // Leaflet creates marker elements only after the map has an initial view.
      markers.forEach(({ marker, indexes }) => {
        const markerElement = marker.getElement();
        markerElement?.setAttribute("aria-label", indexes.map((index) => `จุดที่ ${index + 1} ${orderedStops[index].attractionName}`).join("; "));
        markerElement?.addEventListener("keydown", (event) => {
          if (event.key !== " " && event.key !== "Enter") return;
          event.preventDefault();
          event.stopPropagation();
          if (!event.repeat) marker.fire("click");
        });
      });
      requestAnimationFrame(() => { if (!disposed) map.invalidateSize(); });
      setStatus("ready");
    }).catch(() => {
      if (!disposed) setStatus("error");
    });

    return () => {
      disposed = true;
      markersRef.current = [];
      boundsRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mappedStops, orderedStops, shouldLoad, showMap, isExplorer, selectStop]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    markersRef.current.forEach(({ marker, indexes }) => {
      const element = marker.getElement();
      const selected = indexes.includes(activeIndex);
      element?.classList.toggle(styles.markerActive, isExplorer && selected);
      if (isExplorer) element?.setAttribute("aria-pressed", String(selected));
    });
    if (!isExplorer || !focusRequest) return;
    const stop = orderedStops[focusRequest.index];
    if (!stop || !hasValidRouteCoordinate(stop)) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const zoom = Math.max(mapRef.current.getZoom(), 16);
    if (reducedMotion) mapRef.current.setView([stop.latitude!, stop.longitude!], zoom, { animate: false });
    else mapRef.current.flyTo([stop.latitude!, stop.longitude!], zoom, { duration: 0.55 });
  }, [activeIndex, focusRequest, isExplorer, orderedStops, status]);

  if (mappedStops.length === 0) {
    return (
      <section aria-labelledby="route-map-heading" className={styles.section}>
        <p className={styles.eyebrow}>LOCATION GUIDE</p>
        <h2 id="route-map-heading" className={styles.heading}>สำรวจเส้นทางบนแผนที่</h2>
        <div className={styles.emptyState}>
          <MapTrifold size={26} aria-hidden="true" />
          <p className={styles.emptyTitle}>ยังแสดงแผนที่ไม่ได้</p>
          <p>จุดแวะในเส้นทางนี้ยังไม่มีพิกัดที่บันทึกไว้ ดูข้อมูลแต่ละสถานที่และยืนยันทางเข้ากับผู้ดูแลพื้นที่ก่อนเดินทาง</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="route-map-heading" className={`${styles.section} ${isExplorer ? styles.explorerSection : ""}`}>
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>LOCATION GUIDE</p>
          <h2 id="route-map-heading" className={styles.heading}>{isExplorer ? "สำรวจเส้นทางบนแผนที่" : "ตำแหน่งจุดแวะ"}</h2>
        </div>
        {!isExplorer ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls="route-stops-map"
            onClick={() => {
              setOpen((value) => !value);
              if (!open) {
                setShouldLoad(true);
                setStatus("loading");
                setTileWarning(false);
              }
            }}
            className={styles.toggle}
          >
            <MapTrifold size={18} aria-hidden="true" />
            {open ? "ซ่อนแผนที่" : "ดูแผนที่"}
          </button>
        ) : null}
      </div>

      <p className={styles.description}>
        เส้นประเชื่อมลำดับจุดแวะที่แนะนำ ไม่ใช่ถนนหรือทางเดินจริง ตรวจทางเข้ากับผู้ดูแลพื้นที่ก่อนเดินทาง
        {mappedStops.length < stops.length ? ` มี ${stops.length - mappedStops.length} จุดที่ยังไม่มีพิกัด` : ""}
      </p>

      <div className={isExplorer ? styles.explorer : undefined}>
        {showMap ? (
          <div id="route-stops-map" className={styles.mapFrame}>
            {status !== "ready" && status !== "error" ? <p className={styles.status}>กำลังโหลดแผนที่...</p> : null}
            {status === "error" ? <p className={styles.status}>ยังโหลดแผนที่ไม่ได้ กรุณาดูพิกัดจากลิงก์ของแต่ละจุดแวะ</p> : null}
            <div ref={nodeRef} className={`${styles.map} ${isExplorer ? styles.explorerMap : ""}`} aria-label="แผนที่ตำแหน่งจุดแวะ" />
            {isExplorer && status === "ready" ? (
              <button
                type="button"
                onClick={() => {
                  if (!boundsRef.current || !mapRef.current) return;
                  setFocusRequest(null);
                  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
                  mapRef.current.fitBounds(boundsRef.current, { ...mapBoundsPadding(isExplorer), maxZoom: 17, animate: !reducedMotion, duration: 0.5 });
                }}
                className={styles.resetView}
              >
                <MapTrifold size={18} aria-hidden="true" /> ดูทุกจุด
              </button>
            ) : null}
            {tileWarning ? <p role="status" className={styles.warning}>ภาพแผนที่บางส่วนโหลดไม่สำเร็จ ตรวจจุดแวะจากรายการสถานที่ได้</p> : null}
          </div>
        ) : <div id="route-stops-map" hidden />}

        {isExplorer && selectedStop ? (
          <div className={styles.explorerPanel}>
            <p className={styles.panelLabel}>ลำดับจุดแวะ · {orderedStops.length.toLocaleString("th-TH")} จุด</p>
            <ol className={styles.stopList}>
              {orderedStops.map((stop, index) => (
                <li key={`${stop.dayNumber}-${stop.sequence}-${stop.attractionId}`}>
                  <button
                    type="button"
                    aria-pressed={index === activeIndex}
                    onClick={() => selectStop(index)}
                    className={`${styles.stopButton} ${index === activeIndex ? styles.stopButtonActive : ""}`}
                  >
                    <span className={styles.stopNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.stopName}>{stop.attractionName}</span>
                    {!hasValidRouteCoordinate(stop) ? <span className={styles.missingPin}>ไม่มีพิกัด</span> : null}
                  </button>
                </li>
              ))}
            </ol>

            <div className={styles.selectedStop} aria-live="polite">
              <div className={styles.selectedMedia}>
                <PublicMediaFrame
                  src={selectedStop.attractionImage}
                  alt={selectedStop.attractionImageAlt}
                  aspect="square"
                  sizes="96px"
                  fallbackLabel="ยังไม่มีรูปสถานที่"
                />
              </div>
              <div className={styles.selectedCopy}>
                <p className={styles.selectedEyebrow}>จุดที่ {(activeIndex + 1).toLocaleString("th-TH")}</p>
                <p className={styles.selectedTitle}>{selectedStop.attractionName}</p>
                {selectedStop.stopNote ? <p className={styles.selectedNote}>{selectedStop.stopNote}</p> : null}
              </div>
            </div>

            <div className={styles.actionRow}>
              {selectedStop.attractionSlug ? <Link href={`/attractions/${selectedStop.attractionSlug}`} className={styles.secondaryAction}>ดูสถานที่</Link> : null}
              {selectedNavigationUrl ? (
                <a href={selectedNavigationUrl} target="_blank" rel="noopener noreferrer" className={styles.secondaryAction}>
                  นำทางไปจุดนี้ <ArrowSquareOut size={15} aria-hidden="true" />
                </a>
              ) : null}
            </div>
            {directionsUrl ? (
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryAction}>
                เปิดนำทางทั้งเส้นทาง <ArrowSquareOut size={17} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
