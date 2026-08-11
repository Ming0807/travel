import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicRouteLoading } from "@/components/routes/PublicRouteLoading";

export default function RouteDetailLoading() {
  return (
    <PublicPageFrame variant="detail" className="py-10">
      <PublicRouteLoading detail />
    </PublicPageFrame>
  );
}
