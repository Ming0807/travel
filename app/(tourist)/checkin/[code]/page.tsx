import { CheckinLandingPlaceholder } from "@/components/tourist/checkin-landing-placeholder";

type CheckinPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function CheckinPage({ params }: CheckinPageProps) {
  const { code } = await params;

  return <CheckinLandingPlaceholder code={code} routeVariant="checkin" />;
}
