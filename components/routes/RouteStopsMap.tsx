"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapTrifold } from "@phosphor-icons/react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import { orderPublicRouteStops, type PublicRouteStop } from "@/lib/routes/public-route";
import styles from "./RouteStopsMap.module.css";

type MapStatus = "idle" | "loading" | "ready" | "error";

function hasCoordinates(stop: PublicRouteStop) {
  return typeof stop.latitude === "number"
    && Number.isFinite(stop.latitude)
    && stop.latitude >= -90
    && stop.latitude <= 90
    && typeof stop.longitude === "number"
    && Number.isFinite(stop.longitude)
    && stop.longitude >= -180
    && stop.longitude <= 180;
}

export function RouteStopsMap({ stops }: { stops: PublicRouteStop[] }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<MapStatus>("idle");
  const [tileWarning, setTileWarning] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const mappedStops = useMemo(() => orderPublicRouteStops(stops)
    .map((stop, index) => ({ stop, index }))
    .filter(({ stop }) => hasCoordinates(stop)), [stops]);

  useEffect(() => {
    if (!open || mappedStops.length === 0) return;

    let disposed = false;
    void import("leaflet").then((leaflet) => {
      if (disposed || !nodeRef.current) return;

      const map = leaflet.map(nodeRef.current, {
        scrollWheelZoom: false,
        zoomControl: false,
      });
      mapRef.current = map;
      leaflet.control.zoom({ position: "bottomright" }).addTo(map);

      let tileErrors = 0;
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).on("tileerror", () => {
        tileErrors += 1;
        if (tileErrors >= 3 && !disposed) setTileWarning(true);
      }).addTo(map);

      const bounds = leaflet.latLngBounds([]);
      const groups = new Map<string, typeof mappedStops>();
      mappedStops.forEach((item) => {
        const key = `${item.stop.latitude},${item.stop.longitude}`;
        groups.set(key, [...(groups.get(key) ?? []), item]);
      });
      groups.forEach((items) => {
        const stop = items[0].stop;
        const point = leaflet.latLng(stop.latitude!, stop.longitude!);
        bounds.extend(point);
        const numbers = items.map((item) => item.index + 1).join(",");
        const width = Math.max(34, numbers.length * 8 + 16);
        const popup = document.createElement("div");
        items.forEach((item) => {
          const link = document.createElement("a");
          link.href = `/attractions/${encodeURIComponent(item.stop.attractionSlug)}`;
          link.textContent = `${item.index + 1}. ${item.stop.attractionName}`;
          link.className = styles.popupLink;
          popup.appendChild(link);
        });
        leaflet.marker(point, {
          icon: leaflet.divIcon({
            className: styles.marker,
            html: `<span>${numbers}</span>`,
            iconSize: [width, 34],
            iconAnchor: [width / 2, 17],
          }),
          title: items.map((item) => `${item.index + 1}. ${item.stop.attractionName}`).join("; "),
        }).addTo(map).bindPopup(popup);
      });

      if (groups.size === 1) map.setView(bounds.getCenter(), 16);
      else map.fitBounds(bounds, { padding: [38, 38], maxZoom: 17 });
      requestAnimationFrame(() => { if (!disposed) map.invalidateSize(); });
      setStatus("ready");
    }).catch(() => {
      if (!disposed) setStatus("error");
    });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mappedStops, open]);

  if (mappedStops.length === 0) return null;

  return (
    <section aria-labelledby="route-map-heading" className={styles.section}>
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>LOCATION GUIDE</p>
          <h2 id="route-map-heading" className={styles.heading}>ตำแหน่งจุดแวะ</h2>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="route-stops-map"
          onClick={() => {
            setOpen((value) => !value);
            if (!open) {
              setStatus("loading");
              setTileWarning(false);
            }
          }}
          className={styles.toggle}
        >
          <MapTrifold size={18} aria-hidden="true" />
          {open ? "ซ่อนแผนที่" : "ดูแผนที่"}
        </button>
      </div>

      <p className={styles.description}>
        หมุดแสดงตำแหน่งจากข้อมูลสถานที่จริงตามลำดับจุดแวะ ไม่ใช่เส้นทางขับรถ
        {mappedStops.length < stops.length ? ` มี ${stops.length - mappedStops.length} จุดที่ยังไม่มีพิกัด` : ""}
      </p>

      {open ? (
        <div id="route-stops-map" className={styles.mapFrame}>
          {status === "loading" ? <p className={styles.status}>กำลังโหลดแผนที่...</p> : null}
          {status === "error" ? <p className={styles.status}>ยังโหลดแผนที่ไม่ได้ กรุณาใช้ลิงก์นำทางด้านล่าง</p> : null}
          <div ref={nodeRef} className={styles.map} aria-label="แผนที่ตำแหน่งจุดแวะ" />
          {tileWarning ? <p role="status" className={styles.warning}>ภาพแผนที่บางส่วนโหลดไม่สำเร็จ ตรวจจุดแวะจากรายการด้านบนได้</p> : null}
        </div>
      ) : <div id="route-stops-map" hidden />}
    </section>
  );
}
