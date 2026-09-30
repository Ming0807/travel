import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicRouteDetail } from "@/components/routes/PublicRouteDetail";
import { getPublicRouteDetail } from "@/lib/repositories/public-content.repository";

export const revalidate = 60;

const getRoute = cache((slug: string) => getPublicRouteDetail(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRoute(slug);
  if (!route) return { title: "ไม่พบเส้นทางท่องเที่ยว" };

  return {
    title: route.name,
    description: route.description || `แผนการเดินทาง ${route.name} ในจังหวัดยะลา`,
    alternates: { canonical: `/routes/${route.slug}` },
  };
}

export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = await getRoute(slug);
  if (!route) notFound();

  return <><PublicRouteDetail route={route} /><SiteFooter /></>;
}
