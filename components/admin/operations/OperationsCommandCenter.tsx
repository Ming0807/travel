import Link from "next/link";
import {
  ArrowRight,
  Article,
  CalendarCheck,
  Camera,
  Certificate,
  ChartLineUp,
  CheckCircle,
  ClipboardText,
  ClockCounterClockwise,
  EnvelopeSimple,
  ForkKnife,
  Gear,
  Image as ImageIcon,
  MapPin,
  MapTrifold,
  Medal,
  QrCode,
  ShieldCheck,
  Star,
  Storefront,
  UserCircle,
  UsersThree,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type {
  AdminModuleDirectoryItem,
  AdminOperationsViewModel,
  AdminQuickAction,
} from "@/types/admin-operations";

type IconComponent = typeof MapPin;

const moduleIcons: Record<string, IconComponent> = {
  analytics: ChartLineUp,
  tourists: UsersThree,
  visits: CalendarCheck,
  reviews: Star,
  surveys: ClipboardText,
  attractions: MapPin,
  routes: MapTrifold,
  stories: Article,
  restaurants: ForkKnife,
  accommodations: Storefront,
  media: ImageIcon,
  "photo-spots": Camera,
  checkin: QrCode,
  certificates: Certificate,
  badges: Medal,
  leaderboard: ChartLineUp,
  users: UserCircle,
  roles: ShieldCheck,
  audit: ClockCounterClockwise,
  messages: EnvelopeSimple,
  settings: Gear,
};

const quickActionIcons: Record<AdminQuickAction["icon"], IconComponent> = {
  attraction: MapPin,
  story: Article,
  checkin: QrCode,
  media: ImageIcon,
  route: MapTrifold,
};

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function metricValue(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("th-TH").format(value);
}

function severityStyle(severity: "critical" | "attention" | "info") {
  if (severity === "critical") {
    return "bg-rose-50/50";
  }
  if (severity === "attention") {
    return "bg-amber-50/45";
  }
  return "bg-[var(--admin-accent-soft)]/50";
}

function ModuleLink({ item }: { item: AdminModuleDirectoryItem }) {
  const Icon = moduleIcons[item.icon] ?? Gear;
  return (
    <Link
      href={item.href}
      className="group flex min-h-16 items-center gap-3 border-b border-[var(--admin-border)] px-1 py-3 last:border-b-0 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[var(--admin-surface-muted)] text-[var(--admin-ink)] transition-colors group-hover:bg-[var(--admin-accent-soft)] group-hover:text-[var(--admin-accent-strong)]">
        <Icon size={18} weight="bold" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[var(--admin-ink)]">{item.label}</span>
        <span className="mt-0.5 block truncate text-xs text-[var(--admin-muted)]">{item.description}</span>
      </span>
      <ArrowRight size={16} className="shrink-0 text-[var(--admin-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--admin-accent-strong)]" aria-hidden="true" />
    </Link>
  );
}

export function OperationsCommandCenter({
  adminName,
  data,
}: {
  adminName: string;
  data: AdminOperationsViewModel;
}) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b border-[var(--admin-border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--admin-accent-strong)]">ศูนย์ปฏิบัติการ</p>
          <h1 className="mt-2 text-2xl font-black text-[var(--admin-ink)] sm:text-3xl">
            สวัสดี {adminName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
            ภาพรวมงานที่ต้องติดตามวันนี้สำหรับระบบท่องเที่ยวยะลา เลือกรายการเพื่อไปจัดการต่อได้ทันที
          </p>
          <p className="mt-2 text-xs text-[var(--admin-muted)]">
            อัปเดตล่าสุด {formatUpdatedAt(data.generatedAt)} น.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/content-health"
            className="inline-flex min-h-11 items-center gap-2 rounded border border-[var(--admin-border)] bg-white px-4 text-sm font-bold text-[var(--admin-ink)] hover:border-[var(--admin-accent)]"
          >
            <CheckCircle size={18} aria-hidden="true" />
            คุณภาพเนื้อหา
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex min-h-11 items-center gap-2 rounded bg-[var(--admin-ink)] px-4 text-sm font-bold text-white hover:bg-black"
          >
            <ChartLineUp size={18} aria-hidden="true" />
            เปิดหน้าวิเคราะห์
          </Link>
        </div>
      </header>

      {data.unavailableCount > 0 && (
        <div role="status" className="flex items-start gap-3 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">ข้อมูลบางส่วนยังตรวจสอบไม่ได้</p>
            <p className="mt-0.5 leading-5">รายการอื่นยังใช้งานได้ตามปกติ ระบบจะลองอ่านข้อมูลใหม่เมื่อเปิดหน้านี้อีกครั้ง</p>
          </div>
        </div>
      )}

      <section aria-label="สรุปงานวันนี้" className="overflow-hidden rounded-md border border-[var(--admin-border)] bg-white">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {data.summaryMetrics.map((metric, index) => (
            <Link
              key={metric.id}
              href={metric.href}
              className={`group min-h-32 p-5 hover:bg-[var(--admin-surface-muted)] ${index > 0 ? "border-t border-[var(--admin-border)] sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-l-0 xl:border-l" : ""}`}
            >
              <p className="text-sm font-bold text-[var(--admin-muted)]">{metric.label}</p>
              <p className="mt-2 text-3xl font-black tabular-nums text-[var(--admin-ink)]">{metricValue(metric.value)}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--admin-muted)]">{metric.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <section id="priority-queue" aria-labelledby="priority-heading" className="rounded-md border border-[var(--admin-border)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
            <div>
              <h2 id="priority-heading" className="text-lg font-black text-[var(--admin-ink)]">งานที่ต้องจัดการ</h2>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">เรียงตามความเร่งด่วนและผลกระทบต่อผู้ใช้งาน</p>
            </div>
            <span className="rounded bg-[var(--admin-accent-soft)] px-2.5 py-1 text-sm font-black tabular-nums text-[var(--admin-accent-strong)]">
              {data.actionRequiredCount}
            </span>
          </div>

          {data.priorityQueue.length > 0 ? (
            <div className="divide-y divide-[var(--admin-border)]">
              {data.priorityQueue.map((item) => (
                <div key={item.id} className={`px-5 py-4 ${severityStyle(item.severity)}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black tabular-nums text-[var(--admin-ink)]">{item.count}</span>
                        <h3 className="text-sm font-black text-[var(--admin-ink)]">{item.label}</h3>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">{item.description}</p>
                    </div>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded border border-[var(--admin-border)] bg-white px-4 text-sm font-bold text-[var(--admin-ink)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent-strong)]"
                    >
                      {item.actionLabel}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <CheckCircle size={34} weight="duotone" className="mx-auto text-[var(--admin-success)]" aria-hidden="true" />
              <p className="mt-3 text-sm font-black text-[var(--admin-ink)]">ยังไม่มีงานค้างที่ต้องจัดการ</p>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">ตรวจคุณภาพเนื้อหาหรือเปิดหน้าวิเคราะห์เพื่อดูแนวโน้มเพิ่มเติมได้</p>
            </div>
          )}
        </section>

        <div className="space-y-6">
          {data.todayMetrics.length > 0 && (
            <section aria-labelledby="today-heading" className="rounded-md border border-[var(--admin-border)] bg-white">
              <div className="border-b border-[var(--admin-border)] px-5 py-4">
                <h2 id="today-heading" className="text-lg font-black text-[var(--admin-ink)]">การดำเนินงานวันนี้</h2>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">นับตามวันและเวลาในประเทศไทย</p>
              </div>
              <div className="divide-y divide-[var(--admin-border)]">
                {data.todayMetrics.map((metric) => (
                  <Link key={metric.id} href={metric.href} className="flex min-h-20 items-center justify-between gap-4 px-5 py-3 hover:bg-[var(--admin-surface-muted)]">
                    <div>
                      <p className="text-sm font-bold text-[var(--admin-ink)]">{metric.label}</p>
                      <p className="mt-1 text-xs text-[var(--admin-muted)]">{metric.description}</p>
                    </div>
                    <span className="text-2xl font-black tabular-nums text-[var(--admin-ink)]">{metricValue(metric.value)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {data.quickActions.length > 0 && (
            <section aria-labelledby="quick-heading" className="rounded-md border border-[var(--admin-border)] bg-white p-5">
              <h2 id="quick-heading" className="text-lg font-black text-[var(--admin-ink)]">ทางลัด</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {data.quickActions.map((action) => {
                  const Icon = quickActionIcons[action.icon];
                  return (
                    <Link key={action.id} href={action.href} className="group flex min-h-16 items-center gap-3 rounded border border-[var(--admin-border)] px-3 py-2 hover:border-[var(--admin-accent)]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[var(--admin-accent-soft)] text-[var(--admin-accent-strong)]">
                        <Icon size={18} weight="bold" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-[var(--admin-ink)]">{action.label}</span>
                        <span className="mt-0.5 block truncate text-xs text-[var(--admin-muted)]">{action.description}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {data.contentReadiness.length > 0 && (
          <section aria-labelledby="readiness-heading" className="rounded-md border border-[var(--admin-border)] bg-white">
            <div className="border-b border-[var(--admin-border)] px-5 py-4">
              <h2 id="readiness-heading" className="text-lg font-black text-[var(--admin-ink)]">ความพร้อมของเนื้อหา</h2>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">สถานะที่พร้อมแสดงบนหน้าบ้านหรือพร้อมใช้งาน</p>
            </div>
            <div className="divide-y divide-[var(--admin-border)]">
              {data.contentReadiness.map((item) => {
                const percentage = item.total && item.ready !== null
                  ? Math.round((item.ready / item.total) * 100)
                  : 0;
                return (
                  <Link key={item.id} href={item.href} className="block px-5 py-4 hover:bg-[var(--admin-surface-muted)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-[var(--admin-ink)]">{item.label}</h3>
                        <p className="mt-0.5 text-xs text-[var(--admin-muted)]">{item.description}</p>
                      </div>
                      <p className="text-sm font-black tabular-nums text-[var(--admin-ink)]">
                        {item.ready === null || item.total === null ? "—" : `${item.ready}/${item.total}`}
                      </p>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`ความพร้อม ${item.label}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percentage}
                      className="mt-3 h-2 overflow-hidden rounded-sm bg-[var(--admin-surface-muted)]"
                    >
                      <div className="h-full bg-[var(--admin-accent)]" style={{ width: `${percentage}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {data.recentActivity.length > 0 && (
          <section aria-labelledby="activity-heading" className="rounded-md border border-[var(--admin-border)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
              <div>
                <h2 id="activity-heading" className="text-lg font-black text-[var(--admin-ink)]">กิจกรรมล่าสุด</h2>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">เฉพาะผู้ที่มีสิทธิ์อ่านบันทึกระบบ</p>
              </div>
              <Link href="/admin/audit" className="text-sm font-bold text-[var(--admin-accent-strong)] hover:underline">ดูทั้งหมด</Link>
            </div>
            <div className="divide-y divide-[var(--admin-border)]">
              {data.recentActivity.map((activity) => (
                <Link key={activity.id} href={activity.href} className="flex min-h-20 items-start gap-3 px-5 py-4 hover:bg-[var(--admin-surface-muted)]">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[var(--admin-surface-muted)] text-[var(--admin-muted)]">
                    <ClockCounterClockwise size={16} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-[var(--admin-ink)]"><strong>{activity.actorName}</strong> {activity.actionLabel}</span>
                    <span className="mt-1 block text-xs text-[var(--admin-muted)]">{activity.entityLabel} · {formatUpdatedAt(activity.createdAt)} น.</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {data.modules.length > 0 && (
        <section aria-labelledby="modules-heading" className="border-t border-[var(--admin-border)] pt-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="modules-heading" className="text-lg font-black text-[var(--admin-ink)]">โมดูลทั้งหมด</h2>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">แสดงเฉพาะเมนูที่บัญชีของคุณมีสิทธิ์เข้าถึง</p>
            </div>
          </div>
          <div className="mt-4 grid gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
            {data.modules.map((group) => (
              <div key={group.id}>
                <h3 className="border-b-2 border-[var(--admin-ink)] pb-2 text-xs font-black uppercase text-[var(--admin-ink)]">{group.label}</h3>
                <div>
                  {group.items.map((item) => <ModuleLink key={item.id} item={item} />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
