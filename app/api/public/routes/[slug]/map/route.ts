import { NextResponse } from "next/server";
import { getPublicRouteDetail } from "@/lib/repositories/public-content.repository";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug || slug.length > 160) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "ไม่พบเส้นทางนี้" } }, { status: 404, headers: { "Cache-Control": "no-store" } });
  try {
    const route = await getPublicRouteDetail(slug);
    if (!route) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "เส้นทางนี้ยังไม่พร้อมแสดง" } }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ success: true, data: { stops: route.stops, directionsUrl: route.mapUrl } }, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "ROUTE_MAP_UNAVAILABLE", message: "ยังโหลดแผนที่ไม่ได้ ลองอีกครั้งได้ครับ" } }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
