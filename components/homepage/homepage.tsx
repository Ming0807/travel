import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  Download,
  LockKeyhole,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Stamp
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TARGET_PROVINCES } from "@/constants/product";
import { dashboardPreviewMetrics, homepageAttractions, suggestedRoutes } from "./homepage-data";

const howItWorksSteps: Array<{
  title: string;
  body: string;
  Icon: LucideIcon;
}> = [
  {
    title: "Scan QR",
    body: "Open a location-specific landing page first.",
    Icon: QrCode
  },
  {
    title: "Create memory",
    body: "Enter display name, origin, age group, consent, and photo.",
    Icon: Camera
  },
  {
    title: "Get reward",
    body: "Download certificate and earn one attraction stamp.",
    Icon: CheckCircle2
  },
  {
    title: "Optional survey",
    body: "Share travel behavior, expense range, and satisfaction later.",
    Icon: BarChart3
  }
];

const trustCards: Array<{
  title: string;
  body: string;
  Icon: LucideIcon;
}> = [
  {
    title: "Anonymous guest ID",
    body: "Browser/device continuity, not IP identity.",
    Icon: LockKeyhole
  },
  {
    title: "Aggregated dashboard",
    body: "Planning metrics exclude private identifiers.",
    Icon: BarChart3
  },
  {
    title: "Optional sharing",
    body: "Download first; sharing is user-initiated.",
    Icon: Download
  },
  {
    title: "Consent first",
    body: "Required consent before storing tourist/visit data.",
    Icon: ShieldCheck
  }
];

export function Homepage() {
  return (
    <>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#073F37] text-white">
        <Image
          alt="Southern Thailand mountain and forest travel landscape"
          className="object-cover opacity-60"
          fill
          priority
          sizes="100vw"
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#073F37]/72" />
        <div className="tourism-container relative grid min-h-[calc(100vh-4rem)] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="min-w-0 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/14 px-4 py-2 text-sm font-bold backdrop-blur">
              <Sparkles aria-hidden="true" size={16} className="text-[#D6A13D]" />
              Reward-first smart tourism platform
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl">
              <span className="block">Southern Border</span>
              <span className="block">Travel Passport</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
              Discover Yala, Pattani, Narathiwat, and nearby southern border routes. Scan QR codes at
              real attractions to create a digital certificate, collect stamps, and optionally help improve
              tourism planning.
            </p>

            <div className="mt-8 max-w-2xl rounded-[1.5rem] border border-white/20 bg-white/92 p-3 text-[#17231F] shadow-card">
              <div className="flex items-center gap-3 rounded-2xl bg-[#EEF6F2] px-4 py-3">
                <Search aria-hidden="true" size={20} className="text-[#0F766E]" />
                <input
                  aria-label="Search attractions, routes, or travel stories"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-500"
                  placeholder="Search attractions, routes, stories, or provinces"
                  type="search"
                />
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {TARGET_PROVINCES.map((province) => (
                  <button
                    className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-black text-[#073F37] shadow-sm transition hover:bg-[#D6A13D] hover:text-white"
                    key={province.key}
                    type="button"
                  >
                    {province.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D6A13D] px-6 py-3 text-sm font-black text-[#073F37] shadow-card transition hover:bg-white"
                href="/attractions"
              >
                Explore places
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/12 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/22"
                href="/checkin/demo-code"
              >
                Preview QR landing
                <QrCode aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>

          <div className="grid min-w-0 gap-4">
            <div className="rounded-[2rem] bg-white p-5 text-[#17231F] shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D36B4B]">
                    Scan QR to get your
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-[#073F37]">Digital Certificate</h2>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF7E5] text-[#D6A13D]">
                  <Download aria-hidden="true" />
                </div>
              </div>
              <div className="mt-5 overflow-hidden rounded-[1.5rem]">
                <Image
                  alt="Example travel certificate memory card landscape"
                  className="h-52 w-full object-cover"
                  height={416}
                  src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85"
                  unoptimized
                  width={800}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Certificate download is not blocked by survey, Google, LINE, email, or phone number.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
                <Stamp aria-hidden="true" className="text-[#D36B4B]" />
                <h3 className="mt-3 text-xl font-black text-[#073F37]">My Passport</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Guest passport works on this browser. Google or LINE linking can be offered later.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
                <ShieldCheck aria-hidden="true" className="text-[#0F766E]" />
                <h3 className="mt-3 text-xl font-black text-[#073F37]">Privacy First</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Display name, origin, age group, consent, and photo only before certificate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tourism-container py-16" id="discover">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D36B4B]">Explore Feed</p>
            <h2 className="mt-2 text-4xl font-black text-[#073F37]">Discovery with data purpose</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Phase 01 uses static cards only. Later phases will load published attractions, stories, routes,
            and 360 media from Supabase.
          </p>
        </div>

        <div className="masonry-feed mt-8">
          {homepageAttractions.map((attraction) => (
            <article className="masonry-card overflow-hidden rounded-[1.5rem] bg-white shadow-card" key={attraction.slug}>
              <Image
                alt={attraction.imageAlt}
                className="h-auto w-full"
                height={720}
                src={attraction.imageUrl}
                unoptimized
                width={900}
              />
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D36B4B]">
                  {attraction.province} · {attraction.category}
                </p>
                <h3 className="mt-2 text-2xl font-black text-[#073F37]">{attraction.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{attraction.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {attraction.tags.map((tag) => (
                    <span className="rounded-full bg-[#EEF6F2] px-3 py-1 text-xs font-bold text-[#0F766E]" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16" id="how-it-works">
        <div className="tourism-container">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D36B4B]">How it works</p>
          <h2 className="mt-2 text-4xl font-black text-[#073F37]">Reward first, planning data second</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {howItWorksSteps.map(({ title, body, Icon }) => (
              <div className="rounded-[1.5rem] bg-[#EEF6F2] p-5" key={title}>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0F766E] shadow-sm">
                  <Icon aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-black text-[#073F37]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tourism-container py-16" id="routes">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D36B4B]">Suggested routes</p>
            <h2 className="mt-2 text-4xl font-black text-[#073F37]">Routes that can become planning insight</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Route content is a future layer. The Phase 01 shell shows how travel storytelling can sit beside
              QR certificate participation without becoming a login gate.
            </p>
          </div>
          <div className="grid gap-4">
            {suggestedRoutes.map((route) => (
              <div className="rounded-[1.5rem] bg-white p-5 shadow-card" key={route.name}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-xl font-black text-[#073F37]">{route.name}</h3>
                  <span className="w-fit rounded-full bg-[#FFF7E5] px-3 py-1 text-xs font-black text-[#8A5C14]">
                    {route.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{route.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#073F37] py-16 text-white" id="privacy">
        <div className="tourism-container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D6A13D]">Privacy & Trust</p>
            <h2 className="mt-2 text-4xl font-black">Guest mode works first</h2>
            <p className="mt-4 text-base leading-7 text-white/78">
              Tourists can complete the core certificate flow without Google, LINE, email, phone, legal full
              name, national ID, passport number, or full address. Optional linking comes after the reward.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {trustCards.map(({ title, body, Icon }) => (
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5" key={title}>
                <Icon aria-hidden="true" className="text-[#D6A13D]" />
                <h3 className="mt-3 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/72">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tourism-container py-16" id="dashboard">
        <div className="rounded-[2rem] bg-white p-6 shadow-card md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D36B4B]">Dashboard preview</p>
              <h2 className="mt-2 text-4xl font-black text-[#073F37]">Honest metrics for sustainable planning</h2>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-black text-[#0F766E]" href="/dashboard">
              Open dashboard shell
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {dashboardPreviewMetrics.map((metric) => (
              <div className="rounded-[1.25rem] bg-[#EEF6F2] p-4" key={metric.label}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
                <p className="mt-3 text-2xl font-black text-[#073F37]">{metric.value}</p>
                <p className="mt-2 text-sm leading-5 text-slate-600">{metric.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white bg-[#EEF6F2] py-10">
        <div className="tourism-container flex flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-[#073F37]">Southern Border Tourism Data & Intelligence Platform</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/attractions">Attractions</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
