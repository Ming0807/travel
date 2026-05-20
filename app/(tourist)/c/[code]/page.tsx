import { CheckinLandingPlaceholder } from "@/components/tourist/checkin-landing-placeholder";

type ShortCheckinPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function ShortCheckinPage({ params }: ShortCheckinPageProps) {
  const { code } = await params;

  return <CheckinLandingPlaceholder code={code} routeVariant="short" />;
}
