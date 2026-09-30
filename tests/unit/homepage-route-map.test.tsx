import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomepageRouteMap } from "@/components/homepage/HomepageRouteMap";
const mapFailure = vi.hoisted(() => ({ active: false }));
vi.mock("@/components/routes/RouteStopsMap", () => ({ RouteStopsMap: () => {
  if (mapFailure.active) throw new Error("Map unavailable");
  return <div data-testid="itinerary-map">Map</div>;
} }));
const routes = [{ slug: "a", name: "เส้นทางหน้าถ้ำ" }, { slug: "b", name: "เส้นทางชุมชน" }];
describe("Home optional route map", () => {
  afterEach(() => { mapFailure.active = false; vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  it("loads data only after opening, caches it, and loads a different selected route", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { stops: [], directionsUrl: null } }) });
    vi.stubGlobal("fetch", fetch);
    render(<HomepageRouteMap routes={routes} />);
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /ดูเส้นทางบนแผนที่/ }));
    expect(screen.getByRole("status")).toHaveTextContent("กำลังเตรียมแผนที่");
    await screen.findByTestId("itinerary-map");
    fireEvent.click(screen.getByRole("button", { name: /ปิดแผนที่/ }));
    fireEvent.click(screen.getByRole("button", { name: /ดูเส้นทางบนแผนที่/ }));
    expect(fetch).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText("เลือกเส้นทาง"), { target: { value: "b" } });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch.mock.calls[1][0]).toBe("/api/public/routes/b/map");
  });
  it("offers retry and a working detail link after a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<HomepageRouteMap routes={routes} />);
    fireEvent.click(screen.getByRole("button", { name: /ดูเส้นทางบนแผนที่/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("ลองอีกครั้ง");
    expect(screen.getByRole("button", { name: "ลองอีกครั้ง" })).toBeEnabled();
    expect(screen.getByRole("link", { name: /รายละเอียดเส้นทาง/ })).toHaveAttribute("href", "/routes/a");
  });
  it("keeps map rendering failure local and allows a fresh component retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { stops: [], directionsUrl: null } }) }));
    mapFailure.active = true;
    render(<HomepageRouteMap routes={routes} />);
    fireEvent.click(screen.getByRole("button", { name: /ดูเส้นทางบนแผนที่/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("ยังเปิดแผนที่ไม่ได้");
    expect(screen.getByRole("button", { name: /ปิดแผนที่/ })).toBeEnabled();
    mapFailure.active = false;
    fireEvent.click(screen.getByRole("button", { name: "โหลดแผนที่อีกครั้ง" }));
    expect(await screen.findByTestId("itinerary-map")).toBeInTheDocument();
  });
});
