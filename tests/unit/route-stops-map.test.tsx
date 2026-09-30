import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const leaflet = vi.hoisted(() => {
  const mapInstance = { fitBounds: vi.fn(), setView: vi.fn(), flyTo: vi.fn(), getZoom: vi.fn(() => 15), invalidateSize: vi.fn(), remove: vi.fn() };
  const bounds = { extend: vi.fn(), getCenter: vi.fn(() => ({ lat: 6.5, lng: 101.2 })) };
  return {
    map: vi.fn(() => mapInstance),
    control: { zoom: vi.fn(() => ({ addTo: vi.fn() })) },
    tileLayer: vi.fn(() => ({ on: vi.fn().mockReturnThis(), addTo: vi.fn() })),
    latLng: vi.fn((lat: number, lng: number) => ({ lat, lng })),
    latLngBounds: vi.fn(() => bounds),
    marker: vi.fn(() => ({ addTo: vi.fn().mockReturnThis(), bindPopup: vi.fn().mockReturnThis(), on: vi.fn().mockReturnThis(), getElement: vi.fn() })),
    polyline: vi.fn(() => ({ addTo: vi.fn().mockReturnThis() })),
    divIcon: vi.fn((options: unknown) => options),
  };
});

vi.mock("leaflet", () => leaflet);

import { RouteStopsMap } from "@/components/routes/RouteStopsMap";

const stops = [
  { attractionId: 1, dayNumber: 1, sequence: 1, attractionName: "วัดหน้าถ้ำ", attractionSlug: "wat-na-tham", attractionImage: null, attractionImageAlt: "", latitude: 6.5, longitude: 101.2 },
  { attractionId: 2, dayNumber: 1, sequence: 2, attractionName: "ถ้ำพระนอน", attractionSlug: "reclining-buddha-cave", attractionImage: null, attractionImageAlt: "", latitude: 6.51, longitude: 101.21 },
];

describe("route stop map", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not load map tiles until a visitor opens the map", async () => {
    render(<RouteStopsMap stops={stops} />);
    expect(leaflet.map).not.toHaveBeenCalled();
    expect(screen.getByText(/ไม่ใช่ถนนหรือทางเดินจริง/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "ดูแผนที่" }));
    await waitFor(() => expect(leaflet.map).toHaveBeenCalledOnce());
    expect(leaflet.marker).toHaveBeenCalledTimes(2);
    expect(leaflet.tileLayer).toHaveBeenCalledWith(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      expect.objectContaining({ attribution: expect.stringContaining("OpenStreetMap") }),
    );
  });

  it("explains why a published route with no coordinates has no map", () => {
    render(<RouteStopsMap stops={stops.map((stop) => ({ ...stop, latitude: null, longitude: null }))} />);
    expect(screen.getByText("ยังแสดงแผนที่ไม่ได้")).toBeVisible();
    expect(screen.queryByRole("button", { name: "ดูแผนที่" })).not.toBeInTheDocument();
    expect(leaflet.map).not.toHaveBeenCalled();
  });

  it("omits invalid pins and tells visitors how many coordinates are missing", async () => {
    render(<RouteStopsMap stops={[...stops, { ...stops[0], attractionId: 3, latitude: null }]} />);
    expect(screen.getByText(/มี 1 จุดที่ยังไม่มีพิกัด/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "ดูแผนที่" }));
    await waitFor(() => expect(leaflet.marker).toHaveBeenCalledTimes(2));
  });

  it("shows an embedded route explorer with ordered dotted links and selectable stops", async () => {
    render(<RouteStopsMap stops={stops} presentation="explore" directionsUrl="https://www.google.com/maps/dir/?api=1" />);
    expect(screen.queryByRole("button", { name: "ดูแผนที่" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "สำรวจเส้นทางบนแผนที่" })).toBeVisible();
    await waitFor(() => expect(leaflet.map).toHaveBeenCalledOnce());
    expect(leaflet.polyline).toHaveBeenCalledWith(
      [[6.5, 101.2], [6.51, 101.21]],
      expect.objectContaining({ dashArray: "6 10", interactive: false }),
    );
    fireEvent.click(screen.getByRole("button", { name: /02.*ถ้ำพระนอน/ }));
    await waitFor(() => expect(leaflet.map.mock.results[0].value.flyTo).toHaveBeenCalledWith([6.51, 101.21], 16, { duration: 0.55 }));
    expect(screen.getByRole("button", { name: /02.*ถ้ำพระนอน/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: /เปิดนำทางทั้งเส้นทาง/ })).toHaveAttribute("href", "https://www.google.com/maps/dir/?api=1");
  });

  it("groups stops at identical coordinates without moving their location", async () => {
    render(<RouteStopsMap stops={[stops[0], { ...stops[1], latitude: stops[0].latitude, longitude: stops[0].longitude }]} />);
    fireEvent.click(screen.getByRole("button", { name: "ดูแผนที่" }));
    await waitFor(() => expect(leaflet.marker).toHaveBeenCalledOnce());
    expect(leaflet.divIcon).toHaveBeenCalledWith(expect.objectContaining({ html: "<span>1,2</span>" }));
  });

  it("links map markers back to their numbered timeline stops", async () => {
    render(<RouteStopsMap stops={stops} />);
    fireEvent.click(screen.getByRole("button", { name: "ดูแผนที่" }));
    await waitFor(() => expect(leaflet.marker).toHaveBeenCalledTimes(2));
    const marker = leaflet.marker.mock.results[1].value;
    const popup = marker.bindPopup.mock.calls[0][0] as HTMLElement;
    expect(popup.querySelector('a[href="#route-stop-2"]')).toHaveTextContent("2. ถ้ำพระนอน");
  });
});
