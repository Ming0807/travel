import Link from "next/link";
import { Compass } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <section className="tourism-container grid min-h-[70vh] place-items-center py-20 text-center">
      <div className="max-w-lg rounded-[2rem] bg-white p-8 shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF6F2] text-[#0F766E]">
          <Compass size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-[#073F37]">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This route may belong to a future tourism module. The Phase 01 foundation keeps placeholder routes
          visible without claiming full feature implementation.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-[#0F766E] px-5 py-3 text-sm font-bold text-white"
          href="/"
        >
          Back to discovery
        </Link>
      </div>
    </section>
  );
}
