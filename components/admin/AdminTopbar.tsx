import Link from "next/link";
import { MagnifyingGlass, Bell, UserCircle, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { MobileAdminNav } from "./MobileAdminNav";

type AdminTopbarProps = {
  displayName?: string | null;
  email?: string | null;
};

export function AdminTopbar({ displayName, email }: AdminTopbarProps) {
  return (
    <div className="sticky top-0 z-20 bg-slate-50 px-4 py-4 md:px-6 lg:px-8 xl:px-10">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Nav Drawer & Logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <MobileAdminNav />
          <Link className="flex items-center gap-2" href="/admin">
            <span className="text-lg font-black tracking-tight text-slate-800 uppercase">Globe Trekker</span>
          </Link>
        </div>

        {/* Search Bar (Hidden on Mobile for now) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <MagnifyingGlass size={18} weight="bold" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-100 transition shadow-sm"
              placeholder="Search anything..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
               <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">⌘ /</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end flex-1 lg:flex-none gap-4">
          {/* View Site */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowSquareOut size={16} weight="bold" />
            <span className="hidden md:inline">View Site</span>
          </Link>

          {/* Notifications */}
          <button className="relative text-slate-500 hover:text-slate-800 transition">
            <Bell size={22} weight="fill" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-500 overflow-hidden shrink-0">
               <UserCircle size={36} weight="fill" />
            </div>
            <div className="hidden min-w-0 text-left md:block">
              <p className="truncate text-sm font-bold text-slate-800 leading-none">{displayName || "Admin User"}</p>
              {email ? <p className="truncate text-xs text-slate-500 mt-1">{email}</p> : <p className="truncate text-xs text-slate-500 mt-1">Super Admin</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
