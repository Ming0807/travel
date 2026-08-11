import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicRouteLoading } from "@/components/routes/PublicRouteLoading";

export default function Vista360Loading() {
  return (
    <PublicPageFrame variant="listing" className="py-10">
      <PublicRouteLoading />
    </PublicPageFrame>
  );
}
