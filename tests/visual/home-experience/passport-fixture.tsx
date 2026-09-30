import { PassportCollection } from "@/components/passport/PassportCollection";
import { PassportLoading, PassportPageShell } from "@/components/passport/PassportPageShell";
import { PassportState } from "@/components/passport/PassportState";
import { PublicRouteDetail } from "@/components/routes/PublicRouteDetail";
import { RouteDiscovery } from "@/components/routes/RouteDiscovery";
import { PublicDirectoryHero } from "@/components/public/PublicDirectoryHero";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicRouteLoading } from "@/components/routes/PublicRouteLoading";
import type { PassportViewModel } from "@/lib/services/passport.service";
import { data, routeMapData } from "./data";

export function PassportFixture({ params }: { params: URLSearchParams }) {
  const targets = ["ตราป่าและสายหมอก", "ตราเมืองเก่ายะลา", "ตราชุมชนและวัฒนธรรมชื่อยาวสำหรับทดสอบการตัดบรรทัด", "ตราธรรมชาติ"].map((stampName, index) => ({ stampName, attractionName: `สถานที่ตัวอย่าง ${index + 1}`, attractionSlug: `fixture-place-${index + 1}`, provinceName: "ยะลา", stampImagePath: null, isEarned: index % 2 === 0, earnedAt: index % 2 === 0 ? "2026-09-01T10:00:00Z" : null }));
  const passport: PassportViewModel = {
    displayName: "นักเดินทางชื่อยาวเพื่อทดสอบพาสปอร์ตบนมือถือและแท็บเล็ต",
    isGuest: !params.has("linked"), totalStampsEarned: 2, totalStampTargets: params.has("no-targets") ? 0 : 4,
    provinceProgress: [{ provinceName: "ยะลา", earnedCount: params.has("no-targets") ? 0 : 2, totalCount: params.has("no-targets") ? 0 : 4 }],
    stampTargetsByProvince: [{ provinceName: "ยะลา", targets: params.has("no-targets") ? targets.filter((target) => target.isEarned) : targets }],
    stampsByProvince: [], recentVisits: targets.filter((target) => target.isEarned).map((target) => ({ ...target, visitedAt: "2026-09-01T10:00:00Z" })),
  };
  return <PassportPageShell>{params.has("loading") ? <PassportLoading /> : params.has("error") ? <PassportState error /> : params.has("no-identity") ? <PassportState /> : <PassportCollection passport={passport} />}</PassportPageShell>;
}

export function RouteFixture({ params }: { params: URLSearchParams }) {
  if (params.has("detail")) {
    const stops = routeMapData("fixture-route-1").stops.map((stop, index) => ({ ...stop, dayNumber: index === 2 ? 2 : 1, latitude: index === 1 ? null : stop.latitude, longitude: index === 1 ? null : stop.longitude }));
    return <PublicRouteDetail route={{ ...data.routes[0], days: 2, fullDescription: "เรื่องราวของเส้นทางจากข้อมูลสังเคราะห์สำหรับทดสอบหน้าจอ\nเลือกจุดแวะที่เหมาะกับเวลาเดินทางของคุณ", mapUrl: null, mapSegments: [], stops }} />;
  }
  return <><PublicDirectoryHero id="routes-hero-heading" title="เส้นทางท่องเที่ยวแนะนำในยะลา" description="เลือกเส้นทางแล้วดูแผนที่และจุดแวะก่อนออกเดินทาง" breadcrumb="เส้นทางแนะนำ" eyebrow="PLAN YOUR TRIP" imageUrl="/site-media/homepage/yala-belonging-default.webp" imageAlt="ภาพตัวอย่าง" /><PublicPageFrame variant="directory">{params.has("loading") ? <PublicRouteLoading /> : <RouteDiscovery routes={params.has("empty") ? [] : [...data.routes, { ...data.routes[0], slug: "fixture-route-4", name: "ทริปหลายวัน", days: 4 }]} />}</PublicPageFrame></>;
}
