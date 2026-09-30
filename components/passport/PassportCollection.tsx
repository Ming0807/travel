import type { PassportViewModel } from "@/lib/services/passport.service";
import { PassportSummary } from "./PassportSummary";
import { ProvinceProgress } from "./ProvinceProgress";
import { StampGrid } from "./StampGrid";
import { RecentPassportVisits } from "./RecentPassportVisits";

export function PassportCollection({ passport }: { passport: PassportViewModel }) {
  return (
    <div className="passport-collection">
      <PassportSummary passport={passport} />
      <div className="passport-columns">
        <StampGrid passport={passport} />
        <aside className="passport-sidebar" aria-label="สรุปการเดินทาง">
          <ProvinceProgress progress={passport.provinceProgress} />
          <RecentPassportVisits visits={passport.recentVisits} />
        </aside>
      </div>
    </div>
  );
}
