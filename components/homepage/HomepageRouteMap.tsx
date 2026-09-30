"use client";

import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { PublicRouteStop } from "@/lib/routes/public-route";

const createRouteMap = () => lazy(() => import("@/components/routes/RouteStopsMap").then((module) => ({ default: module.RouteStopsMap })));
type MapData = { stops: PublicRouteStop[]; directionsUrl: string | null };
type MapState = { status: "idle" | "loading" | "error"; message?: string } | { status: "ready"; data: MapData };

export function HomepageRouteMap({ routes }: { routes: { slug: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(routes[0]?.slug ?? "");
  const [state, setState] = useState<MapState>({ status: "idle" });
  const [RouteMap, setRouteMap] = useState(createRouteMap);
  const [mapAttempt, setMapAttempt] = useState(0);
  const cache = useRef(new Map<string, MapData>());
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function load(slug: string) {
    request.current?.abort();
    const saved = cache.current.get(slug);
    if (saved) { setState({ status: "ready", data: saved }); return; }
    const controller = new AbortController();
    request.current = controller;
    setState({ status: "loading" });
    try {
      const response = await fetch(`/api/public/routes/${encodeURIComponent(slug)}/map`, { signal: controller.signal });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("unavailable");
      if (controller.signal.aborted) return;
      cache.current.set(slug, result.data);
      setState({ status: "ready", data: result.data });
    } catch {
      if (!controller.signal.aborted) setState({ status: "error", message: "ยังโหลดแผนที่ไม่ได้ ลองอีกครั้ง หรือเปิดรายละเอียดเส้นทางได้ครับ" });
    }
  }
  if (!routes.length) return null;
  return <div className="ed-route-explorer">
    <button type="button" className="ed-route-map-toggle" aria-expanded={open} aria-controls="home-route-map" onClick={() => {
      if (open) { request.current?.abort(); setOpen(false); }
      else { setOpen(true); void load(selected); }
    }}><span aria-hidden="true">⌖</span>{open ? "ปิดแผนที่เส้นทาง" : "ดูเส้นทางบนแผนที่"}<span aria-hidden="true">{open ? "−" : "+"}</span></button>
    {open ? <div id="home-route-map" className="ed-route-map-panel">
      <div className="ed-route-map-toolbar"><label htmlFor="home-route-select">เลือกเส้นทาง</label><select id="home-route-select" value={selected} onChange={(event) => { setSelected(event.target.value); void load(event.target.value); }}>{routes.map((route) => <option key={route.slug} value={route.slug}>{route.name}</option>)}</select><Link href={`/routes/${selected}`}>รายละเอียดเส้นทาง ↗</Link></div>
      {state.status === "loading" ? <MapLoading /> : null}
      {state.status === "error" ? <div className="ed-route-map-error" role="alert"><p>{state.message}</p><button type="button" onClick={() => void load(selected)}>ลองอีกครั้ง</button></div> : null}
      {state.status === "ready" ? <MapBoundary key={`${selected}-${mapAttempt}`} href={`/routes/${selected}`} onRetry={() => { setRouteMap(createRouteMap()); setMapAttempt((attempt) => attempt + 1); }}><Suspense fallback={<MapLoading />}><RouteMap key={selected} stops={state.data.stops} directionsUrl={state.data.directionsUrl} presentation="explore" /></Suspense></MapBoundary> : null}
    </div> : null}
  </div>;
}
function MapLoading() { return <div className="ed-route-map-loading" role="status"><span className="ed-loading-bar" aria-hidden="true" />กำลังเตรียมแผนที่เส้นทาง…</div>; }

class MapBoundary extends Component<{ children: ReactNode; onRetry: () => void; href: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="ed-route-map-error" role="alert"><p>ยังเปิดแผนที่ไม่ได้ ลองโหลดอีกครั้งได้ครับ</p><button type="button" onClick={this.props.onRetry}>โหลดแผนที่อีกครั้ง</button><button type="button" onClick={() => window.location.reload()}>โหลดหน้าใหม่</button><Link href={this.props.href}>ดูรายละเอียดเส้นทาง</Link></div> : this.props.children;
  }
}
