"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle,
  WarningCircle,
  XCircle,
  Eye,
  MapPin,
  Article,
  MapPinLine,
  ForkKnife,
  ImageIcon,
} from "@phosphor-icons/react";
import type { ContentHealthReport, ContentType } from "@/lib/repositories/content-health.repository";

// ─── Props ────────────────────────────────────────────────────────────────

type Props = {
  report: ContentHealthReport;
};

// ─── Icons for content types ─────────────────────────────────────────────

const TYPE_ICONS: Record<ContentType, typeof MapPin> = {
  attraction: MapPin,
  story: Article,
  route: MapPinLine,
  restaurant: ForkKnife,
  accommodation: MapPin,
  photo_spot: ImageIcon,
};

const TYPE_LABELS: Record<ContentType, string> = {
  attraction: "สถานที่ท่องเที่ยว",
  story: "บทความ",
  route: "เส้นทาง",
  restaurant: "ร้านอาหาร",
  accommodation: "ที่พัก",
  photo_spot: "จุดถ่ายภาพ",
};

const TYPE_EDIT_HREFS: Record<ContentType, string> = {
  attraction: "/admin/attractions",
  story: "/admin/stories",
  route: "/admin/routes",
  restaurant: "/admin/restaurants",
  accommodation: "/admin/accommodations",
  photo_spot: "/admin/photo-spots",
};

// ─── Utility ──────────────────────────────────────────────────────────────

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Health Badge ─────────────────────────────────────────────────────────

function HealthBadge({ label, tone, href }: { label: string; tone: "green" | "amber" | "red" | "gray", href?: string }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300",
    amber: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300",
    red: "bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300",
    gray: "bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-300",
  };
  const baseClasses = `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold leading-5 transition ${styles[tone]}`;

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} hover:opacity-80`}>
        {label}
      </Link>
    );
  }
  return (
    <span className={baseClasses}>
      {label}
    </span>
  );
}

export function getIssueHash(issue: string): string {
  if (issue === "draft" || issue === "inactive") return "#settings";
  if (issue === "stock/demo media" || issue.includes("media") || issue.includes("cover")) return "#gallery";
  if (issue.includes("English") || issue.includes("summary")) return "#content";
  return "";
}

// ─── Summary Cards ────────────────────────────────────────────────────────

function SummaryCards({ report }: { report: ContentHealthReport }) {
  const { summary } = report;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
      <SummaryCard
        label="Total content"
        value={summary.totalItems}
        icon={CheckCircle}
        tone="slate"
      />
      <SummaryCard
        label="Published"
        value={summary.totalPublished}
        subtext={`${summary.publishedPercentage}%`}
        icon={CheckCircle}
        tone="green"
      />
      <SummaryCard
        label="Drafts"
        value={summary.totalDraft}
        icon={WarningCircle}
        tone={summary.totalDraft > 0 ? "amber" : "green"}
      />
      <SummaryCard
        label="Missing EN"
        value={summary.itemsMissingEnglish}
        icon={WarningCircle}
        tone={summary.itemsMissingEnglish > 0 ? "amber" : "green"}
      />
      <SummaryCard
        label="No cover image"
        value={summary.itemsMissingMedia}
        icon={summary.itemsMissingMedia > 0 ? XCircle : CheckCircle}
        tone={summary.itemsMissingMedia > 0 ? "red" : "green"}
      />
      <SummaryCard
        label="Missing Alt Text"
        value={summary.itemsMissingAltText}
        icon={summary.itemsMissingAltText > 0 ? WarningCircle : CheckCircle}
        tone={summary.itemsMissingAltText > 0 ? "amber" : "green"}
      />
      <SummaryCard
        label="Stock/demo media"
        value={summary.itemsWithPotentialStockMedia}
        icon={summary.itemsWithPotentialStockMedia > 0 ? WarningCircle : CheckCircle}
        tone={summary.itemsWithPotentialStockMedia > 0 ? "amber" : "green"}
      />
      <SummaryCard
        label="Items with issues"
        value={summary.itemsWithIssues}
        icon={summary.itemsWithIssues > 0 ? WarningCircle : CheckCircle}
        tone={summary.itemsWithIssues > 0 ? "amber" : "green"}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  subtext?: string;
  icon: typeof CheckCircle;
  tone: "green" | "amber" | "red" | "slate";
}) {
  const tones = {
    green: "bg-emerald-50 border-emerald-100 text-emerald-800",
    amber: "bg-amber-50 border-amber-100 text-amber-800",
    red: "bg-rose-50 border-rose-100 text-rose-800",
    slate: "bg-slate-50 border-slate-100 text-slate-800",
  };
  const iconTones = {
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-rose-600",
    slate: "text-slate-600",
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <Icon size={20} weight="fill" className={`mt-0.5 shrink-0 ${iconTones[tone]}`} />
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-bold leading-4">{label}</p>
      {subtext ? <p className="mt-0.5 text-xs font-bold opacity-70">{subtext}</p> : null}
    </div>
  );
}

// ─── Per-Type Breakdown ───────────────────────────────────────────────────

function TypeBreakdown({ report }: { report: ContentHealthReport }) {
  const { summary } = report;
  const types = Object.entries(summary.byType) as [ContentType, typeof summary.byType[ContentType]][];

  return (
    <section>
      <h2 className="mb-3 text-sm font-black text-slate-700">จำแนกตามประเภทเนื้อหา</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {types.map(([type, stats]) => {
          const Icon = TYPE_ICONS[type];
          const healthScore = stats.total > 0
            ? Math.round(((stats.total - stats.missingEnglish - stats.missingMedia) / stats.total) * 100)
            : 0;

          return (
            <Link
              key={type}
              href={`#type-${type}`}
              className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#0A6B62]/30 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <Icon size={18} weight="duotone" className="text-slate-500" />
                <span className="text-sm font-bold text-slate-800">{TYPE_LABELS[type]}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-slate-500">Total</span>
                <span className="text-right font-bold text-slate-800">{stats.total}</span>
                <span className="text-slate-500">Published</span>
                <span className="text-right font-bold text-emerald-700">{stats.published}</span>
                <span className="text-slate-500">Draft</span>
                <span className="text-right font-bold text-amber-700">{stats.draft}</span>
                <span className="text-slate-500">Health</span>
                <span className={`text-right font-bold ${
                  healthScore >= 80 ? "text-emerald-600" : healthScore >= 50 ? "text-amber-600" : "text-rose-600"
                }`}>{healthScore}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    healthScore >= 80 ? "bg-emerald-500" : healthScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─── Content Health Table ────────────────────────────────────────────────

type SortKey = "name" | "type" | "status" | "issues" | "updated";
type FilterValue = "all" | "published" | "draft" | "issues" | "missing-en" | "no-media" | "missing-alt" | "stock-media";

function ContentHealthTable({ report }: { report: ContentHealthReport }) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sortKey, setSortKey] = useState<SortKey>("type");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let items = [...report.items];

    // Filter
    switch (filter) {
      case "published":
        items = items.filter((i) => i.isPublished);
        break;
      case "draft":
        items = items.filter((i) => !i.isPublished);
        break;
      case "issues":
        items = items.filter((i) => i.issues.length > 0);
        break;
      case "missing-en":
        items = items.filter((i) => i.missingTranslations.length > 0);
        break;
      case "no-media":
        items = items.filter((i) => !i.hasCoverMedia);
        break;
      case "missing-alt":
        items = items.filter((i) => i.hasMissingAltMedia);
        break;
      case "stock-media":
        items = items.filter((i) => i.hasPotentialStockMedia);
        break;
    }

    // Sort
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.nameTh.localeCompare(b.nameTh, "th");
          break;
        case "type":
          cmp = a.contentType.localeCompare(b.contentType);
          break;
        case "status":
          cmp = Number(b.isPublished) - Number(a.isPublished);
          break;
        case "issues":
          cmp = b.issues.length - a.issues.length;
          break;
        case "updated":
          cmp = (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return items;
  }, [report.items, filter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filters: { value: FilterValue; label: string; count: number }[] = [
    { value: "all", label: "All", count: report.items.length },
    { value: "published", label: "Published", count: report.summary.totalPublished },
    { value: "draft", label: "Draft", count: report.summary.totalDraft },
    { value: "issues", label: "Has issues", count: report.summary.itemsWithIssues },
    { value: "missing-en", label: "Missing EN", count: report.summary.itemsMissingEnglish },
    { value: "no-media", label: "No cover", count: report.summary.itemsMissingMedia },
    { value: "missing-alt", label: "Missing Alt Text", count: report.summary.itemsMissingAltText },
    { value: "stock-media", label: "Stock/demo media", count: report.summary.itemsWithPotentialStockMedia },
  ];

  const SortIcon = () => (
    <span className="ml-1 text-xs opacity-50">{sortAsc ? "▲" : "▼"}</span>
  );

  return (
    <section>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-bold transition",
              filter === f.value
                ? "border-[#0A6B62] bg-[#0A6B62] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="cursor-pointer px-4 py-3 text-left" onClick={() => toggleSort("type")}>
                Type {sortKey === "type" && <SortIcon />}
              </th>
              <th className="cursor-pointer px-4 py-3 text-left" onClick={() => toggleSort("name")}>
                Name {sortKey === "name" && <SortIcon />}
              </th>
              <th className="cursor-pointer px-4 py-3 text-left" onClick={() => toggleSort("status")}>
                Status {sortKey === "status" && <SortIcon />}
              </th>
              <th className="px-4 py-3 text-left">Cover</th>
              <th className="px-4 py-3 text-left">EN</th>
              <th className="cursor-pointer px-4 py-3 text-left" onClick={() => toggleSort("issues")}>
                Issues {sortKey === "issues" && <SortIcon />}
              </th>
              <th className="cursor-pointer px-4 py-3 text-left" onClick={() => toggleSort("updated")}>
                Updated {sortKey === "updated" && <SortIcon />}
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                  No items match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const Icon = TYPE_ICONS[item.contentType];
                const editHref = item.slug
                  ? `${TYPE_EDIT_HREFS[item.contentType]}/${item.slug}/edit`
                  : item.contentType === "photo_spot"
                    ? `/admin/photo-spots/${item.id}/edit`
                    : `${TYPE_EDIT_HREFS[item.contentType]}/${item.id}/edit`;

                return (
                  <tr key={`${item.contentType}-${item.id}`} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon size={14} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-500">
                          {TYPE_LABELS[item.contentType]}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium text-slate-800">
                      {item.nameTh}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.isPublished ? (
                          <HealthBadge label="Published" tone="green" />
                        ) : (
                          <HealthBadge label="Draft" tone="amber" />
                        )}
                        {!item.isActive ? (
                          <HealthBadge label="Inactive" tone="red" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.hasCoverMedia ? (
                        <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} weight="fill" className="text-rose-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.missingTranslations.length === 0 ? (
                        <span className="text-xs font-bold text-emerald-600">Complete</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600">
                          {item.missingTranslations.length} missing
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.issues.length === 0 ? (
                          <span className="text-xs text-slate-400">None</span>
                        ) : (
                          item.issues.slice(0, 2).map((issue) => {
                            const hash = getIssueHash(issue);
                            return (
                              <HealthBadge 
                                key={issue} 
                                label={issue} 
                                href={editHref + hash}
                                tone={
                                  issue === "draft" ? "amber" :
                                  issue === "inactive" ? "red" :
                                  issue === "stock/demo media" ? "amber" :
                                  issue.startsWith("missing") ? "amber" :
                                  "gray"
                                } 
                              />
                            );
                          })
                        )}
                        {item.issues.length > 2 ? (
                          <span className="text-[11px] text-slate-400">+{item.issues.length - 2}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {formatDate(item.updatedAt ?? item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={editHref}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#0A6B62]"
                        title="Edit"
                      >
                        <Eye size={16} weight="bold" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        แสดง {filtered.length} จาก {report.items.length} รายการ{filter !== "all" ? " (กรองแล้ว)" : ""}
      </p>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export function ContentHealthDashboard({ report }: Props) {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <SummaryCards report={report} />

      {/* Per-Type Health */}
      <TypeBreakdown report={report} />

      {/* Content Health Table */}
      <ContentHealthTable report={report} />
    </div>
  );
}
