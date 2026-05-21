import type { DistributionItem } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";

type DonutChartCardProps = {
  title: string;
  definition: string;
  data: DistributionItem[];
  emptyDescription: string;
};

export function DonutChartCard(props: DonutChartCardProps) {
  return <BarChartCard {...props} />;
}
