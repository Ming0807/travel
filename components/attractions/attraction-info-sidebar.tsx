import { MapPin, Users, Translate, CurrencyDollar, Clock } from "@phosphor-icons/react/dist/ssr";

type InfoProps = {
  info: {
    region: string;
    population: string;
    language: string;
    currency: string;
    timeZone: string;
  };
};

export function AttractionInfoSidebar({ info }: InfoProps) {
  return (
    <div className="rounded-3xl bg-[#F0EBE1] p-8">
      <ul className="flex flex-col gap-6">
        <li className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm">
            <MapPin size={20} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Region</p>
            <p className="text-sm font-semibold text-ink">{info.region}</p>
          </div>
        </li>
        <li className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm">
            <Users size={20} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Population</p>
            <p className="text-sm font-semibold text-ink">{info.population}</p>
          </div>
        </li>
        <li className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm">
            <Translate size={20} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Language</p>
            <p className="text-sm font-semibold text-ink">{info.language}</p>
          </div>
        </li>
        <li className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm">
            <CurrencyDollar size={20} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Currency</p>
            <p className="text-sm font-semibold text-ink">{info.currency}</p>
          </div>
        </li>
        <li className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm">
            <Clock size={20} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Time Zone</p>
            <p className="text-sm font-semibold text-ink">{info.timeZone}</p>
          </div>
        </li>
      </ul>
    </div>
  );
}
