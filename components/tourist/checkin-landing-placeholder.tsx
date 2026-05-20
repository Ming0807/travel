import Link from "next/link";
import { Camera, CheckCircle2, QrCode, ShieldCheck, Stamp } from "lucide-react";

type CheckinLandingPlaceholderProps = {
  code: string;
  routeVariant: "checkin" | "short";
};

export function CheckinLandingPlaceholder({ code, routeVariant }: CheckinLandingPlaceholderProps) {
  return (
    <section className="tourism-container py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D36B4B]">
            QR landing placeholder · {routeVariant === "short" ? "/c/[code]" : "/checkin/[code]"}
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#073F37] md:text-6xl">
            Create your Southern Border travel certificate
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Code <span className="font-black text-[#073F37]">{code}</span> will resolve to an attraction,
            photo spot, campaign, and language context in the QR check-in phase. This page intentionally
            shows reward context before any form.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0F766E] px-6 py-3 text-sm font-black text-white shadow-card"
              type="button"
            >
              Create my certificate
              <Camera aria-hidden="true" size={18} />
            </button>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#073F37] shadow-card"
              href="/passport"
            >
              View passport shell
              <Stamp aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-[#D36B4B]">Location context</p>
              <h2 className="mt-1 text-2xl font-black text-[#073F37]">Attraction and photo spot</h2>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF6F2] text-[#0F766E]">
              <QrCode aria-hidden="true" />
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              "QR scans are funnel events, not visits.",
              "Guest mode must work before Google or LINE linking.",
              "The short form comes after the tourist sees the reward.",
              "Certificate download is never blocked by survey or account linking."
            ].map((item) => (
              <div className="flex gap-3 rounded-2xl bg-[#EEF6F2] p-4" key={item}>
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-[#0F766E]" size={18} />
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#FFF7E5] p-4">
            <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-[#8A5C14]" size={18} />
            <p className="text-sm leading-6 text-[#735018]">
              Phase 01 does not create tourist, visit, photo, certificate, stamp, or survey records.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
